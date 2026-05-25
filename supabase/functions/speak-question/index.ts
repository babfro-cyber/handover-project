const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_TTS_MODEL = "gpt-4o-mini-tts";
const DEFAULT_TTS_VOICE = "coral";
const MAX_QUESTION_CHARS = 900;

type PlanTheme = {
  id: string;
  question?: string;
};

type PublicInterviewPayload = {
  interview?: {
    selected_theme_ids?: string[];
  };
  plan?: {
    themes?: PlanTheme[];
  };
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
  if (!value) throw new Error(`${name} is not configured`);
  return value;
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

function getSupabasePublishableKey() {
  const legacyAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyAnonKey) return legacyAnonKey;

  const publishableKeysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (publishableKeysJson) {
    try {
      const publishableKeys = JSON.parse(publishableKeysJson) as Record<string, unknown>;
      const defaultPublishableKey = findSupabasePublishableKey(publishableKeys.default);
      if (defaultPublishableKey) return defaultPublishableKey;

      const anyPublishableKey = findSupabasePublishableKey(publishableKeys);
      if (anyPublishableKey) return anyPublishableKey;
    } catch {
      throw new Error("SUPABASE_PUBLISHABLE_KEYS is not valid JSON");
    }
  }

  throw new Error("Supabase publishable key is not configured");
}

function cleanText(value: unknown, maxLength = MAX_QUESTION_CHARS) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const supabaseKey = getSupabasePublishableKey();
    const openAiKey = requiredEnv("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_TTS_MODEL") || DEFAULT_TTS_MODEL;
    const voice = Deno.env.get("OPENAI_TTS_VOICE") || DEFAULT_TTS_VOICE;
    const body = await req.json().catch(() => ({}));
    const publicToken = cleanText(body.public_token, 200);
    const themeId = cleanText(body.theme_id, 120);
    const questionText = cleanText(body.question_text);

    if (!publicToken || !themeId || !questionText) {
      return jsonResponse({ error: "public_token, theme_id and question_text are required" }, 400);
    }

    const payload = await callRpc<PublicInterviewPayload>(supabaseUrl, supabaseKey, "get_public_interview", {
      p_public_token: publicToken,
    });
    const selectedThemes = Array.isArray(payload?.interview?.selected_theme_ids)
      ? payload.interview.selected_theme_ids
      : [];
    if (!selectedThemes.includes(themeId)) {
      return jsonResponse({ error: "invalid public token or theme" }, 404);
    }

    const plannedQuestion = payload.plan?.themes?.find((theme) => theme.id === themeId)?.question || "";
    const safeQuestionText = questionText || plannedQuestion;
    const speechResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        input: safeQuestionText,
        instructions:
          "Speak in calm, natural French, like a thoughtful technical interviewer. Keep the pacing clear and professional.",
        response_format: "mp3",
      }),
    });

    if (!speechResponse.ok) {
      const errorPayload = await speechResponse.json().catch(() => ({}));
      throw new Error(errorPayload?.error?.message || `OpenAI speech failed with status ${speechResponse.status}`);
    }

    return new Response(await speechResponse.arrayBuffer(), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Question audio failed";
    return jsonResponse({ error: message }, 500);
  }
});
