import { MockConversationInterpreter } from "./MockConversationInterpreter";
import { OpenAIConversationInterpreter } from "./OpenAIConversationInterpreter";
import type { ConversationInterpreterMode, ExecutiveConversationInterpreter } from "./executiveConversationTypes";

export type ConversationIntelligenceFeatureFlags = {
  conversationInterpreter: ConversationInterpreterMode;
};

export function parseConversationInterpreterMode(value: string | undefined): ConversationInterpreterMode {
  const normalized = value?.trim().toLowerCase();
  return normalized === "mock" || normalized === "openai" ? normalized : "none";
}

export function createConversationInterpreter(mode: ConversationInterpreterMode): ExecutiveConversationInterpreter | null {
  if (mode === "mock") return new MockConversationInterpreter();
  if (mode === "openai") return new OpenAIConversationInterpreter();
  return null;
}

export function readConversationIntelligenceFeatureFlags(
  environment: Record<string, string | undefined> = process.env,
): ConversationIntelligenceFeatureFlags {
  return {
    conversationInterpreter: parseConversationInterpreterMode(environment.CONVERSATION_INTERPRETER),
  };
}
