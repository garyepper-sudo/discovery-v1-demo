# Capability Trace — Organizational Prediction

Generated: 2026-07-13T01:25:55.165Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-PRD-001` |
| Capability name | Organizational Prediction |
| Cognitive domain | PRD |
| Architectural layer | COG |
| Canonical producer | `engine/v3/model/predictions/inferOrganizationalPredictions.ts` |
| Runtime destination | `OrganizationRuntime.organizationalPredictions` |
| Executive destination | `PredictionReflection` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `OrganizationalPrediction`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/predictions/inferOrganizationalPredictions.ts`
- `engine/v3/model/predictions/organizationalPrediction.ts`
- `engine/v3/model/predictions/predictionRules.ts`
- `engine/v3/model/predictions/predictionTypes.ts`

### Capability Dependencies

- `CAP-LRN-002`
- `CAP-UND-004`

### Declared Consumers

- `CAP-PRD-002`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-PRD-001 |
| Canonical producer declared | ✅ | engine/v3/model/predictions/inferOrganizationalPredictions.ts |
| Canonical producer exists | ✅ | engine/v3/model/predictions/inferOrganizationalPredictions.ts |
| Implementation files | ✅ | 4 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalPredictions |
| Executive destination | ✅ | PredictionReflection |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `engine/v3/model/predictions/buildPredictionReflection.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `scripts/cognition/generateArchitectureState.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Organizational Prediction`
- `organizationalPrediction`
- `OrganizationalPrediction`
- `organizational-prediction`
- `organizational prediction`
- `CAP-PRD-001`
- `capPrd001`
- `CapPrd001`
- `cap-prd-001`
- `inferOrganizationalPredictions`
- `InferOrganizationalPredictions`
- `infer-organizational-predictions`
- `inferorganizationalpredictions`
- `organizationalprediction`
- `predictionRules`
- `PredictionRules`
- `prediction-rules`
- `predictionrules`
- `predictionTypes`
- `PredictionTypes`
- `prediction-types`
- `predictiontypes`
- `organizationalPredictions`
- `OrganizationalPredictions`
- `organizational-predictions`
- `organizationalpredictions`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 59 |
| Runtime | ✅ Found | 14 |
| Executive | ❌ Not found | 0 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ✅ Found | 5 |

### Detailed Matches

#### Engine

##### `engine/v3/model/predictions/buildPredictionReflection.ts`

- Line 2 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPrediction,`
- Line 3 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionSeverity,`
- Line 4 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionStatus,`
- Line 5 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionType,`
- Line 6 · **import** · matched `organizationalPrediction`
  - `} from "./organizationalPrediction";`
- Line 18 · **unknown** · matched `organizationalPrediction`
  - `predictionType: OrganizationalPredictionType;`
- Line 44 · **unknown** · matched `organizationalPrediction`
  - `predictionType: OrganizationalPredictionType \| null;`
- Line 49 · **unknown** · matched `organizationalPrediction`
  - `status: OrganizationalPredictionStatus \| null;`
- Line 54 · **unknown** · matched `organizationalPrediction`
  - `severity: OrganizationalPredictionSeverity \| null;`
- Line 135 · **unknown** · matched `organizationalPrediction`
  - `predictions?: OrganizationalPrediction[];`
- Line 193 · **unknown** · matched `organizationalPrediction`
  - `severity: OrganizationalPredictionSeverity,`
- Line 208 · **unknown** · matched `organizationalPrediction`
  - `status: OrganizationalPredictionStatus,`
- Line 229 · **unknown** · matched `predictionTypes`
  - `function predictionTypeScore(`
- Line 230 · **unknown** · matched `organizationalPrediction`
  - `type: OrganizationalPredictionType,`
- Line 245 · **unknown** · matched `organizationalPrediction`
  - `prediction: OrganizationalPrediction;`
- Line 263 · **unknown** · matched `predictionTypes`
  - `predictionTypeScore(`
- Line 272 · **unknown** · matched `organizationalPrediction`
  - `predictions: OrganizationalPrediction[];`
- Line 274 · **unknown** · matched `organizationalPrediction`
  - `}): OrganizationalPrediction[] {`
- Line 333 · **unknown** · matched `organizationalPrediction`
  - `primary: OrganizationalPrediction;`
- Line 334 · **unknown** · matched `organizationalPrediction`
  - `competing: OrganizationalPrediction;`
- Line 360 · **unknown** · matched `organizationalPrediction`
  - `primary: OrganizationalPrediction;`
- Line 361 · **unknown** · matched `organizationalPrediction`
  - `competing: OrganizationalPrediction;`
- Line 397 · **unknown** · matched `organizationalPrediction`
  - `primary: OrganizationalPrediction,`
- Line 398 · **unknown** · matched `organizationalPrediction`
  - `predictions: OrganizationalPrediction[],`
- Line 427 · **unknown** · matched `organizationalPrediction`
  - `prediction: OrganizationalPrediction,`
- Line 462 · **unknown** · matched `organizationalPrediction`
  - `prediction: OrganizationalPrediction,`
- Line 500 · **unknown** · matched `Organizational Prediction`
  - `"Discovery does not currently have a sufficiently supported organizational prediction.",`

##### `engine/v3/model/predictions/inferOrganizationalPredictions.ts`

- Line 2 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPrediction,`
- Line 3 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionSeverity,`
- Line 4 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionStatus,`
- Line 5 · **import** · matched `organizationalPrediction`
  - `} from "./organizationalPrediction";`
- Line 11 · **import** · matched `predictionTypes`
  - `} from "./predictionTypes";`
- Line 19 · **unknown** · matched `organizationalPrediction`
  - `): OrganizationalPredictionSeverity {`
- Line 37 · **unknown** · matched `organizationalPrediction`
  - `): OrganizationalPredictionStatus {`
- Line 93 · **unknown** · matched `organizationalPrediction`
  - `): Map<string, OrganizationalPrediction> {`
- Line 104 · **unknown** · matched `organizationalPrediction`
  - `export function inferOrganizationalPredictions(`
- Line 107 · **unknown** · matched `organizationalPrediction`
  - `const predictions: OrganizationalPrediction[] = [];`

##### `engine/v3/model/predictions/organizationalPrediction.ts`

- Line 1 · **unknown** · matched `organizationalPrediction`
  - `export type OrganizationalPredictionStatus =`
- Line 11 · **unknown** · matched `organizationalPrediction`
  - `export type OrganizationalPredictionType =`
- Line 17 · **unknown** · matched `organizationalPrediction`
  - `export type OrganizationalPredictionTimeHorizon =`
- Line 24 · **unknown** · matched `organizationalPrediction`
  - `export type OrganizationalPredictionSeverity =`
- Line 30 · **unknown** · matched `organizationalPrediction`
  - `export type OrganizationalPredictionConditionChange = {`
- Line 69 · **unknown** · matched `organizationalPrediction`
  - `export type OrganizationalPrediction = {`
- Line 88 · **unknown** · matched `organizationalPrediction`
  - `predictionType: OrganizationalPredictionType;`
- Line 108 · **unknown** · matched `organizationalPrediction`
  - `severity: OrganizationalPredictionSeverity;`
- Line 113 · **unknown** · matched `organizationalPrediction`
  - `timeHorizon: OrganizationalPredictionTimeHorizon;`
- Line 118 · **unknown** · matched `organizationalPrediction`
  - `status: OrganizationalPredictionStatus;`
- Line 143 · **unknown** · matched `organizationalPrediction`
  - `predictedConditionChanges: OrganizationalPredictionConditionChange[];`

##### `engine/v3/model/predictions/predictionRules.ts`

- Line 2 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionTimeHorizon,`
- Line 3 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionType,`
- Line 4 · **import** · matched `organizationalPrediction`
  - `} from "./organizationalPrediction";`
- Line 9 · **unknown** · matched `organizationalPrediction`
  - `type: OrganizationalPredictionType;`
- Line 15 · **unknown** · matched `organizationalPrediction`
  - `defaultTimeHorizon: OrganizationalPredictionTimeHorizon;`

##### `engine/v3/model/predictions/predictionTypes.ts`

- Line 2 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPrediction,`
- Line 3 · **unknown** · matched `organizationalPrediction`
  - `OrganizationalPredictionType,`
- Line 4 · **import** · matched `organizationalPrediction`
  - `} from "./organizationalPrediction";`
- Line 86 · **unknown** · matched `organizationalPrediction`
  - `previousPredictions?: OrganizationalPrediction[];`
- Line 94 · **unknown** · matched `organizationalPrediction`
  - `predictionType: OrganizationalPredictionType;`
- Line 107 · **unknown** · matched `organizationalPrediction`
  - `predictions: OrganizationalPrediction[];`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 42 · **import** · matched `organizationalPrediction`
  - `import { inferOrganizationalPredictions } from "../model/predictions/inferOrganizationalPredictions";`
- Line 89 · **unknown** · matched `organizationalPrediction`
  - `organizationalPredictions?: any[];`
- Line 510 · **definition** · matched `organizationalPrediction`
  - `const organizationalPredictionResult =`
- Line 511 · **unknown** · matched `organizationalPrediction`
  - `inferOrganizationalPredictions({`
- Line 564 · **read** · matched `organizationalPrediction`
  - `memory.organizationalPredictions,`
- Line 569 · **definition** · matched `organizationalPrediction`
  - `const organizationalPredictions =`
- Line 570 · **unknown** · matched `organizationalPrediction`
  - `organizationalPredictionResult.predictions;`
- Line 574 · **unknown** · matched `organizationalPrediction`
  - `predictions: organizationalPredictions,`
- Line 623 · **unknown** · matched `Organizational Prediction`
  - `"Organizational Predictions",`
- Line 624 · **unknown** · matched `organizationalPrediction`
  - `organizationalPredictions,`
- Line 881 · **unknown** · matched `organizationalPrediction`
  - `organizationalPredictions,`
- Line 936 · **unknown** · matched `organizationalPrediction`
  - `organizationalPredictions,`
- Line 1143 · **unknown** · matched `organizationalPrediction`
  - `organizationalPredictions:`
- Line 1144 · **unknown** · matched `organizationalPrediction`
  - `typeof organizationalPredictions;`

#### Other

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 644 · **unknown** · matched `CAP-PRD-001`
  - `capabilityIds.has("CAP-PRD-001");`
- Line 680 · **import** · matched `Organizational Prediction`
  - `"Discovery can produce and reflect on organizational predictions, but it does not yet have a registered adaptive capability that compares predictions with observed outcomes, measures calibration, and learns from prediction accuracy.";`
- Line 689 · **unknown** · matched `Organizational Prediction`
  - `"Evaluate prior organizational predictions against later observed outcomes and convert prediction performance into confidence calibration and longitudinal learning.",`
- Line 695 · **unknown** · matched `CAP-PRD-001`
  - `"CAP-PRD-001",`
- Line 700 · **unknown** · matched `organizationalPrediction`
  - `"OrganizationalPrediction",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
