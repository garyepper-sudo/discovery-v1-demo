# Discovery Architecture Handoff

Generated: 2026-07-12T13:50:22.655Z

## Purpose

This document is the canonical architecture handoff for beginning a new
Discovery sprint or chat.

Before proposing a new capability, use this document to verify whether
the responsibility, cognitive object, canonical producer, Runtime
destination, or executive destination already exists.

## Permanent Development Rule

Before adding any new cognitive capability:

1.  Search the Cognitive Capability Registry.
2.  Search existing produced cognitive objects.
3.  Search canonical producers and implementation files.
4.  Review potential semantic overlaps.
5.  Extend an existing capability unless a distinct architectural
    responsibility is proven.

## Sprint 24 Architectural Milestone

Discovery now includes a first-generation **Adaptive Investigation
Strategy**.

Rather than introducing a new Adaptation capability, Discovery extended
the existing **CAP-SELF-002 --- Investigation Opportunity Generation**
capability with an internal cognitive object:

-   `InvestigationStrategyRevision`

The canonical adaptive cognitive loop is now:

``` text
Evidence
↓
Understanding
↓
Learning
↓
Investigation Strategy
↓
Future Investigation
↓
New Evidence
```

The strategy is persisted in `OrganizationRuntime`, projected through
the Executive Projection, and is intended to evolve longitudinally
across investigations rather than within a single investigation.

The current benchmark validates the architectural wiring. Future work
should validate strategy transitions across multiple investigations of
the same organization.

## Architecture Health

-   Registered capabilities: 13
-   Canonical producers: 13
-   Registered files: 384
-   Terminal capabilities: 3
-   Duplicate capability IDs: 0
-   Missing dependencies: 0
-   Missing canonical producers: 0
-   Capabilities without producer: 0
-   Capabilities without consumers: 0
-   Capabilities without Runtime destination: 0
-   Files implementing multiple capabilities: 0

## Canonical Capability Registry

  -----------------------------------------------------------------------------------------------------------------------------------------------------
  ID             Capability       Layer       Produces                           Runtime Destination                                    Consumers
  -------------- ---------------- ----------- ---------------------------------- ------------------------------------------------------ ---------------
  CAP-PER-001    Evidence         COG         V3Evidence                         DiscoveryV3Result.evidence                             CAP-PER-002
                 Ingestion                                                                                                              

  CAP-PER-002    Organizational   COG         OrganizationalObservation          OrganizationModel.observations                         CAP-UND-001
                 Observation                                                                                                            
                 Inference                                                                                                              

  CAP-UND-001    Organizational   COG         OrganizationalMechanism            OrganizationModel.mechanisms                           CAP-SELF-001,
                 Mechanism                                                                                                              CAP-UND-002,
                 Inference                                                                                                              CAP-UND-003,
                                                                                                                                        CAP-UND-004,
                                                                                                                                        CAP-UND-005

  CAP-UND-002    Organizational   COG         OrganizationalBelief               OrganizationModel.beliefs                              CAP-LRN-001,
                 Belief Formation                                                                                                       CAP-SELF-001,
                                                                                                                                        CAP-UND-003,
                                                                                                                                        CAP-UND-004,
                                                                                                                                        CAP-UND-005

  CAP-UND-003    Organizational   COG         OrganizationalTheory               OrganizationalMemory.theories                          CAP-SELF-001,
                 Theory Formation                                                                                                       CAP-UND-004,
                                                                                                                                        CAP-UND-005

  CAP-UND-004    Organizational   EXEC        OrganizationalCondition            OrganizationRuntime.organizationalConditions           CAP-SELF-002,
                 Condition                                                                                                              CAP-UND-005
                 Inference                                                                                                              

  CAP-UND-005    Executive        EXEC        ExecutiveAssessment                OrganizationRuntime.executiveAssessment                CAP-UND-006
                 Assessment                                                                                                             

  CAP-UND-006    Executive        COG         OrganizationalUnderstanding,       OrganizationRuntime.organizationalUnderstandingState   Terminal
                 Understanding                OrganizationalUnderstandingState                                                          capability
                 Synthesis                                                                                                              

  CAP-MEM-001    Organizational   RUN         OrganizationRuntime                OrganizationRuntime                                    CAP-LRN-001,
                 Runtime                                                                                                                CAP-LRN-002,
                 Persistence                                                                                                            CAP-UND-006

  CAP-LRN-001    Organizational   COG         OrganizationalBeliefRevision       OrganizationRuntime.organizationalBeliefRevisions      CAP-LRN-002
                 Belief Evolution                                                                                                       

  CAP-LRN-002    Organizational   COG         OrganizationalLearningProfile      OrganizationRuntime.organizationalLearningProfile      Terminal
                 Learning Profile                                                                                                       capability

  CAP-SELF-001   Theory           COG         TheoryValidation                   ExecutiveAssessment.theoryValidation                   CAP-SELF-002
                 Validation                                                                                                             

  CAP-SELF-002   Investigation    EXEC        InvestigationOpportunity,          OrganizationRuntime.investigationOpportunities,        Terminal
                 Opportunity                  InvestigationStrategyRevision      OrganizationRuntime.investigationStrategy              capability
                 Generation                                                                                                             
  -----------------------------------------------------------------------------------------------------------------------------------------------------

## Capability Dependency Map

### CAP-PER-001 --- Evidence Ingestion

**Depends on:** No registered capability dependencies

**Produces:** V3Evidence

**Canonical producer:** `engine/v3/evidence.ts`

**Runtime destination:** `DiscoveryV3Result.evidence`

**Executive destinations:** None declared

### CAP-PER-002 --- Organizational Observation Inference

**Depends on:** CAP-PER-001

**Produces:** OrganizationalObservation

**Canonical producer:**
`engine/v3/model/observations/inferOrganizationalObservations.ts`

**Runtime destination:** `OrganizationModel.observations`

**Executive destinations:** None declared

### CAP-UND-001 --- Organizational Mechanism Inference

**Depends on:** CAP-PER-002

**Produces:** OrganizationalMechanism

**Canonical producer:**
`engine/v3/model/judgment/inferOrganizationalMechanisms.ts`

**Runtime destination:** `OrganizationModel.mechanisms`

**Executive destinations:** ExecutiveAssessment, TheoryValidation

### CAP-UND-002 --- Organizational Belief Formation

**Depends on:** CAP-UND-001

**Produces:** OrganizationalBelief

**Canonical producer:**
`engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`

**Runtime destination:** `OrganizationModel.beliefs`

**Executive destinations:** OrganizationalBeliefs, TheoryValidation,
OrganizationalConditions

### CAP-UND-003 --- Organizational Theory Formation

**Depends on:** CAP-UND-001, CAP-UND-002

**Produces:** OrganizationalTheory

**Canonical producer:**
`engine/v3/model/judgment/formOrganizationalTheories.ts`

**Runtime destination:** `OrganizationalMemory.theories`

**Executive destinations:** TheoryValidation, ExecutiveAssessment

### CAP-UND-004 --- Organizational Condition Inference

**Depends on:** CAP-UND-001, CAP-UND-002, CAP-UND-003

**Produces:** OrganizationalCondition

**Canonical producer:**
`engine/v3/model/state/inferOrganizationalConditions.ts`

**Runtime destination:** `OrganizationRuntime.organizationalConditions`

**Executive destinations:** OrganizationalConditions,
OrganizationalState, ExecutiveAssessment, InvestigationOpportunities

### CAP-UND-005 --- Executive Assessment

**Depends on:** CAP-UND-001, CAP-UND-002, CAP-UND-003, CAP-UND-004

**Produces:** ExecutiveAssessment

**Canonical producer:**
`engine/v3/model/judgment/buildExecutiveAssessment.ts`

**Runtime destination:** `OrganizationRuntime.executiveAssessment`

**Executive destinations:** OrganizationalUnderstanding,
ExecutiveProjection, ExecutiveWorkspace

### CAP-UND-006 --- Executive Understanding Synthesis

**Depends on:** CAP-UND-005, CAP-MEM-001

**Produces:** OrganizationalUnderstanding,
OrganizationalUnderstandingState

**Canonical producer:**
`engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`

**Runtime destination:**
`OrganizationRuntime.organizationalUnderstandingState`

**Executive destinations:** ExecutiveProjection, ExecutiveWorkspace,
Atlas

### CAP-MEM-001 --- Organizational Runtime Persistence

**Depends on:** No registered capability dependencies

**Produces:** OrganizationRuntime

**Canonical producer:** `engine/v3/runtime/organizationStateStore.ts`

**Runtime destination:** `OrganizationRuntime`

**Executive destinations:** None declared

### CAP-LRN-001 --- Organizational Belief Evolution

**Depends on:** CAP-UND-002, CAP-MEM-001

**Produces:** OrganizationalBeliefRevision

**Canonical producer:**
`engine/v3/model/beliefs/updateOrganizationalBeliefs.ts`

**Runtime destination:**
`OrganizationRuntime.organizationalBeliefRevisions`

**Executive destinations:** OrganizationalBeliefs,
OrganizationalLearningProfile

### CAP-LRN-002 --- Organizational Learning Profile

**Depends on:** CAP-MEM-001, CAP-LRN-001

**Produces:** OrganizationalLearningProfile

**Canonical producer:**
`engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

**Runtime destination:**
`OrganizationRuntime.organizationalLearningProfile`

**Executive destinations:** OrganizationalLearningProfile,
ExecutiveProjection

### CAP-SELF-001 --- Theory Validation

**Depends on:** CAP-UND-001, CAP-UND-002, CAP-UND-003

**Produces:** TheoryValidation

**Canonical producer:**
`engine/v3/model/judgment/buildTheoryReflection.ts`

**Runtime destination:** `ExecutiveAssessment.theoryValidation`

**Executive destinations:** TheoryValidation, ExecutiveProjection

### CAP-SELF-002 --- Investigation Opportunity Generation

**Depends on:** CAP-UND-004, CAP-SELF-001

**Produces:** InvestigationOpportunity

**Canonical producer:**
`engine/v3/model/investigation/buildInvestigationOpportunities.ts`

**Runtime destination:**
`OrganizationRuntime.investigationOpportunities`

**Executive destinations:** InvestigationOpportunities,
ExecutiveProjection

## Potential Capability Overlap

### CAP-UND-004 --- Organizational Condition Inference

Possible overlap with **CAP-UND-005 --- Executive Assessment**.

Reason: semantic similarity 38%.

Review before creating a new capability. Similarity does not
automatically mean duplication; one capability may legitimately depend
on or transform another.

### CAP-UND-002 --- Organizational Belief Formation

Possible overlap with **CAP-UND-003 --- Organizational Theory
Formation**.

Reason: semantic similarity 36%.

Review before creating a new capability. Similarity does not
automatically mean duplication; one capability may legitimately depend
on or transform another.

### CAP-UND-001 --- Organizational Mechanism Inference

Possible overlap with **CAP-UND-003 --- Organizational Theory
Formation**.

Reason: semantic similarity 35%.

Review before creating a new capability. Similarity does not
automatically mean duplication; one capability may legitimately depend
on or transform another.

## Canonical Pipeline

``` text
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
Organization Runtime
↓
Executive Projection
↓
Executive Workspace
```

## Canonical Source Files

### CAP-PER-001 --- Evidence Ingestion

-   Canonical producer: `engine/v3/evidence.ts`
-   Implementation: `engine/v3/evidence.ts`

### CAP-PER-002 --- Organizational Observation Inference

-   Canonical producer:
    `engine/v3/model/observations/inferOrganizationalObservations.ts`
-   Implementation:
    `engine/v3/model/observations/inferOrganizationalObservations.ts`
-   Implementation:
    `engine/v3/model/observations/organizationalObservations.ts`

### CAP-UND-001 --- Organizational Mechanism Inference

-   Canonical producer:
    `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`
-   Implementation:
    `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`
-   Implementation:
    `engine/v3/model/judgment/organizationalMechanism.ts`
-   Implementation:
    `engine/v3/model/judgment/mechanismCandidateBuilder.ts`
-   Implementation:
    `engine/v3/model/judgment/mechanismEvidenceAggregation.ts`

### CAP-UND-002 --- Organizational Belief Formation

-   Canonical producer:
    `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`
-   Implementation:
    `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`
-   Implementation: `engine/v3/model/beliefs/organizationalBeliefs.ts`

### CAP-UND-003 --- Organizational Theory Formation

-   Canonical producer:
    `engine/v3/model/judgment/formOrganizationalTheories.ts`
-   Implementation:
    `engine/v3/model/judgment/formOrganizationalTheories.ts`
-   Implementation: `engine/v3/model/judgment/organizationalTheory.ts`

### CAP-UND-004 --- Organizational Condition Inference

-   Canonical producer:
    `engine/v3/model/state/inferOrganizationalConditions.ts`
-   Implementation:
    `engine/v3/model/state/inferOrganizationalConditions.ts`

### CAP-UND-005 --- Executive Assessment

-   Canonical producer:
    `engine/v3/model/judgment/buildExecutiveAssessment.ts`
-   Implementation:
    `engine/v3/model/judgment/buildExecutiveAssessment.ts`

### CAP-UND-006 --- Executive Understanding Synthesis

-   Canonical producer:
    `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
-   Implementation:
    `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
-   Implementation:
    `engine/v3/understanding/consolidateUnderstanding.ts`
-   Implementation: `engine/v3/understanding/synthesizeUnderstanding.ts`
-   Implementation: `engine/v3/runtime/evolveOrganizationRuntime.ts`

### CAP-MEM-001 --- Organizational Runtime Persistence

-   Canonical producer: `engine/v3/runtime/organizationStateStore.ts`
-   Implementation: `engine/v3/runtime/organizationStateStore.ts`
-   Implementation: `engine/v3/runtime/organizationRuntime.ts`

### CAP-LRN-001 --- Organizational Belief Evolution

-   Canonical producer:
    `engine/v3/model/beliefs/updateOrganizationalBeliefs.ts`
-   Implementation:
    `engine/v3/model/beliefs/updateOrganizationalBeliefs.ts`
-   Implementation: `engine/v3/cognition/beliefs/mergeBeliefs.ts`

### CAP-LRN-002 --- Organizational Learning Profile

-   Canonical producer:
    `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`
-   Implementation:
    `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

### CAP-SELF-001 --- Theory Validation

-   Canonical producer:
    `engine/v3/model/judgment/buildTheoryReflection.ts`
-   Implementation: `engine/v3/model/judgment/buildTheoryReflection.ts`

### CAP-SELF-002 --- Investigation Opportunity Generation

-   Canonical producer:
    `engine/v3/model/investigation/buildInvestigationOpportunities.ts`
-   Implementation:
    `engine/v3/model/investigation/buildInvestigationOpportunities.ts`

## Sprint Handoff Guidance

Treat the following files as canonical architectural sources:

-   `docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json`
-   `docs/Architecture/COGNITIVE_FILE_REGISTRY.json`
-   `docs/Architecture/COGNITIVE_CAPABILITY_AUDIT.json`
-   `docs/Architecture/COGNITIVE_OBJECT_MODEL.md`
-   `docs/Sprint Updates/ARCHITECTURE_HANDOFF.md`

When architectural evidence conflicts, prefer the current registry and
verified source-code trace over older sprint prose.
