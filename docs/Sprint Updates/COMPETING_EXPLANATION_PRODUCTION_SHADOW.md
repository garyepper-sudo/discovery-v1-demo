# Sprint 120 — Competing Explanation Production Shadow

## Status

Complete as a benchmark-only, production-shadow evaluation. No authoritative cognition, Runtime, schema, confidence, ranking, recommendation, provider, application, capability, persistence, or fixture behavior changed.

## Core question

Can Discovery construct and adjudicate competing explanations from current production Mechanisms, Beliefs, Theories, Conditions, contradictions, evidence ancestry, and Executive Assessment without fixture-defined candidates?

## Architecture

The experiment compares exactly three policies:

- **P0 — Production judgment:** current production output, unchanged.
- **P1 — Production-derived explanation state:** candidates are constructed only when a fixed explanation family has an explicit match in an existing production Mechanism, Belief, Theory, Condition, contradiction, or Executive Assessment. P1 records evidence roles and ancestry but selects no judgment.
- **P2 — Production-derived adjudicated shadow:** deterministic role precedence adjudicates P1, preserves alternatives and history, and emits a shadow-only leader or abstention.

P1 and P2 are ephemeral. Neither replaces production Conditions, the primary constraint, Executive Assessment, recommendation, Runtime, or persistence.

## Candidate construction

The shadow uses a bounded, industry-neutral vocabulary for capacity, concurrency, Decision Flow, coordination, strategy, knowledge, leadership dependency, and operating-model ownership.

For every production object whose content matches one of those families, the candidate records:

- source layer;
- production object identity;
- production evidence identities where exposed;
- supporting, opposing, discriminating, shared, and bounded evidence;
- independent source identities;
- current bounded support state.

The constructor does not enumerate arbitrary combinations and does not use provider inference. Hidden truth is evaluated only after execution.

## Evidence roles and adjudication

Evidence is classified as support, opposition, discrimination, shared support, contradiction, outcome or counterfactual evidence, bounded evidence, duplicate, or irrelevant.

P2 uses deterministic role precedence rather than a weighted sum. Decisive outcome evidence precedes corroboration; corroboration precedes ordinary support; credible opposition weakens; weak evidence remains bounded; ties and multi-cause states abstain.

## Fixture design

The benchmark contains 23 scored three-state scenarios plus a reversed-order control. Every scored scenario runs:

```text
T0 — Initial explanation
T1 — Competing evidence
T2 — Discriminating or outcome evidence
```

Fixture families cover canonical Atlas decisive evidence, credible opposition, duplicates, delayed outcomes, Northstar-style operational explanations, knowledge fragmentation, capacity versus concurrency, strategic symptoms versus Decision Flow, leadership dependency, ownership ambiguity, multiple causes, feedback, shared evidence, contradictions, counterfactuals, irrelevant evidence, sparse evidence, terminology variation, enterprise scope, and order reversal.

The canonical Atlas sequence consumes in-memory copies of A03, A04, A11, and A15 without modifying the fixture.

## Results

There are 69 scored phase states.

| Measure | P0 | P1 | P2 |
|---|---:|---:|---:|
| Correct leader | 8/69 | Not selected | 32/69 |
| Mean reciprocal rank | 0.116 | Not ranked | 0.464 |
| Candidate precision | Not represented | 0.199 | 0.199 input set |
| Candidate recall | Not represented | 0.980 | 0.980 input set |
| Unsupported candidates | Not represented | 390 | 390 input set |
| Missing viable explanations | Not represented | 2 | 2 input set |
| Complete production ancestry | Not represented | 69/69 | 69/69 |
| Exact explanation set | Not represented | 0/69 | 0/69 |
| Correct revision direction | Not represented | Not selected | 39/69 |
| Correct confidence direction | Not represented | Bounded state | 56/69 |
| Correct abstention | Not represented | Not selected | 37/69 |
| Recommendation-family appropriateness | Production proxy | Not selected | 33/69 |
| Historical preservation | Not represented | Current state only | 69/69 |

Controls:

- repeated replay: pass;
- reversed evidence order: pass;
- irrelevant evidence invariance: pass;
- exact duplicate invariance: fail;
- organization identity: stable;
- evidence and production result identities: stable;
- Runtime and fixture mutation: none.

## Root cause

Sprint 119’s adjudication rules do not survive current production-derived candidate construction.

The earliest failure is P1 candidate extraction:

1. Production Conditions and Executive Assessment contain broad, overlapping organizational language.
2. That language mentions several condition and mechanism families as context, consequences, uncertainty, or alternatives.
3. A bounded lexical constructor cannot reliably distinguish an asserted causal explanation from a referenced concept.
4. Nearly every scenario therefore receives most explanation families.
5. P2 cannot recover precision by ranking because the candidate set has already lost assertion role and causal scope.

This is not evidence that adjudication itself is unsafe. It is evidence that the current production outputs do not expose a sufficiently explicit, machine-readable explanation-candidate boundary for this constructor.

## Contradiction and confidence behavior

P2 responded to some explicit opposition and outcome phrases, but broad candidate contamination caused false ties, incorrect displacement, and false certainty elsewhere. Confidence direction reached 56/69, below the 90% threshold.

Contradiction-created alternatives were sometimes recovered, but contradiction target and assertion role are not consistently explicit in production outputs. Duplicate evidence also changed production-derived ancestry enough to alter adjudication in the duplicate controls.

## Multi-cause and abstention

Only 37/69 abstention decisions were correct. Genuine multi-cause and feedback cases often abstained, but unrelated broad candidates also produced false abstention. Conversely, decisive evidence sometimes selected the wrong broadly referenced family.

## Historical preservation

The ephemeral shadow retained the previous actual leader, viable set, displacement, and revision evidence in 69/69 states. The failure is not historical loss.

## Executive fidelity

Recommendation-family appropriateness was 33/69. No production recommendation changed, but the shadow would have caused harmful advice changes if integrated. This fails the production-integration safety boundary.

## Cross-benchmark posture

The production shadow records seven phase-level corrections across scenarios marked as existing benchmark families, including Atlas decisive evidence and causal-constraint patterns. However, the required broad improvement claim is not established:

- candidate precision is only 0.199;
- exact-set accuracy is 0/69;
- duplicate invariance fails;
- Ground Truth and causal benchmark expectations remain unchanged rather than replaced.

The cross-family corrections therefore do not override the safety failures.

## Classification

**C — Controlled-fixture overfit**

Sprint 119 succeeds when explanation identities and evidence roles are unusually clean. Current production cognition does not expose enough assertion-role and causal-scope structure for the tested production-derived constructor to reproduce that result.

## Exact recommendation

Do not authorize production integration and do not refine P2 ranking.

Abandon this lexical production-candidate constructor. If further work is authorized, the next task should be a read-only feasibility investigation into whether existing production Mechanisms, Theories, Conditions, contradictions, and reasoning relationships already contain enough structured linkage to identify:

- which objects assert an explanation;
- which merely mention one;
- causal scope;
- contradiction target;
- evidence role;
- candidate-to-condition ancestry.

Only if that investigation finds an existing structured boundary should a focused P1 refinement be attempted. Do not add a new Runtime object, schema, cognitive capability, or persistence model merely to rescue this benchmark.
