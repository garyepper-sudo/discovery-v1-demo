import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

export type EpistemicAgreementAnalysis = {
  evidenceCount: number;

  contradictionCount: number;

  contradictionDensity: number;

  averageContradictionConfidence: number;

  weightedContradictionPressure: number;

  agreementScore: number;

  status:
    | "high-agreement"
    | "mixed"
    | "low-agreement";

  confidenceLimiters: string[];
};

export type AnalyzeEpistemicAgreementInput = {
  runtime:
    OrganizationRuntime;
};

type AgreementContradiction = {
  confidence?: number;

  severity?:
    | "weak"
    | "moderate"
    | "strong";
};

type AgreementMemory =
  OrganizationRuntime["memory"] & {
    understandingState?: {
      evidence?: unknown[];

      contradictions?:
        AgreementContradiction[];
    };
  };

function clamp01(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

function severityWeight(
  severity:
    AgreementContradiction["severity"],
): number {
  switch (severity) {
    case "strong":
      return 1;

    case "moderate":
      return 0.7;

    case "weak":
      return 0.4;

    default:
      return 0.5;
  }
}

export function analyzeEpistemicAgreement({
  runtime,
}: AnalyzeEpistemicAgreementInput):
  EpistemicAgreementAnalysis {
  const memory =
    runtime.memory as
      AgreementMemory;

  const evidence =
    Array.isArray(
      memory
        .understandingState
        ?.evidence,
    )
      ? memory
          .understandingState
          .evidence
      : [];

  const contradictions =
    Array.isArray(
      memory
        .understandingState
        ?.contradictions,
    )
      ? memory
          .understandingState
          .contradictions
      : [];

  const evidenceCount =
    evidence.length;

  const contradictionCount =
    contradictions.length;

  const contradictionDensity =
    evidenceCount === 0
      ? 0
      : clamp01(
          contradictionCount /
            evidenceCount,
        );

  const contradictionConfidences =
    contradictions.map(
      (contradiction) =>
        clamp01(
          typeof contradiction
            .confidence ===
          "number"
            ? contradiction
                .confidence
            : 0.5,
        ),
    );

  const averageContradictionConfidence =
    contradictionConfidences
      .length === 0
      ? 0
      : contradictionConfidences
          .reduce(
            (
              sum,
              confidence,
            ) =>
              sum +
              confidence,
            0,
          ) /
        contradictionConfidences
          .length;

  const severityAdjustedPressure =
    contradictions.length === 0
      ? 0
      : contradictions
          .map(
            (
              contradiction,
              index,
            ) =>
              contradictionConfidences[
                index
              ] *
              severityWeight(
                contradiction
                  .severity,
              ),
          )
          .reduce(
            (
              sum,
              pressure,
            ) =>
              sum +
              pressure,
            0,
          ) /
        contradictions.length;

  const weightedContradictionPressure =
    clamp01(
      contradictionDensity *
        0.45 +
      averageContradictionConfidence *
        0.25 +
      severityAdjustedPressure *
        0.3,
    );

  const agreementScore =
    clamp01(
      1 -
        weightedContradictionPressure,
    );

  const status =
    agreementScore >= 0.8
      ? "high-agreement"
      : agreementScore >= 0.6
        ? "mixed"
        : "low-agreement";

  const confidenceLimiters:
    string[] = [];

  if (
    contradictionCount >
    0
  ) {
    confidenceLimiters.push(
      `${contradictionCount} unresolved contradiction(s) were detected in the investigation evidence.`,
    );
  }

  if (
    contradictionDensity >=
    0.15
  ) {
    confidenceLimiters.push(
      "Contradictions represent a meaningful share of the available evidence.",
    );
  }

  if (
    averageContradictionConfidence >=
    0.7
  ) {
    confidenceLimiters.push(
      "The detected contradictions are supported with relatively high confidence.",
    );
  }

  return {
    evidenceCount,
    contradictionCount,
    contradictionDensity,
    averageContradictionConfidence,
    weightedContradictionPressure,
    agreementScore,
    status,
    confidenceLimiters,
  };
}