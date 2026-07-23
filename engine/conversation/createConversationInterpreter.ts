import { MockConversationInterpreter } from "./MockConversationInterpreter";
import type { ConversationInterpreterMode, ExecutiveConversationInterpreter } from "./executiveConversationTypes";

export type ConversationIntelligenceFeatureFlags = {
  conversationInterpreter: ConversationInterpreterMode;
};

export function parseConversationInterpreterMode(value: string | undefined): ConversationInterpreterMode {
  return value?.trim().toLowerCase() === "mock" ? "mock" : "none";
}

export function createConversationInterpreter(mode: ConversationInterpreterMode): ExecutiveConversationInterpreter | null {
  return mode === "mock" ? new MockConversationInterpreter() : null;
}

export function readConversationIntelligenceFeatureFlags(
  environment: Record<string, string | undefined> = process.env,
): ConversationIntelligenceFeatureFlags {
  return {
    conversationInterpreter: parseConversationInterpreterMode(environment.CONVERSATION_INTERPRETER),
  };
}
