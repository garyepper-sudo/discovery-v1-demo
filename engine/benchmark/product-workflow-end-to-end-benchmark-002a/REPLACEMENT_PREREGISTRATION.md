# Benchmark 002A Replacement Preregistration

- Baseline: `e6dc115` (Phase A failed-run canonization)
- Scenario: `holdout-11-outcome-discrimination`
- Classification before execution: `untouched-controlled-holdout`
- Prior exposure count: 0
- Scenario hash: `8b11bc59073fde6cd18a0f1ee4e86b5fa6669d14ac274e7ccc83c8590f793f0d`
- Expectation hash: `d57fa5197bf383ec1b5e70ed169a93083755b45afb15cc7f19bc59186040672d`
- Question: `holdout-question-coldchain:v1`
- Unknown: `holdout-unknown-coldchain:v1`
- Objective: `objective-coldchain:v1`
- Context: `context-coldchain:v1`
- Baseline candidates: `coldchain-door-dwell`, `coldchain-refrigeration`
- Expected baseline: selected-action / coldchain-door-dwell
- Expected material Outcome: selected-action / coldchain-refrigeration
- Expected unrelated Outcome: no substantive disposition, candidate, rationale, or communication change.
- LLM arm: not executed.
- Invalidation: any post-output expectation change permanently invalidates this scenario.

## Frozen implementation hashes

- product/acquisition/shadow/selectMaterialInformationAcquisition.ts: `b3b188e3babfaba189b75401804b98017f64671d920d71f042533061a428e25b`
- product/improvements/candidateEnvelope.ts: `7de708140a9401e47d6b94ea5029f30340852b58b1dd2951bc515ef3728bcc6d`
- product/objectives/resolveObjectiveContext.ts: `5790b454d15c40f91a1c1b98758fcbcf018a077e4e76830bad2ab675f28976a0`
- engine/benchmark/product-workflow-end-to-end-benchmark-001/runBenchmark.ts: `a562ddd8f19f5a5614af841b244d8efdc90a998eb7a94f1aa0c569fbdc066c03`
- engine/benchmark/product-workflow-end-to-end-benchmark-001/communication.ts: `7ae93a008d3bb1034d5b1b4bfe78b3ecf04d8aaf26b10af7c086218c5a9e02d1`
- product/integration/canonicalProductWorkspaceAdapter.ts: `ddbe50ae23c22947b0a279ed3af0bbdd1bcca362560a134961459b29cf4308a9`
