# Executive Product Operating Systems

**Status:** Proposed Canonical Architecture  
**Current Phase:** Executive Product Integration  
**Primary Principle:** Product Operating Systems transform canonical cognition into executive decisions, communication, and experience without recreating organizational reasoning.

---

# Purpose

This document defines Discovery's Executive Product Operating Systems.

These operating systems sit between the Cognitive Operating Systems and the Executive Experience.

Their purpose is to transform validated cognition into structured executive action, communication, projection, and product experience.

They do not create the underlying organizational understanding.

They make that understanding usable.

---

# Architectural Position

Discovery's architecture now separates into two families.

## Cognitive Operating Systems

These operating systems create and evolve organizational cognition.

They answer questions such as:

- What is happening?
- Why is it happening?
- What conditions exist?
- What is likely to happen?
- What has Discovery learned?
- What action appears justified?

Canonical examples include:

```text
Organizational Understanding

Executive Assessment

Executive Recommendation

Executive Optimization

Organizational Simulation

Organizational Learning
```

## Executive Product Operating Systems

These operating systems transform canonical cognition into executive-facing products.

They answer questions such as:

- What should leadership see first?
- How should the conclusion be communicated?
- How should the recommendation be presented?
- How should cognition be projected into the product?
- How should the executive interact with Discovery?

Canonical examples include:

```text
Executive Recommendation Operating System

Executive Communication Operating System

Executive Projection Operating System

Executive Experience
```

The boundary between these two families is architectural.

Product Operating Systems may transform, compress, structure, and present cognition.

They may not recreate it.

---

# Canonical Product Pipeline

```text
Canonical Organizational Cognition

↓

Executive Assessment

↓

Executive Recommendation Operating System

↓

Executive Communication Operating System

↓

Executive Projection Operating System

↓

Executive Experience
```

Optimization and simulation may branch from the recommendation and decision layer.

Their results return to Communication and Projection for executive consumption.

A broader product pipeline is:

```text
Understanding

↓

Assessment

↓

Recommendation

├──→ Optimization
│
├──→ Simulation
│
└──→ Decision

↓

Communication

↓

Projection

↓

Executive Experience
```

---

# 1. Executive Recommendation Operating System

## Purpose

The Executive Recommendation Operating System converts canonical executive assessment into one canonical recommended course of action.

It answers:

> What should leadership do next?

## Canonical Inputs

```text
Executive Assessment

Organizational State

Organizational Conditions
```

## Canonical Transformations

```text
Executive Assessment

↓

Recommended Executive Objective

↓

Recommended Executive Strategy

↓

Recommended Executive Intervention

↓

Executive Recommendation
```

## Canonical Output

```text
ExecutiveRecommendation
```

## Runtime Location

```ts
runtime.memory.executiveRecommendation
```

## Responsibilities

The Executive Recommendation Operating System owns:

- selection of the primary executive objective,
- selection of the recommended strategy,
- generation of the primary intervention,
- generation of supporting actions,
- recommendation rationale,
- confidence,
- uncertainty boundaries,
- recommendation traceability.

## Boundaries

It does not:

- optimize resource allocation,
- simulate outcomes,
- generate implementation plans,
- create board-ready prose,
- determine UI layout.

## Canonical Orchestrator

```text
engine/v3/operating-systems/recommendation/runExecutiveRecommendationOperatingSystem.ts
```

---

# 2. Executive Communication Operating System

## Purpose

The Executive Communication Operating System transforms canonical cognition into concise, decision-ready executive communication.

It answers:

> How should Discovery explain what it understands, recommends, expects, and remains uncertain about?

## Canonical Inputs

Required:

```text
Executive Assessment

Executive Recommendation

Organizational State

Organizational Conditions
```

Optional:

```text
Executive Explanation

Organizational Predictions

Prediction Reflection

Organizational Learning Profile

Organizational Uncertainty

Investigation Opportunities

Organizational Beliefs

Organizational Theories

Organizational Mechanisms

Optimization Results

Simulation Results
```

## Canonical Output

```text
ExecutiveCommunication
```

## Runtime Location

```ts
runtime.memory.executiveCommunication
```

## Responsibilities

The Executive Communication Operating System owns:

- executive headline,
- executive summary,
- recommendation communication,
- supporting-action presentation,
- rationale communication,
- meaningful-change communication,
- forecast communication,
- confidence communication,
- uncertainty communication,
- evidence sections,
- progressive-disclosure traceability.

## Boundaries

It does not:

- choose a different recommendation,
- create new organizational conclusions,
- rank conditions independently,
- infer a forecast independently,
- perform optimization,
- perform simulation,
- determine page layout.

## Canonical Producer

```text
engine/v3/communication/synthesizeExecutiveCommunication.ts
```

## Canonical Orchestrator

```text
engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts
```

---

# 3. Executive Projection Operating System

## Purpose

The Executive Projection Operating System maps canonical runtime cognition and communication into a stable product-facing contract.

It answers:

> What structured data should the Executive Experience receive?

## Canonical Inputs

Primary:

```text
ExecutiveCommunication
```

Additional canonical inputs may include:

```text
Executive Recommendation

Executive Optimization

Executive Simulation

Executive Decision

Organizational Learning

Executive Timeline

Capability Availability
```

## Canonical Output

```text
ExecutiveProjection
```

## Responsibilities

The Executive Projection Operating System owns:

- mapping canonical objects into UI-safe structures,
- preserving stable product contracts,
- selecting presentation-ready subsets,
- adding display metadata,
- maintaining backward compatibility during migration,
- exposing capability availability to product surfaces.

## Boundaries

It does not:

- create executive headlines,
- compose recommendations,
- write recommendation rationale,
- determine the primary uncertainty,
- create new executive narratives,
- independently interpret organizational conditions,
- infer new cognition.

Projection is a mapping layer.

It is not a communication producer.

## Current Architectural Drift

The current projection contract carries cognition, communication, and presentation responsibilities together.

The current communication producer depends on `ExecutiveProjection`.

That dependency is reversed.

Current:

```text
Runtime Cognition

↓

Executive Projection

↓

Executive Communication
```

Target:

```text
Runtime Cognition

↓

Executive Communication

↓

Executive Projection
```

This inversion must be removed during migration.

---

# 4. Executive Experience

## Purpose

The Executive Experience is the interactive product surface through which executives consume, challenge, optimize, simulate, decide, and revisit Discovery's cognition.

It answers:

> How does an executive interact with Discovery?

## Inputs

```text
ExecutiveProjection

User Intent

Workspace State

Decision Context
```

## Responsibilities

The Executive Experience owns:

- navigation,
- layout,
- interaction,
- progressive disclosure,
- challenge flows,
- optimization controls,
- simulation controls,
- decision recording,
- product state,
- accessibility,
- responsive behavior.

## Boundaries

It does not:

- generate executive cognition,
- rewrite the canonical recommendation,
- create a new executive narrative,
- infer organizational truth,
- perform simulation logic,
- perform optimization logic.

The experience renders and interacts with canonical product objects.

It does not create their meaning.

---

# Product Object Ownership

Each canonical product object must have one owner.

| Object | Canonical Owner | Runtime Location |
|---|---|---|
| `ExecutiveRecommendation` | Executive Recommendation Operating System | `runtime.memory.executiveRecommendation` |
| `ExecutiveCommunication` | Executive Communication Operating System | `runtime.memory.executiveCommunication` |
| `ExecutiveProjection` | Executive Projection Operating System | product/runtime projection output |
| `ExecutiveDecision` | Executive Decision Operating System | canonical decision memory |
| `ExecutiveSimulation` | Executive Simulation capability | canonical simulation memory |

No downstream layer may recreate an upstream canonical object.

---

# Canonical Dependency Direction

Dependencies must flow downward:

```text
Cognition

↓

Recommendation

↓

Communication

↓

Projection

↓

Experience
```

The following dependencies are prohibited:

```text
Communication → UI components

Communication → ExecutiveProjection as primary input

Recommendation → UI contracts

Projection → new organizational reasoning

Experience → canonical recommendation generation
```

Engine code must not depend on component-layer types.

Component code may depend on engine-produced product contracts.

---

# Runtime Execution Order

The canonical runtime sequence should evolve toward:

```text
Build Executive Assessment

↓

Run Executive Recommendation Operating System

↓

Run Executive Communication Operating System

↓

Run Optimization and Simulation when required

↓

Update Communication with scenario or optimization results when appropriate

↓

Build Executive Projection

↓

Render Executive Experience
```

Communication may be regenerated after optimization, simulation, or decision events when those events materially change the executive product.

---

# Current Implementation State

## Executive Recommendation Operating System

Status:

```text
Integrated
```

Confirmed behavior:

- executes in the canonical runtime,
- produces `ExecutiveRecommendation`,
- persists to runtime memory,
- appears in Northstar snapshots,
- uses intervention-first recommendation composition.

## Executive Communication Operating System

Status:

```text
Architecture defined
Existing capability implemented
Runtime integration incomplete
Producer dependency inverted
```

Existing files:

```text
engine/v3/communication/executiveCommunication.ts

engine/v3/communication/executiveNarrative.ts

engine/v3/communication/synthesizeExecutiveCommunication.ts

engine/v3/communication/synthesizeExecutiveNarrative.ts

engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts
```

Required work:

- remove dependency on component-layer `ExecutiveProjection`,
- accept canonical runtime cognition,
- complete the orchestrator,
- persist `runtime.memory.executiveCommunication`,
- validate through Northstar and the communication benchmark.

## Executive Projection Operating System

Status:

```text
Existing product contract
Responsibilities mixed
Refactor required
```

Required work:

- consume canonical `ExecutiveCommunication`,
- remove communication-generation behavior,
- preserve UI compatibility,
- reduce Projection to mapping and presentation preparation.

## Executive Experience

Status:

```text
Active product development
Multiple workspace implementations exist
Canonical consumption path still evolving
```

Required work:

- consume canonical Projection,
- avoid recreating executive wording,
- support complete decision flywheel,
- preserve progressive disclosure.

---

# Migration Plan

## Phase 1 — Communication Input Contract

Define a canonical communication input sourced from runtime cognition.

Remove direct imports from:

```text
components/executive-v2
```

inside engine communication code.

## Phase 2 — Communication Producer Refactor

Refactor:

```text
synthesizeExecutiveCommunication.ts

synthesizeExecutiveNarrative.ts
```

to consume canonical cognition.

Preserve the current `ExecutiveCommunication` output.

## Phase 3 — Communication Runtime Integration

Complete:

```text
runExecutiveCommunicationOperatingSystem.ts
```

Persist:

```ts
runtime.memory.executiveCommunication
```

Execute it after the Recommendation Operating System.

## Phase 4 — Projection Refactor

Update `buildExecutiveProjection()` to consume the canonical communication object.

Keep legacy generation only as a temporary fallback.

## Phase 5 — Experience Alignment

Update the Executive Experience to render canonical communication and projection fields without rewriting them.

## Phase 6 — Remove Legacy Paths

Remove:

- communication generation from Projection,
- engine dependencies on component-layer contracts,
- duplicate narrative producers,
- fallback recommendation wording once migration is complete.

---

# Validation Requirements

The Executive Product Operating Systems architecture is considered implemented when:

- every canonical product object has one producer,
- every canonical product object has one runtime location,
- Recommendation executes in runtime,
- Communication executes in runtime,
- Projection consumes Communication,
- Experience consumes Projection,
- engine code no longer imports component-layer projection types,
- primary executive wording is generated once,
- recommendation content is preserved across layers,
- supporting actions remain structurally distinct,
- optimization and simulation outputs are clearly distinguished from current-state cognition,
- Northstar and Atlas verify the complete product pipeline,
- no hidden product capability remains disconnected.

---

# Architectural Invariants

1. Product Operating Systems do not recreate organizational cognition.
2. Each canonical product object has exactly one producer.
3. Recommendation determines action.
4. Communication determines executive expression.
5. Projection determines product mapping.
6. Experience determines interaction and layout.
7. Dependencies flow from engine to product, never from engine to UI components.
8. Supporting actions remain separate from the primary recommendation.
9. Confidence and uncertainty survive every product layer without distortion.
10. Internal engine language remains available for traceability but is excluded from primary executive communication.
11. Optimization and simulation remain distinct from recommendation.
12. Product surfaces do not become alternate cognitive producers.

---

# Definition of Success

Discovery's Executive Product Operating Systems are successful when canonical cognition can move through the complete product pipeline without duplication, inversion, or loss of meaning:

```text
Discovery understands the organization.

Discovery forms an executive assessment.

Discovery recommends an action.

Discovery communicates that action clearly.

Discovery projects it into a stable product contract.

The executive can understand, challenge, simulate, decide, and return.
```

At that point, Discovery is not merely a reasoning engine.

It is a complete Executive Cognitive Operating System delivered through a coherent executive product.
