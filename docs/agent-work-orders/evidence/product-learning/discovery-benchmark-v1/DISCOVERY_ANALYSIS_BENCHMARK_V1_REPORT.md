# Discovery Analysis Benchmark V1 — Northstar Checkpoint

Status: development-only-noncanonical-product-research.

This report is deterministically derived from `DISCOVERY_ANALYSIS_BENCHMARK_V1_RESULTS.json` result `4042a2eee662ba9bfcd631eb28e6376e68c6878c676c166489b1313a671f2e2c`.

## Method

source packet → independent system analysis → deterministic hard gates → blind human review → immutable result.

| Case | Discovery hard gates | Frontier hard gates | Human result | Final status |
|---|---|---|---|---|
| M1 | PASS | PASS | Discovery preferred | Discovery human win |
| Evidence removal | PASS | PASS after preserved-output validator re-adjudication | Frontier preferred | Frontier human win |
| Temporal update | PASS | FAIL | Not applicable | Discovery hard-gate win |
| Staffing contradiction | PASS | FAIL | Not applicable | Discovery hard-gate win |

Both frontier hard-gate losses are `commitment-due-date-support / fabricated-due-date`; they are one repeated failure class, not two independent categories.

7 provider entries are preserved and 0 remain. No attempt was retried. Source equivalence is exact in all four cases. Human preferences are preserved from the exact pre-reveal scorecards and reveal mappings in the JSON.

Frozen benchmark identities: analysis `f85e15e7b3485849941dfe06a8db47957f98f565cfa24f44ef44e049707d54f7`; evaluation tooling `3117a0d6ff4d1aa1a8b4458a3560c92dc7290c6d49a796f18e1db3325f87e971`.

Current implementation identities: commit `10a228e6eb22a5f84aaef048860a0973d042193c`; parent `46d69ac48e6a35c5e36287a322ecb2b7056b2361`; tree `12d5318c3d8b383e73758ef2dbdd337b0c3fa77c`; source manifest `a20b264acb5a1438fada5e748354e7761e16047f296364e03cd547c042ca1f8a`; source diff `4a5f0273f908ff52d4c4099b0f65ccc5bdc128cf8c4de6a5d2d308cbea3c7ab9`; SHA-256 source inventory `697060f9ae7d07a8b3616c2499b756c9cd285281dd5ca235e4fa03a5c67cdc13`.

Benchmark analyses were produced under the frozen benchmark identities. The later research-checkpoint implementation restores canonical interactive Product copy and accessibility IDs without changing the reviewed Studio preview outputs or analysis artifacts. Interactive parity, preview-output equality, and benchmark-artifact equality all PASS; no analysis was regenerated and no human score changed.

## Bounded conclusion

Discovery Quality Iteration 1 reached practical parity with the frozen frontier model on the Northstar scenario family. Discovery received the human preference on the initial M1 analysis, the frontier received the human preference when the principal audit evidence was removed, and Discovery preserved stricter commitment and chronology lineage in the temporal and contradiction cases where the frontier output failed the same due-date support hard gate.

## Limitations and next step

one synthetic scenario family; two frontier hard-gate losses share one repeated failure class; no broad multi-domain superiority established; no production-readiness claim; no live Product integration; Northstar M1 must not be optimized further; multi-domain development and sealed holdout evaluation remain required. The live fixture-bound Product remains unchanged. No broad superiority is claimed. Next, run the frozen candidate on multiple development domains, then conduct a separately governed sealed holdout evaluation.
