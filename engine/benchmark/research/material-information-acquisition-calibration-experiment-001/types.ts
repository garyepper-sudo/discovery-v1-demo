export type Ordinal = 0 | 1 | 2 | 3;
export type DatasetSplit = "calibration" | "validation" | "holdout" | "negative-control";
export type ActionKind =
  | "inspect-existing-evidence" | "compare-existing-evidence" | "search-authorized-source"
  | "ask-authorized-person" | "request-document" | "recommend-survey"
  | "recommend-measurement" | "recommend-experiment" | "monitor-signal"
  | "wait-for-outcome" | "stop" | "abstain";

export type CalibrationCandidate = {
  actionId: string;
  kind: ActionKind;
  eligible: boolean;
  informationContribution: Ordinal;
  discriminationGain: Ordinal;
  organizationalRelevance: Ordinal;
  reliability: Ordinal;
  burden: Ordinal;
  cost: Ordinal;
  delay: Ordinal;
  reversibility: Ordinal;
  evidenceQuality: Ordinal;
};

export type MaterialAcquisitionCounterfactualOutcome = {
  actionId: string;
  informationContribution: "none" | "low" | "moderate" | "high";
  discriminationGain: "none" | "low" | "moderate" | "high";
  unknownEffect: "unchanged" | "narrowed" | "split" | "resolved" | "reopened";
  answerImpact: "none" | "eligibility-changed" | "version-changed" | "confidence-changed" | "abstention-reason-changed";
  objectiveImpact: "none" | "meaning-resolved" | "authority-resolved" | "conflict-narrowed" | "scope-resolved";
  recommendationImpact: "none" | "eligibility-changed" | "ranking-changed" | "purpose-changed" | "stop-enabled";
  decisionQualityImpact: "none" | "low" | "moderate" | "high";
  reliabilityAfterEvaluation: "low" | "moderate" | "high";
  realizedBurden: "low" | "moderate" | "high";
  realizedDelay: "immediate" | "short" | "medium" | "long";
  governanceSafe: boolean;
};

export type CalibrationScenario = {
  id: string;
  organizationId: string;
  questionId: string;
  domain: string;
  purpose: "understanding" | "objective" | "recommendation" | "decision";
  split: DatasetSplit;
  understandingSufficient: boolean;
  candidates: CalibrationCandidate[];
  outcomes: MaterialAcquisitionCounterfactualOutcome[];
  optimalActionId: string;
  topTwoActionIds: string[];
  materialTie: boolean;
  incomparable: boolean;
  wordingVariantOf?: string;
};

export type SelectorId = "A-phase2c" | "B-fixed" | "C-information" | "D-value" | "E-low-burden" | "F-human" | "G-contract" | "H-calibrated-stop";
export type OrderingId = "information-first" | "relevance-first" | "reliability-first" | "burden-first" | "contract";
export type StoppingRuleId = "A-high-information" | "B-material-effect" | "C-contribution-over-burden" | "D-sufficiency" | "E-governed-combination";

export type Selection = { actionId: string | null; kind: ActionKind | null; tiedActionIds: string[]; abstained: boolean };

export type CalibrationMetrics = {
  selectorId: SelectorId;
  split: DatasetSplit | "all";
  scenarioCount: number;
  correctActionSelection: number;
  topTwoInclusion: number;
  governanceViolations: number;
  authorizationViolations: number;
  unknownResolutionPrecision: number;
  unknownResolutionRecall: number;
  materialInformationPrecision: number;
  stoppingPrecision: number;
  stoppingRecall: number;
  falseStoppingRate: number;
  falseContinuationRate: number;
  repeatedActionRate: number;
  userQuestionBurden: number;
  totalBurden: number;
  delayRegret: number;
  selectionRegret: number;
  tiePrecision: number;
  incomparabilityAccuracy: number;
  wordingStability: number;
  inputOrderStability: number;
  organizationIsolation: number;
  deterministicReplay: number;
  answerEligibilityImprovement: number;
  objectiveDiscoveryImprovement: number;
  recommendationEligibilityImprovement: number;
  decisionQualityProxyImprovement: number;
};

export type SequentialRound = { revision: string; scenario: CalibrationScenario; expectedKind: ActionKind };
export type SequentialScenario = { id: string; rounds: SequentialRound[] };
