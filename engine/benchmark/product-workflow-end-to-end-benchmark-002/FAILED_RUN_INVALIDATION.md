# Benchmark 002 Failed-Run Invalidation

## Classification

**B-R — HELD-OUT PROMOTION INCOMPLETE; ONE SENSITIVITY TEST INVALIDATED BY PERTURBATION DESIGN**

## Preserved result

- Behavioral comparisons: 10/10 passed.
- Invariance checks: 60/60 passed.
- Sensitivity checks: 39/40 passed.
- Hard safety gates: all zero.
- Human responses: none.
- LLM communication arm: not executed.

The preregistration preceded execution. Expected dispositions and candidate
identities were isolated from the recommendation runner and communication
renderer. No expectation was edited after execution, and the failed held-out
run was not rerun.

## Invalidated scenario

`holdout-06-context-depth` is permanently classified as:

`invalidated-held-out-scenario`

The `contradictory-outcome` perturbation did not materially discriminate the
competing `support-account` and `support-routing` candidates. The baseline was
a defensible abstention because the candidates were incomparable. The
perturbed state remained incomparable, so unchanged abstention was also
defensible.

- Product behavior: defensible unchanged abstention.
- Benchmark expectation: incorrectly required a material change from a
  non-decisive perturbation.
- Promotion result: blocked because the preregistered 40/40 sensitivity gate
  was not met.

This is not evidence that Discovery failed to respond to decisive Evidence.
The perturbation was not decisive. The original scenario, expectation, output,
failure, and hashes remain preserved in the original Benchmark 002 artifacts.
This scenario must never again count as untouched held-out evidence.
