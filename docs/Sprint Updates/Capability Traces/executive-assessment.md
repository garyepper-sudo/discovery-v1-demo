# Capability Trace — Executive Assessment

Generated: 2026-07-10T23:37:16.160Z

## Search Terms

- `Executive Assessment`
- `executiveAssessment`
- `ExecutiveAssessment`
- `executive-assessment`
- `executive assessment`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 8 |
| Runtime | ✅ Found | 8 |
| Executive | ✅ Found | 9 |
| Projection | ✅ Found | 6 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 39 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 77 · **type** · matched `executiveAssessment`
  - `type BuildExecutiveAssessmentInput = {`
- Line 369 · **unknown** · matched `executiveAssessment`
  - `export function buildExecutiveAssessment(`
- Line 370 · **unknown** · matched `executiveAssessment`
  - `input: BuildExecutiveAssessmentInput,`
- Line 573 · **unknown** · matched `Executive Assessment`
  - `: "The available reasoning paths did not produce a coherent executive assessment.";`

#### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 57 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 245 · **read** · matched `executiveAssessment`
  - `if ((params.currentSnapshot.executiveAssessmentConfidence ?? 0) < 0.7) {`

#### `engine/v3/semantic/types.ts`

- Line 29 · **unknown** · matched `Executive Assessment`
  - `* (Beliefs, Concept Candidates, Executive Assessment, etc.)`

#### `engine/v3/types.ts`

- Line 527 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: OrganizationalAssessment;`

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 13 · **import** · matched `executiveAssessment`
  - `import { buildExecutiveAssessment } from "../model/judgment/buildExecutiveAssessment";`
- Line 62 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: any;`
- Line 455 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment = buildExecutiveAssessment({`
- Line 467 · **unknown** · matched `Executive Assessment`
  - `console.log("Executive Assessment", executiveAssessment);`
- Line 505 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence: executiveAssessment.confidence,`
- Line 571 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 674 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence: executiveAssessment.confidence,`
- Line 694 · **type** · matched `executiveAssessment`
  - `executiveAssessment: typeof executiveAssessment;`

### Executive

#### `engine/v3/executive/buildExecutiveChangeSummary.ts`

- Line 27 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 33 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 239 · **read** · matched `executiveAssessment`
  - `input.currentSnapshot?.executiveAssessmentConfidence ?? 0;`
- Line 242 · **read** · matched `executiveAssessment`
  - `input.previousSnapshot?.executiveAssessmentConfidence ?? currentConfidence;`

#### `engine/v3/executive/executiveLearningSummary.ts`

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

### Projection

#### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 49 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 275 · **read** · matched `executiveAssessment`
  - `return runtimeMemory?.executiveAssessment?.theoryValidation;`
- Line 291 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 292 · **read** · matched `executiveAssessment`
  - `runtimeMemory?.executiveAssessment;`
- Line 302 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment?.confidence ??`
- Line 346 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment?.summary \|\|`

### Benchmark

#### `engine/benchmark/auditUnderstandingLayers.ts`

- Line 8 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

#### `engine/benchmark/benchmarkReporter.ts`

- Line 268 · **unknown** · matched `executiveAssessment`
  - `"   Recommendation: improve theory validation inside buildExecutiveAssessment().",`
- Line 288 · **unknown** · matched `executiveAssessment`
  - `console.log("   Recommendation: improve buildExecutiveAssessment().");`

#### `engine/benchmark/benchmarkScorer.ts`

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

#### `engine/benchmark/runAtlasSimulation.ts`

- Line 552 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment = asRecord(memory.executiveAssessment);`
- Line 554 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.theoryValidation,`
- Line 590 · **unknown** · matched `Executive Assessment`
  - `"EXECUTIVE ASSESSMENT",`
- Line 591 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.executiveNarrative ??`
- Line 592 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary,`

#### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 105 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 174 · **read** · matched `executiveAssessment`
  - `\| NonNullable<BenchmarkRuntimeMemory["executiveAssessment"]>["theoryValidation"]`
- Line 260 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment = memory.executiveAssessment`
- Line 262 · **read** · matched `executiveAssessment`
  - `summary: memory.executiveAssessment.summary,`
- Line 263 · **read** · matched `executiveAssessment`
  - `executiveNarrative: memory.executiveAssessment.executiveNarrative,`
- Line 264 · **read** · matched `executiveAssessment`
  - `recommendedFocus: memory.executiveAssessment.recommendedFocus,`
- Line 269 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment?.summary,`
- Line 270 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment?.executiveNarrative,`
- Line 271 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment?.mechanismCenteredNarrative,`
- Line 272 · **read** · matched `executiveAssessment`
  - `...(memory.executiveAssessment?.primaryMechanismSummaries ?? []),`
- Line 273 · **read** · matched `executiveAssessment`
  - `...(memory.executiveAssessment?.recommendedFocus ?? []),`
- Line 285 · **read** · matched `executiveAssessment`
  - `theoryValidationText(memory.executiveAssessment?.theoryValidation),`
- Line 304 · **read** · matched `executiveAssessment`
  - `theoryValidation: memory.executiveAssessment?.theoryValidation,`
- Line 308 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 321 · **read** · matched `executiveAssessment`
  - `theoryValidation: memory.executiveAssessment?.theoryValidation,`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
