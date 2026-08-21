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

The user owns authorization and judgment for Git state transitions. By default,
Codex must not stage or commit repository changes.

## Execution lanes

Every work order must use either the Routine Governed Lane or the Sensitive
Governed Lane. Lane selection does not replace human product or architecture
judgment, relax scope control, or permit a validation or review exception.

### Routine Governed Lane

A complete work order may declare:

```text
authorized_through: local_canonical_integration
stop_before: push
```

When the user explicitly authorizes such a work order, that one authorization
covers only the exact work-order facts and permits Codex to proceed through:

- dedicated branch and worktree creation
- bounded implementation
- required validation
- independent review
- bounded in-scope remediation
- one exact local commit
- clean fast-forward integration into local canonical `main`
- post-integration verification
- current Alpha Control Tower projection update

Codex must not pause for separate routine local-commit or clean-fast-forward
authorization while every approved work-order fact remains exact. The existing
staging, hook, commit, and post-commit requirements below remain mandatory.
For this lane, the upfront explicitly authorized complete Routine work order
itself is the required authorization for its one exact local commit and its one
clean fast-forward canonical integration. This Routine-lane rule takes
precedence over the default and Sensitive-lane clauses below that otherwise
require a separately authorized commit packet or exclude integration from local
commit authorization. Before staging, the Governor must internally construct
and verify every fact required by the complete commit packet below; before
integration, it must internally construct and verify the exact integration
facts. It need not request renewed authorization while all facts remain exact
and no mismatch or sensitive boundary is encountered.
Before canonical integration, Codex must additionally verify the exact clean
canonical worktree and branch, expected canonical HEAD and tree, target commit
and tree, linear ancestry, committed path set, validation and review results,
and preservation of protected and unrelated state. It may then perform only a
clean `--ff-only` local canonical integration and must postverify the resulting
HEAD, tree, ancestry, worktree state, and preservation state.

The Routine Governed Lane fails closed and stops for human attention if:

- the path set expands
- the branch, worktree, parent, or canonical baseline drifts
- required validation does not satisfy its controlling acceptance rule
- independent review fails
- integration is not a clean fast-forward
- unexpected repository state appears
- a sensitive boundary is encountered

Routine authorization expires at the first mismatch and cannot be silently
reused for a changed result, exception, retry with materially different facts,
or broader task. Machine-verifiable transitions do not displace required human
judgment about Product meaning, architecture, acceptance rules, or whether a
boundary is sensitive.

### Sensitive Governed Lane

Separate explicit authorization for both the exact local commit and the exact
canonical integration remains mandatory for changes involving:

- `AGENTS.md` or governance
- canonical owners
- architecture or thin-waist contracts
- authorization, identity, provenance, security, privacy, or non-disclosure
  boundaries
- persistent schemas or migrations
- production infrastructure
- credentials, secrets, or customer data
- new dependencies, services, or permissions
- destructive operations
- unresolved scope expansion
- an accepted benchmark or validation rule
- a non-fast-forward integration

Push, release, deployment, promotion, database action, production mutation,
branch deletion, worktree deletion, and destructive cleanup always require
separate explicit authorization in either lane. A work order cannot authorize
through any of those transitions merely by declaring the Routine Governed Lane.

Except for an exact Routine work order authorized as specified above, Codex may
stage exact paths and create one ordinary local commit only after the user
explicitly authorizes a complete commit packet identifying:

- objective and work-order identity
- exact worktree, branch, and expected parent HEAD
- exact proposed path list and path count
- expected diffstat
- material artifact hashes
- required validation results
- independent-review and bounded-remediation results
- exact commit message
- confirmation that no material uncertainty remains
- confirmation that the commit operation itself performs no push, merge,
  integration, promotion, release, or deployment; in the default and Sensitive
  lanes those transitions also remain unauthorized by the commit packet

Default and Sensitive-lane commit authorization applies to exactly one
identified local commit and expires after that commit or immediately upon drift
in any packet fact. Routine authorization remains active only through its exact
post-integration verification and Alpha Control Tower projection, and expires
there or immediately upon drift or a sensitive boundary. No authorization
carries forward, expands the path set, permits a changed message or amend, or
permits a second attempt after a materially changed result without renewed
approval.

Immediately before staging, Codex must independently verify the exact worktree,
branch, parent HEAD, initial index state, changed and untracked path set,
specified artifact hashes and sizes, applicability of validation and independent
review, absence of unexpected files or drift, and preservation of protected
worktrees, branches, artifacts, and unrelated state. Any mismatch must stop the
operation before staging.

Codex must stage each approved path explicitly, then verify the exact staged set
and count, inspect staged name-status and diffstat, run required staged
validation, and reverify material hashes. Never use `git add .`, `git add -A`,
`git commit -a`, an unrestricted directory glob, or any operation capable of
absorbing unapproved paths.

When every approved check passes, Codex may create exactly one normal local
commit with the exact approved message, allow ordinary repository hooks to run,
and surface a native protected-metadata approval request when required. It must
not bypass hooks, use `--no-verify`, amend, create an empty commit, change Git or
signing configuration, or suppress a validation failure.

If an operation fails after exact staging but before commit completion, Codex
may unstage only the exact authorized paths solely to restore the verified
pre-staging index state. It must leave working-tree bytes unchanged, not restore
or delete files, report the exact failure, and require renewed authorization if
the approved packet is no longer exact.

After committing, Codex must verify commit, parent, and tree identities; branch;
exact committed path set and count; diffstat; message; material hashes; clean or
expected worktree state; preservation of protected and unrelated repository
state; and absence of unauthorized transitions.

A default or Sensitive-lane local-commit authorization never authorizes push,
merge, rebase, cherry-pick, fast-forward or canonical-main integration, reset,
restoration of unrelated state, branch or worktree deletion, destructive
cleanup, promotion, release, deployment, database action, or infrastructure
mutation. The sole Routine-lane exception is its exact authorized clean
fast-forward canonical integration under the requirements above. Remote,
destructive, and release transitions remain separately controlled and
prohibited unless a later canonical rule and exact human authorization permit
them.

A commit containing `AGENTS.md` or another governance file must identify the
governance change explicitly in its packet, receive explicit human authorization
and independent review, and remain separate from unrelated Product or
implementation changes unless the user explicitly authorizes a combined
governance commit. Codex must not weaken, remove, or circumvent its own
governance rules merely to complete another task.

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
