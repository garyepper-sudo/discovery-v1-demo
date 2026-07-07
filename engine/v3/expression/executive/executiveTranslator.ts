import type {
  ExecutiveAttentionItem,
  ExecutiveLearningSummary,
  ExecutiveLearningTimelineEntry,
} from "../../executive/executiveLearningSummary";

export type ExecutiveCommunication = {
  executiveName: string;
  executiveDescription: string;
  businessImpact: string;
  conversation: string;
};

const executiveTranslations: Record<string, ExecutiveCommunication> = {
  "leadership dependency": {
    executiveName: "Critical decisions depend on too few people.",
    executiveDescription:
      "Decision-making remains concentrated around a small number of leaders.",
    businessImpact:
      "Scaling becomes difficult because teams cannot move quickly without executive involvement.",
    conversation:
      "Which decisions currently require executive approval that should safely move closer to frontline leaders?",
  },

  "organizational continuity failure": {
    executiveName: "Knowledge transfer is becoming a business continuity risk.",
    executiveDescription:
      "Important organizational knowledge is not being preserved or transferred reliably.",
    businessImpact:
      "The organization becomes more vulnerable when key people leave, change roles, or become overloaded.",
    conversation:
      "Which critical knowledge areas would create the most disruption if their owners left tomorrow?",
  },

  "cross functional execution friction": {
    executiveName: "Teams are struggling to coordinate effectively.",
    executiveDescription:
      "Work is moving across functions with unnecessary friction, delays, or unclear ownership.",
    businessImpact:
      "Execution slows down because teams spend too much energy aligning instead of progressing.",
    conversation:
      "Where are handoffs between teams creating the most delay or confusion?",
  },
};

function normalizeKey(value?: string): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^belief[_:-]?/i, "")
    .replace(/^theory[_:-]?/i, "")
    .replace(/^concept-theory[_:-]?/i, "")
    .replace(/[_:-]+/g, " ")
    .replace(/\s+/g, " ");
}

function findExecutiveTranslation(
  item: ExecutiveAttentionItem,
): ExecutiveCommunication | undefined {
  return (
    executiveTranslations[normalizeKey(item.id)] ??
    executiveTranslations[normalizeKey(item.title)]
  );
}

export function translateExecutiveAttentionItem(
  item: ExecutiveAttentionItem,
): ExecutiveAttentionItem & {
  executiveCommunication: ExecutiveCommunication;
} {
  const translation = findExecutiveTranslation(item);

  if (translation) {
    return {
      ...item,
      title: translation.executiveName,
      reason: translation.executiveDescription,
      executiveCommunication: translation,
    };
  }

  return {
    ...item,
    executiveCommunication: {
      executiveName: item.title,
      executiveDescription: item.reason,
      businessImpact:
        "If left unaddressed, this condition may continue to slow organizational learning, coordination, or decision-making.",
      conversation:
        "What would need to change for this condition to improve over the next operating cycle?",
    },
  };
}

export function translateExecutiveTimelineEntry(
  entry: ExecutiveLearningTimelineEntry,
): ExecutiveLearningTimelineEntry {
  if (entry.summary.includes("Discovery recorded")) {
    return {
      ...entry,
      summary: "The organization established a new understanding baseline.",
    };
  }

  if (entry.summary.includes("Understanding changed")) {
    return {
      ...entry,
      summary:
        "The organization’s operating picture changed since the previous snapshot.",
    };
  }

  return entry;
}

export function buildExecutiveHeadline(
  summary: ExecutiveLearningSummary,
): string {
  const primaryCondition = summary.recommendedAttention?.[0];

  if (primaryCondition) {
    return translateExecutiveAttentionItem(primaryCondition).title;
  }

  if (summary.understanding.delta > 0) {
    return "The organization has a clearer operating picture than before.";
  }

  if (summary.newBeliefs > 0) {
    return "New organizational patterns are becoming visible.";
  }

  if (summary.stabilizedTheories > 0) {
    return "Several organizational patterns are now stable enough for executive review.";
  }

  return "The organization has an updated executive understanding snapshot.";
}

export function buildExecutiveSummary(
  summary: ExecutiveLearningSummary,
): string {
  const primaryCondition = summary.recommendedAttention?.[0];

  if (primaryCondition) {
    const translated = translateExecutiveAttentionItem(primaryCondition);
    return translated.executiveCommunication.businessImpact;
  }

  if (summary.timeline.length < 2) {
    return "The organization is still building enough learning history to describe meaningful change over time.";
  }

  return `Since the previous investigation, organizational understanding changed by ${summary.understanding.delta} points, with ${summary.strengthenedBeliefs} strengthened beliefs, ${summary.newBeliefs} new beliefs, and ${summary.stabilizedTheories} stable patterns now available for executive review.`;
}