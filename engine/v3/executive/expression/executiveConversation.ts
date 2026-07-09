import type {
  ExecutiveConversationSection,
  ExecutiveDashboardNarrative,
} from "../buildExecutiveDashboard";

import type { ExecutiveState } from "../executiveState";
import type { ExecutiveInterpretation } from "../interpretations/executiveInterpretationTypes";

import {
  translateExecutiveTitle,
  translateExecutiveSummary,
} from "./executiveLanguage";

import { executiveVoice } from "./executiveVoice";

export function buildSinceLastSpoke(
  state: ExecutiveState,
): ExecutiveConversationSection {
  const changedItems = state.whatChanged.slice(0, 3).map(
    (item) =>
      `${translateExecutiveTitle(item.title)} — ${translateExecutiveSummary(
        item.summary,
      )}`,
  );

  const attentionItems = state.leadershipAttention.slice(0, 2).map(
    (item) =>
      `${translateExecutiveTitle(item.title)} — ${translateExecutiveSummary(
        item.reason,
      )}`,
  );

  return {
    eyebrow: "Since We Last Spoke",
    headline: executiveVoice.sinceLastSpokeHeadline(),
    summary: executiveVoice.sinceLastSpokeSummary(state.lastInvestigation),
    items: [...changedItems, ...attentionItems].slice(0, 4),
  };
}

export function buildCurrentStory(
  state: ExecutiveState,
  narratives: ExecutiveDashboardNarrative[],
  interpretation: ExecutiveInterpretation,
): ExecutiveConversationSection {
  const leadNarrative = narratives[0];

  return {
    eyebrow: "Current Explanation",
    headline:
      leadNarrative?.headline ??
      executiveVoice.currentStoryHeadline(translateExecutiveTitle(state.headline)),
    summary: interpretation.currentExplanation,
    items: [
      interpretation.explanationEvolution,
      interpretation.confidenceNarrative,
      interpretation.remainingUncertainty,
    ],
  };
}

export function buildLeadershipConversation(
  interpretation: ExecutiveInterpretation,
): ExecutiveConversationSection {
  return {
    eyebrow: "Why Discovery Believes It",
    headline: executiveVoice.leadershipHeadline(),
    summary: interpretation.executiveSummary,
    items: [
      interpretation.confidenceNarrative,
      interpretation.competingExplanationNarrative,
      interpretation.evidenceThatCouldChangeTheExplanation,
    ],
  };
}

export function buildActionPlan(
  state: ExecutiveState,
): ExecutiveConversationSection {
  const action = state.nextRecommendedAction;

  const actionSummary =
    action && "summary" in action && typeof action.summary === "string"
      ? action.summary
      : undefined;

  const actionReason =
    action && "reason" in action && typeof action.reason === "string"
      ? action.reason
      : undefined;

  const actionDescription =
    action && "description" in action && typeof action.description === "string"
      ? action.description
      : undefined;

  return {
    eyebrow: "Action Plan",
    headline: action?.title ?? executiveVoice.actionHeadline(),
    summary: executiveVoice.actionSummary(
      actionReason ?? actionDescription ?? actionSummary,
    ),
    items: [
      actionSummary ??
        actionDescription ??
        "Identify the highest-value missing evidence.",
      interpretationFallbackAction(),
      "Determine whether the current explanation is strengthening, stabilizing, or weakening.",
    ],
  };
}

function interpretationFallbackAction(): string {
  return "Gather evidence that could confirm, weaken, or revise Discovery's current explanation.";
}

export function buildExploreUnderstanding(
  state: ExecutiveState,
): ExecutiveConversationSection {
  const conditionCount = state.whatChanged.length;
  const mechanismCount = state.expandable.mechanisms.length;
  const evidenceCount = state.expandable.evidence.length;

  return {
    eyebrow: "Explore Understanding",
    headline: executiveVoice.exploreHeadline(),
    summary: executiveVoice.exploreSummary(),
    items: [
      `${conditionCount} organizational conditions available for review.`,
      `${mechanismCount} operating mechanisms available for inspection.`,
      `${evidenceCount} remembered evidence signals available for exploration.`,
      "Every explanation can be traced back through supporting evidence, mechanisms, concepts, and reasoning.",
    ],
  };
}