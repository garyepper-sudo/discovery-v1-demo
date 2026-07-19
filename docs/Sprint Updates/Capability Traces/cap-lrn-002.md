# Capability Trace — Organizational Learning Profile

Generated: 2026-07-19T16:53:20.757Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-LRN-002` |
| Capability name | Organizational Learning Profile |
| Cognitive domain | LRN |
| Architectural layer | COG |
| Canonical producer | `engine/v3/model/learning/computeOrganizationalLearningProfile.ts` |
| Runtime destination | `OrganizationRuntime.organizationalLearningProfile` |
| Executive destination | `ExecutiveProjection, OrganizationalLearningProfile` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `OrganizationalLearningProfile`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

### Capability Dependencies

- `CAP-LRN-001`
- `CAP-MEM-001`

### Declared Consumers

- `CAP-COM-001`
- `CAP-PRD-001`
- `CAP-SIM-001`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-LRN-002 |
| Canonical producer declared | ✅ | engine/v3/model/learning/computeOrganizationalLearningProfile.ts |
| Canonical producer exists | ✅ | engine/v3/model/learning/computeOrganizationalLearningProfile.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalLearningProfile |
| Executive destination | ✅ | ExecutiveProjection, OrganizationalLearningProfile |
| Consumers | ✅ | 3 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/briefing/ExecutiveBriefing.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`
- `components/executive-v2/learning/ExecutiveLearningProfile.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/executive-v3/projection/buildExecutiveBriefingProjection.ts`
- `components/executive-v3/projection/buildExecutiveNarrative.ts`
- `engine/benchmark/benchmarkReporter.ts`
- `engine/benchmark/benchmarkScorer.ts`
- `engine/benchmark/decision-intelligence/scenarioIntegrationExperiment001.ts`
- `engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts`
- `engine/benchmark/high-volume/captureRuntimeSnapshot.ts`
- `engine/benchmark/high-volume/northstar/scoreNorthstarGroundTruth.ts`
- `engine/benchmark/longitudinalBenchmarkRunner.ts`
- `engine/benchmark/organizationalLearningBenchmark.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/runBenchmarks.ts`
- `engine/v3/communication/executiveCommunicationSource.ts`
- `engine/v3/communication/synthesizeExecutiveNarrative.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/model/epistemic/assessOrganizationalUncertainty.ts`
- `engine/v3/model/investigation/buildInvestigationOpportunities.ts`
- `engine/v3/model/learning/buildPredictionLearningEvents.ts`
- `engine/v3/model/learning/buildPredictionLearningSummary.ts`
- `engine/v3/model/simulate/simulateOrganization.ts`
- `engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/scenarios/buildExecutiveDecisionContext.ts`
- `scripts/cognition/planArchitecture.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Organizational Learning Profile`
- `organizationalLearningProfile`
- `OrganizationalLearningProfile`
- `organizational-learning-profile`
- `organizational learning profile`
- `CAP-LRN-002`
- `capLrn002`
- `CapLrn002`
- `cap-lrn-002`
- `computeOrganizationalLearningProfile`
- `ComputeOrganizationalLearningProfile`
- `compute-organizational-learning-profile`
- `computeorganizationallearningprofile`
- `organizationallearningprofile`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 28 |
| Runtime | ✅ Found | 20 |
| Executive | ✅ Found | 2 |
| Projection | ✅ Found | 23 |
| UI | ✅ Found | 18 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 34 |
| Other | ✅ Found | 7 |

### Detailed Matches

#### Engine

##### `engine/v3/communication/executiveCommunicationSource.ts`

- Line 79 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?:`

##### `engine/v3/communication/synthesizeExecutiveNarrative.ts`

- Line 64 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`
- Line 825 · **read** · matched `organizationalLearningProfile`
  - `source.organizationalLearningProfile,`

##### `engine/v3/model/epistemic/assessOrganizationalUncertainty.ts`

- Line 7 · **unknown** · matched `organizationalLearningProfile`
  - `OrganizationalLearningProfile,`
- Line 8 · **import** · matched `organizationalLearningProfile`
  - `} from "../learning/computeOrganizationalLearningProfile";`
- Line 34 · **unknown** · matched `organizationalLearningProfile`
  - `OrganizationalLearningProfile;`
- Line 207 · **unknown** · matched `organizationalLearningProfile`
  - `OrganizationalLearningProfile \|`

##### `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

- Line 27 · **type** · matched `organizationalLearningProfile`
  - `type OrganizationalLearningProfileLike = {`
- Line 70 · **unknown** · matched `organizationalLearningProfile`
  - `previousLearningProfile?: OrganizationalLearningProfileLike;`
- Line 233 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileLike`

##### `engine/v3/model/learning/buildPredictionLearningEvents.ts`

- Line 2 · **import** · matched `organizationalLearningProfile`
  - `import type { OrganizationalLearningEvent } from "./computeOrganizationalLearningProfile";`

##### `engine/v3/model/learning/buildPredictionLearningSummary.ts`

- Line 1 · **import** · matched `organizationalLearningProfile`
  - `import type { OrganizationalLearningEvent } from "./computeOrganizationalLearningProfile";`

##### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 82 · **unknown** · matched `organizationalLearningProfile`
  - `export type OrganizationalLearningProfile = {`
- Line 122 · **unknown** · matched `organizationalLearningProfile`
  - `export type ComputeOrganizationalLearningProfileInput = {`
- Line 330 · **unknown** · matched `organizationalLearningProfile`
  - `export function computeOrganizationalLearningProfile(`
- Line 331 · **unknown** · matched `organizationalLearningProfile`
  - `input: ComputeOrganizationalLearningProfileInput,`
- Line 332 · **unknown** · matched `organizationalLearningProfile`
  - `): OrganizationalLearningProfile {`
- Line 342 · **unknown** · matched `Organizational Learning Profile`
  - `"Cannot compute organizational learning profile without at least one understanding snapshot.",`

##### `engine/v3/model/simulate/simulateOrganization.ts`

- Line 20 · **unknown** · matched `organizationalLearningProfile`
  - `OrganizationalLearningProfile,`
- Line 21 · **import** · matched `organizationalLearningProfile`
  - `} from "../learning/computeOrganizationalLearningProfile";`
- Line 194 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfile`

##### `engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts`

- Line 48 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?:`
- Line 171 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile:`
- Line 172 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile,`

##### `engine/v3/scenarios/buildExecutiveDecisionContext.ts`

- Line 28 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?:`
- Line 115 · **unknown** · matched `organizationalLearningProfile`
  - `* Simulation requires the complete OrganizationalLearningProfile.`
- Line 121 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile;`
- Line 161 · **unknown** · matched `organizationalLearningProfile`
  - `"organizationalLearningProfile",`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 20 · **import** · matched `organizationalLearningProfile`
  - `import { computeOrganizationalLearningProfile } from "../model/learning/computeOrganizationalLearningProfile";`
- Line 104 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: any;`
- Line 586 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile,`
- Line 640 · **unknown** · matched `Organizational Learning Profile`
  - `* - feed prediction performance into the Organizational Learning Profile`
- Line 687 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile,`
- Line 984 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 985 · **unknown** · matched `organizationalLearningProfile`
  - `computeOrganizationalLearningProfile({`
- Line 1002 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 1034 · **unknown** · matched `Organizational Learning Profile`
  - `"Organizational Learning Profile",`
- Line 1035 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 1180 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 1229 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 1337 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 1358 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 1500 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.learningVelocity,`
- Line 1503 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.learningVelocityScore,`
- Line 1506 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.understandingGrowth,`
- Line 1509 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.memoryGrowth,`
- Line 1594 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile:`
- Line 1595 · **unknown** · matched `organizationalLearningProfile`
  - `typeof organizationalLearningProfile;`

#### Executive

##### `engine/v3/executive/executiveLearningSummary.ts`

- Line 261 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`
- Line 295 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile?.learningVelocityScore ?? 0;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 290 · **unknown** · matched `organizationalLearningProfile`
  - `export type ExecutiveOrganizationalLearningProfile = {`
- Line 577 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: ExecutiveOrganizationalLearningProfile;`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 29 · **unknown** · matched `organizationalLearningProfile`
  - `ExecutiveOrganizationalLearningProfile,`
- Line 113 · **type** · matched `organizationalLearningProfile`
  - `type RuntimeOrganizationalLearningProfile = {`
- Line 245 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: RuntimeOrganizationalLearningProfile;`
- Line 764 · **unknown** · matched `organizationalLearningProfile`
  - `function buildOrganizationalLearningProfileProjection(`
- Line 766 · **unknown** · matched `organizationalLearningProfile`
  - `): ExecutiveOrganizationalLearningProfile \| undefined {`
- Line 768 · **read** · matched `organizationalLearningProfile`
  - `runtimeMemory?.organizationalLearningProfile;`
- Line 1098 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 1099 · **unknown** · matched `organizationalLearningProfile`
  - `buildOrganizationalLearningProfileProjection(runtimeMemory);`
- Line 1276 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`

##### `components/executive-v3/projection/buildExecutiveBriefingProjection.ts`

- Line 338 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 345 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 351 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 359 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 367 · **read** · matched `organizationalLearningProfile`
  - `\`${projection.organizationalLearningProfile.knowledgeRetention}%\`,`
- Line 374 · **read** · matched `organizationalLearningProfile`
  - `\`${projection.organizationalLearningProfile.beliefStability}%\`,`

##### `components/executive-v3/projection/buildExecutiveNarrative.ts`

- Line 580 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 587 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 593 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 601 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 609 · **read** · matched `organizationalLearningProfile`
  - `\`${projection.organizationalLearningProfile.knowledgeRetention}%\`,`
- Line 616 · **read** · matched `organizationalLearningProfile`
  - `\`${projection.organizationalLearningProfile.beliefStability}%\`,`

#### UI

##### `components/executive-v2/briefing/ExecutiveBriefing.tsx`

- Line 724 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 735 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile ? (`
- Line 745 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 759 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`
- Line 774 · **read** · matched `organizationalLearningProfile`
  - `.organizationalLearningProfile`

##### `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`

- Line 10 · **unknown** · matched `CAP-LRN-002`
  - `\| "CAP-LRN-002"`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`

- Line 18 · **unknown** · matched `CAP-LRN-002`
  - `\| "CAP-LRN-002"`
- Line 155 · **unknown** · matched `CAP-LRN-002`
  - `capabilityId: "CAP-LRN-002",`
- Line 158 · **unknown** · matched `organizationalLearningProfile`
  - `projectionKey: "organizationalLearningProfile",`
- Line 160 · **read** · matched `organizationalLearningProfile`
  - `projection.organizationalLearningProfile !== undefined,`
- Line 162 · **read** · matched `organizationalLearningProfile`
  - `projection.organizationalLearningProfile ? (`
- Line 164 · **read** · matched `organizationalLearningProfile`
  - `profile={projection.organizationalLearningProfile}`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`

- Line 94 · **unknown** · matched `CAP-LRN-002`
  - `capabilityId: "CAP-LRN-002",`
- Line 95 · **unknown** · matched `organizationalLearningProfile`
  - `projectionKey: "organizationalLearningProfile",`
- Line 97 · **read** · matched `organizationalLearningProfile`
  - `projection.organizationalLearningProfile ? (`
- Line 99 · **read** · matched `organizationalLearningProfile`
  - `profile={projection.organizationalLearningProfile}`

##### `components/executive-v2/learning/ExecutiveLearningProfile.tsx`

- Line 1 · **import** · matched `organizationalLearningProfile`
  - `import type { ExecutiveOrganizationalLearningProfile } from "../projection/ExecutiveProjection";`
- Line 4 · **unknown** · matched `organizationalLearningProfile`
  - `profile: ExecutiveOrganizationalLearningProfile;`

#### Benchmark

##### `engine/benchmark/benchmarkReporter.ts`

- Line 347 · **type** · matched `Organizational Learning Profile`
  - `console.log("   Organizational Learning Profile:");`

##### `engine/benchmark/benchmarkScorer.ts`

- Line 43 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: unknown;`
- Line 858 · **read** · matched `organizationalLearningProfile`
  - `learningProfile: actual.organizationalLearningProfile ?? null,`

##### `engine/benchmark/decision-intelligence/scenarioIntegrationExperiment001.ts`

- Line 44 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: unknown;`
- Line 242 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile,`

##### `engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts`

- Line 364 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile: {`

##### `engine/benchmark/high-volume/captureRuntimeSnapshot.ts`

- Line 48 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`
- Line 147 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`
- Line 335 · **read** · matched `organizationalLearningProfile`
  - `?.organizationalLearningProfile ??`
- Line 336 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile ??`

##### `engine/benchmark/high-volume/northstar/scoreNorthstarGroundTruth.ts`

- Line 135 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`

##### `engine/benchmark/longitudinalBenchmarkRunner.ts`

- Line 91 · **read** · matched `organizationalLearningProfile`
  - `const profile = asRecord(record.organizationalLearningProfile);`
- Line 162 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 163 · **read** · matched `organizationalLearningProfile`
  - `investigation.organizationalLearningProfile;`
- Line 173 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 190 · **unknown** · matched `organizationalLearningProfile`
  - `const profileRecord = asRecord(organizationalLearningProfile);`
- Line 202 · **unknown** · matched `organizationalLearningProfile`
  - `learningVelocity: getLearningVelocity(organizationalLearningProfile),`
- Line 208 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`

##### `engine/benchmark/organizationalLearningBenchmark.ts`

- Line 70 · **unknown** · matched `Organizational Learning Profile`
  - `diagnosis: ["No organizational learning profile was available."],`

##### `engine/benchmark/runAtlasSimulation.ts`

- Line 643 · **read** · matched `organizationalLearningProfile`
  - `investigation.organizationalLearningProfile,`

##### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 34 · **type** · matched `organizationalLearningProfile`
  - `type OrganizationalLearningProfileSnapshot = {`
- Line 114 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?:`
- Line 115 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileSnapshot`
- Line 121 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?:`
- Line 122 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileSnapshot`
- Line 206 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile:`
- Line 207 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileSnapshot`
- Line 470 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 472 · **read** · matched `organizationalLearningProfile`
  - `?.organizationalLearningProfile ??`
- Line 473 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile ??`
- Line 490 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 563 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`

##### `engine/benchmark/runBenchmarks.ts`

- Line 30 · **unknown** · matched `Organizational Learning Profile`
  - `console.log("Organizational Learning Profile Object:");`
- Line 31 · **read** · matched `organizationalLearningProfile`
  - `console.dir(investigation.organizationalLearningProfile, { depth: null });`

#### Other

##### `scripts/cognition/planArchitecture.mjs`

- Line 1060 · **unknown** · matched `CAP-LRN-002`
  - `"CAP-LRN-002",`
- Line 1068 · **unknown** · matched `Organizational Learning Profile`
  - `"Feed completed evaluations into the Organizational Learning Profile.",`

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 104 · **unknown** · matched `CAP-LRN-002`
  - `"CAP-LRN-002",`
- Line 188 · **unknown** · matched `CAP-LRN-002`
  - `"CAP-LRN-002",`
- Line 196 · **unknown** · matched `organizationalLearningProfile`
  - `"OrganizationalLearningProfile",`
- Line 240 · **unknown** · matched `CAP-LRN-002`
  - `"CAP-LRN-002",`
- Line 250 · **unknown** · matched `organizationalLearningProfile`
  - `"OrganizationalLearningProfile",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
