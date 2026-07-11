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

Use the remaining documentation only when implementation details require it.

### Implementation

- `CANONICAL_ARCHITECTURE.md`
- `COMPONENT_ARCHITECTURE.md`
- `ARCHITECTURE_MIGRATION_BOARD.md`
- `COMPONENT_OWNERSHIP.md`
- `ORGANISM_ARCHITECTURE.md`

### Product Vision

- `DISCOVERY_CANON.md`
- `DISCOVERY_NORTH_STAR.md`
- `ROADMAP.md`

### Cognitive Theory

- `COGNITIVE_ARCHITECTURE.md`
- `UNDERSTANDING_ENGINE.md`
- `ORGANIZATIONAL_THEORY.md`
- `DISCOVERY_COGNITIVE_THEORY.md`
- `COGNITIVE_OBJECT_MODEL.md`
- `COGNITIVE_ONTOLOGY.md`

---

# Current Milestone

**Executive Experience Refinement**

---

# Current Objective

Discovery's reasoning engine is no longer the primary bottleneck.

Sprint 63 established the canonical Executive Projection for the majority of Atlas' executive intelligence.

The current objective is no longer broad intelligence extraction.

The current objective is to refine how executives consume, understand, and act upon that intelligence through the Executive Workspace.

```text
Engine

↓

Runtime

↓

Executive Projection

↓

Executive Workspace

↓

Executive Experience
```

Do not introduce new reasoning engines unless Atlas demonstrates a genuine missing capability.

---

# Canonical Development Workflow

Every sprint begins by running:

```bash
npm run validate
npm run simulate:atlas
```

Atlas remains the canonical verification benchmark.

Every implementation decision begins with one question:

> **What executive intelligence does Atlas already produce, and how should executives experience it?**

If Atlas already produces the capability:

- expose it,
- verify it,
- refine how executives consume it,

before expanding cognition.

---

# Executive Intelligence Coverage

## Connected

- Current Understanding
- Executive Attention
- Organizational State
- Organizational Conditions
- Organizational Beliefs
- Investigation Opportunities
- Organizational Learning Profile
- Executive Projection
- Executive Workspace

## Executive Experience Refinement

- Theory Validation
- Executive Assessment
- Confidence Calibration
- Missing Evidence

## Remaining Hidden Intelligence

- Belief Evolution
- Mechanism Network (executive presentation under evaluation)

---

# Executive Projection

Executive Projection remains the canonical boundary between cognition and presentation.

The browser consumes only `ExecutiveProjection`.

React never reconstructs executive cognition directly from Runtime.

Current work should improve executive communication rather than expand Runtime.

---

# Atlas Rule

Atlas remains Discovery's source of truth.

Every sprint should follow this sequence:

```text
Run Atlas

↓

Identify executive intelligence produced by Runtime

↓

Compare with Executive Workspace

↓

Anything missing?

↓

Extract it

↓

Otherwise:

Improve the executive experience.
```

No architectural work should take priority over improving executive understanding unless it directly blocks this workflow.

---

# Current Priorities

1. Refine Theory Validation.
2. Refine Executive Assessment.
3. Integrate Confidence Calibration.
4. Integrate Missing Evidence.
5. Improve Executive Workspace information architecture.
6. Begin simulated organization pressure testing.
7. Legacy cleanup after canonical executive coverage is complete.

---

# Do Not

- Build new reasoning engines unless Atlas demonstrates a missing capability.
- Rebuild cognition already present in Runtime.
- Bypass Executive Projection.
- Allow React to consume Runtime directly.
- Introduce competing executive representations.
- Refactor architecture unless it improves executive communication.
- Clean up legacy code unless it blocks the canonical product path.

---

# Working Principle

The engine is no longer Discovery's primary bottleneck.

Executive Projection is substantially complete.

The current bottleneck is the Executive Experience.

Before making any implementation decision ask:

1. Does Atlas already produce this?
2. Is it persisted in Runtime?
3. Is it exposed through Executive Projection?
4. Is it understandable in the Executive Workspace?
5. Does improving this help executives make better decisions?

If the answer to (1) is **yes**, improve communication before expanding cognition.

---

# Long-Term Development Principle

> **Expose existing intelligence before expanding intelligence.**

> **If Atlas knows it, the CEO should eventually see it.**

> **Once the CEO can see it, improve how the CEO experiences it.**

> **Every sprint should make the Executive Workspace a more effective expression of Discovery's existing organizational understanding.**