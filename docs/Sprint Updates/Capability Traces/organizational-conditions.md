# Capability Trace — Organizational Conditions

Generated: 2026-07-10T23:27:03.458Z

## Search Terms

- `Organizational Conditions`
- `organizationalConditions`
- `OrganizationalConditions`
- `organizational-conditions`
- `organizational conditions`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 11 |
| Runtime | ✅ Found | 13 |
| Executive | ✅ Found | 3 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 30 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 83 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalConditionLike[];`
- Line 380 · **read** · matched `organizationalConditions`
  - `const rankedConditions = [...(input.organizationalConditions ?? [])].sort(`

#### `engine/v3/model/judgment/mechanismInferenceTypes.ts`

- Line 98 · **unknown** · matched `Organizational Conditions`
  - `* Phenomena represent interpreted organizational conditions.`

#### `engine/v3/model/state/inferOrganizationalConditions.ts`

- Line 1 · **type** · matched `organizationalConditions`
  - `type OrganizationalConditionStatus =`
- Line 49 · **unknown** · matched `organizationalConditions`
  - `status: OrganizationalConditionStatus;`
- Line 81 · **type** · matched `organizationalConditions`
  - `type InferOrganizationalConditionsInput = {`
- Line 572 · **unknown** · matched `organizationalConditions`
  - `status: OrganizationalConditionStatus;`
- Line 697 · **unknown** · matched `organizationalConditions`
  - `status: OrganizationalConditionStatus;`
- Line 945 · **unknown** · matched `organizationalConditions`
  - `const status: OrganizationalConditionStatus =`
- Line 1193 · **unknown** · matched `organizationalConditions`
  - `export function inferOrganizationalConditions(`
- Line 1194 · **unknown** · matched `organizationalConditions`
  - `input: InferOrganizationalConditionsInput,`

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 36 · **import** · matched `organizationalConditions`
  - `import { inferOrganizationalConditions } from "../model/state/inferOrganizationalConditions";`
- Line 79 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: any[];`
- Line 420 · **unknown** · matched `organizationalConditions`
  - `const organizationalConditionResult = inferOrganizationalConditions({`
- Line 431 · **read** · matched `organizationalConditions`
  - `previousConditions: memory.organizationalConditions ?? [],`
- Line 436 · **definition** · matched `organizationalConditions`
  - `const organizationalConditions = organizationalConditionResult.conditions;`
- Line 440 · **unknown** · matched `organizationalConditions`
  - `buildInvestigationOpportunities(organizationalConditions);`
- Line 445 · **unknown** · matched `Organizational Conditions`
  - `console.log("Organizational Conditions", organizationalConditions);`
- Line 461 · **unknown** · matched `organizationalConditions`
  - `organizationalConditions,`
- Line 495 · **unknown** · matched `organizationalConditions`
  - `organizationalConditionCount: organizationalConditions.length,`
- Line 572 · **unknown** · matched `organizationalConditions`
  - `organizationalConditions,`
- Line 615 · **unknown** · matched `organizationalConditions`
  - `organizationalConditions,`
- Line 655 · **unknown** · matched `organizationalConditions`
  - `organizationalConditionCount: organizationalConditions.length,`
- Line 708 · **type** · matched `organizationalConditions`
  - `organizationalConditions: typeof organizationalConditions;`

### Executive

#### `engine/v3/executive/executiveLearningSummary.ts`

- Line 271 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalCondition[];`
- Line 277 · **read** · matched `organizationalConditions`
  - `memory.organizationalConditions ?? [],`

#### `engine/v3/executive/expression/executiveConversation.ts`

- Line 125 · **unknown** · matched `Organizational Conditions`
  - ``${conditionCount} organizational conditions available for review.`,`

### Benchmark

#### `engine/benchmark/benchmarkScorer.ts`

- Line 49 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalConditionBenchmarkItem[];`
- Line 391 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalConditionBenchmarkItem[];`
- Line 394 · **assignment** · matched `organizationalConditions`
  - `const { organizationalConditions = [], executiveText } = params;`
- Line 396 · **unknown** · matched `organizationalConditions`
  - `const conditionText = organizationalConditionText(organizationalConditions);`
- Line 399 · **unknown** · matched `organizationalConditions`
  - `const conditionPresence = arrayPresenceScore(organizationalConditions, 4);`
- Line 403 · **unknown** · matched `organizationalConditions`
  - `organizationalConditions`
- Line 409 · **unknown** · matched `organizationalConditions`
  - `organizationalConditions.length === 0`
- Line 411 · **unknown** · matched `organizationalConditions`
  - `: clamp01(uniqueSummaries / organizationalConditions.length);`
- Line 437 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalConditionBenchmarkItem[];`
- Line 440 · **assignment** · matched `organizationalConditions`
  - `const { organizationalState, organizationalConditions = [], executiveText } =`
- Line 459 · **unknown** · matched `organizationalConditions`
  - `organizationalConditions`
- Line 508 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalConditionBenchmarkItem[];`
- Line 514 · **assignment** · matched `organizationalConditions`
  - `organizationalConditions = [],`
- Line 521 · **unknown** · matched `organizationalConditions`
  - `...organizationalConditionText(organizationalConditions),`
- Line 528 · **unknown** · matched `organizationalConditions`
  - `const multiConditionScore = arrayPresenceScore(organizationalConditions, 4);`
- Line 716 · **read** · matched `organizationalConditions`
  - `actual.organizationalConditions,`
- Line 799 · **type** · matched `organizationalConditions`
  - `organizationalConditions: actual.organizationalConditions,`
- Line 805 · **type** · matched `organizationalConditions`
  - `organizationalConditions: actual.organizationalConditions,`
- Line 816 · **type** · matched `organizationalConditions`
  - `organizationalConditions: actual.organizationalConditions,`
- Line 895 · **unknown** · matched `Organizational Conditions`
  - `"Condition reasoning is weak: Discovery did not clearly synthesize organizational conditions as first-class executive objects.",`
- Line 913 · **unknown** · matched `Organizational Conditions`
  - `"Systems thinking is weak: Discovery did not clearly explain how organizational conditions influence one another.",`
- Line 943 · **unknown** · matched `Organizational Conditions`
  - `"Executive assessment did not clearly synthesize organizational conditions into a coherent organizational state.",`

#### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 36 · **type** · matched `organizationalConditions`
  - `type OrganizationalConditionSnapshot = {`
- Line 91 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalConditionSnapshot[];`
- Line 101 · **type** · matched `organizationalConditions`
  - `organizationalConditions?: OrganizationalConditionSnapshot[];`
- Line 251 · **definition** · matched `organizationalConditions`
  - `const organizationalConditions =`
- Line 252 · **read** · matched `organizationalConditions`
  - `memory.organizationalConditions ??`
- Line 253 · **read** · matched `organizationalConditions`
  - `memory.organizationalMemory?.organizationalConditions ??`
- Line 277 · **read** · matched `organizationalConditions`
  - `...organizationalConditions.flatMap((condition) => [`
- Line 306 · **unknown** · matched `organizationalConditions`
  - `organizationalConditions,`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
