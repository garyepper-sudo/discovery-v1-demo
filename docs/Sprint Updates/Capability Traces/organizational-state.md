# Capability Trace — Organizational State

Generated: 2026-07-10T23:26:28.742Z

## Search Terms

- `Organizational State`
- `organizationalState`
- `OrganizationalState`
- `organizational-state`
- `organizational state`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 20 |
| Runtime | ✅ Found | 11 |
| Executive | ✅ Found | 11 |
| Projection | ✅ Found | 9 |
| UI | ✅ Found | 8 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 44 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 53 · **type** · matched `organizationalState`
  - `type OrganizationalStateLike = {`
- Line 84 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateLike;`
- Line 286 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateLike;`
- Line 293 · **unknown** · matched `organizationalState`
  - `organizationalState,`
- Line 312 · **unknown** · matched `organizationalState`
  - `const stateSentence = organizationalState?.summary`
- Line 313 · **unknown** · matched `organizationalState`
  - `? organizationalState.summary`
- Line 314 · **unknown** · matched `organizationalState`
  - `: `Discovery sees the organization as ${organizationalState?.status ?? "under assessment"}.`;`
- Line 339 · **unknown** · matched `organizationalState`
  - `organizationalState?.executiveImplication,`
- Line 408 · **read** · matched `organizationalState`
  - `input.organizationalState?.dominantConditions?.includes(condition.id),`
- Line 416 · **read** · matched `organizationalState`
  - `input.organizationalState?.dominantConditions`
- Line 506 · **read** · matched `organizationalState`
  - `input.organizationalState?.confidence ?? 0,`
- Line 533 · **unknown** · matched `Organizational State`
  - `? `Discovery judges that the current organizational state is ${input.organizationalState?.status ?? "under assessment"}, led by ${primaryCondition.name}.``
- Line 554 · **type** · matched `organizationalState`
  - `organizationalState: input.organizationalState,`

#### `engine/v3/model/state/inferOrganizationalConditions.ts`

- Line 67 · **unknown** · matched `organizationalState`
  - `export type OrganizationalState = {`
- Line 90 · **unknown** · matched `organizationalState`
  - `previousState?: OrganizationalState;`
- Line 1087 · **unknown** · matched `organizationalState`
  - `previousState?: OrganizationalState;`
- Line 1089 · **unknown** · matched `organizationalState`
  - `}): OrganizationalState {`
- Line 1132 · **unknown** · matched `organizationalState`
  - `const status: OrganizationalState["status"] =`
- Line 1175 · **unknown** · matched `organizational-state`
  - `id: "organizational-state-current",`
- Line 1197 · **unknown** · matched `organizationalState`
  - `state: OrganizationalState;`

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 80 · **type** · matched `organizationalState`
  - `organizationalState?: any;`
- Line 432 · **read** · matched `organizationalState`
  - `previousState: memory.organizationalState,`
- Line 437 · **definition** · matched `organizationalState`
  - `const organizationalState = organizationalConditionResult.state;`
- Line 446 · **unknown** · matched `Organizational State`
  - `console.log("Organizational State", organizationalState);`
- Line 462 · **unknown** · matched `organizationalState`
  - `organizationalState,`
- Line 496 · **unknown** · matched `organizationalState`
  - `organizationalStateSummary: organizationalState.summary,`
- Line 497 · **unknown** · matched `organizationalState`
  - `organizationalStateConfidence: organizationalState.confidence,`
- Line 573 · **unknown** · matched `organizationalState`
  - `organizationalState,`
- Line 616 · **unknown** · matched `organizationalState`
  - `organizationalState,`
- Line 656 · **unknown** · matched `organizationalState`
  - `organizationalStateConfidence: organizationalState.confidence,`
- Line 709 · **type** · matched `organizationalState`
  - `organizationalState: typeof organizationalState;`

### Executive

#### `engine/v3/executive/buildExecutiveDashboard.ts`

- Line 37 · **unknown** · matched `organizationalState`
  - `export type ExecutiveOrganizationalStateCategory =`
- Line 42 · **unknown** · matched `organizationalState`
  - `export type ExecutiveOrganizationalStatePriority =`
- Line 64 · **unknown** · matched `organizationalState`
  - `export type ExecutiveOrganizationalStateItem = {`
- Line 67 · **unknown** · matched `organizationalState`
  - `category: ExecutiveOrganizationalStateCategory;`
- Line 68 · **unknown** · matched `organizationalState`
  - `priority: ExecutiveOrganizationalStatePriority;`
- Line 135 · **unknown** · matched `organizationalState`
  - `currentOrganizationalState: ExecutiveOrganizationalStateItem[];`
- Line 184 · **unknown** · matched `organizationalState`
  - `): ExecutiveOrganizationalStatePriority {`
- Line 219 · **unknown** · matched `organizationalState`
  - `function buildCurrentOrganizationalState(`
- Line 221 · **unknown** · matched `organizationalState`
  - `): ExecutiveOrganizationalStateItem[] {`
- Line 354 · **unknown** · matched `organizationalState`
  - `currentOrganizationalState: buildCurrentOrganizationalState(state),`

#### `engine/v3/executive/executiveLearningSummary.ts`

- Line 67 · **unknown** · matched `Organizational State`
  - `* This does not add reasoning. It exposes the organizational state`

### Projection

#### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 57 · **type** · matched `organizationalState`
  - `organizationalState?: {`
- Line 168 · **definition** · matched `organizationalState`
  - `const organizationalState =`
- Line 169 · **read** · matched `organizationalState`
  - `runtimeMemory?.organizationalState;`
- Line 172 · **unknown** · matched `organizationalState`
  - `organizationalState?.status === "critical" \|\|`
- Line 173 · **unknown** · matched `organizationalState`
  - `organizationalState?.status === "strained"`
- Line 177 · **unknown** · matched `organizationalState`
  - `organizationalState.status === "critical"`
- Line 182 · **unknown** · matched `organizationalState`
  - `organizationalState.executiveImplication \|\|`
- Line 183 · **unknown** · matched `organizationalState`
  - `organizationalState.summary \|\|`
- Line 187 · **unknown** · matched `organizationalState`
  - `organizationalState.status === "critical"`

### UI

#### `components/ExecutiveDashboard/ExecutiveDashboard.tsx`

- Line 86 · **unknown** · matched `Organizational State`
  - `<p className="insight-eyebrow">Current Organizational State</p>`

#### `components/results/MemoryUpdateOverview.tsx`

- Line 49 · **definition** · matched `organizationalState`
  - `const organizationalState =`
- Line 50 · **unknown** · matched `organizationalState`
  - `executiveDashboard?.currentOrganizationalState ?? [];`
- Line 62 · **unknown** · matched `organizationalState`
  - `: organizationalState.slice(0, 3).map((item) => ({`

#### `components/results/ResultsOverview.tsx`

- Line 84 · **unknown** · matched `organizationalState`
  - `const currentOrganizationalState =`
- Line 85 · **unknown** · matched `organizationalState`
  - `executiveDashboard?.currentOrganizationalState ?? [];`
- Line 208 · **unknown** · matched `organizationalState`
  - `badge={`${Math.min(currentOrganizationalState.length, 5)} found`}`
- Line 213 · **unknown** · matched `organizationalState`
  - `{currentOrganizationalState.slice(0, 5).map((item, index) => (`

### Benchmark

#### `engine/benchmark/benchmarkScorer.ts`

- Line 29 · **type** · matched `organizationalState`
  - `type OrganizationalStateBenchmarkItem = {`
- Line 50 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateBenchmarkItem;`
- Line 155 · **unknown** · matched `Organizational State`
  - `"organizational state",`
- Line 156 · **unknown** · matched `Organizational State`
  - `"current organizational state",`
- Line 289 · **definition** · matched `organizationalState`
  - `function organizationalStateText(`
- Line 290 · **unknown** · matched `organizationalState`
  - `state?: OrganizationalStateBenchmarkItem,`
- Line 419 · **unknown** · matched `Organizational State`
  - `"current organizational state",`
- Line 435 · **definition** · matched `organizationalState`
  - `function organizationalStateScore(params: {`
- Line 436 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateBenchmarkItem;`
- Line 440 · **unknown** · matched `organizationalState`
  - `const { organizationalState, organizationalConditions = [], executiveText } =`
- Line 443 · **unknown** · matched `organizationalState`
  - `const stateText = organizationalStateText(organizationalState);`
- Line 446 · **unknown** · matched `organizationalState`
  - `const statePresence = organizationalState ? 1 : 0;`
- Line 447 · **unknown** · matched `organizationalState`
  - `const statusPresence = hasText(organizationalState?.status) ? 1 : 0;`
- Line 448 · **unknown** · matched `organizationalState`
  - `const summaryPresence = hasText(organizationalState?.summary) ? 1 : 0;`
- Line 449 · **unknown** · matched `organizationalState`
  - `const implicationPresence = hasText(organizationalState?.executiveImplication)`
- Line 453 · **unknown** · matched `organizationalState`
  - `organizationalState?.recommendedFocus,`
- Line 475 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateBenchmarkItem;`
- Line 479 · **unknown** · matched `organizationalState`
  - `const { organizationalState, executiveAssessment, executiveText } = params;`
- Line 482 · **read** · matched `organizationalState`
  - `...organizationalStateText(organizationalState),`
- Line 488 · **unknown** · matched `organizationalState`
  - `arrayPresenceScore(organizationalState?.recommendedFocus, 3),`
- Line 509 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateBenchmarkItem;`
- Line 515 · **unknown** · matched `organizationalState`
  - `organizationalState,`
- Line 522 · **read** · matched `organizationalState`
  - `...organizationalStateText(organizationalState),`
- Line 530 · **unknown** · matched `organizationalState`
  - `organizationalState?.recommendedFocus,`
- Line 719 · **read** · matched `organizationalState`
  - `const stateText = organizationalStateText(actual.organizationalState);`
- Line 803 · **definition** · matched `organizationalState`
  - `const organizationalState = organizationalStateScore({`
- Line 804 · **type** · matched `organizationalState`
  - `organizationalState: actual.organizationalState,`
- Line 810 · **type** · matched `organizationalState`
  - `organizationalState: actual.organizationalState,`
- Line 817 · **type** · matched `organizationalState`
  - `organizationalState: actual.organizationalState,`
- Line 827 · **unknown** · matched `organizationalState`
  - `organizationalState,`
- Line 866 · **unknown** · matched `organizationalState`
  - `organizationalState * 0.1 +`
- Line 899 · **unknown** · matched `organizationalState`
  - `if (organizationalState < 0.6) {`
- Line 901 · **unknown** · matched `Organizational State`
  - `"Organizational state synthesis is weak: Discovery did not clearly combine conditions into a coherent current state.",`
- Line 943 · **unknown** · matched `Organizational State`
  - `"Executive assessment did not clearly synthesize organizational conditions into a coherent organizational state.",`

#### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 45 · **type** · matched `organizationalState`
  - `type OrganizationalStateSnapshot = {`
- Line 92 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateSnapshot;`
- Line 102 · **type** · matched `organizationalState`
  - `organizationalState?: OrganizationalStateSnapshot;`
- Line 256 · **definition** · matched `organizationalState`
  - `const organizationalState =`
- Line 257 · **read** · matched `organizationalState`
  - `memory.organizationalState ??`
- Line 258 · **read** · matched `organizationalState`
  - `memory.organizationalMemory?.organizationalState;`
- Line 274 · **unknown** · matched `organizationalState`
  - `organizationalState?.summary,`
- Line 275 · **unknown** · matched `organizationalState`
  - `organizationalState?.executiveImplication,`
- Line 276 · **unknown** · matched `organizationalState`
  - `...(organizationalState?.recommendedFocus ?? []),`
- Line 307 · **unknown** · matched `organizationalState`
  - `organizationalState,`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
