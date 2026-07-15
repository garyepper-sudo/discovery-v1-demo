# Discovery Cognitive Object Model

Discovery is an Organizational Cognition Engine.

The cognitive ontology defines the layers of understanding.

The cognitive object model defines the shared anatomy of the objects that live inside those layers.

This document specifies the long-term design direction for Discovery's first-class cognitive objects.

---

## Purpose

Discovery should not treat beliefs, patterns, mechanisms, capabilities, theories, and executive understanding as unrelated data structures.

They are all cognitive objects at different levels of abstraction.

Each object should share a small, stable cognitive identity while preserving layer-specific fields.

---

## Canonical Cognitive Objects

The first-class cognitive objects are:

```text
Belief
Pattern
Mechanism
Capability
Organizational Theory
Executive Understanding
```

Evidence is source material.

Understanding Clusters, Semantic Concepts, and Organizational Phenomena are not first-class cognitive objects.

They may exist as implementation details, metadata, or transitional compatibility structures.

---

## Core Principle

Every first-class cognitive object should answer four questions:

```text
What layer am I?
What supports me?
What do I affect?
How stable am I over time?
```

This enables Discovery to reason about its own understanding.

---

## Minimal Shared Base

The current shared base is intentionally small:

```ts
export type CognitiveObjectBase<Layer extends CognitiveLayer> = {
  id: CognitiveObjectId;
  cognitiveLayer: Layer;
  ontologyVersion: "1.0";
};
```

This is the correct starting point.

It gives every cognitive object a stable identity without forcing premature uniformity across the system.

---

## Future Cognitive Object Genome

Over time, the shared base may evolve toward a richer cognitive object model.

Potential shared fields include:

```ts
export type CognitiveObjectBase<Layer extends CognitiveLayer> = {
  id: CognitiveObjectId;
  cognitiveLayer: Layer;
  ontologyVersion: "1.0";

  displayName?: string;
  summary?: string;

  confidence?: number;
  stability?: CognitiveObjectStability;
  importance?: number;

  firstObservedAt?: string;
  lastObservedAt?: string;
  observationCount?: number;

  supportingEvidenceIds?: string[];
  supportingBeliefIds?: string[];
  supportingPatternIds?: string[];
  supportingMechanismIds?: string[];

  affectedCapabilityIds?: string[];
  upstreamObjectIds?: string[];
  downstreamObjectIds?: string[];

  organismRegion?: string;
  organismWeight?: number;
  organismVisibility?: CognitiveObjectVisibility;

  history?: CognitiveObjectChange[];
};
```

This should not be implemented all at once.

The base should grow only when multiple cognitive layers need the same field for the same reason.

---

## Field Categories

### Identity

Identity fields define what the object is.

Recommended stable fields:

```ts
id
cognitiveLayer
ontologyVersion
```

Potential future fields:

```ts
displayName
summary
```

Rules:

* `id` must be stable.
* `cognitiveLayer` should never change during the object's lifetime.
* `ontologyVersion` records the ontology that produced the object.
* Display fields should be user-friendly but should not determine identity.

---

### Confidence

Confidence fields describe how strongly Discovery believes the object.

Potential fields:

```ts
confidence
confidenceHistory
confidenceReason
```

Rules:

* Confidence should mean different things depending on layer, but use the same numeric scale.
* Belief confidence reflects evidentiary support.
* Pattern confidence reflects recurrence.
* Mechanism confidence reflects explanatory strength.
* Capability confidence reflects health assessment reliability.
* Theory confidence reflects causal model support.
* Executive understanding confidence reflects synthesis reliability.

---

### Stability

Stability describes how persistent the object is over time.

Potential fields:

```ts
stability
firstObservedAt
lastObservedAt
observationCount
```

Rules:

* Stability is not the same as confidence.
* A highly confident object can still be newly emerging.
* A stable object can weaken over time.
* Stability is critical for adaptation and memory.

---

### Provenance

Provenance describes what supports the object.

Potential fields:

```ts
supportingEvidenceIds
supportingBeliefIds
supportingPatternIds
supportingMechanismIds
supportingTheoryIds
```

Rules:

* Every cognitive object should eventually be traceable downward.
* A belief should trace to evidence.
* A pattern should trace to beliefs.
* A mechanism should trace to patterns.
* A capability should trace to mechanisms.
* A theory should trace to mechanisms and capability impacts.
* Executive understanding should trace to theories, mechanisms, and capabilities.

---

### Relationships

Relationships describe how cognitive objects affect each other.

Potential fields:

```ts
upstreamObjectIds
downstreamObjectIds
reinforcingObjectIds
conflictingObjectIds
```

Rules:

* Relationships should become increasingly standardized.
* Mechanism network fields are an early version of this pattern.
* Future theory graphs should rely on shared relationship semantics where possible.

---

### Organism Representation

Organism fields describe how the object may appear visually.

Potential fields:

```ts
organismRegion
organismWeight
organismVisibility
organismMotion
organismStress
```

Rules:

* The organism should not expose the internal cognitive ontology directly.
* The organism should render a compressed projection of the cognitive model.
* Every visible organism feature should be grounded in cognitive objects.
* The organism is a view of modeled understanding, not the reasoning recipe.

---

### Memory and Adaptation

Memory fields describe how the object changes over time.

Potential fields:

```ts
history
changeCount
lastChangedAt
lastChangedReason
```

Rules:

* Memory should preserve meaningful cognitive change.
* Discovery should eventually strengthen, weaken, merge, split, or retire cognitive objects.
* Adaptation should operate on cognitive objects rather than raw outputs.
* Historical change should support executive explanations like "what changed" and "why it matters."

---

## What Should Not Go in the Base

The base should not become a dumping ground.

Avoid putting fields in `CognitiveObjectBase` unless they are genuinely shared across multiple first-class cognitive objects.

Do not add:

* mechanism-specific fields
* capability-specific health metrics
* theory-specific graph fields
* UI-only copy
* temporary compatibility aliases
* implementation-only clustering details
* raw model output fields

Layer-specific fields should remain on layer-specific types.

---

## Current Implementation Status

Implemented:

```text
CognitiveObjectBase
OrganizationalMechanism extends CognitiveObjectBase<"mechanism">
PersistentBelief extends CognitiveObjectBase<"belief">
```

Pending:

```text
PersistentPattern extends CognitiveObjectBase<"pattern">
OrganizationalCapability extends CognitiveObjectBase<"capability">
OrganizationalTheory extends CognitiveObjectBase<"organizationalTheory">
ExecutiveUnderstanding extends CognitiveObjectBase<"executiveUnderstanding">
```

---

## Migration Strategy

Migrate slowly.

The correct sequence is:

```text
1. Define the shared base.
2. Apply it to one object.
3. Typecheck.
4. Patch constructors.
5. Commit.
6. Repeat.
```

Do not migrate multiple cognitive objects in one large change unless the relationship between them requires it.

The build should remain green after every migration.

---

## Design Invariants

Discovery should preserve these invariants:

1. Every first-class cognitive object declares its cognitive layer.
2. Cognitive layer identity should not be inferred only from file paths.
3. Ontology metadata should be available at runtime.
4. Provenance should flow downward through the ontology.
5. Mechanisms should explain patterns, not isolated observations.
6. Capabilities should represent health, not causes.
7. Theories should connect mechanisms into causal models.
8. Executive understanding should compress the model for leadership.
9. The organism should visualize modeled understanding without exposing the proprietary ontology.
10. Shared base fields should remain stable, minimal, and meaningful.

---

## Long-Term Goal

Discovery should eventually be able to inspect its own cognitive model.

Example:

```text
Executive Understanding
  supported by 2 theories
  supported by 7 mechanisms
  explaining 18 patterns
  grounded in 64 beliefs
  traced to 240 evidence items
```

This is the foundation for:

* explainability
* memory
* adaptation
* semantic compression
* organism visualization
* executive trust
* future prediction

The cognitive object model is the shared anatomy that makes those capabilities possible.
