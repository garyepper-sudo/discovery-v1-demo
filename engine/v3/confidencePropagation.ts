import {
  V3Belief,
  V3Evidence,
  V3EvidenceNetwork,
  V3EvidenceRelationship,
  V3Mechanism,
} from "./types";

export type V3PropagatedConfidence = {
  evidence: V3ConfidenceAdjustment[];
  relationships: V3ConfidenceAdjustment[];
  mechanisms: V3ConfidenceAdjustment[];
  beliefs: V3ConfidenceAdjustment[];

  summary: {
    averageEvidenceConfidence: number;
    averageRelationshipConfidence: number;
    averageMechanismConfidence: number;
    averageBeliefConfidence: number;
    confidenceLift: number;
    contradictionPenalty: number;
  };
};

export type V3ConfidenceAdjustment = {
  id: string;
  originalConfidence: number;
  adjustedConfidence: number;
  delta: number;
  explanation: string;
};

export function propagateConfidence(input: {
  evidence: V3Evidence[];
  evidenceNetwork?: V3EvidenceNetwork;
  mechanisms: V3Mechanism[];
  beliefs: V3Belief[];
}): V3PropagatedConfidence {
  const relationships = input.evidenceNetwork?.relationships ?? [];

  const evidenceAdjustments = adjustEvidenceConfidence(
    input.evidence,
    relationships
  );

  const relationshipAdjustments = adjustRelationshipConfidence(
    relationships,
    evidenceAdjustments
  );

  const mechanismAdjustments = adjustMechanismConfidence(
    input.mechanisms,
    relationshipAdjustments
  );

  const beliefAdjustments = adjustBeliefConfidence(
    input.beliefs,
    evidenceAdjustments,
    mechanismAdjustments
  );

  return {
    evidence: evidenceAdjustments,
    relationships: relationshipAdjustments,
    mechanisms: mechanismAdjustments,
    beliefs: beliefAdjustments,
    summary: buildSummary(
      evidenceAdjustments,
      relationshipAdjustments,
      mechanismAdjustments,
      beliefAdjustments
    ),
  };
}

function adjustEvidenceConfidence(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): V3ConfidenceAdjustment[] {
  return evidence.map((item) => {
    const connectedRelationships = relationships.filter(
      (relationship) =>
        relationship.sourceEvidenceId === item.id ||
        relationship.targetEvidenceId === item.id
    );

    const supportingCount = connectedRelationships.filter(
      (relationship) =>
        relationship.type === "supports" ||
        relationship.type === "duplicates" ||
        relationship.type === "extends"
    ).length;

    const contradictionCount = connectedRelationships.filter(
      (relationship) => relationship.type === "contradicts"
    ).length;

    const lift = Math.min(supportingCount * 0.03, 0.12);
    const penalty = Math.min(contradictionCount * 0.05, 0.18);

    const adjustedConfidence = clamp(item.confidence + lift - penalty);

    return {
      id: item.id,
      originalConfidence: item.confidence,
      adjustedConfidence,
      delta: round(adjustedConfidence - item.confidence),
      explanation: createEvidenceExplanation(
        supportingCount,
        contradictionCount
      ),
    };
  });
}

function adjustRelationshipConfidence(
  relationships: V3EvidenceRelationship[],
  evidenceAdjustments: V3ConfidenceAdjustment[]
): V3ConfidenceAdjustment[] {
  return relationships.map((relationship) => {
    const sourceConfidence = findAdjustedConfidence(
      evidenceAdjustments,
      relationship.sourceEvidenceId
    );

    const targetConfidence = findAdjustedConfidence(
      evidenceAdjustments,
      relationship.targetEvidenceId
    );

    const evidenceSupport = average([sourceConfidence, targetConfidence]);
    const contradictionPenalty =
      relationship.type === "contradicts" ? 0.06 : 0;

    const adjustedConfidence = clamp(
      relationship.confidence * 0.65 +
        evidenceSupport * 0.35 -
        contradictionPenalty
    );

    return {
      id: relationship.id,
      originalConfidence: relationship.confidence,
      adjustedConfidence,
      delta: round(adjustedConfidence - relationship.confidence),
      explanation:
        "Relationship confidence was adjusted based on the confidence of the evidence it connects.",
    };
  });
}

function adjustMechanismConfidence(
  mechanisms: V3Mechanism[],
  relationshipAdjustments: V3ConfidenceAdjustment[]
): V3ConfidenceAdjustment[] {
  return mechanisms.map((mechanism) => {
    const relatedRelationshipConfidence = mechanism.relationshipIds
      .map((id) => findAdjustedConfidence(relationshipAdjustments, id))
      .filter((confidence) => confidence > 0);

    const relationshipSignal = average(relatedRelationshipConfidence);

    const lift =
      relatedRelationshipConfidence.length >= 2
        ? Math.min(relatedRelationshipConfidence.length * 0.025, 0.1)
        : 0;

    const adjustedConfidence = clamp(
      mechanism.confidence * 0.6 + relationshipSignal * 0.4 + lift
    );

    return {
      id: mechanism.id,
      originalConfidence: mechanism.confidence,
      adjustedConfidence,
      delta: round(adjustedConfidence - mechanism.confidence),
      explanation:
        "Mechanism confidence was adjusted based on the strength of its underlying evidence relationships.",
    };
  });
}

function adjustBeliefConfidence(
  beliefs: V3Belief[],
  evidenceAdjustments: V3ConfidenceAdjustment[],
  mechanismAdjustments: V3ConfidenceAdjustment[]
): V3ConfidenceAdjustment[] {
  return beliefs.map((belief) => {
    const supportingEvidenceConfidence = belief.supportingEvidenceIds
      .map((id) => findAdjustedConfidence(evidenceAdjustments, id))
      .filter((confidence) => confidence > 0);

    const contradictingEvidenceConfidence = belief.contradictingEvidenceIds
      .map((id) => findAdjustedConfidence(evidenceAdjustments, id))
      .filter((confidence) => confidence > 0);

    const mechanismSignal = average(
      mechanismAdjustments.map((item) => item.adjustedConfidence)
    );

    const supportSignal = average(supportingEvidenceConfidence);
    const contradictionSignal = average(contradictingEvidenceConfidence);

    const contradictionPenalty =
      contradictingEvidenceConfidence.length > 0
        ? contradictionSignal * 0.18
        : 0;

    const adjustedConfidence = clamp(
      belief.confidence * 0.55 +
        supportSignal * 0.25 +
        mechanismSignal * 0.2 -
        contradictionPenalty
    );

    return {
      id: belief.id,
      originalConfidence: belief.confidence,
      adjustedConfidence,
      delta: round(adjustedConfidence - belief.confidence),
      explanation:
        "Belief confidence was adjusted based on supporting evidence, contradicting evidence, and mechanism strength.",
    };
  });
}

function createEvidenceExplanation(
  supportingCount: number,
  contradictionCount: number
): string {
  if (supportingCount === 0 && contradictionCount === 0) {
    return "Evidence confidence was unchanged because no meaningful network relationships were detected.";
  }

  if (supportingCount > 0 && contradictionCount > 0) {
    return "Evidence confidence was adjusted upward by supporting relationships and downward by contradictions.";
  }

  if (supportingCount > 0) {
    return "Evidence confidence increased because related evidence appears to support or reinforce it.";
  }

  return "Evidence confidence decreased because related evidence appears to contradict it.";
}

function buildSummary(
  evidence: V3ConfidenceAdjustment[],
  relationships: V3ConfidenceAdjustment[],
  mechanisms: V3ConfidenceAdjustment[],
  beliefs: V3ConfidenceAdjustment[]
): V3PropagatedConfidence["summary"] {
  const originalAverage = average([
    ...evidence.map((item) => item.originalConfidence),
    ...relationships.map((item) => item.originalConfidence),
    ...mechanisms.map((item) => item.originalConfidence),
    ...beliefs.map((item) => item.originalConfidence),
  ]);

  const adjustedAverage = average([
    ...evidence.map((item) => item.adjustedConfidence),
    ...relationships.map((item) => item.adjustedConfidence),
    ...mechanisms.map((item) => item.adjustedConfidence),
    ...beliefs.map((item) => item.adjustedConfidence),
  ]);

  return {
    averageEvidenceConfidence: round(
      average(evidence.map((item) => item.adjustedConfidence))
    ),
    averageRelationshipConfidence: round(
      average(relationships.map((item) => item.adjustedConfidence))
    ),
    averageMechanismConfidence: round(
      average(mechanisms.map((item) => item.adjustedConfidence))
    ),
    averageBeliefConfidence: round(
      average(beliefs.map((item) => item.adjustedConfidence))
    ),
    confidenceLift: round(Math.max(0, adjustedAverage - originalAverage)),
    contradictionPenalty: round(Math.max(0, originalAverage - adjustedAverage)),
  };
}

function findAdjustedConfidence(
  adjustments: V3ConfidenceAdjustment[],
  id: string
): number {
  return (
    adjustments.find((adjustment) => adjustment.id === id)
      ?.adjustedConfidence ?? 0
  );
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return round(Math.min(0.98, Math.max(0.05, value)));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}