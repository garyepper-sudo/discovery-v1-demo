# Organizational Understanding Evaluator 001 — Phase 3 Preregistration

**Version:** `oue-001-phase-3-preregistration/v1`

Phase 3 is retrieval-only research. A candidate edge is not a semantic match,
adjudication, assignment, score, or confidence statement.

## Frozen corpus split

- Development: `phase3-development`
- Untouched holdout: `phase3-holdout`
- Negative control: `phase3-negative`
- Split manifest: `oue-001-phase-3-corpus-split/v1`

The executable split manifest records canonical case hashes. The generator
cannot import fixture labels. Holdout labels may be read only by the offline
validator after generation is frozen. Maximum development iterations: one.

## Frozen promotion thresholds

- Development true-match candidate recall: at least 0.95.
- Holdout true-match candidate recall: at least 0.95.
- Per-family recall for represented families: 1.00.
- Average emitted candidates per recovered proposition: at most 4.
- Cartesian-pair reduction: at least 0.50.
- False exclusion on expected true matches: at most 0.05.
- Cross-organization, cross-case, cross-family, unauthorized, and prohibited-reference edges: zero.
- Malformed graph acceptance and duplicate inflation: zero.
- Input-order, object-key-order, repeated-run, ledger, serialization, and cross-version instability: zero.
- Genuine tied groups crossing a cap must be preserved as explicit overflow.
- Semantic adjudication, assignment, component scores, composite scores, penalties, and evaluator correctness confidence: absent.

No aggregate Phase 3 score is preregistered.
