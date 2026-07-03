import { V3Belief } from "./types";

export type V3Dialectic = {
  id: string;
  currentBeliefId: string;
  currentBelief: string;
  strongestAlternativeBelief?: string;
  whyCurrentBeliefWins: string[];
  whyItMightBeWrong: string[];
  evidenceThatWouldChangeDiscoverysMind: string[];
};

export function buildDialectic(beliefs: V3Belief[]): V3Dialectic {
  const sortedBeliefs = [...beliefs].sort(
    (a, b) => b.confidence - a.confidence
  );

  const currentBelief = sortedBeliefs[0];
  const alternativeBelief = sortedBeliefs[1];

  return {
    id: "D1",
    currentBeliefId: currentBelief?.id ?? "unknown",
    currentBelief:
      currentBelief?.headline ??
      "Discovery has not formed a dominant belief yet.",
    strongestAlternativeBelief: alternativeBelief?.headline,

    whyCurrentBeliefWins: currentBelief
      ? [
          `It has the strongest confidence score at ${Math.round(
            currentBelief.confidence * 100
          )}%.`,
          `It is supported by ${currentBelief.supportingEvidenceIds.length} evidence item(s).`,
          ...(currentBelief.supportingReasons ?? []),
        ]
      : ["Discovery does not yet have enough evidence to rank beliefs."],

    whyItMightBeWrong:
      currentBelief?.concerns?.length
        ? currentBelief.concerns
        : [
            "Discovery has not yet found enough disconfirming evidence.",
            "The current belief may change if new evidence points toward another explanation.",
          ],

    evidenceThatWouldChangeDiscoverysMind:
      currentBelief?.nextQuestions?.length
        ? currentBelief.nextQuestions.map(
            (question) => `Evidence that answers: ${question}`
          )
        : [
            "A customer signal that contradicts the current belief.",
            "Operational data showing the pattern does not hold.",
            "A leadership document revealing a different causal mechanism.",
          ],
  };
}