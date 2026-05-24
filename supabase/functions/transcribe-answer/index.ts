import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AUDIO_BUCKET = "answer-audio";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

type InterviewRow = {
  id: string;
  public_token: string;
  selected_theme_ids: string[];
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
  let model = Deno.env.get("OPENAI_TRANSCRIPTION_MODEL") || DEFAULT_TRANSCRIPTION_MODEL;

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const openAiKey = requiredEnv("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const formData = await req.formData();
    const publicToken = String(formData.get("public_token") || "").trim();
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

    const { data: interviewData, error: interviewError } = await supabase
      .from("interviews")
      .select("id, public_token, selected_theme_ids")
      .eq("public_token", publicToken)
      .maybeSingle();

    if (interviewError) {
      throw interviewError;
    }

    const interview = interviewData as InterviewRow | null;
    if (!interview) {
      return jsonResponse({ error: "invalid public token" }, 404);
    }

    if (!Array.isArray(interview.selected_theme_ids) || !interview.selected_theme_ids.includes(themeId)) {
      return jsonResponse({ error: "theme is not part of this interview" }, 400);
    }

    interviewId = interview.id;
    audioAssetId = crypto.randomUUID();
    const mimeType = normalizeMimeType(audioFile.type || "audio/webm");
    const extension = extensionForMimeType(mimeType);
    const storagePath = `${interview.id}/${themeId}/${audioAssetId}.${extension}`;

    const { error: insertAudioError } = await supabase
      .from("audio_assets")
      .insert({
        id: audioAssetId,
        interview_id: interview.id,
        theme_id: themeId,
        storage_path: storagePath,
        mime_type: mimeType,
        byte_size: audioFile.size,
        duration_ms: durationMs,
        status: "uploading",
      });

    if (insertAudioError) {
      throw insertAudioError;
    }

    const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(storagePath, audioBytes, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      await supabase.from("audio_assets").update({ status: "transcription_failed" }).eq("id", audioAssetId);
      throw uploadError;
    }

    audioSaved = true;
    await supabase.from("audio_assets").update({ status: "transcribing" }).eq("id", audioAssetId);

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

      await supabase.from("transcripts").insert({
        interview_id: interview.id,
        audio_asset_id: audioAssetId,
        theme_id: themeId,
        transcript_text: "",
        language: language || null,
        model,
        status: "failed",
        error_message: errorMessage,
      });
      await supabase.from("audio_assets").update({ status: "transcription_failed" }).eq("id", audioAssetId);

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
    const { data: transcript, error: transcriptError } = await supabase
      .from("transcripts")
      .insert({
        interview_id: interview.id,
        audio_asset_id: audioAssetId,
        theme_id: themeId,
        transcript_text: transcriptText,
        language: language || null,
        model,
        status: "completed",
        error_message: null,
      })
      .select("id")
      .single();

    if (transcriptError) {
      throw transcriptError;
    }

    await supabase.from("audio_assets").update({ status: "transcribed" }).eq("id", audioAssetId);

    return jsonResponse({
      transcript_text: transcriptText,
      transcript_id: transcript?.id,
      audio_asset_id: audioAssetId,
      audio_saved: true,
      model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed";

    if (audioSaved && audioAssetId && interviewId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            persistSession: false,
          },
        });
        await supabase.from("transcripts").insert({
          interview_id: interviewId,
          audio_asset_id: audioAssetId,
          theme_id: themeId,
          transcript_text: "",
          language: null,
          model,
          status: "failed",
          error_message: message,
        });
        await supabase.from("audio_assets").update({ status: "transcription_failed" }).eq("id", audioAssetId);
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
