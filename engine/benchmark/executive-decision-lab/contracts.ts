import type { ScoreDimension } from "../judgment-lab/contracts";
import type { EvaluationUsage } from "../judgment-lab/contracts";
import type {
  OrganizationalInterventionScope,
  OrganizationalInterventionType,
} from "../../v3/model/simulate/organizationalIntervention";

export type DecisionCandidateInput = {
  id: string;
  label: string;
  description: string;
  interventionType: OrganizationalInterventionType;
  intendedObjective: string;
  targetedConditionIds: string[];
  statedAssumptions: string[];
  knownRisks: string[];
  expectedTimeHorizon: "immediate" | "near-term" | "medium-term" | "long-term";
  evaluationMetadata: DecisionCandidateEvaluationMetadata;
};

export type DecisionCandidateEvaluationMetadata = {
  actionDirections: string[];
  structuralActions: string[];
  targetedMechanisms: string[];
  intendedEffects: string[];
  semanticAliases: string[];
};

export type InterventionCorrespondence = "equivalent" | "closely-aligned" | "acceptable-alternative" | "symptom-oriented" | "dominated" | "harmful-inverse" | "unrelated" | "ambiguous";

export type InterventionSemanticSignature = {
  actionDirections: string[];
  structuralActions: string[];
  targetedMechanisms: string[];
  intendedEffects: string[];
  interventionType?: string;
};

export type InterventionCorrespondenceResult = {
  candidateId?: string;
  classification: InterventionCorrespondence;
  confidence: "high" | "moderate" | "low";
  rationale: string;
  generatedSignature: InterventionSemanticSignature;
};

export type DecisionResponseBehavior = "desirable-stability" | "appropriate-change" | "harmful-instability" | "unjustified-insensitivity" | "inconclusive";

export type DecisionScenarioExpectation = {
  recommendationExpectation: "stable" | "change" | "narrow" | "reconsider";
  dispositionExpectation: "stable" | "more-cautious" | "less-cautious" | "change";
  confidenceExpectation: "stable" | "increase" | "decrease";
  uncertaintyExpectation: "stable" | "increase" | "decrease";
};

export type DecisionStressScenario = {
  id: string;
  decisionCaseId: string;
  label: string;
  scenarioType: "executive-anchoring" | "evidence-removal" | "capacity-loss" | "localized-mechanism";
  changedAssumptions: string[];
  changedConstraints: string[];
  changedEvidence: string[];
  decisionOverrides?: {
    proposedDecision?: string;
    statedRationale?: string;
    targetConditionIds?: string[];
    allowedInterventionTypes?: OrganizationalInterventionType[];
    requiredCapacityConstraint?: string;
  };
  evidenceCompleteness?: number;
};

export type ExecutiveDecisionCase = {
  id: string;
  organizationId: string;
  evaluationUsage: EvaluationUsage;
  title: string;
  proposedDecision: string;
  executiveRole: string;
  statedObjective: string;
  statedRationale: string;
  decisionContext: {
    primaryConstraintId?: string;
    primaryConstraintLabel?: string;
    organizationalConditionIds: string[];
    mechanismIds: string[];
    uncertaintyStatements: string[];
    evidenceIds: string[];
  };
  candidateInterventions: DecisionCandidateInput[];
  stressScenarios: DecisionStressScenario[];
  groundTruthId: string;
};

export type DecisionStressGroundTruth = {
  scenarioId: string;
  expectedPreferredInterventionId: string;
  acceptableAlternativeIds: string[];
  expectedDisposition: "proceed" | "investigate-further" | "do-not-proceed";
  expectedConfidenceDirection: "increase" | "decrease" | "stable";
  expectedScope?: OrganizationalInterventionScope;
  responseExpectation: DecisionScenarioExpectation;
  rationale: string;
};

export type ExecutiveDecisionGroundTruth = {
  id: string;
  decisionCaseId: string;
  actualDecisionFrame: { objective: string; decisionQuestion: string; rationale: string };
  bindingConstraintIds: string[];
  importantMechanismIds: string[];
  preferredInterventionId: string;
  acceptableAlternativeIds: string[];
  dominatedInterventionIds: string[];
  harmfulInterventionIds: string[];
  interventionAssessments: Array<{
    interventionId: string;
    expectedImpact: "low" | "moderate" | "high";
    feasibility: "low" | "moderate" | "high";
    reversibility: "low" | "moderate" | "high";
    timeToImpact: string;
    keyRisks: string[];
    requiredAssumptions: string[];
    secondOrderEffects: string[];
    reasonForClassification: string;
  }>;
  decisiveUnknowns: string[];
  expectedDecisionReadiness: "ready" | "investigate-first" | "do-not-proceed";
  expectedRecommendationDisposition: "proceed" | "investigate-further" | "do-not-proceed";
  stressScenarios: DecisionStressGroundTruth[];
};

export type ExecutiveDecisionLabRunResult = {
  decisionCaseId: string;
  scenarioId?: string;
  fixedTimestamp: string;
  engineInput: string;
  decisionFrame: { statedQuestion: string; interpretedObjective?: string; primaryConstraintId?: string };
  options: Array<{ id: string; label: string; type: string; scope: OrganizationalInterventionScope; rank?: number; viability?: string; expectedImpact?: string; risks: string[]; assumptions: string[] }>;
  simulations: Array<{ optionId: string; interventionId: string; scope: OrganizationalInterventionScope }>;
  recommendation: { optionId?: string; interventionId?: string; label?: string; scope?: OrganizationalInterventionScope; disposition?: string; confidence?: number; rationale?: string };
  assumptions: string[];
  risks: string[];
  tradeoffs: string[];
  uncertainty: string[];
  missingEvidence: string[];
  supportingEvidenceIds: string[];
  upstreamEvidenceIds: string[];
  deterministicSignature: string;
};

export type DecisionScopeComparison = {
  expectedScope?: OrganizationalInterventionScope;
  baselineRecommendationScope?: OrganizationalInterventionScope;
  generatedScope?: OrganizationalInterventionScope;
  simulatedScope?: OrganizationalInterventionScope;
  recommendationScope?: OrganizationalInterventionScope;
  preservesExpectedScope: boolean;
  narrowsFromBaseline: boolean;
};

export type ExecutiveDecisionScorecard = {
  decisionFraming: ScoreDimension;
  objectiveFidelity: ScoreDimension;
  constraintAlignment: ScoreDimension;
  optionDiversity: ScoreDimension;
  optionQuality: ScoreDimension;
  assumptionQuality: ScoreDimension;
  riskRecognition: ScoreDimension;
  recommendationQuality: ScoreDimension;
  dispositionQuality: ScoreDimension;
  confidenceCalibration: ScoreDimension;
  stressRobustness: ScoreDimension;
  sensitivity: ScoreDimension;
  informationValue: ScoreDimension;
  evidenceGrounding: ScoreDimension;
  executiveCommunication: ScoreDimension;
};

export type ExecutiveDecisionFailureType = "none" | "decision-framing" | "objective-mismatch" | "constraint-misalignment" | "option-collapse" | "option-quality" | "assumption-omission" | "risk-omission" | "recommendation-mismatch" | "disposition-mismatch" | "confidence-calibration" | "stress-robustness" | "sensitivity" | "information-value" | "evidence-grounding" | "executive-language" | "benchmark-gap";
export type ExecutiveDecisionFailure = { type: ExecutiveDecisionFailureType; severity: "low" | "medium" | "high"; description: string; supportingEvidence: string[]; likelyProducerArea?: string };
export type ExecutiveDecisionEvaluation = {
  run: ExecutiveDecisionLabRunResult;
  correspondence: InterventionCorrespondenceResult;
  responseBehavior: DecisionResponseBehavior;
  scopeComparison: DecisionScopeComparison;
  scorecard: ExecutiveDecisionScorecard;
  failures: ExecutiveDecisionFailure[];
};
