import type {
  EvaluationUsage,
  ScoreDimension,
} from "../judgment-lab/contracts";

export type EvolutionObjectType =
  | "belief"
  | "condition"
  | "mechanism"
  | "concept"
  | "recommendation"
  | "operating-model";

export type EvolutionScope =
  | "individual"
  | "team"
  | "department"
  | "business-unit"
  | "cross-functional"
  | "organization"
  | "enterprise";

export type EvolutionExpectationType =
  | "belief-strengthened"
  | "belief-weakened"
  | "belief-preserved"
  | "condition-resolved"
  | "condition-emerged"
  | "mechanism-confidence-increased"
  | "mechanism-confidence-decreased"
  | "recommendation-evolved"
  | "recommendation-preserved"
  | "identity-preserved"
  | "decision-learning-recorded"
  | "scope-preserved"
  | "scope-narrowed"
  | "scope-broadened"
  | "historical-truth-preserved"
  | "confidence-increased"
  | "confidence-decreased";

export type ExpectedEvolution = {
  id: string;
  type: EvolutionExpectationType;
  targetType: EvolutionObjectType;
  targetId: string;
  rationale: string;
  expectedScope?: EvolutionScope;
};

type TimelineEventBase = {
  id: string;
  timestamp: string;
  eventType: "evidence" | "decision" | "intervention" | "outcome";
  expectedOrganizationalChanges: ExpectedEvolution[];
  expectedStableConceptIds: string[];
  expectedRevisedConceptIds: string[];
};

export type EvidenceEvent = TimelineEventBase & {
  eventType: "evidence";
  evidence: {
    evidenceIds: string[];
    relationship: "supports" | "contradicts" | "extends" | "replaces";
    summary: string;
  };
};

export type DecisionEvent = TimelineEventBase & {
  eventType: "decision";
  decision: {
    decisionId: string;
    summary: string;
    disposition: "accepted" | "rejected" | "deferred";
    executive?: {
      id: string;
      name: string;
    };
  };
};

export type InterventionEvent = TimelineEventBase & {
  eventType: "intervention";
  intervention: {
    interventionId: string;
    decisionId: string;
    summary: string;
    scope: EvolutionScope;
  };
};

export type OutcomeEvent = TimelineEventBase & {
  eventType: "outcome";
  outcome: {
    outcomeId: string;
    decisionId?: string;
    interventionId?: string;
    summary: string;
    result: "confirmed" | "partially-confirmed" | "disconfirmed" | "inconclusive";
  };
};

export type TimelineEvent =
  | EvidenceEvent
  | DecisionEvent
  | InterventionEvent
  | OutcomeEvent;

export type EvolutionModelObject = {
  id: string;
  label: string;
  confidence: number;
  scope: EvolutionScope;
  status: "emerging" | "active" | "weakened" | "resolved" | "retired";
  firstObservedAt: string;
  lastUpdatedAt: string;
};

export type EvolutionRecommendation = {
  id: string;
  strategy: string;
  scope: EvolutionScope;
  confidence: number;
  reasonEventIds: string[];
};

export type HistoricalTruth = {
  objectId: string;
  statement: string;
  trueFrom: string;
  trueUntil?: string;
  supersededByEventId?: string;
};

export type DecisionLearningRecord = {
  decisionId: string;
  outcomeEventIds: string[];
  influencedObjectIds: string[];
};

export type OperatingModelSnapshot = {
  id: string;
  timestamp: string;
  entities: EvolutionModelObject[];
  beliefs: EvolutionModelObject[];
  conditions: EvolutionModelObject[];
  mechanisms: EvolutionModelObject[];
  concepts: EvolutionModelObject[];
  recommendation?: EvolutionRecommendation;
  historicalTruths: HistoricalTruth[];
  decisionLearning: DecisionLearningRecord[];
};

export type OrganizationTimelineStep = {
  event: TimelineEvent;
  snapshot: OperatingModelSnapshot;
};

export type OrganizationTimeline = {
  id: string;
  organizationId: string;
  usage: EvaluationUsage;
  title: string;
  initialSnapshot: OperatingModelSnapshot;
  steps: OrganizationTimelineStep[];
};

export type EvolutionScorecard = {
  learning: ScoreDimension;
  stability: ScoreDimension;
  coherence: ScoreDimension;
  identityContinuity: ScoreDimension;
  scopePreservation: ScoreDimension;
  historicalTruth: ScoreDimension;
  decisionLearning: ScoreDimension;
  recommendationContinuity: ScoreDimension;
};

export type EvolutionFailureType =
  | "none"
  | "model-drift"
  | "historical-overwrite"
  | "duplicate-cognitive-objects"
  | "identity-fragmentation"
  | "scope-expansion"
  | "scope-collapse"
  | "unexplained-recommendation-drift"
  | "failure-to-learn"
  | "overreaction"
  | "failure-to-forget"
  | "confidence-inflation"
  | "confidence-stagnation"
  | "contradiction-persistence";

export type EvolutionFailure = {
  type: EvolutionFailureType;
  severity: "low" | "medium" | "high";
  eventId: string;
  objectIds: string[];
  description: string;
  producerBoundary: string;
};

export type EvolutionExpectationResult = {
  expectationId: string;
  eventId: string;
  passed: boolean;
  explanation: string;
};

export type OperatingModelEvolutionEvaluation = {
  timelineId: string;
  deterministicSignature: string;
  expectationResults: EvolutionExpectationResult[];
  scorecard: EvolutionScorecard;
  failures: EvolutionFailure[];
};
