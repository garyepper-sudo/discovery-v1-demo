# Capability Trace — Investigation Opportunity Generation

Generated: 2026-07-12T13:50:22.457Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-SELF-002` |
| Capability name | Investigation Opportunity Generation |
| Cognitive domain | SELF |
| Architectural layer | EXEC |
| Canonical producer | `engine/v3/model/investigation/buildInvestigationOpportunities.ts` |
| Runtime destination | `OrganizationRuntime.investigationOpportunities` |
| Executive destination | `ExecutiveProjection, InvestigationOpportunities` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `InvestigationOpportunity`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

### Capability Dependencies

- `CAP-SELF-001`
- `CAP-UND-004`

### Declared Consumers

None declared.

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-SELF-002 |
| Canonical producer declared | ✅ | engine/v3/model/investigation/buildInvestigationOpportunities.ts |
| Canonical producer exists | ✅ | engine/v3/model/investigation/buildInvestigationOpportunities.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.investigationOpportunities |
| Executive destination | ✅ | ExecutiveProjection, InvestigationOpportunities |
| Consumers | ✅ | Terminal capability (no downstream cognitive capability expected). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/ExecutiveExperience.tsx`
- `components/executive-v2/investigations/ExecutiveInvestigationOpportunities.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/buildExecutivePriority.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Investigation Opportunity Generation`
- `investigationOpportunityGeneration`
- `InvestigationOpportunityGeneration`
- `investigation-opportunity-generation`
- `investigation opportunity generation`
- `CAP-SELF-002`
- `capSelf002`
- `CapSelf002`
- `cap-self-002`
- `buildInvestigationOpportunities`
- `BuildInvestigationOpportunities`
- `build-investigation-opportunities`
- `buildinvestigationopportunities`
- `investigationOpportunities`
- `InvestigationOpportunities`
- `investigation-opportunities`
- `investigationopportunities`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 4 |
| Runtime | ✅ Found | 10 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 8 |
| UI | ✅ Found | 9 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ❌ Not found | 0 |

### Detailed Matches

#### Engine

##### `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

- Line 184 · **definition** · matched `buildInvestigationOpportunities`
  - `export function buildInvestigationOpportunities(`

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 27 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunityLike[];`

##### `engine/v3/model/judgment/buildExecutivePriority.ts`

- Line 81 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunityLike[];`
- Line 352 · **read** · matched `investigationOpportunities`
  - `[...(input.investigationOpportunities ?? [])].sort(`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 41 · **import** · matched `buildInvestigationOpportunities`
  - `import { buildInvestigationOpportunities } from "../model/investigation/buildInvestigationOpportunities";`
- Line 85 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: any[];`
- Line 505 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 506 · **unknown** · matched `buildInvestigationOpportunities`
  - `buildInvestigationOpportunities(`
- Line 526 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 547 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 770 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 822 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1026 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 1027 · **unknown** · matched `investigationOpportunities`
  - `typeof investigationOpportunities;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 297 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: ExecutiveInvestigationOpportunity[];`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 119 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: RuntimeInvestigationOpportunity[];`
- Line 469 · **definition** · matched `buildInvestigationOpportunities`
  - `function buildInvestigationOpportunitiesProjection(`
- Line 473 · **read** · matched `investigationOpportunities`
  - `runtimeMemory?.investigationOpportunities;`
- Line 585 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 586 · **unknown** · matched `buildInvestigationOpportunities`
  - `buildInvestigationOpportunitiesProjection(runtimeMemory);`
- Line 593 · **read** · matched `investigationOpportunities`
  - `runtimeMemory?.investigationOpportunities,`
- Line 681 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`

#### UI

##### `components/executive-v2/ExecutiveExperience.tsx`

- Line 8 · **import** · matched `investigationOpportunities`
  - `import ExecutiveInvestigationOpportunities from "./investigations/ExecutiveInvestigationOpportunities";`
- Line 29 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 74 · **unknown** · matched `investigationOpportunities`
  - `{investigationOpportunities &&`
- Line 75 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities.length > 0 && (`
- Line 76 · **unknown** · matched `investigationOpportunities`
  - `<ExecutiveInvestigationOpportunities`
- Line 77 · **unknown** · matched `investigationOpportunities`
  - `opportunities={investigationOpportunities}`

##### `components/executive-v2/investigations/ExecutiveInvestigationOpportunities.tsx`

- Line 3 · **type** · matched `investigationOpportunities`
  - `type ExecutiveInvestigationOpportunitiesProps = {`
- Line 7 · **unknown** · matched `investigationOpportunities`
  - `export default function ExecutiveInvestigationOpportunities({`
- Line 9 · **unknown** · matched `investigationOpportunities`
  - `}: ExecutiveInvestigationOpportunitiesProps) {`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
