# Phase 1 defects discovered during Phase 2

Phase 1 remains frozen and its prior reports are unchanged.

Two bounded omissions prevent direct expression of required Phase 2 behavior:

1. The Phase 1 blocking-failure vocabulary does not name every structural
   failure required by Phase 2, including invalid confidence, cross-run and
   cross-version contamination, invalid one-to-one assignment, and graph
   integrity failure.
2. Phase 1 duplicate metadata records a canonical proposition and surface-form
   count but does not identify explicit duplicate member proposition IDs.
3. Phase 1 adjudications do not carry the decomposed contradiction, causal,
   uncertainty, evidence-gap, and decision-utility rubric fields needed for
   deterministic component aggregation. Phase 1 propositions also lack the
   explicit mechanism-explanandum, evidence-gap feasibility, and prediction
   evaluation-status fields required for complete graph checks.

Phase 2 therefore introduces versioned `Phase2FailureCode` and
`ExplicitDuplicateGroup`, `Phase2ImportedRubricJudgment`, and
`Phase2GraphMetadata` contracts. It does not mutate Phase 1 types, semantics,
fixtures, hashes, results, or reports.
