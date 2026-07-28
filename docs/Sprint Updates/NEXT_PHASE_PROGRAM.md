# Discovery Phase 2 — Customer Value and Organizational Understanding

**Status:** Planned

## Program Direction

Discovery Alpha v1.0 is operational. Phase 2 converts the proven platform into
repeatable customer value while preserving the canonical operational baseline.
Broad infrastructure redesign is out of scope unless Production or benchmark
evidence demonstrates a genuine defect.

## Phase 2.1 — Repeatable Organization Activation

Convert the manual gated launch into a reviewed operator workflow:

```text
create organization
→ provision Runtime
→ create access
→ activate
→ smoke test
→ issue receipt
```

The workflow must be idempotent, bounded, reversible, independently
authorized, default-disabled, free of provider guesswork, and built from
existing infrastructure.

## Phase 2.2 — AI-Guided Onboarding

Create a product journey for organization creation, an understanding
objective, initial organizational context, user role and scope, initial data
sources, onboarding progress, and the first useful understanding.

## Phase 2.3 — Goal-Directed Data Retrieval

Implement:

```text
Understanding Objective
→ Current Understanding
→ Knowledge Gaps
→ Targeted AI Retrieval
→ Evidence
→ Organizational Intelligence
→ Updated Understanding
```

Do not repeatedly rescan every source. Use incremental ingestion, source
cursors, changed-item detection, evidence lineage, and bounded retrieval.

## Phase 2.4 — Canonical Demonstration Organization

Complete the longitudinal Atlas simulation across Slack, Google Drive, Jira,
decisions, leadership events, operational changes, and outcomes. Use Atlas as
the regression organization, acceptance environment, investor demonstration,
design-partner rehearsal, connector benchmark, and longitudinal cognition
benchmark.

## Phase 2.5 — Understanding Quality

Optimize the Organizational Understanding Index, User Intelligence Index,
Collective Intelligence Index, Governance Integrity Index, and System
Sustainability Index. Continue benchmark-gated reasoning improvements.

## Phase 2.6 — Fine-Grained Disclosure

Define and test: **What is the most truthful and useful understanding this
user is allowed to receive?**

Cover evidence and claim sensitivity, conclusion-level disclosure, role and
scope, hidden evidence, confidence under partial evidence, meaning-level
leakage, and authorization-aware projection. Do not implement this casually
without benchmarks.

## Phase 2.7 — Design Partner Readiness

Prepare an onboarding runbook, support process, product feedback loop,
acceptance checklist, failure recovery, data-handling explanation, pricing and
pilot structure, and customer-success measurement.

## Program Governance

The canonical source is
`docs/Architecture/Canon/DISCOVERY_ALPHA_V1_OPERATIONAL_BASELINE.md`.
Architecture canon should govern deployment reports, handoff summaries,
operator guides, and startup output. A later documentation-consolidation
sprint should reconcile overlapping activation, readiness, architecture-state,
handoff, and sprint-report families while retaining historical evidence.

Repository duplicate-file cleanup remains a separate maintenance task. The
approximately 524 untracked files whose names end in ` 2` or ` 3` must not
block this operational baseline or enter Phase 2 work accidentally.

## Immediate Next Step

Begin **Discovery Phase 2.1 — Repeatable Organization Activation** with a
bounded workflow contract and noninterference plan before implementation.
