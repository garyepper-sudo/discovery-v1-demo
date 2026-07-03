import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3Mechanism,
  V3Theme,
} from "./types";

import { V3PropagatedConfidence } from "./confidencePropagation";

export type V3HypothesisStatus =
  | "leading"
  | "plausible"
  | "weak"
  | "challenged";

export type V3Hypothesis = {
  id: string;
  title: string;
  explanation: string;
  status: V3HypothesisStatus;
  confidence: number;

  supportingEvidenceIds: string[];
  weakeningEvidenceIds: string[];
  mechanismIds: string[];
  themeIds: string[];
  beliefIds: string[];
  contradictionIds: string[];

  strengths: string[];
  weaknesses: string[];
  distinguishingQuestions: string[];
};

export function buildHypotheses(input: {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  mechanisms: V3Mechanism[];
  beliefs: V3Belief[];
  propagatedConfidence?: V3PropagatedConfidence;
}): V3Hypothesis[] {
  const hypotheses: V3Hypothesis[] = [];

  for (const mechanism of input.mechanisms) {
    const hypothesis = buildHypothesisFromMechanism(
      hypotheses.length + 1,
      mechanism,
      input
    );

    if (hypothesis) {
      hypotheses.push(hypothesis);
    }
  }

  for (const belief of input.beliefs) {
    const alreadyCovered = hypotheses.some((hypothesis) =>
      hypothesis.beliefIds.includes(belief.id)
    );

    if (!alreadyCovered) {
      hypotheses.push(
        buildHypothesisFromBelief(hypotheses.length + 1, belief, input)
      );
    }
  }

  return hypotheses
    .sort((a, b) => b.confidence - a.confidence)
    .map((hypothesis, index) => ({
      ...hypothesis,
      status: getHypothesisStatus(hypothesis.confidence, index),
    }));
}

function buildHypothesisFromMechanism(
  index: number,
  mechanism: V3Mechanism,
  input: {
    evidence: V3Evidence[];
    themes: V3Theme[];
    contradictions: V3Contradiction[];
    mechanisms: V3Mechanism[];
    beliefs: V3Belief[];
    propagatedConfidence?: V3PropagatedConfidence;
  }
): V3Hypothesis | null {
  if (mechanism.evidenceIds.length === 0) return null;

  const supportingEvidenceIds = mechanism.evidenceIds;
  const weakeningEvidenceIds = findWeakeningEvidenceIds(
    supportingEvidenceIds,
    input.contradictions
  );

  const relatedThemeIds = findRelatedThemeIds(
    supportingEvidenceIds,
    input.themes
  );

  const relatedBeliefIds = findRelatedBeliefIds(
    supportingEvidenceIds,
    input.beliefs
  );

  const relatedContradictionIds = findRelatedContradictionIds(
    supportingEvidenceIds,
    input.contradictions
  );

  const confidence = calculateHypothesisConfidence({
    baseConfidence: mechanism.confidence,
    supportingEvidenceIds,
    weakeningEvidenceIds,
    mechanismIds: [mechanism.id],
    propagatedConfidence: input.propagatedConfidence,
  });

  return {
    id: `H-${index}`,
    title: createMechanismHypothesisTitle(mechanism),
    explanation: createMechanismHypothesisExplanation(mechanism),
    status: "plausible",
    confidence,

    supportingEvidenceIds,
    weakeningEvidenceIds,
    mechanismIds: [mechanism.id],
    themeIds: relatedThemeIds,
    beliefIds: relatedBeliefIds,
    contradictionIds: relatedContradictionIds,

    strengths: createStrengths(supportingEvidenceIds, [mechanism.id]),
    weaknesses: createWeaknesses(weakeningEvidenceIds, relatedContradictionIds),
    distinguishingQuestions: createDistinguishingQuestions(
      mechanism.type,
      weakeningEvidenceIds
    ),
  };
}

function buildHypothesisFromBelief(
  index: number,
  belief: V3Belief,
  input: {
    evidence: V3Evidence[];
    themes: V3Theme[];
    contradictions: V3Contradiction[];
    mechanisms: V3Mechanism[];
    beliefs: V3Belief[];
    propagatedConfidence?: V3PropagatedConfidence;
  }
): V3Hypothesis {
  const supportingEvidenceIds = belief.supportingEvidenceIds;
  const weakeningEvidenceIds = belief.contradictingEvidenceIds;

  const relatedThemeIds = belief.themeIds ?? [];
  const relatedContradictionIds = findRelatedContradictionIds(
    [...supportingEvidenceIds, ...weakeningEvidenceIds],
    input.contradictions
  );

  const relatedMechanismIds = input.mechanisms
    .filter((mechanism) =>
      mechanism.evidenceIds.some((id) => supportingEvidenceIds.includes(id))
    )
    .map((mechanism) => mechanism.id);

  const confidence = calculateHypothesisConfidence({
    baseConfidence: belief.confidence,
    supportingEvidenceIds,
    weakeningEvidenceIds,
    mechanismIds: relatedMechanismIds,
    propagatedConfidence: input.propagatedConfidence,
  });

  return {
    id: `H-${index}`,
    title: belief.headline,
    explanation: belief.explanation,
    status: "plausible",
    confidence,

    supportingEvidenceIds,
    weakeningEvidenceIds,
    mechanismIds: relatedMechanismIds,
    themeIds: relatedThemeIds,
    beliefIds: [belief.id],
    contradictionIds: relatedContradictionIds,

    strengths: createStrengths(supportingEvidenceIds, relatedMechanismIds),
    weaknesses: createWeaknesses(weakeningEvidenceIds, relatedContradictionIds),
    distinguishingQuestions: [
      "What evidence would most clearly confirm or weaken this explanation?",
      "What alternative explanation could account for the same evidence?",
    ],
  };
}

function calculateHypothesisConfidence(input: {
  baseConfidence: number;
  supportingEvidenceIds: string[];
  weakeningEvidenceIds: string[];
  mechanismIds: string[];
  propagatedConfidence?: V3PropagatedConfidence;
}): number {
  const supportSignal = average(
    input.supportingEvidenceIds.map((id) =>
      findPropagatedConfidence(input.propagatedConfidence?.evidence ?? [], id)
    )
  );

  const weakeningSignal = average(
    input.weakeningEvidenceIds.map((id) =>
      findPropagatedConfidence(input.propagatedConfidence?.evidence ?? [], id)
    )
  );

  const mechanismSignal = average(
    input.mechanismIds.map((id) =>
      findPropagatedConfidence(input.propagatedConfidence?.mechanisms ?? [], id)
    )
  );

  const supportBonus = Math.min(input.supportingEvidenceIds.length * 0.025, 0.12);
  const mechanismBonus = input.mechanismIds.length > 0 ? 0.06 : 0;
  const weaknessPenalty =
    input.weakeningEvidenceIds.length > 0
      ? Math.min(weakeningSignal * 0.18, 0.18)
      : 0;

  return clamp(
    input.baseConfidence * 0.45 +
      supportSignal * 0.25 +
      mechanismSignal * 0.18 +
      supportBonus +
      mechanismBonus -
      weaknessPenalty
  );
}

function findWeakeningEvidenceIds(
  supportingEvidenceIds: string[],
  contradictions: V3Contradiction[]
): string[] {
  return unique(
    contradictions
      .filter((contradiction) =>
        contradiction.evidenceIds.some((id) => supportingEvidenceIds.includes(id))
      )
      .flatMap((contradiction) => contradiction.opposingEvidenceIds ?? [])
  );
}

function findRelatedThemeIds(
  evidenceIds: string[],
  themes: V3Theme[]
): string[] {
  return themes
    .filter((theme) =>
      theme.evidenceIds.some((id) => evidenceIds.includes(id))
    )
    .map((theme) => theme.id);
}

function findRelatedBeliefIds(
  evidenceIds: string[],
  beliefs: V3Belief[]
): string[] {
  return beliefs
    .filter((belief) =>
      belief.supportingEvidenceIds.some((id) => evidenceIds.includes(id))
    )
    .map((belief) => belief.id);
}

function findRelatedContradictionIds(
  evidenceIds: string[],
  contradictions: V3Contradiction[]
): string[] {
  return contradictions
    .filter((contradiction) =>
      contradiction.evidenceIds.some((id) => evidenceIds.includes(id))
    )
    .map((contradiction) => contradiction.id);
}

function createMechanismHypothesisTitle(mechanism: V3Mechanism): string {
  if (mechanism.type === "causal") {
    return `Hypothesis: ${mechanism.cause} may be producing ${mechanism.effect}`;
  }

  if (mechanism.type === "dependency") {
    return `Hypothesis: ${mechanism.effect} depends on ${mechanism.cause}`;
  }

  if (mechanism.type === "constraint") {
    return `Hypothesis: ${mechanism.cause} is constraining ${mechanism.effect}`;
  }

  if (mechanism.type === "tension") {
    return `Hypothesis: ${mechanism.cause} and ${mechanism.effect} are in tension`;
  }

  if (mechanism.type === "reinforcing") {
    return `Hypothesis: ${mechanism.cause} reinforces ${mechanism.effect}`;
  }

  return mechanism.title;
}

function createMechanismHypothesisExplanation(mechanism: V3Mechanism): string {
  return [
    mechanism.mechanism,
    mechanism.explanation,
    "Discovery is treating this as one plausible explanation rather than a final conclusion.",
  ].join(" ");
}

function createStrengths(
  supportingEvidenceIds: string[],
  mechanismIds: string[]
): string[] {
  const strengths: string[] = [];

  if (supportingEvidenceIds.length > 0) {
    strengths.push(
      `Supported by ${supportingEvidenceIds.length} evidence item${
        supportingEvidenceIds.length === 1 ? "" : "s"
      }.`
    );
  }

  if (mechanismIds.length > 0) {
    strengths.push(
      `Connected to ${mechanismIds.length} detected mechanism${
        mechanismIds.length === 1 ? "" : "s"
      }.`
    );
  }

  if (strengths.length === 0) {
    strengths.push("This hypothesis is plausible but currently lightly supported.");
  }

  return strengths;
}

function createWeaknesses(
  weakeningEvidenceIds: string[],
  contradictionIds: string[]
): string[] {
  const weaknesses: string[] = [];

  if (weakeningEvidenceIds.length > 0) {
    weaknesses.push(
      `${weakeningEvidenceIds.length} evidence item${
        weakeningEvidenceIds.length === 1 ? "" : "s"
      } may weaken this explanation.`
    );
  }

  if (contradictionIds.length > 0) {
    weaknesses.push(
      `There ${
        contradictionIds.length === 1 ? "is" : "are"
      } ${contradictionIds.length} related contradiction${
        contradictionIds.length === 1 ? "" : "s"
      }.`
    );
  }

  if (weaknesses.length === 0) {
    weaknesses.push("No major weakening evidence has been identified yet.");
  }

  return weaknesses;
}

function createDistinguishingQuestions(
  mechanismType: V3Mechanism["type"],
  weakeningEvidenceIds: string[]
): string[] {
  const questions = [
    "What evidence would distinguish this hypothesis from the next-best alternative?",
  ];

  if (mechanismType === "causal") {
    questions.push("Can we show that the cause came before the effect?");
  }

  if (mechanismType === "dependency") {
    questions.push("Would the effect still happen if the dependency were removed?");
  }

  if (mechanismType === "constraint") {
    questions.push("What would happen if the constraint were relieved?");
  }

  if (weakeningEvidenceIds.length > 0) {
    questions.push("Why does the weakening evidence point in a different direction?");
  }

  return questions.slice(0, 3);
}

function getHypothesisStatus(
  confidence: number,
  index: number
): V3HypothesisStatus {
  if (index === 0 && confidence >= 0.62) return "leading";
  if (confidence >= 0.58) return "plausible";
  if (confidence >= 0.42) return "weak";
  return "challenged";
}

function findPropagatedConfidence(
  adjustments: { id: string; adjustedConfidence: number }[],
  id: string
): number {
  return (
    adjustments.find((adjustment) => adjustment.id === id)
      ?.adjustedConfidence ?? 0
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function average(values: number[]): number {
  const meaningfulValues = values.filter((value) => value > 0);

  if (meaningfulValues.length === 0) return 0;

  return (
    meaningfulValues.reduce((sum, value) => sum + value, 0) /
    meaningfulValues.length
  );
}

function clamp(value: number): number {
  return round(Math.min(0.98, Math.max(0.05, value)));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}