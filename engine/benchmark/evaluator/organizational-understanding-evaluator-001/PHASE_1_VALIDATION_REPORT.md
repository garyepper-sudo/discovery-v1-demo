# Organizational Understanding Evaluator — Phase 1 Validation

**Classification:** PASS — Phase 1 architecture complete; evaluator inactive

Contracts, frozen semantics, scoring decomposition, fixtures, and fail-closed ports are present. Proposition recovery, candidate generation, live semantic adjudication, deterministic scoring, and comparative execution remain deliberately unavailable.

- PASS: version frozen — oue-001-phase-1
- PASS: critical components independently versioned — {"groundTruthPropositionSchema":"ground-truth-proposition-graph/v1","recoverySchema":"recovered-proposition-graph/v1","semanticAdjudicationRubric":"semantic-adjudication-rubric/v1","confidenceNormalizationMap":"confidence-normalization/v1","scoringWeights":"couu-scoring-decomposition/v1","adjudicatorPrompt":"not-implemented","adjudicatorModel":"not-implemented","deterministicScorer":"not-implemented","humanReviewProtocol":"blinded-human-review/v1"}
- PASS: ten proposition families — finding, condition, constraint, conclusion, prediction, contradiction, mechanism, uncertainty, evidence-gap, implication
- PASS: ten match classifications — exact, equivalent, partial, overgeneralized, undergeneralized, contradictory, unsupported, irrelevant, ambiguous, missing
- PASS: confidence ranges bounded — [{"minimum":0,"maximum":0.2},{"minimum":0.2,"maximum":0.4},{"minimum":0.4,"maximum":0.6},{"minimum":0.6,"maximum":0.8},{"minimum":0.8,"maximum":0.95},{"minimum":0.95,"maximum":1}]
- PASS: confidence range continuum — 0 through 1 without gaps
- PASS: scoring weights sum to one — 1
- PASS: scoring decomposed — eight independently reportable components
- PASS: scoring semantics deeply frozen — weights, formulas, and prohibited-credit rules immutable
- PASS: strict pre-comparative gates — {"semanticEquivalenceRecallMinimum":0.95,"semanticDistinctionPrecisionMinimum":0.98,"falseEquivalenceRateMaximum":0.02,"falseDistinctionRateMaximum":0.05,"duplicateScoreInflationMaximum":0,"orderingBiasMaximum":0,"formattingBiasMaximum":0,"treatmentIdentityLeakageMaximum":0,"organizationLeakageMaximum":0,"permissionLeakageMaximum":0,"humanConsensusAgreementMinimum":0.9}
- PASS: ground truth frozen before treatment — 3c6db4ad1abfe238715862cfebdfc8389309f728a153d8e8463c5316cd7ee7d1
- PASS: fixture identity aligned — evaluator-fixture-org/evaluator-fixture-case
- PASS: all proposition families fixture-covered — 10/10 families
- PASS: equivalence and distinction fixtures — 13 fixtures
- PASS: ambiguity requires human review — all ambiguous fixtures routed to review
- PASS: duplicates retained without credit semantics — [{"canonicalRecoveredPropositionId":"recovered-finding-1","duplicateCount":2,"duplicatedSurfaceForms":["Approval ownership starts late.","The approval owner is assigned after handoff."]}]
- PASS: missing adjudication fails closed — required propositions cannot be scored without adjudications
- PASS: unresolved ambiguity fails closed — ambiguous material adjudication cannot be scored
- PASS: unknown adjudication references fail closed — unrecognized ground-truth or recovered references cannot be scored
- PASS: live implementations absent — {"propositionRecovery":"not-implemented","semanticCandidateGeneration":"not-implemented","liveSemanticAdjudication":"not-implemented","deterministicScoring":"not-implemented","comparativeExecution":"prohibited"}
