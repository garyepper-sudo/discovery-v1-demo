import type { FocusedUnderstanding } from "./ExecutiveBriefing";

export type ExecutiveNarrative = {
  headline: string;
  summary: string;
  confidenceNarrative: string;
  whyItMatters: string;
  learningQuestion: string;
  recommendedEvidence: string[];
  recommendedConnections: string[];
  confidenceGain: number;
};

function cleanTitle(value: string | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "this organizational pattern";
}

export function buildExecutiveNarrative(
  focusedUnderstanding?: FocusedUnderstanding | null,
): ExecutiveNarrative {
  const title = cleanTitle(focusedUnderstanding?.title);
  const lower = title.toLowerCase();

  if (lower.includes("decision")) {
    return {
      headline:
        "Discovery revised its explanation of how decisions move through the organization.",

      summary:
        "Discovery increasingly explains execution speed through decision ownership rather than isolated approval bottlenecks.",

      confidenceNarrative:
        "Independent investigations are reinforcing the same explanation, making fragmented decision ownership a stronger explanation for organizational performance.",

      whyItMatters:
        "Execution quality increasingly appears to depend on how decisions move between Product, Sales, Operations, and Leadership—not simply how quickly approvals occur.",

      learningQuestion:
        "Discovery has not yet determined whether inconsistent decision ownership is the root cause or whether deeper factors such as technical debt or shifting priorities are producing the same behavior.",

      recommendedEvidence: [
        "Leadership Meeting Notes",
        "Customer Interview Summaries",
        "Product Roadmap Updates",
      ],

      recommendedConnections: [
        "Google Drive",
        "Slack",
        "Jira",
        "Notion",
      ],

      confidenceGain: 18,
    };
  }

  if (lower.includes("leadership")) {
    return {
      headline:
        "Discovery refined its explanation of leadership behavior.",

      summary:
        "Recent investigations suggest leadership decisions are becoming more consistent, although execution teams do not yet appear to share the same operating model.",

      confidenceNarrative:
        "Multiple observations support the same explanation, increasing confidence without eliminating important uncertainty.",

      whyItMatters:
        "Leadership consistency appears to improve strategic alignment, but Discovery cannot yet conclude that operational execution has improved as a result.",

      learningQuestion:
        "Discovery would revise this explanation if future investigations show leadership consistency improving while execution performance remains unchanged.",

      recommendedEvidence: [
        "Leadership Meeting Notes",
        "Board Decks",
        "Quarterly Planning Documents",
      ],

      recommendedConnections: [
        "Google Drive",
        "Slack",
        "Notion",
        "Microsoft Teams",
      ],

      confidenceGain: 16,
    };
  }

  return {
    headline:
      "Discovery refined its explanation of the organization.",

    summary:
      "Recent investigations strengthened Discovery's current explanation, although important uncertainty remains.",

    confidenceNarrative:
      "Discovery is gradually replacing isolated observations with a more coherent explanation of how the organization operates.",

    whyItMatters:
      "The goal is not simply to detect patterns, but to develop explanations that continue improving as new organizational evidence becomes available.",

    learningQuestion:
      "What new evidence would most likely challenge Discovery's current explanation of this organizational behavior?",

    recommendedEvidence: [
      "Leadership Meeting Notes",
      "Board Decks",
      "Research Reports",
    ],

    recommendedConnections: [
      "Google Drive",
      "Slack",
      "Notion",
      "Microsoft Teams",
    ],

    confidenceGain: 16,
  };
}