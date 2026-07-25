# Cross-Silo Mechanism Implication and Intervention Audit 001

## Objective

Localize where unchanged production loses cross-silo causal structure between
raw Evidence, generated Mechanisms, Predictions, and Interventions.

Eight raw-Evidence-only cases reproduce two successful partial transitions,
two incomplete positives, the insufficient-evidence false positive, a
high-connectivity control, a one-silo answer, and competing mechanisms.

## Method

Each case enters the same isolated production replay used by prior experiments:

```text
runDiscoveryV3()
→ evolveOrganizationRuntime()
```

The audit registers production outputs before accessing scoring truth. It then:

- records actual handoff fields;
- decomposes only generated `cause`, `mechanism`, `effect`, lineage, confidence,
  conditions, alternatives, horizons, and falsification fields;
- records absent fields as absent;
- tests four fixed eligibility contracts;
- attempts prediction and intervention recomposition without adding facts;
- compares repeated and reordered replays.

The fixed strict confidence threshold is `0.70`.

## Run

```bash
npx tsx engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/runCrossSiloMechanismImplicationInterventionAudit001.ts
```

## Boundaries

This is a benchmark-only diagnostic. Recompositions are not production
proposals. No production producer, Runtime contract, schema, capability,
existing benchmark, or documentation is changed. Blanket abstention does not
count as a successful contract.
