# State-Dependent Causal Dynamics Experiment 001

## Objective

This benchmark tests whether a fixed causal edge behaves differently across
organizational states and whether a benchmark-local dynamic edge model adds
predictive and intervention value beyond a static mechanism. It does not alter
production.

## Experimental design

Five fixed source→target families are observed across five state variants:

- customization → delivery variability;
- decision ambiguity → manager escalation;
- approval layers → decision latency;
- knowledge concentration → execution fragility;
- customer exception volume → margin erosion.

Topology remains fixed within each family. State, upstream magnitude, outcome
magnitude, condition presence, temporal period, and historical exposure are
recorded as raw Evidence. Expected dynamic classes and held-out outcomes are not
available to the producer.

Nine controls cover static response, correlation, coincidental thresholds,
random fluctuation, false saturation, false activation, common cause, reverse
causality, and missing state.

## Candidate rules

The benchmark-local producer applies fixed rules across all families. It detects
activation from repeated inactive/active contrasts, amplification from equal
upstream levels under different states, suppression from sustained inverse
response, threshold-like behavior from a repeated large transition, saturation
from a diminishing final response, and persistence from historical exposure
after the immediate condition is removed.

No response curve is fitted. Duplicate observations are identity-deduplicated.
Temporal reversal and explicit causal warnings reject interpretation.

## Baselines

Comparisons include current static mechanisms, the previous causal producer,
generic summary, Organizational State, Full Canonical Combined cognition, and
the dynamic edge candidate.

## Held-out evaluation

Static prediction uses mean observed outcome. Dynamic prediction uses the
closest previously observed state. The held-out state and outcome remain hidden
until registration. Intervention targeting is credited only when the candidate
identifies the varied state variable.

## Hard gates

The hypothesis requires fixed topology, independent state variation, low
control false positives, prediction and intervention improvement,
counterfactual sensitivity, lineage, leakage safety, and determinism. Predictive
gain cannot override false dynamic classification.

## Run

```bash
npx tsx engine/benchmark/state-dependent-causal-dynamics-experiment-001/runStateDependentCausalDynamicsExperiment001.ts
```

## Limitations

The corpus is controlled and numeric. State classes are benchmark-local.
No production state machine, dynamics schema, curve fitting, persistence model,
Prediction change, or Intervention change is implemented.
