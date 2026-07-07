type ExecutiveLeverage = "high" | "medium" | "low";

export type InvestigationOpportunity = {
  id: string;
  topic: string;
  reason: string;
  expectedConfidenceGain: number;
  executiveLeverage: ExecutiveLeverage;
  affectedConditions: string[];
  missingEvidence: string[];
  suggestedExecutiveQuestion: string;
};

type OrganizationalConditionWithUncertainty = {
  id: string;
  name: string;
  domain: string;
  status?: string;
  priority?: string;
  confidence?: number;
  strength?: number;
  uncertaintySummary?: string;
  confidenceLimiters?: string[];
  missingEvidence?: string[];
};

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value: string): string {
  return normalize(value).replace(/\s+/g, "-");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function numericPriority(value: string | undefined): number {
  if (value === "critical") return 1;
  if (value === "high") return 0.85;
  if (value === "medium") return 0.6;
  if (value === "low") return 0.35;
  return 0.4;
}

function inferTopic(evidence: string): string {
  const text = normalize(evidence);

  if (
    text.includes("decision") ||
    text.includes("approval") ||
    text.includes("authority") ||
    text.includes("escalation")
  ) {
    return "Decision Authority";
  }

  if (
    text.includes("handoff") ||
    text.includes("ownership") ||
    text.includes("cross functional") ||
    text.includes("between teams")
  ) {
    return "Cross-Functional Handoffs";
  }

  if (
    text.includes("documentation") ||
    text.includes("knowledge") ||
    text.includes("memory") ||
    text.includes("reuse")
  ) {
    return "Knowledge Preservation";
  }

  if (
    text.includes("workload") ||
    text.includes("capacity") ||
    text.includes("delivery") ||
    text.includes("prioritization")
  ) {
    return "Execution Capacity";
  }

  if (
    text.includes("learning") ||
    text.includes("feedback") ||
    text.includes("repeated problems") ||
    text.includes("process improvements")
  ) {
    return "Learning Loops";
  }

  if (
    text.includes("strategy") ||
    text.includes("priorities") ||
    text.includes("tradeoffs") ||
    text.includes("strategic")
  ) {
    return "Strategic Alignment";
  }

  if (
    text.includes("roles") ||
    text.includes("workflow") ||
    text.includes("operating expectations") ||
    text.includes("operating model")
  ) {
    return "Operating Model Clarity";
  }

  if (
    text.includes("belief") ||
    text.includes("experience") ||
    text.includes("consistently experience")
  ) {
    return "Organizational Experience";
  }

  if (
    text.includes("longitudinal") ||
    text.includes("persistent") ||
    text.includes("improving") ||
    text.includes("deteriorating")
  ) {
    return "Condition Persistence";
  }

  return "Operating Evidence";
}

function suggestedQuestion(topic: string): string {
  if (topic === "Decision Authority") {
    return "How are important operational decisions approved today, and which decisions still require escalation?";
  }

  if (topic === "Cross-Functional Handoffs") {
    return "Where do cross-functional handoffs most often slow down, and who owns each handoff?";
  }

  if (topic === "Knowledge Preservation") {
    return "Where does critical operational knowledge live today, and how reliably is it reused?";
  }

  if (topic === "Execution Capacity") {
    return "Where is current work demand exceeding the organization's available capacity or focus?";
  }

  if (topic === "Learning Loops") {
    return "When recurring problems appear, how are they converted into reusable process improvements?";
  }

  if (topic === "Strategic Alignment") {
    return "Where are teams interpreting priorities differently, and how are tradeoffs resolved?";
  }

  if (topic === "Operating Model Clarity") {
    return "Which roles, workflows, or decision rights remain unclear in day-to-day execution?";
  }

  if (topic === "Organizational Experience") {
    return "Where do people consistently experience this condition in day-to-day work?";
  }

  if (topic === "Condition Persistence") {
    return "Has this condition appeared repeatedly over time, or is it tied to a recent situation?";
  }

  return "What operating evidence would most clarify this organizational condition?";
}

function leverageLabel(score: number): ExecutiveLeverage {
  if (score >= 0.75) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

export function buildInvestigationOpportunities(
  conditions: OrganizationalConditionWithUncertainty[],
): InvestigationOpportunity[] {
  const grouped = new Map<
    string,
    {
      topic: string;
      evidence: string[];
      affectedConditions: string[];
      totalScore: number;
      maxScore: number;
    }
  >();

  for (const condition of conditions) {
    const missingEvidence = condition.missingEvidence ?? [];

    for (const evidence of missingEvidence) {
      const topic = inferTopic(evidence);
      const key = slug(topic);

      const priorityScore = numericPriority(condition.priority);
      const uncertaintyScore = 1 - (condition.confidence ?? 0.5);
      const strengthScore = condition.strength ?? 0.5;
      const statusScore =
        condition.status === "deteriorating"
          ? 1
          : condition.status === "constrained"
            ? 0.8
            : condition.status === "weak" || condition.status === "unresolved"
              ? 0.7
              : 0.45;

      const score =
        priorityScore * 0.3 +
        uncertaintyScore * 0.3 +
        strengthScore * 0.2 +
        statusScore * 0.2;

      const existing = grouped.get(key) ?? {
        topic,
        evidence: [],
        affectedConditions: [],
        totalScore: 0,
        maxScore: 0,
      };

      existing.evidence.push(evidence);
      existing.affectedConditions.push(condition.name);
      existing.totalScore += score;
      existing.maxScore = Math.max(existing.maxScore, score);

      grouped.set(key, existing);
    }
  }

  return Array.from(grouped.values())
    .map((item) => {
      const affectedConditions = unique(item.affectedConditions);
      const missingEvidence = unique(item.evidence).slice(0, 5);

      const breadthScore = Math.min(1, affectedConditions.length / 4);
      const combinedScore = Math.min(
        1,
        item.maxScore * 0.65 + breadthScore * 0.35,
      );

      const expectedConfidenceGain = Math.round(
        Math.max(4, Math.min(15, combinedScore * 15)),
      );

      return {
        id: `investigation-${slug(item.topic)}`,
        topic: item.topic,
        reason:
          affectedConditions.length > 1
            ? `This investigation could reduce uncertainty across ${affectedConditions.join(
                ", ",
              )}.`
            : `This investigation could reduce uncertainty in ${affectedConditions[0] ?? "the current organizational assessment"}.`,
        expectedConfidenceGain,
        executiveLeverage: leverageLabel(combinedScore),
        affectedConditions,
        missingEvidence,
        suggestedExecutiveQuestion: suggestedQuestion(item.topic),
      };
    })
    .sort((a, b) => {
      if (b.expectedConfidenceGain !== a.expectedConfidenceGain) {
        return b.expectedConfidenceGain - a.expectedConfidenceGain;
      }

      return b.affectedConditions.length - a.affectedConditions.length;
    });
}