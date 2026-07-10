import type { DiscoveryV3Result } from "../../../engine/v3/types";
import type {
  ExecutiveAttentionSeverity,
  ExecutiveEvolutionMilestone,
  ExecutiveProjection,
} from "./ExecutiveProjection";

function toPercentage(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) {
    return 0;
  }

  const percentage = value <= 1 ? value * 100 : value;

  return Math.round(Math.max(0, Math.min(100, percentage)));
}

function deriveMindStatus(result: DiscoveryV3Result): string {
  const maturity = toPercentage(result.organismState?.maturity);

  if (maturity >= 80) {
    return "Established";
  }

  if (maturity >= 55) {
    return "Developing";
  }

  return "Learning";
}

function buildExecutiveAttention(
  result: DiscoveryV3Result,
): ExecutiveProjection["executiveAttention"] {
  const primaryContradiction = [...result.contradictions].sort(
    (left, right) => {
      const leftPriority = left.priority?.total ?? 0;
      const rightPriority = right.priority?.total ?? 0;

      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
      }

      return right.confidence - left.confidence;
    },
  )[0];

  if (primaryContradiction) {
    const severity: ExecutiveAttentionSeverity =
      primaryContradiction.severity === "strong"
        ? "high"
        : primaryContradiction.severity === "moderate"
          ? "medium"
          : "low";

    return {
      title: primaryContradiction.title,
      summary: primaryContradiction.explanation,
      severity,
    };
  }

  const uncertainty = toPercentage(result.organismState?.uncertainty);

  if (uncertainty >= 70) {
    return {
      title: "Understanding remains highly uncertain",
      summary:
        "Discovery has formed a leading view, but substantial uncertainty remains and additional evidence could materially change it.",
      severity: "high",
    };
  }

  if (uncertainty >= 40) {
    return {
      title: "Important uncertainty remains",
      summary:
        "Discovery has formed a current understanding, but unresolved questions still deserve executive attention.",
      severity: "medium",
    };
  }

  return {
    title: "No urgent contradiction detected",
    summary:
      "Discovery has not identified a major unresolved tension requiring immediate executive attention.",
    severity: "low",
  };
}

function buildEvolutionMilestones(
  result: DiscoveryV3Result,
  confidence: number,
  mindStatus: string,
): ExecutiveEvolutionMilestone[] {
  const milestones: ExecutiveEvolutionMilestone[] = [];

  const firstSignal = result.signals[0];
  const firstTheme = result.themes[0];
  const firstEmergenceEvent = result.emergenceEvents[0];

  if (firstSignal) {
    milestones.push({
      id: `signal-${firstSignal.id}`,
      label: "Signal",
      description: firstSignal.title,
      isCurrent: false,
    });
  }

  if (firstTheme) {
    milestones.push({
      id: `theme-${firstTheme.id}`,
      label: "Pattern",
      description: firstTheme.title,
      isCurrent: false,
    });
  }

  if (firstEmergenceEvent) {
    milestones.push({
      id: `emergence-${firstEmergenceEvent.id}`,
      label: "Emergence",
      description: firstEmergenceEvent.title,
      isCurrent: false,
    });
  }

  milestones.push({
    id: "current-understanding",
    label: "Today",
    description: `${confidence}% confidence · ${mindStatus}`,
    isCurrent: true,
  });

  return milestones;
}

export function buildExecutiveProjection(
  result: DiscoveryV3Result,
): ExecutiveProjection {
  const primaryBelief = result.beliefs[0];
  const primaryUnderstanding = result.understanding[0];
  const executiveUnderstanding = result.executiveUnderstanding;

  const confidence = toPercentage(
    executiveUnderstanding.confidence ??
      primaryBelief?.confidence ??
      primaryUnderstanding?.confidence,
  );

  const mindStatus = deriveMindStatus(result);

  return {
    workspace: {
      title: "Current Understanding",
      status: "Active",
      updatedLabel: null,
    },

    currentUnderstanding: {
      belief:
        executiveUnderstanding.headline ||
        primaryBelief?.headline ||
        primaryUnderstanding?.title ||
        "Discovery is still forming its current understanding.",

      mindStatus,

      confidence,

      organizationalCoherence: toPercentage(
        result.organismState?.coherence,
      ),
    },

    explanation: {
      why:
        executiveUnderstanding.explanation ||
        primaryBelief?.explanation ||
        primaryUnderstanding?.summary ||
        "Discovery has not yet formed a complete explanation.",

      whatCouldChangeThis:
        executiveUnderstanding.openQuestions[0] ||
        primaryBelief?.nextQuestions[0] ||
        primaryBelief?.concerns[0] ||
        primaryUnderstanding?.unknowns[0] ||
        "Additional evidence could change this understanding.",

      nextMove:
        executiveUnderstanding.nextMoves[0] ||
        primaryUnderstanding?.recommendations[0] ||
        "Continue gathering evidence around the leading explanation.",
    },

    executiveAttention: buildExecutiveAttention(result),

    evolution: {
      milestones: buildEvolutionMilestones(
        result,
        confidence,
        mindStatus,
      ),
    },
  };
}