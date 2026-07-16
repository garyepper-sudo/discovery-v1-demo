# Capability Trace — Investigation Opportunity Generation

Generated: 2026-07-16T01:32:05.334Z

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

- `CAP-COM-001`
- `CAP-SYS-001`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-SELF-002 |
| Canonical producer declared | ✅ | engine/v3/model/investigation/buildInvestigationOpportunities.ts |
| Canonical producer exists | ✅ | engine/v3/model/investigation/buildInvestigationOpportunities.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.investigationOpportunities |
| Executive destination | ✅ | ExecutiveProjection, InvestigationOpportunities |
| Consumers | ✅ | 2 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/briefing/ExecutiveBriefing.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`
- `components/executive-v2/investigations/ExecutiveInvestigationOpportunities.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/executive-v3/projection/buildExecutiveBriefingProjection.ts`
- `components/executive-v3/projection/buildExecutiveNarrative.ts`
- `engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts`
- `engine/v3/communication/synthesizeExecutiveCommunication.ts`
- `engine/v3/communication/synthesizeExecutiveNarrative.ts`
- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/buildExecutivePriority.ts`
- `engine/v3/model/simulate/buildSimulationScenario.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/scenarios/buildExecutiveDecisionContext.ts`
- `engine/v3/scenarios/runExecutiveScenario.ts`
- `scripts/cognition/reviewCognitiveDomain.mjs`

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
| Engine | ✅ Found | 23 |
| Runtime | ✅ Found | 12 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 10 |
| UI | ✅ Found | 21 |
| API | ❌ Not found | 0 |
| Simulation | ✅ Found | 4 |
| Benchmark | ✅ Found | 1 |
| Other | ✅ Found | 3 |

### Detailed Matches

#### Engine

##### `engine/v3/communication/synthesizeExecutiveCommunication.ts`

- Line 84 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities?.[0];`
- Line 114 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities`

##### `engine/v3/communication/synthesizeExecutiveNarrative.ts`

- Line 930 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities?.[0]`

##### `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

- Line 68 · **type** · matched `buildInvestigationOpportunities`
  - `type BuildInvestigationOpportunitiesInput = {`
- Line 71 · **unknown** · matched `investigationOpportunities`
  - `previousInvestigationOpportunities?: PreviousInvestigationOpportunityLike[];`
- Line 324 · **unknown** · matched `investigationOpportunities`
  - `previousInvestigationOpportunities:`
- Line 329 · **unknown** · matched `investigationOpportunities`
  - `if (!previousInvestigationOpportunities?.length) {`
- Line 336 · **unknown** · matched `investigationOpportunities`
  - `previousInvestigationOpportunities.filter(`
- Line 378 · **definition** · matched `buildInvestigationOpportunities`
  - `export function buildInvestigationOpportunities({`
- Line 381 · **unknown** · matched `investigationOpportunities`
  - `previousInvestigationOpportunities,`
- Line 382 · **unknown** · matched `buildInvestigationOpportunities`
  - `}: BuildInvestigationOpportunitiesInput): InvestigationOpportunityResult {`
- Line 459 · **unknown** · matched `investigationOpportunities`
  - `previousInvestigationOpportunities,`

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 28 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunityLike[];`

##### `engine/v3/model/judgment/buildExecutivePriority.ts`

- Line 81 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunityLike[];`
- Line 352 · **read** · matched `investigationOpportunities`
  - `[...(input.investigationOpportunities ?? [])].sort(`

##### `engine/v3/scenarios/buildExecutiveDecisionContext.ts`

- Line 46 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`
- Line 47 · **read** · matched `investigationOpportunities`
  - `RunExecutiveScenarioInput["investigationOpportunities"];`
- Line 204 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 206 · **read** · matched `investigationOpportunities`
  - `memory.investigationOpportunities,`

##### `engine/v3/scenarios/runExecutiveScenario.ts`

- Line 138 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`
- Line 139 · **read** · matched `investigationOpportunities`
  - `BuildSimulationScenarioInput["investigationOpportunities"];`
- Line 173 · **assignment** · matched `investigationOpportunities`
  - `investigationOpportunities = [],`
- Line 227 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 42 · **import** · matched `buildInvestigationOpportunities`
  - `import { buildInvestigationOpportunities } from "../model/investigation/buildInvestigationOpportunities";`
- Line 95 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: any[];`
- Line 668 · **unknown** · matched `buildInvestigationOpportunities`
  - `buildInvestigationOpportunities({`
- Line 674 · **unknown** · matched `investigationOpportunities`
  - `previousInvestigationOpportunities:`
- Line 675 · **read** · matched `investigationOpportunities`
  - `memory.investigationOpportunities,`
- Line 681 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 716 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 737 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1117 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1176 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1404 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 1405 · **unknown** · matched `investigationOpportunities`
  - `typeof investigationOpportunities;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 518 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: ExecutiveInvestigationOpportunity[];`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 207 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: RuntimeInvestigationOpportunity[];`
- Line 642 · **definition** · matched `buildInvestigationOpportunities`
  - `function buildInvestigationOpportunitiesProjection(`
- Line 646 · **read** · matched `investigationOpportunities`
  - `runtimeMemory?.investigationOpportunities;`
- Line 926 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 927 · **unknown** · matched `buildInvestigationOpportunities`
  - `buildInvestigationOpportunitiesProjection(runtimeMemory);`
- Line 940 · **read** · matched `investigationOpportunities`
  - `runtimeMemory?.investigationOpportunities,`
- Line 1032 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`

##### `components/executive-v3/projection/buildExecutiveBriefingProjection.ts`

- Line 470 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities?.[0]`

##### `components/executive-v3/projection/buildExecutiveNarrative.ts`

- Line 778 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities?.[0]`

#### UI

##### `components/executive-v2/briefing/ExecutiveBriefing.tsx`

- Line 170 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities?.[0];`

##### `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`

- Line 13 · **unknown** · matched `CAP-SELF-002`
  - `\| "CAP-SELF-002"`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`

- Line 7 · **import** · matched `investigationOpportunities`
  - `import ExecutiveInvestigationOpportunities from "../investigations/ExecutiveInvestigationOpportunities";`
- Line 21 · **unknown** · matched `CAP-SELF-002`
  - `\| "CAP-SELF-002"`
- Line 139 · **unknown** · matched `CAP-SELF-002`
  - `capabilityId: "CAP-SELF-002",`
- Line 142 · **unknown** · matched `investigationOpportunities`
  - `projectionKey: "investigationOpportunities",`
- Line 144 · **read** · matched `investigationOpportunities`
  - `(projection.investigationOpportunities?.length ?? 0) > 0,`
- Line 146 · **read** · matched `investigationOpportunities`
  - `projection.investigationOpportunities &&`
- Line 147 · **read** · matched `investigationOpportunities`
  - `projection.investigationOpportunities.length > 0 ? (`
- Line 148 · **unknown** · matched `investigationOpportunities`
  - `<ExecutiveInvestigationOpportunities`
- Line 149 · **read** · matched `investigationOpportunities`
  - `opportunities={projection.investigationOpportunities}`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`

- Line 7 · **import** · matched `investigationOpportunities`
  - `import ExecutiveInvestigationOpportunities from "../investigations/ExecutiveInvestigationOpportunities";`
- Line 82 · **unknown** · matched `CAP-SELF-002`
  - `capabilityId: "CAP-SELF-002",`
- Line 83 · **unknown** · matched `investigationOpportunities`
  - `projectionKey: "investigationOpportunities",`
- Line 85 · **read** · matched `investigationOpportunities`
  - `projection.investigationOpportunities &&`
- Line 86 · **read** · matched `investigationOpportunities`
  - `projection.investigationOpportunities.length > 0 ? (`
- Line 87 · **unknown** · matched `investigationOpportunities`
  - `<ExecutiveInvestigationOpportunities`
- Line 88 · **read** · matched `investigationOpportunities`
  - `opportunities={projection.investigationOpportunities}`

##### `components/executive-v2/investigations/ExecutiveInvestigationOpportunities.tsx`

- Line 3 · **type** · matched `investigationOpportunities`
  - `type ExecutiveInvestigationOpportunitiesProps = {`
- Line 7 · **unknown** · matched `investigationOpportunities`
  - `export default function ExecutiveInvestigationOpportunities({`
- Line 9 · **unknown** · matched `investigationOpportunities`
  - `}: ExecutiveInvestigationOpportunitiesProps) {`

#### Simulation

##### `engine/v3/model/simulate/buildSimulationScenario.ts`

- Line 85 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`
- Line 86 · **read** · matched `investigationOpportunities`
  - `ExecutiveAssessmentInput["investigationOpportunities"];`
- Line 126 · **assignment** · matched `investigationOpportunities`
  - `investigationOpportunities = [],`
- Line 156 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`

#### Benchmark

##### `engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts`

- Line 348 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities: [`

#### Other

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 118 · **unknown** · matched `CAP-SELF-002`
  - `"CAP-SELF-002",`
- Line 214 · **unknown** · matched `CAP-SELF-002`
  - `"CAP-SELF-002",`
- Line 242 · **unknown** · matched `CAP-SELF-002`
  - `"CAP-SELF-002",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
