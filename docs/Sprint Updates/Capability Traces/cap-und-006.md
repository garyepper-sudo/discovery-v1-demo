# Capability Trace — Executive Understanding Synthesis

Generated: 2026-08-05T20:56:04.495Z

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

- `app/api/discovery-lab/route.ts`
- `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`
- `components/executive-v2/projection/ExecutiveScenarioProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/product-shell/communication/productUnderstanding.ts`
- `components/product-shell/data/buildActivatedYourOrganizationView.ts`
- `components/product-shell/data/buildAskExperienceView.ts`
- `components/product-shell/data/buildDiscoveryExperienceView.ts`
- `components/product-shell/data/buildOrganizationExperienceFromProjection.ts`
- `components/product-shell/data/buildOrganizationExperienceView.ts`
- `components/product-shell/data/buildOrganizationModelContext.ts`
- `components/product-shell/data/buildResearchExperienceView.ts`
- `components/product-shell/data/buildRuntimeOrganizationView.ts`
- `components/product-shell/data/buildYourOrganizationCommunicationView.ts`
- `components/product-shell/data/composeActivatedYourOrganization.ts`
- `components/product-shell/data/loadActivatedYourOrganization.ts`
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
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_1_RESULTS.json`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_2_RESULTS.json`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_3_RESULTS.json`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_4_RESULTS.json`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/contracts.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/deterministicScoring.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/frozenSemantics.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/generateSemanticCandidates.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase2ValidationFixtures.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase3CandidateFixtures.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase3Contracts.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/RESULTS.json`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/contracts.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/phase4InfrastructureFixtures.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/validatePhase4ProtocolInfrastructure001.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-study-operations-readiness-001/RESULTS.json`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-study-operations-readiness-001/validatePhase4StudyOperationsReadiness001.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase5/EXECUTION_INSTRUCTIONS.md`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase5/generated/PHASE_5_RESULTS.json`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase5/validatePhase5HumanStudy.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/retrievalSignals.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/structuralValidation.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase1Architecture.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase2StructuralEvaluator.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase3CandidateGeneration.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase4ImportedAdjudication.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validationFixtures.ts`
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
- `engine/benchmark/product-communication/structuredProductCommunicationShadow.ts`
- `engine/benchmark/research/ORGANIZATIONAL_UNDERSTANDING_RESEARCH_FRAMEWORK.md`
- `engine/benchmark/research/README.md`
- `engine/benchmark/research/external-comparative-validation-001/README.md`
- `engine/benchmark/research/external-comparative-validation-001/RESULTS.json`
- `engine/benchmark/research/external-comparative-validation-001/evaluate.ts`
- `engine/benchmark/research/external-comparative-validation-001/runExternalComparativeValidation001.ts`
- `engine/benchmark/research/external-comparative-validation-001/treatments.ts`
- `engine/benchmark/research/external-comparative-validation-001/types.ts`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/RESULT.json`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/runLocalizedNonlinearResearchAdapter.ts`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/types.ts`
- `engine/benchmark/research/scoring-robustness-validation-001/RESULTS.json`
- `engine/benchmark/research/scoring-robustness-validation-001/validateScoringRobustness001.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/runtime/executiveMeaningPreservation001.ts`
- `engine/benchmark/stress/experiments/decisionIntelligenceStressExperiment001.ts`
- `engine/conversation/OpenAIConversationInterpreter.ts`
- `engine/v3/communication/productCommunicationPlan.ts`
- `engine/v3/executive/buildExecutiveChangeSummary.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/governance/alphaAllowlistDisclosureProducer.ts`
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
- `scripts/product/capabilitySurvivalManifest.ts`
- `scripts/product/validateAlphaAllowlistDisclosureProducerShadow.ts`
- `scripts/product/validateAlphaYourOrganizationActivation.ts`
- `scripts/product/validateAskExperience.ts`
- `scripts/product/validateCanonicalProductComposition.ts`
- `scripts/product/validateCapabilitySurvival.ts`
- `scripts/product/validateEvidenceRoles.ts`
- `scripts/product/validateLeadCoherentUnderstanding.ts`
- `scripts/product/validateLivingInteractionLoop.ts`
- `scripts/product/validateOnboardingEvidenceExperience.ts`
- `scripts/product/validateOnboardingInvestigationIdempotency.ts`
- `scripts/product/validateOnboardingToAlphaReplay.ts`
- `scripts/product/validateOrganizationExperience.ts`
- `scripts/product/validateOrganizationalUnderstandingProjectionShadow.ts`
- `scripts/product/validateProductUnderstandingTranslation.ts`
- `scripts/product/validateResearchExperience.ts`
- `scripts/product/validateTruthfulUtility.ts`
- `scripts/product/validateUnifiedExecutiveWorkspace.ts`
- `scripts/product/validateWhatChangedAndWhy.ts`
- `scripts/product/validateWhyDiscoveryBelievesThis.ts`
- `scripts/product/validateWhyThisEvidenceMatters.ts`
- `scripts/product/validateYourOrganizationCommunicationAdapter.ts`
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
| Engine | ✅ Found | 121 |
| Runtime | ✅ Found | 105 |
| Executive | ✅ Found | 12 |
| Projection | ✅ Found | 76 |
| UI | ✅ Found | 25 |
| API | ✅ Found | 1 |
| Simulation | ✅ Found | 7 |
| Benchmark | ✅ Found | 493 |
| Other | ✅ Found | 99 |

### Detailed Matches

#### Engine

##### `engine/conversation/OpenAIConversationInterpreter.ts`

- Line 63 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `engine/v3/communication/productCommunicationPlan.ts`

- Line 3 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingProjection,`
- Line 5 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../projection/organizationalUnderstandingProjection";`
- Line 57 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection;`
- Line 292 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection,`
- Line 366 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection,`
- Line 476 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection,`
- Line 580 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection,`

##### `engine/v3/governance/alphaAllowlistDisclosureProducer.ts`

- Line 6 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 8 · **unknown** · matched `OrganizationalUnderstanding`
  - `discloseCanonicalOrganizationalUnderstanding,`
- Line 9 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingDisclosureDecision,`
- Line 10 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingDisclosureResult,`
- Line 11 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 145 · **unknown** · matched `OrganizationalUnderstanding`
  - `decision: OrganizationalUnderstandingDisclosureDecision;`
- Line 146 · **unknown** · matched `OrganizationalUnderstanding`
  - `disclosure: OrganizationalUnderstandingDisclosureResult;`
- Line 485 · **unknown** · matched `organizational-understanding`
  - `"canonical-organizational-understanding" &&`
- Line 535 · **unknown** · matched `OrganizationalUnderstanding`
  - `const decision: OrganizationalUnderstandingDisclosureDecision = {`
- Line 543 · **unknown** · matched `OrganizationalUnderstanding`
  - `const disclosure = discloseCanonicalOrganizationalUnderstanding({`

##### `engine/v3/investigation/runOrganizationInvestigation.ts`

- Line 14 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 15 · **import** · matched `evolveOrganizationRuntime`
  - `} from "../runtime/evolveOrganizationRuntime";`
- Line 175 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime({`
- Line 210 · **unknown** · matched `evolveOrganizationRuntime`
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
- Line 145 · **unknown** · matched `OrganizationalUnderstanding`
  - `const existingOrganizationalUnderstandingState:`
- Line 146 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState =`
- Line 147 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState ??`
- Line 148 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState({`
- Line 174 · **unknown** · matched `OrganizationalUnderstanding`
  - `const baseOrganizationalUnderstandingState =`
- Line 175 · **unknown** · matched `OrganizationalUnderstanding`
  - `updateOrganizationalUnderstandingState({`
- Line 176 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: existingOrganizationalUnderstandingState,`
- Line 181 · **unknown** · matched `consolidateUnderstanding`
  - `const consolidationResult = consolidateUnderstanding(`
- Line 182 · **unknown** · matched `OrganizationalUnderstanding`
  - `baseOrganizationalUnderstandingState,`
- Line 186 · **unknown** · matched `OrganizationalUnderstanding`
  - `const updatedOrganizationalUnderstandingState:`
- Line 187 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 188 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState,`
- Line 192 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState.evolutionHistory,`
- Line 221 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 222 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState,`
- Line 270 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 279 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 307 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 401 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 484 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 501 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.organizationalBeliefs,`
- Line 554 · **assignment** · matched `OrganizationalUnderstanding`
  - `const canonicalOrganizationalUnderstanding =`
- Line 555 · **unknown** · matched `OrganizationalUnderstanding`
  - `params.organizationalUnderstandingOwnershipMode === "legacy"`
- Line 556 · **unknown** · matched `OrganizationalUnderstanding`
  - `? existingOrganizationalUnderstandingState.canonicalCompositions`
- Line 557 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `: buildCanonicalUnderstandingCompatibilityShadow({`
- Line 561 · **unknown** · matched `OrganizationalUnderstanding`
  - `params.organizationalUnderstandingAuthorityMode,`
- Line 563 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.canonicalCompositions,`
- Line 603 · **unknown** · matched `OrganizationalUnderstanding`
  - `const beliefUpdatedOrganizationalUnderstandingState:`
- Line 604 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 605 · **unknown** · matched `OrganizationalUnderstanding`
  - `...updatedOrganizationalUnderstandingState,`
- Line 606 · **unknown** · matched `OrganizationalUnderstanding`
  - `...(canonicalOrganizationalUnderstanding`
- Line 609 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 617 · **unknown** · matched `OrganizationalUnderstanding`
  - `const synthesizedOrganizationalUnderstandingState =`
- Line 618 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 619 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: beliefUpdatedOrganizationalUnderstandingState,`
- Line 626 · **unknown** · matched `OrganizationalUnderstanding`
  - `synthesizedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 917 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 947 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates({`
- Line 959 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 960 · **unknown** · matched `OrganizationalUnderstanding`
  - `...existingOrganizationalUnderstandingState,`
- Line 962 · **unknown** · matched `OrganizationalUnderstanding`
  - `...(canonicalOrganizationalUnderstanding`
- Line 965 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 970 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.currentUnderstandings.filter(`
- Line 982 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding(`
- Line 987 · **unknown** · matched `OrganizationalUnderstanding`
  - `const finalOrganizationalUnderstandingState =`
- Line 988 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 1024 · **unknown** · matched `OrganizationalUnderstanding`
  - `_canonicalCompositionsOwnedByOrganizationalUnderstanding,`
- Line 1026 · **unknown** · matched `OrganizationalUnderstanding`
  - `} = finalOrganizationalUnderstandingState;`
- Line 1030 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.currentUnderstandings.map(`
- Line 1056 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 1057 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1397 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1398 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1484 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1485 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1671 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 1672 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1742 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1743 · **unknown** · matched `OrganizationalUnderstanding`
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
- Line 114 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState: OrganizationalUnderstandingState;`
- Line 321 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 322 · **unknown** · matched `OrganizationalUnderstanding`
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
- Line 84 · **unknown** · matched `OrganizationalUnderstanding`
  - `disclosure: OrganizationalUnderstandingDisclosureResult;`
- Line 147 · **unknown** · matched `organizational-understanding`
  - `owner: "organizational-understanding";`
- Line 167 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingProjection = {`
- Line 230 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 285 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingProjection {`
- Line 302 · **unknown** · matched `organizational-understanding`
  - `projectionId: \`organizational-understanding-projection:${encodeURIComponent(`
- Line 365 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function compileOrganizationalUnderstandingProjection(`
- Line 367 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingProjection {`
- Line 533 · **unknown** · matched `organizational-understanding`
  - `owner: "organizational-understanding",`
- Line 586 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 744 · **unknown** · matched `organizational-understanding`
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

##### `components/product-shell/communication/productUnderstanding.ts`

- Line 407 · **unknown** · matched `OrganizationalUnderstanding`
  - `input.runtime.memory.organizationalUnderstandingState`
- Line 483 · **unknown** · matched `OrganizationalUnderstanding`
  - `input.runtime.memory.organizationalUnderstandingState`

##### `components/product-shell/data/buildActivatedYourOrganizationView.ts`

- Line 2 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingProjection } from "../../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 114 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection;`

##### `components/product-shell/data/buildAskExperienceView.ts`

- Line 101 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `components/product-shell/data/buildDiscoveryExperienceView.ts`

- Line 103 · **unknown** · matched `organizational-understanding`
  - `id: view.insights[0]?.id ?? "authorized-organizational-understanding",`

##### `components/product-shell/data/buildOrganizationExperienceView.ts`

- Line 135 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `components/product-shell/data/buildOrganizationModelContext.ts`

- Line 22 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understanding = record(memory.organizationalUnderstandingState);`

##### `components/product-shell/data/buildResearchExperienceView.ts`

- Line 80 · **unknown** · matched `OrganizationalUnderstanding`
  - `const understandingState = record(memory.organizationalUnderstandingState);`

##### `components/product-shell/data/buildYourOrganizationCommunicationView.ts`

- Line 12 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../../engine/v3/projection/organizationalUnderstandingProjection";`

##### `components/product-shell/data/composeActivatedYourOrganization.ts`

- Line 8 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 9 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingProjection,`
- Line 11 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 72 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions ??`
- Line 92 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding" as const,`
- Line 109 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 127 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 144 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection;`
- Line 164 · **unknown** · matched `OrganizationalUnderstanding`
  - `projection: OrganizationalUnderstandingProjection,`
- Line 217 · **unknown** · matched `OrganizationalUnderstanding`
  - `const projection = compileOrganizationalUnderstandingProjection({`
- Line 227 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions ??`

##### `components/product-shell/data/loadActivatedYourOrganization.ts`

- Line 114 · **unknown** · matched `OrganizationalUnderstanding`
  - `loaded.memory.organizationalUnderstandingState`

##### `components/results/SemanticConceptInspector.tsx`

- Line 23 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime?.memory?.organizationalUnderstandingState?.currentUnderstandings \|\|`

#### API

##### `app/api/discovery-lab/route.ts`

- Line 238 · **unknown** · matched `OrganizationalUnderstanding`
  - `investigation.runtime.memory.organizationalUnderstandingState`

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

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_1_RESULTS.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"validation": "organizational-understanding-evaluator-phase-1",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_2_RESULTS.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"validation": "organizational-understanding-evaluator-phase-2",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_3_RESULTS.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"validation": "organizational-understanding-evaluator-phase-3",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/PHASE_4_RESULTS.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"validation": "organizational-understanding-evaluator-phase-4",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/contracts.ts`

- Line 19 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingProposition = {`
- Line 49 · **unknown** · matched `OrganizationalUnderstanding`
  - `propositions: OrganizationalUnderstandingProposition[];`
- Line 165 · **unknown** · matched `OrganizationalUnderstanding`
  - `groundTruth: OrganizationalUnderstandingProposition[];`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/deterministicScoring.ts`

- Line 2 · **import** · matched `OrganizationalUnderstanding`
  - `import type { EvaluationDimension, EvaluationLedger, OrganizationalUnderstandingProposition, RecoveredProposition, SemanticAdjudication } from "./contracts";`
- Line 25 · **unknown** · matched `OrganizationalUnderstanding`
  - `const importance = (item: OrganizationalUnderstandingProposition) => (item.importance + item.decisionRelevance) / 2;`
- Line 37 · **unknown** · matched `OrganizationalUnderstanding`
  - `const familyRows = (family: OrganizationalUnderstandingProposition["family"]) => input.source.groundTruth.propositions.filter((item) => item.family === family).map((item) => ({ credit: byGroundTruth.has(item.id) ? credit(byGroundTruth.get(item.id)!) : 0, weight: importance(item), ref: item.id }));`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/frozenSemantics.ts`

- Line 31 · **unknown** · matched `organizational-understanding`
  - `version: "organizational-understanding-semantics/v1",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/generateSemanticCandidates.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingProposition, RecoveredProposition } from "./contracts";`
- Line 30 · **unknown** · matched `OrganizationalUnderstanding`
  - `const normalizedStructure = (item: OrganizationalUnderstandingProposition) => canonicalHash({ family: item.family, subjectRefs: [...item.subjectRefs].sort(), predicate: item.predicate, objectRefs: [...item.objectRefs].sort(), polarity: item.polarity, modality: item.modality, temporality: item.temporality, supportingEvidenceRefs: [...item.supportingEvidenceRefs].sort(), opposingEvidenceRefs: [...item.opposingEvidenceRefs].sort(), contradictionEndpointRefs: [...item.contradictionEndpointRefs].sort(), competingPropositionRefs: [...item.competingPropositionRefs].sort(), authorizationScope: [...item.authorizationScope].sort() });`
- Line 31 · **unknown** · matched `OrganizationalUnderstanding`
  - `const canonicalTruth = (item: OrganizationalUnderstandingProposition) => ({ ...item, subjectRefs: [...item.subjectRefs].sort(), objectRefs: [...item.objectRefs].sort(), supportingEvidenceRefs: [...item.supportingEvidenceRefs].sort(), opposingEvidenceRefs: [...item.opposingEvidenceRefs].sort(), contradictionEndpointRefs: [...item.contradictionEndpointRefs].sort(), competingPropositionRefs: [...item.competingPropositionRefs].sort(), authorizationScope: [...item.authorizationScope].sort(), allowedEquivalentMeanings: [...item.allowedEquivalentMeanings].sort(), prohibitedInterpretations: [...item.prohibitedInterpretations].sort() });`
- Line 33 · **unknown** · matched `OrganizationalUnderstanding`
  - `export const phase3GroundTruthGraphHash = (items: OrganizationalUnderstandingProposition[]) => canonicalHash([...items].map(canonicalTruth).sort((a, b) => a.id.localeCompare(b.id)));`
- Line 36 · **unknown** · matched `OrganizationalUnderstanding`
  - `function collapseGroundTruth(items: OrganizationalUnderstandingProposition[]) {`
- Line 37 · **unknown** · matched `OrganizationalUnderstanding`
  - `const retained: OrganizationalUnderstandingProposition[] = [];`
- Line 38 · **unknown** · matched `OrganizationalUnderstanding`
  - `const byStructure = new Map<string, OrganizationalUnderstandingProposition>();`
- Line 85 · **unknown** · matched `OrganizationalUnderstanding`
  - `function structuralEligibility(recovered: RecoveredProposition, truth: OrganizationalUnderstandingProposition) {`
- Line 146 · **unknown** · matched `organizational-understanding`
  - `const receiptContent = { evaluatorId: "organizational-understanding-evaluator-001" as const, structuralEvaluatorVersion: "oue-001-phase-2-structural/v1" as const, structuralComparisonVersion: STRUCTURAL_COMPARISON_VERSION, familyCompatibilityVersion: FAMILY_COMPATIBILITY_VERSION, duplicateCollapseVersion: DUPLICATE_COLLAPSE_VERSION, valid: true as const, organizationId: input.groundTruth.organizationId, caseId: input.groundTruth.caseId, recoveredGraphHash, groundTruthGraphHash };`
- Line 148 · **unknown** · matched `organizational-understanding`
  - `return { inputVersion: PHASE_3_INPUT_VERSION, evaluatorId: "organizational-understanding-evaluator-001", organizationId: input.groundTruth.organizationId, caseId: input.groundTruth.caseId, activeAuthorizationScopes: input.activeAuthorizationScopes, groundTruth: { ...input.groundTruth, graphHash: groundTruthGraphHash }, collapsedRecovered, structuralReceipt: { ...receiptContent, receiptId: \`phase2-structural-${receiptHash.slice(0, 24)}\`, receiptHash }, configuration: { version: PHASE_3_CONFIGURATION_VERSION, maximumCandidatesPerRecovered: input.maximumCandidates ?? 10, minimumFeatureScore: 0 }, preregistrationVersion: PHASE_3_PREREGISTRATION_VERSION, preregistrationHash: canonicalHash({ compatibilityOnly: true, version: PHASE_3_PREREGISTRATION_VERSION }), corpusSplitVersion: PHASE_3_CORPUS_SPLIT_VERSION, corpusSplitHash: canonicalHash({ compatibilityOnly: true, version: PHASE_3_CORPUS_SPLIT_VERSION }), evaluatedAt: "2026-07-31T12:00:00.000Z" };`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase2ValidationFixtures.ts`

- Line 2 · **import** · matched `OrganizationalUnderstanding`
  - `import type { GroundTruthPropositionGraph, OrganizationalUnderstandingProposition, RecoveredProposition, RecoveredPropositionGraph, SemanticAdjudication } from "./contracts";`
- Line 9 · **unknown** · matched `OrganizationalUnderstanding`
  - `const mechanismTwo: OrganizationalUnderstandingProposition = {`
- Line 32 · **unknown** · matched `OrganizationalUnderstanding`
  - `const recoveredIdFor = (item: OrganizationalUnderstandingProposition) => \`recovered-${item.id}\`;`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase3CandidateFixtures.ts`

- Line 19 · **unknown** · matched `organizational-understanding`
  - `const content = { evaluatorId: "organizational-understanding-evaluator-001" as const, structuralEvaluatorVersion: "oue-001-phase-2-structural/v1" as const, structuralComparisonVersion: STRUCTURAL_COMPARISON_VERSION, familyCompatibilityVersion: FAMILY_COMPATIBILITY_VERSION, duplicateCollapseVersion: DUPLICATE_COLLAPSE_VERSION, valid: true as const, organizationId, caseId, recoveredGraphHash: recoveredHash, groundTruthGraphHash: groundTruthHash };`
- Line 30 · **unknown** · matched `organizational-understanding`
  - `evaluatorId: "organizational-understanding-evaluator-001",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase3Contracts.ts`

- Line 3 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingProposition,`
- Line 25 · **unknown** · matched `organizational-understanding`
  - `evaluatorId: "organizational-understanding-evaluator-001";`
- Line 41 · **unknown** · matched `organizational-understanding`
  - `evaluatorId: "organizational-understanding-evaluator-001";`
- Line 69 · **unknown** · matched `OrganizationalUnderstanding`
  - `propositionFamily: OrganizationalUnderstandingProposition["family"];`
- Line 156 · **unknown** · matched `OrganizationalUnderstanding`
  - `candidateCountByFamily: Record<OrganizationalUnderstandingProposition["family"], number>;`
- Line 173 · **unknown** · matched `OrganizationalUnderstanding`
  - `propositions: OrganizationalUnderstandingProposition[];`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/RESULTS.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"validation": "organizational-understanding-evaluator-phase-4-protocol-infrastructure-001",`
- Line 31 · **unknown** · matched `organizational-understanding`
  - `"phase3ResultIdentity": "organizational-understanding-evaluator-phase-3/authoritative-result",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/contracts.ts`

- Line 22 · **unknown** · matched `organizational-understanding`
  - `export const EVALUATOR_ID = "organizational-understanding-evaluator-001" as const;`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/phase4InfrastructureFixtures.ts`

- Line 35 · **unknown** · matched `organizational-understanding`
  - `evaluatorId: "organizational-understanding-evaluator-001",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-protocol-infrastructure-001/validatePhase4ProtocolInfrastructure001.ts`

- Line 139 · **unknown** · matched `organizational-understanding`
  - `const ledgerBody = { ledgerVersion: INFRASTRUCTURE_LEDGER_VERSION, infrastructureVersion: PHASE_4_INFRASTRUCTURE_VERSION, componentVersions, canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION, protocolDocumentIdentity: "PHASE_4_SEMANTIC_ADJUDICATION_PROTOCOL.md@6ded90823361678c706048b555199ec265f80732", protocolDocumentHash, preregistrationDocumentIdentity: "PHASE_4_SEMANTIC_ADJUDICATION_PREREGISTRATION.md@6ded90823361678c706048b555199ec265f80732", preregistrationDocumentHash, phase3ResultIdentity: "organizational-understanding-evaluator-phase-3/authoritative-result", phase3ResultHash: PHASE_3_AUTHORITATIVE_RESULT_HASH, fixtureClassification: CONTROLLED_FIXTURE_CLASSIFICATION, validatorVersion: "oue-001-phase-4-protocol-validator/v1", scenarioCount: 44, safetyGateResults: { labelLeakage: "pass", unsafeDraftIsolation: "pass", productIsolation: "pass", scoreActivation: "pass", externalAction: "pass" }, prohibitedOperations: { genuineHumanReviews: 0, genuineModelReviews: 0, genuineSemanticAdjudications: 0, genuineGoldLabels: 0, phase2ScoreActivations: 0, externalComparativeValidationExecutions: 0, productActivations: 0, productionActivations: 0, externalActions: 0 } };`
- Line 146 · **unknown** · matched `organizational-understanding`
  - `const result = { validation: "organizational-understanding-evaluator-phase-4-protocol-infrastructure-001", classification: "A — PHASE 4 DETERMINISTIC PROTOCOL INFRASTRUCTURE VALIDATED", ...ledgerBody, ledgerHash, infrastructureResultHash, scenarioCount: checks.length, checks, failures: [], studyExecutionAuthorized: false, phase4AdjudicationAuthorized: false, phase5Authorized: false, externalComparativeValidation002Authorized: false };`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-study-operations-readiness-001/RESULTS.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"validation": "organizational-understanding-evaluator-phase-4-study-operations-readiness-001",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase4-study-operations-readiness-001/validatePhase4StudyOperationsReadiness001.ts`

- Line 212 · **unknown** · matched `organizational-understanding`
  - `validation: "organizational-understanding-evaluator-phase-4-study-operations-readiness-001",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase5/EXECUTION_INSTRUCTIONS.md`

- Line 3 · **unknown** · matched `organizational-understanding`
  - `1. Run \`npm run validate:organizational-understanding-evaluator-phase-5\` before`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase5/generated/PHASE_5_RESULTS.json`

- Line 2 · **unknown** · matched `organizational-understanding`
  - `"validation": "organizational-understanding-evaluator-phase-5",`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/phase5/validatePhase5HumanStudy.ts`

- Line 51 · **unknown** · matched `organizational-understanding`
  - `const result = { validation: "organizational-understanding-evaluator-phase-5", classification: failures.length ? "BLOCKED" : classification, genuineHumanResponsesAvailable: false, genuineAgreementResults: null, humanGoldSetEligible: false, liveModelAdjudicatorDevelopmentAuthorized: false, externalComparativeValidation002Authorized: false, checks, failures, infrastructureMetrics: { packetIntegrity: 1, importRejection: 1, perfectAgreementFixture: perfect.exactAgreement, systematicDisagreementDetection: systematic.exactAgreement === 0 ? 1 : 0, orderInvariance: 1, syntheticGoldAdmission: 0 }, ledger };`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/retrievalSignals.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingProposition, RecoveredProposition } from "./contracts";`
- Line 16 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function collectPhase3Features(recovered: RecoveredProposition, truth: OrganizationalUnderstandingProposition): Phase3FeatureObservation[] {`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/structuralValidation.ts`

- Line 1 · **import** · matched `OrganizationalUnderstanding`
  - `import type { EvaluationGateFailure, OrganizationalUnderstandingProposition, RecoveredProposition } from "./contracts";`
- Line 18 · **unknown** · matched `OrganizationalUnderstanding`
  - `const propositionRefs = (item: OrganizationalUnderstandingProposition) => [...item.contradictionEndpointRefs, ...item.competingPropositionRefs];`
- Line 111 · **unknown** · matched `OrganizationalUnderstanding`
  - `function validateGroundTruthIntegrity(item: OrganizationalUnderstandingProposition, byId: Map<string, OrganizationalUnderstandingProposition>, add: (code: Phase2FailureCode, detail: string, refs?: string[]) => void) {`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase1Architecture.ts`

- Line 40 · **unknown** · matched `organizational-understanding`
  - `const result = { validation: "organizational-understanding-evaluator-phase-1", classification: failed.length ? "FAIL — Phase 1 architecture incomplete" : "PASS — Phase 1 architecture complete; evaluator inactive", evaluatorVersion: ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION, checks, failures: failed, liveSemanticAdjudicatorImplemented: false, externalComparativeValidation002Executed: false, externalComparativeValidation002Authorized: false };`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase2StructuralEvaluator.ts`

- Line 103 · **unknown** · matched `organizational-understanding`
  - `const result = { validation: "organizational-understanding-evaluator-phase-2", classification, metrics: metricResults, summaryMetrics, checks, failures, hardGateFailures, compositeScoreActivation: "active only for structurally valid completed imported adjudications", semanticRecoveryImplemented: false, semanticCandidateGenerationImplemented: false, liveSemanticAdjudicatorImplemented: false, humanReviewExecuted: false, externalComparativeValidation002Executed: false, externalComparativeValidation002Authorized: false, phase3Authorized: failures.length === 0 };`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase3CandidateGeneration.ts`

- Line 17 · **unknown** · matched `organizational-understanding`
  - `const content = { evaluatorId: "organizational-understanding-evaluator-001" as const, structuralEvaluatorVersion: "oue-001-phase-2-structural/v1" as const, structuralComparisonVersion: STRUCTURAL_COMPARISON_VERSION, familyCompatibilityVersion: FAMILY_COMPATIBILITY_VERSION, duplicateCollapseVersion: DUPLICATE_COLLAPSE_VERSION, valid: true as const, organizationId: input.organizationId, caseId: input.caseId, recoveredGraphHash: phase3RecoveredGraphHash(input.collapsedRecovered.treatmentRunId, input.collapsedRecovered.propositions), groundTruthGraphHash: input.groundTruth.graphHash };`
- Line 96 · **unknown** · matched `organizational-understanding`
  - `const result = { validation: "organizational-understanding-evaluator-phase-3", classification, preregistrationVersion: "oue-001-phase-3-preregistration/v1", corpusSplitHash: canonicalHash(phase3CorpusSplitManifest), metrics, checks, failures, semanticAdjudicationImplemented: false, humanReviewExecuted: false, externalComparativeValidation002Authorized: false, phase4Authorized: false };`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase4ImportedAdjudication.ts`

- Line 91 · **unknown** · matched `organizational-understanding`
  - `const result = { validation: "organizational-understanding-evaluator-phase-4", classification, metrics, checks, failures, liveSemanticAdjudicatorImplemented: false, humanReviewExecuted: false, externalComparativeValidation002Executed: false, liveOrHumanAdjudicatorDevelopmentAuthorized: failures.length === 0, externalComparativeValidation002Authorized: false };`

##### `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validationFixtures.ts`

- Line 2 · **import** · matched `OrganizationalUnderstanding`
  - `import type { GroundTruthPropositionGraph, OrganizationalUnderstandingProposition, RecoveredProposition, RecoveredPropositionGraph, SemanticAdjudication } from "./contracts";`
- Line 6 · **unknown** · matched `OrganizationalUnderstanding`
  - `const proposition = (input: Partial<OrganizationalUnderstandingProposition> & Pick<OrganizationalUnderstandingProposition, "id" \| "family" \| "canonicalMeaning" \| "predicate">): OrganizationalUnderstandingProposition => ({`
- Line 12 · **unknown** · matched `OrganizationalUnderstanding`
  - `const groundTruthPropositions: OrganizationalUnderstandingProposition[] = [`

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

##### `engine/benchmark/product-communication/structuredProductCommunicationShadow.ts`

- Line 14 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingProjection,`
- Line 16 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../v3/projection/organizationalUnderstandingProjection";`
- Line 32 · **unknown** · matched `OrganizationalUnderstanding`
  - `function projection(): OrganizationalUnderstandingProjection {`
- Line 46 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 159 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 164 · **unknown** · matched `organizational-understanding`
  - `owner: "organizational-understanding",`
- Line 231 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 235 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 243 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 264 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 280 · **unknown** · matched `OrganizationalUnderstanding`
  - `} as unknown as OrganizationalUnderstandingProjection;`
- Line 338 · **unknown** · matched `OrganizationalUnderstanding`
  - `value: OrganizationalUnderstandingProjection,`
- Line 339 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingProjection {`
- Line 664 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingProjection["conditions"][number]["value"]`

##### `engine/benchmark/research/ORGANIZATIONAL_UNDERSTANDING_RESEARCH_FRAMEWORK.md`

- Line 369 · **type** · matched `OrganizationalUnderstanding`
  - `interface OrganizationalUnderstandingExperimentResult {`
- Line 404 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: "++" \| "+" \| "=" \| "-" \| "--" \| "?";`

##### `engine/benchmark/research/README.md`

- Line 104 · **unknown** · matched `organizational-understanding`
  - `This Phase 0 harness compares observable organizational-understanding quality`
- Line 146 · **unknown** · matched `organizational-understanding`
  - `../evaluator/organizational-understanding-evaluator-001/`

##### `engine/benchmark/research/external-comparative-validation-001/README.md`

- Line 9 · **unknown** · matched `organizational-understanding`
  - `This experiment compares externally observable organizational-understanding`

##### `engine/benchmark/research/external-comparative-validation-001/RESULTS.json`

- Line 13741 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 13758 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8109580952380951,`
- Line 13784 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8109580952380951,`
- Line 13810 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8641830952380952,`
- Line 13836 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 13853 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8979385714285715,`
- Line 13879 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8979385714285715,`
- Line 13905 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9488814285714287,`
- Line 13931 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5766845817868224,`
- Line 13959 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5576796933332392,`
- Line 13987 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14004 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.7398404761904762,`
- Line 14030 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.7398404761904762,`
- Line 14056 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5940987878787879,`
- Line 14084 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14101 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9043399999999999,`
- Line 14127 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9043399999999999,`
- Line 14153 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.7564985714285714,`
- Line 14181 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.328285247425752,`
- Line 14210 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.44107426670317107,`
- Line 14239 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14256 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8870833333333334,`
- Line 14282 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8870833333333334,`
- Line 14308 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8932500000000001,`
- Line 14334 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14351 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.4990533333333333,`
- Line 14377 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.4990533333333333,`
- Line 14403 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5392261538461539,`
- Line 14429 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5172157824703445,`
- Line 14458 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5844440456593732,`
- Line 14486 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14503 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.43403,`
- Line 14531 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.43403,`
- Line 14559 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.26666666666666666,`
- Line 14587 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14604 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9297733333333333,`
- Line 14630 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9297733333333333,`
- Line 14656 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.95896,`
- Line 14682 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.3439906037399676,`
- Line 14711 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6321191084958704,`
- Line 14739 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14756 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.66401,`
- Line 14782 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.66401,`
- Line 14808 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5982457142857143,`
- Line 14834 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 14851 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8741866666666666,`
- Line 14877 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8741866666666666,`
- Line 14903 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8719933333333332,`
- Line 14929 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5703712485465036,`
- Line 14957 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6056108870166619,`
- Line 14985 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15002 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.66275,`
- Line 15028 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.66275,`
- Line 15054 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5765833333333333,`
- Line 15080 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15097 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.7647499999999999,`
- Line 15123 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.7647499999999999,`
- Line 15149 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6522291666666666,`
- Line 15175 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5277038381500575,`
- Line 15203 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6427698819592162,`
- Line 15231 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15248 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.68375,`
- Line 15274 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.68375,`
- Line 15300 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8856116666666667,`
- Line 15326 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15343 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6457499999999999,`
- Line 15371 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.69175,`
- Line 15397 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8562896703296703,`
- Line 15423 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5007542397453438,`
- Line 15451 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5586920738239283,`
- Line 15479 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15496 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.61875,`
- Line 15522 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.61875,`
- Line 15548 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6231041666666666,`
- Line 15574 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15591 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.74625,`
- Line 15617 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.74625,`
- Line 15643 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.7156041666666667,`
- Line 15669 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5221399912798775,`
- Line 15697 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5356382595823925,`
- Line 15725 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15742 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5573866666666667,`
- Line 15770 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5573866666666667,`
- Line 15798 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.509534,`
- Line 15826 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15843 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.752382857142857,`
- Line 15869 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.752382857142857,`
- Line 15895 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.754705,`
- Line 15921 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.47174799146550894,`
- Line 15950 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6155269709006882,`
- Line 15978 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 15995 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9170833333333334,`
- Line 16021 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9170833333333334,`
- Line 16047 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.91825,`
- Line 16073 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 16090 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9004166666666668,`
- Line 16116 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9004166666666668,`
- Line 16142 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.86825,`
- Line 16168 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.4663684118891595,`
- Line 16197 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.38486657518867845,`
- Line 16265 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 16282 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.61875,`
- Line 16308 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.61875,`
- Line 16334 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.6231041666666666,`
- Line 16360 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 16377 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.74625,`
- Line 16403 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.74625,`
- Line 16429 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.7156041666666667,`
- Line 16455 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5221399912798775,`
- Line 16483 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.5356382595823925,`
- Line 16511 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 16528 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9170833333333334,`
- Line 16554 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9170833333333334,`
- Line 16580 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.91825,`
- Line 16606 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": null,`
- Line 16623 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9004166666666668,`
- Line 16649 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9004166666666668,`
- Line 16675 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.86825,`
- Line 16701 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.4663684118891595,`
- Line 16730 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.38486657518867845,`

##### `engine/benchmark/research/external-comparative-validation-001/evaluate.ts`

- Line 31 · **unknown** · matched `OrganizationalUnderstanding`
  - `comparativeOrganizationalUnderstandingUtility: null, components: null, unsupportedAssertionRate: null,`
- Line 74 · **unknown** · matched `OrganizationalUnderstanding`
  - `comparativeOrganizationalUnderstandingUtility: composite, components, unsupportedAssertionRate,`

##### `engine/benchmark/research/external-comparative-validation-001/runExternalComparativeValidation001.ts`

- Line 22 · **unknown** · matched `OrganizationalUnderstanding`
  - `const evaluative = scores.filter((score) => score.treatmentId === treatmentId && score.evaluative && score.comparativeOrganizationalUnderstandingUtility !== null);`
- Line 23 · **unknown** · matched `OrganizationalUnderstanding`
  - `const values = evaluative.map((score) => score.comparativeOrganizationalUnderstandingUtility!);`

##### `engine/benchmark/research/external-comparative-validation-001/treatments.ts`

- Line 3 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 130 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime = evolveOrganizationRuntime({ runtime, result, input: { company: scenario.title, website: "benchmark.invalid", industry: scenario.industry, question: scenario.question, context } });`

##### `engine/benchmark/research/external-comparative-validation-001/types.ts`

- Line 104 · **unknown** · matched `OrganizationalUnderstanding`
  - `comparativeOrganizationalUnderstandingUtility: number \| null;`

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

##### `engine/benchmark/research/scoring-robustness-validation-001/RESULTS.json`

- Line 57 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.834537922077922,`
- Line 93 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9693561038961039,`
- Line 129 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 165 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 201 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 237 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8947673593073593,`
- Line 273 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9,`
- Line 309 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9899711111111111,`
- Line 345 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 381 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 417 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8965379220779222,`
- Line 453 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9423864069264071,`
- Line 489 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9742478787878789,`
- Line 525 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 561 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9922413333333333,`
- Line 597 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 633 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9909145454545455,`
- Line 669 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9534145454545454,`
- Line 705 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.953374,`
- Line 741 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.970005,`
- Line 777 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9432954978354979,`
- Line 815 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.834537922077922,`
- Line 851 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9693561038961039,`
- Line 887 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8947673593073593,`
- Line 923 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9,`
- Line 959 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9899711111111111,`
- Line 995 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.8965379220779222,`
- Line 1031 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9423864069264071,`
- Line 1067 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9742478787878789,`
- Line 1103 · **unknown** · matched `OrganizationalUnderstanding`
  - `"comparativeOrganizationalUnderstandingUtility": 0.9922413333333333,`

##### `engine/benchmark/research/scoring-robustness-validation-001/validateScoringRobustness001.ts`

- Line 9 · **unknown** · matched `OrganizationalUnderstanding`
  - `const score = (value: ReturnType<typeof evaluateOutput>) => value.comparativeOrganizationalUnderstandingUtility ?? Number.NaN;`

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

##### `scripts/product/capabilitySurvivalManifest.ts`

- Line 27 · **unknown** · matched `CAP-UND-006`
  - `\| "CAP-UND-006"`
- Line 103 · **unknown** · matched `CAP-UND-006`
  - `capabilityId: "CAP-UND-006",`
- Line 231 · **unknown** · matched `organizational-understanding`
  - `"validate:organizational-understanding-projection-shadow",`

##### `scripts/product/validateAlphaAllowlistDisclosureProducerShadow.ts`

- Line 32 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 34 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 43 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow,`
- Line 45 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 189 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const compositions = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 807 · **unknown** · matched `OrganizationalUnderstanding`
  - `const projection = compileOrganizationalUnderstandingProjection({`

##### `scripts/product/validateAlphaYourOrganizationActivation.ts`

- Line 23 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import { buildCanonicalUnderstandingCompatibilityShadow } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 100 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const compositions = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 139 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions =`
- Line 299 · **unknown** · matched `OrganizationalUnderstanding`
  - `missingProjectionRuntime.memory.organizationalUnderstandingState`

##### `scripts/product/validateAskExperience.ts`

- Line 58 · **unknown** · matched `OrganizationalUnderstanding`
  - `sparse.memory.organizationalUnderstandingState.currentUnderstandings = [];`

##### `scripts/product/validateCanonicalProductComposition.ts`

- Line 14 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 16 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 143 · **unknown** · matched `organizational-understanding`
  - `"organizational-understanding",`
- Line 308 · **unknown** · matched `OrganizationalUnderstanding`
  - `const authorityFailure = compileOrganizationalUnderstandingProjection({`

##### `scripts/product/validateCapabilitySurvival.ts`

- Line 21 · **unknown** · matched `CAP-UND-006`
  - `"CAP-UND-006",`

##### `scripts/product/validateEvidenceRoles.ts`

- Line 11 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 88 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`

##### `scripts/product/validateLeadCoherentUnderstanding.ts`

- Line 11 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 12 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 204 · **unknown** · matched `OrganizationalUnderstanding`
  - `const mismatch = compileOrganizationalUnderstandingProjection({`
- Line 227 · **unknown** · matched `OrganizationalUnderstanding`
  - `const revoked = compileOrganizationalUnderstandingProjection({`

##### `scripts/product/validateLivingInteractionLoop.ts`

- Line 18 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.health.coherence = 0.68;`
- Line 19 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{`

##### `scripts/product/validateOnboardingEvidenceExperience.ts`

- Line 15 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 38 · **unknown** · matched `evolveOrganizationRuntime`
  - `return evolveOrganizationRuntime({`

##### `scripts/product/validateOnboardingInvestigationIdempotency.ts`

- Line 109 · **unknown** · matched `OrganizationalUnderstanding`
  - `exactReplay.runtime.memory.organizationalUnderstandingState`
- Line 111 · **unknown** · matched `OrganizationalUnderstanding`
  - `firstRuntime.memory.organizationalUnderstandingState`

##### `scripts/product/validateOnboardingToAlphaReplay.ts`

- Line 21 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 89 · **unknown** · matched `evolveOrganizationRuntime`
  - `function canonicalSummary(input: ReturnType<typeof evolveOrganizationRuntime>) {`
- Line 98 · **unknown** · matched `OrganizationalUnderstanding`
  - `input.memory.organizationalUnderstandingState.canonicalCompositions?.map(`
- Line 163 · **unknown** · matched `evolveOrganizationRuntime`
  - `const evolved = evolveOrganizationRuntime({`
- Line 181 · **unknown** · matched `OrganizationalUnderstanding`
  - `evolved.memory.organizationalUnderstandingState.canonicalCompositions ?? [];`
- Line 244 · **unknown** · matched `evolveOrganizationRuntime`
  - `const replay = evolveOrganizationRuntime({`
- Line 255 · **unknown** · matched `evolveOrganizationRuntime`
  - `const insufficient = evolveOrganizationRuntime({`
- Line 262 · **unknown** · matched `OrganizationalUnderstanding`
  - `insufficient.memory.organizationalUnderstandingState`

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

##### `scripts/product/validateProductUnderstandingTranslation.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 27 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 36 · **unknown** · matched `evolveOrganizationRuntime`
  - `const runtime = evolveOrganizationRuntime({`
- Line 114 · **unknown** · matched `OrganizationalUnderstanding`
  - `sales.runtime.memory.organizationalUnderstandingState.canonicalCompositions`

##### `scripts/product/validateResearchExperience.ts`

- Line 55 · **unknown** · matched `OrganizationalUnderstanding`
  - `missingEvidence.memory.organizationalUnderstandingState.currentUnderstandings = [{`
- Line 71 · **unknown** · matched `OrganizationalUnderstanding`
  - `none.memory.organizationalUnderstandingState.currentUnderstandings = [];`

##### `scripts/product/validateTruthfulUtility.ts`

- Line 13 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 27 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 97 · **unknown** · matched `evolveOrganizationRuntime`
  - `let runtime: ReturnType<typeof evolveOrganizationRuntime>;`
- Line 100 · **unknown** · matched `evolveOrganizationRuntime`
  - `runtime = evolveOrganizationRuntime({`

##### `scripts/product/validateUnifiedExecutiveWorkspace.ts`

- Line 12 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.health.coherence = .64;`
- Line 13 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{ id: "understanding-1", statement: "Decision ownership ambiguity is slowing execution.", summary: "Clarifying who decides could unlock capacity.", confidence: .73, observationIds: [], missingInformation: [], openQuestions: [], evidenceIds: [], beliefIds: [], themeIds: [], mechanismIds: [], contradictionIds: [], recommendationIds: [], supportingDynamics: [], supportingCapabilities: [], investigationIds: [], implications: [], history: [] } as never];`

##### `scripts/product/validateWhatChangedAndWhy.ts`

- Line 24 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 27 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 32 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow,`
- Line 33 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 35 · **unknown** · matched `OrganizationalUnderstanding`
  - `discloseCanonicalOrganizationalUnderstanding,`
- Line 36 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingDisclosureDecision,`
- Line 37 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 82 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const compositions = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 90 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition: OrganizationalUnderstandingDisclosureDecision["disposition"],`
- Line 91 · **unknown** · matched `OrganizationalUnderstanding`
  - `): OrganizationalUnderstandingDisclosureDecision {`
- Line 104 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition?: OrganizationalUnderstandingDisclosureDecision["disposition"];`
- Line 107 · **unknown** · matched `OrganizationalUnderstanding`
  - `const disclosure = discloseCanonicalOrganizationalUnderstanding({`
- Line 113 · **unknown** · matched `OrganizationalUnderstanding`
  - `return compileOrganizationalUnderstandingProjection({`
- Line 154 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions = [{`
- Line 253 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`

##### `scripts/product/validateWhyDiscoveryBelievesThis.ts`

- Line 77 · **unknown** · matched `organizational-understanding`
  - `"organizational-understanding",`
- Line 227 · **unknown** · matched `CAP-UND-006`
  - `capabilityIds: ["CAP-UND-006", "CAP-SELF-001", "CAP-SELF-002", "CAP-COM-001"],`

##### `scripts/product/validateWhyThisEvidenceMatters.ts`

- Line 25 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 27 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 32 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `buildCanonicalUnderstandingCompatibilityShadow,`
- Line 33 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 35 · **unknown** · matched `OrganizationalUnderstanding`
  - `discloseCanonicalOrganizationalUnderstanding,`
- Line 36 · **type** · matched `OrganizationalUnderstanding`
  - `type OrganizationalUnderstandingDisclosureDecision,`
- Line 37 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 82 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `const compositions = buildCanonicalUnderstandingCompatibilityShadow({`
- Line 134 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition: OrganizationalUnderstandingDisclosureDecision["disposition"] =`
- Line 137 · **unknown** · matched `OrganizationalUnderstanding`
  - `return discloseCanonicalOrganizationalUnderstanding({`
- Line 155 · **unknown** · matched `OrganizationalUnderstanding`
  - `disposition?: OrganizationalUnderstandingDisclosureDecision["disposition"];`
- Line 158 · **unknown** · matched `OrganizationalUnderstanding`
  - `return compileOrganizationalUnderstandingProjection({`
- Line 237 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions =`
- Line 338 · **unknown** · matched `OrganizationalUnderstanding`
  - `const ambiguousConditionProjection = compileOrganizationalUnderstandingProjection({`
- Line 436 · **unknown** · matched `CAP-UND-006`
  - `"CAP-UND-006",`

##### `scripts/product/validateYourOrganizationCommunicationAdapter.ts`

- Line 40 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding" as const,`
- Line 309 · **unknown** · matched `organizational-understanding`
  - `check(() => assert.ok(view.support.some((item) => item.subjectRef.objectType === "organizational-understanding")));`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
