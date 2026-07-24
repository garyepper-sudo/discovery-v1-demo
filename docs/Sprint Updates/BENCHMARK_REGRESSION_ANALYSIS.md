# Discovery Benchmark Regression Analysis

Date: 2026-07-23
Baseline commit context: `5bee35a827a51b5aadf9d33b83d5ba89457396f9`

## Classification rules

This report separates observed evidence from architectural inference. A score difference is not called a regression unless its fixtures, evaluator, state construction, and code context are comparable.

## Findings

### 1. Shared Atlas fixture makes Decision Lab order-dependent

- **Classification:** Benchmark fixture deficiency
- **Expected:** Canonical benchmark order does not affect results.
- **Actual:** Executive Decision Lab failed after `simulate:atlas` because the simulation rewrote the shared Atlas Runtime. It passed 39/39 after that previously clean file was restored byte-for-byte.
- **Evidence:** The failure was implementation-capacity-reduced response `inconclusive` instead of `appropriate-change`; the nonasserting replay also changed scope and risk behavior. No production code changed between fail and pass.
- **Likely cause:** Decision Lab consumes mutable persisted Atlas state instead of creating/restoring an isolated fixture.
- **Confidence:** High
- **Producer / consumer:** Atlas benchmark fixture producer / Executive Decision Lab
- **Executive impact:** None in production; high risk of false regression signals and wasted optimization effort.
- **Recommended investigation:** Make the Decision Lab establish and restore its own canonical Atlas fixture, then add explicit order-independence coverage.

### 2. Ground Truth loses concurrency and staffing semantics before Signals

- **Classification:** Synthesis deficiency
- **Expected:** The canonical replay should preserve the explicit semantic groups for excessive concurrency and “staffing is not the root cause.”
- **Actual:** Fresh Ground Truth is 75/100: concurrency 1/3 groups and staffing 2/3 groups.
- **Evidence:** The persisted-state Precision Gap trace first finds both meanings in Observations and first loses them in Signals. Some downstream layers recover compressed related meaning, but not enough exact semantic coverage for the evaluator.
- **Likely cause:** Observation-to-Signal normalization/compression does not preserve all benchmark concepts.
- **Confidence:** Medium, because Precision Gap and Ground Truth currently use different state-construction paths.
- **Producer / consumer:** Signal inference / mechanisms, beliefs, theories, conditions, and Executive Assessment
- **Executive impact:** Executives may receive a broadly correct diagnosis without the full distinction between too much concurrent work and a mistaken staffing explanation.
- **Recommended investigation:** First replay the isolated Ground Truth Runtime through a layer-local semantic trace. Only if the same first loss is reproduced should Signal synthesis be considered for a narrow repair.

### 3. Historical 85 cannot be reproduced under the current isolated method

- **Classification:** Evaluator deficiency
- **Expected:** Historical and current scores should identify their state-construction method.
- **Actual:** The historical artifact reports 85 from an older persisted-state context; the current isolated replay deterministically reports 75. The rubric is unchanged.
- **Evidence:** Commit history shows the later change to `runCanonicalNorthstarGroundTruthReplay()` and fixed scoring time without a rubric change.
- **Likely cause:** Historical result provenance did not fully capture the exact persisted Runtime used to score 85.
- **Confidence:** High
- **Producer / consumer:** Ground Truth state-construction/evidence provenance / benchmark readers
- **Executive impact:** Mislabeling the difference as a regression could direct engineering toward the wrong layer.
- **Recommended investigation:** Preserve replay manifest, fixture hashes, commit, and state-construction mode with every future recorded score.

### 4. Production evolution replay does not preserve historical mechanism truth

- **Classification:** Reasoning deficiency
- **Expected:** Contradictory evidence should evolve a continuing mechanism without overwriting its historical truth.
- **Actual:** The production replay passes 7/8 expectations but reports `historical-overwrite` at the stable mechanism identity.
- **Evidence:** The focused Sprint 101 mechanism-confidence regression passes contradiction matching, deduplication, order independence, unrelated/new-mechanism stability, and bounded confidence. The remaining failure is specifically historical memory.
- **Likely cause:** Historical mechanism lineage/lifecycle behavior remains unimplemented, as intentionally documented.
- **Confidence:** High
- **Producer / consumer:** Historical mechanism memory / longitudinal organizational understanding
- **Executive impact:** Discovery cannot yet explain how a mechanism changed across time, merged, split, retired, reactivated, or was superseded.
- **Recommended investigation:** Keep deferred until a benchmark-prioritized lifecycle sprint; do not combine it with Ground Truth or fixture work.

### 5. Architecture reciprocity/export checks remain unresolved

- **Classification:** Known validation debt
- **Expected:** All actual producer exports and reciprocal dependency declarations satisfy `verify:architecture`.
- **Actual:** 291/302 checks pass; 11 fail.
- **Evidence:** Three reciprocal-link findings and six producer-export findings reproduce exactly. Registry validation separately passes.
- **Likely cause:** Generated registry metadata and deeper source/export reciprocity checks are not fully aligned.
- **Confidence:** High
- **Producer / consumer:** Capability registry/source exports / architecture tooling and maintainers
- **Executive impact:** No observed product failure, but weaker change-impact traceability and architectural assurance.
- **Recommended investigation:** Address in a dedicated architecture-validation debt sprint, not a reasoning sprint.

### 6. Organizational Intelligence governance remains benchmark-only in key areas

- **Classification:** Known validation debt
- **Expected:** Architecture-fit reporting distinguishes demonstrated production behavior from benchmark policy simulation.
- **Actual:** Score is 99.63, but the lab classifies visibility enforcement as `BENCHMARK_POLICY_ONLY` and persistent authorization plus temporal policy behavior as `GENUINE_GAP`.
- **Evidence:** All 12 cases and privacy hard-failure gates pass; cognition reuse is supported, while scoped composition/privacy projection are supported only in the benchmark wrapper.
- **Likely cause:** Canonical governance documents and benchmark models precede production authorization infrastructure.
- **Confidence:** High
- **Producer / consumer:** Future authorization/visibility enforcement / future shared-intelligence applications
- **Executive impact:** No claim of production privacy enforcement can be made from the benchmark alone.
- **Recommended investigation:** Defer until governance implementation is explicitly authorized.

### 7. Judgment Lab observes limited evidence sensitivity

- **Classification:** Unknown
- **Expected:** Decisive evidence changes should measurably affect judgment where fixtures require it.
- **Actual:** Framework validation passes 15/15 but reports sensitivity observed as `limited`.
- **Evidence:** The framework preserves evidence boundaries, determinism, input-order stability, and score separation.
- **Likely cause:** Could be fixture strength, evaluator sensitivity, or reasoning insensitivity; current framework result does not distinguish them.
- **Confidence:** Low
- **Producer / consumer:** Unknown / Judgment Lab evaluator
- **Executive impact:** Potentially insufficient response to decisive evidence, but no production defect is proven.
- **Recommended investigation:** Run a controlled decisive-evidence ablation before assigning ownership.

### 8. Initial validator execution failed in the filesystem sandbox

- **Classification:** Infrastructure failure
- **Expected:** `tsx` can create its local IPC socket.
- **Actual:** Six commands initially failed with `listen EPERM` before their benchmark code ran; all succeeded unchanged outside the restricted sandbox.
- **Evidence:** Identical commands and repository state, different execution permission.
- **Likely cause:** Sandbox IPC restriction.
- **Confidence:** High
- **Producer / consumer:** Local execution environment / benchmark runner
- **Executive impact:** None.
- **Recommended investigation:** None beyond recording that benchmark execution requires an IPC-capable environment.

## Items that are not regressions

- Historical Ground Truth 85 versus current 75: partially comparable methodology.
- Sprint 110 scores versus Ground Truth: different fixtures, evaluators, providers, dimensions, and purposes.
- Atlas legacy 73% versus canonical 100%: the runner explicitly reports separate legacy and canonical models.
- Current collaboration development scores 67.47/91.67 versus recorded combined 63.36/90.88: development-only versus development-plus-held-out.
- Architecture registry 100% versus verification 291/302: different validation depth.
- Existing React Hook build warnings: unchanged and unrelated.

## Ranked improvement opportunities

1. **Isolate the Executive Decision Lab fixture and prove suite-order independence.** Highest certainty, narrow benchmark-only scope, prevents false production regressions, and does not alter scoring or cognition.
2. Add an isolated Ground Truth layer trace to confirm whether Observations-to-Signals is the earliest responsible semantic-loss boundary.
3. After that proof only, consider one narrow signal-semantic preservation repair.
4. Record complete benchmark provenance with every Ground Truth result.
5. Investigate Judgment Lab evidence sensitivity through a controlled ablation.
6. Address historical mechanism lineage in its own lifecycle sprint.
7. Resolve architecture reciprocity/export debt separately.
8. Implement persistent/temporal governance only when platform implementation is authorized.

## Exactly one recommended next improvement

**Make Executive Decision Lab fixture setup and teardown self-contained, and add a regression that runs it both before and after Atlas simulation.**

Why this is first:

- the defect was directly reproduced;
- its cause is isolated with high confidence;
- it can create false production failures in the canonical regression sequence;
- it is benchmark-only and does not change Discovery behavior;
- it is smaller and lower risk than changing semantic synthesis based on a diagnostic that currently uses a different Runtime construction path.

Expected scope: the Executive Decision Lab fixture/validator and a focused order-independence regression. Expected production risk: none. Expected benchmark risk: low. Do not alter benchmark expectations, scores, Runtime contracts, Atlas simulation, or production logic.

## Safety conclusion

Only this report and `BENCHMARK_BASELINE.md` were created by the investigation. Sprint 110, pre-existing generated artifacts, local Runtime state, documentation, provider output, and unrelated user work were not staged or committed. The capability validator regenerated its already-dirty audit file; it was left dirty rather than risking restoration over pre-existing work. The two benchmark-mutated tracked Runtime fixtures were restored exactly. No production behavior was changed.
