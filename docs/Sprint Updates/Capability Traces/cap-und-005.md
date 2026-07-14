# Capability Trace — Executive Assessment

Generated: 2026-07-14T03:36:22.480Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-UND-005` |
| Capability name | Executive Assessment |
| Cognitive domain | UND |
| Architectural layer | EXEC |
| Canonical producer | `engine/v3/model/judgment/buildExecutiveAssessment.ts` |
| Runtime destination | `OrganizationRuntime.executiveAssessment` |
| Executive destination | `ExecutiveProjection, ExecutiveWorkspace, OrganizationalUnderstanding` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `ExecutiveAssessment`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/judgment/buildExecutiveAssessment.ts`

### Capability Dependencies

- `CAP-PRD-002`
- `CAP-UND-001`
- `CAP-UND-002`
- `CAP-UND-003`
- `CAP-UND-004`

### Declared Consumers

- `CAP-UND-006`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-UND-005 |
| Canonical producer declared | ✅ | engine/v3/model/judgment/buildExecutiveAssessment.ts |
| Canonical producer exists | ✅ | engine/v3/model/judgment/buildExecutiveAssessment.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.executiveAssessment |
| Executive destination | ✅ | ExecutiveProjection, ExecutiveWorkspace, OrganizationalUnderstanding |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/assessment/ExecutiveAssessmentCard.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `engine/benchmark/auditCapability.ts`
- `engine/benchmark/auditUnderstandingLayers.ts`
- `engine/benchmark/benchmarkReporter.ts`
- `engine/benchmark/benchmarkScorer.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/v3/executive/buildExecutiveChangeSummary.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/model/judgment/organizationalJudgment.ts`
- `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`
- `engine/v3/model/simulate/buildSimulationScenario.ts`
- `engine/v3/model/simulate/compareSimulationScenario.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/runtime/organizationalUnderstandingState.ts`
- `engine/v3/scenarios/runExecutiveScenario.ts`
- `engine/v3/semantic/types.ts`
- `engine/v3/types.ts`
- `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
- `engine/v3/understanding/consolidateUnderstanding.ts`
- `engine/v3/understanding/rankOrganizationalUnderstanding.ts`
- `scripts/cognition/generateArchitectureHandoff.mjs`
- `scripts/cognition/generateArchitectureState.mjs`
- `scripts/cognition/generateCognitiveRegistry.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Executive Assessment`
- `executiveAssessment`
- `ExecutiveAssessment`
- `executive-assessment`
- `executive assessment`
- `CAP-UND-005`
- `capUnd005`
- `CapUnd005`
- `cap-und-005`
- `buildExecutiveAssessment`
- `BuildExecutiveAssessment`
- `build-executive-assessment`
- `buildexecutiveassessment`
- `executiveassessment`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 24 |
| Runtime | ✅ Found | 15 |
| Executive | ✅ Found | 9 |
| Projection | ✅ Found | 27 |
| UI | ✅ Found | 22 |
| API | ❌ Not found | 0 |
| Simulation | ✅ Found | 21 |
| Benchmark | ✅ Found | 44 |
| Other | ✅ Found | 11 |

### Detailed Matches

#### Engine

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 20 · **type** · matched `executiveAssessment`
  - `type BuildExecutiveAssessmentInput = {`
- Line 227 · **unknown** · matched `executiveAssessment`
  - `export function buildExecutiveAssessment(`
- Line 228 · **unknown** · matched `executiveAssessment`
  - `input: BuildExecutiveAssessmentInput,`
- Line 362 · **unknown** · matched `Executive Assessment`
  - `: "The available reasoning paths did not produce a coherent executive assessment.";`

##### `engine/v3/model/judgment/organizationalJudgment.ts`

- Line 236 · **unknown** · matched `Executive Assessment`
  - `* Concise summary of the Executive Assessment.`
- Line 249 · **unknown** · matched `Executive Assessment`
  - `* Executive Assessment.`
- Line 262 · **unknown** · matched `Executive Assessment`
  - `* Executive Assessment consumes this object but does not`

##### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 62 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 252 · **read** · matched `executiveAssessment`
  - `if ((params.currentSnapshot.executiveAssessmentConfidence ?? 0) < 0.7) {`

##### `engine/v3/scenarios/runExecutiveScenario.ts`

- Line 74 · **unknown** · matched `Executive Assessment`
  - `* Current canonical Executive Assessment used as the comparison baseline.`
- Line 76 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment: OrganizationalAssessment;`
- Line 123 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`
- Line 178 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`

##### `engine/v3/semantic/types.ts`

- Line 29 · **unknown** · matched `Executive Assessment`
  - `* (Beliefs, Concept Candidates, Executive Assessment, etc.)`

##### `engine/v3/types.ts`

- Line 527 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: OrganizationalAssessment;`

##### `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`

- Line 3 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentLike = {`
- Line 49 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentLike;`
- Line 93 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.theoryValidation?.dominantTheory;`
- Line 102 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.primaryMechanismIds ??`
- Line 168 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.confidence ??`
- Line 176 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.primaryMechanismIds ??`
- Line 188 · **unknown** · matched `executive-assessment`
  - `source: "executive-assessment",`

##### `engine/v3/understanding/consolidateUnderstanding.ts`

- Line 533 · **unknown** · matched `executive-assessment`
  - `candidate.source === "executive-assessment" \|\|`

##### `engine/v3/understanding/rankOrganizationalUnderstanding.ts`

- Line 48 · **unknown** · matched `executive-assessment`
  - `if (source === "executive-assessment") {`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 13 · **import** · matched `executiveAssessment`
  - `import { buildExecutiveAssessment } from "../model/judgment/buildExecutiveAssessment";`
- Line 74 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: any;`
- Line 728 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment = buildExecutiveAssessment({`
- Line 743 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 759 · **unknown** · matched `executive-assessment`
  - `understanding.source === "executive-assessment",`
- Line 824 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 825 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 878 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence:`
- Line 879 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.confidence,`
- Line 1107 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 1288 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence:`
- Line 1289 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.confidence,`
- Line 1335 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 1336 · **unknown** · matched `executiveAssessment`
  - `typeof executiveAssessment;`

##### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 15 · **unknown** · matched `executive-assessment`
  - `\| "executive-assessment"`

#### Executive

##### `engine/v3/executive/buildExecutiveChangeSummary.ts`

- Line 27 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 33 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 239 · **read** · matched `executiveAssessment`
  - `input.currentSnapshot?.executiveAssessmentConfidence ?? 0;`
- Line 242 · **read** · matched `executiveAssessment`
  - `input.previousSnapshot?.executiveAssessmentConfidence ?? currentConfidence;`

##### `engine/v3/executive/executiveLearningSummary.ts`

- Line 80 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 150 · **read** · matched `executiveAssessment`
  - `: (snapshot.executiveAssessmentConfidence ?? 0) -`
- Line 151 · **read** · matched `executiveAssessment`
  - `(previous.executiveAssessmentConfidence ?? 0),`
- Line 290 · **read** · matched `executiveAssessment`
  - `const currentConfidence = current?.executiveAssessmentConfidence ?? 0;`
- Line 292 · **read** · matched `executiveAssessment`
  - `previous?.executiveAssessmentConfidence ?? currentConfidence;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 44 · **unknown** · matched `executiveAssessment`
  - `export type ExecutiveAssessment = {`
- Line 46 · **unknown** · matched `Executive Assessment`
  - `* Concise statement of Discovery's executive assessment.`
- Line 477 · **unknown** · matched `Executive Assessment`
  - `* Discovery's canonical executive assessment.`
- Line 479 · **unknown** · matched `Executive Assessment`
  - `* This preserves Executive Assessment as a first-class object`
- Line 483 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessment;`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 11 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessment,`
- Line 183 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 417 · **unknown** · matched `executiveAssessment`
  - `function buildExecutiveAssessmentProjection(`
- Line 419 · **unknown** · matched `executiveAssessment`
  - `): ExecutiveAssessment \| undefined {`
- Line 420 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 421 · **read** · matched `executiveAssessment`
  - `runtimeMemory?.executiveAssessment;`
- Line 423 · **unknown** · matched `executiveAssessment`
  - `if (!executiveAssessment) {`
- Line 429 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary \|\|`
- Line 430 · **unknown** · matched `Executive Assessment`
  - `"Discovery has not yet formed a complete executive assessment.",`
- Line 433 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.executiveNarrative \|\|`
- Line 434 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary \|\|`
- Line 438 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.confidence,`
- Line 442 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.recommendedFocus ?? [],`
- Line 445 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.theoryValidation,`
- Line 452 · **read** · matched `executiveAssessment`
  - `return runtimeMemory?.executiveAssessment?.theoryValidation;`
- Line 900 · **unknown** · matched `executiveAssessment`
  - `const runtimeExecutiveAssessment =`
- Line 901 · **read** · matched `executiveAssessment`
  - `runtimeMemory?.executiveAssessment;`
- Line 903 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 904 · **unknown** · matched `executiveAssessment`
  - `buildExecutiveAssessmentProjection(runtimeMemory);`
- Line 945 · **unknown** · matched `executiveAssessment`
  - `runtimeExecutiveAssessment?.confidence ??`
- Line 989 · **unknown** · matched `executiveAssessment`
  - `runtimeExecutiveAssessment?.summary \|\|`
- Line 1020 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`

#### UI

##### `components/executive-v2/assessment/ExecutiveAssessmentCard.tsx`

- Line 1 · **import** · matched `executiveAssessment`
  - `import type { ExecutiveAssessment } from "../projection/ExecutiveProjection";`
- Line 3 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentCardProps = {`
- Line 4 · **unknown** · matched `executiveAssessment`
  - `assessment: ExecutiveAssessment;`
- Line 7 · **unknown** · matched `executiveAssessment`
  - `export default function ExecutiveAssessmentCard({`
- Line 9 · **unknown** · matched `executiveAssessment`
  - `}: ExecutiveAssessmentCardProps) {`
- Line 14 · **unknown** · matched `Executive Assessment`
  - `Executive Assessment`

##### `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`

- Line 8 · **unknown** · matched `CAP-UND-005`
  - `\| "CAP-UND-005"`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`

- Line 3 · **import** · matched `executiveAssessment`
  - `import ExecutiveAssessmentCard from "../assessment/ExecutiveAssessmentCard";`
- Line 16 · **unknown** · matched `CAP-UND-005`
  - `\| "CAP-UND-005"`
- Line 61 · **unknown** · matched `CAP-UND-005`
  - `capabilityId: "CAP-UND-005",`
- Line 62 · **unknown** · matched `Executive Assessment`
  - `name: "Executive Assessment",`
- Line 64 · **unknown** · matched `executiveAssessment`
  - `projectionKey: "executiveAssessment",`
- Line 66 · **read** · matched `executiveAssessment`
  - `projection.executiveAssessment !== undefined,`
- Line 68 · **read** · matched `executiveAssessment`
  - `projection.executiveAssessment ? (`
- Line 69 · **unknown** · matched `executiveAssessment`
  - `<ExecutiveAssessmentCard`
- Line 70 · **read** · matched `executiveAssessment`
  - `assessment={projection.executiveAssessment}`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`

- Line 3 · **import** · matched `executiveAssessment`
  - `import ExecutiveAssessmentCard from "../assessment/ExecutiveAssessmentCard";`
- Line 24 · **unknown** · matched `CAP-UND-005`
  - `capabilityId: "CAP-UND-005",`
- Line 25 · **unknown** · matched `executiveAssessment`
  - `projectionKey: "executiveAssessment",`
- Line 27 · **read** · matched `executiveAssessment`
  - `projection.executiveAssessment ? (`
- Line 28 · **unknown** · matched `executiveAssessment`
  - `<ExecutiveAssessmentCard`
- Line 29 · **read** · matched `executiveAssessment`
  - `assessment={projection.executiveAssessment}`

#### Simulation

##### `engine/v3/model/simulate/buildSimulationScenario.ts`

- Line 1 · **import** · matched `executiveAssessment`
  - `import { buildExecutiveAssessment } from "../judgment/buildExecutiveAssessment";`
- Line 23 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentInput =`
- Line 24 · **unknown** · matched `executiveAssessment`
  - `Parameters<typeof buildExecutiveAssessment>[0];`
- Line 46 · **unknown** · matched `Executive Assessment`
  - `* Canonical Executive Assessment of the simulated future.`
- Line 48 · **unknown** · matched `executiveAssessment`
  - `projectedExecutiveAssessment: OrganizationalAssessment;`
- Line 68 · **unknown** · matched `executiveAssessment`
  - `NonNullable<ExecutiveAssessmentInput["organizationalState"]>;`
- Line 77 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentInput["conceptualUnderstanding"];`
- Line 83 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentInput["organizationalBeliefs"];`
- Line 86 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentInput["investigationOpportunities"];`
- Line 112 · **unknown** · matched `Executive Assessment`
  - `* canonical producers for Prediction Reflection, Executive Assessment, and`
- Line 145 · **unknown** · matched `executiveAssessment`
  - `const projectedExecutiveAssessment =`
- Line 146 · **unknown** · matched `executiveAssessment`
  - `buildExecutiveAssessment({`
- Line 163 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 164 · **unknown** · matched `executiveAssessment`
  - `projectedExecutiveAssessment,`
- Line 184 · **unknown** · matched `executiveAssessment`
  - `projectedExecutiveAssessment,`

##### `engine/v3/model/simulate/compareSimulationScenario.ts`

- Line 97 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment: OrganizationalAssessment;`
- Line 526 · **unknown** · matched `executiveAssessment`
  - `.projectedExecutiveAssessment`
- Line 545 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`
- Line 569 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`
- Line 572 · **unknown** · matched `executiveAssessment`
  - `.projectedExecutiveAssessment,`
- Line 591 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`

#### Benchmark

##### `engine/benchmark/auditCapability.ts`

- Line 1389 · **unknown** · matched `Executive Assessment`
  - `'Usage: npm run audit:capability -- "Executive Assessment"',`

##### `engine/benchmark/auditUnderstandingLayers.ts`

- Line 8 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

##### `engine/benchmark/benchmarkReporter.ts`

- Line 268 · **unknown** · matched `executiveAssessment`
  - `"   Recommendation: improve theory validation inside buildExecutiveAssessment().",`
- Line 288 · **unknown** · matched `executiveAssessment`
  - `console.log("   Recommendation: improve buildExecutiveAssessment().");`

##### `engine/benchmark/benchmarkScorer.ts`

- Line 36 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentBenchmarkItem = {`
- Line 51 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentBenchmarkItem;`
- Line 302 · **definition** · matched `executiveAssessment`
  - `function executiveAssessmentText(`
- Line 303 · **unknown** · matched `executiveAssessment`
  - `assessment?: ExecutiveAssessmentBenchmarkItem,`
- Line 476 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentBenchmarkItem;`
- Line 479 · **unknown** · matched `executiveAssessment`
  - `const { organizationalState, executiveAssessment, executiveText } = params;`
- Line 483 · **read** · matched `executiveAssessment`
  - `...executiveAssessmentText(executiveAssessment),`
- Line 489 · **unknown** · matched `executiveAssessment`
  - `arrayPresenceScore(executiveAssessment?.recommendedFocus, 3),`
- Line 510 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentBenchmarkItem;`
- Line 516 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 523 · **read** · matched `executiveAssessment`
  - `...executiveAssessmentText(executiveAssessment),`
- Line 720 · **read** · matched `executiveAssessment`
  - `const assessmentText = executiveAssessmentText(actual.executiveAssessment);`
- Line 811 · **type** · matched `executiveAssessment`
  - `executiveAssessment: actual.executiveAssessment,`
- Line 818 · **type** · matched `executiveAssessment`
  - `executiveAssessment: actual.executiveAssessment,`
- Line 919 · **unknown** · matched `Executive Assessment`
  - `"Pattern coherence is weak: mechanisms, concepts, conditions, and executive assessment are not yet converging cleanly.",`
- Line 943 · **unknown** · matched `Executive Assessment`
  - `"Executive assessment did not clearly synthesize organizational conditions into a coherent organizational state.",`

##### `engine/benchmark/runAtlasSimulation.ts`

- Line 552 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment = asRecord(memory.executiveAssessment);`
- Line 554 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.theoryValidation,`
- Line 565 · **unknown** · matched `executiveAssessment`
  - `asString(executiveAssessment.summary) ??`
- Line 574 · **unknown** · matched `executiveAssessment`
  - `asNumber(executiveAssessment.confidence);`
- Line 595 · **unknown** · matched `Executive Assessment`
  - `"EXECUTIVE ASSESSMENT",`
- Line 596 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.executiveNarrative ??`
- Line 597 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary,`

##### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 125 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 240 · **read** · matched `executiveAssessment`
  - `BenchmarkRuntimeMemory["executiveAssessment"]`
- Line 391 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 392 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 395 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 399 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 403 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 409 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 436 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment?.summary,`
- Line 437 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 439 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 442 · **read** · matched `executiveAssessment`
  - `...(memory.executiveAssessment`
- Line 445 · **read** · matched `executiveAssessment`
  - `...(memory.executiveAssessment`
- Line 467 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 499 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 508 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 541 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`

#### Other

##### `scripts/cognition/generateArchitectureHandoff.mjs`

- Line 372 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 63 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 972 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `scripts/cognition/generateCognitiveRegistry.mjs`

- Line 83 · **unknown** · matched `executiveAssessment`
  - `/executiveAssessment/i,`

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 73 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 160 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 168 · **unknown** · matched `executiveAssessment`
  - `"ExecutiveAssessment",`
- Line 187 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 195 · **unknown** · matched `executiveAssessment`
  - `"ExecutiveAssessment",`
- Line 212 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 219 · **unknown** · matched `executiveAssessment`
  - `"ExecutiveAssessment",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
