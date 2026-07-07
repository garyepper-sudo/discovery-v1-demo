import type {
  OrganizationalTheoryEvolution,
  UnderstandingEvolution,
} from "./organizationalTheories";

type BeliefRevision = {
  beliefId?: string;
  previousConfidence?: number;
  revisedConfidence?: number;
  currentConfidence?: number;
  delta?: number;
  trend?: string;
  reason?: string;
};

export function buildUnderstandingEvolution(params: {
  beliefRevisions: BeliefRevision[];
  theoryEvolution: OrganizationalTheoryEvolution[];
}): UnderstandingEvolution {
  const strengthened = [
    ...params.beliefRevisions
      .filter((revision) => revision.trend === "strengthening")
      .map((revision) => revision.beliefId)
      .filter(isString),
    ...params.theoryEvolution
      .filter((evolution) =>
        ["strengthening", "stable"].includes(evolution.status),
      )
      .map((evolution) => evolution.theoryId),
  ];

  const weakened = [
    ...params.beliefRevisions
      .filter((revision) => revision.trend === "weakening")
      .map((revision) => revision.beliefId)
      .filter(isString),
    ...params.theoryEvolution
      .filter((evolution) => evolution.status === "weakening")
      .map((evolution) => evolution.theoryId),
  ];

  const retired = params.theoryEvolution
    .filter((evolution) => evolution.status === "retired")
    .map((evolution) => evolution.theoryId);

  const newlyDiscovered = params.theoryEvolution
    .filter((evolution) => evolution.status === "new")
    .map((evolution) => evolution.theoryId);

  const contradicted = params.theoryEvolution
    .filter((evolution) => evolution.status === "contradicted")
    .map((evolution) => evolution.theoryId);

  return {
    strengthened: unique(strengthened),
    weakened: unique(weakened),
    retired: unique(retired),
    new: unique(newlyDiscovered),
    merged: [],
    contradicted: unique(contradicted),
    summary: buildSummary({
      strengthenedCount: strengthened.length,
      weakenedCount: weakened.length,
      retiredCount: retired.length,
      newCount: newlyDiscovered.length,
      contradictedCount: contradicted.length,
    }),
  };
}

function buildSummary(params: {
  strengthenedCount: number;
  weakenedCount: number;
  retiredCount: number;
  newCount: number;
  contradictedCount: number;
}): string {
  const parts: string[] = [];

  if (params.strengthenedCount > 0) {
    parts.push(`${params.strengthenedCount} understandings strengthened`);
  }

  if (params.newCount > 0) {
    parts.push(`${params.newCount} new theories emerged`);
  }

  if (params.weakenedCount > 0) {
    parts.push(`${params.weakenedCount} understandings weakened`);
  }

  if (params.retiredCount > 0) {
    parts.push(`${params.retiredCount} obsolete theories retired`);
  }

  if (params.contradictedCount > 0) {
    parts.push(`${params.contradictedCount} theories contradicted`);
  }

  return parts.length > 0
    ? parts.join(", ") + "."
    : "Discovery found no major change in organizational understanding.";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}