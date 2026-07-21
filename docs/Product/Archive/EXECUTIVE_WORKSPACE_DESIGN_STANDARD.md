# Executive Workspace Design Standard

**Status:** Canonical

---

# Purpose

This document defines the standard structure for every executive workspace in Discovery.

The goal is to make every executive experience feel familiar, predictable, and cognitively lightweight while exposing progressively richer reasoning when appropriate.

Every workspace should answer exactly **one executive question**.

Discovery's reasoning engine may be sophisticated, but the executive experience should remain simple.

---

# Core Principle

One workspace.

One executive question.

One primary action.

---

# Workspace Structure

Every executive workspace should follow the same high-level layout.

```text
Hero

↓

Primary Executive Question

↓

Supporting Context

↓

Progressive Disclosure

↓

Primary Action
```

Optional

```text
Right Rail
```

---

# Section Responsibilities

## 1. Hero

Purpose

Orient the executive immediately.

The hero should establish:

- what this workspace is about,
- why it matters,
- where the executive is in the workflow.

The hero should not become a dashboard.

Examples

Executive Work

"What is happening?"

Evaluate Decision

"Reduce approval layers"

Decision Lab

"Recommended Strategy"

---

## 2. Primary Executive Question

Every workspace exists to answer exactly one executive question.

Examples

Executive Work

> What is happening?

Operating Model

> Why is it happening?

Executive Brief

> What should I do?

Evaluate Decision

> What would make this decision successful?

Decision Lab

> What happens if we do it?

Executive Work (after commitment)

> Did it work?

No workspace should attempt to answer multiple primary questions.

---

## 3. Supporting Context

Provide only the information necessary to answer the primary question.

Context should be concise.

Avoid exposing raw cognition unless it directly supports executive judgment.

---

## 4. Progressive Disclosure

Advanced reasoning should remain available but hidden by default.

Examples

- confidence details
- optimization variables
- intervention categories
- decision type
- assumptions
- constraint details
- simulation mechanics

Executives should never be required to understand the underlying reasoning architecture to use Discovery effectively.

---

## 5. Primary Action

Every workspace should end with one obvious action.

Examples

Executive Brief

Evaluate Decision

Decision Definition

Evaluate Decision

Decision Lab

Commit Decision

Executive Work

Review Progress

There should never be competing primary actions.

---

## 6. Right Rail

The right rail is optional.

When present, it should answer:

"What important context should I remember while making this decision?"

Good examples

- Discovery already understands...
- Current organizational state
- Key assumptions
- Current confidence
- Organizational memory

Avoid duplicating the main content.

---

# Design Principles

## Minimize Reading

Executives should understand a workspace in seconds.

Prefer summaries over explanations.

---

## Progressive Disclosure

Show only what is needed now.

Reveal complexity only when requested.

---

## Discovery Owns Context

Executives should not repeatedly explain their organization.

Discovery should leverage:

- Operating Model
- Organizational State
- Constraints
- Executive Assessment
- Organizational Learning
- Organizational Memory

to pre-populate every workflow whenever possible.

---

## Executives Define Intent

Discovery supplies understanding.

Executives define intent.

Examples

Discovery supplies

- recommendations
- context
- organizational reasoning

Executives define

- objectives
- desired outcomes
- final decisions

---

## Presentation Never Reconstructs Cognition

UI components consume canonical cognitive objects.

Presentation layers must not recreate:

- organizational reasoning
- optimization
- simulation
- executive recommendations

Presentation explains cognition.

It never performs cognition.

---

# Workspace Composition

Large workspaces should be composed from small presentation components.

Preferred pattern

```text
Workspace

├── Hero
├── PrimarySection
├── SupportingSection
├── ProgressiveDisclosure
├── Footer
└── RightRail
```

Workspaces should primarily orchestrate sections.

Individual sections should own one executive question.

---

# Workspace Size Guideline

Target

150–200 lines per workspace.

When a workspace grows beyond this size:

Extract another section.

Prefer many focused presentation components over one large workspace.

---

# Future Growth

New capabilities should generally appear as new sections rather than redesigning entire workspaces.

Examples

Evaluate Decision

Today

- Success
- Discovery Context
- Evaluation Preferences

Future

- Decision Readiness
- Stakeholder Review
- Market Assumptions
- Financial Assumptions
- External Intelligence

The overall workspace structure should remain stable as Discovery evolves.

---

# Product Philosophy

Discovery is an Executive Operating System.

Every workspace should reduce executive cognitive load.

Sophisticated organizational reasoning should remain behind the interface.

The executive experience should feel:

- clear,
- calm,
- decisive,
- trustworthy,
- progressively intelligent.

Executives should leave each workspace with one clear answer to one important question.