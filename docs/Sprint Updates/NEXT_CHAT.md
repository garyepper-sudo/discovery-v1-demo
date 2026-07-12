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
5. `COGNITIVE_CAPABILITY_REGISTRY.json`
6. `COGNITIVE_FILE_REGISTRY.json`
7. `COGNITIVE_CAPABILITY_AUDIT.json`

Then review the capability traces in:

`docs/Sprint Updates/Capability Traces/`

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
- `Capability Traces/`

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

**Architecture Operating System**

---

# Current Objective

Discovery now has:

- a canonical Organizational Understanding object,
- a canonical Executive Assessment producer,
- direct Atlas validation of structured Organizational Understanding,
- a Cognitive Capability Registry,
- a Cognitive File Registry,
- and a registry-aware Capability Auditor.

The next objective is **not** to add new reasoning engines.

The next objective is to make Discovery’s architecture self-describing, self-validating, and navigable before every sprint.

The Architecture Operating System should be able to answer:

- Which capability owns this behavior?
- Which cognitive object does it produce?
- Who is the canonical producer?
- Which capabilities does it depend on?
- Where is it persisted?
- Which files consume it?
- Where is it projected?
- How does Atlas validate it?
- Is the implementation drifting from the registry?

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
- one Runtime representation,
- one persistent representation,
- one executive representation,
- one Atlas validation path,
- one traceable path through the cognitive hierarchy.

---

# Sprint 67

## Architecture Operating System

### Primary Objective

Complete the registry-driven architecture verification system.

### Immediate Work

1. Update `CAP-UND-005` — Executive Assessment.
2. Record its produced cognitive objects.
3. Record its consumed capabilities and implementation dependencies.
4. Register `buildOrganizationalUnderstanding.ts`.
5. Register `organizationalJudgment.ts`.
6. Record Runtime, Projection, Benchmark, and Atlas consumers.
7. Resolve the current Executive Assessment capability trace.
8. Regenerate and validate the capability registry.
9. Expand the same pattern across the remaining capabilities.
10. Build an all-capabilities pre-sprint architecture review command.

---

# Canonical Organizational Understanding Path

The verified path established in Sprint 66 is:

```text
Organizational Judgments
        ↓
Theory Validation
        ↓
Organizational Conditions
        ↓
Organizational State
        ↓
buildExecutiveAssessment.ts
        ↓
buildOrganizationalUnderstanding.ts
        ↓
OrganizationalAssessment
        ↓
OrganizationalUnderstanding
        ↓
Organization Runtime
        ↓
Executive Projection
        ↓
Executive Workspace
```

Atlas validation follows:

```text
OrganizationalUnderstanding
        ↓
organizationalUnderstandingScorer.ts
        ↓
runBenchmarkInvestigation.ts
        ↓
runAtlasSimulation.ts
```

The legacy benchmark remains available for historical comparison, but canonical Organizational Understanding validation is now the preferred architectural benchmark.

---

# Canonical Development Workflow

Every sprint begins by running:

```bash
npm run sprint:start
npm run validate
npm run sprint:docs
npm run cognition:validate
npm run simulate:atlas
```

Until the architecture preflight command is complete, also review the relevant capability trace manually:

```bash
npm run audit:capability -- "Capability Name"
```

For the next sprint, begin with:

```bash
npm run audit:capability -- "Executive Assessment"
```

After the architecture preflight completes, ask:

> **Does the registry accurately describe the active implementation path?**

Then ask:

> **Is Discovery’s executive understanding correct, useful, and clearly communicated?**

Only after both questions are answered should implementation begin.

---

# Planned Pre-Sprint Command

Create a reusable command such as:

```bash
npm run sprint:architecture
```

It should:

1. regenerate the Cognitive File Registry,
2. enrich the Cognitive Capability Registry,
3. validate the Capability Registry,
4. regenerate every registered Capability Trace,
5. detect broken implementation paths,
6. detect missing canonical producers,
7. detect missing Runtime destinations,
8. detect missing Executive destinations,
9. detect missing consumers,
10. detect architectural drift,
11. print a concise architecture briefing.

Eventually, `npm run sprint:start` should include this architecture preflight automatically.

---

# Current Architecture Status

## Established

- Cognitive Operating System
- Cognitive Object Model
- Cognitive Flow Map
- Cognitive Capability Registry
- Cognitive File Registry
- Cognitive Capability Audit
- Canonical Organizational Understanding pipeline
- Canonical Organizational Understanding scorer
- Registry-aware Capability Auditor
- Structural capability tracing
- Architecture drift reporting

## Current Incomplete Area

The architecture tooling is operational, but registry population is incomplete.

The Executive Assessment trace currently exposes missing registry metadata, including:

- produced cognitive objects,
- declared implementation consumers,
- complete implementation files,
- Executive destination mapping,
- detailed architecture relationships.

This is documentation and registry drift, not an engine failure.

---

# Atlas Rule

Atlas is now:

- the cognitive benchmark,
- the architectural verification environment,
- the executive understanding benchmark,
- and the canonical Organizational Understanding benchmark.

Every sprint should follow this sequence:

```text
Validate Architecture Registry

↓

Regenerate Capability Traces

↓

Run Atlas

↓

Verify Organizational Understanding

↓

Verify Cognitive Objects

↓

Verify Canonical Producers

↓

Verify Runtime and Executive Paths

↓

Update Registry
```

If Atlas demonstrates that executive understanding is incomplete, improve the existing synthesis before introducing additional reasoning.

If the capability trace demonstrates that the registry is incomplete, repair the registry before expanding the capability.

---

# Current Priorities

1. Complete the Executive Assessment registry entry.
2. Complete capability-level implementation consumer mapping.
3. Complete produced and consumed cognitive object mapping.
4. Regenerate all capability traces.
5. Build `sprint:architecture`.
6. Integrate architecture review into `sprint:start`.
7. Complete Memory Operating System population.
8. Complete Learning Operating System population.
9. Improve Executive Understanding quality.
10. Resume simulated organization pressure testing after architecture verification is reliable.

---

# Do Not

- Build new reasoning engines unless Atlas demonstrates a missing capability.
- Create duplicate canonical producers.
- Allow multiple systems to produce the same cognitive object.
- Allow a capability to exist without an Operating System owner.
- Allow a subsystem to exist without an Operating System.
- Allow a cognitive object without provenance.
- Allow registry metadata to contradict the active code path.
- Treat every structural search match as an implementation file.
- Mix capability dependencies with file-level consumers.
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
5. Which cognitive objects does it consume?
6. Is there already a canonical producer?
7. Is the capability registered?
8. Does Runtime persist it?
9. Does Executive Projection expose it?
10. Does Atlas validate it?
11. Does the capability trace confirm the active path?

If multiple systems produce the same cognitive object, simplify the architecture before expanding the engine.

If the registry cannot describe the implementation accurately, update the architecture record before continuing.

---

# Long-Term Development Principle

> **Architecture before implementation.**

> **Objects before code.**

> **Capabilities before files.**

> **Every cognitive object should have one canonical producer.**

> **Every capability should describe its dependencies, outputs, consumers, and destinations.**

> **Executive Assessment produces the canonical structured Organizational Understanding used by Atlas and Executive Projection.**

> **Atlas validates cognition.**

> **The Capability Registry validates ownership.**

> **The File Registry validates implementation.**

> **Capability Traces validate connectivity and drift.**

> **The Cognitive Architecture validates Discovery itself.**