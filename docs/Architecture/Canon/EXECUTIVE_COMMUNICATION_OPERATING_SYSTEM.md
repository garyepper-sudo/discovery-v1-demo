# Executive Communication Operating System

**Status:** Proposed Canonical Architecture  
**Current Phase:** Integration and Refactor  
**Primary Principle:** Executive Communication introduces no new organizational cognition.

---

# Purpose

The Executive Communication Operating System transforms canonical executive cognition into concise, decision-ready executive communication.

Its purpose is to ensure that Discovery communicates its reasoning in a form executives can quickly understand, trust, challenge, and act upon.

The operating system answers:

> How should Discovery communicate what it currently understands, what requires attention, what it recommends, what may happen next, and what remains uncertain?

The Executive Communication Operating System does not decide what is true, what matters, or what should be done.

Those judgments are produced upstream.

It translates validated cognition into executive-grade language and structure without changing the underlying meaning.

---

# Architectural Position

Canonical pipeline:

```text
Organizational Understanding

↓

Executive Assessment

↓

Executive Recommendation

↓

Executive Communication

↓

Executive Optimization

↓

Organizational Simulation

↓

Executive Projection

↓

Executive Experience
```

Executive Communication sits after canonical assessment and recommendation generation.

Executive Projection consumes the resulting communication object and prepares it for presentation.

The communication layer must not depend on a UI projection contract.

---

# Core Architectural Rule

The Executive Communication Operating System consumes canonical cognitive objects.

It must not consume `ExecutiveProjection` as its primary source.

The current dependency:

```text
Executive Projection
        ↓
Executive Communication
```

is architecturally reversed and must be removed.

The target dependency is:

```text
Canonical Cognition
        ↓
Executive Communication
        ↓
Executive Projection
```

---

# Responsibilities

The Executive Communication Operating System owns the transformation of canonical cognition into executive-facing communication.

It is responsible for:

- selecting the highest-priority executive conclusion,
- expressing organizational conditions in natural executive language,
- summarizing the current organizational state,
- communicating the canonical recommendation,
- presenting supporting actions without flattening their structure,
- communicating the rationale for action,
- presenting meaningful organizational changes,
- summarizing the most important forecast,
- expressing confidence and confidence limitations,
- surfacing the most important unresolved uncertainty,
- preserving links to supporting cognitive objects,
- producing detailed evidence sections for progressive disclosure.

It may simplify language.

It may reorder information for executive comprehension.

It may compress multiple supporting objects into a concise narrative.

It may not change the underlying executive judgment.

---

# Non-Responsibilities

The Executive Communication Operating System does not:

- create new observations,
- infer new signals,
- form new mechanisms,
- form or revise beliefs,
- generate theories,
- infer organizational conditions,
- synthesize organizational state,
- produce the Executive Assessment,
- select the canonical executive objective,
- generate strategy,
- generate the canonical intervention,
- optimize recommendations,
- simulate organizational futures,
- rank scenarios,
- create implementation plans,
- make product-layout or visual-design decisions.

Communication is a translation and synthesis layer, not a reasoning layer.

---

# Canonical Inputs

The operating system may consume the following canonical runtime objects:

```text
Executive Assessment

Executive Recommendation

Executive Explanation

Organizational State

Organizational Conditions

Organizational Predictions

Prediction Reflection

Organizational Learning Profile

Organizational Uncertainty

Investigation Opportunities

Organizational Beliefs

Organizational Theories

Organizational Mechanisms
```

The minimum required inputs should be:

```text
Executive Assessment

Executive Recommendation

Organizational State

Organizational Conditions
```

Optional inputs add depth, confidence calibration, forecast communication, change communication, and progressive disclosure.

---

# Canonical Output

The canonical output is:

```text
ExecutiveCommunication
```

The existing canonical type is located at:

```text
engine/v3/communication/executiveCommunication.ts
```

The object includes:

```ts
ExecutiveCommunication {
  id
  organizationId
  headline
  executiveSummary
  confidence
  supportingSignals
  meaningfulChanges
  forecast
  recommendation
  uncertainty
  evidenceSections
  generatedAt
}
```

This object is the authoritative executive communication product for the current runtime state.

---

# Communication Structure

The default executive communication should follow this information hierarchy:

```text
Headline

↓

Executive Summary

↓

Executive Recommendation

↓

Supporting Actions

↓

Why This Matters

↓

Meaningful Changes

↓

Forecast

↓

Confidence and Limiters

↓

Uncertainty

↓

Evidence
```

The most important conclusion and recommendation must appear before detailed evidence.

Internal engine terminology should be removed from primary executive communication.

Examples of internal language that should not appear in primary communication include:

- reasoning paths,
- canonical producers,
- propagated effects,
- capability signals,
- cognitive objects,
- organizational causal model,
- internal registry identifiers.

These may remain available in technical traces and evidence views.

---

# Recommendation Communication

The communication layer must preserve the canonical recommendation structure.

It should consume:

```text
Executive Recommendation

Primary Intervention

Supporting Actions

Rationale

Confidence

Uncertainty
```

It must not recreate or independently select a recommendation.

The communication layer may produce:

```text
Headline:
Reduce organizational execution load.

Recommendation:
Reduce the number of concurrently active priorities while delegating routine decisions and clarifying cross-functional ownership.

Supporting Actions:
- Reduce competing work.
- Delegate routine decision authority.
- Clarify cross-functional ownership.

Why:
Execution Capacity is the primary organizational constraint, reinforced by governance friction and coordination breakdown.
```

The primary recommendation and supporting actions should remain structurally distinct.

They should not be stored only as one concatenated string.

---

# Confidence Communication

Confidence must be communicated in two forms:

```text
Normalized confidence value

Executive-facing confidence label
```

Supported labels:

```text
low
developing
moderate
high
```

The communication object should also identify the most important confidence limiters.

Confidence communication must not overstate certainty.

High confidence in a diagnosis does not automatically imply high confidence in intervention effectiveness.

---

# Forecast Communication

The operating system communicates the highest-priority canonical forecast.

It does not independently infer future outcomes.

Forecast communication should include:

```text
Headline

Explanation

Confidence

Time Horizon

Affected Conditions

Falsifying Signals
```

The forecast should be grounded in canonical predictions, prediction reflection, or simulation outputs when explicitly available.

Current-state communication must not present a simulation result as a forecast unless the distinction is explicit.

---

# Uncertainty Communication

The operating system should surface one highest-value unresolved uncertainty.

The uncertainty should explain:

```text
What is unresolved?

Why does it matter?

What investigation would reduce it?

How much confidence could be gained?
```

Uncertainty is part of executive trust and must not be hidden merely to make the output appear decisive.

---

# Evidence and Traceability

Every major communication section should preserve references to supporting cognition whenever available.

Supporting references may include:

```text
Condition IDs

Belief IDs

Mechanism IDs

Theory IDs

Evidence IDs

Assessment ID

Recommendation ID
```

The executive surface should remain concise.

Detailed traceability should be available through progressive disclosure.

---

# Canonical Producer

The canonical producer is:

```text
engine/v3/communication/synthesizeExecutiveCommunication.ts
```

Its current implementation depends on:

```text
ExecutiveProjection
```

This dependency is transitional and must be refactored.

The target input contract should consume canonical runtime cognition directly.

A compatibility adapter may temporarily transform the old projection contract into the new canonical input during migration.

There must be only one canonical producer of `ExecutiveCommunication`.

---

# Operating System Orchestrator

The canonical orchestrator should be:

```text
engine/v3/operating-systems/communication/runExecutiveCommunicationOperatingSystem.ts
```

Its responsibilities are:

```text
Validate required runtime inputs

↓

Call synthesizeExecutiveCommunication()

↓

Persist runtime.memory.executiveCommunication

↓

Return updated runtime and ExecutiveCommunication
```

The orchestrator must not contain communication-generation logic beyond validation and persistence.

---

# Runtime Persistence

The canonical runtime location is:

```ts
runtime.memory.executiveCommunication
```

The runtime should execute the operating system after the Executive Recommendation Operating System has completed.

Target runtime order:

```text
buildExecutiveAssessment()

↓

runExecutiveRecommendationOperatingSystem()

↓

runExecutiveCommunicationOperatingSystem()

↓

continue optimization, simulation, and projection
```

The communication object should remain available to all downstream product and projection layers.

---

# Executive Projection Boundary

Executive Projection is a presentation contract.

It may:

- map canonical communication into UI-specific structures,
- add display labels,
- select layout-ready subsets,
- provide workspace metadata,
- preserve compatibility with current components.

It may not:

- generate the executive headline,
- choose the primary recommendation,
- create recommendation rationale,
- determine the highest-priority uncertainty,
- create a new executive narrative,
- reinterpret canonical cognition.

Communication meaning belongs to the Executive Communication Operating System.

Projection formatting belongs to Executive Projection.

---

# Existing Implementation to Preserve

The following existing files must be reused rather than duplicated:

```text
engine/v3/communication/executiveCommunication.ts

engine/v3/communication/executiveNarrative.ts

engine/v3/communication/synthesizeExecutiveCommunication.ts

engine/v3/communication/synthesizeExecutiveNarrative.ts

engine/benchmark/executive-communication/executiveCommunicationExperiment001.ts
```

Existing communication behavior should be migrated behind the canonical input contract.

It should not be discarded unless a behavior is demonstrably incorrect or duplicates another canonical producer.

---

# Migration Plan

## Phase 1 — Canonical Input Contract

Refactor `synthesizeExecutiveCommunication()` so it consumes canonical cognitive objects rather than `ExecutiveProjection`.

Define an explicit input type containing the required and optional canonical objects.

Preserve current output shape.

## Phase 2 — Narrative Decoupling

Refactor `synthesizeExecutiveNarrative()` so it also consumes the canonical communication input or an internal communication-source model.

Remove direct imports from:

```text
components/executive-v2
```

The engine communication layer must not depend on component-layer types.

## Phase 3 — Runtime Orchestration

Create:

```text
runExecutiveCommunicationOperatingSystem.ts
```

Execute it in the canonical runtime after Executive Recommendation.

Persist:

```ts
runtime.memory.executiveCommunication
```

## Phase 4 — Projection Consumption

Update `buildExecutiveProjection()` so it consumes the canonical communication object.

Projection should prefer:

```ts
runtime.memory.executiveCommunication
```

Legacy narrative generation may remain only as a temporary fallback.

## Phase 5 — Remove Legacy Inversion

Remove the remaining path where Executive Communication is synthesized from Executive Projection.

Update benchmarks to exercise canonical runtime cognition.

---

# Validation Requirements

The Executive Communication Operating System is considered integrated when:

- the engine communication layer has no dependency on component-layer projection types,
- `synthesizeExecutiveCommunication()` consumes canonical cognition,
- the runtime executes the communication operating system,
- `runtime.memory.executiveCommunication` is populated,
- Executive Projection consumes the canonical communication object,
- the existing communication benchmark passes,
- Northstar runtime execution produces a canonical communication object,
- recommendation wording matches the canonical Executive Recommendation,
- supporting actions remain structurally separate,
- no internal engine language appears in primary executive communication,
- confidence and uncertainty are communicated without distortion,
- no duplicate communication producer exists.

---

# Architectural Invariants

The following invariants are canonical:

1. Executive Communication introduces no new cognition.
2. Executive Communication consumes canonical runtime objects, not UI projections.
3. Executive Projection consumes Executive Communication.
4. The canonical recommendation is never independently recreated by Communication.
5. Supporting actions remain structurally separate from the primary recommendation.
6. Primary executive communication avoids internal engine language.
7. Detailed cognitive traceability remains available through evidence sections.
8. There is one canonical producer of `ExecutiveCommunication`.
9. Runtime persistence is owned by the Communication Operating System orchestrator.
10. Product surfaces render communication; they do not generate its meaning.

---

# Definition of Success

The Executive Communication Operating System is successful when Discovery can transform its validated cognition into a concise executive product that clearly communicates:

```text
What is happening?

Why does it matter?

What should leadership do?

Why is that the preferred action?

What may happen next?

How confident is Discovery?

What could change the conclusion?
```

The result should be understandable in seconds, defensible under scrutiny, and traceable to canonical cognition.
