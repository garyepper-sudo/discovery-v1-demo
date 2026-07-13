# Capability Trace — Prediction Reflection

Generated: 2026-07-13T01:26:02.388Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-PRD-002` |
| Capability name | Prediction Reflection |
| Cognitive domain | PRD |
| Architectural layer | COG |
| Canonical producer | `engine/v3/model/predictions/buildPredictionReflection.ts` |
| Runtime destination | `OrganizationRuntime.predictionReflection` |
| Executive destination | `Atlas, ExecutiveAssessment, OrganizationalUnderstanding` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `PredictionReflection`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/predictions/buildPredictionReflection.ts`

### Capability Dependencies

- `CAP-PRD-001`

### Declared Consumers

- `CAP-UND-005`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-PRD-002 |
| Canonical producer declared | ✅ | engine/v3/model/predictions/buildPredictionReflection.ts |
| Canonical producer exists | ✅ | engine/v3/model/predictions/buildPredictionReflection.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.predictionReflection |
| Executive destination | ✅ | Atlas, ExecutiveAssessment, OrganizationalUnderstanding |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/organizationalJudgment.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `scripts/cognition/generateArchitectureState.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Prediction Reflection`
- `predictionReflection`
- `PredictionReflection`
- `prediction-reflection`
- `prediction reflection`
- `CAP-PRD-002`
- `capPrd002`
- `CapPrd002`
- `cap-prd-002`
- `buildPredictionReflection`
- `BuildPredictionReflection`
- `build-prediction-reflection`
- `buildpredictionreflection`
- `predictionreflection`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 33 |
| Runtime | ✅ Found | 11 |
| Executive | ❌ Not found | 0 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ✅ Found | 6 |

### Detailed Matches

#### Engine

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 18 · **import** · matched `predictionReflection`
  - `import type { PredictionReflection } from "../predictions/buildPredictionReflection";`
- Line 29 · **type** · matched `predictionReflection`
  - `predictionReflection?: PredictionReflection;`
- Line 199 · **type** · matched `predictionReflection`
  - `predictionReflection?: PredictionReflection,`
- Line 202 · **unknown** · matched `predictionReflection`
  - `!predictionReflection \|\|`
- Line 203 · **unknown** · matched `predictionReflection`
  - `!predictionReflection.primaryPrediction`
- Line 209 · **unknown** · matched `predictionReflection`
  - `predictionReflection.confidence * 100,`
- Line 213 · **unknown** · matched `predictionReflection`
  - `predictionReflection.likelihood * 100,`
- Line 217 · **unknown** · matched `predictionReflection`
  - `\`Discovery's current future-state prediction is: ${predictionReflection.primaryPrediction}\`,`
- Line 219 · **unknown** · matched `predictionReflection`
  - `predictionReflection.whyDiscoveryPredictsThis,`
- Line 220 · **unknown** · matched `predictionReflection`
  - `predictionReflection.calibratedConfidenceExplanation,`
- Line 221 · **unknown** · matched `predictionReflection`
  - `predictionReflection.executiveRecommendation,`
- Line 379 · **read** · matched `predictionReflection`
  - `input.predictionReflection,`
- Line 447 · **type** · matched `predictionReflection`
  - `predictionReflection:`
- Line 448 · **read** · matched `predictionReflection`
  - `input.predictionReflection,`

##### `engine/v3/model/judgment/organizationalJudgment.ts`

- Line 2 · **import** · matched `predictionReflection`
  - `import type { PredictionReflection } from "../predictions/buildPredictionReflection";`
- Line 265 · **type** · matched `predictionReflection`
  - `predictionReflection?: PredictionReflection;`

##### `engine/v3/model/predictions/buildPredictionReflection.ts`

- Line 8 · **unknown** · matched `predictionReflection`
  - `export type PredictionReflectionEvidence = {`
- Line 25 · **unknown** · matched `predictionReflection`
  - `export type PredictionReflection = {`
- Line 74 · **unknown** · matched `predictionReflection`
  - `supportingConditions: PredictionReflectionEvidence[];`
- Line 79 · **unknown** · matched `predictionReflection`
  - `supportingConcepts: PredictionReflectionEvidence[];`
- Line 84 · **unknown** · matched `predictionReflection`
  - `supportingBeliefs: PredictionReflectionEvidence[];`
- Line 89 · **unknown** · matched `predictionReflection`
  - `supportingTheories: PredictionReflectionEvidence[];`
- Line 127 · **unknown** · matched `predictionReflection`
  - `export type PredictionReflectionLabelMaps = {`
- Line 134 · **unknown** · matched `predictionReflection`
  - `export type BuildPredictionReflectionInput = {`
- Line 141 · **unknown** · matched `predictionReflection`
  - `labels?: PredictionReflectionLabelMaps;`
- Line 305 · **unknown** · matched `predictionReflection`
  - `}): PredictionReflectionEvidence[] {`
- Line 486 · **unknown** · matched `predictionReflection`
  - `function emptyPredictionReflection(): PredictionReflection {`
- Line 488 · **unknown** · matched `prediction-reflection`
  - `id: "prediction-reflection-none",`
- Line 521 · **unknown** · matched `predictionReflection`
  - `export function buildPredictionReflection(`
- Line 522 · **unknown** · matched `predictionReflection`
  - `input: BuildPredictionReflectionInput,`
- Line 523 · **unknown** · matched `predictionReflection`
  - `): PredictionReflection {`
- Line 534 · **unknown** · matched `predictionReflection`
  - `return emptyPredictionReflection();`
- Line 621 · **unknown** · matched `prediction-reflection`
  - `id: \`prediction-reflection-${primaryPrediction.id}\`,`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 43 · **import** · matched `predictionReflection`
  - `import { buildPredictionReflection } from "../model/predictions/buildPredictionReflection";`
- Line 90 · **type** · matched `predictionReflection`
  - `predictionReflection?: any;`
- Line 572 · **definition** · matched `predictionReflection`
  - `const predictionReflection =`
- Line 573 · **unknown** · matched `predictionReflection`
  - `buildPredictionReflection({`
- Line 627 · **unknown** · matched `Prediction Reflection`
  - `"Prediction Reflection",`
- Line 628 · **unknown** · matched `predictionReflection`
  - `predictionReflection,`
- Line 658 · **unknown** · matched `predictionReflection`
  - `predictionReflection,`
- Line 882 · **unknown** · matched `predictionReflection`
  - `predictionReflection,`
- Line 937 · **unknown** · matched `predictionReflection`
  - `predictionReflection,`
- Line 1146 · **type** · matched `predictionReflection`
  - `predictionReflection:`
- Line 1147 · **unknown** · matched `predictionReflection`
  - `typeof predictionReflection;`

#### Other

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 646 · **unknown** · matched `predictionReflection`
  - `const hasPredictionReflection =`
- Line 647 · **unknown** · matched `CAP-PRD-002`
  - `capabilityIds.has("CAP-PRD-002");`
- Line 673 · **unknown** · matched `predictionReflection`
  - `hasPredictionReflection &&`
- Line 696 · **unknown** · matched `CAP-PRD-002`
  - `"CAP-PRD-002",`
- Line 701 · **unknown** · matched `predictionReflection`
  - `"PredictionReflection",`
- Line 714 · **unknown** · matched `Prediction Reflection`
  - `"Do not duplicate prediction reflection.",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
