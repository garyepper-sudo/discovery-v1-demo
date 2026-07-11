# Capability Trace — Current Understanding

Generated: 2026-07-10T23:26:56.453Z

## Search Terms

- `Current Understanding`
- `currentUnderstanding`
- `CurrentUnderstanding`
- `current-understanding`
- `current understanding`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 14 |
| Runtime | ✅ Found | 17 |
| Executive | ✅ Found | 20 |
| Projection | ✅ Found | 10 |
| UI | ✅ Found | 25 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 3 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/contradictions.ts`

- Line 149 · **unknown** · matched `Current Understanding`
  - `"The input contains an explicit open question, which means Discovery should avoid treating the current understanding as fully settled.",`

#### `engine/v3/emergence.ts`

- Line 70 · **unknown** · matched `Current Understanding`
  - `title: "Current understanding stabilized",`

#### `engine/v3/understanding/consolidateUnderstanding.ts`

- Line 509 · **read** · matched `currentUnderstanding`
  - `const updatedUnderstandings = currentState.currentUnderstandings.map(`

#### `engine/v3/understanding/synthesizeUnderstanding.ts`

- Line 306 · **unknown** · matched `Current Understanding`
  - `missing.add("Direct evidence linked to current understandings");`
- Line 398 · **definition** · matched `currentUnderstanding`
  - `const currentUnderstandings = params.state.currentUnderstandings.map((item) => ({`
- Line 403 · **unknown** · matched `currentUnderstanding`
  - `const recommendations = createRecommendations(currentUnderstandings);`
- Line 404 · **unknown** · matched `currentUnderstanding`
  - `const score = computeScore(currentUnderstandings);`
- Line 407 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings.length === 0`
- Line 412 · **unknown** · matched `currentUnderstanding`
  - `understandings: currentUnderstandings,`
- Line 421 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings,`
- Line 423 · **unknown** · matched `currentUnderstanding`
  - `executiveSummary: createExecutiveSummary(currentUnderstandings),`
- Line 426 · **unknown** · matched `currentUnderstanding`
  - `missingInformation: createMissingInformation(currentUnderstandings),`

#### `engine/v3/understandingObject.ts`

- Line 241 · **unknown** · matched `Current Understanding`
  - `return "Discovery needs more evidence before it can summarize the current understanding.";`
- Line 283 · **unknown** · matched `Current Understanding`
  - `"The current understanding should be treated as actionable, but not fully settled."`

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 127 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings: consolidationResult.updatedUnderstandings,`
- Line 205 · **read** · matched `currentUnderstanding`
  - `understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 213 · **read** · matched `currentUnderstanding`
  - `understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 332 · **read** · matched `currentUnderstanding`
  - `understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 401 · **read** · matched `currentUnderstanding`
  - `synthesizedOrganizationalUnderstandingState.currentUnderstandings,`

#### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 189 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings: OrganizationalUnderstandingItem[];`
- Line 393 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings: [],`

#### `engine/v3/runtime/updateOrganizationalUnderstandingState.ts`

- Line 100 · **definition** · matched `currentUnderstanding`
  - `const currentUnderstandings = [...state.currentUnderstandings, ...newItems];`
- Line 105 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings,`
- Line 106 · **unknown** · matched `currentUnderstanding`
  - `confidenceLandscape: currentUnderstandings.map((item) => ({`
- Line 113 · **unknown** · matched `currentUnderstanding`
  - `activeQuestions: currentUnderstandings.flatMap((item) =>`
- Line 123 · **unknown** · matched `currentUnderstanding`
  - `strategicRisks: currentUnderstandings`
- Line 146 · **unknown** · matched `currentUnderstanding`
  - `maturity: Math.min(1, currentUnderstandings.length / 8),`
- Line 147 · **unknown** · matched `currentUnderstanding`
  - `coherence: Math.min(1, currentUnderstandings.length / 6),`
- Line 149 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings.length === 0`
- Line 152 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings.reduce(`
- Line 156 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings.length,`

### Executive

#### `engine/v3/executive/buildExecutiveChangeSummary.ts`

- Line 226 · **definition** · matched `currentUnderstanding`
  - `const currentUnderstanding =`
- Line 231 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstanding;`
- Line 254 · **unknown** · matched `currentUnderstanding`
  - `understandingDelta: currentUnderstanding - previousUnderstanding,`

#### `engine/v3/executive/buildExecutiveDashboard.ts`

- Line 207 · **read** · matched `currentUnderstanding`
  - `return limitSection(state.currentUnderstanding, 4).map((item) => ({`
- Line 321 · **type** · matched `currentUnderstanding`
  - `currentUnderstanding: state.currentUnderstanding,`

#### `engine/v3/executive/buildExecutiveState.ts`

- Line 166 · **unknown** · matched `currentUnderstanding`
  - `function buildCurrentUnderstanding(`
- Line 170 · **read** · matched `currentUnderstanding`
  - `(briefing as any)?.currentUnderstanding ??`
- Line 177 · **unknown** · matched `Current Understanding`
  - `title: item.title ?? item.label ?? "Current understanding",`
- Line 345 · **definition** · matched `currentUnderstanding`
  - `const currentUnderstanding = buildCurrentUnderstanding(briefing);`
- Line 359 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstanding,`
- Line 384 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstanding,`

#### `engine/v3/executive/executiveLearningSummary.ts`

- Line 283 · **definition** · matched `currentUnderstanding`
  - `const currentUnderstanding = current?.organizationalUnderstandingScore ?? 0;`
- Line 285 · **unknown** · matched `currentUnderstanding`
  - `previous?.organizationalUnderstandingScore ?? currentUnderstanding;`
- Line 323 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstanding - previousUnderstanding`
- Line 365 · **unknown** · matched `currentUnderstanding`
  - `current: currentUnderstanding,`
- Line 367 · **unknown** · matched `currentUnderstanding`
  - `delta: currentUnderstanding - previousUnderstanding,`

#### `engine/v3/executive/executiveState.ts`

- Line 153 · **type** · matched `currentUnderstanding`
  - `currentUnderstanding: ExecutiveUnderstandingItem[];`

#### `engine/v3/executive/interpretations/executiveInterpretationTypes.ts`

- Line 11 · **type** · matched `currentUnderstanding`
  - `currentUnderstanding: ExecutiveUnderstandingItem[];`

#### `engine/v3/executive/interpretations/explanationBuilder.ts`

- Line 31 · **read** · matched `currentUnderstanding`
  - `const understanding = input.currentUnderstanding[0];`

#### `engine/v3/executive/interpretations/uncertaintyNarrative.ts`

- Line 20 · **read** · matched `currentUnderstanding`
  - `const lowConfidenceUnderstanding = input.currentUnderstanding.find(`

### Projection

#### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 60 · **type** · matched `currentUnderstanding`
  - `currentUnderstanding: {`
- Line 68 · **unknown** · matched `Current Understanding`
  - `* Executive explanation of the current understanding.`
- Line 95 · **unknown** · matched `Current Understanding`
  - `* How Discovery arrived at its current understanding.`

#### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 32 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstandings?: RuntimeUnderstanding[];`
- Line 93 · **read** · matched `currentUnderstanding`
  - `memory?.organizationalUnderstandingState?.currentUnderstandings ?? [];`
- Line 211 · **unknown** · matched `Current Understanding`
  - `"Discovery has formed a current understanding, but unresolved questions still deserve executive attention.",`
- Line 263 · **unknown** · matched `current-understanding`
  - `id: "current-understanding",`
- Line 321 · **unknown** · matched `Current Understanding`
  - `title: "Current Understanding",`
- Line 326 · **type** · matched `currentUnderstanding`
  - `currentUnderstanding: {`
- Line 333 · **unknown** · matched `Current Understanding`
  - `"Discovery is still forming its current understanding.",`

### UI

#### `components/ExecutiveDashboard/ExecutiveDashboard.tsx`

- Line 296 · **unknown** · matched `Current Understanding`
  - `<h3>Current Understanding</h3>`

#### `components/Organism.tsx`

- Line 47 · **unknown** · matched `Current Understanding`
  - `aria-label="Current understanding model"`

#### `components/StewardshipBrief.tsx`

- Line 37 · **unknown** · matched `Current Understanding`
  - `"This is the highest-leverage action because it tests the assumption most likely to confirm, refine, or overturn the current understanding.";`
- Line 152 · **unknown** · matched `Current Understanding`
  - `<span>Current understanding appears established.</span>`

#### `components/executive-v2/ExecutiveExperience.tsx`

- Line 16 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstanding,`
- Line 32 · **unknown** · matched `currentUnderstanding`
  - `belief={currentUnderstanding.belief}`
- Line 33 · **unknown** · matched `currentUnderstanding`
  - `mindStatus={currentUnderstanding.mindStatus}`
- Line 34 · **unknown** · matched `currentUnderstanding`
  - `confidence={currentUnderstanding.confidence}`
- Line 36 · **unknown** · matched `currentUnderstanding`
  - `currentUnderstanding.organizationalCoherence`

#### `components/executive-v2/ExecutiveWorkspace.tsx`

- Line 19 · **read** · matched `currentUnderstanding`
  - `projection.currentUnderstanding.organizationalCoherence`
- Line 21 · **read** · matched `currentUnderstanding`
  - `mindStatus={projection.currentUnderstanding.mindStatus}`

#### `components/organism/OrganismViewer.tsx`

- Line 73 · **unknown** · matched `Current Understanding`
  - `to the current understanding.`
- Line 161 · **unknown** · matched `Current Understanding`
  - `<h2>{organismState?.headline ?? "Current understanding anatomy"}</h2>`
- Line 204 · **unknown** · matched `Current Understanding`
  - `description="Signals Discovery used to form the current understanding."`

#### `components/results/SemanticConceptInspector.tsx`

- Line 23 · **read** · matched `currentUnderstanding`
  - `runtime?.memory?.organizationalUnderstandingState?.currentUnderstandings \|\|`

#### `components/results/UnderstandingWorkspace.tsx`

- Line 4 · **import** · matched `currentUnderstanding`
  - `import CurrentUnderstanding from "./workspace/CurrentUnderstanding";`
- Line 156 · **unknown** · matched `currentUnderstanding`
  - `<CurrentUnderstanding`

#### `components/results/workspace/CurrentUnderstanding.tsx`

- Line 1 · **type** · matched `currentUnderstanding`
  - `type CurrentUnderstandingProps = {`
- Line 6 · **unknown** · matched `currentUnderstanding`
  - `export default function CurrentUnderstanding({`
- Line 9 · **unknown** · matched `currentUnderstanding`
  - `}: CurrentUnderstandingProps) {`

#### `components/results/workspace/UncertaintyView.tsx`

- Line 23 · **unknown** · matched `Current Understanding`
  - `value="This uncertainty could change the interpretation of the current understanding."`

#### `components/understanding/StewardshipBrief.tsx`

- Line 37 · **unknown** · matched `Current Understanding`
  - `"This is the highest-leverage action because it tests the assumption most likely to confirm, refine, or overturn the current understanding.";`
- Line 152 · **unknown** · matched `Current Understanding`
  - `<span>Current understanding appears established.</span>`

#### `app/page.tsx`

- Line 94 · **definition** · matched `currentUnderstanding`
  - `const currentUnderstanding =`
- Line 199 · **unknown** · matched `currentUnderstanding`
  - `<h1>{showingAha ? 'Understanding emerged.' : currentUnderstanding}</h1>`

### Benchmark

#### `engine/benchmark/auditUnderstandingLayers.ts`

- Line 10 · **unknown** · matched `currentUnderstanding`
  - `"currentUnderstanding",`

#### `engine/benchmark/runAtlasSimulation.ts`

- Line 560 · **definition** · matched `currentUnderstanding`
  - `const currentUnderstanding =`
- Line 578 · **unknown** · matched `Current Understanding`
  - `printSection("CURRENT UNDERSTANDING", currentUnderstanding);`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
