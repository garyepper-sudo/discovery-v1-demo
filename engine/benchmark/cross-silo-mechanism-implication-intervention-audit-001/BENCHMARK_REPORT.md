# Cross-Silo Mechanism Implication and Intervention Audit 001

## Executive summary

**Classification: E — Combined Defect.**

The first material loss occurs in Mechanism representation and formation.
Generated Mechanisms preserve an upstream statement, downstream statement,
confidence, multi-silo lineage, and causal direction, but generally omit an
explicit mediating relationship, activation or persistence condition,
prediction horizon, competing explanations, and falsification criteria.

The loss is then amplified downstream:

- none of 135 generated Predictions traced directly to an audited Mechanism;
- Predictions were primarily Condition/Concept/Theory-derived;
- no Intervention targeted an audited causal link;
- Interventions lacked explicit expected effects, success criteria, and
  falsification signals;
- an underdetermined negative fragment remained production-eligible.

The defect therefore combines Mechanism representation/formation, downstream
handoff, and adjudication. It cannot be repaired safely by a downstream
projection alone.

## Production path

Raw Evidence entered `runDiscoveryV3()` and its result entered
`evolveOrganizationRuntime()` against a fresh in-memory Runtime. The audit
exercised production Observation, Signal, Theme, Phenomenon, Mechanism,
Prediction, and Executive Decision recommendation producers.

Actual Mechanism fields were `cause`, `mechanism`, `effect`, `confidence`, and
`evidenceIds`. Prediction ancestry used Conditions, Concepts, and Theories.
Recommendation interventions targeted organizational Conditions and Strategy
items. No direct canonical Mechanism-to-Prediction or
Mechanism-to-Intervention ancestry was observed.

## Scenario traces and Mechanism completeness

| Case | Generated structure | Completeness | Production eligibility |
| --- | --- | --- | --- |
| Commercial partial | Agreements → exceptions; 3 silos | 7/10, partial | Eligible |
| Escalation partial | autonomy statement → promotion outcome; 3 silos | 5/10, underdetermined | Eligible |
| Customer failed positive | adjacent confusion/training and awareness fragments | 5/10 each | Ineligible under current 3-silo rule |
| Contradictory failed positive | implementation change → missing owner; 2 silos | 5/10 | Ineligible |
| Insufficient false positive | one review → caution; 3 silos | 5/10, underdetermined | Incorrectly eligible |
| High-connectivity control | empty website marker → travel spending | 5/10 | Ineligible |
| One-silo answer | local residency cause plus Sales outcome | 7/10 | Correctly non-emergent |
| Competing mechanisms | attendance timing correlates turnover and pipeline | 5/10 | Ineligible |

Lineage was complete for generated Mechanisms, but lineage alone did not
establish causal sufficiency.

## Prediction handoff

Production Predictions contained horizons, confidence, condition ancestry, and
often falsifying Evidence. They did not preserve the audited Mechanism’s
upstream driver, mediating link, or scenario-specific downstream implication.
Most could have been generated from Organizational State and Conditions alone.

A discriminating prediction could not be reconstructed safely because the
Mechanisms lacked a canonical horizon and usually lacked an activation or
persistence condition. Adding those fields in the benchmark would have
invented facts.

## Intervention handoff

Every scenario produced an Intervention, but none directly targeted a generated
Mechanism link. Typical actions delegated decision authority or clarified
cross-functional ownership based on a canonical Organizational Condition.
They were plausible best practices, not scenario-specific causal
interventions.

No generated Intervention supplied the complete structure:

```text
causal link → action → expected effect → success signal → falsification
```

Recomposition could occasionally pair an existing action with an existing
effect, but success signals were absent and the action was not grounded to the
Mechanism. Therefore no safe mechanism-targeted recomposition succeeded.

## False positive

The insufficient-evidence case first created unsupported certainty at
Mechanism formation:

> Approval steps increased after one quality review → some managers may be
> more cautious.

The artifact had three silos, complete lineage, and 0.69 confidence, but no
mediating link, activation condition, alternative discrimination, or
falsification. Current production eligibility accepted it. Downstream generic
Predictions and an intervention then amplified the appearance of completeness.

The error is promotion of a plausible hypothesis to a qualified Mechanism, not
missing provenance.

## Eligibility contract comparison

| Contract | Precision | Recall | Negative false positives | Abstention quality |
| --- | ---: | ---: | ---: | ---: |
| Current production | 0.666667 | 0.500000 | 1 | 0.750000 |
| Minimal completeness | 0.500000 | 1.000000 | 4 | 0.000000 |
| Full causal implication | 0.000000 | 0.000000 | 0 | 1.000000 |
| Adversarially strict | 0.000000 | 0.000000 | 0 | 1.000000 |

Minimal completeness is unsafe because generic cause/effect plus lineage admits
every case. Full and strict contracts suppress false positives only by
abstaining on every positive. No tested contract balances recall and precision.

A stricter contract cannot improve prediction and abstention until production
artifacts represent the missing causal implication fields.

## Minimal missing contract

The narrowest plausible future contract would remain on the existing
Mechanism object and require explicit, grounded:

- upstream driver;
- at least one mediating relationship;
- downstream organizational outcome;
- activation or persistence condition;
- complete nonredundant cross-silo lineage;
- one discriminating implication;
- one falsification criterion.

This audit does **not** authorize that contract. A read-only representation
design and benchmark-only shadow are required first.

## Direct answers

1. The complete chain first becomes unavailable at Mechanism
   formation/representation.
2. Mechanisms usually contain an upstream driver.
3. They rarely contain a specific mediating relationship.
4. They contain an effect, but often only an adjacent outcome.
5. Activation/persistence conditions are generally absent.
6. Evidence lineage is usually sufficient for traceability.
7. Competing explanations are not distinguished.
8. A discriminating prediction cannot be reconstructed without adding a
   condition or horizon.
9. A targeted intervention cannot be reconstructed without inventing link
   targeting and a success signal.
10. Production Prediction does not preserve direct Mechanism structure.
11. Production Intervention targets Conditions, not causal links.
12. The false positive combined three-silo lineage with a plausible but
   underdetermined fragment and lacked adjudication.
13. No contract achieves an acceptable balance; current production is least
   destructive but still admits one false positive.
14. Stricter contracts improve abstention only by eliminating recall.
15. The next justified step is a **Mechanism representation proposal followed
   by a combined benchmark-only shadow**, not production implementation.
16. Before rerunning the phase-transition experiment, explicit grounded
   mediating, activation, implication, and falsification structure must be
   benchmark-validated, and direct downstream ancestry must be auditable.

## Determinism, leakage, and recommendation

All leakage and hard-gate checks passed. Repeated replay, reversed scenario
order, reversed Evidence order, reversed silo order, traces, decompositions,
eligibility classifications, recompositions, and machine results were stable.

Do not add a cognition layer or modify production. The conservative next step
is a read-only contract design for extending the existing Mechanism
representation, followed by a benchmark-only shadow proving that populated
fields improve positive precision without blanket abstention.
