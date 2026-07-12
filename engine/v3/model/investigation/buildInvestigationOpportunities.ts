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

type OrganizationalLearningProfileLike = {
  learningVelocity?: string;
  learningVelocityScore?: number;
  beliefStability?: number;
  theoryStability?: number;
  knowledgeRetention?: number;
  understandingGrowth?: number;
  memoryGrowth?: number;
  recommendedEvidenceAreas?: string[];
};

type PreviousInvestigationOpportunityLike = {
  id?: string;
  topic?: string;
  expectedConfidenceGain?: number;
  affectedConditions?: string[];
};

export type InvestigationStrategyRevision = {
  mode:
    | "exploit"
    | "explore"
    | "challenge"
    | "preserve";

  repeatedTopicPenaltyMultiplier: number;
  knowledgePreservationBoost: number;
  learningLoopBoost: number;
  persistenceBoost: number;

  prioritizeContradictoryEvidence: boolean;
  prioritizeEvidenceDiversity: boolean;

  rationale: string[];
};

export type InvestigationOpportunityResult = {
  strategy: InvestigationStrategyRevision;
  opportunities: InvestigationOpportunity[];
};

type BuildInvestigationOpportunitiesInput = {
  conditions: OrganizationalConditionWithUncertainty[];
  previousLearningProfile?: OrganizationalLearningProfileLike;
  previousInvestigationOpportunities?: PreviousInvestigationOpportunityLike[];
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

function buildInvestigationStrategyRevision(
  previousLearningProfile:
    | OrganizationalLearningProfileLike
    | undefined,
): InvestigationStrategyRevision {
  if (!previousLearningProfile) {
    return {
      mode: "explore",
      repeatedTopicPenaltyMultiplier: 1,
      knowledgePreservationBoost: 0,
      learningLoopBoost: 0,
      persistenceBoost: 0,
      prioritizeContradictoryEvidence: false,
      prioritizeEvidenceDiversity: true,
      rationale: [
        "No prior learning profile is available, so Discovery should explore broadly.",
      ],
    };
  }

  const {
    learningVelocityScore = 50,
    beliefStability = 50,
    theoryStability = 50,
    knowledgeRetention = 50,
    memoryGrowth = 0,
  } = previousLearningProfile;

  const rationale: string[] = [];

  let mode: InvestigationStrategyRevision["mode"] =
    "explore";

  if (
    beliefStability >= 90 &&
    theoryStability >= 90
  ) {
    mode = "challenge";
    rationale.push(
      "Beliefs and theories are highly stable, so Discovery should seek disconfirming or competing evidence.",
    );
  } else if (knowledgeRetention < 50) {
    mode = "preserve";
    rationale.push(
      "Knowledge retention is low, so Discovery should prioritize evidence about organizational memory and reuse.",
    );
  } else if (learningVelocityScore >= 70) {
    mode = "exploit";
    rationale.push(
      "Learning velocity is strong, so Discovery can continue prioritizing the highest-value current evidence gaps.",
    );
  } else {
    rationale.push(
      "Learning velocity is moderate or low, so Discovery should diversify its investigation strategy.",
    );
  }

  if (memoryGrowth <= 0) {
    rationale.push(
      "Memory growth is flat, so longitudinal evidence should receive additional priority.",
    );
  }

  return {
    mode,

    repeatedTopicPenaltyMultiplier:
      mode === "explore" || mode === "challenge"
        ? 1.5
        : 1,

    knowledgePreservationBoost:
      knowledgeRetention < 50 ? 0.15 : 0,

    learningLoopBoost:
      learningVelocityScore < 50 ? 0.12 : 0,

    persistenceBoost:
      memoryGrowth <= 0 ? 0.08 : 0,

    prioritizeContradictoryEvidence:
      mode === "challenge",

    prioritizeEvidenceDiversity:
      mode === "explore" ||
      mode === "challenge",

    rationale,
  };
}

function repeatedTopicPenalty(
  topic: string,
  previousInvestigationOpportunities:
    | PreviousInvestigationOpportunityLike[]
    | undefined,
  strategy: InvestigationStrategyRevision,
): number {
  if (!previousInvestigationOpportunities?.length) {
    return 0;
  }

  const normalizedTopic = normalize(topic);

  const repeatCount =
    previousInvestigationOpportunities.filter(
      (opportunity) =>
        normalize(opportunity.topic) === normalizedTopic,
    ).length;

  let basePenalty = 0;

  if (repeatCount >= 3) {
    basePenalty = 0.2;
  } else if (repeatCount === 2) {
    basePenalty = 0.12;
  } else if (repeatCount === 1) {
    basePenalty = 0.06;
  }

  return (
    basePenalty *
    strategy.repeatedTopicPenaltyMultiplier
  );
}

function learningPriorityBoost(
  topic: string,
  strategy: InvestigationStrategyRevision,
): number {
  const normalizedTopic = normalize(topic);

  if (normalizedTopic === "knowledge preservation") {
    return strategy.knowledgePreservationBoost;
  }

  if (normalizedTopic === "learning loops") {
    return strategy.learningLoopBoost;
  }

  if (normalizedTopic === "condition persistence") {
    return strategy.persistenceBoost;
  }

  return 0;
}

export function buildInvestigationOpportunities({
  conditions,
  previousLearningProfile,
  previousInvestigationOpportunities,
}: BuildInvestigationOpportunitiesInput): InvestigationOpportunityResult {
  const strategy =
    buildInvestigationStrategyRevision(
      previousLearningProfile,
    );

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
            : condition.status === "weak" ||
                condition.status === "unresolved"
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

  const opportunities = Array.from(grouped.values())
    .map((item) => {
      const affectedConditions = unique(item.affectedConditions);
      const missingEvidence = unique(item.evidence).slice(0, 5);

      const breadthScore = Math.min(
        1,
        affectedConditions.length / 4,
      );

      const baseScore =
        item.maxScore * 0.65 +
        breadthScore * 0.35;

      const repetitionPenalty =
        repeatedTopicPenalty(
          item.topic,
          previousInvestigationOpportunities,
          strategy,
        );

      const adaptiveBoost =
        learningPriorityBoost(
          item.topic,
          strategy,
        );

      const combinedScore = Math.max(
        0,
        Math.min(
          1,
          baseScore -
            repetitionPenalty +
            adaptiveBoost,
        ),
      );

      const expectedConfidenceGain = Math.round(
        Math.max(
          4,
          Math.min(15, combinedScore * 15),
        ),
      );

      const reason = [
        affectedConditions.length > 1
          ? `This investigation could reduce uncertainty across ${affectedConditions.join(
              ", ",
            )}.`
          : `This investigation could reduce uncertainty in ${
              affectedConditions[0] ??
              "the current organizational assessment"
            }.`,

        repetitionPenalty > 0
          ? "Its priority was reduced because Discovery has recently recommended this investigation topic."
          : "",

        adaptiveBoost > 0
          ? "Its priority was increased because prior organizational learning indicates this evidence area may improve future understanding."
          : "",

        repetitionPenalty > 0 || adaptiveBoost > 0
          ? strategy.rationale[0] ?? ""
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: `investigation-${slug(item.topic)}`,
        topic: item.topic,
        reason,
        expectedConfidenceGain,
        executiveLeverage: leverageLabel(combinedScore),
        affectedConditions,
        missingEvidence,
        suggestedExecutiveQuestion:
          suggestedQuestion(item.topic),
      };
    })
    .sort((a, b) => {
      if (
        b.expectedConfidenceGain !==
        a.expectedConfidenceGain
      ) {
        return (
          b.expectedConfidenceGain -
          a.expectedConfidenceGain
        );
      }

      return (
        b.affectedConditions.length -
        a.affectedConditions.length
      );
    });

  return {
    strategy,
    opportunities,
  };
}
