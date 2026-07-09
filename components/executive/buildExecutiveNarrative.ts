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
      headline: `Discovery became more confident that ${title}.`,
      summary:
        "Recent evidence suggests this pattern is becoming more visible across the organization.",
      confidenceNarrative:
        "Discovery is seeing stronger signals that decision quality and decision flow are becoming more observable.",
      whyItMatters:
        "Decision flow affects execution speed, leadership alignment, and the organization's ability to respond to change.",
      learningQuestion:
        "Discovery has not yet determined whether this pattern is driven primarily by leadership behavior, customer pressure, or operating cadence.",
      recommendedEvidence: [
        "Leadership Meeting Notes",
        "Customer Interview Summaries",
        "Product Roadmap Updates",
      ],
      recommendedConnections: ["Google Drive", "Slack", "Jira", "Notion"],
      confidenceGain: 18,
    };
  }

  if (lower.includes("leadership")) {
    return {
      headline: `Discovery became more confident that ${title}.`,
      summary:
        "The current evidence suggests leadership behavior is becoming a meaningful organizational signal.",
      confidenceNarrative:
        "Discovery is tracking whether this leadership pattern is stable across decisions, meetings, and execution rhythms.",
      whyItMatters:
        "Leadership alignment influences clarity, prioritization, and the organization's ability to sustain momentum.",
      learningQuestion:
        "Discovery has not yet determined whether this alignment is durable or dependent on a small number of recent decisions.",
      recommendedEvidence: [
        "Leadership Meeting Notes",
        "Board Decks",
        "Quarterly Planning Documents",
      ],
      recommendedConnections: ["Google Drive", "Slack", "Notion", "Microsoft Teams"],
      confidenceGain: 16,
    };
  }

  return {
    headline: `Discovery became more confident that ${title}.`,
    summary:
      "Discovery identified this as a pattern worth continuing to watch as more organizational evidence accumulates.",
    confidenceNarrative:
      "Discovery is tracking whether this pattern represents a lasting capability or a temporary observation.",
    whyItMatters:
      "This understanding may help explain how the organization is changing over time.",
    learningQuestion:
      "Discovery needs more evidence to determine what is causing this pattern and whether it will persist.",
    recommendedEvidence: [
      "Leadership Meeting Notes",
      "Board Decks",
      "Research Reports",
    ],
    recommendedConnections: ["Google Drive", "Slack", "Notion", "Microsoft Teams"],
    confidenceGain: 16,
  };
}