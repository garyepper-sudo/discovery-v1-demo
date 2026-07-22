# Discovery Engineering Guide (AGENTS.md)

## Purpose

This document defines how AI coding agents should work within the Discovery codebase.

Discovery has an established architecture. Your responsibility is to implement improvements while preserving architectural integrity.

Favor incremental improvement over redesign.

When uncertain, preserve existing architecture and ask for clarification rather than inventing new patterns.

---

# Discovery Identity

Discovery is an Executive Cognitive Operating System.

Its purpose is to continuously improve executive judgment through a continuously evolving Operating Model.

Discovery is not:

- a chatbot
- a dashboard
- a reporting platform
- a document repository

Discovery is:

- an Executive Operating System
- an organizational reasoning engine
- a decision support platform
- a continuous organizational learning system

The Operating Model is the product.

Everything else exists to improve it.

---

# Product Philosophy

Organizations continuously generate:

- evidence
- observations
- organizational understanding
- executive work
- decisions
- initiatives
- reviews
- learning

Every completed activity should improve the Operating Model.

The product exists to create a continuous organizational learning flywheel.

---

# Current Product Stage

Discovery is currently focused on completing one complete organizational lifecycle.

Current lifecycle:

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

Future work should strengthen this lifecycle rather than introducing unrelated features.

---

# Canonical Architecture

The following systems are considered architecturally stable.

Do not redesign them unless explicitly instructed.

- Cognitive Operating System
- Runtime
- Operating Model
- Capability Registry
- Executive Projection
- Executive Communication
- Executive Decision pipeline

Current work is exposing these capabilities through the product.

---

# Runtime

The Runtime is canonical.

The Runtime already supports multiple organizations.

Do not redesign:

- OrganizationRuntime
- Runtime persistence
- Runtime memory
- Cognitive pipeline

Organization identity should flow through the application rather than being recreated.

---

# Cognitive Pipeline

Preserve the canonical reasoning pipeline.

Evidence

↓

Entities

↓

Observations

↓

Signals

↓

Contradictions

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

Do not skip layers.

Do not merge layers.

Do not invent parallel pipelines.

---

# Engineering Principles

Always:

- make the smallest change possible
- preserve architecture
- reuse existing capabilities
- prefer composition over duplication
- preserve deterministic behavior
- maintain backward compatibility whenever possible

Never redesign systems simply because another implementation seems cleaner.

---

# Product Principles

Executive Work is the center of the product.

Avoid introducing dashboard-style experiences.

Favor:

- executive workflows
- organizational understanding
- decision quality
- continuous learning

Avoid adding features that do not strengthen executive judgment.

---

# Benchmarks

Everything under:

engine/benchmark/**

is canonical validation infrastructure.

Do not modify benchmark behavior unless explicitly instructed.

Atlas remains the canonical benchmark organization.

---

# Documentation

When changing architecture:

Update the corresponding architecture documentation.

When changing product philosophy:

Update canonical product documentation.

Avoid creating duplicate documentation.

Prefer improving canonical documents over creating new ones.

---

# Validation

Every implementation must finish by running:

npm run typecheck

and

npm run build

Do not consider work complete if either fails.

If additional benchmarks exist for the modified subsystem, run them when appropriate.

---

# Git

Never:

- commit
- push
- merge
- rebase
- delete branches

The user owns Git operations.

---

# Code Style

Follow existing project conventions.

Prefer:

- explicit code
- readable code
- deterministic code

Avoid:

- unnecessary abstractions
- speculative architecture
- duplicate implementations
- unnecessary dependencies

Favor consistency over cleverness.

---

# Scope Control

Modify only the files required for the requested task.

Avoid unrelated cleanup.

Avoid opportunistic refactoring.

Leave unrelated issues untouched unless explicitly requested.

---

# Implementation Workflow

For every task:

1. Understand the request.
2. Identify the minimal implementation.
3. Preserve architecture.
4. Implement.
5. Run validation.
6. Summarize changes.

---

# Reporting

At completion always report:

## Files Changed

List every modified file.

## Summary

Explain what changed.

## Validation

Report:

- npm run typecheck
- npm run build

and any additional validation performed.

## Risks

Identify any architectural concerns or follow-up work.

---

# Things Never To Change Without Explicit Approval

- Cognitive Operating System
- Runtime contracts
- Capability Registry
- Organizational memory model
- Executive Projection contracts
- Executive Communication contracts
- Canonical benchmark behavior
- Product philosophy

If a task appears to require changing one of these, stop and ask for clarification.

---

# Discovery Engineering Philosophy

Discovery is built through disciplined iteration.

Prefer:

small commits

↓

validated behavior

↓

architectural stability

↓

continuous improvement

over large rewrites.

The goal is not simply to write working code.

The goal is to continuously improve Discovery while preserving the integrity of its Executive Cognitive Operating System.