import type { MatchClassification, PropositionFamily, PropositionModality, PropositionPolarity, TemporalState } from "./contracts";

export const evaluatorComponentVersions = Object.freeze({
  groundTruthPropositionSchema: "ground-truth-proposition-graph/v1",
  recoverySchema: "recovered-proposition-graph/v1",
  semanticAdjudicationRubric: "semantic-adjudication-rubric/v1",
  confidenceNormalizationMap: "confidence-normalization/v1",
  scoringWeights: "couu-scoring-decomposition/v1",
  adjudicatorPrompt: "not-implemented",
  adjudicatorModel: "not-implemented",
  deterministicScorer: "not-implemented",
  humanReviewProtocol: "blinded-human-review/v1",
} as const);

export const propositionFamilies = Object.freeze(["finding", "condition", "constraint", "conclusion", "prediction", "contradiction", "mechanism", "uncertainty", "evidence-gap", "implication"] as const satisfies readonly PropositionFamily[]);
export const propositionPolarities = Object.freeze(["affirmed", "denied", "mixed", "unresolved"] as const satisfies readonly PropositionPolarity[]);
export const propositionModalities = Object.freeze(["observed", "inferred", "causal", "predictive", "hypothetical", "unknown"] as const satisfies readonly PropositionModality[]);
export const temporalStates = Object.freeze(["current", "historical", "future", "changing", "unknown"] as const satisfies readonly TemporalState[]);
export const matchClassifications = Object.freeze(["exact", "equivalent", "partial", "overgeneralized", "undergeneralized", "contradictory", "unsupported", "irrelevant", "ambiguous", "missing"] as const satisfies readonly MatchClassification[]);

export const qualitativeConfidenceRanges = Object.freeze({
  "very unlikely": Object.freeze({ minimum: 0, maximum: 0.2 }),
  unlikely: Object.freeze({ minimum: 0.2, maximum: 0.4 }),
  "uncertain / mixed": Object.freeze({ minimum: 0.4, maximum: 0.6 }),
  likely: Object.freeze({ minimum: 0.6, maximum: 0.8 }),
  "highly likely": Object.freeze({ minimum: 0.8, maximum: 0.95 }),
  "near certain": Object.freeze({ minimum: 0.95, maximum: 1 }),
} as const);

export const frozenSemanticRules = Object.freeze({
  version: "organizational-understanding-semantics/v1",
  comparisonUnit: "proposition-not-text",
  oneToOneMatchingDefault: true,
  duplicatedClaimsProduceAdditionalCredit: false,
  ambiguousPairsRequireHumanReview: true,
  ambiguousPairsExcludedFromConfirmatoryScoring: true,
  treatmentIdentityVisibleToAdjudicator: false,
  lexicalScoreCanDetermineCorrectness: false,
  embeddingScoreCanDetermineCorrectness: false,
  modelCanAssignFinalScore: false,
  scoringRequiresCompleteAdjudication: true,
} as const);
