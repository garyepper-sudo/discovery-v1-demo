import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

import type {
  ExecutiveProjection,
} from "./ExecutiveProjection";

export type ExecutiveCommunicationProjectionFields = Pick<
  ExecutiveProjection,
  | "currentUnderstanding"
  | "explanation"
  | "executiveAttention"
>;

function toPercentage(
  value: number,
): number {
  const normalized =
    value <= 1
      ? value * 100
      : value;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(normalized),
    ),
  );
}

function deriveMindStatus(
  communication:
    ExecutiveCommunication,
): string {
  switch (
    communication
      .confidence
      .label
  ) {
    case "high":
      return "Stable";

    case "moderate":
      return "Developing";

    case "developing":
      return "Emerging";

    case "low":
      return "Uncertain";
  }
}

function deriveAttentionSeverity(
  communication:
    ExecutiveCommunication,
): ExecutiveProjection["executiveAttention"]["severity"] {
  const worseningCount =
    communication
      .meaningfulChanges
      .filter(
        (change) =>
          change.direction ===
          "worsening",
      )
      .length;

  if (
    worseningCount >= 2 ||
    communication.forecast.confidence >=
      0.8
  ) {
    return "high";
  }

  if (
    worseningCount === 1 ||
    communication.forecast.confidence >=
      0.6
  ) {
    return "medium";
  }

  return "low";
}

/**
 * Maps canonical ExecutiveCommunication into the existing
 * ExecutiveProjection communication-facing fields.
 *
 * This adapter performs no new cognition and does not recreate executive
 * wording. It only reshapes canonical communication for the current UI
 * contract.
 */
export function buildProjectionFromExecutiveCommunication(
  communication:
    ExecutiveCommunication,
): ExecutiveCommunicationProjectionFields {
  const whatCouldChangeThis =
    communication
      .uncertainty
      ?.question ??
    communication
      .recommendation
      .evidenceThatCouldChangeRecommendation
      [0] ??
    communication
      .confidence
      .limiters
      [0] ??
    "Additional evidence could change this understanding.";

  const nextMove =
    communication
      .recommendation
      .actions
      [0] ??
    communication
      .recommendation
      .headline;

  return {
    currentUnderstanding: {
      belief:
        communication.headline,

      mindStatus:
        deriveMindStatus(
          communication,
        ),

      confidence:
        toPercentage(
          communication
            .confidence
            .value,
        ),

      organizationalCoherence:
        toPercentage(
          communication
            .confidence
            .value,
        ),
    },

    explanation: {
      why:
        communication
          .executiveSummary,

      whatCouldChangeThis,

      nextMove,
    },

    executiveAttention: {
      title:
        communication
          .recommendation
          .headline,

      summary:
        communication
          .executiveSummary,

      severity:
        deriveAttentionSeverity(
          communication,
        ),
    },
  };
}
