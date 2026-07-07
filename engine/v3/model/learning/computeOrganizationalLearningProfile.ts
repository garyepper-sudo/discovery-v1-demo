export type LearningVelocityState =
  | "increasing"
  | "stable"
  | "plateauing"
  | "regressing";

export type LearningEventObjectType =
  | "belief"
  | "theory"
  | "understanding"
  | "mechanism"
  | "concept"
  | "memory";

export type LearningEventChangeType =
  | "new"
  | "strengthening"
  | "strengthened"
  | "stable"
  | "stabilized"
  | "weakening"
  | "weakened"
  | "contradicted"
  | "retired"
  | "merged"
  | "resolved"
  | "unchanged";

export type UnderstandingSnapshot = {
  id: string;
  investigationId: string;
  timestamp: string;

  company?: string;
  question?: string;

  memoryMaturityScore: number;
  organizationalUnderstandingScore: number;

  beliefCount: number;
  theoryCount: number;
  stableTheoryCount: number;

  mechanismCount: number;
  mechanismEdgeCount?: number;
  centralMechanismCount?: number;

  semanticCohortCount: number;
  semanticConceptCount?: number;
  conceptCandidateCount?: number;
  conceptualUnderstandingCount?: number;

  organizationalPhenomenonCount?: number;
  organizationalCapabilityCount?: number;
  understandingClusterCount?: number;

  executiveAssessmentConfidence?: number;
};

export type OrganizationalLearningEvent = {
  id: string;
  investigationId: string;
  timestamp: string;

  objectType: LearningEventObjectType | string;
  objectId: string;

  changeType: LearningEventChangeType | string;

  previousConfidence?: number;
  currentConfidence?: number;
  confidenceDelta?: number;

  reason: string;
};

export type OrganizationalLearningProfile = {
  investigationId: string;
  timestamp: string;

  investigationsObserved: number;

  understandingGrowth: number;
  memoryGrowth: number;

  beliefStability: number;
  theoryStability: number;
  knowledgeRetention: number;
  contradictionResolution: number;

  conceptReuse: number;
  mechanismReuse: number;

  learningVelocityScore: number;
  learningVelocity: LearningVelocityState;

  meaningfulLearningEventCount: number;
  strengthenedBeliefCount: number;
  weakenedBeliefCount: number;
  newBeliefCount: number;

  strengthenedTheoryCount: number;
  weakenedTheoryCount: number;
  stableTheoryCount: number;
  retiredTheoryCount: number;
  contradictedTheoryCount: number;

  strongestLearningAreas: string[];
  weakeningAreas: string[];
  recommendedEvidenceAreas: string[];

  summary: string;
};

export type ComputeOrganizationalLearningProfileInput = {
  snapshots: UnderstandingSnapshot[];
  learningEvents: OrganizationalLearningEvent[];
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function percent(value: number): number {
  return Math.round(clamp01(value) * 100);
}

function latest<T extends { timestamp: string }>(items: T[]): T | undefined {
  return [...items].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];
}

function previous<T extends { timestamp: string }>(
  items: T[],
  current: T,
): T | undefined {
  return [...items]
    .filter((item) => item.timestamp < current.timestamp)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];
}

function isPositiveChange(changeType: string): boolean {
  return [
    "new",
    "strengthening",
    "strengthened",
    "stable",
    "stabilized",
    "merged",
    "resolved",
  ].includes(changeType);
}

function isNegativeChange(changeType: string): boolean {
  return ["weakening", "weakened", "contradicted", "retired"].includes(
    changeType,
  );
}

function learningVelocityFromScore(score: number): LearningVelocityState {
  if (score >= 0.72) return "increasing";
  if (score >= 0.45) return "stable";
  if (score >= 0.18) return "plateauing";
  return "regressing";
}

function normalizedGrowth(current: number, previousValue?: number): number {
  if (previousValue === undefined) return 0;

  return clamp01((current - previousValue) / 100);
}

function countEvents(
  events: OrganizationalLearningEvent[],
  predicate: (event: OrganizationalLearningEvent) => boolean,
): number {
  return events.filter(predicate).length;
}

function objectLabel(id: string): string {
  return id
    .replace(/^belief[_:-]/, "")
    .replace(/^theory[:_-]/, "")
    .replace(/^concept[:_-]/, "")
    .replace(/^mechanism[:_-]/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function topObjectIds(events: OrganizationalLearningEvent[]): string[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (!isPositiveChange(event.changeType)) continue;

    const key = event.objectId;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => objectLabel(id));
}

function weakeningObjectIds(events: OrganizationalLearningEvent[]): string[] {
  return events
    .filter((event) => isNegativeChange(event.changeType))
    .slice(0, 5)
    .map((event) => objectLabel(event.objectId));
}

function recommendedEvidenceAreas(params: {
  currentSnapshot: UnderstandingSnapshot;
  learningEvents: OrganizationalLearningEvent[];
  theoryStability: number;
  beliefStability: number;
  mechanismReuse: number;
  conceptReuse: number;
}): string[] {
  const recommendations: string[] = [];

  if (params.theoryStability < 55) {
    recommendations.push("Evidence that confirms or falsifies dominant organizational theories");
  }

  if (params.beliefStability < 55) {
    recommendations.push("Repeated evidence connected to current organizational beliefs");
  }

  if (params.mechanismReuse < 55) {
    recommendations.push("Operating evidence showing whether mechanisms recur across investigations");
  }

  if (params.conceptReuse < 55) {
    recommendations.push("Documents that reuse or clarify recurring organizational concepts");
  }

  if ((params.currentSnapshot.executiveAssessmentConfidence ?? 0) < 0.7) {
    recommendations.push("Cross-functional evidence that improves executive confidence");
  }

  if (
    params.learningEvents.some((event) =>
      ["contradicted", "weakening", "weakened"].includes(event.changeType),
    )
  ) {
    recommendations.push("Disconfirming evidence to resolve weakened or contradicted assumptions");
  }

  return recommendations.length > 0
    ? recommendations
    : [
        "Meeting transcripts",
        "Decision logs",
        "Project retrospectives",
        "Customer support signals",
      ];
}

function buildSummary(params: {
  currentSnapshot: UnderstandingSnapshot;
  previousSnapshot?: UnderstandingSnapshot;
  understandingGrowth: number;
  memoryGrowth: number;
  strengthenedBeliefCount: number;
  strengthenedTheoryCount: number;
  weakenedBeliefCount: number;
  weakenedTheoryCount: number;
  learningVelocity: LearningVelocityState;
}): string {
  if (!params.previousSnapshot) {
    return `Discovery created its first longitudinal learning snapshot for this organization. Memory maturity is ${params.currentSnapshot.memoryMaturityScore} and organizational understanding is ${params.currentSnapshot.organizationalUnderstandingScore}%.`;
  }

  const parts: string[] = [];

  parts.push(
    `Discovery's learning velocity is ${params.learningVelocity}.`,
  );

  if (params.understandingGrowth > 0) {
    parts.push(`Organizational understanding improved by ${params.understandingGrowth} point(s).`);
  } else if (params.understandingGrowth < 0) {
    parts.push(`Organizational understanding decreased by ${Math.abs(params.understandingGrowth)} point(s).`);
  } else {
    parts.push("Organizational understanding held steady.");
  }

  if (params.memoryGrowth > 0) {
    parts.push(`Memory maturity improved by ${params.memoryGrowth} point(s).`);
  } else if (params.memoryGrowth < 0) {
    parts.push(`Memory maturity decreased by ${Math.abs(params.memoryGrowth)} point(s).`);
  } else {
    parts.push("Memory maturity held steady.");
  }

  if (params.strengthenedBeliefCount > 0 || params.strengthenedTheoryCount > 0) {
    parts.push(
      `${params.strengthenedBeliefCount} belief(s) and ${params.strengthenedTheoryCount} theor${
        params.strengthenedTheoryCount === 1 ? "y" : "ies"
      } strengthened or stabilized.`,
    );
  }

  if (params.weakenedBeliefCount > 0 || params.weakenedTheoryCount > 0) {
    parts.push(
      `${params.weakenedBeliefCount} belief(s) and ${params.weakenedTheoryCount} theor${
        params.weakenedTheoryCount === 1 ? "y" : "ies"
      } weakened or became contradicted.`,
    );
  }

  return parts.join(" ");
}

export function computeOrganizationalLearningProfile(
  input: ComputeOrganizationalLearningProfileInput,
): OrganizationalLearningProfile {
  const snapshots = [...input.snapshots].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const currentSnapshot = latest(snapshots);

  if (!currentSnapshot) {
    throw new Error(
      "Cannot compute organizational learning profile without at least one understanding snapshot.",
    );
  }

  const previousSnapshot = previous(snapshots, currentSnapshot);

  const currentEvents = input.learningEvents.filter(
    (event) => event.investigationId === currentSnapshot.investigationId,
  );

  const meaningfulEvents = currentEvents.filter(
    (event) =>
      isPositiveChange(event.changeType) ||
      isNegativeChange(event.changeType) ||
      Math.abs(event.confidenceDelta ?? 0) >= 0.02,
  );

  const strengthenedBeliefCount = countEvents(
    currentEvents,
    (event) =>
      event.objectType === "belief" && isPositiveChange(event.changeType),
  );

  const weakenedBeliefCount = countEvents(
    currentEvents,
    (event) =>
      event.objectType === "belief" && isNegativeChange(event.changeType),
  );

  const newBeliefCount = countEvents(
    currentEvents,
    (event) => event.objectType === "belief" && event.changeType === "new",
  );

  const strengthenedTheoryCount = countEvents(
    currentEvents,
    (event) =>
      event.objectType === "theory" && isPositiveChange(event.changeType),
  );

  const weakenedTheoryCount = countEvents(
    currentEvents,
    (event) =>
      event.objectType === "theory" &&
      ["weakening", "weakened"].includes(event.changeType),
  );

  const stableTheoryCount = countEvents(
    currentEvents,
    (event) =>
      event.objectType === "theory" &&
      ["stable", "stabilized", "strengthening"].includes(event.changeType),
  );

  const retiredTheoryCount = countEvents(
    currentEvents,
    (event) => event.objectType === "theory" && event.changeType === "retired",
  );

  const contradictedTheoryCount = countEvents(
    currentEvents,
    (event) =>
      event.objectType === "theory" && event.changeType === "contradicted",
  );

  const understandingGrowth = previousSnapshot
    ? currentSnapshot.organizationalUnderstandingScore -
      previousSnapshot.organizationalUnderstandingScore
    : 0;

  const memoryGrowth = previousSnapshot
    ? currentSnapshot.memoryMaturityScore - previousSnapshot.memoryMaturityScore
    : 0;

  const beliefStability = percent(
    currentSnapshot.beliefCount === 0
      ? 0
      : strengthenedBeliefCount / currentSnapshot.beliefCount,
  );

  const theoryStability = percent(
    currentSnapshot.theoryCount === 0
      ? 0
      : currentSnapshot.stableTheoryCount / currentSnapshot.theoryCount,
  );

  const knowledgeRetention = percent(
    previousSnapshot
      ? currentSnapshot.beliefCount / Math.max(1, previousSnapshot.beliefCount)
      : currentSnapshot.beliefCount > 0
        ? 0.35
        : 0,
  );

  const contradictionResolution = percent(
    currentEvents.length === 0
      ? 0
      : countEvents(currentEvents, (event) => event.changeType === "resolved") /
          currentEvents.length,
  );

  const conceptReuse = percent(
    previousSnapshot
      ? currentSnapshot.conceptCandidateCount
        ? Math.min(
            currentSnapshot.conceptCandidateCount,
            previousSnapshot.conceptCandidateCount ?? 0,
          ) / currentSnapshot.conceptCandidateCount
        : 0
      : currentSnapshot.conceptCandidateCount
        ? 0.35
        : 0,
  );

  const mechanismReuse = percent(
    previousSnapshot
      ? currentSnapshot.mechanismCount
        ? Math.min(
            currentSnapshot.mechanismCount,
            previousSnapshot.mechanismCount,
          ) / currentSnapshot.mechanismCount
        : 0
      : currentSnapshot.mechanismCount
        ? 0.35
        : 0,
  );

  const learningVelocityScore = percent(
    average([
      normalizedGrowth(
        currentSnapshot.organizationalUnderstandingScore,
        previousSnapshot?.organizationalUnderstandingScore,
      ),
      normalizedGrowth(
        currentSnapshot.memoryMaturityScore,
        previousSnapshot?.memoryMaturityScore,
      ),
      clamp01(meaningfulEvents.length / 8),
      clamp01(strengthenedBeliefCount / Math.max(1, currentSnapshot.beliefCount)),
      clamp01(stableTheoryCount / Math.max(1, currentSnapshot.theoryCount)),
    ]),
  );

  const learningVelocity = learningVelocityFromScore(
    learningVelocityScore / 100,
  );

  const recommendations = recommendedEvidenceAreas({
    currentSnapshot,
    learningEvents: currentEvents,
    theoryStability,
    beliefStability,
    mechanismReuse,
    conceptReuse,
  });

  return {
    investigationId: currentSnapshot.investigationId,
    timestamp: currentSnapshot.timestamp,

    investigationsObserved: snapshots.length,

    understandingGrowth,
    memoryGrowth,

    beliefStability,
    theoryStability,
    knowledgeRetention,
    contradictionResolution,

    conceptReuse,
    mechanismReuse,

    learningVelocityScore,
    learningVelocity,

    meaningfulLearningEventCount: meaningfulEvents.length,

    strengthenedBeliefCount,
    weakenedBeliefCount,
    newBeliefCount,

    strengthenedTheoryCount,
    weakenedTheoryCount,
    stableTheoryCount,
    retiredTheoryCount,
    contradictedTheoryCount,

    strongestLearningAreas: topObjectIds(currentEvents),
    weakeningAreas: weakeningObjectIds(currentEvents),
    recommendedEvidenceAreas: recommendations,

    summary: buildSummary({
      currentSnapshot,
      previousSnapshot,
      understandingGrowth,
      memoryGrowth,
      strengthenedBeliefCount,
      strengthenedTheoryCount,
      weakenedBeliefCount,
      weakenedTheoryCount,
      learningVelocity,
    }),
  };
}

function average(values: number[]): number {
  const valid = values.filter(Number.isFinite);

  if (valid.length === 0) return 0;

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}