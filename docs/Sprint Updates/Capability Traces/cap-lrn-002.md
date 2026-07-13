# Capability Trace — Organizational Learning Profile

Generated: 2026-07-12T20:04:18.664Z

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

- `CAP-PRD-001`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-LRN-002 |
| Canonical producer declared | ✅ | engine/v3/model/learning/computeOrganizationalLearningProfile.ts |
| Canonical producer exists | ✅ | engine/v3/model/learning/computeOrganizationalLearningProfile.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalLearningProfile |
| Executive destination | ✅ | ExecutiveProjection, OrganizationalLearningProfile |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/ExecutiveExperience.tsx`
- `components/executive-v2/learning/ExecutiveLearningProfile.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `engine/benchmark/benchmarkReporter.ts`
- `engine/benchmark/benchmarkScorer.ts`
- `engine/benchmark/longitudinalBenchmarkRunner.ts`
- `engine/benchmark/organizationalLearningBenchmark.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/runBenchmarks.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/model/investigation/buildInvestigationOpportunities.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
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
| Engine | ✅ Found | 9 |
| Runtime | ✅ Found | 16 |
| Executive | ✅ Found | 2 |
| Projection | ✅ Found | 11 |
| UI | ✅ Found | 5 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 26 |
| Other | ✅ Found | 5 |

### Detailed Matches

#### Engine

##### `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

- Line 27 · **type** · matched `organizationalLearningProfile`
  - `type OrganizationalLearningProfileLike = {`
- Line 70 · **unknown** · matched `organizationalLearningProfile`
  - `previousLearningProfile?: OrganizationalLearningProfileLike;`
- Line 233 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileLike`

##### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 77 · **unknown** · matched `organizationalLearningProfile`
  - `export type OrganizationalLearningProfile = {`
- Line 115 · **unknown** · matched `organizationalLearningProfile`
  - `export type ComputeOrganizationalLearningProfileInput = {`
- Line 323 · **unknown** · matched `organizationalLearningProfile`
  - `export function computeOrganizationalLearningProfile(`
- Line 324 · **unknown** · matched `organizationalLearningProfile`
  - `input: ComputeOrganizationalLearningProfileInput,`
- Line 325 · **unknown** · matched `organizationalLearningProfile`
  - `): OrganizationalLearningProfile {`
- Line 335 · **unknown** · matched `Organizational Learning Profile`
  - `"Cannot compute organizational learning profile without at least one understanding snapshot.",`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 18 · **import** · matched `organizationalLearningProfile`
  - `import { computeOrganizationalLearningProfile } from "../model/learning/computeOrganizationalLearningProfile";`
- Line 84 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: any;`
- Line 561 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile,`
- Line 596 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile,`
- Line 858 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 859 · **unknown** · matched `organizationalLearningProfile`
  - `computeOrganizationalLearningProfile({`
- Line 865 · **unknown** · matched `Organizational Learning Profile`
  - `"Organizational Learning Profile",`
- Line 866 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 912 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 933 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 1067 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.learningVelocity,`
- Line 1070 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.learningVelocityScore,`
- Line 1073 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.understandingGrowth,`
- Line 1076 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.memoryGrowth,`
- Line 1134 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile:`
- Line 1135 · **unknown** · matched `organizationalLearningProfile`
  - `typeof organizationalLearningProfile;`

#### Executive

##### `engine/v3/executive/executiveLearningSummary.ts`

- Line 261 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`
- Line 295 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile?.learningVelocityScore ?? 0;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 329 · **unknown** · matched `organizationalLearningProfile`
  - `export type ExecutiveOrganizationalLearningProfile = {`
- Line 480 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: ExecutiveOrganizationalLearningProfile;`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 19 · **unknown** · matched `organizationalLearningProfile`
  - `ExecutiveOrganizationalLearningProfile,`
- Line 101 · **type** · matched `organizationalLearningProfile`
  - `type RuntimeOrganizationalLearningProfile = {`
- Line 158 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: RuntimeOrganizationalLearningProfile;`
- Line 661 · **unknown** · matched `organizationalLearningProfile`
  - `function buildOrganizationalLearningProfileProjection(`
- Line 663 · **unknown** · matched `organizationalLearningProfile`
  - `): ExecutiveOrganizationalLearningProfile \| undefined {`
- Line 665 · **read** · matched `organizationalLearningProfile`
  - `runtimeMemory?.organizationalLearningProfile;`
- Line 755 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 756 · **unknown** · matched `organizationalLearningProfile`
  - `buildOrganizationalLearningProfileProjection(runtimeMemory);`
- Line 854 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`

#### UI

##### `components/executive-v2/ExecutiveExperience.tsx`

- Line 32 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 86 · **unknown** · matched `organizationalLearningProfile`
  - `{organizationalLearningProfile && (`
- Line 88 · **unknown** · matched `organizationalLearningProfile`
  - `profile={organizationalLearningProfile}`

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

- Line 28 · **type** · matched `organizationalLearningProfile`
  - `type OrganizationalLearningProfileSnapshot = {`
- Line 108 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?:`
- Line 109 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileSnapshot`
- Line 115 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?:`
- Line 116 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileSnapshot`
- Line 204 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile:`
- Line 205 · **unknown** · matched `organizationalLearningProfile`
  - `\| OrganizationalLearningProfileSnapshot`
- Line 468 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 470 · **read** · matched `organizationalLearningProfile`
  - `?.organizationalLearningProfile ??`
- Line 471 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile ??`
- Line 488 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 551 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`

##### `engine/benchmark/runBenchmarks.ts`

- Line 30 · **unknown** · matched `Organizational Learning Profile`
  - `console.log("Organizational Learning Profile Object:");`
- Line 31 · **read** · matched `organizationalLearningProfile`
  - `console.dir(investigation.organizationalLearningProfile, { depth: null });`

#### Other

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
