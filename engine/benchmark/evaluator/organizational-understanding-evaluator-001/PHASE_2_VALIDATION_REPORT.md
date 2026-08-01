# Organizational Understanding Evaluator 001 — Phase 2

**Classification:** PASS — Deterministic structural evaluator validated

Phase 2 validates deterministic structure and scoring for already-completed imported adjudications. It does not recover or understand semantic meaning. Every percentage below is a frozen-fixture validation result, not general semantic accuracy.

## Metrics

- structuralValidationPrecision: 1.000
- invalidInputRejectionRate: 1.000
- organizationIsolation: 1.000
- caseIsolation: 1.000
- crossRunIsolation: 1.000
- authorizationCompliance: 1.000
- confidenceNormalizationAccuracy: 1.000
- duplicateInflationRate: 0.000
- polarityValidationAccuracy: 1.000
- modalityValidationAccuracy: 1.000
- temporalValidationAccuracy: 1.000
- assignmentDeterminism: 1.000
- graphIntegrityAccuracy: 1.000
- scoringDeterminism: 1.000
- ledgerDeterminism: 1.000
- canonicalSerializationStability: 1.000
- crossVersionContamination: 0.000

## Composite score

Active only for structurally valid, complete imported adjudications. Any blocking failure omits the score and makes the ledger classification-ineligible. Phase 2 generates no penalties because Phase 1 froze no penalty-code vocabulary; it uses blocking gates rather than inventing penalties.

“Confidence calibration” measures confidence-representation fidelity and justified-range agreement only; outcome-based calibration is inactive. “Decision-relevant utility” is deterministic aggregation of an explicitly imported rubric judgment, not an observed organizational outcome.

## Inactive capabilities

- Semantic proposition recovery
- Semantic candidate generation
- Live model adjudication
- Human review execution
- External Comparative Validation 002
