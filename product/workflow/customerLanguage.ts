import { limitWords } from "./text";

export type ProductLanguageAuditClassification =
  | "customer-ready"
  | "engine-oriented-but-deterministically-translatable"
  | "unsuitable-for-customer-presentation"
  | "unavailable-and-omitted";

export const productLanguageAudit = {
  answerConclusion: "customer-ready",
  evidenceStatement: "customer-ready",
  confidenceMeaning: "engine-oriented-but-deterministically-translatable",
  investigationReason: "engine-oriented-but-deterministically-translatable",
  confidenceGainScale: "engine-oriented-but-deterministically-translatable",
  runtimeFreshness: "unavailable-and-omitted",
  authoritativeSourceId: "unsuitable-for-customer-presentation",
  internalObjectCounts: "unsuitable-for-customer-presentation",
} as const satisfies Record<string, ProductLanguageAuditClassification>;

export function customerConfidenceMeaning(): string {
  return "How strongly the current evidence supports this answer.";
}

export function customerConfidenceLimiter(value: string | null | undefined): string {
  const normalized = value?.trim();
  if (!normalized) return "More independent evidence would make this answer more certain.";
  return limitWords(
    normalized
      .replace(/\bepistemic\b/gi, "current")
      .replace(/\bconfidence limiter\b/gi, "remaining uncertainty")
      .replace(/\bevidence objects?\b/gi, "evidence"),
    28,
  );
}

export function customerInvestigationReason(input: {
  reason: string;
  question: string;
  topic?: string;
}): string {
  const reason = input.reason.trim();
  const topic = input.topic?.trim();
  if (/contradict|conflict|disagree/i.test(reason)) {
    return `Resolve the conflicting evidence${topic ? ` about ${topic}` : ""} before relying on the current answer.`;
  }
  if (/missing|gap|lack|insufficient|limited|uncertain|unknown/i.test(reason)) {
    return `Add direct evidence${topic ? ` about ${topic}` : ""} to address the main remaining uncertainty.`;
  }
  if (/interview|owner|leader|person|stakeholder/i.test(reason)) {
    return `Ask the people closest to ${topic || "this question"} for direct observations.`;
  }
  return `Gather evidence that can distinguish the leading answer from the remaining alternatives to “${limitWords(input.question, 18)}”`;
}

export function customerSearchLimitation(): string {
  return "This review includes information people added directly. Connected organizational records were not searched.";
}

export function customerExpectedGainLimitation(): string {
  return "The expected improvement is an estimate, not a guarantee.";
}

export function customerModelDevelopmentalState(
  state: "fragmented" | "forming" | "coherent" | "maturing",
): string {
  if (state === "fragmented") return "has important unresolved conflicts";
  if (state === "forming") return "is still taking shape";
  if (state === "coherent") return "is becoming consistent";
  return "is well supported and consistent";
}

export function customerAlternative(
  value: string | null | undefined,
): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (
    /evidence items?|evidence relationships?|belief layer|causal mechanism|organizational (?:belief|theory)|detected/i
      .test(text)
  ) return null;
  return limitWords(text, 28);
}

export function customerWhyItMatters(
  value: string | null | undefined,
): string {
  const text = value?.trim();
  if (!text) return "This answer identifies what to examine before deciding what to change.";
  if (/open questions attached to this belief/i.test(text)) {
    return "Important uncertainty remains, so the answer should be improved before making a high-consequence decision.";
  }
  if (/competing evidence may change this mechanism/i.test(text)) {
    return "Additional evidence could still change this answer.";
  }
  if (/\b(?:belief layer|causal mechanism|organizational theory|evidence objects?)\b/i.test(text)) {
    return "This answer identifies what to examine before deciding what to change.";
  }
  return limitWords(text, 32);
}

export function customerOutcomeInterpretation(
  status: "inconclusive" | "working" | "not_working" | "mixed",
): string {
  if (status === "working") return "Observed outcomes currently support the decision.";
  if (status === "not_working") return "Observed outcomes do not currently support the decision.";
  if (status === "mixed") return "Observed outcomes support some parts of the decision but not others.";
  return "The observed outcomes are not yet clear enough to judge the decision.";
}

export function customerModelGrowth(
  value: string | null | undefined,
): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (/new organizational belief emerged/i.test(text)) {
    return "New evidence produced a supported explanation.";
  }
  if (/new organizational theory emerged/i.test(text)) {
    return "Evidence strengthened the organization’s current understanding.";
  }
  if (/prediction was partially confirmed/i.test(text)) {
    return "Observed outcomes partly supported an earlier expectation.";
  }
  if (/prediction was confirmed/i.test(text)) {
    return "Observed outcomes strengthened an earlier expectation.";
  }
  if (/\b(?:belief layer|causal mechanism|organizational theory|fitness)\b/i.test(text)) {
    return null;
  }
  if (/\bcondition-[a-z0-9_-]+\b/i.test(text)) return null;
  return limitWords(text, 24);
}
