const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_ACTIONS = ["ask_followup", "next_question", "next_theme", "finish_interview"] as const;
const DEFAULT_DECISION_MODEL = "gpt-4o-mini";
const DEFAULT_MAX_FOLLOWUPS = 1;

type AllowedAction = (typeof ALLOWED_ACTIONS)[number];

type PlanTheme = {
  id: string;
  title?: string;
  question?: string;
};

type DecisionRequest = {
  public_token?: string;
  interview_id?: string;
  theme_id?: string;
  current_question_text?: string;
  latest_answer_text?: string;
  selected_themes?: string[];
  plan?: PlanTheme[];
  previous_followup_count?: number;
  max_followups?: number;
};

type AiDecision = {
  action: AllowedAction;
  theme_id: string;
  question_id: string;
  followup_text: string;
  off_topic: boolean;
  confidence: number;
  rationale: string;
};

type PublicInterviewPayload = {
  interview?: {
    id: string;
    public_token: string;
    selected_theme_ids: string[];
    current_theme_id?: string;
    status?: string;
  };
  plan?: {
    themes?: PlanTheme[];
  };
  ai_decisions?: Array<{
    theme_id: string;
    action: AllowedAction;
    status: string;
  }>;
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

function clamp(value: unknown) {
  const numberValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(1, numberValue));
}

function cleanText(value: unknown, maxLength = 2000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isUnknownAnswer(answer: string) {
  const normalized = answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return /^(je ne sais pas|j'?en sais rien|aucune idee|pas d'?idee|je sais pas|no idea|i don'?t know)\b/.test(normalized);
}

function deterministicAction(selectedThemes: string[], themeId: string): AllowedAction {
  const currentIndex = selectedThemes.indexOf(themeId);
  if (currentIndex < 0 || currentIndex >= selectedThemes.length - 1) {
    return "finish_interview";
  }
  return "next_theme";
}

function deterministicDecision(
  selectedThemes: string[],
  themeId: string,
  questionId: string,
  rationale: string,
): AiDecision {
  return {
    action: deterministicAction(selectedThemes, themeId),
    theme_id: themeId,
    question_id: questionId,
    followup_text: "",
    off_topic: false,
    confidence: 1,
    rationale,
  };
}

function validateDecision(
  candidate: Partial<AiDecision>,
  selectedThemes: string[],
  themeId: string,
  questionId: string,
  previousFollowupCount: number,
  maxFollowups: number,
) {
  const action = ALLOWED_ACTIONS.includes(candidate.action as AllowedAction)
    ? (candidate.action as AllowedAction)
    : deterministicAction(selectedThemes, themeId);

  const base: AiDecision = {
    action,
    theme_id: cleanText(candidate.theme_id, 120) || themeId,
    question_id: cleanText(candidate.question_id, 160) || questionId,
    followup_text: cleanText(candidate.followup_text, 260),
    off_topic: Boolean(candidate.off_topic),
    confidence: clamp(candidate.confidence),
    rationale: cleanText(candidate.rationale, 500),
  };

  if (base.theme_id !== themeId || !selectedThemes.includes(base.theme_id)) {
    return {
      decision: deterministicDecision(selectedThemes, themeId, questionId, "AI returned an invalid theme."),
      status: "fallback",
      error: "invalid theme",
    };
  }

  if (base.action === "ask_followup") {
    if (previousFollowupCount >= maxFollowups) {
      return {
        decision: deterministicDecision(selectedThemes, themeId, questionId, "Follow-up limit reached."),
        status: "fallback",
        error: "follow-up limit reached",
      };
    }

    if (base.off_topic || !base.followup_text || base.followup_text.length < 12) {
      return {
        decision: deterministicDecision(selectedThemes, themeId, questionId, "Follow-up was off-topic or empty."),
        status: "fallback",
        error: "invalid follow-up",
      };
    }
  } else {
    base.followup_text = "";
  }

  return {
    decision: base,
    status: "accepted",
    error: "",
  };
}

async function saveDecision(
  supabaseUrl: string,
  supabaseKey: string,
  publicToken: string,
  questionText: string,
  answerText: string,
  decision: AiDecision,
  status: string,
  errorMessage: string,
  rawResponse: unknown,
) {
  await callRpc(supabaseUrl, supabaseKey, "insert_ai_decision_for_public_interview", {
    p_public_token: publicToken,
    p_theme_id: decision.theme_id,
    p_question_id: decision.question_id,
    p_question_text: questionText,
    p_answer_text: answerText,
    p_action: decision.action,
    p_followup_text: decision.followup_text,
    p_off_topic: decision.off_topic,
    p_confidence: decision.confidence,
    p_rationale: decision.rationale,
    p_status: status,
    p_error_message: errorMessage || null,
    p_raw_response: rawResponse || null,
    p_validated_response: decision,
  });
}

async function askOpenAi(
  openAiKey: string,
  model: string,
  plan: PlanTheme[],
  theme: PlanTheme,
  selectedThemes: string[],
  questionText: string,
  answerText: string,
  previousFollowupCount: number,
  maxFollowups: number,
) {
  const schema = {
    name: "numerhyd_next_step",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        action: { type: "string", enum: ALLOWED_ACTIONS },
        theme_id: { type: "string" },
        question_id: { type: "string" },
        followup_text: { type: "string" },
        off_topic: { type: "boolean" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        rationale: { type: "string" },
      },
      required: ["action", "theme_id", "question_id", "followup_text", "off_topic", "confidence", "rationale"],
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
            "You are a controlled NumerHyd interview decision engine. The fixed plan is the source of truth. You do not conduct an open-ended interview. You may suggest at most one useful follow-up within the current theme, or move on. Never introduce new themes, never reorder themes, never ask broad chatbot questions, and never ask about anything outside the current theme.",
        },
        {
          role: "user",
          content: JSON.stringify({
            current_theme: theme,
            selected_theme_order: selectedThemes,
            fixed_plan: plan,
            current_question_text: questionText,
            latest_answer_text: answerText,
            previous_followup_count: previousFollowupCount,
            max_followups: maxFollowups,
            rules: [
              "If the answer is vague but relevant, action should be ask_followup.",
              "For answers like 'ca depend du cas', ask one concrete follow-up within the same theme.",
              "If the answer is rich and specific, move to next_theme or finish_interview.",
              "If the answer is off-topic, do not follow the tangent; move to next_theme or finish_interview.",
              "If the expert says they do not know, move on.",
              "followup_text must be French, concise, and specific to the current NumerHyd theme.",
            ],
          }),
        },
      ],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || `OpenAI decision failed with status ${response.status}`);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty decision");
  }

  return {
    raw: body,
    parsed: JSON.parse(content) as Partial<AiDecision>,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const supabaseKey = getSupabasePublishableKey();
  const openAiKey = requiredEnv("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_DECISION_MODEL") || DEFAULT_DECISION_MODEL;

  let requestBody: DecisionRequest = {};
  let publicToken = "";
  let themeId = "";
  let questionText = "";
  let answerText = "";
  let questionId = "";
  let selectedThemes: string[] = [];

  try {
    requestBody = await req.json();
    publicToken = cleanText(requestBody.public_token, 200);
    themeId = cleanText(requestBody.theme_id, 120);
    questionText = cleanText(requestBody.current_question_text, 1200);
    answerText = cleanText(requestBody.latest_answer_text, 6000);

    if (!publicToken || !themeId || !questionText || !answerText) {
      return jsonResponse({ error: "public_token, theme_id, current_question_text and latest_answer_text are required" }, 400);
    }

    const payload = await callRpc<PublicInterviewPayload>(supabaseUrl, supabaseKey, "get_public_interview", {
      p_public_token: publicToken,
    });

    const interview = payload?.interview;
    if (!interview) {
      return jsonResponse({ error: "invalid public token" }, 404);
    }

    selectedThemes = Array.isArray(interview.selected_theme_ids) ? interview.selected_theme_ids : [];
    if (!selectedThemes.includes(themeId)) {
      return jsonResponse({ error: "theme is not part of this interview" }, 400);
    }

    const plan = Array.isArray(payload.plan?.themes) ? payload.plan.themes : [];
    const theme = plan.find((item) => item.id === themeId) || { id: themeId, question: questionText };
    questionId = `${themeId}:followup:${Date.now()}`;
    const storedFollowupCount = (payload.ai_decisions || []).filter(
      (decision) => decision.theme_id === themeId && decision.action === "ask_followup" && decision.status === "accepted",
    ).length;
    const previousFollowupCount = Math.max(
      storedFollowupCount,
      Number.isFinite(requestBody.previous_followup_count) ? Number(requestBody.previous_followup_count) : 0,
    );
    const maxFollowups = Math.max(0, Math.min(2, Number(requestBody.max_followups || DEFAULT_MAX_FOLLOWUPS)));

    if (isUnknownAnswer(answerText)) {
      const decision = deterministicDecision(selectedThemes, themeId, questionId, "Expert does not know; moving on.");
      await saveDecision(supabaseUrl, supabaseKey, publicToken, questionText, answerText, decision, "fallback", "", null);
      return jsonResponse(decision);
    }

    if (previousFollowupCount >= maxFollowups) {
      const decision = deterministicDecision(selectedThemes, themeId, questionId, "Follow-up limit reached; moving on.");
      await saveDecision(supabaseUrl, supabaseKey, publicToken, questionText, answerText, decision, "fallback", "", null);
      return jsonResponse(decision);
    }

    const aiResult = await askOpenAi(
      openAiKey,
      model,
      plan,
      theme,
      selectedThemes,
      questionText,
      answerText,
      previousFollowupCount,
      maxFollowups,
    );
    const validated = validateDecision(
      aiResult.parsed,
      selectedThemes,
      themeId,
      questionId,
      previousFollowupCount,
      maxFollowups,
    );

    await saveDecision(
      supabaseUrl,
      supabaseKey,
      publicToken,
      questionText,
      answerText,
      validated.decision,
      validated.status,
      validated.error,
      aiResult.raw,
    );

    return jsonResponse(validated.decision);
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "AI decision failed";
    const fallbackTheme = themeId || "unknown";
    const decision = deterministicDecision(selectedThemes.length ? selectedThemes : [fallbackTheme], fallbackTheme, questionId || `${fallbackTheme}:fallback`, message);

    if (publicToken && themeId && questionText && answerText && selectedThemes.includes(themeId)) {
      try {
        await saveDecision(supabaseUrl, supabaseKey, publicToken, questionText, answerText, decision, "error", message, null);
      } catch {
        // The answer is already saved; never block the interview because fallback logging failed.
      }
    }

    return jsonResponse(decision);
  }
});
