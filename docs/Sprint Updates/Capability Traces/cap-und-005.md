# Capability Trace — Executive Assessment

Generated: 2026-07-31T20:42:01.298Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-UND-005` |
| Capability name | Executive Assessment |
| Cognitive domain | UND |
| Architectural layer | EXEC |
| Canonical producer | `engine/v3/model/judgment/buildExecutiveAssessment.ts` |
| Runtime destination | `OrganizationRuntime.executiveAssessment` |
| Executive destination | `ExecutiveProjection, ExecutiveWorkspace` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `ExecutiveAssessment`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/judgment/buildExecutiveAssessment.ts`

### Capability Dependencies

- `CAP-PRD-002`
- `CAP-UND-001`
- `CAP-UND-002`
- `CAP-UND-003`
- `CAP-UND-004`
- `CAP-UND-006`

### Declared Consumers

- `CAP-COM-001`
- `CAP-DEC-001`
- `CAP-DEC-002`
- `CAP-UND-006`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-UND-005 |
| Canonical producer declared | ✅ | engine/v3/model/judgment/buildExecutiveAssessment.ts |
| Canonical producer exists | ✅ | engine/v3/model/judgment/buildExecutiveAssessment.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.executiveAssessment |
| Executive destination | ✅ | ExecutiveProjection, ExecutiveWorkspace |
| Consumers | ✅ | 4 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/assessment/ExecutiveAssessmentCard.tsx`
- `components/executive-v2/briefing/ExecutiveBriefing.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`
- `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/ExecutiveScenarioProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveScenarioProjection.ts`
- `components/executive-v3/projection/buildExecutiveBriefingProjection.ts`
- `components/executive-v3/projection/buildExecutiveNarrative.ts`
- `components/executive-v3/workspaces/decision-definition/DiscoveryContextSection.tsx`
- `components/product-shell/data/buildAskExperienceView.ts`
- `components/product-shell/data/buildDecisionsExperienceView.ts`
- `components/product-shell/data/buildOrganizationExperienceView.ts`
- `components/product-shell/data/buildOrganizationModelContext.ts`
- `components/product-shell/data/buildResearchExperienceView.ts`
- `components/product-shell/data/composeActivatedYourOrganization.ts`
- `engine/benchmark/auditCapability.ts`
- `engine/benchmark/auditUnderstandingLayers.ts`
- `engine/benchmark/benchmarkReporter.ts`
- `engine/benchmark/benchmarkScorer.ts`
- `engine/benchmark/causal-mechanism-formation-experiment-001/RESULTS.json`
- `engine/benchmark/causal-mechanism-formation-experiment-001/productionPathAudit.ts`
- `engine/benchmark/causal-mechanism-formation-refinement-experiment-002/RESULTS.json`
- `engine/benchmark/decision-intelligence/runDecisionCalibration.ts`
- `engine/benchmark/decision-intelligence/scenarioIntegrationExperiment001.ts`
- `engine/benchmark/emergence-phase-transition-experiment-001/RESULTS.json`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/README.md`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/RESULTS.json`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/extractGeneratedCognition.ts`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/productionPathAudit.ts`
- `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/types.ts`
- `engine/benchmark/executive-collaboration-lab/executiveConversationScenarios.ts`
- `engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts`
- `engine/benchmark/executive-communication/executiveCommunicationExperiment002.ts`
- `engine/benchmark/executive-communication/runtimeBackedExecutiveLanguage001.ts`
- `engine/benchmark/executive-recommendation/executiveRecommendation001.ts`
- `engine/benchmark/executive-recommendation/northstarExecutiveRecommendation001.ts`
- `engine/benchmark/executive-recommendation/recommendedExecutiveIntervention001.ts`
- `engine/benchmark/executive-recommendation/recommendedExecutiveObjective001.ts`
- `engine/benchmark/executive-recommendation/recommendedExecutiveStrategy001.ts`
- `engine/benchmark/high-volume/captureRuntimeSnapshot.ts`
- `engine/benchmark/high-volume/northstar/runNorthstarCognitiveGroundTruth001.ts`
- `engine/benchmark/high-volume/northstar/runNorthstarCognitiveLayerValidation001.ts`
- `engine/benchmark/high-volume/northstar/runNorthstarCognitiveTrace001.ts`
- `engine/benchmark/high-volume/northstar/runNorthstarExecutiveGroundTruth002.ts`
- `engine/benchmark/high-volume/northstar/runNorthstarPrecisionGap001.ts`
- `engine/benchmark/high-volume/northstar/scoreNorthstarGroundTruth.ts`
- `engine/benchmark/high-volume/northstar/traceConcurrencyStaffingSemantics.ts`
- `engine/benchmark/judgment-lab/canonicalUnderstandingCompatibilityShadowGate.ts`
- `engine/benchmark/judgment-lab/canonicalUnderstandingOwnershipMigrationGate.ts`
- `engine/benchmark/judgment-lab/competingExplanationProductionShadow.ts`
- `engine/benchmark/judgment-lab/decisiveEvidenceAblation.ts`
- `engine/benchmark/judgment-lab/evaluateJudgment.ts`
- `engine/benchmark/judgment-lab/evidenceIndependenceShadowEvaluation.ts`
- `engine/benchmark/judgment-lab/explicitAuthorityTransitionsGate.ts`
- `engine/benchmark/judgment-lab/mechanismEvidenceCompositionGroundTruth.ts`
- `engine/benchmark/judgment-lab/runJudgmentLab.ts`
- `engine/benchmark/judgment-lab/themeEvidenceCompositionIsolation.ts`
- `engine/benchmark/judgment-lab/unadjudicatedExplanationUnderstandingShadowGate.ts`
- `engine/benchmark/judgment-lab/validateJudgmentLabProvenance.ts`
- `engine/benchmark/localized-nonlinear-cognition-experiment-001/RESULTS.json`
- `engine/benchmark/localized-nonlinear-cognition-experiment-001/productionPathAudit.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/runtime/cognitiveInventory001.ts`
- `engine/benchmark/runtime/cognitiveSemanticNormalizationAudit001.ts`
- `engine/v3/communication/buildExecutiveStory.ts`
- `engine/v3/communication/executiveCommunicationSource.ts`
- `engine/v3/communication/synthesizeExecutiveNarrative.ts`
- `engine/v3/decision-learning/buildExecutiveDecisionOutcome.ts`
- `engine/v3/executive/buildExecutiveChangeSummary.ts`
- `engine/v3/executive/executiveLearningSummary.ts`
- `engine/v3/model/decision-learning/executiveDecisionOutcome.ts`
- `engine/v3/model/judgment/buildExecutiveExplanation.ts`
- `engine/v3/model/judgment/organizationalJudgment.ts`
- `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`
- `engine/v3/model/recommendation/buildExecutiveRecommendation.ts`
- `engine/v3/model/recommendation/buildRecommendedExecutiveIntervention.ts`
- `engine/v3/model/recommendation/buildRecommendedExecutiveObjective.ts`
- `engine/v3/model/recommendation/buildRecommendedExecutiveStrategy.ts`
- `engine/v3/model/simulate/buildSimulationScenario.ts`
- `engine/v3/model/simulate/compareSimulationScenario.ts`
- `engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts`
- `engine/v3/operating-systems/recommendation/runExecutiveRecommendationOperatingSystem.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/runtime/organizationRuntime.ts`
- `engine/v3/runtime/organizationalUnderstandingState.ts`
- `engine/v3/scenarios/buildExecutiveDecisionContext.ts`
- `engine/v3/scenarios/runExecutiveScenario.ts`
- `engine/v3/semantic/types.ts`
- `engine/v3/types.ts`
- `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
- `engine/v3/understanding/consolidateUnderstanding.ts`
- `engine/v3/understanding/rankOrganizationalUnderstanding.ts`
- `engine/v3/work/executiveWork.ts`
- `scripts/cognition/generateArchitectureHandoff.mjs`
- `scripts/cognition/generateArchitectureState.mjs`
- `scripts/cognition/generateCognitiveRegistry.mjs`
- `scripts/cognition/renderSprintStartup.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`
- `scripts/product/validateAlphaYourOrganizationActivation.ts`
- `scripts/product/validateAskExperience.ts`
- `scripts/product/validateLivingInteractionLoop.ts`
- `scripts/product/validateOrganizationExperience.ts`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Executive Assessment`
- `executiveAssessment`
- `ExecutiveAssessment`
- `executive-assessment`
- `executive assessment`
- `CAP-UND-005`
- `capUnd005`
- `CapUnd005`
- `cap-und-005`
- `buildExecutiveAssessment`
- `BuildExecutiveAssessment`
- `build-executive-assessment`
- `buildexecutiveassessment`
- `executiveassessment`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 104 |
| Runtime | ✅ Found | 23 |
| Executive | ✅ Found | 9 |
| Projection | ✅ Found | 42 |
| UI | ✅ Found | 35 |
| API | ❌ Not found | 0 |
| Simulation | ✅ Found | 21 |
| Benchmark | ✅ Found | 311 |
| Other | ✅ Found | 18 |

### Detailed Matches

#### Engine

##### `engine/v3/communication/buildExecutiveStory.ts`

- Line 268 · **read** · matched `executiveAssessment`
  - `source.executiveAssessment,`
- Line 298 · **read** · matched `executiveAssessment`
  - `source.executiveAssessment,`
- Line 510 · **read** · matched `executiveAssessment`
  - `source.executiveAssessment,`
- Line 1236 · **read** · matched `executiveAssessment`
  - `source.executiveAssessment,`

##### `engine/v3/communication/executiveCommunicationSource.ts`

- Line 2 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 3 · **import** · matched `executiveAssessment`
  - `} from "../model/judgment/buildExecutiveAssessment";`
- Line 32 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 33 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`

##### `engine/v3/communication/synthesizeExecutiveNarrative.ts`

- Line 34 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 281 · **read** · matched `executiveAssessment`
  - `source.executiveAssessment,`

##### `engine/v3/decision-learning/buildExecutiveDecisionOutcome.ts`

- Line 844 · **unknown** · matched `Executive Assessment`
  - `* executive assessment synthesis, or new prediction generation.`

##### `engine/v3/model/decision-learning/executiveDecisionOutcome.ts`

- Line 37 · **unknown** · matched `Executive Assessment`
  - `* Overall executive assessment.`

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 32 · **type** · matched `executiveAssessment`
  - `type BuildExecutiveAssessmentInput = {`
- Line 47 · **unknown** · matched `executiveAssessment`
  - `export type ExecutiveAssessmentWithPrimaryJudgment =`
- Line 250 · **unknown** · matched `executiveAssessment`
  - `export function buildExecutiveAssessment(`
- Line 251 · **unknown** · matched `executiveAssessment`
  - `input: BuildExecutiveAssessmentInput,`
- Line 252 · **unknown** · matched `executiveAssessment`
  - `): ExecutiveAssessmentWithPrimaryJudgment {`
- Line 450 · **unknown** · matched `Executive Assessment`
  - `: "The available reasoning paths did not produce a coherent executive assessment.";`

##### `engine/v3/model/judgment/buildExecutiveExplanation.ts`

- Line 18 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 117 · **unknown** · matched `Executive Assessment`
  - `* or simulation reasoning. It composes Executive Assessment, Organizational`
- Line 122 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 145 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary,`
- Line 155 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment`

##### `engine/v3/model/judgment/organizationalJudgment.ts`

- Line 337 · **unknown** · matched `Executive Assessment`
  - `* Concise summary of the Executive Assessment.`
- Line 350 · **unknown** · matched `Executive Assessment`
  - `* Executive Assessment.`
- Line 363 · **unknown** · matched `Executive Assessment`
  - `* Executive Assessment consumes this object but does not`

##### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 62 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 252 · **read** · matched `executiveAssessment`
  - `if ((params.currentSnapshot.executiveAssessmentConfidence ?? 0) < 0.7) {`

##### `engine/v3/model/recommendation/buildExecutiveRecommendation.ts`

- Line 2 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 3 · **import** · matched `executiveAssessment`
  - `} from "../judgment/buildExecutiveAssessment";`
- Line 27 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 28 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 76 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 77 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment,`
- Line 90 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 91 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment,`
- Line 103 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 104 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment,`

##### `engine/v3/model/recommendation/buildRecommendedExecutiveIntervention.ts`

- Line 2 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 3 · **import** · matched `executiveAssessment`
  - `} from "../judgment/buildExecutiveAssessment";`
- Line 24 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 25 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`

##### `engine/v3/model/recommendation/buildRecommendedExecutiveObjective.ts`

- Line 2 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 3 · **import** · matched `executiveAssessment`
  - `} from "../judgment/buildExecutiveAssessment";`
- Line 16 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 17 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 252 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment`
- Line 255 · **read** · matched `executiveAssessment`
  - `typeof input.executiveAssessment.primaryJudgment & {`
- Line 296 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment`
- Line 299 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment`
- Line 352 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment`
- Line 372 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment`
- Line 389 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment as`
- Line 390 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment & {`
- Line 396 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1";`
- Line 412 · **unknown** · matched `Executive Assessment`
  - `\`${conditionName} is the primary organizational constraint identified by Executive Assessment.\`,`

##### `engine/v3/model/recommendation/buildRecommendedExecutiveStrategy.ts`

- Line 2 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 3 · **import** · matched `executiveAssessment`
  - `} from "../judgment/buildExecutiveAssessment";`
- Line 20 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 21 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 440 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment`
- Line 527 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment as`
- Line 528 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment & {`
- Line 534 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1";`

##### `engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts`

- Line 18 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 19 · **import** · matched `executiveAssessment`
  - `} from "../../model/judgment/buildExecutiveAssessment";`
- Line 27 · **type** · matched `executiveAssessment`
  - `executiveAssessment?:`
- Line 28 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 117 · **read** · matched `executiveAssessment`
  - `if (!memory.executiveAssessment) {`
- Line 119 · **read** · matched `executiveAssessment`
  - `"Executive Communication Operating System requires runtime.memory.executiveAssessment.",`
- Line 150 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 151 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`

##### `engine/v3/operating-systems/recommendation/runExecutiveRecommendationOperatingSystem.ts`

- Line 10 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 11 · **import** · matched `executiveAssessment`
  - `} from "../../model/judgment/buildExecutiveAssessment";`
- Line 23 · **type** · matched `executiveAssessment`
  - `executiveAssessment?:`
- Line 24 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 57 · **unknown** · matched `Executive Assessment`
  - `* Executive Assessment`
- Line 80 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 81 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment;`
- Line 91 · **unknown** · matched `executiveAssessment`
  - `!executiveAssessment`
- Line 94 · **read** · matched `executiveAssessment`
  - `"Executive Recommendation Operating System requires runtime.memory.executiveAssessment.",`
- Line 117 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`

##### `engine/v3/scenarios/buildExecutiveDecisionContext.ts`

- Line 13 · **type** · matched `executiveAssessment`
  - `executiveAssessment?:`
- Line 14 · **unknown** · matched `executiveAssessment`
  - `RunExecutiveScenarioInput["currentExecutiveAssessment"];`
- Line 98 · **unknown** · matched `Executive Assessment`
  - `* simulation and executive assessment.`
- Line 173 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment:`
- Line 175 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`
- Line 176 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

##### `engine/v3/scenarios/runExecutiveScenario.ts`

- Line 127 · **unknown** · matched `Executive Assessment`
  - `* Current canonical Executive Assessment used as the comparison baseline.`
- Line 129 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment:`
- Line 187 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`
- Line 261 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`

##### `engine/v3/semantic/types.ts`

- Line 29 · **unknown** · matched `Executive Assessment`
  - `* (Beliefs, Concept Candidates, Executive Assessment, etc.)`

##### `engine/v3/types.ts`

- Line 563 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: OrganizationalAssessment;`

##### `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`

- Line 3 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentLike = {`
- Line 58 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentLike;`
- Line 110 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.theoryValidation?.dominantTheory;`
- Line 119 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.primaryMechanismIds ??`
- Line 142 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.primaryMechanismIds ??`
- Line 229 · **read** · matched `executiveAssessment`
  - `input.executiveAssessment?.confidence ??`
- Line 247 · **unknown** · matched `executive-assessment`
  - `source: "executive-assessment",`

##### `engine/v3/understanding/consolidateUnderstanding.ts`

- Line 533 · **unknown** · matched `executive-assessment`
  - `candidate.source === "executive-assessment" \|\|`

##### `engine/v3/understanding/rankOrganizationalUnderstanding.ts`

- Line 48 · **unknown** · matched `executive-assessment`
  - `if (source === "executive-assessment") {`

##### `engine/v3/work/executiveWork.ts`

- Line 66 · **unknown** · matched `Executive Assessment`
  - `* Executive assessment of execution health.`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 15 · **import** · matched `executiveAssessment`
  - `import { buildExecutiveAssessment } from "../model/judgment/buildExecutiveAssessment";`
- Line 108 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: any;`
- Line 906 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment = buildExecutiveAssessment({`
- Line 920 · **unknown** · matched `executiveAssessment`
  - `const runtimeWithExecutiveAssessment:`
- Line 926 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 941 · **unknown** · matched `executiveAssessment`
  - `runtimeWithExecutiveAssessment,`
- Line 948 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 972 · **unknown** · matched `executive-assessment`
  - `understanding.source === "executive-assessment",`
- Line 1043 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 1044 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 1097 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence:`
- Line 1098 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.confidence,`
- Line 1199 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 1392 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 1454 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 1668 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence:`
- Line 1669 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.confidence,`
- Line 1715 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 1716 · **unknown** · matched `executiveAssessment`
  - `typeof executiveAssessment;`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 197 · **unknown** · matched `Executive Assessment`
  - `* Executive Assessment.`
- Line 206 · **unknown** · matched `Executive Assessment`
  - `* Executive Assessment, Executive Recommendation, organizational state,`
- Line 376 · **unknown** · matched `Executive Assessment`
  - `* No canonical recommendation exists until Executive Assessment`

##### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 16 · **unknown** · matched `executive-assessment`
  - `\| "executive-assessment"`

#### Executive

##### `engine/v3/executive/buildExecutiveChangeSummary.ts`

- Line 27 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 33 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 239 · **read** · matched `executiveAssessment`
  - `input.currentSnapshot?.executiveAssessmentConfidence ?? 0;`
- Line 242 · **read** · matched `executiveAssessment`
  - `input.previousSnapshot?.executiveAssessmentConfidence ?? currentConfidence;`

##### `engine/v3/executive/executiveLearningSummary.ts`

- Line 80 · **unknown** · matched `executiveAssessment`
  - `executiveAssessmentConfidence?: number;`
- Line 150 · **read** · matched `executiveAssessment`
  - `: (snapshot.executiveAssessmentConfidence ?? 0) -`
- Line 151 · **read** · matched `executiveAssessment`
  - `(previous.executiveAssessmentConfidence ?? 0),`
- Line 290 · **read** · matched `executiveAssessment`
  - `const currentConfidence = current?.executiveAssessmentConfidence ?? 0;`
- Line 292 · **read** · matched `executiveAssessment`
  - `previous?.executiveAssessmentConfidence ?? currentConfidence;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 52 · **unknown** · matched `executiveAssessment`
  - `export type ExecutiveAssessment = {`
- Line 54 · **unknown** · matched `Executive Assessment`
  - `* Concise statement of Discovery's executive assessment.`
- Line 608 · **unknown** · matched `Executive Assessment`
  - `* Discovery's canonical executive assessment.`
- Line 610 · **unknown** · matched `Executive Assessment`
  - `* This preserves Executive Assessment as a first-class object`
- Line 614 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessment;`

##### `components/executive-v2/projection/ExecutiveScenarioProjection.ts`

- Line 47 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 21 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessment,`
- Line 237 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 491 · **unknown** · matched `executiveAssessment`
  - `function buildExecutiveAssessmentProjection(`
- Line 493 · **unknown** · matched `executiveAssessment`
  - `): ExecutiveAssessment \| undefined {`
- Line 494 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 495 · **read** · matched `executiveAssessment`
  - `runtimeMemory?.executiveAssessment;`
- Line 497 · **unknown** · matched `executiveAssessment`
  - `if (!executiveAssessment) {`
- Line 503 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary \|\|`
- Line 504 · **unknown** · matched `Executive Assessment`
  - `"Discovery has not yet formed a complete executive assessment.",`
- Line 507 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.executiveNarrative \|\|`
- Line 508 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary \|\|`
- Line 512 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.confidence,`
- Line 516 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.recommendedFocus ?? [],`
- Line 519 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.theoryValidation,`
- Line 526 · **read** · matched `executiveAssessment`
  - `return runtimeMemory?.executiveAssessment?.theoryValidation;`
- Line 1172 · **unknown** · matched `executiveAssessment`
  - `const runtimeExecutiveAssessment =`
- Line 1173 · **read** · matched `executiveAssessment`
  - `runtimeMemory?.executiveAssessment;`
- Line 1175 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 1176 · **unknown** · matched `executiveAssessment`
  - `buildExecutiveAssessmentProjection(runtimeMemory);`
- Line 1222 · **unknown** · matched `executiveAssessment`
  - `runtimeExecutiveAssessment?.confidence ??`
- Line 1270 · **unknown** · matched `executiveAssessment`
  - `runtimeExecutiveAssessment?.summary \|\|`
- Line 1304 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`

##### `components/executive-v2/projection/buildExecutiveScenarioProjection.ts`

- Line 55 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 57 · **unknown** · matched `executiveAssessment`
  - `.projectedExecutiveAssessment,`

##### `components/executive-v3/projection/buildExecutiveBriefingProjection.ts`

- Line 81 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 101 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 232 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 457 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 526 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`

##### `components/executive-v3/projection/buildExecutiveNarrative.ts`

- Line 188 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 230 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 252 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 393 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 480 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 705 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 779 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`

#### UI

##### `components/executive-v2/assessment/ExecutiveAssessmentCard.tsx`

- Line 1 · **import** · matched `executiveAssessment`
  - `import type { ExecutiveAssessment } from "../projection/ExecutiveProjection";`
- Line 3 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentCardProps = {`
- Line 4 · **unknown** · matched `executiveAssessment`
  - `assessment: ExecutiveAssessment;`
- Line 7 · **unknown** · matched `executiveAssessment`
  - `export default function ExecutiveAssessmentCard({`
- Line 9 · **unknown** · matched `executiveAssessment`
  - `}: ExecutiveAssessmentCardProps) {`
- Line 14 · **unknown** · matched `Executive Assessment`
  - `Executive Assessment`

##### `components/executive-v2/briefing/ExecutiveBriefing.tsx`

- Line 188 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 206 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 265 · **read** · matched `executiveAssessment`
  - `.executiveAssessment,`
- Line 317 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`
- Line 607 · **read** · matched `executiveAssessment`
  - `.executiveAssessment`

##### `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`

- Line 8 · **unknown** · matched `CAP-UND-005`
  - `\| "CAP-UND-005"`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`

- Line 3 · **import** · matched `executiveAssessment`
  - `import ExecutiveAssessmentCard from "../assessment/ExecutiveAssessmentCard";`
- Line 16 · **unknown** · matched `CAP-UND-005`
  - `\| "CAP-UND-005"`
- Line 61 · **unknown** · matched `CAP-UND-005`
  - `capabilityId: "CAP-UND-005",`
- Line 62 · **unknown** · matched `Executive Assessment`
  - `name: "Executive Assessment",`
- Line 64 · **unknown** · matched `executiveAssessment`
  - `projectionKey: "executiveAssessment",`
- Line 66 · **read** · matched `executiveAssessment`
  - `projection.executiveAssessment !== undefined,`
- Line 68 · **read** · matched `executiveAssessment`
  - `projection.executiveAssessment ? (`
- Line 69 · **unknown** · matched `executiveAssessment`
  - `<ExecutiveAssessmentCard`
- Line 70 · **read** · matched `executiveAssessment`
  - `assessment={projection.executiveAssessment}`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`

- Line 3 · **import** · matched `executiveAssessment`
  - `import ExecutiveAssessmentCard from "../assessment/ExecutiveAssessmentCard";`
- Line 24 · **unknown** · matched `CAP-UND-005`
  - `capabilityId: "CAP-UND-005",`
- Line 25 · **unknown** · matched `executiveAssessment`
  - `projectionKey: "executiveAssessment",`
- Line 27 · **read** · matched `executiveAssessment`
  - `projection.executiveAssessment ? (`
- Line 28 · **unknown** · matched `executiveAssessment`
  - `<ExecutiveAssessmentCard`
- Line 29 · **read** · matched `executiveAssessment`
  - `assessment={projection.executiveAssessment}`

##### `components/executive-v3/workspaces/decision-definition/DiscoveryContextSection.tsx`

- Line 60 · **unknown** · matched `Executive Assessment`
  - `executive assessment.`

##### `components/product-shell/data/buildAskExperienceView.ts`

- Line 99 · **read** · matched `executiveAssessment`
  - `const assessment = record(memory.executiveAssessment);`

##### `components/product-shell/data/buildDecisionsExperienceView.ts`

- Line 189 · **read** · matched `executiveAssessment`
  - `const assessment = record(memory.executiveAssessment);`

##### `components/product-shell/data/buildOrganizationExperienceView.ts`

- Line 139 · **read** · matched `executiveAssessment`
  - `const assessment = record(memory.executiveAssessment);`

##### `components/product-shell/data/buildOrganizationModelContext.ts`

- Line 27 · **read** · matched `executiveAssessment`
  - `const primaryId = text(record(record(memory.executiveAssessment).primaryJudgment).dominantConditionId);`

##### `components/product-shell/data/buildResearchExperienceView.ts`

- Line 84 · **read** · matched `executiveAssessment`
  - `const assessment = record(memory.executiveAssessment);`

##### `components/product-shell/data/composeActivatedYourOrganization.ts`

- Line 168 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 175 · **read** · matched `executiveAssessment`
  - `const judgment = memory.executiveAssessment?.primaryJudgment;`

#### Simulation

##### `engine/v3/model/simulate/buildSimulationScenario.ts`

- Line 1 · **import** · matched `executiveAssessment`
  - `import { buildExecutiveAssessment } from "../judgment/buildExecutiveAssessment";`
- Line 23 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentInput =`
- Line 24 · **unknown** · matched `executiveAssessment`
  - `Parameters<typeof buildExecutiveAssessment>[0];`
- Line 46 · **unknown** · matched `Executive Assessment`
  - `* Canonical Executive Assessment of the simulated future.`
- Line 48 · **unknown** · matched `executiveAssessment`
  - `projectedExecutiveAssessment: OrganizationalAssessment;`
- Line 68 · **unknown** · matched `executiveAssessment`
  - `NonNullable<ExecutiveAssessmentInput["organizationalState"]>;`
- Line 77 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentInput["conceptualUnderstanding"];`
- Line 83 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentInput["organizationalBeliefs"];`
- Line 86 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentInput["investigationOpportunities"];`
- Line 112 · **unknown** · matched `Executive Assessment`
  - `* canonical producers for Prediction Reflection, Executive Assessment, and`
- Line 145 · **unknown** · matched `executiveAssessment`
  - `const projectedExecutiveAssessment =`
- Line 146 · **unknown** · matched `executiveAssessment`
  - `buildExecutiveAssessment({`
- Line 165 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 166 · **unknown** · matched `executiveAssessment`
  - `projectedExecutiveAssessment,`
- Line 186 · **unknown** · matched `executiveAssessment`
  - `projectedExecutiveAssessment,`

##### `engine/v3/model/simulate/compareSimulationScenario.ts`

- Line 109 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment: OrganizationalAssessment;`
- Line 594 · **unknown** · matched `executiveAssessment`
  - `.projectedExecutiveAssessment`
- Line 613 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`
- Line 637 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`
- Line 640 · **unknown** · matched `executiveAssessment`
  - `.projectedExecutiveAssessment,`
- Line 659 · **unknown** · matched `executiveAssessment`
  - `currentExecutiveAssessment,`

#### Benchmark

##### `engine/benchmark/auditCapability.ts`

- Line 1389 · **unknown** · matched `Executive Assessment`
  - `'Usage: npm run audit:capability -- "Executive Assessment"',`

##### `engine/benchmark/auditUnderstandingLayers.ts`

- Line 8 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

##### `engine/benchmark/benchmarkReporter.ts`

- Line 268 · **unknown** · matched `executiveAssessment`
  - `"   Recommendation: improve theory validation inside buildExecutiveAssessment().",`
- Line 288 · **unknown** · matched `executiveAssessment`
  - `console.log("   Recommendation: improve buildExecutiveAssessment().");`

##### `engine/benchmark/benchmarkScorer.ts`

- Line 36 · **type** · matched `executiveAssessment`
  - `type ExecutiveAssessmentBenchmarkItem = {`
- Line 51 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentBenchmarkItem;`
- Line 302 · **definition** · matched `executiveAssessment`
  - `function executiveAssessmentText(`
- Line 303 · **unknown** · matched `executiveAssessment`
  - `assessment?: ExecutiveAssessmentBenchmarkItem,`
- Line 476 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentBenchmarkItem;`
- Line 479 · **unknown** · matched `executiveAssessment`
  - `const { organizationalState, executiveAssessment, executiveText } = params;`
- Line 483 · **read** · matched `executiveAssessment`
  - `...executiveAssessmentText(executiveAssessment),`
- Line 489 · **unknown** · matched `executiveAssessment`
  - `arrayPresenceScore(executiveAssessment?.recommendedFocus, 3),`
- Line 510 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: ExecutiveAssessmentBenchmarkItem;`
- Line 516 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 523 · **read** · matched `executiveAssessment`
  - `...executiveAssessmentText(executiveAssessment),`
- Line 720 · **read** · matched `executiveAssessment`
  - `const assessmentText = executiveAssessmentText(actual.executiveAssessment);`
- Line 811 · **type** · matched `executiveAssessment`
  - `executiveAssessment: actual.executiveAssessment,`
- Line 818 · **type** · matched `executiveAssessment`
  - `executiveAssessment: actual.executiveAssessment,`
- Line 919 · **unknown** · matched `Executive Assessment`
  - `"Pattern coherence is weak: mechanisms, concepts, conditions, and executive assessment are not yet converging cleanly.",`
- Line 943 · **unknown** · matched `Executive Assessment`
  - `"Executive assessment did not clearly synthesize organizational conditions into a coherent organizational state.",`

##### `engine/benchmark/causal-mechanism-formation-experiment-001/RESULTS.json`

- Line 20 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `engine/benchmark/causal-mechanism-formation-experiment-001/productionPathAudit.ts`

- Line 9 · **unknown** · matched `Executive Assessment`
  - `"Organizational State", "Executive Assessment", "Executive Recommendation",`

##### `engine/benchmark/causal-mechanism-formation-refinement-experiment-002/RESULTS.json`

- Line 20 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `engine/benchmark/decision-intelligence/runDecisionCalibration.ts`

- Line 152 · **unknown** · matched `Executive Assessment`
  - `"Projected Executive Assessment",`
- Line 157 · **read** · matched `executiveAssessment`
  - `.executiveAssessment,`
- Line 161 · **unknown** · matched `Executive Assessment`
  - `"Projected future must include a canonical Executive Assessment.",`

##### `engine/benchmark/decision-intelligence/scenarioIntegrationExperiment001.ts`

- Line 41 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: unknown;`
- Line 212 · **unknown** · matched `executiveAssessment`
  - `.projectedExecutiveAssessment;`
- Line 239 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment &&`
- Line 246 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment, Organizational State, Causal Model, and Learning Profile are required.",`
- Line 255 · **unknown** · matched `executiveAssessment`
  - `decisionContext.currentExecutiveAssessment &&`
- Line 336 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment regenerated",`
- Line 344 · **unknown** · matched `executiveAssessment`
  - `"The projected future was routed through buildExecutiveAssessment().",`
- Line 381 · **read** · matched `executiveAssessment`
  - `.executiveAssessment &&`

##### `engine/benchmark/emergence-phase-transition-experiment-001/RESULTS.json`

- Line 4117 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 4742 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 5439 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 5932 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 6470 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 7014 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 7649 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 8353 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 8903 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 9438 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 9733 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 10148 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 10671 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 11207 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 11777 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 12303 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 12865 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 13391 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 13917 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 14443 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 14865 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 15408 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 16005 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 16668 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 17112 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 17627 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 18128 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 18716 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 19392 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 19934 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 20440 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 20726 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 21094 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 21564 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 22073 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 22619 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 23137 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 23691 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 24209 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 24727 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 25245 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 25677 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 26262 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 26921 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 27626 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 28071 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 28601 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 29095 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 29748 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 30454 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 31032 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 31500 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 31803 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 32112 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 32554 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 33108 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 33705 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 34259 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 34849 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 35403 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 35957 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 36511 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 36943 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 37498 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 38127 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 38828 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 39257 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 39784 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 40201 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 40809 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 41517 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 42089 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 42603 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 42882 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 43201 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 43569 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 44096 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 44713 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 45264 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 45848 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 46396 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 46944 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 47492 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 47942 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/README.md`

- Line 21 · **unknown** · matched `Executive Assessment`
  - `Theories, Conditions, Organizational State, Executive Assessment, Predictions,`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/RESULTS.json`

- Line 46 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/extractGeneratedCognition.ts`

- Line 95 · **type** · matched `executiveAssessment`
  - `executiveAssessment: memory.executiveAssessment,`
- Line 114 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/productionPathAudit.ts`

- Line 42 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `engine/benchmark/emergent-organizational-intelligence-production-shadow-experiment-002/types.ts`

- Line 81 · **type** · matched `executiveAssessment`
  - `executiveAssessment: unknown;`

##### `engine/benchmark/executive-collaboration-lab/executiveConversationScenarios.ts`

- Line 9 · **assignment** · matched `executiveAssessment`
  - `memory.executiveAssessment = { summary: "Decision ownership and prioritization are constraining execution.", primaryJudgment: { dominantConditionId: "condition-decision-flow", confidence: .72 } };`

##### `engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts`

- Line 163 · **type** · matched `executiveAssessment`
  - `executiveAssessment: {`

##### `engine/benchmark/executive-communication/executiveCommunicationExperiment002.ts`

- Line 162 · **type** · matched `executiveAssessment`
  - `executiveAssessment: {`

##### `engine/benchmark/executive-communication/runtimeBackedExecutiveLanguage001.ts`

- Line 89 · **read** · matched `executiveAssessment`
  - `!memory.executiveAssessment \|\|`
- Line 101 · **type** · matched `executiveAssessment`
  - `executiveAssessment: memory.executiveAssessment,`

##### `engine/benchmark/executive-recommendation/executiveRecommendation001.ts`

- Line 6 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 7 · **import** · matched `executiveAssessment`
  - `} from "../../v3/model/judgment/buildExecutiveAssessment";`
- Line 124 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`
- Line 158 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 178 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 286 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`

##### `engine/benchmark/executive-recommendation/northstarExecutiveRecommendation001.ts`

- Line 19 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 20 · **import** · matched `executiveAssessment`
  - `} from "../../v3/model/judgment/buildExecutiveAssessment";`
- Line 34 · **type** · matched `executiveAssessment`
  - `executiveAssessment?:`
- Line 35 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 153 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 154 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment;`
- Line 164 · **unknown** · matched `executiveAssessment`
  - `!executiveAssessment`
- Line 167 · **read** · matched `executiveAssessment`
  - `"Northstar Executive Recommendation requires runtime.memory.executiveAssessment.",`
- Line 190 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 229 · **unknown** · matched `Executive Assessment`
  - `"Recommendation consumes the canonical Executive Assessment",`
- Line 235 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment as`
- Line 236 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment & {`
- Line 242 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1"`

##### `engine/benchmark/executive-recommendation/recommendedExecutiveIntervention001.ts`

- Line 6 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 7 · **import** · matched `executiveAssessment`
  - `} from "../../v3/model/judgment/buildExecutiveAssessment";`
- Line 82 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`
- Line 191 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`
- Line 224 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`
- Line 232 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 265 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`

##### `engine/benchmark/executive-recommendation/recommendedExecutiveObjective001.ts`

- Line 6 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 7 · **import** · matched `executiveAssessment`
  - `} from "../../v3/model/judgment/buildExecutiveAssessment";`
- Line 109 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`
- Line 145 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 165 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`

##### `engine/benchmark/executive-recommendation/recommendedExecutiveStrategy001.ts`

- Line 6 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment,`
- Line 7 · **import** · matched `executiveAssessment`
  - `} from "../../v3/model/judgment/buildExecutiveAssessment";`
- Line 78 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`
- Line 118 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment-1",`
- Line 140 · **unknown** · matched `executiveAssessment`
  - `ExecutiveAssessmentWithPrimaryJudgment;`
- Line 190 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`

##### `engine/benchmark/high-volume/captureRuntimeSnapshot.ts`

- Line 104 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 320 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 324 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 433 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 441 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 455 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 457 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 465 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 477 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`

##### `engine/benchmark/high-volume/northstar/runNorthstarCognitiveGroundTruth001.ts`

- Line 21 · **unknown** · matched `executiveAssessment`
  - `\| "executiveAssessment";`
- Line 68 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: TextLike;`
- Line 913 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`
- Line 916 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 1353 · **unknown** · matched `executiveAssessment`
  - `case "executiveAssessment":`
- Line 1355 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 1357 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`

##### `engine/benchmark/high-volume/northstar/runNorthstarCognitiveLayerValidation001.ts`

- Line 209 · **unknown** · matched `executive-assessment`
  - `id: "executive-assessment",`
- Line 210 · **unknown** · matched `Executive Assessment`
  - `label: "Executive Assessment",`
- Line 214 · **unknown** · matched `executiveAssessment`
  - `["result", "executiveAssessment"],`
- Line 215 · **read** · matched `executiveAssessment`
  - `["executiveAssessment"],`
- Line 216 · **unknown** · matched `executiveAssessment`
  - `["runtime", "memory", "executiveAssessment"],`
- Line 558 · **unknown** · matched `executive-assessment`
  - `"executive-assessment",`
- Line 785 · **unknown** · matched `Executive Assessment`
  - `"Conditions → Executive Assessment",`
- Line 800 · **unknown** · matched `Executive Assessment`
  - `? "Organizational conditions support executive assessment."`
- Line 801 · **unknown** · matched `Executive Assessment`
  - `: "Organizational conditions did not produce an executive assessment.",`
- Line 809 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment → Executive Recommendation",`
- Line 824 · **unknown** · matched `Executive Assessment`
  - `? "Executive assessment produced an executive recommendation."`
- Line 825 · **unknown** · matched `Executive Assessment`
  - `: "Executive assessment did not produce an executive recommendation.",`

##### `engine/benchmark/high-volume/northstar/runNorthstarCognitiveTrace001.ts`

- Line 315 · **unknown** · matched `executive-assessment`
  - `"executive-assessment",`
- Line 318 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 323 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`
- Line 326 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`
- Line 331 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

##### `engine/benchmark/high-volume/northstar/runNorthstarExecutiveGroundTruth002.ts`

- Line 121 · **type** · matched `executiveAssessment`
  - `executiveAssessment?:`
- Line 775 · **unknown** · matched `Executive Assessment`
  - `return "Discovery converged strongly on the known Northstar ground truth through the current Executive Assessment architecture.";`
- Line 792 · **unknown** · matched `Executive Assessment`
  - `return "Discovery did not yet converge reliably on the Northstar ground truth through the structured Executive Assessment capabilities.";`
- Line 853 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`

##### `engine/benchmark/high-volume/northstar/runNorthstarPrecisionGap001.ts`

- Line 179 · **unknown** · matched `executive-assessment`
  - `id: "executive-assessment",`
- Line 180 · **unknown** · matched `Executive Assessment`
  - `label: "Executive Assessment",`
- Line 182 · **read** · matched `executiveAssessment`
  - `["executiveAssessment"],`
- Line 189 · **unknown** · matched `executiveAssessment`
  - `["executiveAssessment", "recommendation"],`
- Line 190 · **unknown** · matched `executiveAssessment`
  - `["executiveAssessment", "recommendedFocus"],`
- Line 191 · **unknown** · matched `executiveAssessment`
  - `["executiveAssessment", "executiveRecommendation"],`
- Line 193 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`
- Line 198 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

##### `engine/benchmark/high-volume/northstar/scoreNorthstarGroundTruth.ts`

- Line 100 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: TextLike & {`
- Line 510 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`
- Line 731 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 735 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 740 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment as`
- Line 741 · **read** · matched `executiveAssessment`
  - `ExtendedMemory["executiveAssessment"] & {`

##### `engine/benchmark/high-volume/northstar/traceConcurrencyStaffingSemantics.ts`

- Line 304 · **read** · matched `executiveAssessment`
  - `stage("executive-assessment", memory.executiveAssessment),`
- Line 435 · **unknown** · matched `executive-assessment`
  - `"executive-assessment",`

##### `engine/benchmark/judgment-lab/canonicalUnderstandingCompatibilityShadowGate.ts`

- Line 373 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: unknown;`
- Line 380 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 381 · **read** · matched `executiveAssessment`
  - `productionMemory.executiveAssessment,`
- Line 404 · **unknown** · matched `executive-assessment`
  - `"11-executive-assessment-compatibility",`
- Line 405 · **import** · matched `Executive Assessment`
  - `"Executive Assessment remains byte-identical; deriving it from Category A alone remains an explicit legacy assumption.",`
- Line 406 · **read** · matched `executiveAssessment`
  - `() => assertLegacyReadThrough(currentOutputs.executiveAssessment),`
- Line 442 · **unknown** · matched `Executive Assessment`
  - `"A bounded operations-oriented fixture consumes Category A directly without Executive Assessment.",`
- Line 446 · **unknown** · matched `executiveAssessment`
  - `assert.equal(stable(output).includes("executiveAssessment"), false);`
- Line 523 · **unknown** · matched `executive-assessment`
  - `consumer: "executive-assessment",`

##### `engine/benchmark/judgment-lab/canonicalUnderstandingOwnershipMigrationGate.ts`

- Line 136 · **type** · matched `executiveAssessment`
  - `executiveAssessment: memory.executiveAssessment,`
- Line 254 · **unknown** · matched `executive-assessment`
  - `"07-executive-assessment-is-downstream-consumer",`
- Line 255 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment receives canonical compositions while remaining byte-identical to rollback output.",`
- Line 268 · **definition** · matched `executiveAssessment`
  - `"const executiveAssessment = buildExecutiveAssessment",`
- Line 286 · **read** · matched `executiveAssessment`
  - `stable(canonicalMemory.executiveAssessment),`
- Line 287 · **read** · matched `executiveAssessment`
  - `stable(legacyMemory.executiveAssessment),`
- Line 399 · **unknown** · matched `executiveAssessment`
  - `"engine/v3/model/judgment/buildExecutiveAssessment.ts",`
- Line 451 · **type** · matched `executiveAssessment`
  - `executiveAssessment: "downstream consumer",`

##### `engine/benchmark/judgment-lab/competingExplanationProductionShadow.ts`

- Line 68 · **unknown** · matched `executiveAssessment`
  - `\| "ExecutiveAssessment";`
- Line 671 · **read** · matched `executiveAssessment`
  - `...(extendedMemory.executiveAssessment`
- Line 674 · **unknown** · matched `executiveAssessment`
  - `layer: "ExecutiveAssessment" as const,`
- Line 675 · **read** · matched `executiveAssessment`
  - `value: extendedMemory.executiveAssessment,`
- Line 676 · **unknown** · matched `executive-assessment`
  - `fallback: "executive-assessment",`
- Line 873 · **read** · matched `executiveAssessment`
  - `extendedMemory.executiveAssessment ??`
- Line 874 · **read** · matched `executiveAssessment`
  - `execution.result.executiveAssessment ??`

##### `engine/benchmark/judgment-lab/decisiveEvidenceAblation.ts`

- Line 156 · **read** · matched `executiveAssessment`
  - `const assessment = record(memory.executiveAssessment);`

##### `engine/benchmark/judgment-lab/evaluateJudgment.ts`

- Line 83 · **unknown** · matched `Executive Assessment`
  - `add(!scorecard.causalFidelity.passed, "mechanism-selection", "Expected causal mechanisms were not preserved.", "Mechanisms and Executive Assessment", scorecard.causalFidelity.evidence);`

##### `engine/benchmark/judgment-lab/evidenceIndependenceShadowEvaluation.ts`

- Line 29 · **unknown** · matched `executiveAssessment`
  - `\| "executiveAssessment"`
- Line 183 · **unknown** · matched `executiveAssessment`
  - `case "executiveAssessment":`
- Line 184 · **read** · matched `executiveAssessment`
  - `return memory.executiveAssessment`
- Line 185 · **read** · matched `executiveAssessment`
  - `? [record(memory.executiveAssessment)]`
- Line 309 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

##### `engine/benchmark/judgment-lab/explicitAuthorityTransitionsGate.ts`

- Line 145 · **type** · matched `executiveAssessment`
  - `executiveAssessment: memory.executiveAssessment,`
- Line 417 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment, recommendation, communication, projection, and product views remain byte-identical to the pre-authority path.",`

##### `engine/benchmark/judgment-lab/mechanismEvidenceCompositionGroundTruth.ts`

- Line 404 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`

##### `engine/benchmark/judgment-lab/runJudgmentLab.ts`

- Line 66 · **read** · matched `executiveAssessment`
  - `const assessment = record(memory.executiveAssessment);`

##### `engine/benchmark/judgment-lab/themeEvidenceCompositionIsolation.ts`

- Line 30 · **unknown** · matched `executiveAssessment`
  - `\| "executiveAssessment"`
- Line 241 · **unknown** · matched `executiveAssessment`
  - `case "executiveAssessment":`
- Line 242 · **read** · matched `executiveAssessment`
  - `return memory.executiveAssessment`
- Line 243 · **read** · matched `executiveAssessment`
  - `? [record(memory.executiveAssessment)]`
- Line 473 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

##### `engine/benchmark/judgment-lab/unadjudicatedExplanationUnderstandingShadowGate.ts`

- Line 319 · **type** · matched `executiveAssessment`
  - `executiveAssessment: {`
- Line 353 · **type** · matched `executiveAssessment`
  - `executiveAssessment: { summary: "Current assessment", confidence: 0.7 },`

##### `engine/benchmark/judgment-lab/validateJudgmentLabProvenance.ts`

- Line 91 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: unknown;`
- Line 99 · **type** · matched `executiveAssessment`
  - `executiveAssessment: memory.executiveAssessment,`

##### `engine/benchmark/localized-nonlinear-cognition-experiment-001/RESULTS.json`

- Line 21 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment"`

##### `engine/benchmark/localized-nonlinear-cognition-experiment-001/productionPathAudit.ts`

- Line 7 · **unknown** · matched `Executive Assessment`
  - `"Organizational State", "Executive Assessment",`

##### `engine/benchmark/runAtlasSimulation.ts`

- Line 552 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment = asRecord(memory.executiveAssessment);`
- Line 554 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.theoryValidation,`
- Line 565 · **unknown** · matched `executiveAssessment`
  - `asString(executiveAssessment.summary) ??`
- Line 574 · **unknown** · matched `executiveAssessment`
  - `asNumber(executiveAssessment.confidence);`
- Line 595 · **unknown** · matched `Executive Assessment`
  - `"EXECUTIVE ASSESSMENT",`
- Line 596 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.executiveNarrative ??`
- Line 597 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment.summary,`

##### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 130 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: {`
- Line 241 · **read** · matched `executiveAssessment`
  - `BenchmarkRuntimeMemory["executiveAssessment"]`
- Line 379 · **definition** · matched `executiveAssessment`
  - `const executiveAssessment =`
- Line 380 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 383 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 387 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 391 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 397 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 424 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment?.summary,`
- Line 425 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 427 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 430 · **read** · matched `executiveAssessment`
  - `...(memory.executiveAssessment`
- Line 433 · **read** · matched `executiveAssessment`
  - `...(memory.executiveAssessment`
- Line 455 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 487 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`
- Line 496 · **unknown** · matched `executiveAssessment`
  - `executiveAssessment,`
- Line 529 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment`

##### `engine/benchmark/runtime/cognitiveInventory001.ts`

- Line 22 · **unknown** · matched `executiveAssessment`
  - `\| "executiveAssessment";`
- Line 54 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: UnknownRecord;`
- Line 159 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 160 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 708 · **unknown** · matched `executiveAssessment`
  - `case "executiveAssessment": {`
- Line 711 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`
- Line 797 · **unknown** · matched `executiveAssessment`
  - `function printExecutiveAssessmentDetails(`
- Line 1270 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`
- Line 1364 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment"`
- Line 1366 · **unknown** · matched `executiveAssessment`
  - `printExecutiveAssessmentDetails(`

##### `engine/benchmark/runtime/cognitiveSemanticNormalizationAudit001.ts`

- Line 22 · **unknown** · matched `executiveAssessment`
  - `\| "executiveAssessment";`
- Line 54 · **type** · matched `executiveAssessment`
  - `executiveAssessment?: UnknownRecord;`
- Line 72 · **unknown** · matched `executive-assessment`
  - `\| "executive-assessment"`
- Line 201 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 202 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 231 · **type** · matched `executiveAssessment`
  - `executiveAssessment:`
- Line 232 · **unknown** · matched `executive-assessment`
  - `"executive-assessment",`
- Line 520 · **unknown** · matched `executiveAssessment`
  - `case "executiveAssessment": {`
- Line 523 · **read** · matched `executiveAssessment`
  - `memory.executiveAssessment,`
- Line 910 · **unknown** · matched `Executive Assessment`
  - `"executive assessment",`
- Line 922 · **unknown** · matched `executive-assessment`
  - `"executive-assessment",`
- Line 1317 · **unknown** · matched `executiveAssessment`
  - `"executiveAssessment",`

#### Other

##### `scripts/cognition/generateArchitectureHandoff.mjs`

- Line 372 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 63 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`
- Line 972 · **unknown** · matched `Executive Assessment`
  - `"Executive Assessment",`

##### `scripts/cognition/generateCognitiveRegistry.mjs`

- Line 83 · **unknown** · matched `executiveAssessment`
  - `/executiveAssessment/i,`

##### `scripts/cognition/renderSprintStartup.mjs`

- Line 289 · **unknown** · matched `Executive Assessment`
  - `"Inspect: organization identity and persistence; memory structure; Understandings; Themes and semantic patterns; Phenomena; mechanism ancestry; organizational beliefs; semantic cohorts; concept candidates; conceptualUnderstanding; organizational conditions; primary executive constraint; executive assessment; executive recommendation; executive communication; decision records; learning state.",`

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 73 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 160 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 168 · **unknown** · matched `executiveAssessment`
  - `"ExecutiveAssessment",`
- Line 187 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 195 · **unknown** · matched `executiveAssessment`
  - `"ExecutiveAssessment",`
- Line 212 · **unknown** · matched `CAP-UND-005`
  - `"CAP-UND-005",`
- Line 219 · **unknown** · matched `executiveAssessment`
  - `"ExecutiveAssessment",`

##### `scripts/product/validateAlphaYourOrganizationActivation.ts`

- Line 142 · **type** · matched `executiveAssessment`
  - `executiveAssessment: {`
- Line 145 · **assignment** · matched `executiveAssessment`
  - `}).executiveAssessment = {`

##### `scripts/product/validateAskExperience.ts`

- Line 56 · **read** · matched `executiveAssessment`
  - `delete sparseMemory.executiveAssessment;`

##### `scripts/product/validateLivingInteractionLoop.ts`

- Line 17 · **assignment** · matched `executiveAssessment`
  - `memory.executiveAssessment = { primaryJudgment: { dominantConditionId: "condition-decision-flow", confidence: 0.8 }, summary: "Decision Flow is constrained." };`
- Line 20 · **unknown** · matched `executive-assessment`
  - `id: "understanding-loop", source: "executive-assessment", title: "Decision authority is slowing execution.", statement: "Decision authority is slowing execution.", summary: "Routine decisions wait for senior approval.", confidence: 0.8,`

##### `scripts/product/validateOrganizationExperience.ts`

- Line 31 · **unknown** · matched `executive-assessment`
  - `source: "executive-assessment",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
