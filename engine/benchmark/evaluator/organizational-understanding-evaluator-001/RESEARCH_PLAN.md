# Organizational Understanding Evaluator 001 — Research Plan

## Phase 1 boundary

Phase 1 freezes the proposition vocabulary, confidence representations,
adjudication outcomes, scoring decomposition, validation gates, audit ledger,
and fail-closed ports. It supplies synthetic architecture-neutral fixtures only.

It does not recover propositions, generate semantic candidates, call a model,
import human judgments, compute a benchmark score, or execute a treatment.

## Next research phases

1. Phase 2 complete: deterministic identity, authorization, reference, polarity,
   family, confidence, duplicate, graph, assignment, scoring, and ledger behavior.
2. Implement and validate a high-recall candidate generator that cannot assign correctness.
3. Design a blinded adjudication import or independently versioned model port.
4. Run semantic-equivalence, distinction, anti-gaming, style-neutrality,
   consistency, and negative-control suites.
5. Compare adjudication against at least two blinded experts and consensus.
6. Freeze hashes only after every pre-comparative gate passes.
7. Create External Comparative Validation 002 as a new untouched suite.

## Required evidence before activation

- Semantic equivalence recall at least 95%.
- Semantic distinction precision at least 98%.
- False equivalence at most 2%; false distinction at most 5%.
- Zero duplicate inflation, ordering bias, formatting bias, identity leakage,
  organization leakage, and permission leakage.
- Human-consensus agreement at least 90%.
- Material scoring variance within a separately preregistered tolerance.

Until then, the evaluator is inactive research infrastructure and External
Comparative Validation 002 remains unauthorized.
