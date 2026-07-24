# Evidence Independence Shadow Evaluation

**Status:** Sprint 112 complete

**Scope:** Benchmark infrastructure only

**Production behavior:** Unchanged

## Question

If Discovery replaced the raw evidence-record support bonus at the Evidence → Signals boundary with an independent-`sourceId` support bonus today, what would change through Executive Projection?

## Shadow architecture

The production pipeline remains authoritative and executes without modification.

The benchmark-local shadow:

1. runs canonical evidence ingestion and preserves every evidence record;
2. runs canonical Signal detection;
3. subtracts only the production raw-record support-bonus term;
4. adds the equivalent bonus based on unique contributing `sourceId` values;
5. reruns canonical Signal priority scoring and deterministic ordering; and
6. passes the shadow Signals through the unchanged canonical downstream pipeline and an isolated in-memory Runtime.

The support increment and cap remain the production values: `0.045` per contribution, capped at `0.18`. The shadow adds no reliability, recency, semantic-similarity, contradiction, diagnostic, ranking, recommendation, or mechanism policy.

Evidence without `sourceId` remains independently contributing. Missing provenance is not treated as proof that records share an origin.

Both pipelines run with a fixed clock and deterministic random sequence. The benchmark asserts byte-identical repeated production output, byte-identical repeated shadow output, stable organization identity, and stable evidence identities.

## Comparison corpus

The direct production-versus-shadow comparison uses all five canonical structured-provenance Judgment Lab scenarios:

- baseline;
- exact duplicate;
- weakened reliability;
- stale timestamp; and
- independent contradiction.

It also includes an unprovenanced legacy control. Reliability and timestamp differences remain present but intentionally unused.

The required canonical benchmark suites are then run unchanged as regression coverage. Their expectations are not used to construct or score the shadow.

## Scenario results

| Scenario | Changed Signals | Signal confidence delta | Recommendation changed |
|---|---:|---:|---|
| Baseline | 0 | 0.000 | No |
| Exact duplicate | 1 | −0.045 | No |
| Weakened reliability | 0 | 0.000 | No |
| Stale timestamp | 0 | 0.000 | No |
| Independent contradiction | 0 | 0.000 | No |
| Unprovenanced control | 0 | 0.000 | No |

Only the exact-duplicate scenario changed. One Signal lost exactly one duplicate support increment. Its evidence identities, ordering, and rank remained stable.

## Stage-by-stage impact

| Stage | Unchanged objects | Changed objects | Confidence delta | Ranking delta | Ordering changed | Evidence delta |
|---|---:|---:|---:|---:|---|---:|
| Signals | 35 | 1 | −0.045 | 0 | No | 0 |
| Themes | 43 | 0 | 0.000 | 0 | No | 0 |
| Mechanisms | 12 | 0 | 0.000 | 0 | No | 0 |
| Beliefs | 28 | 0 | 0.000 | 0 | No | 0 |
| Concepts | 24 | 0 | 0.000 | 0 | No | 0 |
| Theories | 23 | 0 | 0.000 | 0 | No | 0 |
| Organizational Conditions | 48 | 0 | 0.000 | 0 | No | 0 |
| Organizational State | 6 | 0 | 0.000 | 0 | No | 0 |
| Executive Assessment | 6 | 0 | 0.000 | 0 | No | 0 |
| Executive Projection | 6 | 0 | 0.000 | 0 | No | 0 |

### Signals

The shadow removed one increment of false duplicate corroboration exactly where expected. It did not alter Signal identities, evidence ancestry, ordering, or rank.

### Themes

No Theme changed. Themes continue to calculate confidence and stability from raw evidence records directly. This direct Evidence → Themes path means the localized Signal correction does not necessarily propagate.

### Mechanisms through Executive Projection

No object, confidence, ranking, ordering, or evidence ancestry changed from Mechanisms through Executive Projection.

## Confidence movement

Aggregate confidence movement was `−0.045` at Signals and zero at every downstream comparison stage. There was no generalized confidence recalibration.

Reliability and timestamp variants remained identical to their production counterparts, confirming those fields were ignored.

## Condition-ranking impact

All 48 compared Organizational Conditions were unchanged. Condition composition, confidence, rank, and order were identical. Each Organizational State preserved its condition composition and primary constraint.

## Recommendation impact

Across six scenarios:

- recommendations changed: 0;
- risks changed: 0;
- opportunities changed: 0;
- Executive Assessment explanations changed: 0; and
- Executive Projections changed: 0.

Evidence Independence at Signals alone therefore produced no executive-visible impact in this corpus.

## Earliest responsible producer

Sprint 112 confirms `calculateSignalConfidence()` in `engine/v3/signals.ts` as the earliest production producer that converts raw matched-record count into a support bonus.

It also demonstrates that this is not the only raw evidence-count path. `engine/v3/themes.ts` calculates Theme confidence and stability directly from evidence count, and `engine/v3/mechanism.ts` later includes evidence-count contribution. Those paths were observed but not changed by the shadow.

## Regression assessment

- Evidence Independence Benchmark: 16/16 PASS
- Evidence Independence Shadow Evaluation: PASS; production and shadow replay byte-identical
- Evidence Provenance Preservation: 11/11 PASS
- Judgment Lab structured provenance: 16/16 PASS
- Judgment Lab framework: 15/15 PASS
- Judgment Lab expansion: 15/15 PASS
- Northstar Ground Truth: unchanged at 75/100
- Executive Decision Lab: 39/39 PASS
- Executive Decision order independence: PASS
- Executive Simulation: PASS
- Operating Model Evolution Lab: 14/14 PASS
- Production Operating Model replay: existing historical-lineage expectation remains deferred; all other expectations passed

Canonical Atlas and Northstar fixtures remained unchanged.

## Production-readiness classification

### C — Minimal downstream effect

The localized Evidence → Signals correction removes one measured instance of duplicate confidence inflation, but the effect stops at Signals. It produces no meaningful change in Themes, Mechanisms, organizational understanding, condition ranking, Executive Assessment, recommendations, or Executive Projection.

Classification A is therefore not satisfied, and Sprint 112 does not authorize a production implementation sprint.

## Recommended next sprint

Do not implement Evidence Independence in production.

The next sprint should be a benchmark-only contribution-path isolation experiment. It should determine whether the direct raw evidence-count calculations in Themes mask the corrected Signal contribution, while continuing to hold Mechanism, contradiction, recommendation, reliability, recency, and ranking policy constant.

Only if that experiment produces beneficial executive-level movement without destabilizing identities, rankings, or canonical regressions should a production proposal be reconsidered.
