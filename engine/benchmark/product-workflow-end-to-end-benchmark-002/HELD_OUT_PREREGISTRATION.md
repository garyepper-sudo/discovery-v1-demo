# Held-Out Preregistration

- Frozen baseline: `dfe9905dff3e202d7138f1f0fdadbe63eed396c9`
- Scenario status: untouched-controlled-holdout
- Scenario count: 10
- Recommendation implementation frozen: yes
- Deterministic communication implementation frozen: yes
- Model arm: not executed; the existing conversation interpreter is not a frozen benchmark-safe Communication Brief renderer.
- Human plan: at least three independent readers, at least six presentations each, with at least two readers independent of Discovery architecture and benchmark development.
- Invalidation: any post-output expectation change invalidates the affected scenario; a correctness correction requires a new untouched scenario.

## Frozen source hashes

- engine/benchmark/product-workflow-end-to-end-benchmark-001/runBenchmark.ts: `a562ddd8f19f5a5614af841b244d8efdc90a998eb7a94f1aa0c569fbdc066c03`
- engine/benchmark/product-workflow-end-to-end-benchmark-001/types.ts: `eb409e764ff9ef087daff39eaa9dcf72bba81cee313b5a7101723715c5fdb176`
- product/acquisition/shadow/selectMaterialInformationAcquisition.ts: `b3b188e3babfaba189b75401804b98017f64671d920d71f042533061a428e25b`
- product/improvements/candidateEnvelope.ts: `7de708140a9401e47d6b94ea5029f30340852b58b1dd2951bc515ef3728bcc6d`
- product/objectives/resolveObjectiveContext.ts: `5790b454d15c40f91a1c1b98758fcbcf018a077e4e76830bad2ab675f28976a0`
- engine/benchmark/product-workflow-end-to-end-benchmark-001/communication.ts: `7ae93a008d3bb1034d5b1b4bfe78b3ecf04d8aaf26b10af7c086218c5a9e02d1`
- product/integration/canonicalProductWorkspaceAdapter.ts: `ddbe50ae23c22947b0a279ed3af0bbdd1bcca362560a134961459b29cf4308a9`

## Frozen scenarios

- holdout-01-aviation: input `9e867650d2c99a24976b9f71657aba95865ff2d63fa146f9b7e6305f4c5b40f2`; coverage dominant-mechanism, contradictory-outcome; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-02-healthcare: input `e4bd3502c0d91aa5d39b90e568701c82969956a4b38806b7c5c5c8ef7b9b7412`; coverage competing-explanations; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-03-objective-waste: input `75a7268cf5697f116d0f83a682cf31ff52f01bc2c1c0dc24ec00e24a8e2caee3`; coverage objective-reversal; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-04-objective-reach: input `1365b8822b6a7e52d45d6444b00657405e848e47799e84518f40314b71eb430c`; coverage objective-reversal; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-05-context-rapid: input `6cd43d659ea76d78f33042736fb8b1d085ea840dfe37a77c2014d67baa885319`; coverage context-reversal; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-06-context-depth: input `b864ad9ad7c1695c72932e98569239f865c7fb35c88eae69f4e80f4eed6dd3e3`; coverage context-reversal; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-07-municipal: input `6dbcdae91dbc0ae253483789d9eefa47fca8cfcf5208dd3f02d750d59a017796`; coverage governance-prohibition; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-08-university: input `d7019d28b3285585e760da60f44fb5c37e6f2b4500766047ef2f5f2fb6dffe4d`; coverage authorization-revocation; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-09-manufacturing: input `d24c4a29fb689eb5cc69c7cb6811a7c1a07d6f18eb860737e0892a6a1ff91212`; coverage stale-context, insufficient-evidence; prior exposure not-viewed-by-recommendation-implementation-before-freeze.
- holdout-10-retail: input `07527af4ed7ab602bcf7314afe48abcdd7fc69b59d78f2a5967b4352c6a263f3`; coverage understanding-sufficient; prior exposure not-viewed-by-recommendation-implementation-before-freeze.

## Frozen expected properties

- holdout-01-aviation: selected-action / av-compare-signoff; expectation `def30548a3dec5d3e90d14a414db5a9df5eb3cb8eb13561755746fc769e24a8d`.
- holdout-02-healthcare: material-tie; expectation `a575f11e200401f609a36b6f2aeeac1637008fde1aa1ac61f9bdd4dc6f2573ac`.
- holdout-03-objective-waste: selected-action / food-spoilage; expectation `ac7813b7be38a4e7caabc915909db442fd009f3b6c56780a8ab622a62ef0e479`.
- holdout-04-objective-reach: selected-action / food-demand; expectation `71dc7f1f008526ac6b8804e9d3f1949c07ba0b64faa11993b00c7c7bd26686da`.
- holdout-05-context-rapid: selected-action / support-routing; expectation `49039b0789e4a7f23b2be39e3be39b96c0adbf93c9dd25a4fc1440169fbbc1af`.
- holdout-06-context-depth: abstain; expectation `f57f2ecd2b35b2c46fafcf8a59a116b68ff0a724adc4d126191c57d182893e45`.
- holdout-07-municipal: selected-action / mun-aggregate-rework; expectation `f78ee0c139535876f996704c90f6081f01baa66ed9b4369ca5c5e4e551ce26ca`.
- holdout-08-university: selected-action / uni-advising-aggregate; expectation `0e42d35c2304645b489be583491ca8e15d0d1bb62f2b2ebd4e1c338119c0fe46`.
- holdout-09-manufacturing: abstain; expectation `7a09387a0a3c113af6d61ed73dfecfbcc5f908271fe78ae3e12cb33338c05eda`.
- holdout-10-retail: stop; expectation `69f1fe3c119fc4af7ee6142bfe742076b399147ae65da5ebe511c2c845701311`.

Hard gates require zero unsupported claims, unauthorized Evidence, leakage, semantic drift, stale Context use, prohibited selection, selector/renderer writes, model changes or added facts, withheld exposure, connector calls, external actions, frontend imports, and Production operations.
