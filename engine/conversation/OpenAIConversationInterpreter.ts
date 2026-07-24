import type { OrganizationRuntime } from "../v3/runtime";
import type {
  ExecutiveConversationInterpretation,
  ExecutiveConversationInterpreter,
  ExecutiveConversationRequest,
  ExecutiveConversationTurn,
} from "./executiveConversationTypes";

export const CONVERSATION_PROMPT_VERSION_V1 = "executive-conversation-interpretation-v1";
export const CONVERSATION_PROMPT_VERSION_V2 = "executive-conversation-reasoning-v2";
export const CONVERSATION_PROMPT_VERSION = CONVERSATION_PROMPT_VERSION_V1;
export type ConversationPromptVersion = typeof CONVERSATION_PROMPT_VERSION_V1 | typeof CONVERSATION_PROMPT_VERSION_V2;
export const CONVERSATION_CONTEXT_LIMITS = {
  recentTurns: 6,
  currentMessageCharacters: 2_000,
  turnCharacters: 1_000,
  totalCharacters: 8_000,
  hypotheses: 4,
  unresolvedQuestions: 5,
  assumptions: 5,
  ambiguity: 5,
} as const;

export type ProviderConversationObservation = {
  provider: "openai";
  model: string;
  promptVersion: string;
  status: "success" | "fallback";
  fallbackReason: string | null;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  schemaRepairCount: number;
  invalidOutputCount: number;
  requestMetadata: {
    recentTurnCount: number;
    inputCharacters: number;
    organizationContextFields: string[];
  };
};

export class ConversationProviderError extends Error {
  constructor(readonly reason: string, readonly observation: ProviderConversationObservation) {
    super(`Conversation provider unavailable: ${reason}`);
  }
}

type OpenAIConversationInterpreterOptions = {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  fetchImplementation?: typeof fetch;
  promptVersion?: ConversationPromptVersion;
};

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
const clean = (value: string, maximum: number) => value.replace(/\s+/g, " ").trim().slice(0, maximum);

function conversationContext(runtime: OrganizationRuntime) {
  const memory = runtime.memory as unknown as UnknownRecord;
  const conditions = Array.isArray(memory.organizationalConditions) ? memory.organizationalConditions.map(record) : [];
  const understandingState = record(memory.organizationalUnderstandingState);
  const understandings = Array.isArray(understandingState.currentUnderstandings) ? understandingState.currentUnderstandings.map(record) : [];
  return {
    organizationName: clean(runtime.metadata.name || "Organization", 120),
    currentPriorityLabels: conditions.slice(0, 3).map((item) => clean(String(item.name ?? item.label ?? ""), 120)).filter(Boolean),
    selectedInsight: clean(String(understandings[0]?.statement ?? understandings[0]?.summary ?? ""), 400) || null,
  };
}

function boundedTurns(turns: readonly ExecutiveConversationTurn[]): ExecutiveConversationTurn[] {
  return turns.slice(-CONVERSATION_CONTEXT_LIMITS.recentTurns).map((turn) => ({
    speaker: turn.speaker,
    message: clean(turn.message, CONVERSATION_CONTEXT_LIMITS.turnCharacters),
  }));
}

const interpretationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["executiveObjective", "executiveIntent", "activeHypothesis", "discardedHypotheses", "unresolvedQuestions", "assumptions", "ambiguity", "confidence", "recommendedConversationalAction"],
  properties: {
    executiveObjective: { type: "string", maxLength: 500 },
    executiveIntent: { type: "string", enum: ["explore", "explain", "evaluate", "decide", "inform", "reflect"] },
    activeHypothesis: { anyOf: [{ type: "string", maxLength: 500 }, { type: "null" }] },
    discardedHypotheses: { type: "array", maxItems: CONVERSATION_CONTEXT_LIMITS.hypotheses, items: { type: "string", maxLength: 500 } },
    unresolvedQuestions: { type: "array", maxItems: CONVERSATION_CONTEXT_LIMITS.unresolvedQuestions, items: { type: "string", maxLength: 500 } },
    assumptions: { type: "array", maxItems: CONVERSATION_CONTEXT_LIMITS.assumptions, items: { type: "string", maxLength: 500 } },
    ambiguity: { type: "array", maxItems: CONVERSATION_CONTEXT_LIMITS.ambiguity, items: { type: "string", maxLength: 500 } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    recommendedConversationalAction: { type: "string", enum: ["clarify", "challenge", "explain", "summarize", "explore", "recommend", "wait"] },
  },
} as const;

const reasoningAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reasoningQuality", "unsupportedAssumptions", "missingEvidence", "competingHypotheses", "possibleBiases", "confidence", "challengeOpportunity"],
  properties: {
    reasoningQuality: { type: "string", enum: ["uncertain", "weak", "mixed", "sound"] },
    unsupportedAssumptions: { type: "array", maxItems: 5, items: { type: "string", maxLength: 500 } },
    missingEvidence: { type: "array", maxItems: 5, items: { type: "string", maxLength: 500 } },
    competingHypotheses: { type: "array", maxItems: 5, items: { type: "string", maxLength: 500 } },
    possibleBiases: { type: "array", maxItems: 4, items: { type: "string", maxLength: 500 } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    challengeOpportunity: { type: "string", enum: ["none", "low", "moderate", "high"] },
  },
} as const;

const interpretationSchemaV2 = {
  ...interpretationSchema,
  required: [...interpretationSchema.required, "reasoningAnalysis"],
  properties: { ...interpretationSchema.properties, reasoningAnalysis: reasoningAnalysisSchema },
} as const;

const systemPrompt = `You are a conversation analyst. Describe only what is occurring in the conversation. You do not determine organizational truth, recommend what the organization should do, modify organizational state, or write executive-facing final prose. Distinguish “the participant believes X” from “X is true.” Treat role as context, not authority. Prefer uncertainty over invention. Return only the required structured interpretation. A conversational action describes how Discovery should continue the dialogue; it is not an organizational recommendation.`;

const systemPromptV2 = `You are a conversation and reasoning analyst. Describe what is occurring in the conversation and how the participant is currently reasoning. Do not determine organizational truth, recommend what the organization should do, score the person, modify organizational state, or write executive-facing final prose. Distinguish reported evidence from participant hypotheses. Identify unsupported assumptions, evidence that would materially improve confidence, plausible competing hypotheses, and only cautious possible biases. Treat biases as possibilities, never diagnoses. Challenge opportunity means whether respectful, evidence-seeking challenge would improve understanding; it does not mean disagreement. Prefer uncertainty over invention. Return only the required structured interpretation.`;

function stringList(value: unknown, maximum: number): string[] | null {
  if (!Array.isArray(value) || value.length > maximum || value.some((item) => typeof item !== "string" || !item.trim() || item.length > 500)) return null;
  return value.map((item) => clean(item as string, 500));
}

const organizationalDirectivePattern =
  /\b(?:the organization|the company) should\b|\bstrategic recommendation\b|\bmust (?:hire|fire|restructure|acquire|divest)\b/i;
const unqualifiedOrganizationalFactPattern =
  /^(?:the organization|the company|the business|leadership|leaders|the team|teams|employees|operations)\s+(?:is|are|has|have|will|must|should|needs?|lacks?|suffers?|causes?|drives?|prevents?|requires?)\b/i;
const organizationalConfidencePattern =
  /\b(?:organizational|runtime|recommendation|model)\s+confidence\b/i;
const attributedInterpretationPattern =
  /\b(?:the participant|the executive|the user)\s+(?:believes?|assumes?|reports?|states?|suggests?|hypothesizes?|claims?)\b/i;

function violatesInterpretationAuthority(values: readonly unknown[]): boolean {
  return values
    .filter((value): value is string => typeof value === "string")
    .some((value) => {
      const normalized = clean(value, 500);
      return organizationalDirectivePattern.test(normalized) ||
        organizationalConfidencePattern.test(normalized) ||
        (
          unqualifiedOrganizationalFactPattern.test(normalized) &&
          !attributedInterpretationPattern.test(normalized)
        );
    });
}

function validateInterpretation(value: unknown, promptVersion: ConversationPromptVersion): ExecutiveConversationInterpretation | null {
  const candidate = record(value);
  const schema = promptVersion === CONVERSATION_PROMPT_VERSION_V2 ? interpretationSchemaV2 : interpretationSchema;
  const allowedKeys = new Set(Object.keys(schema.properties));
  if (Object.keys(candidate).some((key) => !allowedKeys.has(key))) return null;
  const intents = ["explore", "explain", "evaluate", "decide", "inform", "reflect"] as const;
  const actions = ["clarify", "challenge", "explain", "summarize", "explore", "recommend", "wait"] as const;
  const discardedHypotheses = stringList(candidate.discardedHypotheses, CONVERSATION_CONTEXT_LIMITS.hypotheses);
  const unresolvedQuestions = stringList(candidate.unresolvedQuestions, CONVERSATION_CONTEXT_LIMITS.unresolvedQuestions);
  const assumptions = stringList(candidate.assumptions, CONVERSATION_CONTEXT_LIMITS.assumptions);
  const ambiguity = stringList(candidate.ambiguity, CONVERSATION_CONTEXT_LIMITS.ambiguity);
  if (typeof candidate.executiveObjective !== "string" || !candidate.executiveObjective.trim() || candidate.executiveObjective.length > 500) return null;
  if (!intents.includes(candidate.executiveIntent as typeof intents[number])) return null;
  if (candidate.activeHypothesis !== null && (typeof candidate.activeHypothesis !== "string" || !candidate.activeHypothesis.trim() || candidate.activeHypothesis.length > 500)) return null;
  if (!discardedHypotheses || !unresolvedQuestions || !assumptions || !ambiguity) return null;
  if (typeof candidate.confidence !== "number" || !Number.isFinite(candidate.confidence) || candidate.confidence < 0 || candidate.confidence > 1) return null;
  if (!actions.includes(candidate.recommendedConversationalAction as typeof actions[number])) return null;
  let reasoningAnalysis: ExecutiveConversationInterpretation["reasoningAnalysis"] = null;
  if (promptVersion === CONVERSATION_PROMPT_VERSION_V2) {
    const reasoning = record(candidate.reasoningAnalysis);
    const reasoningKeys = new Set(Object.keys(reasoningAnalysisSchema.properties));
    if (Object.keys(reasoning).some((key) => !reasoningKeys.has(key))) return null;
    const unsupportedAssumptions = stringList(reasoning.unsupportedAssumptions, 5);
    const missingEvidence = stringList(reasoning.missingEvidence, 5);
    const competingHypotheses = stringList(reasoning.competingHypotheses, 5);
    const possibleBiases = stringList(reasoning.possibleBiases, 4);
    if (!unsupportedAssumptions || !missingEvidence || !competingHypotheses || !possibleBiases) return null;
    if (!["uncertain", "weak", "mixed", "sound"].includes(String(reasoning.reasoningQuality))) return null;
    if (!["none", "low", "moderate", "high"].includes(String(reasoning.challengeOpportunity))) return null;
    if (typeof reasoning.confidence !== "number" || reasoning.confidence < 0 || reasoning.confidence > 1) return null;
    if (violatesInterpretationAuthority([
      ...unsupportedAssumptions,
      ...missingEvidence,
      ...competingHypotheses,
      ...possibleBiases,
    ])) return null;
    reasoningAnalysis = { reasoningQuality: reasoning.reasoningQuality as NonNullable<typeof reasoningAnalysis>["reasoningQuality"], unsupportedAssumptions, missingEvidence, competingHypotheses, possibleBiases, confidence: reasoning.confidence, challengeOpportunity: reasoning.challengeOpportunity as NonNullable<typeof reasoningAnalysis>["challengeOpportunity"] };
  }
  if (violatesInterpretationAuthority([
    candidate.executiveObjective,
    candidate.activeHypothesis,
    ...discardedHypotheses,
    ...unresolvedQuestions,
    ...assumptions,
    ...ambiguity,
  ])) return null;
  return {
    executiveObjective: clean(candidate.executiveObjective, 500),
    executiveIntent: candidate.executiveIntent as ExecutiveConversationInterpretation["executiveIntent"],
    activeHypothesis: candidate.activeHypothesis === null ? null : clean(candidate.activeHypothesis as string, 500),
    discardedHypotheses,
    unresolvedQuestions,
    assumptions,
    ambiguity,
    confidence: candidate.confidence,
    recommendedConversationalAction: candidate.recommendedConversationalAction as ExecutiveConversationInterpretation["recommendedConversationalAction"],
    reasoningAnalysis,
  };
}

export class OpenAIConversationInterpreter implements ExecutiveConversationInterpreter {
  readonly provider = "openai";
  readonly model: string;
  readonly promptVersion: ConversationPromptVersion;
  lastObservation: ProviderConversationObservation | null = null;
  private readonly apiKey: string | undefined;
  private readonly timeoutMs: number;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: OpenAIConversationInterpreterOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? process.env.OPENAI_CONVERSATION_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    this.timeoutMs = options.timeoutMs ?? 12_000;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.promptVersion = options.promptVersion ?? CONVERSATION_PROMPT_VERSION_V1;
  }

  async interpret(request: ExecutiveConversationRequest): Promise<ExecutiveConversationInterpretation> {
    const startedAt = Date.now();
    const recentConversation = boundedTurns(request.recentConversation);
    const organizationContext = conversationContext(request.runtime);
    const payload = JSON.stringify({
      currentMessage: clean(request.currentMessage, CONVERSATION_CONTEXT_LIMITS.currentMessageCharacters),
      recentConversation,
      organizationContext,
    }).slice(0, CONVERSATION_CONTEXT_LIMITS.totalCharacters);
    const baseObservation = (): ProviderConversationObservation => ({
      provider: "openai",
      model: this.model,
      promptVersion: this.promptVersion,
      status: "fallback",
      fallbackReason: null,
      latencyMs: Date.now() - startedAt,
      inputTokens: null,
      outputTokens: null,
      schemaRepairCount: 0,
      invalidOutputCount: 0,
      requestMetadata: {
        recentTurnCount: recentConversation.length,
        inputCharacters: payload.length,
        organizationContextFields: Object.keys(organizationContext),
      },
    });
    const fail = (reason: string, partial: Partial<ProviderConversationObservation> = {}): never => {
      this.lastObservation = { ...baseObservation(), ...partial, status: "fallback", fallbackReason: reason };
      throw new ConversationProviderError(reason, this.lastObservation);
    };
    if (!this.apiKey) fail("missing-credentials");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImplementation("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: { type: "json_schema", json_schema: { name: "executive_conversation_interpretation", strict: true, schema: this.promptVersion === CONVERSATION_PROMPT_VERSION_V2 ? interpretationSchemaV2 : interpretationSchema } },
          messages: [
            { role: "system", content: this.promptVersion === CONVERSATION_PROMPT_VERSION_V2 ? systemPromptV2 : systemPrompt },
            { role: "user", content: payload },
          ],
        }),
      });
      if (!response.ok) fail(response.status === 429 ? "rate-limit" : `provider-http-${response.status}`);
      const body = record(await response.json());
      const choices = Array.isArray(body.choices) ? body.choices.map(record) : [];
      const message = record(choices[0]?.message);
      if (typeof message.refusal === "string" && message.refusal) fail("provider-refusal");
      if (typeof message.content !== "string" || !message.content.trim()) fail("empty-output");
      const content = message.content as string;
      let parsed: unknown;
      try { parsed = JSON.parse(content); } catch { return fail("malformed-output", { invalidOutputCount: 1 }); }
      const interpretation = validateInterpretation(parsed, this.promptVersion);
      if (!interpretation) return fail("schema-failure", { invalidOutputCount: 1 });
      const usage = record(body.usage);
      this.lastObservation = {
        ...baseObservation(),
        status: "success",
        fallbackReason: null,
        inputTokens: typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : null,
        outputTokens: typeof usage.completion_tokens === "number" ? usage.completion_tokens : null,
      };
      return interpretation;
    } catch (error) {
      if (error instanceof ConversationProviderError) throw error;
      return fail(error instanceof Error && error.name === "AbortError" ? "timeout" : "network-error");
    } finally {
      clearTimeout(timeout);
    }
  }
}
