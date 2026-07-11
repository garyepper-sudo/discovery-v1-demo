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

**Cognitive Architecture Population**

---

# Current Objective

Discovery now possesses a formal Cognitive Architecture.

The primary objective is no longer creating new reasoning engines or expanding executive intelligence.

The current objective is to populate, verify, and refine the Cognitive Architecture one Operating System at a time.

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

Implementation
```

Every capability should eventually have:

- one Operating System owner,
- one Subsystem owner,
- one canonical producer,
- one runtime representation,
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

Then ask:

> **Which Operating System is least complete?**

Development proceeds:

```text
Choose Operating System

↓

Identify Subsystems

↓

Identify Capabilities

↓

Identify Cognitive Objects

↓

Verify against Atlas

↓

Update Registry

↓

Repeat
```

Do not introduce new reasoning engines unless Atlas demonstrates a genuine missing cognitive capability.

---

# Current Architecture Status

## Established

- Cognitive Operating System
- Cognitive Object Model
- Cognitive Flow Map
- Capability Registry
- File Registry
- Capability Audit

## Initial Mapping Complete

- Perception Operating System

## Next Operating System

Understanding OS.

Expected subsystems include:

- Mechanism Subsystem
- Belief Subsystem
- Concept Subsystem
- Theory Subsystem
- Organizational Condition Subsystem
- Organizational State Subsystem

---

# Atlas Rule

Atlas is now both:

- the cognitive benchmark,
- and the architectural verification benchmark.

Every sprint should follow this sequence:

```text
Run Atlas

↓

Verify Cognitive Objects

↓

Verify Capabilities

↓

Verify Subsystems

↓

Verify Operating System

↓

Update Registry
```

If Atlas already demonstrates a capability, architecture population takes priority over engine expansion.

---

# Current Priorities

1. Populate Understanding Operating System.
2. Complete Capability Registry coverage.
3. Complete Cognitive Object Model.
4. Verify Cognitive Flow against Runtime.
5. Expand Atlas architectural validation.
6. Populate Memory Operating System.
7. Populate Learning Operating System.

---

# Do Not

- Build new reasoning engines unless Atlas demonstrates a missing capability.
- Create duplicate canonical producers.
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
5. Does Atlas validate it?
6. Does Executive Projection expose it?

If the capability has no architectural owner, populate the architecture before writing new code.

---

# Long-Term Development Principle

> **Architecture before implementation.**

> **Objects before code.**

> **Capabilities before files.**

> **Every capability must have an owner.**

> **Atlas validates cognition.**

> **The Cognitive Architecture validates Discovery itself.**