# Theme Evidence Composition Isolation

**Status:** Sprint 113 complete

**Scope:** Benchmark infrastructure only

**Production behavior:** Unchanged

## Question

If Theme composition stops rewarding repeated raw evidence volume, does the corrected Signal contribution propagate meaningfully downstream?

## Shadow architecture

The benchmark runs three isolated paths:

1. production;
2. the Sprint 112 Signal-only Evidence Independence shadow; and
3. the Signal shadow plus a Theme-only independent-source composition policy.

Canonical evidence ingestion and semantic matching remain unchanged. Every evidence record, Signal identity, Theme identity, and support relationship remains available to downstream production functions.

At Themes, the benchmark reproduces the canonical confidence and stability formulas but replaces only:

- `evidence.length × 0.09`, capped at `0.35`; and
- `evidence.length × 0.12`, capped at `0.55`

with the equivalent count of unique contributing `sourceId` values. Signal-derived Theme confidence remains owned by the Sprint 112 Signal shadow; only its Theme stability receives the Theme composition policy.

Reliability, timestamps, semantics, contradictions, Mechanisms, ranking policy, Executive Assessment, recommendations, Runtime contracts, and schemas are not changed.

Unprovenanced records remain independently contributing because missing provenance is not evidence of common origin.

## Determinism strategy

The benchmark uses:

- a fixed clock;
- deterministic entropy;
- canonical fixture ordering by `sourceId` and evidence text;
- production-order preservation for equal confidence;
- repeated production and shadow execution;
- reversed evidence-order equivalence;
- reversed source-order equivalence;
- stable evidence identity assertions; and
- stable organization identity assertions.

No Runtime is persisted and no fixture is mutated.

## Scenario results

| Scenario | Theme changes | Theme confidence delta | Signal-only Theme changes | Theme-policy changes | Recommendation changed |
|---|---:|---:|---:|---:|---|
| Baseline independent | 0 | 0.000 | 0 | 0 | No |
| Exact duplicate | 6 | −0.360 | 4 | 6 | Yes |
| Ten repeated, one source | 6 | −0.800 | 4 | 6 | Yes |
| Three independent | 0 | 0.000 | 0 | 0 | No |
| Adversarial A×10, B×1, C×1 | 7 | −0.355 | 7 | 7 | Yes |
| Forty records, one source | 6 | −0.800 | 4 | 6 | Yes |
| Smaller distributed support | 0 | 0.000 | 0 | 0 | No |
| One strong source | 0 | 0.000 | 0 | 0 | No |
| Irrelevant plausible evidence | 0 | 0.000 | 0 | 0 | No |
| Contradiction held constant | 0 | 0.000 | 0 | 0 | No |
| Reliability metadata unused | 0 | 0.000 | 0 | 0 | No |
| Timestamp metadata unused | 0 | 0.000 | 0 | 0 | No |
| Reverse evidence order | 7 | −0.595 | 7 | 6 | Yes |
| Forward evidence order | 7 | −0.595 | 7 | 6 | Yes |
| Reverse source order | 0 | 0.000 | 0 | 0 | No |
| Unprovenanced control | 0 | 0.000 | 0 | 0 | No |

Reverse evidence and source variants are byte-equivalent to their canonical counterparts after benchmark input normalization.

## Stage-by-stage impact

| Stage | Changed objects | Confidence delta | Ranking delta | Ordering changed | Support identity delta |
|---|---:|---:|---:|---|---:|
| Themes | 39 | −3.505 | 14 | Yes | 0 |
| Mechanisms | 3 | 0.000 | 0 | No | 0 |
| Beliefs | 30 | 0.000 | 0 | No | 0 |
| Concepts | 32 | −0.133 | 0 | No | 0 |
| Theories | 18 | −0.071 | 0 | No | 0 |
| Conditions | 48 | −0.145 | 10 | Yes | 0 |
| Organizational State | 6 | +0.001 | 0 | No | 0 |
| Executive Assessment | 6 | −0.012 | 0 | No | 10 |
| Executive Projection | 6 | 0.000 | 0 | No | 10 |

Across 16 scenarios:

- recommendation changes: 6;
- risk changes: 0;
- opportunity changes: 3;
- primary-constraint changes: 6;
- evidence identity changes: 0; and
- organization identity changes: 0.

Recommendation movement is observed behavior, not evidence of improvement. The benchmark contains no policy authorizing a preferred recommendation change.

## Theme-specific findings

### Finding 1: corrected Signal confidence is not universally masked

In the higher-volume duplicate scenarios, the Signal-only shadow already changes four to seven Themes. Sprint 112's zero Theme movement was therefore specific to its canonical provenance corpus, not a universal propagation rule.

### Finding 2: Theme composition independently reintroduces record-volume corroboration

Adding the Theme-only policy changes six or seven Themes in the duplicate-volume scenarios even after Signal correction is already active. Independent and single-source controls remain unchanged.

Theme composition is therefore not merely masking an upstream Signal delta. Its direct evidence-count terms independently reward repeated records.

## Downstream propagation findings

The Theme correction propagates broadly:

- Theme ordering changes;
- three Mechanisms change structurally;
- Beliefs, Concepts, and Theories change;
- Condition ranking changes;
- six primary constraints change;
- Executive Assessment support ancestry changes; and
- six recommendations and Executive Projections change.

Because the experiment holds Mechanism logic constant, the broad movement demonstrates sensitivity in existing downstream composition rather than a coordinated Evidence Independence policy.

## Outcome classification

### D — Unsafe or ambiguous

The Theme boundary is materially responsible for record-volume effects, but correcting it in isolation changes ordering, Condition ranking, support ancestry, primary constraints, recommendations, and Executive Projections.

The benchmark cannot establish that these movements are beneficial. Classification A is not satisfied, and no production change is authorized.

## Regression results

- Evidence Independence Benchmark: 16/16 PASS
- Evidence Independence Shadow Evaluation: PASS; Classification C preserved
- Theme Evidence Composition Isolation: PASS; Classification D
- Evidence Provenance Preservation: 11/11 PASS
- Judgment Lab framework: 15/15 PASS
- Judgment Lab expansion: 15/15 PASS
- Northstar Ground Truth: unchanged at 75/100
- Executive Decision Lab: 39/39 PASS
- Executive Decision order independence: PASS
- Operating Model Evolution Lab: 14/14 PASS
- Executive Simulation: PASS
- Cognition validation: PASS, 32 capabilities
- Architecture validation: unchanged at 291/302 with the 11 accepted findings
- Typecheck: PASS
- Production build: PASS with the six existing React Hook warnings

The focused benchmark preserves byte-identical repeated production and shadow runs. Canonical Atlas and Northstar fixtures remain unchanged.

## Recommended next experiment

Do not implement Theme Evidence Independence in production.

The next experiment should remain benchmark-only and isolate the Mechanism evidence-volume path while using hidden ground truth to distinguish beneficial sensitivity from recommendation churn. It must compare:

- Signal-only correction;
- Signal plus Theme correction; and
- Signal plus Theme plus Mechanism contribution correction

without changing contradictions, reliability, recency, condition ranking, or recommendation policy.

Only a result that preserves stable identities and improves ground-truth causal fidelity without arbitrary constraint or recommendation movement should reopen production consideration.
