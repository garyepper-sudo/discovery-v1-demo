# Discovery Semantic Ownership Map

## Purpose

This document defines which layer of Discovery owns the meaning of each major cognitive object.

The Capability Audit identifies what capabilities exist.

The Producer Audit identifies which components create or transform those capabilities.

The Semantic Ownership Map defines:

* what each canonical object means,
* which layer owns it,
* which component produces it,
* which fields are derived from it,
* which downstream layers may consume it,
* which downstream layers may not reinterpret it.

This document is the semantic architecture of Discovery.

It is not a folder map.

It is not a component tree.

It is a map of meaning ownership.

---

# Governing Principle

> **Every semantic object has one canonical owner.**

> **Downstream layers may preserve, translate, assemble, project, and present meaning. They may not silently recreate it.**

---

# Canonical Cognitive Flow

```text
Evidence
↓
Observations
↓
Phenomena
↓
Patterns
↓
Mechanisms
↓
Reasoning
↓
Organizational Understanding
↓
Organizational State
↓
Executive Assessment
↓
Executive Projection
↓
Executive Experience
```

Each layer owns a distinct kind of meaning.

A lower layer should not attempt to produce a higher-layer conclusion.

A higher layer may consume lower-layer objects, but it should not redefine their semantics.

---

# Semantic Layer Definitions

## Evidence

### Meaning

Source material that supports, weakens, contradicts, or contextualizes organizational cognition.

### Owns

* evidence identity,
* source references,
* provenance,
* timestamps,
* direct content,
* source type.

### Does Not Own

* organizational conclusions,
* mechanism inference,
* executive recommendations,
* organizational state.

---

## Observations

### Meaning

Normalized statements about what was directly detected in the evidence.

### Owns

* observed claims,
* detected entities,
* detected events,
* direct evidence relationships,
* source-grounded signals.

### Does Not Own

* causal interpretation,
* longitudinal beliefs,
* executive meaning.

---

## Phenomena

### Meaning

Recognizable organizational events, behaviors, or recurring manifestations inferred from observations.

### Owns

* phenomenon identity,
* manifestation type,
* recurrence,
* affected organizational areas,
* evidence support.

### Does Not Own

* underlying causal mechanism,
* final executive conclusion.

---

## Patterns

### Meaning

Recurring or convergent structures detected across observations and phenomena.

### Owns

* repeated signal structures,
* thematic convergence,
* recurring relationships,
* pattern confidence,
* supporting observations.

### Does Not Own

* mechanism interpretation,
* organizational judgment,
* executive action.

---

## Mechanisms

### Meaning

Explanations of how organizational behavior is produced or sustained.

### Canonical Object

```ts
OrganizationalMechanism
```

### Canonical Producer

```text
engine/v3/model/judgment/mechanismInterpreter.ts
```

```ts
interpretMechanismCandidates()
```

### Canonical Inputs

```ts
MechanismCandidate[]
```

### Owns

* mechanism type,
* mechanism title,
* organizational behavior,
* organizational scope,
* executive priority,
* confidence,
* severity,
* actionability,
* stability,
* affected capabilities,
* supporting explanations,
* supporting phenomena,
* supporting reasoning paths,
* mechanism interpretation,
* mechanism implication.

### Derived Fields

```ts
executiveName
executiveSummary
summary
interpretation
executiveImplication
```

### Current Naming Issue

The internal function:

```ts
buildExecutiveSummary()
```

does not produce an organization-level Executive Summary.

It produces a concise summary of one mechanism and its support.

Its semantic responsibility is better described as:

```ts
buildMechanismSummary()
```

or:

```ts
buildMechanismExecutiveDescription()
```

No rename is authorized until callers and types are fully traced.

### Allowed Consumers

* reasoning,
* organizational beliefs,
* organizational conditions,
* Executive Assessment,
* theory validation,
* benchmarks,
* simulations.

### Forbidden Downstream Behavior

Consumers may not independently change:

* mechanism type,
* mechanism confidence,
* mechanism scope,
* mechanism stability,
* mechanism interpretation,

unless they are explicitly producing a separate higher-order semantic object.

---

## Reasoning

### Meaning

Structured paths that explain relationships, indirect effects, root causes, leverage points, and conclusions.

### Canonical Object

```ts
OrganizationalReasoningResult
```

### Canonical Producer

```text
engine/v3/model/reasoning/organizationalReasoningEngine.ts
```

```ts
runOrganizationalReasoningEngine()
```

### Canonical Inputs

```ts
reasoningGraph
```

### Canonical Flow

```text
Reasoning Graph
↓
Reasoning Paths
↓
Path Classification
↓
Indirect Effects
↓
Leverage Points
↓
Root Causes
↓
Reasoning Conclusions
```

### Owns

* classified reasoning paths,
* indirect effects,
* leverage points,
* root causes,
* explained reasoning chains,
* reasoning conclusions.

### Derived Field

```ts
executiveSummary: string[]
```

This field does not represent Discovery's canonical executive conclusion.

It selects a small set of:

* root-cause reasons,
* reasoning claims.

Its semantic responsibility is better described as:

```ts
reasoningHighlights
```

or:

```ts
executiveReasoningHighlights
```

No rename is authorized until consumers are traced.

### Allowed Consumers

* explanation generation,
* mechanism inference,
* Executive Assessment,
* organizational understanding,
* benchmarks,
* simulations.

### Forbidden Downstream Behavior

Consumers may select and translate reasoning outputs, but they may not silently alter the reasoning path or causal relationship while presenting it as the same object.

---

## Organizational Understanding

### Meaning

Discovery's synthesized representation of what it currently understands about the organization.

### Canonical Object

```ts
OrganizationalUnderstandingState
```

### Canonical Producer

```text
engine/v3/understanding/synthesizeUnderstanding.ts
```

```ts
synthesizeUnderstanding()
```

### Canonical Inputs

```ts
OrganizationalUnderstandingState
```

including:

```ts
currentUnderstandings
```

### Owns

* current organizational understandings,
* understanding score,
* confidence,
* coverage,
* evidence diversity,
* cross-validation,
* continuity,
* contradiction resolution,
* emergence,
* memory maturity,
* domain understandings,
* understanding recommendations,
* missing information,
* understanding health.

### Derived Field

```ts
executiveSummary
```

This field summarizes the strongest current organizational understanding.

It does not produce:

* organizational state,
* executive judgment,
* executive prioritization,
* executive briefing.

Its semantic responsibility is better described as:

```ts
understandingSummary
```

or:

```ts
currentUnderstandingSummary
```

### Current Summary Logic

The current implementation selects the understanding with the highest explanatory power and communicates:

* its statement,
* confidence,
* support count.

### Allowed Consumers

* runtime,
* organizational learning,
* Executive Assessment,
* Executive Projection,
* simulations,
* benchmarks.

### Forbidden Downstream Behavior

Presentation layers may not recompute the strongest understanding or select a different one from raw runtime cognition.

That decision belongs above Executive Projection.

---

## Domain Understanding

### Meaning

Discovery's understanding of a particular organizational domain.

### Canonical Object

```ts
OrganizationalDomainUnderstanding
```

### Current Producer

```text
engine/v3/understanding/synthesizeUnderstanding.ts
```

```ts
buildDomainUnderstanding()
```

### Current Domains

* Strategy
* Finance
* Operations
* Customers
* Employees
* Products & Services

### Owns

* domain score,
* domain confidence,
* domain coverage,
* strongest domain understanding,
* related beliefs,
* related patterns,
* related mechanisms,
* contradictions,
* evidence,
* recommendations,
* missing information,
* open questions.

### Current Classification

Canonical but hidden.

### Current Integration Status

* Engine: connected
* Runtime: connected
* Executive Projection: not connected
* Executive Experience: not connected
* Simulation: unverified
* Benchmark: unverified

---

## Organizational Beliefs

### Meaning

Longitudinal organizational propositions that strengthen, weaken, stabilize, or become contradicted over time.

### Canonical Object

To verify.

### Canonical Producer

To verify through direct inspection.

### Owns

* belief identity,
* belief statement,
* belief confidence,
* supporting mechanisms,
* supporting patterns,
* supporting concepts,
* supporting evidence,
* contradictory evidence,
* belief trend,
* belief revision history.

### Current Classification

Hidden.

### Allowed Consumers

* organizational understanding,
* organizational conditions,
* theory validation,
* Executive Assessment,
* organizational learning,
* simulations,
* benchmarks.

---

## Organizational Conditions

### Meaning

Executive-relevant organizational constraints or enabling conditions that summarize how important parts of the organization are functioning.

### Canonical Object

To verify.

### Canonical Producer

To verify.

### Owns

* condition identity,
* condition domain,
* condition status,
* priority,
* confidence,
* strength,
* trend,
* executive summary,
* why the condition matters,
* supporting concepts,
* supporting beliefs,
* supporting mechanisms,
* supporting theories,
* recommended executive action,
* uncertainty,
* confidence limiters,
* missing evidence,
* upstream and downstream relationships.

### Current Classification

Hidden.

### Important Boundary

Conditions are not merely summaries of mechanisms.

They are higher-order organizational objects that may integrate:

* concepts,
* beliefs,
* mechanisms,
* theories,
* longitudinal evidence.

---

## Organizational State

### Meaning

Discovery's integrated description of the organization's current overall operating condition.

### Canonical Object

To verify.

### Canonical Producer

To verify.

### Owns

* current organizational status,
* dominant conditions,
* improving conditions,
* deteriorating conditions,
* unresolved tensions,
* executive implication,
* recommended focus,
* overall confidence.

### Current Classification

Partial.

### Important Boundary

Organizational State answers:

> What state is the organization currently in?

It does not answer:

> Which explanation is best?

That belongs to Executive Assessment and Theory Validation.

---

## Executive Assessment

### Meaning

Discovery's authoritative executive judgment about the organization's current situation.

### Canonical Object

```ts
OrganizationalAssessment
```

or the current runtime Executive Assessment representation.

Exact type ownership requires final verification.

### Canonical Producer

```text
engine/v3/model/judgment/buildExecutiveAssessment.ts
```

```ts
buildExecutiveAssessment()
```

### Current Runtime Representation

```ts
OrganizationRuntime.executiveAssessment
```

### Owns

* executive judgment,
* strongest explanation,
* ranked judgments,
* rejected explanations,
* executive narrative,
* recommended executive focus,
* mechanism-centered narrative,
* theory validation,
* confidence,
* executive recommendation.

### Canonical Question

> What does Discovery currently conclude, why does it conclude it, and what deserves executive attention?

### Current Classification

Partial.

### Current Integration

* Engine: connected
* Runtime: connected
* Executive Projection: partial
* Executive Experience: partial or unverified
* Simulation: present but ownership requires verification
* Benchmark: connected

### Important Boundary

Executive Assessment may consume:

* organizational state,
* conditions,
* mechanisms,
* beliefs,
* theories,
* reasoning,
* investigation opportunities.

It is allowed to create a higher-order executive conclusion from those objects.

It must not alter the canonical semantics of the lower-level objects it consumes.

---

## Theory Validation

### Meaning

Discovery's explanation of why the current working theory was selected, what alternatives were considered, what evidence weakens it, and what would falsify it.

### Current Runtime Representation

```ts
OrganizationRuntime.executiveAssessment.theoryValidation
```

### Current Ownership Question

Determine whether Theory Validation:

1. is canonically owned by Executive Assessment, or
2. has an independent producer that Executive Assessment consumes.

### Owns

* dominant theory,
* rationale,
* supporting mechanisms,
* supporting beliefs,
* competing theories,
* contradictory or weakening evidence,
* calibrated confidence explanation,
* evidence needed to increase confidence,
* falsification criteria,
* executive recommendation.

### Current Classification

Connected, with producer relationship still requiring explicit documentation.

---

## Investigation Opportunities

### Meaning

Discovery's prioritized recommendations for what evidence should be gathered next to reduce uncertainty.

### Canonical Object

To verify.

### Canonical Producer

To verify.

### Owns

* investigation topic,
* reason,
* expected confidence gain,
* executive leverage,
* affected conditions,
* missing evidence,
* suggested executive question.

### Current Classification

Partial.

### Important Boundary

Investigation Opportunities should be derived from:

* uncertainty,
* missing evidence,
* confidence limiters,
* unresolved conditions,
* competing theories.

They should not be independently invented by the UI.

---

## Organizational Learning Profile

### Meaning

Discovery's measure of how organizational understanding changes across investigations.

### Current Producer Candidate

```text
engine/v3/model/learning/computeOrganizationalLearningProfile.ts
```

Canonical ownership requires verification.

### Owns

* understanding growth,
* memory growth,
* belief stability,
* theory stability,
* knowledge retention,
* contradiction resolution,
* concept reuse,
* mechanism reuse,
* learning velocity,
* meaningful learning events,
* strengthened and weakened beliefs,
* stabilized and retired theories,
* strongest learning areas,
* weakening areas,
* recommended evidence areas.

### Current Classification

Hidden.

---

## Executive Projection

### Meaning

The canonical server-side contract that converts organizational cognition into executive-facing product objects.

### Canonical Producer

```text
components/executive-v2/projection/buildExecutiveProjection.ts
```

```ts
buildExecutiveProjection()
```

### Owns

* selection of executive-facing objects,
* projection-safe types,
* presentation-ready organization of canonical cognition,
* explicit omission of internal runtime detail,
* canonical contract for the Executive Workspace.

### Does Not Own

* organizational cognition,
* mechanism inference,
* belief formation,
* condition inference,
* Executive Assessment,
* theory selection,
* confidence creation.

### Architectural Role

Adapter and executive communication projection.

### Canonical Boundary

```text
Cognition
↓
Runtime
↓
Executive Projection
──────────────
Executive Experience
↓
React
```

React must consume Executive Projection rather than runtime cognition directly.

---

## Executive Experience

### Meaning

The presentation of projected executive cognition.

### Canonical Consumer

Executive Workspace.

### Owns

* layout,
* hierarchy,
* interaction,
* navigation,
* visual emphasis,
* progressive disclosure,
* responsive presentation.

### Does Not Own

* executive conclusions,
* organizational state,
* confidence,
* recommendations,
* theory selection,
* prioritization,
* missing evidence.

---

# Summary Naming Collisions

The current architecture contains several fields or functions named `executiveSummary`.

They do not all represent the same semantic capability.

| Current Name                                               | Actual Semantic Object                  | Canonical Layer              | Current Status                            |
| ---------------------------------------------------------- | --------------------------------------- | ---------------------------- | ----------------------------------------- |
| `createExecutiveSummary()` in `synthesizeUnderstanding.ts` | Understanding Summary                   | Organizational Understanding | Canonical derived field; rename candidate |
| `executiveSummary` in `OrganizationalReasoningResult`      | Reasoning Highlights                    | Reasoning                    | Canonical derived field; rename candidate |
| `buildExecutiveSummary()` in `mechanismInterpreter.ts`     | Mechanism Summary                       | Mechanisms                   | Canonical derived field; rename candidate |
| Executive Assessment narrative                             | Executive Judgment                      | Executive Assessment         | Canonical executive conclusion            |
| Executive Briefing summary                                 | Executive communication assembly        | Executive Layer              | Requires inspection                       |
| Executive Projection summary                               | Projected executive communication field | Executive Projection         | Requires authoritative upstream mapping   |
| Legacy `engine/brief.ts` summary                           | Legacy top-belief summary               | Legacy engine path           | Requires caller trace                     |

---

# Current Verified Ownership

## Organizational Understanding

```text
Owner:
engine/v3/understanding/synthesizeUnderstanding.ts

Producer:
synthesizeUnderstanding()

Canonical Object:
OrganizationalUnderstandingState

Status:
Verified
```

## Organizational Reasoning

```text
Owner:
engine/v3/model/reasoning/organizationalReasoningEngine.ts

Producer:
runOrganizationalReasoningEngine()

Canonical Object:
OrganizationalReasoningResult

Status:
Verified
```

## Organizational Mechanism

```text
Owner:
engine/v3/model/judgment/mechanismInterpreter.ts

Producer:
interpretMechanismCandidates()

Canonical Object:
OrganizationalMechanism[]

Status:
Verified
```

## Executive Assessment

```text
Owner:
engine/v3/model/judgment/buildExecutiveAssessment.ts

Producer:
buildExecutiveAssessment()

Runtime Representation:
OrganizationRuntime.executiveAssessment

Status:
Producer and runtime verified
Projection and presentation ownership incomplete
```

---

# Current Architectural Finding

The Executive Summary audit initially appeared to reveal many duplicate producers.

Direct inspection has shown that at least three of those implementations are not true duplicates.

They are separate summaries of different canonical semantic objects:

```text
Organizational Understanding
└── Understanding Summary

Organizational Reasoning
└── Reasoning Highlights

Organizational Mechanism
└── Mechanism Summary
```

The primary issue is currently semantic naming ambiguity rather than confirmed cognitive duplication.

The remaining executive-layer and legacy implementations still require inspection before Executive Summary can be fully classified.

---

# Semantic Ownership Rules

## Rule 1 — Object Before Field

Determine which canonical object a field belongs to before classifying the field as a standalone capability.

A field named `executiveSummary` may simply be a derived property of:

* an understanding,
* a mechanism,
* a reasoning result,
* a briefing,
* or an assessment.

## Rule 2 — Meaning Before Naming

Function and field names are not proof of semantic ownership.

Inspect:

* inputs,
* transformation logic,
* output type,
* persistence,
* callers,
* downstream use.

## Rule 3 — Higher Layers May Synthesize

A higher semantic layer may create a new conclusion from lower-layer objects.

For example:

```text
Mechanisms
+
Beliefs
+
Conditions
+
Theories
+
Organizational State
↓
Executive Assessment
```

This is not duplication if Executive Assessment creates a distinct higher-order semantic object.

## Rule 4 — Presentation May Not Infer

React components may not:

* rank raw mechanisms,
* choose the dominant theory,
* compute confidence,
* construct organizational state,
* select the strongest understanding from runtime,
* generate executive recommendations.

Those decisions must be completed before the Executive Projection boundary.

## Rule 5 — Translation Must Preserve Meaning

A translator may simplify language but must preserve:

* conclusion,
* confidence,
* uncertainty,
* causality,
* recommendation,
* material qualifiers.

## Rule 6 — Renaming Follows Consumer Tracing

Do not rename ambiguous fields until:

1. all callers are known,
2. active and legacy paths are separated,
3. runtime compatibility is understood,
4. projection mappings are documented,
5. benchmarks protect behavior.

---

# Next Audit Sequence

Continue the Executive Summary semantic ownership audit in this order:

1. `engine/v3/executive/interpretations/explanationBuilder.ts`
2. `engine/v3/expression/executive/executiveTranslator.ts`
3. `engine/v3/executive/interpretations/buildExecutiveInterpretation.ts`
4. `engine/v3/executive/buildExecutiveBriefing.ts`
5. `components/executive-v2/projection/buildExecutiveProjection.ts`
6. `engine/brief.ts`
7. Active UI consumers and routes

For each implementation determine:

* canonical semantic object,
* whether new meaning is created,
* whether meaning is merely translated,
* whether objects are assembled,
* whether the path is active,
* whether the path is legacy,
* whether the implementation competes with Executive Assessment.

---

# Definition of Semantic Ownership Baseline Complete

The Semantic Ownership Baseline is complete when:

* every major canonical object has one owner,
* every producer has an explicit semantic responsibility,
* every ambiguous summary field is mapped to its parent object,
* every translator is identified,
* every assembler is identified,
* every projection mapping has an authoritative upstream source,
* every active presentation consumes Executive Projection,
* every legacy path has a migration decision,
* confirmed duplicates are separated from naming collisions,
* the architecture can be explained without relying on folder names.

---

# Current Status

Semantic Ownership Map: Created

Verified canonical semantic objects:

* Organizational Understanding
* Organizational Reasoning
* Organizational Mechanism
* Executive Assessment producer and runtime representation

Current audit:

* Executive Summary semantic ownership

Next file:

```text
engine/v3/executive/interpretations/explanationBuilder.ts
```
