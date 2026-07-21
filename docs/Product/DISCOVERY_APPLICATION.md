# Discovery Application

**Status:** Canonical

---

# Purpose

This document defines the canonical application architecture of Discovery.

It answers one question:

> **How does Discovery expose the Organizational Lifecycle to executives?**

The Cognitive Operating System owns reasoning.

The Application owns workflow.

The Runtime owns organizational memory.

The Operating Model owns organizational understanding.

The interface exists to guide executives through one continuous organizational lifecycle.

---

# Application Identity

Discovery is one continuously running Executive Operating System.

It is not a collection of pages.

It is not a collection of independent tools.

It is one continuously evolving organization.

Everything presented to the executive is a different perspective on the same organization.

---

# Core Architecture

```text
Organization

↓

Operating Model

↓

Runtime

↓

Executive Projection

↓

Application

↓

Executive Experience
```

There is:

- one organization,
- one Runtime,
- one Operating Model,
- one Executive Projection.

The application simply exposes different stages of the organizational lifecycle.

---

# Ownership

## Cognitive Operating System

Owns:

- understanding
- reasoning
- recommendations
- simulation
- confidence
- learning
- Operating Model evolution

Never owns:

- workflows
- navigation
- UI state
- presentation

---

## Runtime

Owns:

- organizational memory
- executive work
- decision records
- initiative records
- learning history
- organizational history

Runtime persists organizational reality.

---

## Application

Owns:

- navigation
- workflow
- temporary interaction state
- active executive work
- user interactions

The Application orchestrates the lifecycle.

It never recreates cognition.

---

## Executive Experience

Owns:

- presentation
- progressive disclosure
- executive interaction
- communication

Executive Experience consumes canonical projections.

It never performs reasoning.

---

# Canonical Flow

The application exists to move organizations through the Organizational Lifecycle.

```text
Organization

↓

Operating Model

↓

Continuous Understanding

↓

Executive Work

↓

Decision Support

↓

Executive Commitment

↓

Execution

↓

Review

↓

Learning

↓

Operating Model Evolution

↓

Repeat
```

The application should always guide the executive toward the next stage.

---

# Executive Experience

Executives primarily experience four recurring activities.

## Understand

Discovery explains:

- what changed,
- why it changed,
- what matters,
- remaining uncertainty.

---

## Work

Executives manage Executive Work.

Executive Work includes:

- Discovery recommendations,
- executive-created decisions,
- executive-created initiatives,
- active initiatives,
- reviews due.

Executive Work is the center of the application.

---

## Improve

Executives improve the organization by:

- uploading evidence,
- recording decisions,
- recording initiatives,
- reviewing outcomes.

Every interaction strengthens the Operating Model.

---

## Learn

Discovery improves future executive judgment through accumulated organizational history.

Learning should become visible over time.

---

# Navigation

Navigation changes perspective.

Navigation never changes cognition.

Executives move between lifecycle stages rather than unrelated pages.

Examples:

```text
Executive Work

↓

Decision Support

↓

Execution

↓

Review
```

Changing views should never recreate organizational understanding.

---

# Application State

The application owns only transient interaction state.

Examples:

```text
Application State

active lifecycle stage

selected executive work

selected decision

selected initiative

navigation history

temporary UI state
```

Organizational understanding remains inside Runtime.

---

# Progressive Disclosure

Every experience should default to:

```text
Summary

↓

Recommendation

↓

Explanation

↓

Supporting Reasoning
```

Executives should never be overwhelmed with unnecessary detail.

The full Cognitive Operating System remains available through progressive disclosure.

---

# Product Validation

The application is validated through the canonical Product Benchmark.

Success is measured by completing one full organizational lifecycle.

The benchmark is defined in:

```
PRODUCT_BENCHMARK.md
```

---

# Relationship to Organizational Lifecycle

This document defines the application architecture.

The organizational lifecycle is defined in:

```
ORGANIZATIONAL_LIFECYCLE.md
```

The application exists solely to expose and orchestrate that lifecycle.

---

# Design Principles

The application should always feel like one continuously evolving organization.

Every interaction should improve the Operating Model.

Every Operating Model improvement should improve future executive judgment.

Every screen should move the organization forward through its lifecycle.

---

# Canonical Rule

The Cognitive Operating System thinks.

The Runtime remembers.

The Operating Model understands.

The Application orchestrates.

The Executive Experience communicates.

Together they continuously improve organizational judgment.