# Capability Trace — Organizational Beliefs

Generated: 2026-07-10T23:27:08.492Z

## Search Terms

- `Organizational Beliefs`
- `organizationalBeliefs`
- `OrganizationalBeliefs`
- `organizational-beliefs`
- `organizational beliefs`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 23 |
| Runtime | ✅ Found | 25 |
| Executive | ✅ Found | 5 |
| Projection | ✅ Found | 1 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 17 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/compression/semanticCompression.ts`

- Line 37 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: SourceRecord[];`
- Line 434 · **unknown** · matched `Organizational Beliefs`
  - `* Higher-order layers such as Organizational Beliefs and Concept Candidates`
- Line 444 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: asArray(params.organizationalBeliefs),`

#### `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`

- Line 9 · **import** · matched `organizationalBeliefs`
  - `import type { OrganizationalBelief } from "./organizationalBeliefs";`
- Line 171 · **unknown** · matched `organizationalBeliefs`
  - `export function inferOrganizationalBeliefs(params: {`

#### `engine/v3/model/beliefs/updateOrganizationalBeliefs.ts`

- Line 5 · **import** · matched `organizationalBeliefs`
  - `} from "./organizationalBeliefs";`
- Line 116 · **unknown** · matched `organizationalBeliefs`
  - `export function updateOrganizationalBeliefs(params: {`

#### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 82 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: OrganizationalBeliefLike[];`
- Line 528 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: input.organizationalBeliefs ?? [],`

#### `engine/v3/model/judgment/buildTheoryReflection.ts`

- Line 41 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: OrganizationalBeliefLike[];`
- Line 338 · **read** · matched `organizationalBeliefs`
  - `beliefs: input.organizationalBeliefs ?? [],`
- Line 349 · **read** · matched `organizationalBeliefs`
  - `beliefs: input.organizationalBeliefs ?? [],`
- Line 369 · **unknown** · matched `organizationalBeliefs`
  - `supportingOrganizationalBeliefs: supportingBeliefEvidence,`

#### `engine/v3/model/judgment/organizationalJudgment.ts`

- Line 100 · **unknown** · matched `organizationalBeliefs`
  - `supportingOrganizationalBeliefs: TheoryValidationEvidence[];`

#### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 234 · **unknown** · matched `Organizational Beliefs`
  - `recommendations.push("Repeated evidence connected to current organizational beliefs");`

#### `engine/v3/model/state/inferOrganizationalConditions.ts`

- Line 83 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: any[];`
- Line 839 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: any[];`
- Line 848 · **unknown** · matched `organizationalBeliefs`
  - `organizationalBeliefs,`
- Line 859 · **unknown** · matched `organizationalBeliefs`
  - `const matchingBeliefs = organizationalBeliefs.filter((belief) =>`
- Line 1200 · **definition** · matched `organizationalBeliefs`
  - `const organizationalBeliefs = input.organizationalBeliefs ?? [];`
- Line 1213 · **unknown** · matched `organizationalBeliefs`
  - `organizationalBeliefs,`

#### `engine/v3/semantic/buildSemanticObservations.ts`

- Line 34 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: SemanticObservationInput[];`
- Line 769 · **read** · matched `organizationalBeliefs`
  - `inputs: params.organizationalBeliefs,`

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 15 · **import** · matched `organizationalBeliefs`
  - `import { inferOrganizationalBeliefs } from "../model/beliefs/inferOrganizationalBeliefs";`
- Line 16 · **import** · matched `organizationalBeliefs`
  - `import { updateOrganizationalBeliefs } from "../model/beliefs/updateOrganizationalBeliefs";`
- Line 325 · **unknown** · matched `organizationalBeliefs`
  - `const inferredOrganizationalBeliefs = inferOrganizationalBeliefs({`
- Line 345 · **unknown** · matched `organizationalBeliefs`
  - `const organizationalBeliefState = updateOrganizationalBeliefs({`
- Line 346 · **read** · matched `organizationalBeliefs`
  - `existingBeliefs: updatedOrganizationalUnderstandingState.organizationalBeliefs,`
- Line 347 · **unknown** · matched `organizationalBeliefs`
  - `incomingBeliefs: inferredOrganizationalBeliefs,`
- Line 353 · **unknown** · matched `organizationalBeliefs`
  - `beliefs: organizationalBeliefState.beliefs,`
- Line 361 · **unknown** · matched `organizationalBeliefs`
  - `beliefRevisions: organizationalBeliefState.revisions,`
- Line 366 · **unknown** · matched `organizationalBeliefs`
  - `persistentBeliefs: organizationalBeliefState.beliefs.length,`
- Line 389 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: organizationalBeliefState.beliefs,`
- Line 408 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: organizationalBeliefState.beliefs,`
- Line 422 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: organizationalBeliefState.beliefs,`
- Line 449 · **unknown** · matched `Organizational Beliefs`
  - `console.log("Organizational Beliefs", organizationalBeliefState.beliefs);`
- Line 452 · **unknown** · matched `organizationalBeliefs`
  - `organizationalBeliefState.revisions,`
- Line 460 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: organizationalBeliefState.beliefs,`
- Line 481 · **unknown** · matched `organizationalBeliefs`
  - `beliefCount: organizationalBeliefState.beliefs.length,`
- Line 509 · **unknown** · matched `organizationalBeliefs`
  - `...organizationalBeliefState.revisions.map((revision) => ({`
- Line 584 · **unknown** · matched `organizationalBeliefs`
  - `...organizationalBeliefState.revisions,`
- Line 601 · **unknown** · matched `organizationalBeliefs`
  - `beliefs: organizationalBeliefState.beliefs,`
- Line 637 · **unknown** · matched `organizationalBeliefs`
  - `organizationalBeliefCount: organizationalBeliefState.beliefs.length,`
- Line 639 · **unknown** · matched `organizationalBeliefs`
  - `organizationalBeliefState.revisions.length,`
- Line 697 · **unknown** · matched `organizationalBeliefs`
  - `organizationalBeliefRevisions: typeof organizationalBeliefState.revisions;`

#### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 1 · **import** · matched `organizationalBeliefs`
  - `import type { OrganizationalBelief } from "../model/beliefs/organizationalBeliefs";`
- Line 191 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: OrganizationalBelief[];`
- Line 395 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: [],`

### Executive

#### `engine/v3/executive/buildExecutiveState.ts`

- Line 403 · **read** · matched `organizationalBeliefs`
  - `(runtime as any)?.organizationalBeliefs ??`

#### `engine/v3/executive/executiveLearningSummary.ts`

- Line 266 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: OrganizationalBelief[];`
- Line 301 · **read** · matched `organizationalBeliefs`
  - `beliefs: memory.organizationalUnderstandingState?.organizationalBeliefs,`
- Line 322 · **unknown** · matched `Organizational Beliefs`
  - `: `Since the previous investigation, Discovery strengthened ${strengthenedBeliefs} organizational beliefs, identified ${newBeliefs} new beliefs, stabilized ${stabilizedTheories} organizational theories, and changed overall understanding by ${`

#### `engine/v3/executive/expression/executiveLanguage.ts`

- Line 57 · **unknown** · matched `Organizational Beliefs`
  - `"organizational beliefs",`

### Projection

#### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 31 · **unknown** · matched `organizationalBeliefs`
  - `supportingOrganizationalBeliefs: ExecutiveTheoryValidationEvidence[];`

### Benchmark

#### `engine/benchmark/benchmarkScorer.ts`

- Line 56 · **unknown** · matched `organizationalBeliefs`
  - `supportingOrganizationalBeliefs?: TheoryValidationItem[];`
- Line 194 · **unknown** · matched `Organizational Beliefs`
  - `"supporting organizational beliefs",`
- Line 235 · **unknown** · matched `Organizational Beliefs`
  - `"organizational beliefs",`
- Line 256 · **unknown** · matched `organizationalBeliefs`
  - `...(theoryValidation.supportingOrganizationalBeliefs?.flatMap((item) => [`
- Line 686 · **unknown** · matched `organizationalBeliefs`
  - `theoryValidation?.supportingOrganizationalBeliefs,`

#### `engine/benchmark/benchmarkTypes.ts`

- Line 26 · **unknown** · matched `organizationalBeliefs`
  - `supportingOrganizationalBeliefs?: Array<{`

#### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 77 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: Array<{`
- Line 118 · **unknown** · matched `organizationalBeliefs`
  - `supportingOrganizationalBeliefs?: Array<{`
- Line 186 · **unknown** · matched `organizationalBeliefs`
  - `...(theoryValidation.supportingOrganizationalBeliefs?.flatMap((item) => [`
- Line 317 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs: memory.organizationalBeliefs,`

#### `engine/benchmark/understandingFitnessScorer.ts`

- Line 34 · **type** · matched `organizationalBeliefs`
  - `organizationalBeliefs?: Array<{`
- Line 52 · **unknown** · matched `organizationalBeliefs`
  - `supportingOrganizationalBeliefs?: TheoryValidationItem[];`
- Line 111 · **definition** · matched `organizationalBeliefs`
  - `const organizationalBeliefs = input.organizationalBeliefs ?? [];`
- Line 132 · **unknown** · matched `organizationalBeliefs`
  - `scorePresence(organizationalBeliefs.length, 3),`
- Line 134 · **unknown** · matched `organizationalBeliefs`
  - `organizationalBeliefs.some((belief) => hasText(belief.trend)) ? 1 : 0,`
- Line 156 · **unknown** · matched `organizationalBeliefs`
  - `theoryValidation?.supportingOrganizationalBeliefs?.length ?? 0,`
- Line 160 · **unknown** · matched `organizationalBeliefs`
  - `scorePresence(organizationalBeliefs.length, 2),`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
