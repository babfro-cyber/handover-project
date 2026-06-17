import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import hydraulicGlossary from "../_shared/hydraulicGlossary.json" with { type: "json" };
import interviewThemes from "../_shared/interviewThemes.json" with { type: "json" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AUDIO_BUCKET = "answer-audio";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";
const DEFAULT_CORRECTION_MODEL = "gpt-4o-mini";

type AudioAssetPayload = {
  audio_asset_id: string;
  interview_id: string;
  theme_id: string;
  storage_path: string;
};

type CorrectionResult = {
  corrected_transcript: string;
  applied_corrections: unknown[];
  uncertain_corrections: unknown[];
  detected_technical_terms: unknown[];
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
      const publishableKeys = JSON.parse(publishableKeysJson) as Record<
        string,
        unknown
      >;
      const defaultPublishableKey = findSupabasePublishableKey(
        publishableKeys.default,
      );
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
    return value.startsWith("sb_publishable_") || value.startsWith("eyJ")
      ? value
      : "";
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
    const message =
      payload?.message ||
      payload?.error ||
      `${functionName} failed with status ${response.status}`;
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
  return (
    (mimeType || "audio/webm").split(";")[0].trim().toLowerCase() ||
    "audio/webm"
  );
}

function normalizeLanguage(value: FormDataEntryValue | null) {
  const language = String(value || "")
    .trim()
    .toLowerCase();
  if (language === "fr" || language === "en") {
    return language;
  }
  return "";
}

function normalizeForSearch(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function glossaryEntries() {
  const sections = [
    "coreTerms",
    "standards",
    "sunCavities",
    "componentFamilies",
    "manufacturers",
    "productReferences",
    "materials",
    "surfaceTreatments",
  ];
  return sections.flatMap((section) =>
    Array.isArray((hydraulicGlossary as Record<string, unknown>)[section])
      ? (
          (hydraulicGlossary as Record<string, unknown>)[section] as Array<
            Record<string, unknown>
          >
        ).map((entry) => ({
          term: String(entry.term || ""),
          aliases: Array.isArray(entry.aliases) ? entry.aliases : [],
          category: String(entry.category || section),
          definition: String(entry.definition || ""),
          transcriptionHints: Array.isArray(entry.transcriptionHints)
            ? entry.transcriptionHints
            : [],
        }))
      : [],
  );
}

function themeKeywords(themeId: string) {
  const theme = (
    (interviewThemes as { themes?: Array<Record<string, unknown>> }).themes ||
    []
  ).find((item) => item.id === themeId);
  return normalizeForSearch(
    [
      theme?.title,
      theme?.objective,
      theme?.mainQuestion,
      ...(Array.isArray(theme?.followUps) ? theme.followUps : []),
    ].join(" "),
  );
}

function buildGlossarySubset(themeId: string, transcriptText: string) {
  const normalizedTranscript = normalizeForSearch(transcriptText);
  const normalizedTheme = themeKeywords(themeId);
  const scored = glossaryEntries().map((entry) => {
    const candidates = [
      entry.term,
      ...entry.aliases,
      ...entry.transcriptionHints,
    ].map((item) => normalizeForSearch(String(item)));
    const score = candidates.reduce((total, candidate) => {
      if (!candidate) return total;
      return (
        total +
        (normalizedTranscript.includes(candidate) ? 3 : 0) +
        (normalizedTheme.includes(candidate) ? 1 : 0)
      );
    }, 0);
    return { entry, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .filter((item, index) => item.score > 0 || index < 24)
    .slice(0, 42)
    .map((item) => item.entry);
}

function validateCorrection(
  candidate: Partial<CorrectionResult>,
  rawTranscript: string,
): CorrectionResult {
  const corrected =
    cleanCorrectionText(candidate.corrected_transcript) || rawTranscript;
  return {
    corrected_transcript: corrected,
    applied_corrections: Array.isArray(candidate.applied_corrections)
      ? candidate.applied_corrections.slice(0, 20)
      : [],
    uncertain_corrections: Array.isArray(candidate.uncertain_corrections)
      ? candidate.uncertain_corrections.slice(0, 20)
      : [],
    detected_technical_terms: Array.isArray(candidate.detected_technical_terms)
      ? candidate.detected_technical_terms.slice(0, 30)
      : [],
  };
}

function cleanCorrectionText(value: unknown) {
  return String(value || "")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, 8000);
}

async function correctTranscriptWithGlossary(
  openAiKey: string,
  model: string,
  themeId: string,
  rawTranscript: string,
) {
  if (!rawTranscript) {
    return validateCorrection({}, rawTranscript);
  }

  const theme = (
    (interviewThemes as { themes?: Array<Record<string, unknown>> }).themes ||
    []
  ).find((item) => item.id === themeId) || {
    id: themeId,
  };
  const glossarySubset = buildGlossarySubset(themeId, rawTranscript);
  const schema = {
    name: "numerhyd_transcript_correction",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        corrected_transcript: { type: "string" },
        applied_corrections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              reason: { type: "string" },
              confidence: {
                type: "string",
                enum: ["certain", "probable", "incertain"],
              },
            },
            required: ["from", "to", "reason", "confidence"],
          },
        },
        uncertain_corrections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              heard: { type: "string" },
              possible_term: { type: "string" },
              reason: { type: "string" },
            },
            required: ["heard", "possible_term", "reason"],
          },
        },
        detected_technical_terms: { type: "array", items: { type: "string" } },
      },
      required: [
        "corrected_transcript",
        "applied_corrections",
        "uncertain_corrections",
        "detected_technical_terms",
      ],
    },
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: schema,
      },
      messages: [
        {
          role: "system",
          content:
            "Vous corrigez une transcription orale NumerHyd avec un glossaire hydraulique. Ce n'est pas un entraînement de modèle. Corrigez seulement les erreurs probables de vocabulaire technique, références, matériaux, standards ou fabricants. Ne reformulez pas le fond, n'ajoutez aucune information, et signalez les corrections incertaines au lieu de les appliquer silencieusement.",
        },
        {
          role: "user",
          content: JSON.stringify({
            theme,
            raw_transcript: rawTranscript,
            glossary_subset: glossarySubset,
            policy: (hydraulicGlossary as Record<string, unknown>)
              .transcriptionCorrectionPolicy,
            output_rules: [
              "corrected_transcript doit rester très proche de raw_transcript.",
              "Ne corrigez pas une référence technique si elle n'est pas suffisamment certaine.",
              "applied_corrections liste les corrections appliquées avec from, to, reason et confidence quand possible.",
              "uncertain_corrections liste les hypothèses non appliquées ou à valider.",
              "detected_technical_terms liste les termes techniques reconnus dans le brut ou le corrigé.",
            ],
          }),
        },
      ],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body?.error?.message ||
        `OpenAI correction failed with status ${response.status}`,
    );
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty correction");
  }

  return validateCorrection(
    JSON.parse(content) as Partial<CorrectionResult>,
    rawTranscript,
  );
}

async function insertTranscript(
  supabaseUrl: string,
  supabaseKey: string,
  body: Record<string, unknown>,
  fallbackBody: Record<string, unknown>,
) {
  try {
    return await callRpc<{ transcript_id: string }>(
      supabaseUrl,
      supabaseKey,
      "insert_transcript_for_public_interview",
      body,
    );
  } catch (error) {
    if (
      !/p_raw_transcript|p_corrected_transcript|corrections|function/i.test(
        errorMessage(error),
      )
    ) {
      throw error;
    }
    return await callRpc<{ transcript_id: string }>(
      supabaseUrl,
      supabaseKey,
      "insert_transcript_for_public_interview",
      fallbackBody,
    );
  }
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
  let model =
    Deno.env.get("OPENAI_TRANSCRIPTION_MODEL") || DEFAULT_TRANSCRIPTION_MODEL;
  const correctionModel =
    Deno.env.get("OPENAI_CORRECTION_MODEL") || DEFAULT_CORRECTION_MODEL;

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
    const durationMs =
      Number.parseInt(String(formData.get("duration_ms") || "0"), 10) || null;
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
      await callRpc(
        supabaseUrl,
        supabaseKey,
        "update_audio_asset_status_for_public_interview",
        {
          p_public_token: publicToken,
          p_audio_asset_id: audioAssetId,
          p_status: "transcription_failed",
        },
      );
      throw uploadError;
    }

    audioSaved = true;
    await callRpc(
      supabaseUrl,
      supabaseKey,
      "update_audio_asset_status_for_public_interview",
      {
        p_public_token: publicToken,
        p_audio_asset_id: audioAssetId,
        p_status: "transcribing",
      },
    );

    const openAiForm = new FormData();
    openAiForm.append("model", model);
    openAiForm.append("response_format", "json");
    if (language) {
      openAiForm.append("language", language);
    }
    openAiForm.append(
      "file",
      new File([audioBytes], `answer.${extension}`, { type: mimeType }),
    );

    const transcriptionResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
        },
        body: openAiForm,
      },
    );

    const transcriptionBody = await transcriptionResponse
      .json()
      .catch(() => ({}));
    if (!transcriptionResponse.ok) {
      const errorMessage =
        transcriptionBody?.error?.message ||
        `OpenAI transcription failed with status ${transcriptionResponse.status}`;

      await callRpc(
        supabaseUrl,
        supabaseKey,
        "insert_transcript_for_public_interview",
        {
          p_public_token: publicToken,
          p_audio_asset_id: audioAssetId,
          p_transcript_text: "",
          p_language: language || null,
          p_model: model,
          p_status: "failed",
          p_error_message: errorMessage,
        },
      );
      await callRpc(
        supabaseUrl,
        supabaseKey,
        "update_audio_asset_status_for_public_interview",
        {
          p_public_token: publicToken,
          p_audio_asset_id: audioAssetId,
          p_status: "transcription_failed",
        },
      );

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
    let correction = validateCorrection({}, transcriptText);
    try {
      correction = await correctTranscriptWithGlossary(
        openAiKey,
        correctionModel,
        themeId,
        transcriptText,
      );
    } catch (correctionError) {
      correction = {
        ...correction,
        uncertain_corrections: [
          {
            heard: "",
            possible_term: "",
            reason: `Correction glossaire indisponible: ${errorMessage(correctionError)}`,
          },
        ],
      };
    }

    const insertBody = {
      p_public_token: publicToken,
      p_audio_asset_id: audioAssetId,
      p_transcript_text: correction.corrected_transcript,
      p_language: language || null,
      p_model: `${model}+${correctionModel}`,
      p_status: "completed",
      p_error_message: null,
      p_raw_transcript_text: transcriptText,
      p_corrected_transcript_text: correction.corrected_transcript,
      p_corrections_applied: correction.applied_corrections,
      p_uncertain_corrections: correction.uncertain_corrections,
      p_detected_technical_terms: correction.detected_technical_terms,
    };
    const fallbackInsertBody = {
      p_public_token: publicToken,
      p_audio_asset_id: audioAssetId,
      p_transcript_text: correction.corrected_transcript,
      p_language: language || null,
      p_model: `${model}+${correctionModel}`,
      p_status: "completed",
      p_error_message: null,
    };
    const transcript = await insertTranscript(
      supabaseUrl,
      supabaseKey,
      insertBody,
      fallbackInsertBody,
    );

    await callRpc(
      supabaseUrl,
      supabaseKey,
      "update_audio_asset_status_for_public_interview",
      {
        p_public_token: publicToken,
        p_audio_asset_id: audioAssetId,
        p_status: "transcribed",
      },
    );

    return jsonResponse({
      transcript_text: correction.corrected_transcript,
      raw_transcript_text: transcriptText,
      corrected_transcript_text: correction.corrected_transcript,
      corrections_applied: correction.applied_corrections,
      uncertain_corrections: correction.uncertain_corrections,
      detected_technical_terms: correction.detected_technical_terms,
      transcript_id: transcript?.transcript_id,
      audio_asset_id: audioAssetId,
      audio_saved: true,
      model,
      correction_model: correctionModel,
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
        await callRpc(
          supabaseUrl,
          supabaseKey,
          "insert_transcript_for_public_interview",
          {
            p_public_token: publicToken,
            p_audio_asset_id: audioAssetId,
            p_transcript_text: "",
            p_language: null,
            p_model: model,
            p_status: "failed",
            p_error_message: message,
          },
        );
        await callRpc(
          supabaseUrl,
          supabaseKey,
          "update_audio_asset_status_for_public_interview",
          {
            p_public_token: publicToken,
            p_audio_asset_id: audioAssetId,
            p_status: "transcription_failed",
          },
        );
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
