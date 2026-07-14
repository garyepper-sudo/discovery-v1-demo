export type ExecutiveDecisionRecommendationStatus =
  | "proceed"
  | "do-not-proceed"
  | "investigate-further";

export type ExecutiveDecisionConditionOutcome = {
  conditionId: string;

  conditionName: string;

  outcome:
    | "improved"
    | "worsened"
    | "unchanged";

  strengthDelta: number;
};

export type ExecutiveDecisionOptionProjection = {
  /**
   * Stable identity of the generated intervention option.
   */
  optionId: string;

  /**
   * Stable identity of the canonical intervention.
   */
  interventionId: string;

  /**
   * Executive-facing intervention name.
   */
  title: string;

  /**
   * Concise explanation of the intervention.
   */
  description: string;

  /**
   * Why Discovery considered the intervention.
   */
  rationale: string;

  /**
   * Final rank among all evaluated options.
   */
  rank: number;

  /**
   * Normalized ranking score expressed as a percentage.
   */
  score: number;

  /**
   * Organizational benefit score expressed as a percentage.
   */
  organizationalBenefitScore: number;

  /**
   * Organizational risk score expressed as a percentage.
   */
  organizationalRiskScore: number;

  /**
   * Combined scenario and intervention confidence expressed as a percentage.
   */
  confidence: number;

  /**
   * Recommendation produced by the individual scenario.
   */
  scenarioRecommendation:
    ExecutiveDecisionRecommendationStatus;

  /**
   * Organizational outcomes that most distinguish this option.
   */
  conditionOutcomes:
    ExecutiveDecisionConditionOutcome[];

  /**
   * Reasons this option received its rank.
   */
  reasonsForRank: string[];

  /**
   * Assumptions underlying the intervention.
   */
  assumptions: string[];

  /**
   * Risks identified when the option was generated.
   */
  risks: string[];

  /**
   * Evidence still missing for this option.
   */
  missingEvidence: string[];
};

export type ExecutiveDecisionRecommendationProjection = {
  /**
   * Canonical recommendation status.
   */
  status:
    ExecutiveDecisionRecommendationStatus;

  /**
   * Recommendation confidence expressed as a percentage.
   */
  confidence: number;

  /**
   * Executive summary of Discovery's recommendation.
   */
  summary: string;

  /**
   * Recommended intervention identity.
   */
  recommendedInterventionId?: string;

  /**
   * Recommended intervention name.
   */
  recommendedInterventionTitle?: string;

  /**
   * Next-best intervention identity.
   */
  nextBestInterventionId?: string;

  /**
   * Next-best intervention name.
   */
  nextBestInterventionTitle?: string;

  /**
   * Why the selected intervention ranked first.
   */
  whyRecommended: string[];

  /**
   * Expected organizational benefits.
   */
  expectedBenefits: string[];

  /**
   * Expected trade-offs.
   */
  tradeOffs: string[];

  /**
   * Risks leadership should monitor.
   */
  risks: string[];

  /**
   * Assumptions supporting the recommendation.
   */
  assumptions: string[];

  /**
   * Evidence or changing circumstances that could alter the recommendation.
   */
  evidenceThatCouldChangeRecommendation: string[];
};

export type ExecutiveDecisionProjection = {
  /**
   * Stable identity of the Executive Decision.
   */
  executiveDecisionId: string;

  /**
   * Organization evaluated by the decision cycle.
   */
  organizationId: string;

  /**
   * Executive-facing decision title.
   */
  title: string;

  /**
   * Outcome leadership wants to achieve.
   */
  objective: string;

  /**
   * Why the decision matters.
   */
  rationale: string;

  /**
   * Period over which the decision should be evaluated.
   */
  timeHorizon:
    | "immediate"
    | "near-term"
    | "medium-term"
    | "long-term";

  /**
   * Executive constraints preserved by the decision cycle.
   */
  constraints: Array<{
    type: string;
    description: string;
    required: boolean;
  }>;

  /**
   * Success measures preserved by the decision cycle.
   */
  successMetrics: Array<{
    name: string;
    baseline?: number;
    target?: number;
    unit?: string;
    rationale?: string;
  }>;

  /**
   * Every intervention Discovery generated, evaluated, simulated,
   * compared, and ranked.
   */
  options:
    ExecutiveDecisionOptionProjection[];

  /**
   * Final executive recommendation.
   */
  recommendation:
    ExecutiveDecisionRecommendationProjection;

  /**
   * Conditions whose outcomes differed across the evaluated options.
   */
  differentiatingConditionIds: string[];

  /**
   * Whether the evaluated options produced different scenario-level
   * recommendations.
   */
  differentiatingRecommendations: boolean;

  /**
   * When Discovery completed the decision cycle.
   */
  completedAt: string;
};