# Capability Trace — Executive Understanding Synthesis

Generated: 2026-07-16T01:19:09.227Z

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

- `CAP-COM-001`
- `CAP-DEC-001`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-UND-006 |
| Canonical producer declared | ✅ | engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts |
| Canonical producer exists | ✅ | engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts |
| Implementation files | ✅ | 4 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalUnderstandingState |
| Executive destination | ✅ | Atlas, ExecutiveProjection, ExecutiveWorkspace |
| Consumers | ✅ | 2 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `app/api/discovery-lab/route.ts`
- `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`
- `components/executive-v2/projection/ExecutiveScenarioProjection.ts`
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
- `engine/v3/model/simulate/buildSimulationScenario.ts`
- `engine/v3/model/simulate/compareSimulationScenario.ts`
- `engine/v3/runtime/index.ts`
- `engine/v3/runtime/organizationRuntime.ts`
- `engine/v3/runtime/organizationalUnderstandingState.ts`
- `engine/v3/runtime/updateOrganizationalUnderstandingState.ts`
- `engine/v3/scenarios/buildExecutiveDecisionContext.ts`
- `engine/v3/understanding/canonicalUnderstanding.ts`
- `engine/v3/understanding/rankOrganizationalUnderstanding.ts`
- `scripts/cognition/generateArchitectureHandoff.mjs`
- `scripts/cognition/generateArchitectureState.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`

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
| Engine | ✅ Found | 82 |
| Runtime | ✅ Found | 83 |
| Executive | ✅ Found | 12 |
| Projection | ✅ Found | 6 |
| UI | ✅ Found | 3 |
| API | ✅ Found | 2 |
| Simulation | ✅ Found | 7 |
| Benchmark | ✅ Found | 41 |
| Other | ✅ Found | 8 |

### Detailed Matches

#### Engine

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import { buildOrganizationalUnderstanding } from "./buildOrganizationalUnderstanding";`
- Line 407 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstanding =`
- Line 408 · **unknown** · matched `OrganizationalUnderstanding`
  - `buildOrganizationalUnderstanding({`
- Line 445 · **unknown** · matched `OrganizationalUnderstanding`
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

- Line 115 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingState = {`
- Line 121 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingCondition = {`
- Line 129 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingInvestigation = {`
- Line 138 · **assignment** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstanding = {`
- Line 159 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalState: OrganizationalUnderstandingState \| null;`
- Line 165 · **unknown** · matched `OrganizationalUnderstanding`
  - `dominantCondition: OrganizationalUnderstandingCondition \| null;`
- Line 223 · **unknown** · matched `OrganizationalUnderstanding`
  - `nextInvestigation: OrganizationalUnderstandingInvestigation \| null;`
- Line 256 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: OrganizationalUnderstanding;`
- Line 271 · **unknown** · matched `OrganizationalUnderstanding`
  - `* consumers migrate to organizationalUnderstanding.`

##### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 43 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore: number;`
- Line 286 · **unknown** · matched `OrganizationalUnderstanding`
  - `return \`Discovery created its first longitudinal learning snapshot for this organization. Memory maturity is ${params.currentSnapshot.memoryMaturityScore} and organizational understanding is ${params.currentSnapshot.organizationalUnderstandingScore}%.\`;`
- Line 408 · **unknown** · matched `OrganizationalUnderstanding`
  - `? currentSnapshot.organizationalUnderstandingScore -`
- Line 409 · **unknown** · matched `OrganizationalUnderstanding`
  - `previousSnapshot.organizationalUnderstandingScore`
- Line 472 · **unknown** · matched `OrganizationalUnderstanding`
  - `currentSnapshot.organizationalUnderstandingScore,`
- Line 473 · **unknown** · matched `OrganizationalUnderstanding`
  - `previousSnapshot?.organizationalUnderstandingScore,`

##### `engine/v3/model/memory/organizationalMemory.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingState } from "../../runtime/organizationalUnderstandingState";`
- Line 16 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandingState: OrganizationalUnderstandingState;`

##### `engine/v3/scenarios/buildExecutiveDecisionContext.ts`

- Line 92 · **unknown** · matched `organizational-understanding`
  - `* organizational-understanding pipeline.`
- Line 99 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState`

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
- Line 21 · **import** · matched `OrganizationalUnderstanding`
  - `import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";`
- Line 23 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding,`
- Line 25 · **import** · matched `consolidateUnderstanding`
  - `} from "../understanding/consolidateUnderstanding";`
- Line 26 · **import** · matched `synthesizeUnderstanding`
  - `import { synthesizeUnderstanding } from "../understanding/synthesizeUnderstanding";`
- Line 27 · **import** · matched `buildExecutiveUnderstandingCandidates`
  - `import { buildExecutiveUnderstandingCandidates } from "../understanding/buildExecutiveUnderstandingCandidates";`
- Line 38 · **import** · matched `OrganizationalUnderstanding`
  - `import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 51 · **definition** · matched `evolveOrganizationRuntime`
  - `export function evolveOrganizationRuntime(params: {`
- Line 106 · **unknown** · matched `OrganizationalUnderstanding`
  - `const existingOrganizationalUnderstandingState:`
- Line 107 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState =`
- Line 108 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState ??`
- Line 109 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState({`
- Line 135 · **unknown** · matched `OrganizationalUnderstanding`
  - `const baseOrganizationalUnderstandingState =`
- Line 136 · **unknown** · matched `OrganizationalUnderstanding`
  - `updateOrganizationalUnderstandingState({`
- Line 137 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: existingOrganizationalUnderstandingState,`
- Line 142 · **unknown** · matched `consolidateUnderstanding`
  - `const consolidationResult = consolidateUnderstanding(`
- Line 143 · **unknown** · matched `OrganizationalUnderstanding`
  - `baseOrganizationalUnderstandingState,`
- Line 147 · **unknown** · matched `OrganizationalUnderstanding`
  - `const updatedOrganizationalUnderstandingState:`
- Line 148 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 149 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState,`
- Line 153 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState.evolutionHistory,`
- Line 182 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 183 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState,`
- Line 231 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 240 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 389 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 405 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.organizationalBeliefs,`
- Line 456 · **unknown** · matched `OrganizationalUnderstanding`
  - `const beliefUpdatedOrganizationalUnderstandingState:`
- Line 457 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 458 · **unknown** · matched `OrganizationalUnderstanding`
  - `...updatedOrganizationalUnderstandingState,`
- Line 464 · **unknown** · matched `OrganizationalUnderstanding`
  - `const synthesizedOrganizationalUnderstandingState =`
- Line 465 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 466 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: beliefUpdatedOrganizationalUnderstandingState,`
- Line 473 · **unknown** · matched `OrganizationalUnderstanding`
  - `synthesizedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 742 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates({`
- Line 753 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 754 · **unknown** · matched `OrganizationalUnderstanding`
  - `...existingOrganizationalUnderstandingState,`
- Line 757 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.currentUnderstandings.filter(`
- Line 769 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding(`
- Line 774 · **unknown** · matched `OrganizationalUnderstanding`
  - `const finalOrganizationalUnderstandingState =`
- Line 775 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 811 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.currentUnderstandings.map(`
- Line 837 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 838 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1125 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1126 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1160 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1291 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 1292 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1341 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1342 · **unknown** · matched `OrganizationalUnderstanding`
  - `typeof finalOrganizationalUnderstandingState;`

##### `engine/v3/runtime/index.ts`

- Line 18 · **import** · matched `evolveOrganizationRuntime`
  - `export { evolveOrganizationRuntime } from "./evolveOrganizationRuntime";`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 22 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState,`
- Line 23 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingState";`
- Line 25 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState,`
- Line 26 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingState";`
- Line 66 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState: OrganizationalUnderstandingState;`
- Line 168 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 169 · **unknown** · matched `OrganizationalUnderstanding`
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

##### `components/executive-v2/projection/ExecutiveScenarioProjection.ts`

- Line 23 · **import** · matched `consolidateUnderstanding`
  - `} from "../../../engine/v3/understanding/consolidateUnderstanding";`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 164 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState?: {`
- Line 238 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory?.organizationalUnderstandingState?.currentUnderstandings ?? [];`
- Line 266 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health?.maturity ??`
- Line 339 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health?.uncertainty ??`
- Line 957 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health`

#### UI

##### `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`

- Line 9 · **unknown** · matched `CAP-UND-006`
  - `\| "CAP-UND-006"`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`

- Line 17 · **unknown** · matched `CAP-UND-006`
  - `\| "CAP-UND-006"`

##### `components/results/SemanticConceptInspector.tsx`

- Line 23 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime?.memory?.organizationalUnderstandingState?.currentUnderstandings \|\|`

#### API

##### `app/api/discovery-lab/route.ts`

- Line 6 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 35 · **unknown** · matched `evolveOrganizationRuntime`
  - `const evolvedRuntime = evolveOrganizationRuntime({`

#### Simulation

##### `engine/v3/model/simulate/buildSimulationScenario.ts`

- Line 13 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates,`
- Line 14 · **import** · matched `buildExecutiveUnderstandingCandidates`
  - `} from "../../understanding/buildExecutiveUnderstandingCandidates";`
- Line 17 · **import** · matched `consolidateUnderstanding`
  - `} from "../../understanding/consolidateUnderstanding";`
- Line 27 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `Parameters<typeof buildExecutiveUnderstandingCandidates>[0];`
- Line 162 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates({`

##### `engine/v3/model/simulate/compareSimulationScenario.ts`

- Line 364 · **unknown** · matched `OrganizationalUnderstanding`
  - `.organizationalUnderstanding`
- Line 369 · **unknown** · matched `OrganizationalUnderstanding`
  - `.organizationalUnderstanding`

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
- Line 8 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstanding } from "../v3/model/judgment/organizationalJudgment";`
- Line 13 · **unknown** · matched `OrganizationalUnderstanding`
  - `scoreOrganizationalUnderstanding,`
- Line 14 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingScorer";`
- Line 132 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?: OrganizationalUnderstanding;`
- Line 178 · **unknown** · matched `evolveOrganizationRuntime`
  - `typeof evolveOrganizationRuntime`
- Line 187 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore: ReturnType<`
- Line 188 · **unknown** · matched `OrganizationalUnderstanding`
  - `typeof scoreOrganizationalUnderstanding`
- Line 331 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime({`
- Line 408 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstanding =`
- Line 410 · **unknown** · matched `OrganizationalUnderstanding`
  - `?.organizationalUnderstanding;`
- Line 413 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.statement,`
- Line 414 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.summary,`
- Line 415 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 417 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 419 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 421 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 423 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 425 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 427 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 429 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 431 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 434 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.narrative,`
- Line 511 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstandingScore =`
- Line 512 · **unknown** · matched `OrganizationalUnderstanding`
  - `scoreOrganizationalUnderstanding(`
- Line 513 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding,`
- Line 560 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore,`

#### Other

##### `scripts/cognition/generateArchitectureHandoff.mjs`

- Line 374 · **unknown** · matched `Executive Understanding Synthesis`
  - `"Executive Understanding Synthesis",`

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 64 · **unknown** · matched `Executive Understanding Synthesis`
  - `"Executive Understanding Synthesis",`
- Line 973 · **unknown** · matched `Executive Understanding Synthesis`
  - `"Executive Understanding Synthesis",`

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 74 · **unknown** · matched `CAP-UND-006`
  - `"CAP-UND-006",`
- Line 133 · **unknown** · matched `CAP-UND-006`
  - `"CAP-UND-006",`
- Line 140 · **unknown** · matched `OrganizationalUnderstanding`
  - `"OrganizationalUnderstanding",`
- Line 243 · **unknown** · matched `CAP-UND-006`
  - `"CAP-UND-006",`
- Line 253 · **unknown** · matched `OrganizationalUnderstanding`
  - `"OrganizationalUnderstandingState",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
