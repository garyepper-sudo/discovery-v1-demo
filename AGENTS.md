# Discovery Engineering Guide (AGENTS.md)

## Purpose

This document defines how AI coding agents should work within the Discovery codebase.

Discovery has an established architecture. Your responsibility is to implement improvements while preserving architectural integrity.

Favor incremental improvement over redesign.

When uncertain, preserve existing architecture and ask for clarification rather than inventing new patterns.

---

# Canonical Product Governance

Before any product implementation, read:

1. `docs/Product/CANONICAL_PRODUCT_ARCHITECTURE.md`
2. `docs/Product/PRODUCT_GAPS.md`
3. `docs/Product/PRODUCT_ROADMAP.md`
4. `docs/Product/PRODUCT_DECISIONS.md`
5. `docs/Product/PRODUCT_GOVERNANCE.md`

Every product implementation must identify the registered Gap ID and roadmap
phase it addresses, declare whether architecture changes, and reuse existing
owners wherever possible. If architecture changes, provide evidence that the
current canonical architecture cannot support the required workflow.

Mandatory product boundaries:

- `ProductQuestion` is the canonical long-lived product object.
- `ProductQuestionWorkspace` is the canonical frontend boundary.
- Frontends render product contracts and never interpret engine or Runtime
  internals.
- Prefer composition through existing Runtime, cognition, authorization,
  persistence, and Product Workflow.
- Do not create duplicate persistence, organization identity, product meaning,
  confidence ownership, or lineage.
- Every new capability declares ownership, persistence, lineage, confidence
  ownership, authorization, fixture coverage, and validator coverage.
- Every product contract change requires version, fixture, validation,
  migration, and governance-document review.
- Deferred work belongs in `PRODUCT_GAPS.md`, not only in prompts, handoffs,
  comments, or agent memory.

Run `npm run validate:product-governance` for every product architecture or
contract change.

---

# Discovery Identity

Discovery is a shared organizational intelligence platform.

Its purpose is to maximize useful organizational understanding for any
authorized person, team, function, or organizational scope. The Executive
Cognitive Operating System is Discovery's first major application, not the
universal identity or endpoint of the platform.

Discovery is not:

- a chatbot
- a dashboard
- a reporting platform
- a document repository

Discovery is:

- a governed organizational learning system
- an organizational reasoning engine
- a shared intelligence platform
- a decision and action support platform

The Organization Model is the living product representation. The Operating
Model is its primary operational representation. Organization Runtime remains
the canonical technical persistence boundary.

---

# Product Philosophy

Discovery is question-first. The user's first objective is:

> What are you trying to understand?

Do not make Operating Model construction, organization configuration, or
document upload the onboarding objective. Acquire additional Evidence only
after the objective is understood.

Canonical cognition is never presented directly in the ordinary product:

```text
canonical cognition
→ Product Translation
→ Product Understanding
→ Truthful Utility
→ user-facing experience
```

Product Translation and product-owned Evidence Roles are deterministic,
lineage-preserving, confidence-preserving, non-authoritative layers. Product
Understanding may be Supported, Provisional, or Insufficient. Optimize for
Maximum Truthful Utility rather than maximum certainty or completion.

Organizational Functions remain benchmark-only research. They are not a
canonical cognitive layer or production dependency.

Organizations continuously generate:

- evidence
- observations
- organizational understanding
- executive work
- decisions
- initiatives
- reviews
- learning

Every governed, meaningful activity should be capable of improving future
organizational understanding. Interaction or persistence alone never grants
organizational authority.

The product exists to create a continuous organizational learning flywheel.

---

# Current Product Stage

Discovery has completed its first executive lifecycle and is beginning the
Discovery 2 production-integration program.

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

Future work should strengthen shared organizational understanding rather than
introducing unrelated features or executive-only cognition.

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

Discovery's current organizing theory is **Adaptive Organizational Cognition**:
the platform is a governed organizational learning system whose cognition
exhibits a variation-selection-retention grammar at several boundaries. This
is an organizing theory, not an evolutionary algorithm or replacement for the
technical architecture.

Structured Organizational Reasoning remains the technical execution
architecture. Explanation-centered reasoning is the current frontier.
Completed Organizational Explanations exist in production, while competing
Explanation adjudication is benchmark validated and not production integrated.

Authority, persistence, and disclosure are distinct. Evidence ancestry records
where cognition came from; comparative evidential role records how Evidence
supports, opposes, discriminates among, or revises specific alternatives.
These concepts must not be conflated.

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

Discovery exposes understanding, not internal cognition. Mechanisms, Beliefs,
Theories, and Conditions remain internal unless a future expert/debug
experience intentionally and safely exposes them.

Avoid introducing dashboard-style experiences.

Favor:

- executive workflows
- organizational understanding
- decision quality
- continuous learning

Avoid adding features that do not strengthen executive judgment.

---

# Canonical Product Routing

Before changing product routes or shells, read
`docs/Product/CANONICAL_PRODUCT_ROUTES.md`.

- `/` is a Routing Controller only.
- `/onboarding` owns the canonical Onboarding Experience.
- `/your-organization` owns the canonical primary product Experience.
- `/organizations` owns organization selection.
- `/discovery-v1` is a Legacy Compatibility Layer only.
- Do not add features to legacy routes, redirect users into legacy UI as a
  shortcut, or create a duplicate Product Shell.
- Reuse the canonical Product Shell at
  `components/product-shell/DiscoveryShell.tsx`.
- Use Routing Controller, Product Shell, Experience, and Legacy Compatibility
  Layer according to the canonical document; do not use “wrapper” as an
  ambiguous architectural designation.

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

The goal is to continuously improve Discovery while preserving its governed
Organizational Model, structured cognition, Runtime boundaries, and downstream
Executive Cognitive Operating System.
