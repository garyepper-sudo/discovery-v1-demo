# Capability Trace — Organizational Learning Profile

Generated: 2026-07-12T13:50:22.011Z

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

None declared.

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-LRN-002 |
| Canonical producer declared | ✅ | engine/v3/model/learning/computeOrganizationalLearningProfile.ts |
| Canonical producer exists | ✅ | engine/v3/model/learning/computeOrganizationalLearningProfile.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalLearningProfile |
| Executive destination | ✅ | ExecutiveProjection, OrganizationalLearningProfile |
| Consumers | ✅ | Terminal capability (no downstream cognitive capability expected). |
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
- `engine/v3/runtime/evolveOrganizationRuntime.ts`

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
| Engine | ✅ Found | 6 |
| Runtime | ✅ Found | 14 |
| Executive | ✅ Found | 2 |
| Projection | ✅ Found | 11 |
| UI | ✅ Found | 5 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 26 |
| Other | ❌ Not found | 0 |

### Detailed Matches

#### Engine

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
- Line 82 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: any;`
- Line 747 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 748 · **unknown** · matched `organizationalLearningProfile`
  - `computeOrganizationalLearningProfile({`
- Line 754 · **unknown** · matched `Organizational Learning Profile`
  - `"Organizational Learning Profile",`
- Line 755 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 798 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 819 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 950 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.learningVelocity,`
- Line 953 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.learningVelocityScore,`
- Line 956 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.understandingGrowth,`
- Line 959 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.memoryGrowth,`
- Line 1017 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile:`
- Line 1018 · **unknown** · matched `organizationalLearningProfile`
  - `typeof organizationalLearningProfile;`

#### Executive

##### `engine/v3/executive/executiveLearningSummary.ts`

- Line 261 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`
- Line 295 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile?.learningVelocityScore ?? 0;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 185 · **unknown** · matched `organizationalLearningProfile`
  - `export type ExecutiveOrganizationalLearningProfile = {`
- Line 302 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: ExecutiveOrganizationalLearningProfile;`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 17 · **unknown** · matched `organizationalLearningProfile`
  - `ExecutiveOrganizationalLearningProfile,`
- Line 68 · **type** · matched `organizationalLearningProfile`
  - `type RuntimeOrganizationalLearningProfile = {`
- Line 121 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: RuntimeOrganizationalLearningProfile;`
- Line 502 · **unknown** · matched `organizationalLearningProfile`
  - `function buildOrganizationalLearningProfileProjection(`
- Line 504 · **unknown** · matched `organizationalLearningProfile`
  - `): ExecutiveOrganizationalLearningProfile \| undefined {`
- Line 506 · **read** · matched `organizationalLearningProfile`
  - `runtimeMemory?.organizationalLearningProfile;`
- Line 588 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 589 · **unknown** · matched `organizationalLearningProfile`
  - `buildOrganizationalLearningProfileProjection(runtimeMemory);`
- Line 683 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`

#### UI

##### `components/executive-v2/ExecutiveExperience.tsx`

- Line 30 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 81 · **unknown** · matched `organizationalLearningProfile`
  - `{organizationalLearningProfile && (`
- Line 83 · **unknown** · matched `organizationalLearningProfile`
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

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
