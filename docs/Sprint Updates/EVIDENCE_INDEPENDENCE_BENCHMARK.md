# Evidence Independence Benchmark

**Status:** Sprint 111 benchmark design

**Scope:** Benchmark infrastructure only

**Production behavior:** Unchanged

## Question

Does grouping supporting evidence by stable `sourceId`, and retaining only the strongest bounded contribution from each source, eliminate false corroboration from repeated records while preserving corroboration across independent sources?

This benchmark evaluates evidence independence only. It does not evaluate source reliability, recency, semantic similarity, contradiction weight, diagnostic value, condition ranking, recommendation scoring, or mechanism confidence.

## Design

The fixture creates structured evidence through the canonical `buildEvidence()` ingestion path so every record carries the production-preserved provenance fields. A benchmark-local adapter then:

1. uses a fixture-declared target relation to isolate supporting, opposing, and irrelevant evidence;
2. groups supporting records by exact stable `sourceId`;
3. chooses the strongest bounded evidence confidence within each source;
4. sorts source contributions by `sourceId`; and
5. sums the independent-source contributions.

The fixture-declared relation prevents this experiment from introducing semantic matching or contradiction scoring. The resulting sum is a benchmark support measure, not a production confidence value.

The deterministic suite covers:

- baseline independent sources;
- exact duplicates from one source;
- semantically repeated records sharing one source;
- identical observations from independent sources;
- removal of one independent source;
- one strong independent source;
- ten duplicates versus three independent observations;
- large single-source volume versus distributed corroboration;
- irrelevant but plausible evidence;
- contradictory evidence held constant;
- reversed evidence order;
- reversed source order;
- reliability metadata present but ignored;
- timestamp metadata present but ignored; and
- the adversarial `A × 10, B × 1, C × 1` case.

## Expected invariants

- Repeating records from one `sourceId` cannot add independent support.
- Distinct `sourceId` values retain separate contributions even when their text is identical.
- Removing an independent source removes its contribution.
- A large record count from one source cannot outrank otherwise equivalent distributed corroboration.
- Irrelevant evidence cannot affect the target support measure.
- Opposing evidence remains observable but receives no weight or penalty in this experiment.
- Reliability and timestamp metadata cannot affect the result.
- Input record order and source order cannot affect the result.
- Every individual contribution remains within `[0, 1]`.

## Determinism strategy

The adapter uses exact `sourceId` equality, a deterministic strongest-record selection, stable lexical tie-breaking, stable lexical source ordering, and fixed six-decimal arithmetic at the aggregate boundary. Repeated replay, reversed record order, and reversed source order must return deeply equal results.

## Success criteria

The benchmark succeeds when:

- duplicate records increase raw record contribution but not independent-source contribution;
- distributed independent sources preserve their separate contributions;
- the adversarial 12-record fixture resolves to three independent sources;
- all order and replay checks remain deterministic;
- ignored metadata cannot change the output; and
- focused and canonical regression suites remain unchanged.

## Failure criteria

The benchmark fails if:

- duplicate records from one source add independent support;
- identical observations from separate sources collapse together;
- a single high-volume source outranks equivalent distributed support;
- reliability, timestamps, opposition, irrelevant evidence, or input order change the isolated result;
- production code is needed to execute the experiment; or
- a canonical regression changes.

## Earliest responsible production point

Observed production code first converts raw matched record count into confidence at `engine/v3/signals.ts`, where `calculateSignalConfidence()` uses `evidence.length` for its support bonus. Raw evidence count also contributes later in `engine/v3/themes.ts` and `engine/v3/mechanism.ts`. This is an ownership trace, not an authorization to change any of those files.

## Regression plan

Sprint 111 validation includes:

- the focused Evidence Independence Benchmark;
- repeated focused replay;
- Evidence Provenance Preservation;
- Judgment Lab provenance validation;
- Judgment Lab canonical and expansion validation;
- Northstar Ground Truth;
- Executive Decision Lab and order independence;
- Operating Model Evolution Lab and production replay;
- Executive Simulation;
- cognition validation;
- typecheck; and
- production build.

Canonical Atlas and Northstar Runtime fixtures must remain unchanged.

## Production readiness criteria

A later production proposal must demonstrate all of the following at the real earliest aggregation boundary:

1. duplicate evidence no longer inflates support;
2. independent corroboration remains intact;
3. deterministic replay remains intact;
4. existing benchmark suites do not regress;
5. `sourceId` is sufficient at the responsible producer; and
6. the change remains isolated from reliability, recency, contradiction, ranking, recommendation, and mechanism-confidence policy.

Sprint 111 does not itself authorize or implement that proposal. If integration safety cannot be demonstrated separately, production reasoning must remain unchanged.

## Observed results

The focused benchmark passed all 16 checks on two identical runs.

| Comparison | Raw records | Independent sources | Raw contribution | Independent contribution |
|---|---:|---:|---:|---:|
| Exact duplicate pair | 2 | 1 | 1.44 | 0.72 |
| Ten duplicates from Source A | 10 | 1 | 7.20 | 0.72 |
| Three identical independent observations | 3 | 3 | 2.16 | 2.16 |
| Forty records from one source | 40 | 1 | 28.80 | 0.72 |
| Adversarial A × 10, B × 1, C × 1 | 12 | 3 | 8.64 | 2.16 |

The experiment therefore distinguishes repeated evidence volume from independent corroboration using `sourceId` alone. Reverse record order, reverse source order, reliability variants, timestamp variants, irrelevant evidence, and held-constant opposition did not change the isolated result.

## Regression results

- Evidence Independence Benchmark: 16/16 PASS, repeated replay identical
- Evidence Provenance Preservation: 11/11 PASS
- Judgment Lab structured provenance: 16/16 PASS
- Judgment Lab framework: 15/15 PASS
- Judgment Lab expansion: 15/15 PASS
- Northstar Ground Truth: unchanged at 75/100
- Executive Decision Lab: 39/39 PASS
- Executive Decision order independence: PASS
- Operating Model Evolution Lab: 14/14 PASS
- Production Operating Model replay: existing historical-lineage expectation remains deferred; all other expectations passed
- Executive Simulation: PASS
- Cognition validation: PASS, 32 capabilities
- Architecture validation: unchanged at 291/302 with the 11 accepted pre-existing findings
- Typecheck: PASS
- Production build: PASS with existing React Hook dependency warnings
- Diff whitespace validation: PASS

The validation-generated capability registry timestamps were restored after inspection; no generated architecture artifact is part of Sprint 111.

## Conclusion

The benchmark demonstrates that exact `sourceId` grouping removes false corroboration caused by record volume while preserving legitimate independent corroboration. It also identifies Signal confidence construction as the earliest production boundary capable of consuming this signal.

Production reasoning remains unchanged. The result earns a separate, narrow production-candidate evaluation at the Evidence → Signals support boundary, but does not by itself prove integration safety at downstream Theme and Mechanism consumers. A future authorization should require shadow comparison at that boundary plus the full regression plan above before any production formula changes.
