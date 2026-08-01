import type { EvaluationDimension } from "./contracts";

export type FrozenDimensionSpecification = {
  weight: number;
  numerator: string;
  denominator: string;
  prohibitedCredit: readonly string[];
};

export const scoringDecomposition = Object.freeze<Record<EvaluationDimension, FrozenDimensionSpecification>>({
  correctness: Object.freeze({ weight: 0.2, numerator: "importance-weighted exact, equivalent, and bounded partial adjudications", denominator: "importance-weighted evaluated recovered propositions", prohibitedCredit: Object.freeze(["unsupported", "irrelevant", "contradictory", "duplicate repetition"]) }),
  materialCoverage: Object.freeze({ weight: 0.15, numerator: "importance-and-decision-relevance-weighted required propositions recovered", denominator: "importance-and-decision-relevance-weighted required ground-truth propositions", prohibitedCredit: Object.freeze(["duplicate matches", "optional artifact volume"]) }),
  contradictionQuality: Object.freeze({ weight: 0.15, numerator: "endpoint, polarity, unresolved-state, support, and opposition fidelity", denominator: "required contradiction relationships", prohibitedCredit: Object.freeze(["keyword overlap without endpoint fidelity", "agreement represented as contradiction"]) }),
  causalQuality: Object.freeze({ weight: 0.15, numerator: "supported mechanisms with causal modality and competing alternatives preserved", denominator: "required and asserted causal propositions", prohibitedCredit: Object.freeze(["correlation as causation", "unsupported causal vocabulary", "finding as mechanism"]) }),
  confidenceCalibration: Object.freeze({ weight: 0.1, numerator: "confidence-range overlap and outcome-calibration credit", denominator: "adjudicated propositions with applicable confidence expectations", prohibitedCredit: Object.freeze(["format-specific confidence credit", "out-of-range confidence"]) }),
  uncertaintyDiscipline: Object.freeze({ weight: 0.1, numerator: "appropriate abstention and unresolved-state preservation", denominator: "required uncertainty and abstention judgments", prohibitedCredit: Object.freeze(["vague disclaimer attached to unsupported certainty", "hidden uncertainty"]) }),
  evidenceGapQuality: Object.freeze({ weight: 0.1, numerator: "relevant, useful, feasible, nonredundant gap credit", denominator: "required and asserted evidence-gap propositions", prohibitedCredit: Object.freeze(["irrelevant requests", "duplicate requests", "artifact count"]) }),
  decisionRelevantUtility: Object.freeze({ weight: 0.05, numerator: "blinded-rubric preservation of information needed for downstream judgment", denominator: "required decision-relevant implications", prohibitedCredit: Object.freeze(["subjective helpfulness", "treatment identity", "verbosity"]) }),
});

export const blockingFailureCodes = Object.freeze([
  "authorization-leakage", "organization-contamination", "unsupported-causal-claim",
  "catastrophic-overconfidence", "corrupted-lineage", "benchmark-identity-mismatch",
  "invalid-treatment-execution", "incomplete-adjudication", "unresolved-material-ambiguity",
] as const);

export const evaluatorValidationGates = Object.freeze({
  semanticEquivalenceRecallMinimum: 0.95,
  semanticDistinctionPrecisionMinimum: 0.98,
  falseEquivalenceRateMaximum: 0.02,
  falseDistinctionRateMaximum: 0.05,
  duplicateScoreInflationMaximum: 0,
  orderingBiasMaximum: 0,
  formattingBiasMaximum: 0,
  treatmentIdentityLeakageMaximum: 0,
  organizationLeakageMaximum: 0,
  permissionLeakageMaximum: 0,
  humanConsensusAgreementMinimum: 0.9,
} as const);
