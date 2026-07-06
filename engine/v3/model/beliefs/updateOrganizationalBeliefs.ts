import type {
  OrganizationalBelief,
  OrganizationalBeliefRevision,
  OrganizationalBeliefTrend,
} from "./organizationalBeliefs";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function determineTrend(params: {
  previousConfidence: number;
  revisedConfidence: number;
}): OrganizationalBeliefTrend {
  const delta = params.revisedConfidence - params.previousConfidence;

  if (delta > 0.03) return "strengthening";
  if (delta < -0.03) return "weakening";

  return "stable";
}

function mergeBelief(params: {
  existingBelief: OrganizationalBelief;
  incomingBelief: OrganizationalBelief;
  now: string;
}): { belief: OrganizationalBelief; revision: OrganizationalBeliefRevision } {
  const { existingBelief, incomingBelief, now } = params;

  const combinedSupportingMechanismIds = unique([
    ...existingBelief.supportingMechanismIds,
    ...incomingBelief.supportingMechanismIds,
  ]);

  const combinedSupportingEvidenceIds = unique([
    ...existingBelief.supportingEvidenceIds,
    ...incomingBelief.supportingEvidenceIds,
  ]);

  const combinedContradictoryEvidenceIds = unique([
    ...existingBelief.contradictoryEvidenceIds,
    ...incomingBelief.contradictoryEvidenceIds,
  ]);

  const supportGrowth =
    combinedSupportingEvidenceIds.length -
    existingBelief.supportingEvidenceIds.length;

  const contradictionGrowth =
    combinedContradictoryEvidenceIds.length -
    existingBelief.contradictoryEvidenceIds.length;

  const supportSignal = supportGrowth * 0.04;
  const contradictionSignal = contradictionGrowth * 0.06;

  const evidenceWeightedConfidence =
    existingBelief.confidence + supportSignal - contradictionSignal;

  const mechanismWeightedConfidence =
    (existingBelief.confidence * existingBelief.supportingMechanismIds.length +
      incomingBelief.confidence *
        Math.max(1, incomingBelief.supportingMechanismIds.length)) /
    Math.max(
      1,
      existingBelief.supportingMechanismIds.length +
        incomingBelief.supportingMechanismIds.length,
    );

  const revisedConfidence = clampConfidence(
    evidenceWeightedConfidence * 0.55 + mechanismWeightedConfidence * 0.45,
  );

  const trend = determineTrend({
    previousConfidence: existingBelief.confidence,
    revisedConfidence,
  });

  const belief: OrganizationalBelief = {
    ...existingBelief,
    confidence: revisedConfidence,
    supportingMechanismIds: combinedSupportingMechanismIds,
    supportingPatternIds: unique([
      ...existingBelief.supportingPatternIds,
      ...incomingBelief.supportingPatternIds,
    ]),
    supportingConceptIds: unique([
      ...existingBelief.supportingConceptIds,
      ...incomingBelief.supportingConceptIds,
    ]),
    supportingEvidenceIds: combinedSupportingEvidenceIds,
    contradictoryEvidenceIds: combinedContradictoryEvidenceIds,
    trend,
    lastUpdatedAt: now,
  };

  const revision: OrganizationalBeliefRevision = {
    beliefId: belief.id,
    previousConfidence: existingBelief.confidence,
    revisedConfidence,
    trend,
    reason:
      trend === "strengthening"
        ? "New mechanisms or supporting evidence strengthened this organizational belief."
        : trend === "weakening"
          ? "Contradictory evidence or weaker mechanism support reduced confidence in this organizational belief."
          : "New evidence was consistent with the existing belief without materially changing confidence.",
  };

  return { belief, revision };
}

export function updateOrganizationalBeliefs(params: {
  existingBeliefs?: OrganizationalBelief[];
  incomingBeliefs?: OrganizationalBelief[];
  now: string;
}): {
  beliefs: OrganizationalBelief[];
  revisions: OrganizationalBeliefRevision[];
} {
  const existingBeliefs = params.existingBeliefs ?? [];
  const incomingBeliefs = params.incomingBeliefs ?? [];

  const beliefMap = new Map<string, OrganizationalBelief>();
  const revisions: OrganizationalBeliefRevision[] = [];

  for (const belief of existingBeliefs) {
    beliefMap.set(belief.id, belief);
  }

  for (const incomingBelief of incomingBeliefs) {
    const existingBelief = beliefMap.get(incomingBelief.id);

    if (!existingBelief) {
      beliefMap.set(incomingBelief.id, {
        ...incomingBelief,
        trend: "strengthening",
        lastUpdatedAt: params.now,
      });

      revisions.push({
        beliefId: incomingBelief.id,
        previousConfidence: 0,
        revisedConfidence: incomingBelief.confidence,
        trend: "strengthening",
        reason:
          "A new organizational belief emerged from newly inferred mechanisms.",
      });

      continue;
    }

    const { belief, revision } = mergeBelief({
      existingBelief,
      incomingBelief,
      now: params.now,
    });

    beliefMap.set(belief.id, belief);
    revisions.push(revision);
  }

  return {
    beliefs: Array.from(beliefMap.values()).sort(
      (a, b) => b.confidence - a.confidence,
    ),
    revisions,
  };
}