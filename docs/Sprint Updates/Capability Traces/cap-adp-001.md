# Capability Trace — Prediction Outcome Evaluation

Generated: 2026-07-13T02:10:06.992Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-ADP-001` |
| Capability name | Prediction Outcome Evaluation |
| Cognitive domain | ADP |
| Architectural layer | COG |
| Canonical producer | `engine/v3/model/predictions/evaluatePredictionOutcomes.ts` |
| Runtime destination | `OrganizationRuntime.predictionEvaluations` |
| Executive destination | `Atlas, ExecutiveAssessment, ExecutiveProjection, ExecutiveWorkspace` |
| Atlas coverage | planned |
| Registry status | proposed |

### Produced Cognitive Objects

- `PredictionEvaluation`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/predictions/evaluatePredictionOutcomes.ts`

### Capability Dependencies

- `CAP-PRD-001`
- `CAP-PRD-002`
- `CAP-UND-004`

### Declared Consumers

- `CAP-LRN-002`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-ADP-001 |
| Canonical producer declared | ✅ | engine/v3/model/predictions/evaluatePredictionOutcomes.ts |
| Canonical producer exists | ✅ | engine/v3/model/predictions/evaluatePredictionOutcomes.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.predictionEvaluations |
| Executive destination | ✅ | Atlas, ExecutiveAssessment, ExecutiveProjection, ExecutiveWorkspace |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | planned |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/runtime/organizationRuntime.ts`
- `scripts/cognition/generateArchitectureState.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Prediction Outcome Evaluation`
- `predictionOutcomeEvaluation`
- `PredictionOutcomeEvaluation`
- `prediction-outcome-evaluation`
- `prediction outcome evaluation`
- `CAP-ADP-001`
- `capAdp001`
- `CapAdp001`
- `cap-adp-001`
- `evaluatePredictionOutcomes`
- `EvaluatePredictionOutcomes`
- `evaluate-prediction-outcomes`
- `evaluatepredictionoutcomes`
- `predictionEvaluations`
- `PredictionEvaluations`
- `prediction-evaluations`
- `predictionevaluations`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 3 |
| Runtime | ✅ Found | 14 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 6 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ✅ Found | 2 |

### Detailed Matches

#### Engine

##### `engine/v3/model/predictions/evaluatePredictionOutcomes.ts`

- Line 48 · **unknown** · matched `evaluatePredictionOutcomes`
  - `export type EvaluatePredictionOutcomesInput = {`
- Line 98 · **definition** · matched `evaluatePredictionOutcomes`
  - `export function evaluatePredictionOutcomes(`
- Line 99 · **unknown** · matched `evaluatePredictionOutcomes`
  - `input: EvaluatePredictionOutcomesInput,`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 44 · **import** · matched `evaluatePredictionOutcomes`
  - `import { evaluatePredictionOutcomes } from "../model/predictions/evaluatePredictionOutcomes";`
- Line 92 · **type** · matched `predictionEvaluations`
  - `predictionEvaluations?: any[];`
- Line 594 · **unknown** · matched `Prediction Outcome Evaluation`
  - `* CAP-ADP-001 — Prediction Outcome Evaluation`
- Line 634 · **definition** · matched `predictionEvaluations`
  - `const predictionEvaluations =`
- Line 635 · **unknown** · matched `evaluatePredictionOutcomes`
  - `evaluatePredictionOutcomes({`
- Line 685 · **unknown** · matched `predictionEvaluations`
  - `predictionEvaluations,`
- Line 940 · **unknown** · matched `predictionEvaluations`
  - `predictionEvaluations,`
- Line 996 · **unknown** · matched `predictionEvaluations`
  - `predictionEvaluations,`
- Line 1138 · **unknown** · matched `predictionEvaluations`
  - `predictionEvaluations.length,`
- Line 1211 · **type** · matched `predictionEvaluations`
  - `predictionEvaluations:`
- Line 1212 · **unknown** · matched `predictionEvaluations`
  - `typeof predictionEvaluations;`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 22 · **import** · matched `evaluatePredictionOutcomes`
  - `import type { PredictionEvaluation } from "../model/predictions/evaluatePredictionOutcomes";`
- Line 86 · **type** · matched `predictionEvaluations`
  - `predictionEvaluations: PredictionEvaluation[];`
- Line 173 · **type** · matched `predictionEvaluations`
  - `predictionEvaluations: [],`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 488 · **unknown** · matched `Prediction Outcome Evaluation`
  - `* Produced by CAP-ADP-001 — Prediction Outcome Evaluation.`
- Line 494 · **type** · matched `predictionEvaluations`
  - `predictionEvaluations?: ExecutivePredictionEvaluation[];`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 183 · **type** · matched `predictionEvaluations`
  - `predictionEvaluations?: RuntimePredictionEvaluation[];`
- Line 733 · **read** · matched `predictionEvaluations`
  - `runtimeMemory?.predictionEvaluations;`
- Line 841 · **definition** · matched `predictionEvaluations`
  - `const predictionEvaluations =`
- Line 942 · **unknown** · matched `predictionEvaluations`
  - `predictionEvaluations,`

#### Other

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 532 · **unknown** · matched `Prediction Outcome Evaluation`
  - `* Prediction Outcome Evaluation, whose projection pathway can be valid`
- Line 760 · **unknown** · matched `CAP-ADP-001`
  - `proposedCapabilityId: "CAP-ADP-001",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
