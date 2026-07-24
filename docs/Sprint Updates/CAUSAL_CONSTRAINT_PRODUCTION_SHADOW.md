# Causal Constraint Reasoning Production Shadow

**Status:** Sprint 117 complete

**Scope:** Benchmark-only production shadow

**Authoritative production behavior:** Unchanged

## Question

Can Causal Constraint Reasoning infer the correct causal root from actual production cognition outputs when causal structure is incomplete, implicit, or ambiguous?

## Shadow architecture

```text
Production Evidence
Production Mechanisms
Production Conditions
Preserved evidence ancestry
  → bounded causal-language interpretation
  → directed Condition graph
  → root and feedback-loop analysis
  → transitive consequence analysis
  → causal primary-constraint candidate
  → upstream intervention target
```

The shadow executes after the full production pipeline. It reads existing cognition and writes nothing back.

It does not replace or mutate:

- the production primary constraint;
- Organizational State;
- Executive Assessment;
- Executive Recommendation;
- Executive Projection;
- Runtime;
- persistence;
- schemas; or
- the Capability Registry.

Every inferred edge retains production evidence IDs and the identities of production Mechanisms sharing that ancestry.

## Policies

| Policy | Behavior |
|---|---|
| S0 | Production primary-constraint and intervention behavior |
| S1 | Build and score the causal graph while preserving production selection |
| S2 | Select the causal root and intervention target in ephemeral shadow output |

No coefficient search or alternate ranking formula is evaluated.

## Causal-edge inference

The shadow applies bounded, industry-neutral rules to text already available through production evidence ancestry.

Observed relationships include:

- causes;
- leads to;
- results in; and
- produces.

Bounded inferred relationships include:

- reinforces;
- appears to drive;
- follows;
- follows when;
- emerges after; and
- is observed after.

Weak relationships include:

- contributes to; and
- may contribute to.

Associations with unclear direction do not produce an edge.

Each edge records:

- cause Condition;
- effect Condition;
- observed, inferred, or weak status;
- supporting production evidence IDs;
- related production Mechanism IDs; and
- an explanation distinguishing observation from inference.

## Root selection and abstention

The shadow:

1. identifies Conditions without an incoming causal edge;
2. computes transitive downstream reach;
3. selects a unique root only when one candidate has defensibly greater reach;
4. abstains when equivalent independent roots remain;
5. recognizes two-way relationships as feedback loops;
6. abstains when a loop has no defensible external root; and
7. abstains when no directed relationship exists.

This is graph interpretation, not a weighted score over production fields.

## Fixture suite

The 16 accuracy scenarios cover:

1. explicit causal statements;
2. implicit causal language;
3. weak causal language;
4. ambiguous direction;
5. one root with multiple symptoms;
6. multiple contributing causes;
7. interacting constraints;
8. feedback loops;
9. broad strategic causes with narrow symptoms;
10. narrow operational causes with broad symptoms;
11. leadership dependency with the previously missing secondary edge;
12. sparse decisive evidence;
13. contradictory causal claims;
14. no defensible root;
15. an industry-neutral terminology variant; and
16. a surface-language paraphrase.

Separate forward/reversed evidence and source-order controls are excluded from accuracy denominators.

All cases run through the real production pipeline before shadow interpretation.

## Production-versus-shadow results

| Policy | Root mechanism | Primary constraint | Cause vs symptom | Multi-cause | Abstention | Edge precision | Edge recall | Consequence accuracy | Intervention |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| S0 | 2/16 | 0/16 | 0/16 | 16/16 | 11/16 | 1.000 | 0.979 | 0.979 | 16/16 |
| S1 | 16/16 | 0/16 | 0/16 | 16/16 | 15/16 | 1.000 | 0.979 | 0.979 | 16/16 |
| S2 | 16/16 | 15/16 | 15/16 | 16/16 | 15/16 | 1.000 | 0.979 | 0.979 | 15/16 |

Aggregate comparison:

- production primary-constraint accuracy: 0/16;
- causal-shadow accuracy: 15/16;
- beneficial corrections: 15;
- neutral cases: 1;
- harmful changes: 0;
- justified abstentions: 5/5;
- unsupported edges: 0; and
- production recommendations changed: 0.

The controlled production-shaped suite is intentionally difficult for the existing primary selector. Its 0/16 score is a benchmark observation, not a claim about general production accuracy.

## Root-mechanism accuracy

Production-selected Conditions align with the hidden root in 2/16 cases.

The S1 and S2 graph identifies the correct root structure in 16/16 cases, including multi-cause and feedback-loop cases where no single primary root is justified.

## Primary-constraint and cause-versus-symptom accuracy

S2 selects or correctly abstains in 15/16 scenarios.

It correctly handles:

- narrow causes producing broad symptoms;
- genuinely broad strategic roots;
- one root producing multiple symptoms;
- equivalent multiple causes;
- interacting constraints;
- feedback loops;
- contradictory direction; and
- absence of causal evidence.

No production selection is replaced.

## Multi-cause, feedback, and ambiguity

Multi-cause handling is correct in 16/16.

The shadow correctly abstains for:

- ambiguous direction;
- equivalent contributing roots;
- a closed feedback loop;
- contradictory two-way claims; and
- no defensible directed relationship.

All five required abstentions are justified.

## Remaining failure

The leadership-dependency scenario remains incomplete.

The production evidence emitted into the shadow preserves:

- Leadership Dependency → Decision Flow; and
- Coordination System → Execution Capacity.

It does not yield the required intermediate Decision Flow → Coordination System edge. The graph therefore sees two equivalent roots and abstains instead of selecting Leadership Dependency.

This is the same bounded secondary-edge weakness identified in Sprint 116, now reproduced at the production-output boundary.

## Intervention behavior

S2 targets the upstream intervention family in 15/16 cases.

The leadership case abstains and therefore does not emit a false intervention. Production recommendation identity and content remain byte-stable in every scenario.

Recommendation-family alignment is preserved rather than rewritten.

## Explanation and ancestry

| Measure | Result |
|---|---:|
| Evidence ancestry preserved | 16/16 |
| Observation separated from inference | 16/16 |
| Appropriate uncertainty | 16/16 |
| Unsupported edges | 0 |
| Consequence accuracy | 0.979 |

Weak and inferred edges explicitly state uncertainty. Abstentions identify whether the cause is missing, ambiguous, cyclic, or multiply determined.

## Generalization and determinism

- explicit, implicit, and weak causal language execute deterministically;
- industry-neutral terminology passes;
- surface paraphrases pass;
- evidence-order reversal is equivalent;
- source-order reversal is equivalent;
- repeated execution is byte-identical;
- production replay is unchanged;
- organization and evidence identities are stable;
- no Runtime is persisted;
- canonical fixtures remain unchanged; and
- no provider is used.

## Classification

### B — Strong but incomplete

The shadow improves primary-constraint accuracy from 0/16 to 15/16 with no harmful changes, no unsupported edges, correct abstention, preserved recommendations, and deterministic execution.

It is not Classification A because the previously identified leadership secondary-edge gap remains and prevents complete causal-chain recovery.

## Recommendation

Do not begin production integration yet.

Authorize one focused capability-refinement sprint for implicit secondary-edge recovery across production evidence and Mechanism ancestry. The refinement should:

- target only missing intermediate causal edges;
- preserve the current zero-unsupported-edge posture;
- add held-out paraphrases for temporal and consequential language;
- retain abstention when direction remains ambiguous; and
- rerun the full Sprint 116 and Sprint 117 suites.

If that refinement recovers the leadership chain without unsupported edges or harmful corrections, reconsider a narrow production-integration design sprint.
