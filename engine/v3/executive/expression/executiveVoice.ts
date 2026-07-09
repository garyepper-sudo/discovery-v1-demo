import type { ExecutiveExpressionContext } from "./executiveExpressionTypes";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const executiveVoice = {
  //
  // Section Headlines
  //
  sinceLastSpokeHeadline(): string {
    return "Discovery continued learning while you were away.";
  },

  currentStoryHeadline(subject?: string): string {
    return subject
      ? `Discovery strengthened its understanding of ${subject.toLowerCase()}.`
      : "Discovery strengthened its understanding of how the organization operates.";
  },

  leadershipHeadline(): string {
    return "Discovery identified the strategic conversations worth having next.";
  },

  actionHeadline(): string {
    return "Discovery identified the next investigation with the highest learning potential.";
  },

  exploreHeadline(): string {
    return "Every conclusion can be explored through Discovery's reasoning.";
  },

  uncertaintyHeadline(): string {
    return "Some important questions remain unresolved.";
  },

  //
  // Section Summaries
  //
  sinceLastSpokeSummary(lastInvestigation?: string): string {
    return lastInvestigation
      ? `Since ${lastInvestigation}, Discovery compared new evidence against its accumulated organizational understanding.`
      : "Discovery compared this investigation against accumulated organizational understanding.";
  },

  currentStorySummary(summary?: string): string {
    return (
      summary ??
      "Discovery continues connecting new evidence into persistent organizational patterns."
    );
  },

  leadershipSummary(): string {
    return "Rather than recommending decisions, Discovery highlights the questions most likely to improve organizational judgment.";
  },

  actionSummary(summary?: string): string {
    return (
      summary ??
      "Discovery recommends collecting the evidence most likely to strengthen organizational understanding."
    );
  },

  exploreSummary(): string {
    return "The executive briefing remains concise, while the complete organizational understanding remains available for deeper exploration.";
  },

  //
  // Executive Observations
  //
  observation(subject: string): string {
    return `Discovery noticed a meaningful pattern involving ${subject}.`;
  },

  strengthened(subject: string): string {
    return `Recent investigations strengthened Discovery's understanding of ${subject}.`;
  },

  confirmed(subject: string): string {
    return `Independent observations continue to reinforce ${subject}.`;
  },

  recognized(subject: string): string {
    return `Discovery recognized ${subject} as an important organizational pattern.`;
  },

  connected(a: string, b: string): string {
    return `Discovery connected ${a} with ${b}.`;
  },

  questioned(subject: string): string {
    return `Discovery continues to question whether ${subject}.`;
  },

  watching(subject: string): string {
    return `Discovery continues to watch ${subject}.`;
  },

  notYetDetermined(subject: string): string {
    return `Discovery has not yet determined ${subject}.`;
  },

  //
  // Confidence Narrative
  //
  confidenceStory(confidence?: number): string {
    if (confidence === undefined) {
      return "Discovery is continuing to gather evidence.";
    }

    if (confidence >= 0.9) {
      return "Multiple independent observations strongly reinforce this understanding.";
    }

    if (confidence >= 0.75) {
      return "Recent investigations strengthened this understanding.";
    }

    if (confidence >= 0.5) {
      return "Current evidence suggests this pattern, but additional investigation could refine it.";
    }

    return "Discovery is still collecting evidence before drawing stronger conclusions.";
  },

  //
  // Business Impact
  //
  businessImpact(impact: string): string {
    return capitalize(impact);
  },

  //
  // Learning
  //
  learningQuestion(question: string): string {
    return question.endsWith("?") ? question : `${question}?`;
  },

  executiveRecommendation(recommendation: string): string {
    return recommendation;
  },

  //
  // Conversation Flow
  //
  transition(nextSection: string): string {
    return `This naturally leads to ${nextSection.toLowerCase()}.`;
  },

  closingThought(): string {
    return "Discovery will continue refining its understanding as new evidence becomes available.";
  },

  introduction(_context?: ExecutiveExpressionContext): string {
    return "Discovery has been evaluating new information since your last review.";
  },
};