# Mechanism Evidence Composition Ground-Truth Benchmark

**Status:** Sprint 114 complete

**Scope:** Benchmark infrastructure only

**Production behavior:** Unchanged

## Question

When hidden causal ground truth is known, does independent-source contribution through the Mechanism boundary improve identification of the true mechanism and organizational condition?

## Experimental architecture

The benchmark runs four isolated policies against the same deterministic fixture:

| Policy | Signal | Theme | Mechanism |
|---|---|---|---|
| P0 | Production | Production | Production |
| P1 | Independent-source contribution | Production | Production |
| P2 | Independent-source contribution | Independent-source contribution | Production |
| P3 | Independent-source contribution | Independent-source contribution | Independent-source contribution |

The P3 adapter replaces only the canonical Mechanism confidence term:

```text
min(evidence.length × 0.025, 0.1)
```

with the same bounded term calculated from unique contributing `sourceId` values. It does not alter evidence identities, relationship confidence, connection bonuses, Mechanism strength, Mechanism stability, semantic matching, contradictions, reliability, recency, condition ranking, Executive Assessment, recommendation scoring, Runtime, schemas, or capability ownership.

Unprovenanced evidence remains independently contributing because missing provenance does not establish common origin.

## Hidden-ground-truth fixture

The pipeline receives only the organizational question and synthetic evidence. Hidden labels are retained by the benchmark and used only after execution.

The hidden truth identifies:

- decision-authority ambiguity as the true causal mechanism;
- Decision Flow as the true organizational condition;
- three independent sources supporting the true claim;
- one source responsible for duplicate-heavy staffing claims;
- irrelevant and non-decisive contradictory evidence; and
- decision-authority, delegation, or approval reduction as the aligned recommendation family.

The 13 deterministic cases cover:

1. duplicate-heavy false mechanism;
2. independent corroboration for the true mechanism;
3. high-volume single-source minority claim;
4. low-volume multi-source true claim;
5. two plausible competing mechanisms;
6. one decisive independent source without corroboration;
7. irrelevant plausible evidence;
8. contradiction held constant;
9. reversed evidence order;
10. forward evidence-order control;
11. reversed source order;
12. unprovenanced control; and
13. sparse evidence control.

## Scoring

Movement counts as beneficial only when it improves hidden-ground-truth scoring.

Mechanism fidelity measures true selection and rank, false-mechanism rank, confidence margin, independent-source support, and duplicate-volume sensitivity.

Condition fidelity measures true-condition selection and rank, primary-constraint accuracy, condition confidence, and order stability.

Executive consequence fidelity measures recommendation-family alignment, recommendation movement, risk and opportunity stability, and evidence ancestry.

## Four-policy results

| Policy | Composite score | True Mechanism selected | Mean true Mechanism rank | Mean independent support | True Condition selected | Mean Condition rank | Mean Condition confidence | Primary constraint accurate | Recommendation-family alignment |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| P0 | 66.00 | 3/13 | 2.00 | 1.15 | 4/13 | 1.69 | 0.699 | 0/13 | 13/13 |
| P1 | 72.00 | 3/13 | 2.00 | 1.15 | 6/13 | 1.54 | 0.704 | 0/13 | 13/13 |
| P2 | 72.00 | 3/13 | 2.00 | 1.15 | 6/13 | 1.54 | 0.704 | 0/13 | 13/13 |
| P3 | 72.00 | 3/13 | 2.00 | 1.15 | 6/13 | 1.54 | 0.704 | 0/13 | 13/13 |

## Critical comparisons

| Comparison | Beneficial | Neutral | Harmful | Arbitrary | Propagation finding |
|---|---:|---:|---:|---:|---|
| P0 → P1 | 2 | 10 | 0 | 1 | Signal correction improves Condition selection in the two duplicate-heavy cases. |
| P1 → P2 | 0 | 13 | 0 | 0 | Theme correction produces no additional ground-truth fidelity in this fixture. |
| P2 → P3 | 0 | 11 | 0 | 2 | Mechanism count correction changes bounded confidence details but not selection, rank, Condition, or executive accuracy. |
| P0 → P3 | 2 | 8 | 0 | 3 | All scored benefit is attributable to the Signal boundary, not the Theme or Mechanism boundary. |

P0 to P3 changes five recommendation objects, but recommendation-family alignment remains 13/13. Risk counts and opportunity counts remain stable. Movement is therefore reported as output movement, not improvement.

## Mechanism-fidelity finding

P3 removes the isolated raw record-volume bonus at the Mechanism boundary, but it does not improve:

- true-Mechanism selection;
- true-Mechanism rank;
- false-Mechanism displacement;
- supporting-source independence; or
- the true-versus-false confidence relationship.

The Mechanism boundary is not the missing causal-fidelity boundary for this fixture.

## Condition-fidelity finding

P1 improves true-Condition selection from 4/13 to 6/13 in the duplicate-heavy cases. P2 and P3 add no further improvement. No policy selects Decision Flow as the primary Executive Constraint in any case.

This identifies a later constraint-ranking limitation, but it does not authorize changing that ranking. The sprint held all Condition and Executive Assessment formulas constant.

## Recommendation-fidelity finding

All policies remain within the expected decision-authority recommendation family. Five P0-to-P3 recommendation objects change, while risk and opportunity counts remain stable. Because hidden-ground-truth alignment does not improve, those changes are neutral output sensitivity rather than demonstrated executive benefit.

## Determinism

- repeated execution is byte-identical for every policy;
- reversed record order is equivalent after benchmark input normalization;
- reversed source order is equivalent after benchmark input normalization;
- evidence identities are stable across P0–P3;
- organization identities are stable;
- no Runtime is persisted; and
- no canonical fixture is mutated.

## Classification

### C — Evidence independence is not sufficient

Independent-source contribution at Signals corrects two duplicate-heavy Condition outcomes. Extending the policy through Themes and Mechanisms produces no additional hidden-ground-truth gain. P3 does not resolve true-Mechanism selection or primary-constraint accuracy.

No production change is authorized.

## Production readiness decision

Do not implement Mechanism Evidence Independence in production.

The next benchmark should isolate the earliest condition-to-primary-constraint ranking boundary using the corrected Signal shadow and hidden ground truth. It should not add another evidence-weighting policy and should not change recommendation scoring.
