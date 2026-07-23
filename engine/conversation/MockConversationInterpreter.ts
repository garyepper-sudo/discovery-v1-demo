import type {
  ExecutiveConversationInterpretation,
  ExecutiveConversationInterpreter,
  ExecutiveConversationRequest,
  ExecutiveConversationTurn,
} from "./executiveConversationTypes";

const compact = (value: string) => value.replace(/\s+/g, " ").trim();
const sentence = (value: string) => compact(value).replace(/[?.!]+$/, "");
const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

function priorExecutiveMessages(turns: readonly ExecutiveConversationTurn[]): string[] {
  return turns
    .filter((turn) => turn.speaker === "executive")
    .map((turn) => compact(turn.message))
    .filter(Boolean)
    .slice(-4);
}

export class MockConversationInterpreter implements ExecutiveConversationInterpreter {
  readonly provider = "mock";

  async interpret(request: ExecutiveConversationRequest): Promise<ExecutiveConversationInterpretation> {
    const currentMessage = compact(request.currentMessage);
    const normalized = currentMessage.toLowerCase();
    const priorMessages = priorExecutiveMessages(request.recentConversation);
    const directionChanged = includesAny(normalized, ["actually", "instead", "now prefer", "changed my mind"]);
    const isQuestion = /\?$/.test(currentMessage) || /^(what|why|how|which|where|when|should|could|would|is|are|do|does)\b/i.test(currentMessage);
    const isDecision = includesAny(normalized, ["open a decision", "decide", "commit", "approve"]);
    const isExperiment = includesAny(normalized, ["stress test", "experiment", "scenario"]);
    const isExplanation = includesAny(normalized, ["explain", "what changed", "why", "how"]);
    const isBrainstorm = includesAny(normalized, ["what if", "considering", "brainstorm", "idea"]);
    const assertsCause = includesAny(normalized, [" because ", "i know", "primary problem", "the cause", "will definitely"]);
    const isEvidence = includesAny(normalized, ["evidence", "last month", "data shows", "we observed", "teams resolved"]);
    const isAmbiguous = includesAny(normalized, ["unclear", "maybe", "possibly", "what if"]);

    const executiveIntent = isDecision
      ? "decide"
      : isExplanation
        ? "explain"
        : isExperiment
          ? "evaluate"
          : isBrainstorm
            ? "explore"
            : isEvidence
              ? "inform"
              : "reflect";
    const previousHypothesis = priorMessages.at(-1) ?? null;
    const activeHypothesis = isQuestion && !isBrainstorm ? previousHypothesis : sentence(currentMessage) || null;
    const assumptions = assertsCause ? [sentence(currentMessage)] : [];
    const ambiguity = isAmbiguous ? [sentence(currentMessage)] : [];
    const unresolvedQuestions = isQuestion
      ? [currentMessage.endsWith("?") ? currentMessage : `${currentMessage}?`]
      : isAmbiguous
        ? [`What evidence would distinguish the possibilities in “${sentence(currentMessage)}”?`]
        : [];
    const recommendedConversationalAction = assertsCause
      ? "challenge"
      : isExplanation
        ? "explain"
        : isDecision
          ? "recommend"
          : isBrainstorm || isExperiment
            ? "explore"
            : isAmbiguous
              ? "clarify"
              : isEvidence
                ? "summarize"
                : "wait";
    const objectivePrefix = directionChanged
      ? "Re-evaluate the changed direction"
      : executiveIntent === "decide"
        ? "Frame an explicit decision"
        : executiveIntent === "evaluate"
          ? "Evaluate the proposed scenario"
          : executiveIntent === "explain"
            ? "Explain the current question"
            : executiveIntent === "explore"
              ? "Explore the executive idea"
              : executiveIntent === "inform"
                ? "Understand the new executive evidence"
                : "Understand the executive perspective";

    return {
      executiveObjective: `${objectivePrefix}: ${sentence(currentMessage)}`,
      executiveIntent,
      activeHypothesis,
      discardedHypotheses: directionChanged && previousHypothesis ? [previousHypothesis] : [],
      unresolvedQuestions,
      assumptions,
      ambiguity,
      confidence: Math.min(0.95, 0.55 + (priorMessages.length > 0 ? 0.15 : 0) + (currentMessage.length >= 24 ? 0.1 : 0)),
      recommendedConversationalAction,
    };
  }
}
