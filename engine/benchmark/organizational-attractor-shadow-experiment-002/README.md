# Organizational Attractor Shadow Experiment 002

## Purpose

This held-out, benchmark-only shadow experiment tests whether an experimental
Candidate Organizational Attractor improves conditional prediction beyond the
strongest combination of existing canonical cognition:

- Mechanisms;
- Contradictions;
- Organizational Conditions;
- Organizational State;
- dated snapshots and transitions.

Nothing in this directory defines production cognition, Runtime, persistence,
schema, capability, API, or application behavior.

## Research question

Can a Candidate Attractor inferred exclusively from production-shaped
cognition artifacts outperform a Full Canonical Combined Baseline that receives
the same historical information?

The experiment attempts to falsify architectural novelty. Matching the
combined baseline is not an incremental-value pass.

## Input boundary

Fixtures use `Pick` shapes imported from production:

- `V3Mechanism`;
- `V3Contradiction`;
- `OrganizationalCondition`;
- `OrganizationalState`.

Production-derived fields include identity, confidence, stability, causal
language, Evidence lineage, condition status and trend, dominant Conditions,
and dated snapshots.

The content, dates, snapshot grouping, and future outcomes remain synthetic.
Scoring-only scenario families and expected Conditions are stored separately
and never passed to inference or prediction registration.

The Candidate Attractor and Full Canonical Combined Baseline receive
byte-identical inference inputs.

## Scenario families

Seven opaque scenarios cover:

1. restoration after temporary change;
2. genuine structural transition;
3. competing tendencies;
4. no stable tendency;
5. recurrence without restoring mechanisms;
6. strong mechanisms without historical restoration;
7. contradictory contextual dynamics.

Future outcomes are withheld until all predictions have been registered.

## Models

### Organizational State

Carries forward the latest singular dominant Condition.

### Mechanisms

Predicts from current supported Mechanisms and their confidence.

### Full Canonical Combined Baseline

Uses current and historical Mechanisms, Contradictions, Conditions, States,
and transitions directly.

### Candidate Attractor

Uses the same inputs, compresses them into an experimental candidate with
lineage, temporal support, conditional implications, opposing artifacts, and
falsification criteria, then predicts from that candidate.

## Hard gates

- no production modifications;
- future Evidence withheld during registration;
- identical input-information boundary;
- zero negative-control false positives;
- repeated, reversed-scenario, and reversed-artifact determinism;
- Attractor must outperform the combined baseline;
- no regression on genuine transition;
- correct abstention;
- complete lineage and falsification;
- leakage audit passes;
- no production-adoption recommendation.

A perfect aggregate score cannot override the incremental-value gate.

## Leakage audit

The programmatic audit rejects:

- answer-bearing inference fields;
- non-opaque scenario names;
- scoring fields in registered predictions;
- future loading before registration;
- different Combined and Attractor input hashes.

Residual construct risk is reported rather than hidden: synthetic Mechanism
effects use Condition-oriented language, and the fixed rules share a
benchmark-local ontology with the fixtures.

## Ablations

The candidate is evaluated with:

- history removed;
- Contradictions removed;
- weakening Conditions removed;
- falsification criteria removed;
- Mechanism confidence removed;
- latest State only.

## Leave-one-out posture

Every scenario is registered as a held-out case. Thresholds are fixed globally
in source and are not trained or tuned from the remaining scenarios.

## Run

```bash
npx tsx engine/benchmark/organizational-attractor-shadow-experiment-002/runOrganizationalAttractorShadowExperiment002.ts
```

The runner prints the result and writes deterministic `RESULTS.json` inside
this directory.

## Interpretation boundary

The experiment can support continued research, projection treatment, or a
producer audit. It cannot authorize production integration or addition of an
Attractor to the canonical cognition chain.
