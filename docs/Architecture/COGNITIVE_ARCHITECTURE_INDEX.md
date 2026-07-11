# Discovery Cognitive Architecture Index

**Status:** Proposed

---

# Purpose

This document is the entry point for Discovery's cognitive architecture.

It explains how the architectural documents relate to one another and which document answers which architectural question.

Discovery's architecture is described through several complementary views rather than a single document.

---

# Architecture Layers

## 1. Cognitive Object Model

Document

```
COGNITIVE_OBJECT_MODEL.md
```

Answers

- What cognitive objects exist?
- What does each object mean?
- Who produces it?
- Who consumes it?
- How is it represented?

Primary focus

**Knowledge**

---

## 2. Cognitive Flow Map

Document

```
COGNITIVE_FLOW_MAP.md
```

Answers

- How does cognition move?
- What transforms into what?
- Where does executive understanding originate?
- Where are missing transformations?

Primary focus

**Transformation**

---

## 3. Cognitive Operating System

Document

```
COGNITIVE_OPERATING_SYSTEM.md
```

Answers

- Which operating systems exist?
- Which subsystems belong to each operating system?
- Which subsystem owns each capability?

Primary focus

**Ownership**

---

## 4. Cognitive Capability Registry

Document

```
COGNITIVE_CAPABILITY_REGISTRY.json
```

Answers

- Which capabilities exist?
- What are their canonical producers?
- What do they consume?
- What do they produce?
- What higher-order cognition depends on them?

Primary focus

**Capability**

---

## 5. Cognitive File Registry

Document

```
COGNITIVE_FILE_REGISTRY.json
```

Answers

- Which source files implement which capabilities?
- Which files are canonical?
- Which files require review?

Primary focus

**Implementation**

---

## 6. Cognitive Capability Audit

Document

```
COGNITIVE_CAPABILITY_AUDIT.json
```

Answers

- Are there orphaned capabilities?
- Are canonical producers missing?
- Are dependencies broken?
- Is the architecture internally consistent?

Primary focus

**Integrity**

---

# Canonical Cognitive Hierarchy

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

---

# Canonical Cognitive Lifecycle

```text
Source Material

↓

Evidence

↓

Entities

↓

Observations

↓

Signals

↓

Phenomena

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
```

---

# Design Principles

Discovery is:

- object-oriented cognitively,
- capability-oriented architecturally,
- subsystem-oriented organizationally,
- operating-system-oriented strategically.

Files are implementation.

Capabilities are architecture.

Objects are knowledge.

Operating Systems are ownership.

---

# Current Status

The Perception Operating System has been initially mapped.

The remaining operating systems will be mapped incrementally using the same process.

The architecture should evolve from the cognitive model outward rather than from the implementation inward.