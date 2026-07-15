# Discovery Canonical Architecture

## Philosophy

Discovery is not a collection of AI features.

Discovery is a layered cognitive architecture.

Every capability should have:

- one canonical producer
- one canonical runtime representation
- one canonical projection
- one canonical executive presentation

Capabilities may be translated or adapted by downstream layers, but they should never be independently recreated.

---

# Core Architectural Principles

## One Capability

Every cognitive capability exists exactly once.

Examples:

- Executive Assessment
- Organizational State
- Theory Validation
- Investigation Opportunities
- Organizational Learning

Each capability has one canonical implementation.

---

## One Producer

Every capability has one canonical producer.

Other layers may:

- translate
- summarize
- project
- visualize

They should never generate competing versions of the same capability.

---

## Runtime is the Organizational Memory

The runtime is Discovery's living organizational memory.

It stores:

- Organizational Understanding
- Organizational State
- Organizational Conditions
- Organizational Beliefs
- Executive Assessment
- Investigation Opportunities
- Organizational Learning
- Memory Maturity

The runtime—not the UI—is the canonical representation of organizational cognition.

---

## Executive Projection

Executive Projection is the canonical contract between cognition and presentation.

Its responsibilities are:

- choose the canonical understanding
- project executive-ready objects
- hide engine complexity
- remain UI independent

Every executive experience should consume Executive Projection rather than engine objects directly.

---

# Cognitive Pipeline

Evidence

↓

Observations

↓

Signals

↓

Themes

↓

Mechanisms

↓

Beliefs

↓

Concepts

↓

Theories

↓

Organizational Conditions

↓

Organizational State

↓

Executive Assessment

↓

Executive Projection

↓

Executive Experience

---

# Major Engine Domains

## model/

Produces cognitive objects.

Examples:

- mechanisms
- beliefs
- theories
- organizational state

---

## semantic/

Transforms raw evidence into structured meaning.

---

## cognition/

Coordinates higher-order reasoning.

---

## understanding/

Creates persistent organizational understanding.

Owns:

- Current Understandings
- Executive Summary
- Domain Understanding
- Understanding Score

---

## runtime/

Owns longitudinal organizational memory.

This is the canonical persistence layer.

---

## executive/

Transforms organizational cognition into executive reasoning.

Owns:

- Executive Assessment
- Executive Dashboard
- Executive Learning

---

## expression/

Translates executive cognition into communication.

No reasoning should originate here.

---

## projection/

Projects runtime cognition into product contracts.

Projection is the boundary between cognition and UI.

---

# Canonical Capability Flow

Every significant capability should follow this lifecycle:

```
Engine

↓

Runtime

↓

Executive Projection

↓

Executive Experience

↓

Simulation

↓

Benchmark
```

If a capability stops before reaching Executive Projection, it is considered **hidden**.

If multiple producers exist, it is considered **duplicated**.

---

# Capability Classification

Every capability must be classified as one of:

🟢 Connected

Fully integrated through the complete pipeline.

---

🟡 Partial

Exists but is only partially connected.

---

🔴 Hidden

Exists in the engine/runtime but is not projected.

---

🟠 Duplicate

Multiple competing implementations exist.

---

⚫ Missing

Capability does not yet exist.

---

# UI Layers

Executive Workspace

↓

Current Understanding

↓

Executive Attention

↓

Executive Explanation

↓

Theory Validation

↓

Investigation Opportunities

↓

Living Understanding

↓

Reasoning Inspector

↓

Evidence

Every deeper layer should explain—not replace—the layer above it.

---

# Architecture Rules

## Rule 1

Never create duplicate capabilities.

---

## Rule 2

Never create a new capability until the Capability Audit proves it does not already exist.

---

## Rule 3

Every capability must identify:

- canonical producer
- runtime representation
- projection object
- executive presentation

---

## Rule 4

Reasoning belongs in the engine.

Presentation belongs in projection and UI.

Never move reasoning into UI components.

---

## Rule 5

Projection should never invent cognition.

Projection selects and translates existing cognition.

---

# Refactoring Rules

Never migrate more than one subsystem at a time.

Every migration must:

- compile
- typecheck
- pass benchmarks
- pass capability audit
- deploy

before continuing.

---

# Long-Term Development Principle

Discovery should evolve by:

1. auditing existing capabilities,
2. exposing hidden intelligence,
3. eliminating duplicate implementations,
4. strengthening canonical implementations,

before adding new reasoning engines.

> **Expose existing intelligence before expanding intelligence.**