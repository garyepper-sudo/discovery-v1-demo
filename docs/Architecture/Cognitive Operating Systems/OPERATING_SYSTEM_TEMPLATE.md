# Operating System Template

## Purpose

The Operating System defines one major cognitive faculty of Discovery.

It provides the canonical architectural boundary for a family of related cognitive capabilities.

Every capability in Discovery must belong to exactly one Operating System.

---

# Responsibilities

An Operating System is responsible for:

- defining its cognitive domain,
- organizing related subsystems,
- owning cognitive capabilities,
- producing and transforming cognitive objects,
- maintaining runtime state,
- exposing executive intelligence through Executive Projection,
- providing architectural ownership for all contained capabilities.

---

# Inputs

An Operating System consumes cognitive objects produced by upstream Operating Systems.

Inputs should be explicitly defined and traceable.

Example:

Perception OS receives:

- Source Material

Understanding OS receives:

- Evidence
- Observations
- Signals
- Contradictions
- Organizational Phenomena

---

# Outputs

Every Operating System produces cognitive objects consumed by downstream Operating Systems.

Outputs should represent stable organizational knowledge rather than implementation artifacts.

Example:

Understanding OS produces:

- Mechanisms
- Beliefs
- Concepts
- Theories
- Organizational Conditions
- Organizational State

---

# Runtime State

Every Operating System owns its Runtime representation.

Runtime should contain only canonical state required by downstream cognition.

Runtime must not duplicate information owned by another Operating System.

---

# Subsystems

Subsystems divide an Operating System into coherent functional domains.

Every subsystem belongs to exactly one Operating System.

Subsystems should represent stable cognitive responsibilities rather than implementation details.

Example:

Understanding Operating System

- Mechanism Subsystem
- Belief Subsystem
- Concept Subsystem
- Theory Subsystem
- Organizational Condition Subsystem
- Organizational State Subsystem

---

# Capabilities

Capabilities describe what the Operating System can do.

Every capability must have:

- one canonical owner,
- one canonical producer,
- one runtime destination,
- one executive representation (if applicable),
- Atlas verification.

Capabilities are implementation independent.

---

# Cognitive Objects

Cognitive Objects are the durable knowledge artifacts produced by cognition.

Every Cognitive Object should define:

- producer
- owner
- lifecycle
- runtime representation
- downstream consumers

Objects should represent organizational knowledge rather than implementation structures.

---

# Canonical Producers

Every capability must have exactly one canonical producer.

Canonical producers:

- create cognitive objects,
- update runtime,
- own semantic responsibility.

Duplicate producers should be eliminated during architecture population.

---

# Executive Projection

Operating Systems do not communicate directly with the UI.

Executive Projection serves as the canonical translation layer between Runtime and Executive Experience.

Every executive-facing concept should flow through Executive Projection.

---

# Atlas Validation

Atlas validates that the Operating System is architecturally complete.

Validation should verify:

- subsystem ownership,
- capability ownership,
- cognitive object ownership,
- canonical producers,
- runtime integration,
- executive projection,
- cognitive flow integrity.

No capability should exist outside Atlas validation.

---

# Completion Criteria

An Operating System is considered complete when:

- every subsystem has been identified,
- every capability has an owner,
- every capability has a canonical producer,
- every cognitive object has an owner,
- runtime representations exist,
- Executive Projection exposes all executive concepts,
- Atlas validates architectural completeness,
- no duplicate producers remain,
- no orphaned capabilities remain.

---

# Future Expansion

New capabilities should only be introduced when:

- Atlas demonstrates a genuine missing capability,
- no existing capability fulfills the responsibility,
- the capability has an Operating System owner,
- the capability has a subsystem owner,
- the capability has a canonical producer,
- the capability fits the Cognitive Flow.

Architecture population always takes priority over engine expansion.

---

# Architectural Principles

Discovery develops from architecture outward rather than implementation inward.

The canonical hierarchy is:

Operating System

↓

Subsystem

↓

Capability

↓

Cognitive Object

↓

Implementation

Files implement capabilities.

Capabilities produce cognitive objects.

Operating Systems own cognition.

Executive Projection communicates cognition.

Atlas validates the architecture.