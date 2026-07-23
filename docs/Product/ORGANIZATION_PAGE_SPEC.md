# Organization Page Specification

**Status:** Canonical (Sprint 79)

---

# Purpose

The Organization Page is Discovery's primary product experience.

It is the first page every executive sees and the page they should naturally return to every day.

The Organization Page is **not** an onboarding page.

It is **not** a dashboard.

It is the executive's primary interface to their Organization Model.

As Discovery learns, the page evolves.

As the organization changes, the page evolves.

As decisions are validated, the page evolves.

The Organization Page should always answer one question:

> **How well do we understand our organization today?**

---

# Product Philosophy

Discovery is centered around a continuously evolving Organization Model.

Executives are not users of the model.

They are its stewards.

Every interaction with Discovery either:

- improves the Organization Model,
- validates the Organization Model,
- challenges the Organization Model,
- or uses the Organization Model to support executive decisions.

The Organization Page exists to cultivate this relationship.

---

# Design Goals

The Organization Page should feel:

- calm
- premium
- intelligent
- alive
- continuously evolving

It should never feel like:

- onboarding software
- enterprise configuration
- dashboard software
- AI chat

The experience should feel like watching an understanding gradually become clearer.

---

# Primary Question

Every visit should answer:

> **What does Discovery currently understand about my organization?**

Everything else is secondary.

---

# Canonical Page Layout

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Sidebar                                                     │
│                                                              │
│  ● Your Organization                                         │
│  ● Decisions                                                 │
│  ● Research                                                  │
│  ● Ask                                                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Your Organization                               │
│                                                              │
│         (Organization Visualization)                         │
│                                                              │
│              Today's Story                                   │
│                                                              │
│              What Changed                                    │
│                                                              │
│              Continue Improving                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The visual hierarchy should remain consistent regardless of Organization maturity.

Only the content changes.

---

# Organization Maturity

The page does not change.

The Organization Model changes.

Discovery supports five maturity states.

```text
EMPTY

↓

EMERGING

↓

DEVELOPING

↓

ACTIVE

↓

EVOLVING
```

There is no completed state.

Organizations continuously evolve.

---

# State 0 — Empty

Purpose:

Create curiosity.

The page should feel empty but full of possibility.

## Visualization

A very diffuse abstract form.

Minimal structure.

Slow movement.

Very low opacity.

## Copy

Headline:

> Your Organization

Supporting text:

> Your organization is beginning to take shape.

Body:

> Discovery builds an evolving understanding of how your organization actually works.
>
> Every conversation, document, decision, and correction improves that understanding.

Primary CTA:

> Begin Understanding

Navigation:

Only:

```
Your Organization
```

No other pages are visible.

---

# State 1 — Emerging

Purpose:

Teach Discovery one important thing.

The page asks for only one interaction.

Example:

> What's the most important initiative your organization is working on?

Examples:

- Improve profitability
- Launch Product X
- Expand internationally

Discovery does not ask for multiple questions.

One interaction only.

After submission:

The visualization becomes slightly more coherent.

Discovery responds:

> I've begun identifying your organization's primary objectives.

---

# State 2 — Developing

Purpose:

Reward the executive.

Discovery asks for one supporting document.

Suggestions:

- Board deck
- Strategic plan
- Financial report
- Meeting notes

After ingestion:

The engine executes normally.

Discovery surfaces exactly one understanding.

---

## Today's Story

Example:

> Critical organizational knowledge appears concentrated among a small number of senior leaders.

Supporting information:

- Confidence
- Why it matters
- Learn more

Discovery then asks:

> Does this feel accurate?

Responses:

- Yes
- Needs Refinement

This is the executive's first stewardship interaction.

---

# State 3 — Active

Purpose:

The Organization becomes operational.

Navigation expands.

```
Your Organization

Decisions
```

The page now contains:

- Organization Visualization
- Today's Story
- What Changed
- Continue Improving

---

## Today's Story

Always the largest component.

Exactly one story.

Discovery should never compete with itself by presenting multiple equally important narratives.

Example:

> Delivery quality remains dependent on founder knowledge.

Supporting information:

- Confidence
- Why this matters
- What changed
- View Understanding

---

## What Changed

Recent organizational learning.

Examples:

```
Knowledge continuity improved

Decision confidence increased

Leadership dependency reduced
```

Discovery should always demonstrate progress.

---

## Continue Improving

Discovery asks for exactly one next action.

Examples:

- Upload Board Deck
- Connect NetSuite
- Upload Meeting Notes
- Add Current Initiative

Discovery should always explain why additional information is useful.

Never ask for information without first providing value.

---

# State 4 — Evolving

Purpose:

The Organization has become a continuously improving system.

The page alternates naturally between:

- Today's Story
- New Learning
- Decision Opportunity
- Improve Understanding

The page should never feel static.

---

# Organization Visualization

Purpose:

Represent the coherence of Discovery's understanding.

The visualization does **not** represent:

- data volume
- document count
- graph size
- organizational hierarchy

It represents:

- understanding
- coherence
- confidence
- learning

Version One intentionally remains simple.

Five visual states only.

```
○

↓

◔

↓

◑

↓

◕

↓

●
```

Future versions may become significantly richer.

---

# Sidebar

The sidebar grows with the Organization.

## Empty

```
Your Organization
```

---

## Developing

```
Your Organization

Decisions
```

---

## Active

```
Your Organization

Decisions

Research

Ask
```

Discovery never teaches navigation through tutorials.

Capabilities are introduced when they become useful.

---

# Executive Stewardship Loop

Discovery continuously repeats the following interaction:

```
Teach

↓

Discovery Learns

↓

Discovery Rewards

↓

Executive Validates

↓

Organization Improves
```

Executives should never feel they are uploading information.

They should feel they are improving their organization's understanding.

---

# Information Requests

Discovery should request information only after delivering value.

Correct pattern:

```
Teach me

↓

I'll show you something valuable

↓

Teach me one more thing

↓

I'll show you something even better
```

Never:

```
Upload

Upload

Upload

Upload
```

Discovery earns every request.

---

# Executive Trust

Discovery continuously reinforces trust by explaining:

- what it understands,
- why it believes it,
- what changed,
- what remains uncertain.

The Organization Model should become increasingly trusted through validation rather than blind acceptance.

---

# Success Criteria

Within the first five minutes an executive should:

- Teach Discovery one important organizational objective.
- Provide one supporting document.
- Receive one meaningful organizational insight.
- Validate or challenge that insight.
- Watch the Organization become visibly more coherent.
- Feel that Discovery genuinely understands something about the organization.
- Want to continue improving the Organization Model.

If Discovery creates this feeling, the onboarding experience has succeeded.

---

# Future Evolution

Future releases may expand the Organization Page with:

- richer Organization visualization
- historical evolution
- organizational timeline
- confidence history
- learning history
- prediction accuracy
- organizational memory visualization

These enhancements should always reinforce the same core principle:

> Within the Organization Page experience, the Organization Model is the primary product representation.

Everything else is simply another way of interacting with it.
