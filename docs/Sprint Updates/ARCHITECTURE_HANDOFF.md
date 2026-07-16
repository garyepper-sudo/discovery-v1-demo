# Discovery Architecture Handoff

Generated: 2026-07-16T01:19:10.191Z

## Purpose

This document is the canonical architecture handoff for beginning a new Discovery sprint or chat.

Before proposing a new capability, use this document to verify whether the responsibility, cognitive object, canonical producer, Runtime destination, or executive destination already exists.

## Permanent Development Rule

Before adding any new cognitive capability:

1. Search the Cognitive Capability Registry.
2. Search existing produced cognitive objects.
3. Search canonical producers and implementation files.
4. Review potential semantic overlaps.
5. Extend an existing capability unless a distinct architectural responsibility is proven.

## Architecture Health

- Registered capabilities: 28
- Canonical producers: 28
- Registered files: 482
- Terminal capabilities: 5
- Duplicate capability IDs: 0
- Missing dependencies: 0
- Missing canonical producers: 0
- Capabilities without producer: 0
- Capabilities without consumers: 0
- Capabilities without Runtime destination: 0
- Files implementing multiple capabilities: 0

## Canonical Capability Registry

| ID | Capability | Layer | Produces | Runtime Destination | Consumers |
|---|---|---|---|---|---|
| CAP-PER-001 | Evidence Ingestion | COG | V3Evidence | DiscoveryV3Result.evidence | CAP-PER-002 |
| CAP-PER-002 | Organizational Observation Inference | COG | OrganizationalObservation | OrganizationModel.observations | CAP-UND-001 |
| CAP-UND-001 | Organizational Mechanism Inference | COG | OrganizationalMechanism | OrganizationModel.mechanisms | CAP-ABS-001, CAP-SELF-001, CAP-UND-002, CAP-UND-003, CAP-UND-004, CAP-UND-005 |
| CAP-UND-002 | Organizational Belief Formation | COG | OrganizationalBelief | OrganizationModel.beliefs | CAP-ABS-001, CAP-LRN-001, CAP-SELF-001, CAP-SIM-001, CAP-UND-003, CAP-UND-004, CAP-UND-005 |
| CAP-UND-003 | Organizational Theory Formation | COG | OrganizationalTheory | OrganizationalMemory.theories | CAP-SELF-001, CAP-UND-004, CAP-UND-005 |
| CAP-UND-004 | Organizational Condition Inference | EXEC | OrganizationalCondition | OrganizationRuntime.organizationalConditions | CAP-ADP-001, CAP-COM-001, CAP-OPT-001, CAP-OPT-002, CAP-PRD-001, CAP-SELF-002, CAP-SIM-001, CAP-UND-005 |
| CAP-UND-005 | Executive Assessment | EXEC | ExecutiveAssessment | OrganizationRuntime.executiveAssessment | CAP-COM-001, CAP-DEC-001, CAP-DEC-002, CAP-UND-006 |
| CAP-UND-006 | Executive Understanding Synthesis | COG | OrganizationalUnderstanding, OrganizationalUnderstandingState | OrganizationRuntime.organizationalUnderstandingState | CAP-COM-001, CAP-DEC-001 |
| CAP-MEM-001 | Organizational Runtime Persistence | RUN | OrganizationRuntime | OrganizationRuntime | CAP-LRN-001, CAP-LRN-002, CAP-SYS-001, CAP-UND-006 |
| CAP-LRN-001 | Organizational Belief Evolution | COG | OrganizationalBeliefRevision | OrganizationRuntime.organizationalBeliefRevisions | CAP-LRN-002 |
| CAP-LRN-002 | Organizational Learning Profile | COG | OrganizationalLearningProfile | OrganizationRuntime.organizationalLearningProfile | CAP-COM-001, CAP-PRD-001, CAP-SIM-001 |
| CAP-ABS-001 | Organizational Concept Formation | COG | OrganizationalConcept | OrganizationModel.concepts | CAP-UND-003 |
| CAP-SELF-001 | Theory Validation | COG | TheoryValidation | ExecutiveAssessment.theoryValidation | CAP-SELF-002, CAP-SYS-001 |
| CAP-SELF-002 | Investigation Opportunity Generation | EXEC | InvestigationOpportunity | OrganizationRuntime.investigationOpportunities | CAP-COM-001, CAP-SYS-001 |
| CAP-PRD-001 | Organizational Prediction | COG | OrganizationalPrediction | OrganizationRuntime.organizationalPredictions | CAP-ADP-001, CAP-PRD-002, CAP-SIM-001 |
| CAP-PRD-002 | Prediction Reflection | COG | PredictionReflection | OrganizationRuntime.predictionReflection | CAP-ADP-001, CAP-COM-001, CAP-DEC-001, CAP-DEC-002, CAP-UND-005 |
| CAP-ADP-001 | Prediction Outcome Evaluation | COG | PredictionEvaluation | OrganizationRuntime.predictionEvaluations | CAP-LRN-002, CAP-SIM-001 |
| CAP-SYS-001 | Architectural Planning | SYS | ArchitectureRecommendation | DiscoveryArchitectureState.architectureRecommendations | CAP-SYS-002 |
| CAP-SYS-002 | Architecture Recommendation Projection | SYS | ArchitectureRecommendationProjection | DiscoveryArchitectureState.architectureRecommendationProjection | None |
| CAP-SIM-001 | Organizational Simulation | COG | SimulatedOrganizationState | OrganizationRuntime.simulatedOrganizationStates | CAP-COM-001, CAP-DEC-001, CAP-DEC-002, CAP-SYS-001 |
| CAP-SIM-002 | Organizational Intervention Modeling | COG | OrganizationalIntervention | OrganizationRuntime.organizationalInterventions | CAP-DEC-001, CAP-SIM-001 |
| CAP-DEC-001 | Executive Decision Orchestration | EXEC | ExecutiveDecisionCycle | ExecutiveDecisionCycle | Terminal capability |
| CAP-DEC-002 | Cross-Scenario Comparison | EXEC | ExecutiveScenarioComparisonEntry, ExecutiveScenarioComparisonSet | ExecutiveDecisionCycle.comparisonSet | CAP-DEC-001, CAP-DEC-003, CAP-DEC-004 |
| CAP-DEC-003 | Executive Decision Ranking | EXEC | RankedExecutiveScenario | ExecutiveDecisionCycle.rankedScenarios | CAP-DEC-001, CAP-DEC-004 |
| CAP-DEC-004 | Executive Recommendation Synthesis | EXEC | ExecutiveDecisionRecommendation | ExecutiveDecisionCycle.recommendation | CAP-DEC-001 |
| CAP-OPT-001 | Optimization Variable Selection | EXEC | OptimizationVariable | ExecutiveDecisionCycle.optimizationObjective.variables | CAP-OPT-002 |
| CAP-OPT-002 | Executive Optimization Objective Synthesis | EXEC | ExecutiveOptimizationObjective | ExecutiveDecisionCycle.optimizationObjective | CAP-DEC-001 |
| CAP-COM-001 | Executive Communication Synthesis | EXEC | ExecutiveNarrative, ExecutiveCommunication | ExecutiveCommunication | Terminal capability |

## Capability Dependency Map

### CAP-PER-001 — Evidence Ingestion

**Depends on:** No registered capability dependencies

**Produces:** V3Evidence

**Canonical producer:** `engine/v3/evidence.ts`

**Runtime destination:** `DiscoveryV3Result.evidence`

**Executive destinations:** None declared

### CAP-PER-002 — Organizational Observation Inference

**Depends on:** CAP-PER-001

**Produces:** OrganizationalObservation

**Canonical producer:** `engine/v3/model/observations/inferOrganizationalObservations.ts`

**Runtime destination:** `OrganizationModel.observations`

**Executive destinations:** None declared

### CAP-UND-001 — Organizational Mechanism Inference

**Depends on:** CAP-PER-002

**Produces:** OrganizationalMechanism

**Canonical producer:** `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`

**Runtime destination:** `OrganizationModel.mechanisms`

**Executive destinations:** ExecutiveAssessment, TheoryValidation

### CAP-UND-002 — Organizational Belief Formation

**Depends on:** CAP-UND-001

**Produces:** OrganizationalBelief

**Canonical producer:** `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`

**Runtime destination:** `OrganizationModel.beliefs`

**Executive destinations:** OrganizationalBeliefs, TheoryValidation, OrganizationalConditions

### CAP-UND-003 — Organizational Theory Formation

**Depends on:** CAP-ABS-001, CAP-UND-002

**Produces:** OrganizationalTheory

**Canonical producer:** `engine/v3/model/judgment/formOrganizationalTheories.ts`

**Runtime destination:** `OrganizationalMemory.theories`

**Executive destinations:** TheoryValidation, ExecutiveAssessment

### CAP-UND-004 — Organizational Condition Inference

**Depends on:** CAP-UND-001, CAP-UND-002, CAP-UND-003

**Produces:** OrganizationalCondition

**Canonical producer:** `engine/v3/model/state/inferOrganizationalConditions.ts`

**Runtime destination:** `OrganizationRuntime.organizationalConditions`

**Executive destinations:** OrganizationalConditions, OrganizationalState, ExecutiveAssessment, InvestigationOpportunities

### CAP-UND-005 — Executive Assessment

**Depends on:** CAP-UND-001, CAP-UND-002, CAP-UND-003, CAP-UND-004, CAP-PRD-002

**Produces:** ExecutiveAssessment

**Canonical producer:** `engine/v3/model/judgment/buildExecutiveAssessment.ts`

**Runtime destination:** `OrganizationRuntime.executiveAssessment`

**Executive destinations:** OrganizationalUnderstanding, ExecutiveProjection, ExecutiveWorkspace

### CAP-UND-006 — Executive Understanding Synthesis

**Depends on:** CAP-UND-005, CAP-MEM-001

**Produces:** OrganizationalUnderstanding, OrganizationalUnderstandingState

**Canonical producer:** `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`

**Runtime destination:** `OrganizationRuntime.organizationalUnderstandingState`

**Executive destinations:** ExecutiveProjection, ExecutiveWorkspace, Atlas

### CAP-MEM-001 — Organizational Runtime Persistence

**Depends on:** No registered capability dependencies

**Produces:** OrganizationRuntime

**Canonical producer:** `engine/v3/runtime/organizationStateStore.ts`

**Runtime destination:** `OrganizationRuntime`

**Executive destinations:** None declared

### CAP-LRN-001 — Organizational Belief Evolution

**Depends on:** CAP-UND-002, CAP-MEM-001

**Produces:** OrganizationalBeliefRevision

**Canonical producer:** `engine/v3/model/beliefs/updateOrganizationalBeliefs.ts`

**Runtime destination:** `OrganizationRuntime.organizationalBeliefRevisions`

**Executive destinations:** OrganizationalBeliefs, OrganizationalLearningProfile

### CAP-LRN-002 — Organizational Learning Profile

**Depends on:** CAP-MEM-001, CAP-LRN-001

**Produces:** OrganizationalLearningProfile

**Canonical producer:** `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

**Runtime destination:** `OrganizationRuntime.organizationalLearningProfile`

**Executive destinations:** OrganizationalLearningProfile, ExecutiveProjection

### CAP-ABS-001 — Organizational Concept Formation

**Depends on:** CAP-UND-001, CAP-UND-002

**Produces:** OrganizationalConcept

**Canonical producer:** `engine/v3/concepts/synthesizeOrganizationalConcepts.ts`

**Runtime destination:** `OrganizationModel.concepts`

**Executive destinations:** ExecutiveAssessment, ExecutiveProjection

### CAP-SELF-001 — Theory Validation

**Depends on:** CAP-UND-001, CAP-UND-002, CAP-UND-003

**Produces:** TheoryValidation

**Canonical producer:** `engine/v3/model/judgment/buildTheoryReflection.ts`

**Runtime destination:** `ExecutiveAssessment.theoryValidation`

**Executive destinations:** TheoryValidation, ExecutiveProjection

### CAP-SELF-002 — Investigation Opportunity Generation

**Depends on:** CAP-UND-004, CAP-SELF-001

**Produces:** InvestigationOpportunity

**Canonical producer:** `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

**Runtime destination:** `OrganizationRuntime.investigationOpportunities`

**Executive destinations:** InvestigationOpportunities, ExecutiveProjection

### CAP-PRD-001 — Organizational Prediction

**Depends on:** CAP-UND-004, CAP-LRN-002

**Produces:** OrganizationalPrediction

**Canonical producer:** `engine/v3/model/predictions/inferOrganizationalPredictions.ts`

**Runtime destination:** `OrganizationRuntime.organizationalPredictions`

**Executive destinations:** PredictionReflection

### CAP-PRD-002 — Prediction Reflection

**Depends on:** CAP-PRD-001

**Produces:** PredictionReflection

**Canonical producer:** `engine/v3/model/predictions/buildPredictionReflection.ts`

**Runtime destination:** `OrganizationRuntime.predictionReflection`

**Executive destinations:** ExecutiveAssessment, OrganizationalUnderstanding, Atlas

### CAP-ADP-001 — Prediction Outcome Evaluation

**Depends on:** CAP-PRD-001, CAP-PRD-002, CAP-UND-004

**Produces:** PredictionEvaluation

**Canonical producer:** `engine/v3/model/predictions/evaluatePredictionOutcomes.ts`

**Runtime destination:** `OrganizationRuntime.predictionEvaluations`

**Executive destinations:** ExecutiveAssessment, ExecutiveProjection, ExecutiveWorkspace, Atlas

### CAP-SYS-001 — Architectural Planning

**Depends on:** CAP-MEM-001, CAP-SELF-001, CAP-SELF-002

**Produces:** ArchitectureRecommendation

**Canonical producer:** `scripts/cognition/planArchitecture.mjs`

**Runtime destination:** `DiscoveryArchitectureState.architectureRecommendations`

**Executive destinations:** SprintBrief, ArchitectureHandoff

### CAP-SYS-002 — Architecture Recommendation Projection

**Depends on:** CAP-SYS-001

**Produces:** ArchitectureRecommendationProjection

**Canonical producer:** `scripts/cognition/projectArchitectureRecommendation.mjs`

**Runtime destination:** `DiscoveryArchitectureState.architectureRecommendationProjection`

**Executive destinations:** SprintBrief, ArchitectureHandoff

### CAP-SIM-001 — Organizational Simulation

**Depends on:** CAP-SIM-002, CAP-UND-004, CAP-UND-002, CAP-PRD-001, CAP-ADP-001, CAP-LRN-002

**Produces:** SimulatedOrganizationState

**Canonical producer:** `engine/v3/model/simulate/simulateOrganization.ts`

**Runtime destination:** `OrganizationRuntime.simulatedOrganizationStates`

**Executive destinations:** ExecutiveProjection, ExecutiveWorkspace, Atlas

### CAP-SIM-002 — Organizational Intervention Modeling

**Depends on:** No registered capability dependencies

**Produces:** OrganizationalIntervention

**Canonical producer:** `engine/v3/model/simulate/buildOrganizationalIntervention.ts`

**Runtime destination:** `OrganizationRuntime.organizationalInterventions`

**Executive destinations:** Simulation

### CAP-DEC-001 — Executive Decision Orchestration

**Depends on:** CAP-SIM-001, CAP-SIM-002, CAP-UND-005, CAP-UND-006, CAP-PRD-002, CAP-OPT-002, CAP-DEC-002, CAP-DEC-003, CAP-DEC-004

**Produces:** ExecutiveDecisionCycle

**Canonical producer:** `engine/v3/decisions/runExecutiveDecisionCycle.ts`

**Runtime destination:** `ExecutiveDecisionCycle`

**Executive destinations:** ExecutiveDecisionProjection, ExecutiveDecisionWorkspace, Atlas

### CAP-DEC-002 — Cross-Scenario Comparison

**Depends on:** CAP-SIM-001, CAP-UND-005, CAP-PRD-002

**Produces:** ExecutiveScenarioComparisonEntry, ExecutiveScenarioComparisonSet

**Canonical producer:** `engine/v3/decisions/compareExecutiveScenarios.ts`

**Runtime destination:** `ExecutiveDecisionCycle.comparisonSet`

**Executive destinations:** ExecutiveDecisionProjection, ExecutiveDecisionWorkspace, Atlas

### CAP-DEC-003 — Executive Decision Ranking

**Depends on:** CAP-DEC-002

**Produces:** RankedExecutiveScenario

**Canonical producer:** `engine/v3/decisions/rankExecutiveScenarios.ts`

**Runtime destination:** `ExecutiveDecisionCycle.rankedScenarios`

**Executive destinations:** ExecutiveDecisionProjection, ExecutiveDecisionWorkspace, Atlas

### CAP-DEC-004 — Executive Recommendation Synthesis

**Depends on:** CAP-DEC-002, CAP-DEC-003

**Produces:** ExecutiveDecisionRecommendation

**Canonical producer:** `engine/v3/decisions/buildExecutiveDecisionRecommendation.ts`

**Runtime destination:** `ExecutiveDecisionCycle.recommendation`

**Executive destinations:** ExecutiveDecisionProjection, ExecutiveDecisionWorkspace, Atlas

### CAP-OPT-001 — Optimization Variable Selection

**Depends on:** CAP-UND-004

**Produces:** OptimizationVariable

**Canonical producer:** `engine/v3/optimization/selectOptimizationVariables.ts`

**Runtime destination:** `ExecutiveDecisionCycle.optimizationObjective.variables`

**Executive destinations:** ExecutiveOptimizationObjective, ExecutiveDecisionProjection, ExecutiveDecisionWorkspace, Atlas

### CAP-OPT-002 — Executive Optimization Objective Synthesis

**Depends on:** CAP-OPT-001, CAP-UND-004

**Produces:** ExecutiveOptimizationObjective

**Canonical producer:** `engine/v3/optimization/synthesizeExecutiveOptimizationObjective.ts`

**Runtime destination:** `ExecutiveDecisionCycle.optimizationObjective`

**Executive destinations:** ExecutiveDecisionProjection, ExecutiveDecisionWorkspace, Atlas

### CAP-COM-001 — Executive Communication Synthesis

**Depends on:** CAP-UND-004, CAP-UND-005, CAP-UND-006, CAP-LRN-002, CAP-PRD-002, CAP-SIM-001, CAP-SELF-002

**Produces:** ExecutiveNarrative, ExecutiveCommunication

**Canonical producer:** `engine/v3/communication/synthesizeExecutiveCommunication.ts`

**Runtime destination:** `ExecutiveCommunication`

**Executive destinations:** ExecutiveWorkspaceV3

## Potential Capability Overlap

### CAP-UND-004 — Organizational Condition Inference

Possible overlap with **CAP-UND-005 — Executive Assessment**.

Reason: semantic similarity 36%.

Review before creating a new capability. Similarity does not automatically mean duplication; one capability may legitimately depend on or transform another.

### CAP-OPT-001 — Optimization Variable Selection

Possible overlap with **CAP-OPT-002 — Executive Optimization Objective Synthesis**.

Reason: semantic similarity 31%.

Review before creating a new capability. Similarity does not automatically mean duplication; one capability may legitimately depend on or transform another.

### CAP-DEC-002 — Cross-Scenario Comparison

Possible overlap with **CAP-DEC-003 — Executive Decision Ranking**.

Reason: semantic similarity 30%.

Review before creating a new capability. Similarity does not automatically mean duplication; one capability may legitimately depend on or transform another.

## Canonical Pipeline

## Canonical Pipeline

```text
Evidence Ingestion
↓
Organizational Observation Inference
↓
Organizational Mechanism Inference
↓
Organizational Belief Formation
↓
Organizational Theory Formation
↓
Organizational Condition Inference
↓
Executive Assessment
↓
Executive Understanding Synthesis
↓
Organizational Prediction
↓
Executive Decision
↓
Optimization Variable Selection
↓
Executive Optimization Objective
↓
Intervention Generation
↓
Constraint Evaluation
↓
Organizational Simulation
↓
Scenario Comparison
↓
Executive Decision Ranking
↓
Executive Recommendation
↓
Executive Communication
```

## Canonical Source Files

### CAP-PER-001 — Evidence Ingestion

- Canonical producer: `engine/v3/evidence.ts`
- Implementation: `engine/v3/evidence.ts`

### CAP-PER-002 — Organizational Observation Inference

- Canonical producer: `engine/v3/model/observations/inferOrganizationalObservations.ts`
- Implementation: `engine/v3/model/observations/inferOrganizationalObservations.ts`
- Implementation: `engine/v3/model/observations/organizationalObservations.ts`

### CAP-UND-001 — Organizational Mechanism Inference

- Canonical producer: `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`
- Implementation: `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`
- Implementation: `engine/v3/model/judgment/organizationalMechanism.ts`
- Implementation: `engine/v3/model/judgment/mechanismCandidateBuilder.ts`
- Implementation: `engine/v3/model/judgment/mechanismEvidenceAggregation.ts`

### CAP-UND-002 — Organizational Belief Formation

- Canonical producer: `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`
- Implementation: `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`
- Implementation: `engine/v3/model/beliefs/organizationalBeliefs.ts`

### CAP-UND-003 — Organizational Theory Formation

- Canonical producer: `engine/v3/model/judgment/formOrganizationalTheories.ts`
- Implementation: `engine/v3/model/judgment/formOrganizationalTheories.ts`
- Implementation: `engine/v3/model/judgment/organizationalTheory.ts`

### CAP-UND-004 — Organizational Condition Inference

- Canonical producer: `engine/v3/model/state/inferOrganizationalConditions.ts`
- Implementation: `engine/v3/model/state/inferOrganizationalConditions.ts`

### CAP-UND-005 — Executive Assessment

- Canonical producer: `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- Implementation: `engine/v3/model/judgment/buildExecutiveAssessment.ts`

### CAP-UND-006 — Executive Understanding Synthesis

- Canonical producer: `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
- Implementation: `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
- Implementation: `engine/v3/understanding/consolidateUnderstanding.ts`
- Implementation: `engine/v3/understanding/synthesizeUnderstanding.ts`
- Implementation: `engine/v3/runtime/evolveOrganizationRuntime.ts`

### CAP-MEM-001 — Organizational Runtime Persistence

- Canonical producer: `engine/v3/runtime/organizationStateStore.ts`
- Implementation: `engine/v3/runtime/organizationStateStore.ts`
- Implementation: `engine/v3/runtime/organizationRuntime.ts`

### CAP-LRN-001 — Organizational Belief Evolution

- Canonical producer: `engine/v3/model/beliefs/updateOrganizationalBeliefs.ts`
- Implementation: `engine/v3/model/beliefs/updateOrganizationalBeliefs.ts`
- Implementation: `engine/v3/cognition/beliefs/mergeBeliefs.ts`

### CAP-LRN-002 — Organizational Learning Profile

- Canonical producer: `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`
- Implementation: `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

### CAP-ABS-001 — Organizational Concept Formation

- Canonical producer: `engine/v3/concepts/synthesizeOrganizationalConcepts.ts`
- Implementation: `engine/v3/concepts/buildConceptCandidates.ts`
- Implementation: `engine/v3/concepts/compressConceptCandidates.ts`
- Implementation: `engine/v3/concepts/conceptCandidateTypes.ts`
- Implementation: `engine/v3/concepts/synthesizeOrganizationalConcepts.ts`
- Implementation: `engine/v3/compression/types.ts`

### CAP-SELF-001 — Theory Validation

- Canonical producer: `engine/v3/model/judgment/buildTheoryReflection.ts`
- Implementation: `engine/v3/model/judgment/buildTheoryReflection.ts`

### CAP-SELF-002 — Investigation Opportunity Generation

- Canonical producer: `engine/v3/model/investigation/buildInvestigationOpportunities.ts`
- Implementation: `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

### CAP-PRD-001 — Organizational Prediction

- Canonical producer: `engine/v3/model/predictions/inferOrganizationalPredictions.ts`
- Implementation: `engine/v3/model/predictions/inferOrganizationalPredictions.ts`
- Implementation: `engine/v3/model/predictions/organizationalPrediction.ts`
- Implementation: `engine/v3/model/predictions/predictionRules.ts`
- Implementation: `engine/v3/model/predictions/predictionTypes.ts`

### CAP-PRD-002 — Prediction Reflection

- Canonical producer: `engine/v3/model/predictions/buildPredictionReflection.ts`
- Implementation: `engine/v3/model/predictions/buildPredictionReflection.ts`

### CAP-ADP-001 — Prediction Outcome Evaluation

- Canonical producer: `engine/v3/model/predictions/evaluatePredictionOutcomes.ts`
- Implementation: `engine/v3/model/predictions/evaluatePredictionOutcomes.ts`

### CAP-SYS-001 — Architectural Planning

- Canonical producer: `scripts/cognition/planArchitecture.mjs`
- Implementation: `scripts/cognition/planArchitecture.mjs`

### CAP-SYS-002 — Architecture Recommendation Projection

- Canonical producer: `scripts/cognition/projectArchitectureRecommendation.mjs`
- Implementation: `scripts/cognition/projectArchitectureRecommendation.mjs`

### CAP-SIM-001 — Organizational Simulation

- Canonical producer: `engine/v3/model/simulate/simulateOrganization.ts`
- Implementation: `engine/v3/model/simulate/simulateOrganization.ts`

### CAP-SIM-002 — Organizational Intervention Modeling

- Canonical producer: `engine/v3/model/simulate/buildOrganizationalIntervention.ts`
- Implementation: `engine/v3/model/simulate/organizationalIntervention.ts`
- Implementation: `engine/v3/model/simulate/buildOrganizationalIntervention.ts`

### CAP-DEC-001 — Executive Decision Orchestration

- Canonical producer: `engine/v3/decisions/runExecutiveDecisionCycle.ts`
- Implementation: `engine/v3/decisions/runExecutiveDecisionCycle.ts`
- Implementation: `engine/v3/reasoning/generateInterventionOptions.ts`
- Implementation: `engine/v3/reasoning/convertInterventionOptionToIntervention.ts`
- Implementation: `engine/v3/reasoning/evaluateInterventionOption.ts`
- Implementation: `engine/v3/scenarios/buildExecutiveDecisionContext.ts`
- Implementation: `engine/v3/scenarios/runExecutiveScenario.ts`

### CAP-DEC-002 — Cross-Scenario Comparison

- Canonical producer: `engine/v3/decisions/compareExecutiveScenarios.ts`
- Implementation: `engine/v3/decisions/compareExecutiveScenarios.ts`

### CAP-DEC-003 — Executive Decision Ranking

- Canonical producer: `engine/v3/decisions/rankExecutiveScenarios.ts`
- Implementation: `engine/v3/decisions/rankExecutiveScenarios.ts`

### CAP-DEC-004 — Executive Recommendation Synthesis

- Canonical producer: `engine/v3/decisions/buildExecutiveDecisionRecommendation.ts`
- Implementation: `engine/v3/decisions/buildExecutiveDecisionRecommendation.ts`

### CAP-OPT-001 — Optimization Variable Selection

- Canonical producer: `engine/v3/optimization/selectOptimizationVariables.ts`
- Implementation: `engine/v3/optimization/optimizationVariable.ts`
- Implementation: `engine/v3/optimization/selectOptimizationVariables.ts`

### CAP-OPT-002 — Executive Optimization Objective Synthesis

- Canonical producer: `engine/v3/optimization/synthesizeExecutiveOptimizationObjective.ts`
- Implementation: `engine/v3/optimization/executiveOptimizationObjective.ts`
- Implementation: `engine/v3/optimization/synthesizeExecutiveOptimizationObjective.ts`

### CAP-COM-001 — Executive Communication Synthesis

- Canonical producer: `engine/v3/communication/synthesizeExecutiveCommunication.ts`
- Implementation: `engine/v3/communication/executiveNarrative.ts`
- Implementation: `engine/v3/communication/synthesizeExecutiveNarrative.ts`
- Implementation: `engine/v3/communication/executiveCommunication.ts`
- Implementation: `engine/v3/communication/synthesizeExecutiveCommunication.ts`

## Sprint 72 Architectural Milestone

Discovery now possesses the first complete implementation of its Executive Decision and Optimization Operating Systems.

Executive decisions are translated into machine-readable Executive Optimization Objectives before intervention generation, simulation, comparison, ranking, and recommendation.

The canonical executive decision pipeline is now:

```text
Executive Understanding
↓
Prediction
↓
Executive Decision
↓
Optimization
↓
Simulation
↓
Recommendation
↓
Communication
↓
Learning
```

Future development should strengthen optimization quality, constraint reasoning, executive decision quality, and the organizational learning flywheel rather than introduce additional parallel reasoning systems.

## Sprint Handoff Guidance

Treat the following files as canonical architectural sources:

- `docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json`
- `docs/Architecture/COGNITIVE_FILE_REGISTRY.json`
- `docs/Architecture/COGNITIVE_CAPABILITY_AUDIT.json`
- `docs/Architecture/COGNITIVE_OBJECT_MODEL.md`
- `docs/Sprint Updates/ARCHITECTURE_HANDOFF.md`

When architectural evidence conflicts, prefer the current registry and verified source-code trace over older sprint prose.

