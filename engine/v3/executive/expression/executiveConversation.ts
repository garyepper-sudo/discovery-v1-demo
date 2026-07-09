import type {
  ExecutiveConversationSection,
  ExecutiveDashboardNarrative,
} from "../buildExecutiveDashboard";

import type { ExecutiveState } from "../executiveState";

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
): ExecutiveConversationSection {
  const leadNarrative = narratives[0];

  return {
    eyebrow: "Current Organizational Story",
    headline:
      leadNarrative?.headline ??
      executiveVoice.currentStoryHeadline(translateExecutiveTitle(state.headline)),
    summary: executiveVoice.currentStorySummary(
      leadNarrative?.observation ?? translateExecutiveSummary(state.summary),
    ),
    items: narratives
      .slice(0, 3)
      .map((narrative) => translateExecutiveSummary(narrative.businessImpact)),
  };
}

export function buildLeadershipConversation(
  narratives: ExecutiveDashboardNarrative[],
): ExecutiveConversationSection {
  const questions = narratives
    .slice(0, 3)
    .map((narrative) =>
      translateExecutiveSummary(narrative.executiveConversation),
    );

  return {
    eyebrow: "Leadership Conversation",
    headline: executiveVoice.leadershipHeadline(),
    summary: executiveVoice.leadershipSummary(),
    items:
      questions.length > 0
        ? questions
        : [
            "What evidence would increase confidence in this pattern?",
            "Which assumptions should leadership challenge next?",
            "Which decisions could be informed by additional investigation?",
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
      "Strengthen confidence in the organization's most important operating patterns.",
      "Determine whether the current organizational story is strengthening, stabilizing, or weakening.",
    ],
  };
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
      "Every conclusion can be traced back through supporting evidence, mechanisms, concepts, and reasoning.",
    ],
  };
}