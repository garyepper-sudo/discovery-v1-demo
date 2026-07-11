# Capability Trace — Investigation Opportunities

Generated: 2026-07-10T23:29:32.687Z

## Search Terms

- `Investigation Opportunities`
- `investigationOpportunities`
- `InvestigationOpportunities`
- `investigation-opportunities`
- `investigation opportunities`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 3 |
| Runtime | ✅ Found | 9 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 2 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

- Line 184 · **unknown** · matched `investigationOpportunities`
  - `export function buildInvestigationOpportunities(`

#### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 85 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunityLike[];`
- Line 498 · **read** · matched `investigationOpportunities`
  - `const highestValueInvestigation = input.investigationOpportunities?.[0];`

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 37 · **import** · matched `investigationOpportunities`
  - `import { buildInvestigationOpportunities } from "../model/investigation/buildInvestigationOpportunities";`
- Line 81 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: any[];`
- Line 439 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 440 · **unknown** · matched `investigationOpportunities`
  - `buildInvestigationOpportunities(organizationalConditions);`
- Line 447 · **unknown** · matched `Investigation Opportunities`
  - `console.log("Investigation Opportunities", investigationOpportunities);`
- Line 464 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 574 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 617 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 710 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities: typeof investigationOpportunities;`

### Projection

#### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 65 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: Array<{`
- Line 298 · **read** · matched `investigationOpportunities`
  - `runtimeMemory?.investigationOpportunities?.[0];`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
