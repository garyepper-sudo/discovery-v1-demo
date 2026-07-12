# Capability Trace — Executive Understanding Synthesis

Generated: 2026-07-12T13:50:21.798Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-UND-006` |
| Capability name | Executive Understanding Synthesis |
| Cognitive domain | UND |
| Architectural layer | COG |
| Canonical producer | `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts` |
| Runtime destination | `OrganizationRuntime.organizationalUnderstandingState` |
| Executive destination | `Atlas, ExecutiveProjection, ExecutiveWorkspace` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `OrganizationalUnderstanding`
- `OrganizationalUnderstandingState`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
- `engine/v3/understanding/consolidateUnderstanding.ts`
- `engine/v3/understanding/synthesizeUnderstanding.ts`

### Capability Dependencies

- `CAP-MEM-001`
- `CAP-UND-005`

### Declared Consumers

None declared.

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-UND-006 |
| Canonical producer declared | ✅ | engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts |
| Canonical producer exists | ✅ | engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts |
| Implementation files | ✅ | 4 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalUnderstandingState |
| Executive destination | ✅ | Atlas, ExecutiveProjection, ExecutiveWorkspace |
| Consumers | ✅ | Terminal capability (no downstream cognitive capability expected). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `app/api/discovery-lab/route.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/results/SemanticConceptInspector.tsx`
- `engine/benchmark/auditUnderstandingLayers.ts`
- `engine/benchmark/organizationalUnderstandingScorer.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/v3/executive/buildExecutiveChangeSummary.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/buildOrganizationalUnderstanding.ts`
- `engine/v3/model/judgment/organizationalJudgment.ts`
- `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`
- `engine/v3/model/memory/organizationalMemory.ts`
- `engine/v3/runtime/index.ts`
- `engine/v3/runtime/organizationRuntime.ts`
- `engine/v3/runtime/organizationalUnderstandingState.ts`
- `engine/v3/runtime/updateOrganizationalUnderstandingState.ts`
- `engine/v3/understanding/canonicalUnderstanding.ts`
- `engine/v3/understanding/rankOrganizationalUnderstanding.ts`
- `scripts/cognition/generateArchitectureHandoff.mjs`
- `scripts/cognition/generateArchitectureState.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Executive Understanding Synthesis`
- `executiveUnderstandingSynthesis`
- `ExecutiveUnderstandingSynthesis`
- `executive-understanding-synthesis`
- `executive understanding synthesis`
- `CAP-UND-006`
- `capUnd006`
- `CapUnd006`
- `cap-und-006`
- `buildExecutiveUnderstandingCandidates`
- `BuildExecutiveUnderstandingCandidates`
- `build-executive-understanding-candidates`
- `buildexecutiveunderstandingcandidates`
- `consolidateUnderstanding`
- `ConsolidateUnderstanding`
- `consolidate-understanding`
- `consolidateunderstanding`
- `synthesizeUnderstanding`
- `SynthesizeUnderstanding`
- `synthesize-understanding`
- `synthesizeunderstanding`
- `evolveOrganizationRuntime`
- `EvolveOrganizationRuntime`
- `evolve-organization-runtime`
- `evolveorganizationruntime`
- `OrganizationalUnderstanding`
- `organizationalUnderstanding`
- `organizational-understanding`
- `organizationalunderstanding`
- `OrganizationalUnderstandingState`
- `organizationalUnderstandingState`
- `organizational-understanding-state`
- `organizationalunderstandingstate`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 80 |
| Runtime | ✅ Found | 81 |
| Executive | ✅ Found | 12 |
| Projection | ✅ Found | 5 |
| UI | ✅ Found | 1 |
| API | ✅ Found | 2 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 41 |
| Other | ✅ Found | 3 |

### Detailed Matches

#### Engine

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import { buildOrganizationalUnderstanding } from "./buildOrganizationalUnderstanding";`
- Line 366 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstanding =`
- Line 367 · **unknown** · matched `OrganizationalUnderstanding`
  - `buildOrganizationalUnderstanding({`
- Line 404 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding,`

##### `engine/v3/model/judgment/buildOrganizationalUnderstanding.ts`

- Line 2 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstanding,`
- Line 15 · **type** · matched `OrganizationalUnderstanding`
  - `type BuildOrganizationalUnderstandingInput = {`
- Line 48 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function buildOrganizationalUnderstanding({`
- Line 57 · **unknown** · matched `OrganizationalUnderstanding`
  - `}: BuildOrganizationalUnderstandingInput): OrganizationalUnderstanding {`

##### `engine/v3/model/judgment/organizationalJudgment.ts`

- Line 114 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingState = {`
- Line 120 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingCondition = {`
- Line 128 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingInvestigation = {`
- Line 137 · **assignment** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstanding = {`
- Line 158 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalState: OrganizationalUnderstandingState \| null;`
- Line 164 · **unknown** · matched `OrganizationalUnderstanding`
  - `dominantCondition: OrganizationalUnderstandingCondition \| null;`
- Line 222 · **unknown** · matched `OrganizationalUnderstanding`
  - `nextInvestigation: OrganizationalUnderstandingInvestigation \| null;`
- Line 255 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: OrganizationalUnderstanding;`
- Line 261 · **unknown** · matched `OrganizationalUnderstanding`
  - `* consumers migrate to organizationalUnderstanding.`

##### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 38 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore: number;`
- Line 279 · **unknown** · matched `OrganizationalUnderstanding`
  - `return \`Discovery created its first longitudinal learning snapshot for this organization. Memory maturity is ${params.currentSnapshot.memoryMaturityScore} and organizational understanding is ${params.currentSnapshot.organizationalUnderstandingScore}%.\`;`
- Line 401 · **unknown** · matched `OrganizationalUnderstanding`
  - `? currentSnapshot.organizationalUnderstandingScore -`
- Line 402 · **unknown** · matched `OrganizationalUnderstanding`
  - `previousSnapshot.organizationalUnderstandingScore`
- Line 465 · **unknown** · matched `OrganizationalUnderstanding`
  - `currentSnapshot.organizationalUnderstandingScore,`
- Line 466 · **unknown** · matched `OrganizationalUnderstanding`
  - `previousSnapshot?.organizationalUnderstandingScore,`

##### `engine/v3/model/memory/organizationalMemory.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingState } from "../../runtime/organizationalUnderstandingState";`
- Line 16 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandingState: OrganizationalUnderstandingState;`

##### `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`

- Line 1 · **import** · matched `consolidateUnderstanding`
  - `import type { UnderstandingCandidate } from "./consolidateUnderstanding";`
- Line 48 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `export type BuildExecutiveUnderstandingCandidatesInput = {`
- Line 69 · **definition** · matched `buildExecutiveUnderstandingCandidates`
  - `export function buildExecutiveUnderstandingCandidates(`
- Line 70 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `input: BuildExecutiveUnderstandingCandidatesInput,`

##### `engine/v3/understanding/canonicalUnderstanding.ts`

- Line 5 · **unknown** · matched `OrganizationalUnderstanding`
  - `* OrganizationalUnderstandingItem and OrganizationalUnderstandingState.`
- Line 8 · **unknown** · matched `OrganizationalUnderstanding`
  - `* operates directly on OrganizationalUnderstandingItem.`

##### `engine/v3/understanding/consolidateUnderstanding.ts`

- Line 2 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingItem,`
- Line 3 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingSource,`
- Line 4 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState,`
- Line 5 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../runtime/organizationalUnderstandingState";`
- Line 12 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../runtime/organizationalUnderstandingState";`
- Line 24 · **unknown** · matched `OrganizationalUnderstanding`
  - `source?: OrganizationalUnderstandingSource;`
- Line 40 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedUnderstandings: OrganizationalUnderstandingItem[];`
- Line 436 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstandingItem`
- Line 437 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingItem {`
- Line 507 · **definition** · matched `consolidateUnderstanding`
  - `export function consolidateUnderstanding(`
- Line 508 · **unknown** · matched `OrganizationalUnderstanding`
  - `currentState: OrganizationalUnderstandingState,`
- Line 679 · **unknown** · matched `OrganizationalUnderstanding`
  - `const newUnderstanding: OrganizationalUnderstandingItem = {`

##### `engine/v3/understanding/rankOrganizationalUnderstanding.ts`

- Line 2 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingItem,`
- Line 3 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../runtime/organizationalUnderstandingState";`
- Line 23 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstandingItem,`
- Line 37 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstandingItem,`
- Line 46 · **unknown** · matched `OrganizationalUnderstanding`
  - `source: OrganizationalUnderstandingItem["source"],`
- Line 71 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function rankOrganizationalUnderstanding(`
- Line 72 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstandingItem,`
- Line 124 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function rankOrganizationalUnderstandings<`
- Line 125 · **unknown** · matched `OrganizationalUnderstanding`
  - `T extends OrganizationalUnderstandingItem,`
- Line 132 · **unknown** · matched `OrganizationalUnderstanding`
  - `rankOrganizationalUnderstanding(right) -`
- Line 133 · **unknown** · matched `OrganizationalUnderstanding`
  - `rankOrganizationalUnderstanding(left);`
- Line 169 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function choosePrimaryOrganizationalUnderstanding<`
- Line 170 · **unknown** · matched `OrganizationalUnderstanding`
  - `T extends OrganizationalUnderstandingItem,`
- Line 178 · **unknown** · matched `OrganizationalUnderstanding`
  - `return rankOrganizationalUnderstandings(`

##### `engine/v3/understanding/synthesizeUnderstanding.ts`

- Line 5 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingItem,`
- Line 6 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingRecommendation,`
- Line 7 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingScore,`
- Line 8 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState,`
- Line 9 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../runtime/organizationalUnderstandingState";`
- Line 13 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../runtime/organizationalUnderstandingState";`
- Line 15 · **unknown** · matched `OrganizationalUnderstanding`
  - `choosePrimaryOrganizationalUnderstanding,`
- Line 16 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./rankOrganizationalUnderstanding";`
- Line 52 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstandingItem`
- Line 158 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandings: OrganizationalUnderstandingItem[]`
- Line 159 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingScore {`
- Line 216 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandings: OrganizationalUnderstandingItem[]`
- Line 219 · **unknown** · matched `OrganizationalUnderstanding`
  - `choosePrimaryOrganizationalUnderstanding(`
- Line 233 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandings: OrganizationalUnderstandingItem[]`
- Line 234 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingRecommendation[] {`
- Line 235 · **unknown** · matched `OrganizationalUnderstanding`
  - `const recommendations: OrganizationalUnderstandingRecommendation[] = [];`
- Line 300 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandings: OrganizationalUnderstandingItem[]`
- Line 327 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandings: OrganizationalUnderstandingItem[];`
- Line 328 · **unknown** · matched `OrganizationalUnderstanding`
  - `recommendations: OrganizationalUnderstandingRecommendation[];`
- Line 340 · **unknown** · matched `OrganizationalUnderstanding`
  - `choosePrimaryOrganizationalUnderstanding(`
- Line 397 · **definition** · matched `synthesizeUnderstanding`
  - `export function synthesizeUnderstanding(params: {`
- Line 398 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: OrganizationalUnderstandingState;`
- Line 400 · **unknown** · matched `OrganizationalUnderstanding`
  - `}): OrganizationalUnderstandingState {`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 3 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 20 · **import** · matched `OrganizationalUnderstanding`
  - `import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";`
- Line 22 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding,`
- Line 24 · **import** · matched `consolidateUnderstanding`
  - `} from "../understanding/consolidateUnderstanding";`
- Line 25 · **import** · matched `synthesizeUnderstanding`
  - `import { synthesizeUnderstanding } from "../understanding/synthesizeUnderstanding";`
- Line 26 · **import** · matched `buildExecutiveUnderstandingCandidates`
  - `import { buildExecutiveUnderstandingCandidates } from "../understanding/buildExecutiveUnderstandingCandidates";`
- Line 37 · **import** · matched `OrganizationalUnderstanding`
  - `import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 43 · **definition** · matched `evolveOrganizationRuntime`
  - `export function evolveOrganizationRuntime(params: {`
- Line 91 · **unknown** · matched `OrganizationalUnderstanding`
  - `const existingOrganizationalUnderstandingState:`
- Line 92 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState =`
- Line 93 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState ??`
- Line 94 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState({`
- Line 120 · **unknown** · matched `OrganizationalUnderstanding`
  - `const baseOrganizationalUnderstandingState =`
- Line 121 · **unknown** · matched `OrganizationalUnderstanding`
  - `updateOrganizationalUnderstandingState({`
- Line 122 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: existingOrganizationalUnderstandingState,`
- Line 127 · **unknown** · matched `consolidateUnderstanding`
  - `const consolidationResult = consolidateUnderstanding(`
- Line 128 · **unknown** · matched `OrganizationalUnderstanding`
  - `baseOrganizationalUnderstandingState,`
- Line 132 · **unknown** · matched `OrganizationalUnderstanding`
  - `const updatedOrganizationalUnderstandingState:`
- Line 133 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 134 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState,`
- Line 138 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState.evolutionHistory,`
- Line 167 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 168 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState,`
- Line 216 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 225 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 374 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 390 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.organizationalBeliefs,`
- Line 441 · **unknown** · matched `OrganizationalUnderstanding`
  - `const beliefUpdatedOrganizationalUnderstandingState:`
- Line 442 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 443 · **unknown** · matched `OrganizationalUnderstanding`
  - `...updatedOrganizationalUnderstandingState,`
- Line 449 · **unknown** · matched `OrganizationalUnderstanding`
  - `const synthesizedOrganizationalUnderstandingState =`
- Line 450 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 451 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: beliefUpdatedOrganizationalUnderstandingState,`
- Line 458 · **unknown** · matched `OrganizationalUnderstanding`
  - `synthesizedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 551 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates({`
- Line 562 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 563 · **unknown** · matched `OrganizationalUnderstanding`
  - `...existingOrganizationalUnderstandingState,`
- Line 566 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.currentUnderstandings.filter(`
- Line 578 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding(`
- Line 583 · **unknown** · matched `OrganizationalUnderstanding`
  - `const finalOrganizationalUnderstandingState =`
- Line 584 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 620 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.currentUnderstandings.map(`
- Line 646 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 647 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 778 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 779 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 813 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 937 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 938 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 984 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 985 · **unknown** · matched `OrganizationalUnderstanding`
  - `typeof finalOrganizationalUnderstandingState;`

##### `engine/v3/runtime/index.ts`

- Line 18 · **import** · matched `evolveOrganizationRuntime`
  - `export { evolveOrganizationRuntime } from "./evolveOrganizationRuntime";`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 2 · **import** · matched `OrganizationalUnderstanding`
  - `import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 61 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState: OrganizationalUnderstandingState;`
- Line 138 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 139 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState({`

##### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 13 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingSource =`
- Line 32 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingScore = {`
- Line 44 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingHistoryEvent = {`
- Line 58 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingRecommendation = {`
- Line 69 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingItem = {`
- Line 71 · **unknown** · matched `OrganizationalUnderstanding`
  - `source: OrganizationalUnderstandingSource;`
- Line 113 · **unknown** · matched `OrganizationalUnderstanding`
  - `history: OrganizationalUnderstandingHistoryEvent[];`
- Line 120 · **unknown** · matched `OrganizationalUnderstanding`
  - `score: OrganizationalUnderstandingScore;`
- Line 169 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingEvolutionEvent = {`
- Line 184 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingState = {`
- Line 192 · **unknown** · matched `OrganizationalUnderstanding`
  - `score: OrganizationalUnderstandingScore;`
- Line 196 · **unknown** · matched `OrganizationalUnderstanding`
  - `currentUnderstandings: OrganizationalUnderstandingItem[];`
- Line 202 · **unknown** · matched `OrganizationalUnderstanding`
  - `recommendations: OrganizationalUnderstandingRecommendation[];`
- Line 208 · **unknown** · matched `OrganizationalUnderstanding`
  - `evolutionHistory: OrganizationalUnderstandingEvolutionEvent[];`
- Line 218 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function createEmptyUnderstandingScore(): OrganizationalUnderstandingScore {`
- Line 385 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function createEmptyOrganizationalUnderstandingState(params: {`
- Line 391 · **unknown** · matched `OrganizationalUnderstanding`
  - `}): OrganizationalUnderstandingState {`

##### `engine/v3/runtime/updateOrganizationalUnderstandingState.ts`

- Line 8 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingItem,`
- Line 9 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingState,`
- Line 10 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingState";`
- Line 28 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function updateOrganizationalUnderstandingState(params: {`
- Line 29 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: OrganizationalUnderstandingState;`
- Line 32 · **unknown** · matched `OrganizationalUnderstanding`
  - `}): OrganizationalUnderstandingState {`
- Line 35 · **unknown** · matched `OrganizationalUnderstanding`
  - `const newItems: OrganizationalUnderstandingItem[] = result.beliefs.map(`

#### Executive

##### `engine/v3/executive/buildExecutiveChangeSummary.ts`

- Line 25 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore?: number;`
- Line 31 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore?: number;`
- Line 227 · **unknown** · matched `OrganizationalUnderstanding`
  - `input.currentSnapshot?.organizationalUnderstandingScore ?? 0;`
- Line 230 · **unknown** · matched `OrganizationalUnderstanding`
  - `input.previousSnapshot?.organizationalUnderstandingScore ??`

##### `engine/v3/executive/executiveLearningSummary.ts`

- Line 75 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore: number;`
- Line 131 · **unknown** · matched `OrganizationalUnderstanding`
  - `: snapshot.organizationalUnderstandingScore -`
- Line 132 · **unknown** · matched `OrganizationalUnderstanding`
  - `previous.organizationalUnderstandingScore;`
- Line 140 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: snapshot.organizationalUnderstandingScore,`
- Line 265 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState?: {`
- Line 283 · **unknown** · matched `OrganizationalUnderstanding`
  - `const currentUnderstanding = current?.organizationalUnderstandingScore ?? 0;`
- Line 285 · **unknown** · matched `OrganizationalUnderstanding`
  - `previous?.organizationalUnderstandingScore ?? currentUnderstanding;`
- Line 301 · **unknown** · matched `OrganizationalUnderstanding`
  - `beliefs: memory.organizationalUnderstandingState?.organizationalBeliefs,`

#### Projection

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 80 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState?: {`
- Line 146 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory?.organizationalUnderstandingState?.currentUnderstandings ?? [];`
- Line 174 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health?.maturity ??`
- Line 247 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health?.uncertainty ??`
- Line 610 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health`

#### UI

##### `components/results/SemanticConceptInspector.tsx`

- Line 23 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime?.memory?.organizationalUnderstandingState?.currentUnderstandings \|\|`

#### API

##### `app/api/discovery-lab/route.ts`

- Line 6 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 35 · **unknown** · matched `evolveOrganizationRuntime`
  - `const evolvedRuntime = evolveOrganizationRuntime({`

#### Benchmark

##### `engine/benchmark/auditUnderstandingLayers.ts`

- Line 11 · **unknown** · matched `consolidateUnderstanding`
  - `"consolidateUnderstanding",`

##### `engine/benchmark/organizationalUnderstandingScorer.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstanding } from "../v3/model/judgment/organizationalJudgment";`
- Line 3 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingScore = {`
- Line 60 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstanding,`
- Line 108 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstanding,`
- Line 176 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstanding,`
- Line 224 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstanding,`
- Line 274 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstanding,`
- Line 322 · **unknown** · matched `OrganizationalUnderstanding`
  - `understanding: OrganizationalUnderstanding,`
- Line 370 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function scoreOrganizationalUnderstanding(`
- Line 372 · **unknown** · matched `OrganizationalUnderstanding`
  - `\| OrganizationalUnderstanding`
- Line 375 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingScore {`

##### `engine/benchmark/runAtlasSimulation.ts`

- Line 560 · **unknown** · matched `OrganizationalUnderstanding`
  - `memoryRecord.organizationalUnderstandingState,`
- Line 676 · **unknown** · matched `OrganizationalUnderstanding`
  - `investigation.organizationalUnderstandingScore;`

##### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 3 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 7 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstanding } from "../v3/model/judgment/organizationalJudgment";`
- Line 12 · **unknown** · matched `OrganizationalUnderstanding`
  - `scoreOrganizationalUnderstanding,`
- Line 13 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingScorer";`
- Line 131 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?: OrganizationalUnderstanding;`
- Line 177 · **unknown** · matched `evolveOrganizationRuntime`
  - `typeof evolveOrganizationRuntime`
- Line 186 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore: ReturnType<`
- Line 187 · **unknown** · matched `OrganizationalUnderstanding`
  - `typeof scoreOrganizationalUnderstanding`
- Line 330 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime({`
- Line 394 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstanding =`
- Line 396 · **unknown** · matched `OrganizationalUnderstanding`
  - `?.organizationalUnderstanding;`
- Line 399 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.statement,`
- Line 400 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.summary,`
- Line 401 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 403 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 405 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 407 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 409 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 411 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 413 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 415 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 417 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 420 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.narrative,`
- Line 497 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstandingScore =`
- Line 498 · **unknown** · matched `OrganizationalUnderstanding`
  - `scoreOrganizationalUnderstanding(`
- Line 499 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding,`
- Line 539 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore,`

#### Other

##### `scripts/cognition/generateArchitectureHandoff.mjs`

- Line 374 · **unknown** · matched `Executive Understanding Synthesis`
  - `"Executive Understanding Synthesis",`

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 64 · **unknown** · matched `Executive Understanding Synthesis`
  - `"Executive Understanding Synthesis",`
- Line 828 · **unknown** · matched `Executive Understanding Synthesis`
  - `"Executive Understanding Synthesis",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
