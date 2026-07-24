import type { OrganizationRuntime } from "../v3/runtime";

export type ExecutiveConversationIntent =
  | "explore"
  | "explain"
  | "evaluate"
  | "decide"
  | "inform"
  | "reflect";

export type ExecutiveConversationalAction =
  | "clarify"
  | "challenge"
  | "explain"
  | "summarize"
  | "explore"
  | "recommend"
  | "wait";

export type ExecutiveConversationTurn = {
  speaker: "executive" | "discovery";
  message: string;
};

export type ExecutiveConversationRequest = {
  currentMessage: string;
  recentConversation: readonly ExecutiveConversationTurn[];
  runtime: OrganizationRuntime;
};

export type ExecutiveConversationInterpretation = {
  executiveObjective: string;
  executiveIntent: ExecutiveConversationIntent;
  activeHypothesis: string | null;
  discardedHypotheses: string[];
  unresolvedQuestions: string[];
  assumptions: string[];
  ambiguity: string[];
  /**
   * Confidence in this ephemeral conversational interpretation only.
   *
   * This is not organizational, Runtime, recommendation, or model confidence.
   */
  confidence: number;
  recommendedConversationalAction: ExecutiveConversationalAction;
  reasoningAnalysis: ExecutiveReasoningAnalysis | null;
};

export type ExecutiveReasoningAnalysis = {
  reasoningQuality: "uncertain" | "weak" | "mixed" | "sound";
  unsupportedAssumptions: string[];
  missingEvidence: string[];
  competingHypotheses: string[];
  possibleBiases: string[];
  /**
   * Confidence in this ephemeral analysis of the participant's reasoning only.
   *
   * This is not organizational, Runtime, recommendation, or model confidence.
   */
  confidence: number;
  challengeOpportunity: "none" | "low" | "moderate" | "high";
};

export interface ExecutiveConversationInterpreter {
  readonly provider: string;
  interpret(request: ExecutiveConversationRequest): Promise<ExecutiveConversationInterpretation>;
}

export type ConversationInterpreterMode = "none" | "mock" | "openai";
