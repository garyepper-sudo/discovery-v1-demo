# Capability Trace — Executive Understanding Synthesis

Generated: 2026-08-13T21:50:24.899Z

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
- `components/role-aware/RoleAwareExperience.tsx`
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
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/retrievalSignals.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/structuralValidation.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase1Architecture.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase2StructuralEvaluator.ts`
- `engine/benchmark/evaluator/organizational-understanding-evaluator-001/validatePhase3CandidateGeneration.ts`
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
- `engine/benchmark/multi-role-scoped-understanding-governance-001/runBenchmark.ts`
- `engine/benchmark/operating-model-evolution-lab/productionReplay.ts`
- `engine/benchmark/organizational-intelligence-lab/runOrganizationalIntelligenceLab.ts`
- `engine/benchmark/organizationalUnderstandingScorer.ts`
- `engine/benchmark/product-communication/structuredProductCommunicationShadow.ts`
- `engine/benchmark/product-governance/canonical-understanding-recipient-scope-nested-disclosure-001/runBenchmark.ts`
- `engine/benchmark/product-governance/recipient-audience-scope-governance-contract-001/runBenchmark.ts`
- `engine/benchmark/research/ORGANIZATIONAL_UNDERSTANDING_RESEARCH_FRAMEWORK.md`
- `engine/benchmark/research/README.md`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/RESULT.json`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/runLocalizedNonlinearResearchAdapter.ts`
- `engine/benchmark/research/localized-nonlinear-cognition-adapter/types.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/runtime/executiveMeaningPreservation001.ts`
- `engine/benchmark/stress/experiments/decisionIntelligenceStressExperiment001.ts`
- `engine/conversation/OpenAIConversationInterpreter.ts`
- `engine/v3/communication/productCommunicationPlan.ts`
- `engine/v3/executive/buildExecutiveChangeSummary.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/governance/alphaAllowlistDisclosureProducer.ts`
- `engine/v3/governance/authorizedMetricLineage.ts`
- `engine/v3/governance/fieldAudienceRequirement.ts`
- `engine/v3/governance/recipientAudienceScope.ts`
- `engine/v3/governance/scopedGovernanceContext.ts`
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
- `engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService.ts`
- `engine/v3/understanding/canonicalUnderstanding.ts`
- `engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts`
- `engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage.ts`
- `engine/v3/understanding/rankOrganizationalUnderstanding.ts`
- `engine/v3/understanding/resolveCanonicalOrganizationalUnderstandingChange.ts`
- `scripts/cognition/generateArchitectureHandoff.mjs`
- `scripts/cognition/generateArchitectureState.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`
- `scripts/development/reconstructNorthstarRuntime.ts`
- `scripts/product/buildGoogleDriveCumulativeParityDiagnostic.ts`
- `scripts/product/capabilitySurvivalManifest.ts`
- `scripts/product/historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator.ts`
- `scripts/product/validateAlphaAllowlistDisclosureProducerShadow.ts`
- `scripts/product/validateAlphaYourOrganizationActivation.ts`
- `scripts/product/validateAskExperience.ts`
- `scripts/product/validateAuthorizedMetricLineageAndScopedProjection.ts`
- `scripts/product/validateCanonicalEvidenceContributionResult.ts`
- `scripts/product/validateCanonicalEvidenceContributionResultReplay.ts`
- `scripts/product/validateCanonicalExplanationGovernanceLineage.ts`
- `scripts/product/validateCanonicalMaterialEvidenceOrigin.ts`
- `scripts/product/validateCanonicalMaterialEvidenceOriginFreshProcess.ts`
- `scripts/product/validateCanonicalOrganizationalUnderstandingChangeResult.ts`
- `scripts/product/validateCanonicalOrganizationalUnderstandingChangeResultFreshProcess.ts`
- `scripts/product/validateCanonicalProductComposition.ts`
- `scripts/product/validateCanonicalScopeLineage.ts`
- `scripts/product/validateCanonicalUnderstandingAudienceLineageForwardProducer.ts`
- `scripts/product/validateCanonicalUnderstandingConfidenceRevision.ts`
- `scripts/product/validateCanonicalUnderstandingConfidenceRevisionFreshProcess.ts`
- `scripts/product/validateCanonicalUnderstandingCurrentEligibility.ts`
- `scripts/product/validateCapabilitySurvival.ts`
- `scripts/product/validateCrossInvestigationEvidenceAdmissionIdentity.ts`
- `scripts/product/validateCrossOperationCanonicalEvidenceAncestryFreshProcess.ts`
- `scripts/product/validateDuplicateEvidenceReplayAwareCognitionEntry.ts`
- `scripts/product/validateDuplicateEvidenceReplayAwareCognitionFreshProcessRole.ts`
- `scripts/product/validateEvidenceRoles.ts`
- `scripts/product/validateLeadCoherentUnderstanding.ts`
- `scripts/product/validateLeadershipConversationActualOwnerRouting.ts`
- `scripts/product/validateLeadershipConversationReplay.ts`
- `scripts/product/validateLivingInteractionLoop.ts`
- `scripts/product/validateMultiRoleFoundationalGovernanceContracts.ts`
- `scripts/product/validateOnboardingEvidenceExperience.ts`
- `scripts/product/validateOnboardingInvestigationIdempotency.ts`
- `scripts/product/validateOnboardingToAlphaReplay.ts`
- `scripts/product/validateOrganizationExperience.ts`
- `scripts/product/validateOrganizationalUnderstandingProjectionShadow.ts`
- `scripts/product/validateProductArtifactAuthorizationBeforeBodyRead.ts`
- `scripts/product/validateProductUnderstandingTranslation.ts`
- `scripts/product/validateResearchExperience.ts`
- `scripts/product/validateRuntimeToScopedProductSource.ts`
- `scripts/product/validateScopedDecisionCalibrationProjection.ts`
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
| Engine | ✅ Found | 158 |
| Runtime | ✅ Found | 107 |
| Executive | ✅ Found | 12 |
| Projection | ✅ Found | 110 |
| UI | ✅ Found | 26 |
| API | ✅ Found | 1 |
| Simulation | ✅ Found | 7 |
| Benchmark | ✅ Found | 340 |
| Other | ✅ Found | 188 |

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
- Line 147 · **unknown** · matched `OrganizationalUnderstanding`
  - `decision: OrganizationalUnderstandingDisclosureDecision;`
- Line 148 · **unknown** · matched `OrganizationalUnderstanding`
  - `disclosure: OrganizationalUnderstandingDisclosureResult;`
- Line 494 · **unknown** · matched `organizational-understanding`
  - `"canonical-organizational-understanding" &&`
- Line 544 · **unknown** · matched `OrganizationalUnderstanding`
  - `const decision: OrganizationalUnderstandingDisclosureDecision = {`
- Line 552 · **unknown** · matched `OrganizationalUnderstanding`
  - `const disclosure = discloseCanonicalOrganizationalUnderstanding({`

##### `engine/v3/governance/authorizedMetricLineage.ts`

- Line 8 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../understanding/scopedOrganizationalUnderstandingDisclosure";`
- Line 18 · **unknown** · matched `organizational-understanding`
  - `\| "organizational-understanding.coherence"`
- Line 23 · **unknown** · matched `organizational-understanding`
  - `\| "organizational-understanding.confidence"`
- Line 24 · **unknown** · matched `organizational-understanding`
  - `\| "organizational-understanding.freshness"`
- Line 25 · **unknown** · matched `organizational-understanding`
  - `\| "organizational-understanding.health"`
- Line 34 · **unknown** · matched `organizational-understanding`
  - `\| "organizational-understanding"`
- Line 115 · **unknown** · matched `organizational-understanding`
  - `"organizational-understanding.coherence": {`
- Line 116 · **unknown** · matched `organizational-understanding`
  - `producerRef: "update-organizational-understanding-state",`
- Line 118 · **unknown** · matched `organizational-understanding`
  - `calculationMethod: "canonical-organizational-understanding-health-coherence",`

##### `engine/v3/governance/fieldAudienceRequirement.ts`

- Line 8 · **unknown** · matched `organizational-understanding`
  - `export const FIELD_AUDIENCE_RESOURCE = "canonical-organizational-understanding" as const;`
- Line 10 · **unknown** · matched `organizational-understanding`
  - `export const FIELD_AUDIENCE_PURPOSE = "organizational-understanding" as const;`

##### `engine/v3/governance/recipientAudienceScope.ts`

- Line 7 · **unknown** · matched `organizational-understanding`
  - `export const RECIPIENT_AUDIENCE_RESOURCE_FAMILY = "canonical-organizational-understanding" as const;`
- Line 9 · **unknown** · matched `organizational-understanding`
  - `export type RecipientAudiencePurpose = "organizational-understanding";`

##### `engine/v3/governance/scopedGovernanceContext.ts`

- Line 6 · **type** · matched `organizational-understanding`
  - `export type ScopedGovernanceOperation = "understanding:disclose-direct" \| "understanding:disclose-derived" \| "understanding:read-historical" \| "understanding:read-historical-metadata" \| "organizational-understanding:revise-confidence-uncertainty" \| "contribution:submit" \| "contribution:request-evidence-candidacy" \| "source-content:write" \| "source-content:read-for-proposal" \| "source-content:read-for-evidence-admission" \| "source-content:reset-development" \| "source-binding:register-local" \| "source-binding:resolve-current" \| "source-binding:revise-availability" \| "product-artifact:read" \| "product-artifact:reuse" \| "product-artifact:compare" \| "product-artifact:prepare-again" \| "product-artifact:create-successor" \| "product-workspace:read" \| "leadership-history:list" \| "leadership-history:read" \| "executive-history-access:administer" \| "executive-history-access:revoke" \| "executive-history-access:restore" \| "historical-checkpoint-lifecycle-link:publish" \| "historical-checkpoint-lifecycle-link:list" \| "historical-checkpoint-lifecycle-link:read";`

##### `engine/v3/investigation/runOrganizationInvestigation.ts`

- Line 14 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 15 · **import** · matched `evolveOrganizationRuntime`
  - `} from "../runtime/evolveOrganizationRuntime";`
- Line 194 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime({`
- Line 230 · **unknown** · matched `evolveOrganizationRuntime`
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

- Line 242 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingState = {`
- Line 248 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingCondition = {`
- Line 256 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingInvestigation = {`
- Line 265 · **assignment** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstanding = {`
- Line 286 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalState: OrganizationalUnderstandingState \| null;`
- Line 292 · **unknown** · matched `OrganizationalUnderstanding`
  - `dominantCondition: OrganizationalUnderstandingCondition \| null;`
- Line 350 · **unknown** · matched `OrganizationalUnderstanding`
  - `nextInvestigation: OrganizationalUnderstandingInvestigation \| null;`
- Line 383 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: OrganizationalUnderstanding;`
- Line 398 · **unknown** · matched `OrganizationalUnderstanding`
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
- Line 197 · **definition** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `export function buildCanonicalUnderstandingCompatibilityShadow(input: {`
- Line 264 · **type** · matched `organizational-understanding`
  - `const compositionId = \`organizational-understanding:${encodedIdentity([`
- Line 292 · **unknown** · matched `organizational-understanding`
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

##### `engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService.ts`

- Line 8 · **import** · matched `OrganizationalUnderstanding`
  - `import type { CanonicalUnderstandingRevisionOperationRecordV1 } from "../runtime/organizationalUnderstandingState";`
- Line 12 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `} from "./buildCanonicalUnderstandingCompatibilityShadow";`
- Line 15 · **type** · matched `organizational-understanding`
  - `"organizational-understanding:revise-confidence-uncertainty" as const;`
- Line 84 · **unknown** · matched `OrganizationalUnderstanding`
  - `export class CanonicalOrganizationalUnderstandingRevisionService {`
- Line 162 · **unknown** · matched `OrganizationalUnderstanding`
  - `const state = stored.runtime.memory.organizationalUnderstandingState;`
- Line 239 · **unknown** · matched `OrganizationalUnderstanding`
  - `const nextState = runtime.memory.organizationalUnderstandingState;`

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

##### `engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage.ts`

- Line 19 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "./buildCanonicalUnderstandingCompatibilityShadow";`
- Line 63 · **unknown** · matched `organizational-understanding`
  - `purpose: "organizational-understanding";`
- Line 123 · **unknown** · matched `organizational-understanding`
  - `const unsigned={kind:"canonical-understanding-audience-lineage-record" as const,schemaVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION,producerVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION,lineageId,revisionId,...normalized,resourceFamily:RECIPIENT_AUDIENCE_RESOURCE_FAMILY,operation:"receive" as const,purpose:"organizational-understanding" as const};`
- Line 130 · **unknown** · matched `organizational-understanding`
  - `if(record.resourceFamily!==RECIPIENT_AUDIENCE_RESOURCE_FAMILY\|\|record.operation!=="receive"\|\|record.purpose!=="organizational-understanding") throw new Error("Invalid audience-lineage resource semantics.");`

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

##### `engine/v3/understanding/resolveCanonicalOrganizationalUnderstandingChange.ts`

- Line 2 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "./buildCanonicalUnderstandingCompatibilityShadow";`
- Line 9 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type CanonicalOrganizationalUnderstandingChangeResultV1 = {`
- Line 29 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type CanonicalOrganizationalUnderstandingChangeOutcomeV1 =`
- Line 30 · **unknown** · matched `OrganizationalUnderstanding`
  - `\| { status: "available"; result: CanonicalOrganizationalUnderstandingChangeResultV1 }`
- Line 38 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function validateCanonicalOrganizationalUnderstandingChangeOutcome(`
- Line 39 · **unknown** · matched `OrganizationalUnderstanding`
  - `outcome: CanonicalOrganizationalUnderstandingChangeOutcomeV1,`
- Line 45 · **unknown** · matched `OrganizationalUnderstanding`
  - `validateCanonicalOrganizationalUnderstandingChangeResult(outcome.result);`
- Line 102 · **unknown** · matched `OrganizationalUnderstanding`
  - `): CanonicalOrganizationalUnderstandingChangeResultV1["changeType"] {`
- Line 126 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function validateCanonicalOrganizationalUnderstandingChangeResult(`
- Line 127 · **unknown** · matched `OrganizationalUnderstanding`
  - `result: CanonicalOrganizationalUnderstandingChangeResultV1,`
- Line 167 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function resolveCanonicalOrganizationalUnderstandingChange(input: {`
- Line 173 · **unknown** · matched `OrganizationalUnderstanding`
  - `}): CanonicalOrganizationalUnderstandingChangeOutcomeV1 {`
- Line 203 · **unknown** · matched `OrganizationalUnderstanding`
  - `validateCanonicalOrganizationalUnderstandingChangeResult(result);`

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

- Line 5 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 26 · **import** · matched `OrganizationalUnderstanding`
  - `import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";`
- Line 28 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding,`
- Line 30 · **import** · matched `consolidateUnderstanding`
  - `} from "../understanding/consolidateUnderstanding";`
- Line 31 · **import** · matched `synthesizeUnderstanding`
  - `import { synthesizeUnderstanding } from "../understanding/synthesizeUnderstanding";`
- Line 32 · **import** · matched `buildExecutiveUnderstandingCandidates`
  - `import { buildExecutiveUnderstandingCandidates } from "../understanding/buildExecutiveUnderstandingCandidates";`
- Line 33 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import { buildCanonicalUnderstandingCompatibilityShadow } from "../understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 44 · **import** · matched `OrganizationalUnderstanding`
  - `import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";`
- Line 73 · **definition** · matched `evolveOrganizationRuntime`
  - `export function evolveOrganizationRuntime(params: {`
- Line 76 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingOwnershipMode?: "canonical" \| "legacy";`
- Line 77 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingAuthorityMode?: "explicit" \| "implicit";`
- Line 209 · **unknown** · matched `OrganizationalUnderstanding`
  - `const existingOrganizationalUnderstandingState:`
- Line 210 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState =`
- Line 211 · **unknown** · matched `OrganizationalUnderstanding`
  - `memory.organizationalUnderstandingState ??`
- Line 212 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState({`
- Line 238 · **unknown** · matched `OrganizationalUnderstanding`
  - `const baseOrganizationalUnderstandingState =`
- Line 239 · **unknown** · matched `OrganizationalUnderstanding`
  - `updateOrganizationalUnderstandingState({`
- Line 240 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: existingOrganizationalUnderstandingState,`
- Line 245 · **unknown** · matched `consolidateUnderstanding`
  - `const consolidationResult = consolidateUnderstanding(`
- Line 246 · **unknown** · matched `OrganizationalUnderstanding`
  - `baseOrganizationalUnderstandingState,`
- Line 251 · **unknown** · matched `OrganizationalUnderstanding`
  - `const updatedOrganizationalUnderstandingState:`
- Line 252 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 253 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState,`
- Line 257 · **unknown** · matched `OrganizationalUnderstanding`
  - `...baseOrganizationalUnderstandingState.evolutionHistory,`
- Line 289 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 290 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState,`
- Line 340 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 349 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 377 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 471 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 554 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 571 · **unknown** · matched `OrganizationalUnderstanding`
  - `updatedOrganizationalUnderstandingState.organizationalBeliefs,`
- Line 649 · **assignment** · matched `OrganizationalUnderstanding`
  - `const canonicalOrganizationalUnderstanding =`
- Line 650 · **unknown** · matched `OrganizationalUnderstanding`
  - `params.organizationalUnderstandingOwnershipMode === "legacy"`
- Line 651 · **unknown** · matched `OrganizationalUnderstanding`
  - `? existingOrganizationalUnderstandingState.canonicalCompositions`
- Line 652 · **unknown** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `: buildCanonicalUnderstandingCompatibilityShadow({`
- Line 656 · **unknown** · matched `OrganizationalUnderstanding`
  - `params.organizationalUnderstandingAuthorityMode,`
- Line 658 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.canonicalCompositions,`
- Line 698 · **unknown** · matched `OrganizationalUnderstanding`
  - `const beliefUpdatedOrganizationalUnderstandingState:`
- Line 699 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 700 · **unknown** · matched `OrganizationalUnderstanding`
  - `...updatedOrganizationalUnderstandingState,`
- Line 701 · **unknown** · matched `OrganizationalUnderstanding`
  - `...(canonicalOrganizationalUnderstanding`
- Line 704 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 712 · **unknown** · matched `OrganizationalUnderstanding`
  - `const synthesizedOrganizationalUnderstandingState =`
- Line 713 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 714 · **unknown** · matched `OrganizationalUnderstanding`
  - `state: beliefUpdatedOrganizationalUnderstandingState,`
- Line 721 · **unknown** · matched `OrganizationalUnderstanding`
  - `synthesizedOrganizationalUnderstandingState.currentUnderstandings,`
- Line 1012 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 1043 · **unknown** · matched `buildExecutiveUnderstandingCandidates`
  - `buildExecutiveUnderstandingCandidates({`
- Line 1055 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState = {`
- Line 1056 · **unknown** · matched `OrganizationalUnderstanding`
  - `...existingOrganizationalUnderstandingState,`
- Line 1058 · **unknown** · matched `OrganizationalUnderstanding`
  - `...(canonicalOrganizationalUnderstanding`
- Line 1061 · **unknown** · matched `OrganizationalUnderstanding`
  - `canonicalOrganizationalUnderstanding,`
- Line 1066 · **unknown** · matched `OrganizationalUnderstanding`
  - `existingOrganizationalUnderstandingState.currentUnderstandings.filter(`
- Line 1078 · **unknown** · matched `consolidateUnderstanding`
  - `consolidateUnderstanding(`
- Line 1084 · **unknown** · matched `OrganizationalUnderstanding`
  - `const finalOrganizationalUnderstandingState =`
- Line 1085 · **unknown** · matched `synthesizeUnderstanding`
  - `synthesizeUnderstanding({`
- Line 1124 · **unknown** · matched `OrganizationalUnderstanding`
  - `_canonicalCompositionsOwnedByOrganizationalUnderstanding,`
- Line 1126 · **unknown** · matched `OrganizationalUnderstanding`
  - `} = finalOrganizationalUnderstandingState;`
- Line 1130 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.currentUnderstandings.map(`
- Line 1156 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 1157 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1497 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1498 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1585 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1586 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState,`
- Line 1772 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingScore:`
- Line 1773 · **unknown** · matched `OrganizationalUnderstanding`
  - `finalOrganizationalUnderstandingState.score.overall,`
- Line 1843 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 1844 · **unknown** · matched `OrganizationalUnderstanding`
  - `typeof finalOrganizationalUnderstandingState;`

##### `engine/v3/runtime/index.ts`

- Line 24 · **unknown** · matched `evolveOrganizationRuntime`
  - `evolveOrganizationRuntime,`
- Line 25 · **import** · matched `evolveOrganizationRuntime`
  - `} from "./evolveOrganizationRuntime";`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 61 · **unknown** · matched `OrganizationalUnderstanding`
  - `createEmptyOrganizationalUnderstandingState,`
- Line 62 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingState";`
- Line 64 · **unknown** · matched `OrganizationalUnderstanding`
  - `OrganizationalUnderstandingState,`
- Line 65 · **import** · matched `OrganizationalUnderstanding`
  - `} from "./organizationalUnderstandingState";`
- Line 120 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState: OrganizationalUnderstandingState;`
- Line 326 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingState:`
- Line 327 · **unknown** · matched `OrganizationalUnderstanding`
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
- Line 200 · **unknown** · matched `OrganizationalUnderstanding`
  - `export type OrganizationalUnderstandingState = {`
- Line 208 · **unknown** · matched `OrganizationalUnderstanding`
  - `score: OrganizationalUnderstandingScore;`
- Line 212 · **unknown** · matched `OrganizationalUnderstanding`
  - `currentUnderstandings: OrganizationalUnderstandingItem[];`
- Line 231 · **unknown** · matched `OrganizationalUnderstanding`
  - `recommendations: OrganizationalUnderstandingRecommendation[];`
- Line 237 · **unknown** · matched `OrganizationalUnderstanding`
  - `evolutionHistory: OrganizationalUnderstandingEvolutionEvent[];`
- Line 247 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function createEmptyUnderstandingScore(): OrganizationalUnderstandingScore {`
- Line 414 · **unknown** · matched `OrganizationalUnderstanding`
  - `export function createEmptyOrganizationalUnderstandingState(params: {`
- Line 420 · **unknown** · matched `OrganizationalUnderstanding`
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

##### `scripts/development/reconstructNorthstarRuntime.ts`

- Line 51 · **unknown** · matched `OrganizationalUnderstanding`
  - `understandings: runtime.memory.organizationalUnderstandingState.canonicalCompositions?.length ?? 0,`

##### `scripts/product/validateRuntimeToScopedProductSource.ts`

- Line 9 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{ id: "must-not-be-mapped" }] as never;`

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

##### `scripts/product/validateAuthorizedMetricLineageAndScopedProjection.ts`

- Line 101 · **unknown** · matched `organizational-understanding`
  - `objectType: "organizational-understanding",`
- Line 117 · **unknown** · matched `organizational-understanding`
  - `const coherence = metricId === "organizational-understanding.coherence";`
- Line 121 · **unknown** · matched `organizational-understanding`
  - `producerRef: coherence ? "update-organizational-understanding-state" : "compute-organizational-learning-profile",`
- Line 125 · **unknown** · matched `organizational-understanding`
  - `? "canonical-organizational-understanding-health-coherence"`
- Line 147 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority) }).disposition,`
- Line 153 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.freshness", scopes.manager, managerAuthority) }).disposition,`
- Line 156 · **unknown** · matched `organizational-understanding`
  - `const hidden = metric("organizational-understanding.coherence", scopes.manager, managerAuthority, {`
- Line 166 · **unknown** · matched `organizational-understanding`
  - `const global = metric("organizational-understanding.coherence", scopes.manager, managerAuthority, {`
- Line 174 · **unknown** · matched `organizational-understanding`
  - `serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { resultSideChannelSafe: false, value: 772211 }),`
- Line 181 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [metricInput(scopes.manager, managerAuthority), metricInput(scopes.manager, managerAuthority, { safeRef: "input:second" })], inputCombinationProtected: true }) }).disposition,`
- Line 185 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: revoked, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority) }).disposition,`
- Line 190 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: historical, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, historicalAuthority, { historicalRevisionRef: REVISION }) }).disposition,`
- Line 193 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: historical, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, historicalAuthority) }).disposition,`
- Line 196 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [metricInput(scopes.manager, managerAuthority, { supportLineageComplete: false })] }) }).disposition,`
- Line 200 · **unknown** · matched `organizational-understanding`
  - `return evaluateAuthorizedMetricLineage({ context: invalid, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority) }).disposition;`
- Line 203 · **unknown** · matched `organizational-understanding`
  - `evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { organizationId: FOREIGN }) }).disposition,`
- Line 207 · **unknown** · matched `organizational-understanding`
  - `const one = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [input] }) });`
- Line 208 · **unknown** · matched `organizational-understanding`
  - `const duplicate = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [input, input] }) });`
- Line 215 · **unknown** · matched `organizational-understanding`
  - `const forward = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [first, second] }) });`
- Line 216 · **unknown** · matched `organizational-understanding`
  - `const reverse = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [second, first] }) });`
- Line 226 · **unknown** · matched `organizational-understanding`
  - `canonicalObjectType: kind === "material-change" ? "organizational-evolution" : kind === "investigation-opportunity" ? "investigation-opportunity" : "organizational-understanding",`
- Line 243 · **unknown** · matched `organizational-understanding`
  - `safeRef: CANARIES[1]!, canonicalObjectType: "organizational-understanding", revisionRef: REVISION,`
- Line 254 · **unknown** · matched `organizational-understanding`
  - `metric("organizational-understanding.coherence", scope, authorityRef),`
- Line 256 · **unknown** · matched `organizational-understanding`
  - `metric("organizational-understanding.freshness", scope, authorityRef),`
- Line 293 · **unknown** · matched `OrganizationalUnderstanding`
  - `for (const forbidden of ["organizationalUnderstandingState", "runtime", "memory", "evidenceIds", "sourceId", "credential", "connector"]) assert.equal(Object.hasOwn(projection, forbidden), false);`
- Line 327 · **unknown** · matched `organizational-understanding`
  - `assert.equal(metrics.find((item) => item.metricId === "organizational-understanding.coherence")?.disposition, "disclosed");`
- Line 328 · **unknown** · matched `organizational-understanding`
  - `assert.equal(metrics.find((item) => item.metricId === "organizational-understanding.freshness")?.disposition, "unsupported-metric");`
- Line 334 · **unknown** · matched `organizational-understanding`
  - `metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { value: 882211 }),`
- Line 338 · **unknown** · matched `organizational-understanding`
  - `metricIds: ["organizational-understanding.coherence", "organizational-learning.learning-velocity"],`
- Line 397 · **unknown** · matched `organizational-understanding`
  - `supportedMetricIds: ["organizational-understanding.coherence", "organizational-learning.learning-velocity"],`
- Line 398 · **unknown** · matched `organizational-understanding`
  - `unsupportedMetricIds: ["organizational-understanding.confidence", "organizational-understanding.freshness", "organizational-understanding.health", "organizational-learning.understanding-growth", "organizational-learning.memory-growth", "organizational-learning.trend-ranking"],`

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

##### `scripts/product/validateScopedDecisionCalibrationProjection.ts`

- Line 54 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstandingRefs: ["understanding:scope:1"], localConstraintRefs: ["constraint:local:1"],`
- Line 83 · **unknown** · matched `OrganizationalUnderstanding`
  - `trace.push({ id, benchmarkCaseId, productionOwner: "projectScopedDecisionCalibration", adapter: "readScopedOrganizationalProductProjection", organization: ORG, recipient: ctx.subjectId, requestedScope: SCOPE.id, purpose: ctx.purpose, decisionRef: result.decisionRef, objectiveRevision: result.objectiveRevisionRef, optimizationContextRevision: result.optimizationContextRevisionRef, authorityResult: result.axes.find((axis) => axis.axis === "authority"), authorizedEvidenceInputs: calibrationInput.canonicalInputs.supportingEvidenceRefs, withheldInputs: [], authorizedUnderstandingInputs: calibrationInput.canonicalInputs.organizationalUnderstandingRefs, localConstraints: calibrationInput.canonicalInputs.localConstraintRefs, broaderConstraints: calibrationInput.canonicalInputs.broaderConstraintRefs, experimentAuthority: calibrationInput.canonicalInputs.experimentAuthorizationRef ?? null, outcomeState: result.axes.find((axis) => axis.axis === "outcome-status"), axisDispositions: result.axes.map((axis) => [axis.axis, axis.disposition, axis.value]), overallClassification: expected, safeLineage: result.safeSupportingLineage, reads: 1, writes: 0, externalActivity: 0, observedSerializedResult: JSON.stringify(result) });`
- Line 139 · **unknown** · matched `OrganizationalUnderstanding`
  - `for (const forbidden of ["alignmentScore", "conformityScore", "approve", "reject", "execute", "mutate", "organizationalUnderstandingState", "runtime", "memory"]) assert.equal(serialized.includes(\`\"${forbidden}\"\`), false);`

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

- Line 135 · **unknown** · matched `organizational-understanding`
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

##### `components/role-aware/RoleAwareExperience.tsx`

- Line 79 · **unknown** · matched `organizational-understanding`
  - `const label = metric.metricId === "organizational-understanding.coherence"`

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

##### `engine/benchmark/multi-role-scoped-understanding-governance-001/runBenchmark.ts`

- Line 6 · **import** · matched `OrganizationalUnderstanding`
  - `import { discloseCanonicalOrganizationalUnderstanding, type OrganizationalUnderstandingDisclosureDecision } from "../../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 13 · **unknown** · matched `OrganizationalUnderstanding`
  - `const decision=(consumerId:string, disposition:"eligible"\|"withheld"\|"revoked", organizationId=ORGANIZATION_ID):OrganizationalUnderstandingDisclosureDecision=>({id:\`decision:${consumerId}:${disposition}\`,organizationId,consumerId,disposition,effectiveAt:NOW,basis:["benchmark-synthetic-resolved-decision"]});`
- Line 17 · **unknown** · matched `OrganizationalUnderstanding`
  - `const eligible=discloseCanonicalOrganizationalUnderstanding({organizationId:ORGANIZATION_ID,consumerId:consumer,decision:decision(consumer,"eligible"),compositions:[]});`
- Line 18 · **unknown** · matched `OrganizationalUnderstanding`
  - `const revoked=discloseCanonicalOrganizationalUnderstanding({organizationId:ORGANIZATION_ID,consumerId:consumer,decision:decision(consumer,"revoked"),compositions:[]});`
- Line 19 · **unknown** · matched `OrganizationalUnderstanding`
  - `const foreign=discloseCanonicalOrganizationalUnderstanding({organizationId:ORGANIZATION_ID,consumerId:consumer,decision:decision(consumer,"eligible",OTHER_ORGANIZATION_ID),compositions:[]});`
- Line 52 · **unknown** · matched `CAP-UND-006`
  - `return {organization:{id:ORGANIZATION_ID,canonicalModelCount:1,scopes},roles,corpus:normalized,scenarios,utilityRubric,projections,direct,derived,revocation,crossScope,crossOrganization,metrics,contribution,decisions,adversarial,utility,gaps,canonicalOwners:["CAP-PER-001","CAP-UND-006","canonical Understanding disclosure","authorized Organizational Understanding projection","CAP-LRN-002","CAP-SELF-002","CAP-DEC-001..007","Product Objective and Optimization Context","organization authorization and isolation"]};`

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

##### `engine/benchmark/product-governance/canonical-understanding-recipient-scope-nested-disclosure-001/runBenchmark.ts`

- Line 5 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingProjection } from "../../../v3/projection/organizationalUnderstandingProjection";`
- Line 6 · **import** · matched `OrganizationalUnderstanding`
  - `import type { OrganizationalUnderstandingDisclosureResult } from "../../../v3/understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 12 · **unknown** · matched `OrganizationalUnderstanding`
  - `const typeWitness: { disclosure?: OrganizationalUnderstandingDisclosureResult; projection?: OrganizationalUnderstandingProjection } = {};`

##### `engine/benchmark/product-governance/recipient-audience-scope-governance-contract-001/runBenchmark.ts`

- Line 12 · **read** · matched `organizational-understanding`
  - `const grant=(over:Partial<RecipientAudienceGrant>={}):RecipientAudienceGrant=>createRecipientAudienceGrant({revision:1,organizationId:ORG,assignmentId:"access:1",assignmentRevision:"access-rev:1",recipientId:"principal:1",resourceFamily:RECIPIENT_AUDIENCE_RESOURCE_FAMILY,operations:["receive"],purposes:["organizational-understanding"],audienceScopes:[fn],coverage:"explicit-descendants",state:"active",issuerAuthorityRef:"authority:organization-admin",issuerOperation:"audience-grant:administer",effectiveAt:AT,supersedesRevisionId:null,topology,...over});`
- Line 13 · **unknown** · matched `organizational-understanding`
  - `const requirement=(audienceScope:GovernedScopeRef=fn)=>({organizationId:ORG,recipientId:"principal:1",resourceFamily:RECIPIENT_AUDIENCE_RESOURCE_FAMILY,operation:"receive" as const,purpose:"organizational-understanding" as const,audienceScope});`
- Line 31 · **unknown** · matched `organizational-understanding`
  - `if(id===38\|\|id===39)s.req={...requirement(),purpose:"other" as "organizational-understanding"}; if(id===41)s.req={...requirement(),resourceFamily:"other" as typeof RECIPIENT_AUDIENCE_RESOURCE_FAMILY}; if(id===43\|\|id===44)s.req={...requirement(),operation:"other" as "receive"};`

##### `engine/benchmark/research/ORGANIZATIONAL_UNDERSTANDING_RESEARCH_FRAMEWORK.md`

- Line 369 · **type** · matched `OrganizationalUnderstanding`
  - `interface OrganizationalUnderstandingExperimentResult {`
- Line 404 · **unknown** · matched `OrganizationalUnderstanding`
  - `organizationalUnderstanding: "++" \| "+" \| "=" \| "-" \| "--" \| "?";`

##### `engine/benchmark/research/README.md`

- Line 101 · **unknown** · matched `organizational-understanding`
  - `../evaluator/organizational-understanding-evaluator-001/`

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

##### `scripts/product/buildGoogleDriveCumulativeParityDiagnostic.ts`

- Line 26 · **unknown** · matched `OrganizationalUnderstanding`
  - `const graph={version:"1",root:{id:"runtime-store-directory-bound-before-oracle-isolation",owner:"runtime-persistence-isolation",field:firstField},nodes:differences.map((item,index)=>({id:\`mismatch-${index+1}\`,field:item.field,objectType:item.field.includes("Understanding")?"OrganizationalUnderstanding":item.field.includes("Evidence")?"Evidence":item.field.includes("contradiction")?"Contradiction":"SemanticCheckpoint",producingOwner:item.firstResponsibleBoundary,primary:index===0,earliestDivergentAncestor:"runtime-store-directory-bound-before-oracle-isolation",wouldDisappearIfAncestorCorrected:true})),edges:differences.map((_,index)=>({from:"runtime-store-directory-bound-before-oracle-isolation",to:\`mismatch-${index+1}\`,relationship:"causes-or-propagates"}))};`

##### `scripts/product/capabilitySurvivalManifest.ts`

- Line 27 · **unknown** · matched `CAP-UND-006`
  - `\| "CAP-UND-006"`
- Line 103 · **unknown** · matched `CAP-UND-006`
  - `capabilityId: "CAP-UND-006",`
- Line 231 · **unknown** · matched `organizational-understanding`
  - `"validate:organizational-understanding-projection-shadow",`

##### `scripts/product/historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator.ts`

- Line 146 · **unknown** · matched `OrganizationalUnderstanding`
  - `const canonical = runtimeStored.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.at(-1);`
- Line 363 · **unknown** · matched `OrganizationalUnderstanding`
  - `const composition = runtimeStored.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.find((value) => value.id === foreign.projectionSourceRef);`

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
- Line 852 · **unknown** · matched `OrganizationalUnderstanding`
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

##### `scripts/product/validateCanonicalEvidenceContributionResult.ts`

- Line 14 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 63 · **unknown** · matched `evolveOrganizationRuntime`
  - `const originalLog=console.log;let evolved;try{console.log=()=>{};evolved=replayOnly?runtime:evolveOrganizationRuntime({runtime,result,input,semanticTime:contribution.contributedAt,canonicalEvidenceContributionOperationContext:operationContext,canonicalEvidenceContributionLineageEnvelope:canonicalEvidenceLineageEnvelope});}finally{console.log=originalLog;}`

##### `scripts/product/validateCanonicalEvidenceContributionResultReplay.ts`

- Line 10 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 36 · **unknown** · matched `evolveOrganizationRuntime`
  - `const originalLog=console.log;let evolved;try{console.log=()=>{};evolved=replayOnly?runtime:evolveOrganizationRuntime({runtime,result,input,semanticTime:AT,canonicalEvidenceContributionOperationContext:operationContext,canonicalEvidenceContributionLineageEnvelope:lineageEnvelope});}finally{console.log=originalLog;}`

##### `scripts/product/validateCanonicalExplanationGovernanceLineage.ts`

- Line 14 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 44 · **unknown** · matched `organizational-understanding`
  - `purposeRef: "organizational-understanding",`
- Line 56 · **unknown** · matched `organizational-understanding`
  - `purposeRef: "organizational-understanding",`
- Line 80 · **read** · matched `organizational-understanding`
  - `purposeRefs: ["organizational-understanding"],`
- Line 98 · **read** · matched `organizational-understanding`
  - `purposeRefs: ["organizational-understanding"],`
- Line 99 · **unknown** · matched `organizational-understanding`
  - `operationRefs: [{contributionOperationId:"operation:one",questionId:"question:one",purposeRef:"organizational-understanding",canonicalOperationResultDigest:"a".repeat(64),envelopeDigest:"b".repeat(64)}],`

##### `scripts/product/validateCanonicalMaterialEvidenceOrigin.ts`

- Line 5 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 25 · **unknown** · matched `evolveOrganizationRuntime`
  - `const original=console.log;let evolved;try{console.log=()=>{};evolved=evolveOrganizationRuntime({runtime:createEmptyOrganizationRuntime({organizationId:ORG,name:"Material",now:AT}),result:run,input,semanticTime:AT});}finally{console.log=original;}`

##### `scripts/product/validateCanonicalMaterialEvidenceOriginFreshProcess.ts`

- Line 9 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 19 · **unknown** · matched `evolveOrganizationRuntime`
  - `if(role==="run-governed-cognition-and-admission"){const runtime=JSON.parse(await readFile(runtimePath,"utf8")),result=runDiscoveryV3(input,lineage),evidenceIds=result.evidence.map(item=>item.id),admissionIds=result.scopeLineageAdmission!.operationBatch.admissions.flatMap(item=>item.investigationEvidenceIds).sort();assert.equal(evidenceIds.length,16);assert.deepEqual([...evidenceIds].sort(),admissionIds);const original=console.log;let evolved;try{console.log=()=>{};evolved=evolveOrganizationRuntime({runtime,result,input,semanticTime:AT});}finally{console.log=original;}const safe={evidenceIds,admissionIds,batchDigest:result.scopeLineageAdmission!.operationBatch.batchDigest,explanationIds:(evolved.memory.organizationalExplanations??[]).map(item=>item.id),compositionIds:(evolved.memory.organizationalUnderstandingState.canonicalCompositions??[]).map(item=>[item.id,item.revisionId])};await writeFile(runtimePath,JSON.stringify(evolved),{mode:0o600});await writeFile(safePath,JSON.stringify(safe),{mode:0o600});return{role,result:"PASS",governedEvidenceCount:16,admissionCount:16,framingCount:0,batchDigest:safe.batchDigest};}`

##### `scripts/product/validateCanonicalOrganizationalUnderstandingChangeResult.ts`

- Line 3 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 5 · **unknown** · matched `OrganizationalUnderstanding`
  - `resolveCanonicalOrganizationalUnderstandingChange,`
- Line 6 · **unknown** · matched `OrganizationalUnderstanding`
  - `validateCanonicalOrganizationalUnderstandingChangeOutcome,`
- Line 7 · **unknown** · matched `OrganizationalUnderstanding`
  - `validateCanonicalOrganizationalUnderstandingChangeResult,`
- Line 8 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/understanding/resolveCanonicalOrganizationalUnderstandingChange";`
- Line 29 · **unknown** · matched `OrganizationalUnderstanding`
  - `resolveCanonicalOrganizationalUnderstandingChange({ organizationId: ORG, questionId: QUESTION, contributionOperationId: OPERATION, beforeCompositions: before, afterCompositions: after });`
- Line 41 · **unknown** · matched `OrganizationalUnderstanding`
  - `validateCanonicalOrganizationalUnderstandingChangeOutcome(unavailable); checks += 1;`
- Line 42 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeOutcome({ status: "unavailable", reason: "invalid" } as never)); checks += 1;`
- Line 43 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeOutcome(undefined as never)); checks += 1;`
- Line 50 · **unknown** · matched `OrganizationalUnderstanding`
  - `validateCanonicalOrganizationalUnderstandingChangeResult(ordered.result); checks += 1;`
- Line 51 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeResult({ ...ordered.result, disposition: "changed" })); checks += 1;`
- Line 52 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeResult({ ...ordered.result, resultDigest: "0".repeat(64) })); checks += 1;`
- Line 56 · **unknown** · matched `organizational-understanding`
  - `console.log(JSON.stringify({ validation: "canonical-organizational-understanding-change-result-001", result: "PASS", checks, independentOracle: true, networkCalls: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0 }));`

##### `scripts/product/validateCanonicalOrganizationalUnderstandingChangeResultFreshProcess.ts`

- Line 68 · **unknown** · matched `organizational-understanding`
  - `validation: "canonical-organizational-understanding-change-result-fresh-process-001",`

##### `scripts/product/validateCanonicalProductComposition.ts`

- Line 14 · **unknown** · matched `OrganizationalUnderstanding`
  - `compileOrganizationalUnderstandingProjection,`
- Line 16 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 143 · **unknown** · matched `organizational-understanding`
  - `"organizational-understanding",`
- Line 308 · **unknown** · matched `OrganizationalUnderstanding`
  - `const authorityFailure = compileOrganizationalUnderstandingProjection({`

##### `scripts/product/validateCanonicalScopeLineage.ts`

- Line 19 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 88 · **unknown** · matched `OrganizationalUnderstanding`
  - `const runtime=createEmptyOrganizationRuntime({organizationId:ORG}); const cognitiveBefore=canonicalScopeLineageDigest({metadata:runtime.metadata,understanding:runtime.memory.organizationalUnderstandingState,observations:runtime.memory.observations,beliefs:runtime.memory.beliefs}); runtime.memory.canonicalScopeLineageIndex=index; const cognitiveAfter=canonicalScopeLineageDigest({metadata:runtime.metadata,understanding:runtime.memory.organizationalUnderstandingState,observations:runtime.memory.observations,beliefs:runtime.memory.beliefs});`
- Line 110 · **unknown** · matched `evolveOrganizationRuntime`
  - `try{producedRuntime=evolveOrganizationRuntime({runtime:createEmptyOrganizationRuntime({organizationId:ORG}),result:productionResult,input:{company:productionInput.company,website:productionInput.website,industry:productionInput.industry,question:productionInput.question,context:productionInput.context}});}finally{console.log=savedLog;}`

##### `scripts/product/validateCanonicalUnderstandingAudienceLineageForwardProducer.ts`

- Line 15 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 18 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 42 · **unknown** · matched `organizational-understanding`
  - `const binding = createCanonicalSourceScopeBinding({ organizationId: ORG, bindingVersion: 1, source: { sourceId: "source:operations", sourceVersion: "1", normalizedContentDigest: createHash("sha256").update(governedContent).digest("hex") }, topology, assertions: [{ relationship: "origin", scope: department }], basisRefs: ["governed-source-declaration:operations"], effectiveAt: NOW, sourceType: "manual-takeaway", purposeRef: "organizational-understanding", availability: "available" });`
- Line 45 · **unknown** · matched `organizational-understanding`
  - `const operationContext = createCanonicalEvidenceContributionOperationContext({ contributionOperationId: "operation:audience-lineage", organizationId: ORG, questionId: "question:audience-lineage", purposeRef: "organizational-understanding", requestFingerprint: digest("audience-lineage-request"), idempotencyKeyDigest: digest("audience-lineage-key") });`
- Line 51 · **unknown** · matched `evolveOrganizationRuntime`
  - `governedRuntime = evolveOrganizationRuntime({ runtime: createEmptyOrganizationRuntime({ organizationId: ORG, name: "Audience lineage validation", now: NOW }), result: investigationResult, input: investigationInput, semanticTime: NOW, canonicalEvidenceContributionOperationContext: operationContext, canonicalEvidenceContributionLineageEnvelope: operationEnvelope });`
- Line 288 · **unknown** · matched `organizational-understanding`
  - `finding({ id: "finding:field-audience-requirement", category: "GOVERNANCE", canonicalOwnerId: "field-audience-requirement-governance", canonicalOwnerBoundary: "canonical-field-audience-classification", affectedFieldFamilies: incompleteFieldFamilies, blocking: baselineExecution.output.records.every((record) => record.audienceRequirementBasis === "unresolved"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "canonical-organizational-understanding-field-governance", mutationOwner: "field-audience-requirement-contract", productionBoundary: "canonical-understanding-field-lineage", versioningBoundary: "audience-requirement-policy", validationBoundary: "audience-requirement-governance-oracle", likelyProductionFiles: ["engine/v3/governance/recipientAudienceScope.ts"], evidenceRefs: evidenceRefs(["baseline", "composition-subject-scope", "source-scope", "evidence-scope"]), ...common }),`

##### `scripts/product/validateCanonicalUnderstandingConfidenceRevision.ts`

- Line 11 · **unknown** · matched `OrganizationalUnderstanding`
  - `CanonicalOrganizationalUnderstandingRevisionService,`
- Line 12 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService";`
- Line 13 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 14 · **import** · matched `OrganizationalUnderstanding`
  - `import { discloseCanonicalOrganizationalUnderstanding } from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";`
- Line 15 · **import** · matched `OrganizationalUnderstanding`
  - `import { compileOrganizationalUnderstandingProjection } from "../../engine/v3/projection/organizationalUnderstandingProjection";`
- Line 16 · **import** · matched `OrganizationalUnderstanding`
  - `import { resolveCanonicalOrganizationalUnderstandingChange } from "../../engine/v3/understanding/resolveCanonicalOrganizationalUnderstandingChange";`
- Line 23 · **type** · matched `organizational-understanding`
  - `const stableUnderstandingId = "organizational-understanding:validation-001";`
- Line 34 · **unknown** · matched `organizational-understanding`
  - `authorityOwner: "canonical-organizational-understanding",`
- Line 79 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions = [composition];`
- Line 86 · **unknown** · matched `OrganizationalUnderstanding`
  - `const service = new CanonicalOrganizationalUnderstandingRevisionService(repository, { now: () => clock });`
- Line 134 · **unknown** · matched `OrganizationalUnderstanding`
  - `const retained = current.runtime.memory.organizationalUnderstandingState.canonicalCompositions![0]!;`
- Line 139 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.equal(current.runtime.memory.organizationalUnderstandingState.canonicalRevisionOperations?.length, 2);`
- Line 140 · **unknown** · matched `OrganizationalUnderstanding`
  - `const change = resolveCanonicalOrganizationalUnderstandingChange({ organizationId, questionId: "question-validation-001", contributionOperationId: second.receipt.operationId, beforeCompositions: [composition], afterCompositions: [retained] });`
- Line 151 · **unknown** · matched `OrganizationalUnderstanding`
  - `const disclosure = discloseCanonicalOrganizationalUnderstanding({`
- Line 157 · **unknown** · matched `OrganizationalUnderstanding`
  - `const projection = compileOrganizationalUnderstandingProjection({`

##### `scripts/product/validateCanonicalUnderstandingConfidenceRevisionFreshProcess.ts`

- Line 10 · **import** · matched `OrganizationalUnderstanding`
  - `import { CANONICAL_UNDERSTANDING_REVISION_OPERATION, CanonicalOrganizationalUnderstandingRevisionService } from "../../engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService";`
- Line 11 · **import** · matched `buildCanonicalUnderstandingCompatibilityShadow`
  - `import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";`
- Line 17 · **type** · matched `organizational-understanding`
  - `const stableUnderstandingId = "organizational-understanding:fresh-process-001";`
- Line 27 · **unknown** · matched `organizational-understanding`
  - `const composition: CanonicalUnderstandingComposition = { id: stableUnderstandingId, revisionId: \`${stableUnderstandingId}:conclusion:1\`, previousRevisionId: null, organizationId, scope: { organizationId, type: "organization", id: organizationId }, outcomeRef: { type: "phenomenon", id: "fresh-outcome" }, explanationIds: [], authorityTransition: { authorityOwner: "canonical-organizational-understanding", contributionDecisionOwner: "canonical-understanding-contribution-validation", persistenceOwner: "organization-runtime", disclosureOwner: "application-boundary-not-evaluated", explanationIds: [], disposition: "authorized-organizational-knowledge", basis: ["existing-production-semantics-satisfied"] }, compositionUncertainty: ["comparative-role-data-unavailable"], createdAt: at, updatedAt: at };`
- Line 28 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions = [composition];`
- Line 30 · **unknown** · matched `OrganizationalUnderstanding`
  - `const service = new CanonicalOrganizationalUnderstandingRevisionService(repository, { now: () => at });`
- Line 39 · **unknown** · matched `OrganizationalUnderstanding`
  - `const state = stored.runtime.memory.organizationalUnderstandingState;`

##### `scripts/product/validateCanonicalUnderstandingCurrentEligibility.ts`

- Line 15 · **unknown** · matched `organizational-understanding`
  - `const PURPOSE = "organizational-understanding";`
- Line 155 · **unknown** · matched `organizational-understanding`
  - `canonicalObjectType: "organizational-understanding",`

##### `scripts/product/validateCapabilitySurvival.ts`

- Line 21 · **unknown** · matched `CAP-UND-006`
  - `"CAP-UND-006",`

##### `scripts/product/validateCrossInvestigationEvidenceAdmissionIdentity.ts`

- Line 3 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 74 · **unknown** · matched `evolveOrganizationRuntime`
  - `const silent=console.log;console.log=()=>{};let runtimeA,runtimeB;try{runtimeA=evolveOrganizationRuntime({runtime:createEmptyOrganizationRuntime({organizationId:ORG}),result:first.result,input:first.input});runtimeB=evolveOrganizationRuntime({runtime:createEmptyOrganizationRuntime({organizationId:ORG}),result:second.result,input:second.input});}finally{console.log=silent;}`

##### `scripts/product/validateCrossOperationCanonicalEvidenceAncestryFreshProcess.ts`

- Line 25 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 97 · **unknown** · matched `evolveOrganizationRuntime`
  - `return evolveOrganizationRuntime({`
- Line 128 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.ok((runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? []).length > 0);`
- Line 147 · **unknown** · matched `OrganizationalUnderstanding`
  - `const compositions = before.runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];`
- Line 177 · **unknown** · matched `OrganizationalUnderstanding`
  - `const compositionBytes = sha(JSON.stringify(runtime.memory.organizationalUnderstandingState.canonicalCompositions));`
- Line 185 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.equal(sha(JSON.stringify(reloaded.runtime.memory.organizationalUnderstandingState.canonicalCompositions)), compositionBytes);`

##### `scripts/product/validateDuplicateEvidenceReplayAwareCognitionEntry.ts`

- Line 6 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 46 · **unknown** · matched `evolveOrganizationRuntime`
  - `function createAdapter(repository:MemoryRepository,counters:{investigate:number;preflight:number}){return new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,evidenceContributionPurposeRef:({questionId})=>questionId,authorize:async({userId,organizationId})=>userId===USER&&organizationId===ORG,preflightCanonicalEvidence:async({runtime,question,contribution})=>{counters.preflight+=1;const value=context(runtime,question,contribution);return resolveCanonicalEvidenceAdmission(value.input,value.lineage);},investigate:async({runtime,question,contribution,operationContext,replayOnly})=>{assert.ok(operationContext);if(!replayOnly)counters.investigate+=1;const {input,lineage}=context(runtime,question,contribution);const result=runDiscoveryV3(input,lineage);const admissionBatch=result.scopeLineageAdmission!.operationBatch;const lineageEnvelope=createCanonicalEvidenceContributionLineageEnvelope({context:operationContext,admissionBatch});const original=console.log;let evolved;try{console.log=()=>{};evolved=replayOnly?runtime:evolveOrganizationRuntime({runtime,result,input,semanticTime:AT,canonicalEvidenceContributionOperationContext:operationContext,canonicalEvidenceContributionLineageEnvelope:lineageEnvelope});}finally{console.log=original;}return{runtime:evolved,evidenceAccepted:result.evidence.length>0,canonicalEvidenceAdmissionBatch:admissionBatch,canonicalEvidenceLineageEnvelope:lineageEnvelope};}});}`
- Line 48 · **unknown** · matched `OrganizationalUnderstanding`
  - `const cognitionSnapshot=(runtime:StoredOrganizationRuntime["runtime"])=>JSON.stringify({understanding:runtime.memory.organizationalUnderstandingState,explanations:runtime.memory.organizationalExplanations,ownerEvents:runtime.memory.events.filter(event=>{const kind=String((event as {kind?:unknown})?.kind??"");return /answer\|unknown\|decision/.test(kind);})});`
- Line 70 · **unknown** · matched `evolveOrganizationRuntime`
  - `const identicalBaseline=afterMaterial;const direct=async()=>{const value=context(identicalBaseline,"What changed?",contribution("source-recompute","recompute",material));const result=runDiscoveryV3(value.input,value.lineage);const original=console.log;try{console.log=()=>{};const evolved=evolveOrganizationRuntime({runtime:structuredClone(identicalBaseline),result,input:value.input,semanticTime:AT});return JSON.stringify({explanations:(evolved.memory.organizationalExplanations??[]).map(item=>item.id),compositions:(evolved.memory.organizationalUnderstandingState.canonicalCompositions??[]).map(item=>[item.id,item.revisionId])});}finally{console.log=original;}};`

##### `scripts/product/validateDuplicateEvidenceReplayAwareCognitionFreshProcessRole.ts`

- Line 6 · **import** · matched `evolveOrganizationRuntime`
  - `import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";`
- Line 19 · **unknown** · matched `evolveOrganizationRuntime`
  - `function service(repository:FilesystemOrganizationRuntimeRepository,counter:{value:number}){return new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,evidenceContributionPurposeRef:()=>QUESTION,authorize:async({userId,organizationId})=>userId===USER&&organizationId===ORG,preflightCanonicalEvidence:async({runtime,question,contribution})=>{const value=context(runtime,question,contribution);return resolveCanonicalEvidenceAdmission(value.input,value.lineage);},investigate:async({runtime,question,contribution,operationContext,replayOnly})=>{assert.ok(operationContext);if(!replayOnly)counter.value+=1;const {input,lineage}=context(runtime,question,contribution);const result=runDiscoveryV3(input,lineage);const admissionBatch=result.scopeLineageAdmission!.operationBatch;const lineageEnvelope=createCanonicalEvidenceContributionLineageEnvelope({context:operationContext,admissionBatch});const original=console.log;let evolved;try{console.log=()=>{};evolved=replayOnly?runtime:evolveOrganizationRuntime({runtime,result,input,semanticTime:AT,canonicalEvidenceContributionOperationContext:operationContext,canonicalEvidenceContributionLineageEnvelope:lineageEnvelope});}finally{console.log=original;}return{runtime:evolved,evidenceAccepted:result.evidence.length>0,canonicalEvidenceAdmissionBatch:admissionBatch,canonicalEvidenceLineageEnvelope:lineageEnvelope};}});}`
- Line 20 · **unknown** · matched `OrganizationalUnderstanding`
  - `function summary(runtime:StoredOrganizationRuntime["runtime"]){const explanations=runtime.memory.organizationalExplanations??[];const compositions=runtime.memory.organizationalUnderstandingState.canonicalCompositions??[];const support=JSON.stringify({lineage:runtime.memory.canonicalScopeLineageIndex,understanding:runtime.memory.understandingState,model:runtime.organizationModel});return{explanationCount:explanations.length,compositionCount:compositions.length,explanationDigest:sha(JSON.stringify(explanations.map(item=>item.id))),compositionDigest:sha(JSON.stringify(compositions.map(item=>[item.id,item.revisionId]))),supportDigest:sha(support)};}`

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

##### `scripts/product/validateLeadershipConversationActualOwnerRouting.ts`

- Line 26 · **unknown** · matched `OrganizationalUnderstanding`
  - `check(router.includes("canonicalUnderstandingChange") && router.includes("validateCanonicalOrganizationalUnderstandingChangeResult"), "router verifies and consumes the canonical Understanding owner result");`
- Line 29 · **unknown** · matched `OrganizationalUnderstanding`
  - `check(composition.includes("CanonicalOrganizationalUnderstandingRevisionService"), "server composition constructs the canonical Understanding revision owner");`
- Line 30 · **unknown** · matched `OrganizationalUnderstanding`
  - `check(composition.includes("organizationalUnderstandingChangeType"), "What Changed consumes the actual canonical change type");`

##### `scripts/product/validateLeadershipConversationReplay.ts`

- Line 55 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.canonicalCompositions = [];`

##### `scripts/product/validateLivingInteractionLoop.ts`

- Line 18 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.health.coherence = 0.68;`
- Line 19 · **unknown** · matched `OrganizationalUnderstanding`
  - `runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{`

##### `scripts/product/validateMultiRoleFoundationalGovernanceContracts.ts`

- Line 16 · **import** · matched `OrganizationalUnderstanding`
  - `} from "../../engine/v3/understanding/scopedOrganizationalUnderstandingDisclosure";`
- Line 70 · **unknown** · matched `organizational-understanding`
  - `purpose: "improve-organizational-understanding",`
- Line 186 · **unknown** · matched `organizational-understanding`
  - `return evaluateScopedEvidenceContribution({ organizationId: input.organizationId ?? ORG, contributorId, sourceScope: input.sourceScope ?? targetScope, targetScope, purpose: input.purpose ?? "improve-organizational-understanding", sourceRef: "source:safe", sensitivity: input.sensitivity ?? "standard", propagation: input.propagation ?? "local-only", idempotencyKey: input.idempotencyKey ?? "idempotency:1", contributedAt: NOW, governance });`

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

##### `scripts/product/validateProductArtifactAuthorizationBeforeBodyRead.ts`

- Line 152 · **unknown** · matched `OrganizationalUnderstanding`
  - `const composition = foreignRuntime.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.find((item) => item.id === manifest.foreign!.projectionSourceRef && item.revisionId === manifest.foreign!.canonicalUnderstandingRevision && item.organizationId === manifest.foreign!.organizationId);`
- Line 450 · **unknown** · matched `OrganizationalUnderstanding`
  - `assert.ok((foreignRuntime.runtime.memory.organizationalUnderstandingState.canonicalCompositions??[]).some((item) => item.id === foreignPartition.projectionSourceRef && item.revisionId === foreignPartition.canonicalUnderstandingRevision));`
- Line 562 · **unknown** · matched `OrganizationalUnderstanding`
  - `{ classId: 35, label: "generic-unresolved-current-owner-state", applies: both, runtime: (value) => { value.memory.organizationalUnderstandingState.canonicalCompositions = []; } },`

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
