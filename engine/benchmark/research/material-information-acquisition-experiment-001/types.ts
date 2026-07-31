export type AcquisitionActionKind =
  | "search-existing"
  | "ask-user"
  | "compare-evidence"
  | "request-document"
  | "recommend-survey"
  | "recommend-measurement"
  | "recommend-experiment"
  | "recommend-waiting"
  | "do-nothing"
  | "abstain";

export type AcquisitionAction = {
  id: string;
  kind: AcquisitionActionKind;
  expectedInformationGain: number;
  expectedOrganizationalValue: number;
  userBurden: number;
  acquisitionCost: number;
  delay: number;
  sourceReliability: number;
  existingEvidenceQuality: number;
  authorized: boolean;
  governanceAllowed: boolean;
  reversible: boolean;
};

export type AcquisitionScenario = {
  id: string;
  label: string;
  candidates: AcquisitionAction[];
  expectedActionId: string;
  tags: string[];
  wordingVariantOf?: string;
  negativeControl?: boolean;
};

export type AcquisitionStrategyId =
  | "A-fixed-workflow"
  | "B-always-ask"
  | "C-always-search"
  | "D-rule-priority"
  | "E-information-gain"
  | "F-organizational-value"
  | "G-governed-hybrid"
  | "always-measure"
  | "always-survey"
  | "always-experiment";

export type AcquisitionSelection = {
  scenarioId: string;
  actionId: string | null;
  actionKind: AcquisitionActionKind | null;
  correct: boolean;
  governanceSafe: boolean;
};

export type AcquisitionMetrics = {
  strategyId: AcquisitionStrategyId;
  scenarioCount: number;
  correctChoice: number;
  questionEfficiency: number;
  userBurden: number;
  costEfficiency: number;
  delayEfficiency: number;
  understandingImprovement: number;
  recommendationImprovement: number;
  governanceIntegrity: number;
  determinism: number;
  architecturalSimplicity: number;
  overallScore: number;
};
