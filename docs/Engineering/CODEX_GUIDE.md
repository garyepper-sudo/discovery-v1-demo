# Discovery Engineering Guide

**Status:** Canonical

---

# Purpose

This document defines the engineering rules for implementing Discovery.

It exists to ensure that all contributors—human or AI—produce code that is consistent with Discovery's architecture and engineering philosophy.

This document applies to:

- Codex
- ChatGPT
- AI coding agents
- Human contributors

If implementation instructions conflict with this document, this document is authoritative unless explicitly overridden.

---

# Engineering Philosophy

Discovery is an Executive Cognitive Operating System.

The architecture is intentionally designed.

Implementation should preserve architectural clarity rather than optimize for short-term convenience.

When in doubt:

- preserve architecture,
- preserve determinism,
- preserve explainability,
- preserve simplicity.

---

# Core Principles

## Architecture First

Never introduce architecture while implementing a feature.

Architecture is decided before implementation.

Implementation should realize existing architecture.

---

## Small Commits

Each commit should represent one architectural or functional idea.

Preferred:

```
Introduce organization identity
```

```
Thread organization identity through API routes
```

Avoid:

```
Refactor everything
```

---

## Verify Every Change

Before considering work complete, always run:

```bash
npm run typecheck
npm run build
```

If benchmarks are affected:

```bash
npm run benchmark
```

Do not consider implementation complete until verification passes.

---

## Preserve Existing Behavior

Default rule:

Refactor behavior without changing functionality.

If functionality changes intentionally:

- explain why,
- explain expected behavior,
- identify affected areas.

---

## Keep Benchmarks Stable

Benchmarks are canonical validation artifacts.

Unless explicitly instructed:

Do not modify:

```
engine/benchmark/**
```

Benchmark organizations such as:

```
atlas-manufacturing-simulation
```

exist specifically for deterministic validation.

Do not replace benchmark identifiers with production identifiers.

---

## Runtime is Canonical

Treat Runtime as the canonical source of organizational memory.

Do not duplicate Runtime state elsewhere.

Everything persistent belongs to Runtime.

---

## Operating Model First

The Operating Model is Discovery's primary asset.

Features should improve:

- understanding,
- executive judgment,
- learning,
- organizational evolution.

Do not build features that bypass or ignore the Operating Model.

---

## Prefer Existing Systems

Before creating:

- a new service,
- a new model,
- a new abstraction,
- a new utility,

first determine whether an existing implementation already satisfies the need.

Prefer extending existing architecture over creating parallel architecture.

---

## Minimize Reading

Discovery serves executives.

Interfaces should:

- surface summaries first,
- progressively disclose detail,
- reduce cognitive load.

Favor concise communication.

---

# Scope Rules

Implementation tasks should clearly define:

## Goal

One sentence.

## In Scope

Files that may be modified.

## Out of Scope

Files that must not be modified.

Example:

In Scope

```
app/api/**
```

Out of Scope

```
engine/benchmark/**
engine/v3/runtime/**
```

---

# Decision Rules

When multiple implementations are possible:

Prefer the solution that:

1. Preserves architecture.
2. Minimizes complexity.
3. Reuses existing systems.
4. Produces deterministic behavior.
5. Requires fewer concepts.
6. Is easier to explain.

---

# Product Rules

Do not introduce features outside the current product roadmap.

Current MVP focuses on:

```
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

Decision Commitment

↓

Execution

↓

Learning

↓

Operating Model Evolution
```

Do not expand product scope without explicit instruction.

---

# Persistence Rules

Organization identity must remain separate from organization display name.

Preferred:

```
organizationId

↓

Runtime

↓

Operating Model
```

Avoid using:

- company name,
- organization title,
- UI labels,

as durable identifiers.

---

# Authentication Rules

Authentication identifies users.

Runtime identifies organizations.

Do not couple authentication directly to Runtime persistence.

Desired model:

```
User

↓

Organizations

↓

Active Organization

↓

Runtime
```

---

# Code Quality

Prefer:

- deterministic code,
- explicit types,
- readable names,
- small functions,
- composition over duplication.

Avoid:

- hidden state,
- unnecessary abstraction,
- premature optimization.

---

# Git Rules

Do not:

- commit,
- push,
- merge,
- delete branches,

unless explicitly instructed.

Implementation should stop after verification.

---

# Required Validation

Every implementation should conclude with:

## Summary

Files changed.

## Behavior changed.

## Risks.

## Follow-up work.

## Verification

```
✓ Typecheck

✓ Build

✓ Benchmarks (if applicable)
```

---

# When Unsure

Stop.

Explain:

- available options,
- tradeoffs,
- recommendation.

Do not invent architecture.

Do not guess product direction.

Ask for clarification instead.

---

# Discovery Principle

Every implementation should make Discovery better at improving executive judgment.

If a change does not improve:

- organizational understanding,
- executive decision-making,
- organizational learning,
- Operating Model quality,

question whether it belongs in the product.