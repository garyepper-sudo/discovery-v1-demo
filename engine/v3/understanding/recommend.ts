import {
  PrioritizedUnderstanding,
  UnderstandingRecommendation,
} from "./types";

export function recommendFromUnderstanding(
  prioritized: PrioritizedUnderstanding
): UnderstandingRecommendation {
  return {
    nextQuestion: buildNextQuestion(prioritized),
    mondayMove: buildMondayMove(prioritized),
    watchSignal: buildWatchSignal(prioritized),
  };
}

function buildNextQuestion(prioritized: PrioritizedUnderstanding): string {
  if (prioritized.primaryContradiction?.unresolvedQuestion) {
    return prioritized.primaryContradiction.unresolvedQuestion;
  }

  if (prioritized.primaryTheme) {
    return `What evidence would confirm that ${cleanThemeName(
      prioritized.primaryTheme.title
    ).toLowerCase()} is becoming more important?`;
  }

  return "What new evidence would most change this understanding?";
}

function buildMondayMove(prioritized: PrioritizedUnderstanding): string {
  if (prioritized.primaryContradiction) {
    return "Have the team resolve the strongest tension before making this a settled operating assumption.";
  }

  if (prioritized.primaryTheme) {
    return `Ask the team to validate whether ${cleanThemeName(
      prioritized.primaryTheme.title
    ).toLowerCase()} is accelerating, stabilizing, or fading.`;
  }

  return "Review the strongest evidence and identify what is still missing.";
}

function buildWatchSignal(prioritized: PrioritizedUnderstanding): string {
  if (prioritized.primaryTheme) {
    return `Watch for new evidence connected to ${cleanThemeName(
      prioritized.primaryTheme.title
    ).toLowerCase()}.`;
  }

  return "Watch for repeated evidence that either strengthens or weakens this understanding.";
}

function cleanThemeName(title?: string): string {
  if (!title) return "";

  return title
    .replace(/\bPattern\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}