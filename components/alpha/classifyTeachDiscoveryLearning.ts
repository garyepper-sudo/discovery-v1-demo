export type AuthorizedLearningSnapshot = {
  currentUnderstanding: string;
  confidence: string;
  uncertainty: string;
  evidenceBasis: string;
  nextImprovement: string;
};

export type TruthfulLearningOutcome =
  | "changed"
  | "strengthened"
  | "underdetermined";

export type UnderstandingSupportState = "Emerging" | "Working" | "Supported";

export function understandingSupportState(
  qualitative: "Early" | "Moderate" | "High" | null,
): UnderstandingSupportState {
  if (qualitative === "High") return "Supported";
  if (qualitative === "Early") return "Emerging";
  return "Working";
}

export type VisibleUnderstandingDelta = {
  kind:
    | "material_revision"
    | "support_strengthened"
    | "support_weakened"
    | "uncertainty_changed"
    | "recommendation_changed"
    | "no_material_change"
    | "underdetermined";
  headline: string;
  detail: string;
};

export function visibleUnderstandingDelta(params: {
  outcome: TruthfulLearningOutcome;
  changedFields: string[];
}): VisibleUnderstandingDelta {
  if (params.outcome === "underdetermined") {
    return {
      kind: "underdetermined",
      headline: "Discovery still cannot distinguish the leading explanations.",
      detail: "What you shared was preserved, and the current understanding remains in place.",
    };
  }
  if (params.outcome === "strengthened") {
    return {
      kind: params.changedFields.includes("Evidence basis updated")
        ? "support_strengthened"
        : "no_material_change",
      headline: "Discovery incorporated what you shared.",
      detail: "The strongest current understanding remains unchanged.",
    };
  }
  if (params.changedFields.includes("Current understanding revised")) {
    return {
      kind: "material_revision",
      headline: "The current understanding was revised.",
      detail: "Discovery’s answer changed after incorporating the new evidence.",
    };
  }
  if (params.changedFields.includes("Remaining uncertainty updated")) {
    return {
      kind: "uncertainty_changed",
      headline: "What remains uncertain changed.",
      detail: "The current answer remains visible while Discovery updates what still needs to be resolved.",
    };
  }
  if (params.changedFields.includes("Next improvement updated")) {
    return {
      kind: "recommendation_changed",
      headline: "The next best improvement changed.",
      detail: "Discovery identified a different authorized opportunity to improve this understanding.",
    };
  }
  if (params.changedFields.includes("Confidence boundary updated")) {
    return {
      kind: "support_strengthened",
      headline: "The support for this understanding changed.",
      detail: "The current support state reflects the refreshed authorized product view.",
    };
  }
  return {
    kind: "no_material_change",
    headline: "Discovery incorporated what you shared.",
    detail: "The strongest current understanding remains unchanged.",
  };
}

export function classifyTruthfulLearningOutcome(params: {
  evidenceOutcome: "supported" | "underdetermined";
  before: AuthorizedLearningSnapshot;
  after: AuthorizedLearningSnapshot;
}): {
  outcome: TruthfulLearningOutcome;
  changedFields: string[];
} {
  const changedFields = [
    params.before.currentUnderstanding !== params.after.currentUnderstanding
      ? "Current understanding revised"
      : null,
    params.before.confidence !== params.after.confidence
      ? "Confidence boundary updated"
      : null,
    params.before.uncertainty !== params.after.uncertainty
      ? "Remaining uncertainty updated"
      : null,
    params.before.evidenceBasis !== params.after.evidenceBasis
      ? "Evidence basis updated"
      : null,
    params.before.nextImprovement !== params.after.nextImprovement
      ? "Next improvement updated"
      : null,
  ].filter((item): item is string => item !== null);

  if (params.evidenceOutcome === "underdetermined") {
    return { outcome: "underdetermined", changedFields };
  }
  return {
    outcome: changedFields.some((field) => field !== "Evidence basis updated")
      ? "changed"
      : "strengthened",
    changedFields,
  };
}
