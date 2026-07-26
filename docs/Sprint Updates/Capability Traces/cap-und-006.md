# Capability Trace — Executive Understanding Synthesis

Generated: 2026-07-25T23:57:31.733Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-UND-006` |
| Capability name | Executive Understanding Synthesis |
| Cognitive domain | UND |
| Architectural layer | COG |
| Canonical producer | `engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts` |
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
- `engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts`
- `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
- `engine/v3/understanding/consolidateUnderstanding.ts`
- `engine/v3/understanding/synthesizeUnderstanding.ts`

### Capability Dependencies

- `CAP-MEM-001`
- `CAP-UND-005`

### Declared Consumers

- `CAP-COM-001`
- `CAP-DEC-001`
- `CAP-UND-005`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-UND-006 |
| Canonical producer declared | ✅ | engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts |
| Canonical producer exists | ✅ | engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts |
| Implementation files | ✅ | 5 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalUnderstandingState |
| Executive destination | ✅ | Atlas, ExecutiveProjection, ExecutiveWorkspace |
| Consumers | ✅ | 3 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`
- `components/executive-v2/projection/ExecutiveScenarioProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/product-shell/data/buildAskExperienceView.ts`
- `components/product-shell/data/buildOrganizationExperienceFromProjection.ts`
- `components/product-shell/data/buildOrganizationExperienceView.ts`
- `components/product-shell/data/buildOrganizationModelContext.ts`
- `components/product-shell/data/buildResearchExperienceView.ts`
- `components/product-shell/data/buildRuntimeOrganizationView.ts`
- `components/results/SemanticConceptInspector.tsx`
- `engine/benchmark/auditUnderstandingLayers.ts`
- `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/BENCHMARK_REPORT.md`
- `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/README.md`
- `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/RESULTS.json`
- `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/productionPathAudit.ts`
- `engine/benchmark/causal-mechanism-formation-experiment-001/BENCHMARK_REPORT.md`
- `engine/benchmark/causal-mechanism-formation-experiment-001/README.md`
- `engine/benchmark/causal-mechanism-formation-experiment-001/RESULTS.json`
- `engine/benchmark/causal-mechanism-formation-experiment-001/productionPathAudit.ts`
- `engine/benchmark/causal-mechanism-formation-refinement-experiment-002/README.md`
- `engine/benchmark/causal-mechanism-formation-refinement-experiment-002/RESULTS.json`
- `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/BENCHMARK_REPORT.md`
- `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/README.md`
- `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/RESULTS.json`
- `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/productionPathAudit.ts`
- `engine/benchmark/emergence-phase-transition-experiment-001/BENCHMARK_REPORT.md`
- `engine/benchmark/emergence-phase-transition-experiment-001/README.md`
- `engine/benchmark/emergence-phase-transition-experiment-001/RESULTS.json`
- `engine/benchmark/emergence-phase-transition-experiment-001/productionPathAudit.ts`
- `engine/benchmark/emergent-organizational-intelligence-experiment-001/inferEmergentUnderstanding.ts`
- `engine/benchmark/emergent-organizational-intelligence-experiment-001/types.ts`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/BENCHMARK_REPORT.md`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/README.md`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/RESULTS.json`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/productionPathAudit.ts`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/runProductionShadowCognition.ts`
- `engine/benchmark/executive-collaboration-lab/executiveConversationScenarios.ts`
- `engine/benchmark/executive-collaboration-lab/runExecutiveConversationScenario.ts`
- `engine/benchmark/executive-decision-lab/runExecutiveDecisionLab.ts`
- `engine/benchmark/executive-projection/executiveProjectionExperiment001.ts`
- `engine/benchmark/executive-work/executiveOperatingSystemBenchmark001.ts`
- `engine/benchmark/high-volume/captureRuntimeSnapshot.ts`
- `engine/benchmark/high-volume/northstar/runNorthstarPrecisionGap001.ts`
- `engine/benchmark/high-volume/northstar/scoreNorthstarGroundTruth.ts`
- `engine/benchmark/high-volume/northstar/traceConcurrencyStaffingSemantics.ts`
- `engine/benchmark/judgment-lab/canonicalUnderstandingCompatibilityShadowGate.ts`
- `engine/benchmark/judgment-lab/canonicalUnderstandingOwnershipMigrationGate.ts`
- `engine/benchmark/judgment-lab/causalConstraintProductionShadow.ts`
- `engine/benchmark/judgment-lab/causalConstraintReasoningBenchmark.ts`
- `engine/benchmark/judgment-lab/comparativeEvidenceRolesBenchmarkGate.ts`
- `engine/benchmark/judgment-lab/competingExplanationAdjudication.ts`
- `engine/benchmark/judgment-lab/competingExplanationProductionShadow.ts`
- `engine/benchmark/judgment-lab/decisiveEvidenceAblation.ts`
- `engine/benchmark/judgment-lab/disclosureEligibilityRevocationContractGate.ts`
- `engine/benchmark/judgment-lab/evidenceIndependenceShadowEvaluation.ts`
- `engine/benchmark/judgment-lab/explanationSeedTheoryAncestryBridge.ts`
- `engine/benchmark/judgment-lab/explicitAuthorityTransitionsGate.ts`
- `engine/benchmark/judgment-lab/implicitCausalEdgeRecovery.ts`
- `engine/benchmark/judgment-lab/mechanismEvidenceCompositionGroundTruth.ts`
- `engine/benchmark/judgment-lab/primaryConstraintRankingGroundTruth.ts`
- `engine/benchmark/judgment-lab/runJudgmentLab.ts`
- `engine/benchmark/judgment-lab/structuredExplanationCandidateShadow.ts`
- `engine/benchmark/judgment-lab/themeEvidenceCompositionIsolation.ts`
- `engine/benchmark/judgment-lab/unadjudicatedExplanationUnderstandingShadowGate.ts`
- `engine/benchmark/judgment-lab/validateJudgmentLabProvenance.ts`
- `engine/benchmark/judgment/mechanismEvidencePropagation001.ts`
- `engine/benchmark/localized-nonlinear-cognition-experiment-001/RESULTS.json`
- `engine/benchmark/localized-nonlinear-cognition-experiment-001/productionPathAudit.ts`
- `engine/benchmark/operating-model-evolution-lab/productionReplay.ts`
- `engine/benchmark/organizational-intelligence-lab/runOrganizationalIntelligenceLab.ts`
- `engine/benchmark/organizationalUnderstandingScorer.ts`
- `engine/benchmark/research/ORGANIZATIONAL_UNDERSTANDING_RESEARCH_FRAMEWORK.md`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/RESULT.json`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/runLocalizedNonlinearResearchAdapter.ts`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/types.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/runtime/executiveMeaningPreservation001.ts`
- `engine/benchmark/stress/experiments/decisionIntelligenceStressExperiment001.ts`
- `engine/conversation/OpenAIConversationInterpreter.ts`
- `engine/v3/executive/buildExecutiveChangeSummary.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/investigation/runOrganizationInvestigation.ts`
- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/buildOrganizationalUnderstanding.ts`
- `engine/v3/model/judgment/organizationalJudgment.ts`
- `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`
- `engine/v3/model/memory/organizationalMemory.ts`
- `engine/v3/model/simulate/buildSimulationScenario.ts`
- `engine/v3/model/simulate/compareSimulationScenario.ts`
- `engine/v3/projection/organizationalUnderstandingProjection.ts`
- `engine/v3/runtime/index.ts`
- `engine/v3/runtime/organizationRuntime.ts`
- `engine/v3/runtime/organizationalUnderstandingState.ts`
- `engine/v3/runtime/updateOrganizationalUnderstandingState.ts`
- `engine/v3/scenarios/buildExecutiveDecisionContext.ts`
- `engine/v3/understanding/buildUnadjudicatedExplanationUnderstandingShadow.ts`
- `engine/v3/understanding/canonicalUnderstanding.ts`
- `engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts`
- `engine/v3/understanding/rankOrganizationalUnderstanding.ts`
- `scripts/cognition/generateArchitectureHandoff.mjs`
- `scripts/cognition/generateArchitectureState.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`
- `scripts/product/validateAskExperience.ts`
- `scripts/product/validateLivingInteractionLoop.ts`
- `scripts/product/validateOrganizationExperience.ts`
- `scripts/product/validateOrganizationalUnderstandingProjectionShadow.ts`
- `scripts/product/validateResearchExperience.ts`
- `scripts/product/validateUnifiedExecutiveWorkspace.ts`
- `scripts/product/validateYourOrganizationProjectionCompatibility.ts`

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
- `buildCanonicalUnderstandingCompatibilityShadow`
- `BuildCanonicalUnderstandingCompatibilityShadow`
- `build-canonical-understanding-compatibility-shadow`
- `buildcanonicalunderstandingcompatibilityshadow`
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
| Engine | ✅ Found | 104 |
| Runtime | ✅ Found | 105 |
| Executive | ✅ Found | 12 |
| Projection | ✅ Found | 76 |
| UI | ✅ Found | 7 |
| API | ❌ Not found | 0 |
| Simulation | ✅ Found | 7 |
| Benchmark | ✅ Found | 262 |
| Other | ✅ Found | 21 |

### Detailed Matches

#### Engine

##### `engine/conversation/OpenAIConversationInterpreter.ts`

- Line 63 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `engine/v3/investigation/runOrganizationInvestigation.ts`

- Line 14 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 15 · **import** · matched `evolveOrganizationRuntime`
  - `} from "../runtime/evolveOrganizationRuntime";`
- Line 89 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime({`
- Line 99 · **unknown** · matched `evolveOrganizationRuntime`
  - `* evolveOrganizationRuntime() already advances investigationCount.`

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import { buildOrganizationalUnderstanding } from "./buildOrganizationalUnderstanding";`
- Line 30 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "../../understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 42 · **type** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding?:`
- Line 253 · **unknown** · matched `OrganizationalUnderstanding`
  - `for (const composition of input.canonicalOrganizationalUnderstanding ?? []) {`
- Line 500 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstanding =`
- Line 501 · **unknown** · matched `OrganizationalUnderstanding`
  - `buildOrganizationalUnderstanding({`
- Line 543 · **unknown** · matched `OrganizationalUnderstanding`
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

- Line 216 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingState = {`
- Line 222 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingCondition = {`
- Line 230 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingInvestigation = {`
- Line 239 · **assignment** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstanding = {`
- Line 260 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalState: OrganizationalUnderstandingState \| null;`
- Line 266 · **unknown** · matched `OrganizationalUnderstanding`
  - `dominantCondition: OrganizationalUnderstandingCondition \| null;`
- Line 324 · **unknown** · matched `OrganizationalUnderstanding`
  - `nextInvestigation: OrganizationalUnderstandingInvestigation \| null;`
- Line 357 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: OrganizationalUnderstanding;`
- Line 372 · **unknown** · matched `OrganizationalUnderstanding`
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
- Line 22 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandingState: OrganizationalUnderstandingState;`

##### `engine/v3/scenarios/buildExecutiveDecisionContext.ts`

- Line 94 · **unknown** · matched `organizational-understanding`
  - `* organizational-understanding pipeline.`
- Line 101 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState`

##### `engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts`

- Line 29 · **unknown** · matched `organizational-understanding`
  - `authorityOwner: "canonical-organizational-understanding";`
- Line 171 · **definition** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `export function buildCanonicalUnderstandingCompatibilityShadow(input: {`
- Line 238 · **type** · matched `organizational-understanding`
  - `const compositionId = \`organizational-understanding:${encodedIdentity([`
- Line 266 · **unknown** · matched `organizational-understanding`
  - `"canonical-organizational-understanding" as const,`

##### `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`

- Line 1 · **import** · matched `consolidateUnderstanding`
  - `import type { UnderstandingCandidate } from "./consolidateUnderstanding";`
- Line 57 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `export type BuildExecutiveUnderstandingCandidatesInput = {`
- Line 85 · **definition** · matched `buildExecutiveUnderstandingCandidates`
  - `export function buildExecutiveUnderstandingCandidates(`
- Line 86 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `input: BuildExecutiveUnderstandingCandidatesInput,`

##### `engine/v3/understanding/buildUnadjudicatedExplanationUnderstandingShadow.ts`

- Line 164 · **unknown** · matched `CAP-UND-006`
  - `* Read-only Phase 3 shadow at CAP-UND-006. The result is deliberately`

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

##### `engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts`

- Line 1 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "./buildCanonicalUnderstandingCompatibilityShadow";`
- Line 3 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingDisclosureDisposition =`
- Line 12 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingDisclosureDecision = {`
- Line 16 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition: OrganizationalUnderstandingDisclosureDisposition;`
- Line 22 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingDisclosureResult = {`
- Line 26 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition: OrganizationalUnderstandingDisclosureDisposition;`
- Line 48 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function discloseCanonicalOrganizationalUnderstanding(input: {`
- Line 51 · **unknown** · matched `OrganizationalUnderstanding`
  - `decision: OrganizationalUnderstandingDisclosureDecision;`
- Line 53 · **unknown** · matched `OrganizationalUnderstanding`
  - `}): OrganizationalUnderstandingDisclosureResult {`

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

- Line 4 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 25 · **import** · matched `OrganizationalUnderstanding`
  - `import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";`
- Line 27 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding,`
- Line 29 · **import** · matched `consolidateUnderstanding`
  - `} from "../understanding/consolidateUnderstanding";`
- Line 30 · **import** · matched `synthesizeUnderstanding`
  - `import { synthesizeUnderstanding } from "../understanding/synthesizeUnderstanding";`
- Line 31 · **import** · matched `buildExecutiveUnderstandingCandidates`
  - `import { buildExecutiveUnderstandingCandidates } from "../understanding/buildExecutiveUnderstandingCandidates";`
- Line 32 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import { buildCanonicalUnderstandingCompatibilityShadow } from "../understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 43 · **import** · matched `OrganizationalUnderstanding`
  - `import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 64 · **definition** · matched `evolveOrganizationRuntime`
  - `export function evolveOrganizationRuntime(params: {`
- Line 67 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingOwnershipMode?: "canonical" \| "legacy";`
- Line 68 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingAuthorityMode?: "explicit" \| "implicit";`
- Line 144 · **unknown** · matched `OrganizationalUnderstanding`
  - `const existingOrganizationalUnderstandingState:`
- Line 145 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState =`
- Line 146 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState ??`
- Line 147 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState({`
- Line 173 · **unknown** · matched `OrganizationalUnderstanding`
  - `const baseOrganizationalUnderstandingState =`
- Line 174 · **unknown** · matched `OrganizationalUnderstanding`
  - `updateOrganizationalUnderstandingState({`
- Line 175 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: existingOrganizationalUnderstandingState,`
- Line 180 · **unknown** · matched `consolidateUnderstanding`
  - `const consolidationResult = consolidateUnderstanding(`
- Line 181 · **unknown** · matched `OrganizationalUnderstanding`
  - `baseOrganizationalUnderstandingState,`
- Line 185 · **unknown** · matched `OrganizationalUnderstanding`
  - `const updatedOrganizationalUnderstandingState:`
- Line 186 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 187 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState,`
- Line 191 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState.evolutionHistory,`
- Line 220 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 221 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState,`
- Line 269 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 278 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 306 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 400 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 483 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 500 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.organizationalBeliefs,`
- Line 553 · **assignment** · matched `OrganizationalUnderstanding`
  - `const canonicalOrganizationalUnderstanding =`
- Line 554 · **unknown** · matched `OrganizationalUnderstanding`
  - `params.organizationalUnderstandingOwnershipMode === "legacy"`
- Line 555 · **unknown** · matched `OrganizationalUnderstanding`
  - `? existingOrganizationalUnderstandingState.canonicalCompositions`
- Line 556 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `: buildCanonicalUnderstandingCompatibilityShadow({`
- Line 560 · **unknown** · matched `OrganizationalUnderstanding`
  - `params.organizationalUnderstandingAuthorityMode,`
- Line 562 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.canonicalCompositions,`
- Line 602 · **unknown** · matched `OrganizationalUnderstanding`
  - `const beliefUpdatedOrganizationalUnderstandingState:`
- Line 603 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 604 · **unknown** · matched `OrganizationalUnderstanding`
  - `...updatedOrganizationalUnderstandingState,`
- Line 605 · **unknown** · matched `OrganizationalUnderstanding`
  - `...(canonicalOrganizationalUnderstanding`
- Line 608 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 616 · **unknown** · matched `OrganizationalUnderstanding`
  - `const synthesizedOrganizationalUnderstandingState =`
- Line 617 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 618 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: beliefUpdatedOrganizationalUnderstandingState,`
- Line 625 · **unknown** · matched `OrganizationalUnderstanding`
  - `synthesizedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 912 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 942 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates({`
- Line 954 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 955 · **unknown** · matched `OrganizationalUnderstanding`
  - `...existingOrganizationalUnderstandingState,`
- Line 957 · **unknown** · matched `OrganizationalUnderstanding`
  - `...(canonicalOrganizationalUnderstanding`
- Line 960 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 965 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.currentUnderstandings.filter(`
- Line 977 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding(`
- Line 982 · **unknown** · matched `OrganizationalUnderstanding`
  - `const finalOrganizationalUnderstandingState =`
- Line 983 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 1019 · **unknown** · matched `OrganizationalUnderstanding`
  - `_canonicalCompositionsOwnedByOrganizationalUnderstanding,`
- Line 1021 · **unknown** · matched `OrganizationalUnderstanding`
  - `} = finalOrganizationalUnderstandingState;`
- Line 1025 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.currentUnderstandings.map(`
- Line 1051 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 1052 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1392 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1393 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1479 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1480 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1666 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 1667 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1737 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1738 · **unknown** · matched `OrganizationalUnderstanding`
  - `typeof finalOrganizationalUnderstandingState;`

##### `engine/v3/runtime/index.ts`

- Line 24 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 25 · **import** · matched `evolveOrganizationRuntime`
  - `} from "./evolveOrganizationRuntime";`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 60 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState,`
- Line 61 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingState";`
- Line 63 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState,`
- Line 64 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingState";`
- Line 104 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState: OrganizationalUnderstandingState;`
- Line 311 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 312 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState({`

##### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 3 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "../understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 14 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingSource =`
- Line 33 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingScore = {`
- Line 45 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingHistoryEvent = {`
- Line 59 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingRecommendation = {`
- Line 70 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingItem = {`
- Line 72 · **unknown** · matched `OrganizationalUnderstanding`
  - `source: OrganizationalUnderstandingSource;`
- Line 114 · **unknown** · matched `OrganizationalUnderstanding`
  - `history: OrganizationalUnderstandingHistoryEvent[];`
- Line 121 · **unknown** · matched `OrganizationalUnderstanding`
  - `score: OrganizationalUnderstandingScore;`
- Line 170 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingEvolutionEvent = {`
- Line 185 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingState = {`
- Line 193 · **unknown** · matched `OrganizationalUnderstanding`
  - `score: OrganizationalUnderstandingScore;`
- Line 197 · **unknown** · matched `OrganizationalUnderstanding`
  - `currentUnderstandings: OrganizationalUnderstandingItem[];`
- Line 214 · **unknown** · matched `OrganizationalUnderstanding`
  - `recommendations: OrganizationalUnderstandingRecommendation[];`
- Line 220 · **unknown** · matched `OrganizationalUnderstanding`
  - `evolutionHistory: OrganizationalUnderstandingEvolutionEvent[];`
- Line 230 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function createEmptyUnderstandingScore(): OrganizationalUnderstandingScore {`
- Line 397 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function createEmptyOrganizationalUnderstandingState(params: {`
- Line 403 · **unknown** · matched `OrganizationalUnderstanding`
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

##### `components/product-shell/data/buildRuntimeOrganizationView.ts`

- Line 126 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

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

##### `engine/v3/projection/organizationalUnderstandingProjection.ts`

- Line 17 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 19 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingDisclosureResult,`
- Line 20 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 41 · **unknown** · matched `organizational-understanding`
  - `\| "organizational-understanding"`
- Line 70 · **unknown** · matched `OrganizationalUnderstanding`
  - `disclosure: OrganizationalUnderstandingDisclosureResult;`
- Line 131 · **unknown** · matched `organizational-understanding`
  - `owner: "organizational-understanding";`
- Line 151 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingProjection = {`
- Line 210 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 265 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingProjection {`
- Line 282 · **unknown** · matched `organizational-understanding`
  - `projectionId: \`organizational-understanding-projection:${encodeURIComponent(`
- Line 345 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function compileOrganizationalUnderstandingProjection(`
- Line 347 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingProjection {`
- Line 513 · **unknown** · matched `organizational-understanding`
  - `owner: "organizational-understanding",`
- Line 566 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 708 · **unknown** · matched `organizational-understanding`
  - `projectionId: \`organizational-understanding-projection:${encodeURIComponent(`

##### `components/executive-v2/projection/ExecutiveScenarioProjection.ts`

- Line 23 · **import** · matched `consolidateUnderstanding`
  - `} from "../../../engine/v3/understanding/consolidateUnderstanding";`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 218 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState?: {`
- Line 312 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory?.organizationalUnderstandingState?.currentUnderstandings ?? [];`
- Line 340 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health?.maturity ??`
- Line 413 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health?.uncertainty ??`
- Line 1234 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtimeMemory?.organizationalUnderstandingState?.health`

##### `components/product-shell/data/buildOrganizationExperienceFromProjection.ts`

- Line 2 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingProjection,`
- Line 5 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 60 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection,`
- Line 79 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection;`

##### `scripts/product/validateOrganizationalUnderstandingProjectionShadow.ts`

- Line 22 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 26 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 33 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow,`
- Line 35 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 37 · **unknown** · matched `OrganizationalUnderstanding`
  - `discloseCanonicalOrganizationalUnderstanding,`
- Line 38 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingDisclosureDecision,`
- Line 39 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingDisclosureResult,`
- Line 40 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 110 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const compositions = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 289 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 310 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition: OrganizationalUnderstandingDisclosureDecision["disposition"],`
- Line 311 · **unknown** · matched `OrganizationalUnderstanding`
  - `overrides: Partial<OrganizationalUnderstandingDisclosureDecision> = {},`
- Line 312 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingDisclosureDecision {`
- Line 325 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition: OrganizationalUnderstandingDisclosureDecision["disposition"],`
- Line 326 · **unknown** · matched `OrganizationalUnderstanding`
  - `overrides: Partial<OrganizationalUnderstandingDisclosureDecision> = {},`
- Line 327 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingDisclosureResult {`
- Line 328 · **unknown** · matched `OrganizationalUnderstanding`
  - `return discloseCanonicalOrganizationalUnderstanding({`
- Line 337 · **unknown** · matched `OrganizationalUnderstanding`
  - `disclosed: OrganizationalUnderstandingDisclosureResult = disclosure(`
- Line 369 · **unknown** · matched `OrganizationalUnderstanding`
  - `const projection = compileOrganizationalUnderstandingProjection(`
- Line 375 · **unknown** · matched `OrganizationalUnderstanding`
  - `stable(compileOrganizationalUnderstandingProjection(eligibleSource)),`
- Line 390 · **unknown** · matched `OrganizationalUnderstanding`
  - `stable(compileOrganizationalUnderstandingProjection(reversed)),`
- Line 411 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(mismatched);`
- Line 422 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(mismatched);`
- Line 428 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(`
- Line 438 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(`
- Line 451 · **unknown** · matched `OrganizationalUnderstanding`
  - `const invalidDisclosure: OrganizationalUnderstandingDisclosureResult = {`
- Line 461 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(invalidSource);`
- Line 506 · **unknown** · matched `organizational-understanding`
  - `item.value.owner === "organizational-understanding" &&`
- Line 543 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection(withFixtureProse),`
- Line 585 · **unknown** · matched `OrganizationalUnderstanding`
  - `const emptyDisclosure: OrganizationalUnderstandingDisclosureResult = {`
- Line 593 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(`
- Line 614 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(missing);`
- Line 624 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = compileOrganizationalUnderstandingProjection(historical);`
- Line 661 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions =`
- Line 697 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];`
- Line 702 · **unknown** · matched `OrganizationalUnderstanding`
  - `const replayDisclosure = discloseCanonicalOrganizationalUnderstanding({`
- Line 725 · **unknown** · matched `OrganizationalUnderstanding`
  - `const first = compileOrganizationalUnderstandingProjection(replaySource);`
- Line 726 · **unknown** · matched `OrganizationalUnderstanding`
  - `const second = compileOrganizationalUnderstandingProjection(replaySource);`
- Line 743 · **unknown** · matched `OrganizationalUnderstanding`
  - `productSource.includes("compileOrganizationalUnderstandingProjection"),`

##### `scripts/product/validateYourOrganizationProjectionCompatibility.ts`

- Line 12 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingProjection,`
- Line 14 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 27 · **unknown** · matched `OrganizationalUnderstanding`
  - `function projection(): OrganizationalUnderstandingProjection {`
- Line 41 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 58 · **unknown** · matched `organizational-understanding`
  - `authorityOwner: "canonical-organizational-understanding",`
- Line 173 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 178 · **unknown** · matched `organizational-understanding`
  - `owner: "organizational-understanding",`
- Line 292 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 297 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 305 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 323 · **unknown** · matched `OrganizationalUnderstanding`
  - `area: area as OrganizationalUnderstandingProjection["availability"][number]["area"],`
- Line 332 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingProjection {`

#### UI

##### `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`

- Line 9 · **unknown** · matched `CAP-UND-006`
  - `\| "CAP-UND-006"`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`

- Line 17 · **unknown** · matched `CAP-UND-006`
  - `\| "CAP-UND-006"`

##### `components/product-shell/data/buildAskExperienceView.ts`

- Line 101 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `components/product-shell/data/buildOrganizationExperienceView.ts`

- Line 135 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `components/product-shell/data/buildOrganizationModelContext.ts`

- Line 22 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understanding = record(memory.organizationalUnderstandingState);`

##### `components/product-shell/data/buildResearchExperienceView.ts`

- Line 80 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `components/results/SemanticConceptInspector.tsx`

- Line 23 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime?.memory?.organizationalUnderstandingState?.currentUnderstandings \|\|`

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
- Line 164 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates({`

##### `engine/v3/model/simulate/compareSimulationScenario.ts`

- Line 379 · **unknown** · matched `OrganizationalUnderstanding`
  - `.organizationalUnderstanding;`
- Line 383 · **unknown** · matched `OrganizationalUnderstanding`
  - `.organizationalUnderstanding;`

#### Benchmark

##### `engine/benchmark/auditUnderstandingLayers.ts`

- Line 11 · **unknown** · matched `consolidateUnderstanding`
  - `"consolidateUnderstanding",`

##### `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/BENCHMARK_REPORT.md`

- Line 27 · **unknown** · matched `evolveOrganizationRuntime`
  - `\`evolveOrganizationRuntime()\`. Enrichment consumed generated cognition only.`

##### `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/README.md`

- Line 19 · **unknown** · matched `evolveOrganizationRuntime`
  - `→ evolveOrganizationRuntime()`

##### `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/RESULTS.json`

- Line 8 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime"`

##### `engine/benchmark/candidate-enriched-mechanism-shadow-experiment-001/productionPathAudit.ts`

- Line 2 · **unknown** · matched `evolveOrganizationRuntime`
  - `entryPoints: ["runDiscoveryV3", "evolveOrganizationRuntime"],`

##### `engine/benchmark/causal-mechanism-formation-experiment-001/BENCHMARK_REPORT.md`

- Line 22 · **unknown** · matched `evolveOrganizationRuntime`
  - `\`evolveOrganizationRuntime\`. The run consumed raw Evidence and generated`

##### `engine/benchmark/causal-mechanism-formation-experiment-001/README.md`

- Line 20 · **unknown** · matched `evolveOrganizationRuntime`
  - `\`evolveOrganizationRuntime\`, under a fixed clock. The benchmark collects raw`

##### `engine/benchmark/causal-mechanism-formation-experiment-001/RESULTS.json`

- Line 7 · **unknown** · matched `evolveOrganizationRuntime`
  - `"runtimeEvolution": "evolveOrganizationRuntime runs in memory under a fixed clock; persistence is not invoked.",`

##### `engine/benchmark/causal-mechanism-formation-experiment-001/productionPathAudit.ts`

- Line 5 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime runs in memory under a fixed clock; persistence is not invoked.",`

##### `engine/benchmark/causal-mechanism-formation-refinement-experiment-002/README.md`

- Line 13 · **unknown** · matched `evolveOrganizationRuntime`
  - `path runs \`runDiscoveryV3\` and in-memory \`evolveOrganizationRuntime\`, then`

##### `engine/benchmark/causal-mechanism-formation-refinement-experiment-002/RESULTS.json`

- Line 7 · **unknown** · matched `evolveOrganizationRuntime`
  - `"runtimeEvolution": "evolveOrganizationRuntime runs in memory under a fixed clock; persistence is not invoked.",`

##### `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/BENCHMARK_REPORT.md`

- Line 29 · **unknown** · matched `evolveOrganizationRuntime`
  - `\`evolveOrganizationRuntime()\` against a fresh in-memory Runtime. The audit`

##### `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/README.md`

- Line 18 · **unknown** · matched `evolveOrganizationRuntime`
  - `→ evolveOrganizationRuntime()`

##### `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/RESULTS.json`

- Line 8 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime({ runtime, result, input })"`
- Line 44 · **unknown** · matched `evolveOrganizationRuntime`
  - `"producedBy": "runDiscoveryV3 and evolveOrganizationRuntime",`
- Line 65 · **unknown** · matched `evolveOrganizationRuntime`
  - `"producedBy": "evolveOrganizationRuntime prediction producers",`

##### `engine/benchmark/cross-silo-mechanism-implication-intervention-audit-001/productionPathAudit.ts`

- Line 4 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime({ runtime, result, input })",`
- Line 10 · **unknown** · matched `evolveOrganizationRuntime`
  - `{ stage: "Themes/Phenomena", producedBy: "runDiscoveryV3 and evolveOrganizationRuntime", tracedFields: ["id", "description", "supporting Evidence", "confidence"] },`
- Line 12 · **unknown** · matched `evolveOrganizationRuntime`
  - `{ stage: "Predictions", producedBy: "evolveOrganizationRuntime prediction producers", tracedFields: ["statement", "conditions", "horizon", "confidence", "falsifyingEvidence", "source condition/concept/theory IDs"] },`

##### `engine/benchmark/emergence-phase-transition-experiment-001/BENCHMARK_REPORT.md`

- Line 21 · **unknown** · matched `evolveOrganizationRuntime`
  - `\`evolveOrganizationRuntime()\` against a new in-memory Runtime. Production`

##### `engine/benchmark/emergence-phase-transition-experiment-001/README.md`

- Line 21 · **unknown** · matched `evolveOrganizationRuntime`
  - `→ evolveOrganizationRuntime()`

##### `engine/benchmark/emergence-phase-transition-experiment-001/RESULTS.json`

- Line 9 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime({ runtime, result, input })"`

##### `engine/benchmark/emergence-phase-transition-experiment-001/productionPathAudit.ts`

- Line 5 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime({ runtime, result, input })",`

##### `engine/benchmark/emergent-organizational-intelligence-experiment-001/inferEmergentUnderstanding.ts`

- Line 2 · **unknown** · matched `OrganizationalUnderstanding`
  - `EmergentOrganizationalUnderstanding,`
- Line 21 · **unknown** · matched `OrganizationalUnderstanding`
  - `): EmergentOrganizationalUnderstanding \| null {`

##### `engine/benchmark/emergent-organizational-intelligence-experiment-001/types.ts`

- Line 84 · **assignment** · matched `OrganizationalUnderstanding`
  - `export type EmergentOrganizationalUnderstanding = {`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/BENCHMARK_REPORT.md`

- Line 23 · **unknown** · matched `evolveOrganizationRuntime`
  - `then entered \`evolveOrganizationRuntime()\` against a fresh in-memory Runtime`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/README.md`

- Line 17 · **unknown** · matched `evolveOrganizationRuntime`
  - `result is passed to \`evolveOrganizationRuntime()\` against a fresh, in-memory`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/RESULTS.json`

- Line 23 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime"`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/productionPathAudit.ts`

- Line 19 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime",`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/runProductionShadowCognition.ts`

- Line 4 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 41 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/executive-collaboration-lab/executiveConversationScenarios.ts`

- Line 11 · **unknown** · matched `OrganizationalUnderstanding`
  - `value.memory.organizationalUnderstandingState.currentUnderstandings = [{ id: "understanding-baseline", statement: "Decision ownership and prioritization interact to slow execution.", summary: "Approval count alone does not explain the delay.", confidence: .72, openQuestions: ["Which decisions wait, and whether unclear priority or unclear ownership causes the wait?"], missingInformation: ["Recent decision-path evidence."], evidenceIds: [], observationIds: [], beliefIds: [], themeIds: [], mechanismIds: [], contradictionIds: [], recommendationIds: [], supportingDynamics: [], supportingCapabilities: [], investigationIds: [], implications: [], history: [] } as never];`

##### `engine/benchmark/executive-collaboration-lab/runExecutiveConversationScenario.ts`

- Line 2 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime";`
- Line 59 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime = withFixedClock(fixedTimestamp, () => evolveOrganizationRuntime({ runtime, result: runDiscoveryV3({ company, website: "", industry: "", question: "What does this executive evidence change?", context: turn.message }), input: { company, website: "", industry: "", question: "What does this executive evidence change?", context: turn.message } }));`

##### `engine/benchmark/executive-decision-lab/runExecutiveDecisionLab.ts`

- Line 62 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understanding = runtime.memory.organizationalUnderstandingState.currentUnderstandings[0];`

##### `engine/benchmark/executive-projection/executiveProjectionExperiment001.ts`

- Line 283 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState: {`

##### `engine/benchmark/executive-work/executiveOperatingSystemBenchmark001.ts`

- Line 959 · **unknown** · matched `OrganizationalUnderstanding`
  - `.organizationalUnderstandingState !==`

##### `engine/benchmark/high-volume/captureRuntimeSnapshot.ts`

- Line 112 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?: {`
- Line 319 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstanding =`
- Line 321 · **unknown** · matched `OrganizationalUnderstanding`
  - `?.organizationalUnderstanding;`
- Line 435 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 451 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 463 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 473 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 483 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 486 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`

##### `engine/benchmark/high-volume/northstar/runNorthstarPrecisionGap001.ts`

- Line 194 · **unknown** · matched `OrganizationalUnderstanding`
  - `"organizationalUnderstanding",`

##### `engine/benchmark/high-volume/northstar/scoreNorthstarGroundTruth.ts`

- Line 105 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?: TextLike & {`
- Line 732 · **unknown** · matched `OrganizationalUnderstanding`
  - `?.organizationalUnderstanding`

##### `engine/benchmark/high-volume/northstar/traceConcurrencyStaffingSemantics.ts`

- Line 6 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../../v3/runtime/evolveOrganizationRuntime";`
- Line 276 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstandingState =`
- Line 277 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState as`
- Line 306 · **unknown** · matched `organizational-understanding`
  - `"organizational-understanding",`
- Line 307 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState?.currentUnderstandings,`
- Line 404 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment/mechanismEvidencePropagation001.ts`

- Line 4 · **import** · matched `buildExecutiveUnderstandingCandidates`
  - `import { buildExecutiveUnderstandingCandidates } from "../../v3/understanding/buildExecutiveUnderstandingCandidates";`
- Line 77 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `const executiveUnderstanding = buildExecutiveUnderstandingCandidates({`
- Line 98 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `} as Parameters<typeof buildExecutiveUnderstandingCandidates>[0])[0];`

##### `engine/benchmark/judgment-lab/canonicalUnderstandingCompatibilityShadowGate.ts`

- Line 13 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 15 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow,`
- Line 18 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../../v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 98 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`
- Line 147 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const compositions = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 167 · **unknown** · matched `evolveOrganizationRuntime`
  - `"The shadow consumed completed Explanations emitted by runDiscoveryV3() through evolveOrganizationRuntime().",`
- Line 288 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const repeated = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 301 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const changed = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 332 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const isolated = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 358 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow({`
- Line 365 · **unknown** · matched `OrganizationalUnderstanding`
  - `historicalRuntime.memory.organizationalUnderstandingState.currentUnderstandings`
- Line 379 · **unknown** · matched `OrganizationalUnderstanding`
  - `production.runtime.memory.organizationalUnderstandingState,`
- Line 458 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const repeat = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 481 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow({`
- Line 505 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime.ts",`
- Line 510 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `runtimeSource.includes("buildCanonicalUnderstandingCompatibilityShadow"),`
- Line 558 · **unknown** · matched `evolveOrganizationRuntime`
  - `path: "runDiscoveryV3 → evolveOrganizationRuntime",`
- Line 567 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingIndex: "positive hypothesis only",`

##### `engine/benchmark/judgment-lab/canonicalUnderstandingOwnershipMigrationGate.ts`

- Line 12 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 108 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`
- Line 119 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingOwnershipMode: params.mode,`
- Line 127 · **unknown** · matched `OrganizationalUnderstanding`
  - `delete value.memory.organizationalUnderstandingState.canonicalCompositions;`
- Line 135 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings,`
- Line 167 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonical.runtime.memory.organizationalUnderstandingState`
- Line 185 · **unknown** · matched `OrganizationalUnderstanding`
  - `legacy.runtime.memory.organizationalUnderstandingState`
- Line 208 · **unknown** · matched `OrganizationalUnderstanding`
  - `"Category A composition exists only at organizationalUnderstandingState.canonicalCompositions.",`
- Line 260 · **unknown** · matched `evolveOrganizationRuntime`
  - `"engine/v3/runtime/evolveOrganizationRuntime.ts",`
- Line 265 · **unknown** · matched `OrganizationalUnderstanding`
  - `"const canonicalOrganizationalUnderstanding",`
- Line 275 · **unknown** · matched `OrganizationalUnderstanding`
  - `.includes("canonicalOrganizationalUnderstanding"),`
- Line 298 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonical.runtime.memory.organizationalUnderstandingState`
- Line 302 · **unknown** · matched `OrganizationalUnderstanding`
  - `legacy.runtime.memory.organizationalUnderstandingState`
- Line 349 · **unknown** · matched `OrganizationalUnderstanding`
  - `historical.memory.organizationalUnderstandingState`
- Line 371 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalHistorical.runtime.memory.organizationalUnderstandingState`
- Line 380 · **unknown** · matched `OrganizationalUnderstanding`
  - `legacyHistorical.runtime.memory.organizationalUnderstandingState`
- Line 397 · **unknown** · matched `evolveOrganizationRuntime`
  - `"engine/v3/runtime/evolveOrganizationRuntime.ts",`
- Line 398 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `"engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts",`
- Line 416 · **unknown** · matched `OrganizationalUnderstanding`
  - `empty.memory.organizationalUnderstandingState.canonicalCompositions,`
- Line 420 · **unknown** · matched `OrganizationalUnderstanding`
  - `Object.hasOwn(empty.memory, "canonicalOrganizationalUnderstanding"),`
- Line 441 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonical.runtime.memory.organizationalUnderstandingState`
- Line 447 · **type** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding:`
- Line 454 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingIndex:`
- Line 463 · **unknown** · matched `OrganizationalUnderstanding`
  - `"Set organizationalUnderstandingOwnershipMode to legacy or remove the additive canonical composition call; the prior Runtime and all downstream bytes are restored.",`

##### `engine/benchmark/judgment-lab/causalConstraintProductionShadow.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 69 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 604 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/causalConstraintReasoningBenchmark.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 63 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 539 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/comparativeEvidenceRolesBenchmarkGate.ts`

- Line 22 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 312 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`
- Line 894 · **unknown** · matched `evolveOrganizationRuntime`
  - `"evolveOrganizationRuntime always passes the bounded current-investigation context",`
- Line 952 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding:`
- Line 960 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding:`

##### `engine/benchmark/judgment-lab/competingExplanationAdjudication.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 75 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 524 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/competingExplanationProductionShadow.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 58 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 587 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/decisiveEvidenceAblation.ts`

- Line 5 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 150 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>,`
- Line 153 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`
- Line 263 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 279 · **unknown** · matched `evolveOrganizationRuntime`
  - `let runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 283 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/disclosureEligibilityRevocationContractGate.ts`

- Line 7 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow,`
- Line 9 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../../v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 11 · **unknown** · matched `OrganizationalUnderstanding`
  - `discloseCanonicalOrganizationalUnderstanding,`
- Line 12 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingDisclosureDecision,`
- Line 13 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../v3/understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 32 · **unknown** · matched `OrganizationalUnderstanding`
  - `overrides: Partial<OrganizationalUnderstandingDisclosureDecision> = {},`
- Line 33 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingDisclosureDecision {`
- Line 80 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const compositions = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 95 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = discloseCanonicalOrganizationalUnderstanding({`
- Line 106 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = discloseCanonicalOrganizationalUnderstanding({`
- Line 117 · **unknown** · matched `OrganizationalUnderstanding`
  - `const projectionInput = discloseCanonicalOrganizationalUnderstanding({`
- Line 129 · **unknown** · matched `OrganizationalUnderstanding`
  - `discloseCanonicalOrganizationalUnderstanding({`
- Line 141 · **unknown** · matched `OrganizationalUnderstanding`
  - `const before = discloseCanonicalOrganizationalUnderstanding({`
- Line 147 · **unknown** · matched `OrganizationalUnderstanding`
  - `const revoked = discloseCanonicalOrganizationalUnderstanding({`
- Line 172 · **unknown** · matched `OrganizationalUnderstanding`
  - `historical.memory.organizationalUnderstandingState.canonicalCompositions ??`
- Line 174 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = discloseCanonicalOrganizationalUnderstanding({`
- Line 187 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = discloseCanonicalOrganizationalUnderstanding({`
- Line 198 · **unknown** · matched `OrganizationalUnderstanding`
  - `const output = discloseCanonicalOrganizationalUnderstanding({`
- Line 216 · **unknown** · matched `OrganizationalUnderstanding`
  - `stable(discloseCanonicalOrganizationalUnderstanding(input)),`
- Line 217 · **unknown** · matched `OrganizationalUnderstanding`
  - `stable(discloseCanonicalOrganizationalUnderstanding(input)),`
- Line 227 · **unknown** · matched `OrganizationalUnderstanding`
  - `const forward = discloseCanonicalOrganizationalUnderstanding({`
- Line 233 · **unknown** · matched `OrganizationalUnderstanding`
  - `const reverse = discloseCanonicalOrganizationalUnderstanding({`
- Line 244 · **unknown** · matched `OrganizationalUnderstanding`
  - `discloseCanonicalOrganizationalUnderstanding({`
- Line 257 · **unknown** · matched `OrganizationalUnderstanding`
  - `"engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts",`
- Line 270 · **unknown** · matched `OrganizationalUnderstanding`
  - `"engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts",`
- Line 283 · **unknown** · matched `OrganizationalUnderstanding`
  - `"engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts",`
- Line 304 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: "Unchanged",`

##### `engine/benchmark/judgment-lab/evidenceIndependenceShadowEvaluation.ts`

- Line 7 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 16 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 143 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/explanationSeedTheoryAncestryBridge.ts`

- Line 20 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 434 · **unknown** · matched `evolveOrganizationRuntime`
  - `productionRuntime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/explicitAuthorityTransitionsGate.ts`

- Line 13 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 15 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow,`
- Line 17 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../../v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 111 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`
- Line 122 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingAuthorityMode: params.authorityMode,`
- Line 131 · **unknown** · matched `OrganizationalUnderstanding`
  - `value.memory.organizationalUnderstandingState.canonicalCompositions ?? []) {`
- Line 144 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings,`
- Line 174 · **unknown** · matched `OrganizationalUnderstanding`
  - `explicit.runtime.memory.organizationalUnderstandingState`
- Line 244 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const output = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 288 · **unknown** · matched `OrganizationalUnderstanding`
  - `replay.runtime.memory.organizationalUnderstandingState`
- Line 320 · **unknown** · matched `OrganizationalUnderstanding`
  - `historical.memory.organizationalUnderstandingState`
- Line 332 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow({`
- Line 342 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow({`
- Line 365 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const output = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 383 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const first = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 388 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const second = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 401 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const forward = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 406 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const reversed = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 464 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `"engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts",`
- Line 527 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: "Improved",`
- Line 534 · **unknown** · matched `OrganizationalUnderstanding`
  - `"Set organizationalUnderstandingAuthorityMode to implicit and remove additive authorityTransition receipts.",`

##### `engine/benchmark/judgment-lab/implicitCausalEdgeRecovery.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 61 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 612 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/mechanismEvidenceCompositionGroundTruth.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 37 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 284 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/primaryConstraintRankingGroundTruth.ts`

- Line 12 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 46 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 325 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/runJudgmentLab.ts`

- Line 3 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 49 · **unknown** · matched `evolveOrganizationRuntime`
  - `let runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 54 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime = evolveOrganizationRuntime({`
- Line 63 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `engine/benchmark/judgment-lab/structuredExplanationCandidateShadow.ts`

- Line 14 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 113 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 430 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/themeEvidenceCompositionIsolation.ts`

- Line 10 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 18 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 193 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `engine/benchmark/judgment-lab/unadjudicatedExplanationUnderstandingShadowGate.ts`

- Line 7 · **import** · matched `buildExecutiveUnderstandingCandidates`
  - `import { buildExecutiveUnderstandingCandidates } from "../../v3/understanding/buildExecutiveUnderstandingCandidates";`
- Line 318 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `const currentUnderstanding = buildExecutiveUnderstandingCandidates({`
- Line 445 · **unknown** · matched `CAP-UND-006`
  - `boundary: "CAP-UND-006",`
- Line 450 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingIndex: "positive hypothesis",`
- Line 457 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingIndex:`

##### `engine/benchmark/judgment-lab/validateJudgmentLabProvenance.ts`

- Line 6 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 57 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`
- Line 88 · **unknown** · matched `evolveOrganizationRuntime`
  - `function substantiveRuntime(runtime: ReturnType<typeof evolveOrganizationRuntime>) {`

##### `engine/benchmark/localized-nonlinear-cognition-experiment-001/RESULTS.json`

- Line 7 · **unknown** · matched `evolveOrganizationRuntime`
  - `"runtime": "In-memory evolveOrganizationRuntime under the existing production-shadow harness.",`

##### `engine/benchmark/localized-nonlinear-cognition-experiment-001/productionPathAudit.ts`

- Line 3 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: "In-memory evolveOrganizationRuntime under the existing production-shadow harness.",`

##### `engine/benchmark/operating-model-evolution-lab/productionReplay.ts`

- Line 3 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 30 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime = evolveOrganizationRuntime({ runtime, result: runDiscoveryV3(input), input });`

##### `engine/benchmark/organizational-intelligence-lab/runOrganizationalIntelligenceLab.ts`

- Line 169 · **unknown** · matched `OrganizationalUnderstanding`
  - `reusedObjects: ["OrganizationRuntime", "OrganizationalUnderstanding", "evidence lineage IDs", "contradictions", "missing information", "Executive Conversation benchmark isolation pattern"],`

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

##### `engine/benchmark/research/ORGANIZATIONAL_UNDERSTANDING_RESEARCH_FRAMEWORK.md`

- Line 367 · **type** · matched `OrganizationalUnderstanding`
  - `interface OrganizationalUnderstandingExperimentResult {`
- Line 402 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: "++" \| "+" \| "=" \| "-" \| "--" \| "?";`

##### `engine/benchmark/research/localized-nonlinear-cognition-adapter/RESULT.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"framework": "organizational-understanding-research-framework",`

##### `engine/benchmark/research/localized-nonlinear-cognition-adapter/runLocalizedNonlinearResearchAdapter.ts`

- Line 10 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingResearchRecord,`
- Line 285 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingResearchRecord {`
- Line 601 · **unknown** · matched `OrganizationalUnderstanding`
  - `const dimensionRows = (record: OrganizationalUnderstandingResearchRecord) => [`
- Line 720 · **unknown** · matched `organizational-understanding`
  - `framework: "organizational-understanding-research-framework",`

##### `engine/benchmark/research/localized-nonlinear-cognition-adapter/types.ts`

- Line 68 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingResearchRecord = {`
- Line 115 · **unknown** · matched `organizational-understanding`
  - `framework: "organizational-understanding-research-framework";`
- Line 123 · **unknown** · matched `OrganizationalUnderstanding`
  - `records: OrganizationalUnderstandingResearchRecord[];`

##### `engine/benchmark/runAtlasSimulation.ts`

- Line 560 · **unknown** · matched `OrganizationalUnderstanding`
  - `memoryRecord.organizationalUnderstandingState,`
- Line 676 · **unknown** · matched `OrganizationalUnderstanding`
  - `investigation.organizationalUnderstandingScore;`

##### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 13 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstanding } from "../v3/model/judgment/organizationalJudgment";`
- Line 18 · **unknown** · matched `OrganizationalUnderstanding`
  - `scoreOrganizationalUnderstanding,`
- Line 19 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingScorer";`
- Line 137 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?: OrganizationalUnderstanding;`
- Line 188 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore: ReturnType<`
- Line 189 · **unknown** · matched `OrganizationalUnderstanding`
  - `typeof scoreOrganizationalUnderstanding`
- Line 396 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstanding =`
- Line 398 · **unknown** · matched `OrganizationalUnderstanding`
  - `?.organizationalUnderstanding;`
- Line 401 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.statement,`
- Line 402 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.summary,`
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
- Line 419 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding`
- Line 422 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding?.narrative,`
- Line 499 · **unknown** · matched `OrganizationalUnderstanding`
  - `const organizationalUnderstandingScore =`
- Line 500 · **unknown** · matched `OrganizationalUnderstanding`
  - `scoreOrganizationalUnderstanding(`
- Line 501 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding,`
- Line 551 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore,`

##### `engine/benchmark/runtime/executiveMeaningPreservation001.ts`

- Line 6 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 7 · **import** · matched `evolveOrganizationRuntime`
  - `} from "../../v3/runtime/evolveOrganizationRuntime";`
- Line 526 · **unknown** · matched `evolveOrganizationRuntime`
  - `typeof evolveOrganizationRuntime`
- Line 533 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime({`

##### `engine/benchmark/stress/experiments/decisionIntelligenceStressExperiment001.ts`

- Line 11 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 168 · **unknown** · matched `evolveOrganizationRuntime`
  - `return evolveOrganizationRuntime({`

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

##### `scripts/product/validateAskExperience.ts`

- Line 58 · **unknown** · matched `OrganizationalUnderstanding`
  - `sparse.memory.organizationalUnderstandingState.currentUnderstandings = [];`

##### `scripts/product/validateLivingInteractionLoop.ts`

- Line 18 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.health.coherence = 0.68;`
- Line 19 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{`

##### `scripts/product/validateOrganizationExperience.ts`

- Line 24 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = runtime.memory.organizationalUnderstandingState;`
- Line 119 · **unknown** · matched `OrganizationalUnderstanding`
  - `noEvolution.memory.organizationalUnderstandingState.evolutionHistory = [];`
- Line 123 · **unknown** · matched `OrganizationalUnderstanding`
  - `(coherenceWithoutConfidence.memory.organizationalUnderstandingState.currentUnderstandings[0] as unknown as Record<string, unknown>).confidence = undefined;`
- Line 130 · **unknown** · matched `OrganizationalUnderstanding`
  - `noUnderstanding.memory.organizationalUnderstandingState.currentUnderstandings = [];`
- Line 156 · **unknown** · matched `OrganizationalUnderstanding`
  - `const canonicalState = canonical.memory.organizationalUnderstandingState;`
- Line 171 · **unknown** · matched `organizational-understanding`
  - `authorityOwner: "canonical-organizational-understanding",`

##### `scripts/product/validateResearchExperience.ts`

- Line 55 · **unknown** · matched `OrganizationalUnderstanding`
  - `missingEvidence.memory.organizationalUnderstandingState.currentUnderstandings = [{`
- Line 71 · **unknown** · matched `OrganizationalUnderstanding`
  - `none.memory.organizationalUnderstandingState.currentUnderstandings = [];`

##### `scripts/product/validateUnifiedExecutiveWorkspace.ts`

- Line 12 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.health.coherence = .64;`
- Line 13 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{ id: "understanding-1", statement: "Decision ownership ambiguity is slowing execution.", summary: "Clarifying who decides could unlock capacity.", confidence: .73, observationIds: [], missingInformation: [], openQuestions: [], evidenceIds: [], beliefIds: [], themeIds: [], mechanismIds: [], contradictionIds: [], recommendationIds: [], supportingDynamics: [], supportingCapabilities: [], investigationIds: [], implications: [], history: [] } as never];`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
