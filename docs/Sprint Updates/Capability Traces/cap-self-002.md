# Capability Trace — Investigation Opportunity Generation

Generated: 2026-07-31T20:42:07.112Z

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
- `components/executive-v3/workspaces/UnderstandingWorkspace.tsx`
- `components/product-shell/data/buildAskExperienceView.ts`
- `components/product-shell/data/buildOrganizationExperienceView.ts`
- `components/product-shell/data/buildResearchExperienceView.ts`
- `components/product-shell/data/buildRuntimeOrganizationView.ts`
- `components/product-shell/data/composeActivatedYourOrganization.ts`
- `engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts`
- `engine/benchmark/executive-communication/executiveCommunicationExperiment002.ts`
- `engine/benchmark/executive-communication/runtimeBackedExecutiveLanguage001.ts`
- `engine/benchmark/judgment-lab/decisiveEvidenceAblation.ts`
- `engine/benchmark/judgment-lab/evidenceIndependenceShadowEvaluation.ts`
- `engine/benchmark/judgment-lab/mechanismEvidenceCompositionGroundTruth.ts`
- `engine/benchmark/judgment-lab/runJudgmentLab.ts`
- `engine/benchmark/judgment-lab/themeEvidenceCompositionIsolation.ts`
- `engine/benchmark/judgment-lab/validateJudgmentLabProvenance.ts`
- `engine/benchmark/stress/runEngineStressTest.ts`
- `engine/v3/communication/buildExecutiveStory.ts`
- `engine/v3/communication/executiveCommunicationSource.ts`
- `engine/v3/communication/synthesizeExecutiveCommunication.ts`
- `engine/v3/communication/synthesizeExecutiveNarrative.ts`
- `engine/v3/model/epistemic/assessOrganizationalUncertainty.ts`
- `engine/v3/model/investigation/refineInvestigationOpportunities.ts`
- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/buildExecutiveExplanation.ts`
- `engine/v3/model/judgment/buildExecutivePriority.ts`
- `engine/v3/model/simulate/buildSimulationScenario.ts`
- `engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts`
- `engine/v3/projection/organizationalUnderstandingProjection.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/scenarios/buildExecutiveDecisionContext.ts`
- `engine/v3/scenarios/runExecutiveScenario.ts`
- `scripts/cognition/reviewCognitiveDomain.mjs`
- `scripts/product/capabilitySurvivalManifest.ts`
- `scripts/product/validateAlphaYourOrganizationActivation.ts`
- `scripts/product/validateAskExperience.ts`
- `scripts/product/validateCapabilitySurvival.ts`
- `scripts/product/validateExecutiveInteractionArchitecture.ts`
- `scripts/product/validateOrganizationExperience.ts`
- `scripts/product/validateOrganizationalUnderstandingProjectionShadow.ts`
- `scripts/product/validateResearchExperience.ts`
- `scripts/product/validateUnifiedExecutiveWorkspace.ts`
- `scripts/product/validateWhyDiscoveryBelievesThis.ts`
- `scripts/product/validateWhyThisEvidenceMatters.ts`

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
| Engine | ✅ Found | 47 |
| Runtime | ✅ Found | 24 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 14 |
| UI | ✅ Found | 32 |
| API | ❌ Not found | 0 |
| Simulation | ✅ Found | 4 |
| Benchmark | ✅ Found | 18 |
| Other | ✅ Found | 22 |

### Detailed Matches

#### Engine

##### `engine/v3/communication/buildExecutiveStory.ts`

- Line 1351 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities,`

##### `engine/v3/communication/executiveCommunicationSource.ts`

- Line 91 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`

##### `engine/v3/communication/synthesizeExecutiveCommunication.ts`

- Line 219 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities`
- Line 258 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities`

##### `engine/v3/communication/synthesizeExecutiveNarrative.ts`

- Line 63 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: Array<{`
- Line 800 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities`

##### `engine/v3/model/epistemic/assessOrganizationalUncertainty.ts`

- Line 16 · **import** · matched `buildInvestigationOpportunities`
  - `} from "../investigation/buildInvestigationOpportunities";`
- Line 39 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 337 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 424 · **read** · matched `investigationOpportunities`
  - `params.investigationOpportunities`
- Line 438 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities`
- Line 445 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities`
- Line 462 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 571 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities`
- Line 622 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 669 · **read** · matched `investigationOpportunities`
  - `...investigationOpportunities`

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

##### `engine/v3/model/investigation/refineInvestigationOpportunities.ts`

- Line 7 · **import** · matched `buildInvestigationOpportunities`
  - `} from "./buildInvestigationOpportunities";`
- Line 9 · **unknown** · matched `investigationOpportunities`
  - `export type RefineInvestigationOpportunitiesInput = {`
- Line 325 · **unknown** · matched `investigationOpportunities`
  - `export function refineInvestigationOpportunities({`
- Line 328 · **unknown** · matched `investigationOpportunities`
  - `}: RefineInvestigationOpportunitiesInput):`

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 40 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunityLike[];`

##### `engine/v3/model/judgment/buildExecutiveExplanation.ts`

- Line 11 · **import** · matched `buildInvestigationOpportunities`
  - `} from "../investigation/buildInvestigationOpportunities";`
- Line 24 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 124 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 141 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`

##### `engine/v3/model/judgment/buildExecutivePriority.ts`

- Line 81 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunityLike[];`
- Line 352 · **read** · matched `investigationOpportunities`
  - `[...(input.investigationOpportunities ?? [])].sort(`

##### `engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts`

- Line 54 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`
- Line 177 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 178 · **read** · matched `investigationOpportunities`
  - `memory.investigationOpportunities,`

##### `engine/v3/scenarios/buildExecutiveDecisionContext.ts`

- Line 48 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`
- Line 49 · **read** · matched `investigationOpportunities`
  - `RunExecutiveScenarioInput["investigationOpportunities"];`
- Line 206 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 208 · **read** · matched `investigationOpportunities`
  - `memory.investigationOpportunities,`

##### `engine/v3/scenarios/runExecutiveScenario.ts`

- Line 158 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`
- Line 159 · **read** · matched `investigationOpportunities`
  - `BuildSimulationScenarioInput["investigationOpportunities"];`
- Line 194 · **assignment** · matched `investigationOpportunities`
  - `investigationOpportunities = [],`
- Line 248 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 47 · **import** · matched `buildInvestigationOpportunities`
  - `import { buildInvestigationOpportunities } from "../model/investigation/buildInvestigationOpportunities";`
- Line 48 · **import** · matched `investigationOpportunities`
  - `import { refineInvestigationOpportunities } from "../model/investigation/refineInvestigationOpportunities";`
- Line 133 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: any[];`
- Line 839 · **unknown** · matched `buildInvestigationOpportunities`
  - `buildInvestigationOpportunities({`
- Line 845 · **unknown** · matched `investigationOpportunities`
  - `previousInvestigationOpportunities:`
- Line 846 · **read** · matched `investigationOpportunities`
  - `memory.investigationOpportunities,`
- Line 852 · **unknown** · matched `investigationOpportunities`
  - `const initialInvestigationOpportunities =`
- Line 855 · **definition** · matched `investigationOpportunities`
  - `let investigationOpportunities =`
- Line 856 · **unknown** · matched `investigationOpportunities`
  - `initialInvestigationOpportunities;`
- Line 894 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 915 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1182 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 1183 · **unknown** · matched `investigationOpportunities`
  - `initialInvestigationOpportunities,`
- Line 1189 · **assignment** · matched `investigationOpportunities`
  - `investigationOpportunities =`
- Line 1190 · **unknown** · matched `investigationOpportunities`
  - `refineInvestigationOpportunities({`
- Line 1192 · **unknown** · matched `investigationOpportunities`
  - `initialInvestigationOpportunities,`
- Line 1203 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1221 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1410 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1468 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1551 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`
- Line 1811 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities:`
- Line 1812 · **unknown** · matched `investigationOpportunities`
  - `typeof investigationOpportunities;`

##### `components/product-shell/data/buildRuntimeOrganizationView.ts`

- Line 187 · **read** · matched `investigationOpportunities`
  - `const investigations = records(memory.investigationOpportunities);`

#### Projection

##### `engine/v3/projection/organizationalUnderstandingProjection.ts`

- Line 6 · **import** · matched `buildInvestigationOpportunities`
  - `} from "../model/investigation/buildInvestigationOpportunities";`

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 689 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: ExecutiveInvestigationOpportunity[];`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 269 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: RuntimeInvestigationOpportunity[];`
- Line 793 · **definition** · matched `buildInvestigationOpportunities`
  - `function buildInvestigationOpportunitiesProjection(`
- Line 797 · **read** · matched `investigationOpportunities`
  - `runtimeMemory?.investigationOpportunities;`
- Line 1203 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 1204 · **unknown** · matched `buildInvestigationOpportunities`
  - `buildInvestigationOpportunitiesProjection(runtimeMemory);`
- Line 1217 · **read** · matched `investigationOpportunities`
  - `runtimeMemory?.investigationOpportunities,`
- Line 1387 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities,`

##### `components/executive-v3/projection/buildExecutiveBriefingProjection.ts`

- Line 470 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities?.[0]`

##### `components/executive-v3/projection/buildExecutiveNarrative.ts`

- Line 791 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities?.[0]`

##### `scripts/product/validateOrganizationalUnderstandingProjectionShadow.ts`

- Line 13 · **import** · matched `buildInvestigationOpportunities`
  - `} from "../../engine/v3/model/investigation/buildInvestigationOpportunities";`
- Line 694 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunity[];`
- Line 722 · **read** · matched `investigationOpportunities`
  - `investigations: memory.investigationOpportunities ?? [],`

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

##### `components/executive-v3/workspaces/UnderstandingWorkspace.tsx`

- Line 112 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 113 · **read** · matched `investigationOpportunities`
  - `projection.investigationOpportunities ?? [];`
- Line 136 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities.slice(0, 4);`

##### `components/product-shell/data/buildAskExperienceView.ts`

- Line 93 · **read** · matched `investigationOpportunities`
  - `const opportunities = records(memory.investigationOpportunities);`

##### `components/product-shell/data/buildOrganizationExperienceView.ts`

- Line 148 · **read** · matched `investigationOpportunities`
  - `const investigations = records(memory.investigationOpportunities);`

##### `components/product-shell/data/buildResearchExperienceView.ts`

- Line 78 · **read** · matched `investigationOpportunities`
  - `const opportunities = records(memory.investigationOpportunities);`

##### `components/product-shell/data/composeActivatedYourOrganization.ts`

- Line 1 · **import** · matched `buildInvestigationOpportunities`
  - `import type { InvestigationOpportunity } from "../../../engine/v3/model/investigation/buildInvestigationOpportunities";`
- Line 215 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: InvestigationOpportunity[];`
- Line 237 · **read** · matched `investigationOpportunities`
  - `investigations: extendedMemory.investigationOpportunities ?? [],`
- Line 239 · **read** · matched `investigationOpportunities`
  - `extendedMemory.investigationOpportunities,`
- Line 242 · **read** · matched `investigationOpportunities`
  - `(extendedMemory.investigationOpportunities ?? []).map(`

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

##### `engine/benchmark/executive-communication/executiveCommunicationExperiment002.ts`

- Line 601 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities: [`

##### `engine/benchmark/executive-communication/runtimeBackedExecutiveLanguage001.ts`

- Line 110 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities: memory.investigationOpportunities,`
- Line 126 · **read** · matched `investigationOpportunities`
  - `const opportunity = source.investigationOpportunities?.[0] as`

##### `engine/benchmark/judgment-lab/decisiveEvidenceAblation.ts`

- Line 164 · **read** · matched `investigationOpportunities`
  - `const opportunities = records(memory.investigationOpportunities);`

##### `engine/benchmark/judgment-lab/evidenceIndependenceShadowEvaluation.ts`

- Line 296 · **read** · matched `investigationOpportunities`
  - `record(output.projection).investigationOpportunities ?? [],`

##### `engine/benchmark/judgment-lab/mechanismEvidenceCompositionGroundTruth.ts`

- Line 461 · **read** · matched `investigationOpportunities`
  - `opportunityCount: Array.isArray(memory.investigationOpportunities)`
- Line 462 · **read** · matched `investigationOpportunities`
  - `? memory.investigationOpportunities.length`

##### `engine/benchmark/judgment-lab/runJudgmentLab.ts`

- Line 71 · **read** · matched `investigationOpportunities`
  - `const opportunities = records(memory.investigationOpportunities);`

##### `engine/benchmark/judgment-lab/themeEvidenceCompositionIsolation.ts`

- Line 343 · **read** · matched `investigationOpportunities`
  - `record(output.projection).investigationOpportunities ?? [],`

##### `engine/benchmark/judgment-lab/validateJudgmentLabProvenance.ts`

- Line 93 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?: unknown;`
- Line 101 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities: memory.investigationOpportunities,`

##### `engine/benchmark/stress/runEngineStressTest.ts`

- Line 34 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities?:`
- Line 109 · **definition** · matched `investigationOpportunities`
  - `const investigationOpportunities =`
- Line 112 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities,`
- Line 115 · **read** · matched `investigationOpportunities`
  - `.investigationOpportunities`
- Line 119 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities`
- Line 157 · **unknown** · matched `investigationOpportunities`
  - `investigationOpportunities.length,`

#### Other

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 118 · **unknown** · matched `CAP-SELF-002`
  - `"CAP-SELF-002",`
- Line 214 · **unknown** · matched `CAP-SELF-002`
  - `"CAP-SELF-002",`
- Line 242 · **unknown** · matched `CAP-SELF-002`
  - `"CAP-SELF-002",`

##### `scripts/product/capabilitySurvivalManifest.ts`

- Line 30 · **unknown** · matched `CAP-SELF-002`
  - `\| "CAP-SELF-002"`
- Line 162 · **unknown** · matched `CAP-SELF-002`
  - `capabilityId: "CAP-SELF-002",`

##### `scripts/product/validateAlphaYourOrganizationActivation.ts`

- Line 149 · **type** · matched `investigationOpportunities`
  - `investigationOpportunities: Array<{`
- Line 159 · **assignment** · matched `investigationOpportunities`
  - `}).investigationOpportunities = [{`

##### `scripts/product/validateAskExperience.ts`

- Line 12 · **assignment** · matched `investigationOpportunities`
  - `memory.investigationOpportunities = [`
- Line 53 · **read** · matched `investigationOpportunities`
  - `delete sparseMemory.investigationOpportunities;`

##### `scripts/product/validateCapabilitySurvival.ts`

- Line 19 · **unknown** · matched `CAP-SELF-002`
  - `"CAP-SELF-002",`

##### `scripts/product/validateExecutiveInteractionArchitecture.ts`

- Line 12 · **assignment** · matched `investigationOpportunities`
  - `memory.investigationOpportunities = [{ suggestedExecutiveQuestion: "Where does approval slow execution?", reason: "Decision latency remains uncertain.", expectedConfidenceGain: 12 }];`

##### `scripts/product/validateOrganizationExperience.ts`

- Line 94 · **assignment** · matched `investigationOpportunities`
  - `memory.investigationOpportunities = [`
- Line 138 · **assignment** · matched `investigationOpportunities`
  - `(withoutInvestigation.memory as unknown as Record<string, unknown>).investigationOpportunities = [];`

##### `scripts/product/validateResearchExperience.ts`

- Line 12 · **assignment** · matched `investigationOpportunities`
  - `memory.investigationOpportunities = [`
- Line 54 · **assignment** · matched `investigationOpportunities`
  - `(missingEvidence.memory as unknown as MutableMemory).investigationOpportunities = [];`
- Line 68 · **assignment** · matched `investigationOpportunities`
  - `noneMemory.investigationOpportunities = [];`
- Line 79 · **assignment** · matched `investigationOpportunities`
  - `manyMemory.investigationOpportunities = [`
- Line 80 · **read** · matched `investigationOpportunities`
  - `...(manyMemory.investigationOpportunities as unknown[]),`

##### `scripts/product/validateUnifiedExecutiveWorkspace.ts`

- Line 17 · **assignment** · matched `investigationOpportunities`
  - `memory.investigationOpportunities = [{ suggestedExecutiveQuestion: "Which decisions still escalate?", reason: "Decision latency remains uncertain." }];`

##### `scripts/product/validateWhyDiscoveryBelievesThis.ts`

- Line 227 · **unknown** · matched `CAP-SELF-002`
  - `capabilityIds: ["CAP-UND-006", "CAP-SELF-001", "CAP-SELF-002", "CAP-COM-001"],`

##### `scripts/product/validateWhyThisEvidenceMatters.ts`

- Line 20 · **import** · matched `buildInvestigationOpportunities`
  - `} from "../../engine/v3/model/investigation/buildInvestigationOpportunities";`
- Line 434 · **unknown** · matched `CAP-SELF-002`
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
