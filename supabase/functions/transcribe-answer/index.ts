import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AUDIO_BUCKET = "answer-audio";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

type AudioAssetPayload = {
  audio_asset_id: string;
  interview_id: string;
  theme_id: string;
  storage_path: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function getSupabasePublishableKey() {
  const legacyAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyAnonKey) {
    return legacyAnonKey;
  }

  const publishableKeysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (publishableKeysJson) {
    try {
      const publishableKeys = JSON.parse(publishableKeysJson) as Record<string, unknown>;
      const defaultPublishableKey = findSupabasePublishableKey(publishableKeys.default);
      if (defaultPublishableKey) {
        return defaultPublishableKey;
      }

      const anyPublishableKey = findSupabasePublishableKey(publishableKeys);
      if (anyPublishableKey) {
        return anyPublishableKey;
      }
    } catch {
      throw new Error("SUPABASE_PUBLISHABLE_KEYS is not valid JSON");
    }
  }

  throw new Error("Supabase publishable key is not configured");
}

function findSupabasePublishableKey(value: unknown): string {
  if (typeof value === "string") {
    return value.startsWith("sb_publishable_") || value.startsWith("eyJ") ? value : "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSupabasePublishableKey(item);
      if (found) return found;
    }
  }

  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      const found = findSupabasePublishableKey(item);
      if (found) return found;
    }
  }

  return "";
}

async function callRpc<T>(
  supabaseUrl: string,
  supabaseKey: string,
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || `${functionName} failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function errorMessage(error: unknown, fallback = "Transcription failed") {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? String(error.message || "") : "";
    if (maybeMessage) {
      return maybeMessage;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return fallback;
    }
  }

  return typeof error === "string" && error ? error : fallback;
}

function extensionForMimeType(mimeType: string) {
  const clean = normalizeMimeType(mimeType);
  switch (clean) {
    case "audio/mp4":
      return "mp4";
    case "audio/mpeg":
    case "audio/mp3":
      return "mp3";
    case "audio/wav":
    case "audio/x-wav":
      return "wav";
    case "audio/ogg":
      return "ogg";
    case "audio/m4a":
      return "m4a";
    case "audio/webm":
    default:
      return "webm";
  }
}

function normalizeMimeType(mimeType: string) {
  return (mimeType || "audio/webm").split(";")[0].trim().toLowerCase() || "audio/webm";
}

function normalizeLanguage(value: FormDataEntryValue | null) {
  const language = String(value || "").trim().toLowerCase();
  if (language === "fr" || language === "en") {
    return language;
  }
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let audioAssetId = "";
  let interviewId = "";
  let audioSaved = false;
  let themeId = "";
  let publicToken = "";
  let model = Deno.env.get("OPENAI_TRANSCRIPTION_MODEL") || DEFAULT_TRANSCRIPTION_MODEL;

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const supabaseKey = getSupabasePublishableKey();
    const openAiKey = requiredEnv("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    const formData = await req.formData();
    publicToken = String(formData.get("public_token") || "").trim();
    themeId = String(formData.get("theme_id") || "").trim();
    const language = normalizeLanguage(formData.get("language"));
    const durationMs = Number.parseInt(String(formData.get("duration_ms") || "0"), 10) || null;
    const audioFile = formData.get("audio");

    if (!publicToken) {
      return jsonResponse({ error: "public_token is required" }, 400);
    }

    if (!themeId) {
      return jsonResponse({ error: "theme_id is required" }, 400);
    }

    if (!(audioFile instanceof File)) {
      return jsonResponse({ error: "audio file is required" }, 400);
    }

    if (audioFile.size <= 0) {
      return jsonResponse({ error: "audio file is empty" }, 400);
    }

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return jsonResponse({ error: "audio file exceeds 25 MB limit" }, 413);
    }

    audioAssetId = crypto.randomUUID();
    const mimeType = normalizeMimeType(audioFile.type || "audio/webm");
    const extension = extensionForMimeType(mimeType);
    const storagePath = `${publicToken}/${themeId}/${audioAssetId}.${extension}`;

    const audioAsset = await callRpc<AudioAssetPayload | null>(
      supabaseUrl,
      supabaseKey,
      "create_audio_asset_for_public_interview",
      {
        p_public_token: publicToken,
        p_audio_asset_id: audioAssetId,
        p_theme_id: themeId,
        p_storage_path: storagePath,
        p_mime_type: mimeType,
        p_byte_size: audioFile.size,
        p_duration_ms: durationMs,
      },
    );

    if (!audioAsset) {
      return jsonResponse({ error: "invalid public token" }, 404);
    }
    interviewId = audioAsset.interview_id;

    const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(storagePath, audioBytes, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      await callRpc(supabaseUrl, supabaseKey, "update_audio_asset_status_for_public_interview", {
        p_public_token: publicToken,
        p_audio_asset_id: audioAssetId,
        p_status: "transcription_failed",
      });
      throw uploadError;
    }

    audioSaved = true;
    await callRpc(supabaseUrl, supabaseKey, "update_audio_asset_status_for_public_interview", {
      p_public_token: publicToken,
      p_audio_asset_id: audioAssetId,
      p_status: "transcribing",
    });

    const openAiForm = new FormData();
    openAiForm.append("model", model);
    openAiForm.append("response_format", "json");
    if (language) {
      openAiForm.append("language", language);
    }
    openAiForm.append("file", new File([audioBytes], `answer.${extension}`, { type: mimeType }));

    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
      },
      body: openAiForm,
    });

    const transcriptionBody = await transcriptionResponse.json().catch(() => ({}));
    if (!transcriptionResponse.ok) {
      const errorMessage =
        transcriptionBody?.error?.message ||
        `OpenAI transcription failed with status ${transcriptionResponse.status}`;

      await callRpc(supabaseUrl, supabaseKey, "insert_transcript_for_public_interview", {
        p_public_token: publicToken,
        p_audio_asset_id: audioAssetId,
        p_transcript_text: "",
        p_language: language || null,
        p_model: model,
        p_status: "failed",
        p_error_message: errorMessage,
      });
      await callRpc(supabaseUrl, supabaseKey, "update_audio_asset_status_for_public_interview", {
        p_public_token: publicToken,
        p_audio_asset_id: audioAssetId,
        p_status: "transcription_failed",
      });

      return jsonResponse(
        {
          error: errorMessage,
          audio_saved: true,
          audio_asset_id: audioAssetId,
        },
        502,
      );
    }

    const transcriptText = String(transcriptionBody?.text || "").trim();
    const transcript = await callRpc<{ transcript_id: string }>(
      supabaseUrl,
      supabaseKey,
      "insert_transcript_for_public_interview",
      {
        p_public_token: publicToken,
        p_audio_asset_id: audioAssetId,
        p_transcript_text: transcriptText,
        p_language: language || null,
        p_model: model,
        p_status: "completed",
        p_error_message: null,
      },
    );

    await callRpc(supabaseUrl, supabaseKey, "update_audio_asset_status_for_public_interview", {
      p_public_token: publicToken,
      p_audio_asset_id: audioAssetId,
      p_status: "transcribed",
    });

    return jsonResponse({
      transcript_text: transcriptText,
      transcript_id: transcript?.transcript_id,
      audio_asset_id: audioAssetId,
      audio_saved: true,
      model,
    });
  } catch (error) {
    const message = errorMessage(error);
    console.error("transcribe-answer failed", message);

    if (audioSaved && audioAssetId && interviewId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      let supabaseKey = "";
      try {
        supabaseKey = getSupabasePublishableKey();
      } catch {
        supabaseKey = "";
      }
      if (supabaseUrl && supabaseKey && publicToken) {
        await callRpc(supabaseUrl, supabaseKey, "insert_transcript_for_public_interview", {
          p_public_token: publicToken,
          p_audio_asset_id: audioAssetId,
          p_transcript_text: "",
          p_language: null,
          p_model: model,
          p_status: "failed",
          p_error_message: message,
        });
        await callRpc(supabaseUrl, supabaseKey, "update_audio_asset_status_for_public_interview", {
          p_public_token: publicToken,
          p_audio_asset_id: audioAssetId,
          p_status: "transcription_failed",
        });
      }
    }

    return jsonResponse(
      {
        error: message,
        audio_saved: audioSaved,
        audio_asset_id: audioAssetId || null,
      },
      audioSaved ? 502 : 500,
    );
  }
});
