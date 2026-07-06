import type {
  SemanticObservation,
  SemanticObservationSourceType,
} from "./types";

export type CognitiveObservation = {
  id: string;
  sourceType: SemanticObservationSourceType;
  sourceId: string;
  sourceIds: string[];
  text: string;
  normalizedText: string;
  keywords: string[];
  concepts: string[];
  confidence: number;
};

const KNOWN_CONCEPTS = new Set([
  "knowledge-preservation",
  "institutional-memory",
  "knowledge-transfer",
  "context-loss",
  "documentation-decay",
  "repeat-work",
  "onboarding-friction",
  "learning-continuity",

  "decision-latency",
  "approval-dependency",
  "authority-ambiguity",
  "governance-drag",
  "escalation-dependence",
  "accountability-gap",
  "ownership-uncertainty",

  "coordination-friction",
  "handoff-breakdown",
  "ownership-boundary",
  "siloed-execution",
  "dependency-management",
  "interface-breakdown",
  "cross-functional-drag",

  "capacity-mismatch",
  "resource-constraint",
  "delivery-pressure",
  "focus-dilution",
  "operational-overload",
  "throughput-limitation",
  "execution-delay",

  "priority-drift",
  "strategic-ambiguity",
  "goal-misalignment",
  "narrative-fragmentation",
  "directional-inconsistency",
  "tradeoff-ambiguity",

  "feedback-loop-breakdown",
  "lesson-retention-failure",
  "experience-to-improvement-gap",
  "adaptive-learning-failure",
  "repeated-mistakes",
  "retrospective-breakdown",
  "practice-transfer-gap",

  "role-ambiguity",
  "ownership-ambiguity",
  "workflow-uncertainty",
  "decision-rights-confusion",
  "process-ambiguity",
  "operating-expectation-gap",
]);

export type BuildCognitiveObservationsParams = {
  observations: SemanticObservation[];
};

function normalize(text: string | undefined): string {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function conceptsFromObservation(observation: SemanticObservation): string[] {
  return unique(
    observation.keywords.filter((keyword) => KNOWN_CONCEPTS.has(keyword)),
  );
}

function textFromObservation(observation: SemanticObservation): string {
  return [
    observation.statement,
    observation.summary,
    observation.explanation,
    observation.semanticSignature,
    ...observation.keywords,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function primarySourceId(observation: SemanticObservation): string {
  return observation.sourceIds[0] ?? observation.id;
}

export function buildCognitiveObservations(
  params: BuildCognitiveObservationsParams,
): CognitiveObservation[] {
  return params.observations.map((observation) => {
    const text = textFromObservation(observation);

    return {
      id: observation.id,
      sourceType: observation.sourceType,
      sourceId: primarySourceId(observation),
      sourceIds: observation.sourceIds,
      text,
      normalizedText: normalize(text),
      keywords: observation.keywords,
      concepts: conceptsFromObservation(observation),
      confidence: observation.confidence,
    };
  });
}