# Capability Trace — Organizational Learning Profile

Generated: 2026-07-10T23:26:46.269Z

## Search Terms

- `Organizational Learning Profile`
- `organizationalLearningProfile`
- `OrganizationalLearningProfile`
- `organizational-learning-profile`
- `organizational learning profile`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 6 |
| Runtime | ✅ Found | 11 |
| Executive | ✅ Found | 2 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 23 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

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

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 18 · **import** · matched `organizationalLearningProfile`
  - `import { computeOrganizationalLearningProfile } from "../model/learning/computeOrganizationalLearningProfile";`
- Line 78 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: any;`
- Line 555 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile = computeOrganizationalLearningProfile({`
- Line 560 · **unknown** · matched `Organizational Learning Profile`
  - `console.log("Organizational Learning Profile", organizationalLearningProfile);`
- Line 598 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 614 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 681 · **unknown** · matched `organizationalLearningProfile`
  - `learningVelocity: organizationalLearningProfile.learningVelocity,`
- Line 683 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile.learningVelocityScore,`
- Line 684 · **unknown** · matched `organizationalLearningProfile`
  - `understandingGrowth: organizationalLearningProfile.understandingGrowth,`
- Line 685 · **unknown** · matched `organizationalLearningProfile`
  - `memoryGrowth: organizationalLearningProfile.memoryGrowth,`
- Line 707 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile: typeof organizationalLearningProfile;`

### Executive

#### `engine/v3/executive/executiveLearningSummary.ts`

- Line 261 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: {`
- Line 295 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile?.learningVelocityScore ?? 0;`

### Benchmark

#### `engine/benchmark/benchmarkReporter.ts`

- Line 347 · **type** · matched `Organizational Learning Profile`
  - `console.log("   Organizational Learning Profile:");`

#### `engine/benchmark/benchmarkScorer.ts`

- Line 43 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: unknown;`
- Line 858 · **read** · matched `organizationalLearningProfile`
  - `learningProfile: actual.organizationalLearningProfile ?? null,`

#### `engine/benchmark/longitudinalBenchmarkRunner.ts`

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

#### `engine/benchmark/organizationalLearningBenchmark.ts`

- Line 70 · **unknown** · matched `Organizational Learning Profile`
  - `diagnosis: ["No organizational learning profile was available."],`

#### `engine/benchmark/runAtlasSimulation.ts`

- Line 638 · **read** · matched `organizationalLearningProfile`
  - `investigation.organizationalLearningProfile,`

#### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 22 · **type** · matched `organizationalLearningProfile`
  - `type OrganizationalLearningProfileSnapshot = {`
- Line 96 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: OrganizationalLearningProfileSnapshot \| null;`
- Line 100 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile?: OrganizationalLearningProfileSnapshot \| null;`
- Line 152 · **type** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile: OrganizationalLearningProfileSnapshot \| null;`
- Line 293 · **definition** · matched `organizationalLearningProfile`
  - `const organizationalLearningProfile =`
- Line 294 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalMemory?.organizationalLearningProfile ??`
- Line 295 · **read** · matched `organizationalLearningProfile`
  - `memory.organizationalLearningProfile ??`
- Line 305 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`
- Line 337 · **unknown** · matched `organizationalLearningProfile`
  - `organizationalLearningProfile,`

#### `engine/benchmark/runBenchmarks.ts`

- Line 30 · **unknown** · matched `Organizational Learning Profile`
  - `console.log("Organizational Learning Profile Object:");`
- Line 31 · **read** · matched `organizationalLearningProfile`
  - `console.dir(investigation.organizationalLearningProfile, { depth: null });`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
