# Next Chat

## Startup

Before making any recommendations or implementation decisions:

Read every document in:

`docs/Sprint Updates/`

Treat these documents as the **canonical working state** of Discovery.

Read them in this order:

1. `DISCOVERY_SNAPSHOT.md`
2. `ENGINE_CAPABILITY_AUDIT.md`
3. `PROJECT_STATE.md`
4. `NEXT_CHAT.md`

Then read the Cognitive Architecture documents in this order:

1. `COGNITIVE_ARCHITECTURE_INDEX.md`
2. `COGNITIVE_OPERATING_SYSTEM.md`
3. `COGNITIVE_OBJECT_MODEL.md`
4. `COGNITIVE_FLOW_MAP.md`

Use the remaining documentation only when implementation details require it.

### Implementation

- `CANONICAL_ARCHITECTURE.md`
- `COMPONENT_ARCHITECTURE.md`
- `ARCHITECTURE_MIGRATION_BOARD.md`
- `COMPONENT_OWNERSHIP.md`
- `ORGANISM_ARCHITECTURE.md`

### Cognitive Architecture

- `COGNITIVE_ARCHITECTURE_INDEX.md`
- `COGNITIVE_OPERATING_SYSTEM.md`
- `COGNITIVE_OBJECT_MODEL.md`
- `COGNITIVE_FLOW_MAP.md`
- `COGNITIVE_CAPABILITY_REGISTRY.json`
- `COGNITIVE_FILE_REGISTRY.json`
- `COGNITIVE_CAPABILITY_AUDIT.json`

### Product Vision

- `DISCOVERY_CANON.md`
- `DISCOVERY_NORTH_STAR.md`
- `ROADMAP.md`

### Cognitive Theory

- `COGNITIVE_ARCHITECTURE.md`
- `UNDERSTANDING_ENGINE.md`
- `ORGANIZATIONAL_THEORY.md`
- `DISCOVERY_COGNITIVE_THEORY.md`
- `COGNITIVE_ONTOLOGY.md`

---

# Current Milestone

**Canonical Organizational Understanding**

---

# Current Objective

Discovery now has a canonical Organizational Understanding pipeline.

Executive Assessment is the sole canonical producer of persistent Organizational Understanding.

The next objective is **not** to add new reasoning engines.

The next objective is to improve the quality, clarity, and executive usefulness of Discovery's understanding while preserving the canonical architecture.

Current architectural hierarchy:

```text
Operating System

↓

Subsystem

↓

Capability

↓

Cognitive Object

↓

Canonical Producer

↓

Implementation
```

Every significant cognitive object should have:

- one Operating System owner,
- one Subsystem owner,
- one canonical producer,
- one runtime representation,
- one persistent representation,
- one executive representation,
- one traceable path through the cognitive hierarchy.

---

# Canonical Development Workflow

Every sprint begins by running:

```bash
npm run validate
npm run simulate:atlas
```

Atlas remains the canonical verification benchmark.

After Atlas completes, ask:

> **Is Discovery's executive understanding correct, useful, and clearly communicated?**

Only after verifying the executive understanding should implementation begin.

---

# Current Architecture Status

## Established

- Cognitive Operating System
- Cognitive Object Model
- Cognitive Flow Map
- Capability Registry
- File Registry
- Capability Audit
- Canonical Organizational Understanding Pipeline

## Canonical Producer Established

- Executive Assessment → Organizational Understanding

## Current Focus

Improve Executive Understanding quality.

Current areas of refinement include:

- Executive Narrative
- Executive Understanding synthesis
- Confidence calibration
- Longitudinal understanding
- Executive communication
- Atlas validation

---

# Atlas Rule

Atlas is now both:

- the cognitive benchmark,
- the architectural verification benchmark,
- and the executive understanding benchmark.

Every sprint should follow this sequence:

```text
Run Atlas

↓

Verify Executive Understanding

↓

Verify Cognitive Objects

↓

Verify Canonical Producers

↓

Verify Operating Systems

↓

Update Registry
```

If Atlas demonstrates that executive understanding is incomplete, improve the existing synthesis before introducing additional reasoning.

---

# Current Priorities

1. Improve Executive Understanding synthesis.
2. Improve Executive Narrative quality.
3. Improve longitudinal understanding.
4. Improve confidence calibration.
5. Continue populating Cognitive Operating Systems.
6. Expand Atlas architectural validation.
7. Populate Memory Operating System.
8. Populate Learning Operating System.

---

# Do Not

- Build new reasoning engines unless Atlas demonstrates a missing capability.
- Create duplicate canonical producers.
- Allow multiple systems to produce the same cognitive object.
- Allow a capability to exist without an Operating System owner.
- Allow a subsystem to exist without an Operating System.
- Allow a cognitive object without provenance.
- Bypass Executive Projection.
- Reconstruct Runtime cognition inside React.
- Introduce architecture that conflicts with the Cognitive Operating System.

---

# Working Principle

Discovery now develops from architecture outward rather than implementation inward.

Before implementing anything ask:

1. Which Operating System owns it?
2. Which subsystem owns it?
3. Which capability owns it?
4. Which cognitive object does it produce?
5. Is there already a canonical producer?
6. Does Atlas validate it?
7. Does Executive Projection expose it?

If multiple systems produce the same cognitive object, simplify the architecture before expanding the engine.

---

# Long-Term Development Principle

> **Architecture before implementation.**

> **Objects before code.**

> **Capabilities before files.**

> **Every cognitive object should have one canonical producer.**

> **Executive Assessment is the canonical producer of Organizational Understanding.**

> **Atlas validates cognition.**

> **The Cognitive Architecture validates Discovery itself.**