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
  confidence: number;
  recommendedConversationalAction: ExecutiveConversationalAction;
};

export interface ExecutiveConversationInterpreter {
  readonly provider: string;
  interpret(request: ExecutiveConversationRequest): Promise<ExecutiveConversationInterpretation>;
}

export type ConversationInterpreterMode = "none" | "mock" | "openai";
