# Discovery MVP Product Specification

**Status:** Canonical (Sprint 79)

---

# Purpose

This document defines the canonical MVP product experience for Discovery.

It specifies the first complete product executives will use.

Its purpose is **not** to expose every cognitive capability.

Its purpose is to make Discovery’s continuously evolving Organization Model useful, understandable, and valuable through one coherent executive experience.

The MVP should allow an executive to:

- begin developing an Organization Model,
- improve that model through lightweight stewardship,
- observe what Discovery currently understands,
- validate or challenge that understanding,
- use the model to support important decisions,
- test alternatives,
- track committed decisions,
- review outcomes,
- and improve future organizational judgment.

If another product workflow contradicts this document, this document is correct.

---

# Product Identity

Discovery's MVP is its first major application: an **Executive Operating System** centered on a continuously evolving **Organization Model** and built on the shared organizational intelligence platform.

The Organization Model represents Discovery’s current understanding of:

- how the organization works,
- what conditions shape performance,
- where important dependencies and constraints exist,
- what decisions deserve executive attention,
- how interventions may affect the organization,
- and what the organization has learned from prior decisions and outcomes.

Discovery is **not**:

- a dashboard,
- a chatbot,
- a document repository,
- a reporting platform,
- a project-management tool,
- or a business intelligence application.

Discovery helps executives and other organizational stewards:

- understand organizational reality,
- improve the Organization Model,
- validate or challenge Discovery’s understanding,
- evaluate strategic decisions,
- test alternatives,
- commit decisions,
- track execution,
- review outcomes,
- and continuously improve future judgment.

---

# Central Product Principle

> **Within the MVP, the Organization Model is the primary product representation.**

The broader product hierarchy is defined in `docs/Architecture/Canon/SHARED_ORGANIZATIONAL_INTELLIGENCE.md`.

Everything else in Discovery is a way of interacting with that model.

```text
Your Organization

↓

Observe and Improve the Model

↓

Decisions

↓

Act Using the Model

↓

Research

↓

Experiment Against the Model

↓

Ask

↓

Query and Challenge the Model
```

The Organization Model should never disappear into the background as hidden infrastructure.

Executives should continuously understand that Discovery is:

- learning,
- changing,
- becoming more coherent,
- and improving through their stewardship.

---

# User Role

The user is the **steward of the Organization Model**.

A steward may be:

- a CEO,
- another executive,
- a functional leader,
- a board member,
- an operator,
- or another authorized organizational participant.

The product should adapt the scope of the Organization Model to the user’s position and access.

Every important user interaction should do at least one of the following:

- improve the model,
- validate the model,
- challenge the model,
- query the model,
- experiment with the model,
- or act on the model.

---

# MVP Goal

The MVP must prove two connected ideas.

## Model Value

An executive should care about developing and improving the Organization Model within the first five minutes.

## Decision Value

An executive should be able to move from organizational uncertainty to an informed, committed strategic decision through one coherent workflow.

The first experience should create the realization:

> **Discovery understands something meaningful about my organization, and I can help that understanding improve.**

The continuing experience should create the realization:

> **This model helps me understand my organization and make better decisions.**

---

# Core Interaction Model

Discovery supports four primary ways of interacting with the Organization Model.

## Your Organization

**Observe and improve**

The user sees:

- what Discovery currently understands,
- how the model is developing,
- what changed,
- what remains uncertain,
- and what would improve its understanding.

---

## Decisions

**Act**

The user sees:

- recommended decisions,
- active decisions,
- decisions requiring attention,
- decisions due for review,
- completed decisions,
- and organizational learning from prior outcomes.

---

## Research

**Experiment**

The user can:

- investigate an important initiative,
- compare interventions,
- test assumptions,
- simulate alternatives,
- evaluate constraints,
- and optimize a potential decision against the Organization Model.

---

## Ask

**Query and challenge**

The user can ask:

- Why do you believe this?
- What evidence supports it?
- What changed?
- What remains uncertain?
- What information would improve confidence?
- Where might this understanding be wrong?
- What does this imply for a particular team, initiative, or objective?

The user can also:

- correct Discovery,
- add missing context,
- reject outdated assumptions,
- and challenge conclusions.

Ask is not a generic chatbot.

It is a direct interface to the Organization Model.

---

# Canonical Navigation

Primary navigation is intentionally minimal.

```text
Your Organization

Decisions

Research

Ask
```

These labels describe executive interactions rather than Discovery’s internal architecture.

Do not expose navigation organized around technical modules such as:

- Executive Brief,
- Decision Lab,
- Cognitive Objects,
- Operating Systems,
- Runtime,
- or Simulation Engine.

Settings, administration, integrations, and account controls remain secondary.

---

# Navigation Availability

Navigation may develop progressively as the Organization Model matures.

## Initial State

```text
Your Organization
```

## After Discovery Produces Actionable Understanding

```text
Your Organization

Decisions
```

## After the Model Can Support Exploration and Query

```text
Your Organization

Decisions

Research

Ask
```

Capabilities should be introduced when they become useful.

Discovery should not rely on a feature tour or a sequence of tooltips to explain navigation.

---

# Product Architecture

Discovery does not have a separate onboarding destination followed by a separate homepage.

The initial experience and mature experience exist on the same canonical page:

> **Your Organization**

The page changes as the Organization Model develops.

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

An Organization Model should continue to evolve throughout the customer relationship.

---

# Screen 1 — Your Organization

Your Organization is Discovery’s primary product experience.

It is:

- the first page a new user sees,
- the model-stewardship experience,
- the daily executive home,
- and the visible representation of Discovery’s evolving understanding.

It answers:

> **What does Discovery currently understand about my organization?**

and:

> **How can I make that understanding more useful?**

---

# Canonical Your Organization Layout

```text
Organization Visualization

Current Model State

Today's Story

What Changed

Next Stewardship Action
```

As the model matures, contextual links may lead into:

- Decisions,
- Research,
- or Ask.

The page should remain calm and focused.

It should not become a grid of equally weighted dashboard cards.

---

# Organization Visualization

The Organization Visualization represents the evolving coherence of Discovery’s understanding.

It does **not** represent:

- document volume,
- graph size,
- employee count,
- organizational hierarchy,
- or ingestion progress.

It represents the quality and stability of the Organization Model.

Relevant dimensions may eventually include:

- confidence,
- coherence,
- coverage,
- freshness,
- learning,
- and validated understanding.

---

## MVP Visualization

The MVP should intentionally underbuild the visualization.

It should support several clear visual states:

```text
Diffuse

↓

Emerging

↓

Developing

↓

Coherent

↓

Evolving
```

The visual should become:

- more organized,
- more stable,
- more legible,
- and more internally coherent

as Discovery develops stronger understanding.

It should not merely become larger or more complex.

The first implementation may use an abstract animated form with deterministic state changes.

A richer organism-like representation may be developed after customer validation.

---

# State 0 — Empty

## Purpose

Create curiosity and begin stewardship with minimal friction.

## Page State

- The Organization Visualization is diffuse.
- Discovery has little or no organization-specific understanding.
- Only Your Organization is visible in navigation.

## Copy

Headline:

> **Your organization is beginning to take shape.**

Supporting message:

> Discovery builds an evolving understanding of how your organization actually works. Every conversation, document, decision, and correction improves that understanding.

Primary action:

> **Begin Understanding**

## First Request

Discovery asks one concise question:

> **What is the most important initiative or objective your organization is currently working on?**

The user should be able to answer in one or two sentences.

Do not begin with:

- a long company questionnaire,
- a multi-step setup wizard,
- a feature tour,
- integration configuration,
- or a request to upload an entire data room.

---

# State 1 — Emerging

## Purpose

Establish the first organizational objective and earn the right to request evidence.

After the first response:

- Discovery creates the initial organization context.
- The visualization becomes slightly more coherent.
- The page acknowledges what has been learned.

Example:

> **I’ve begun identifying your organization’s current priorities.**

Discovery then requests one useful piece of evidence.

Suggested evidence may include:

- Board deck
- Strategic plan
- Financial report
- Initiative plan
- Leadership meeting notes

The request should remain minimal:

> **One supporting document will help me understand what is shaping this initiative.**

Only one evidence request should be primary.

Other options may remain secondary.

---

# State 2 — Developing

## Purpose

Deliver the first meaningful reward.

After evidence ingestion, Discovery runs the existing cognitive pipeline and surfaces exactly one important understanding.

## First Understanding

Example:

> **Critical delivery knowledge appears concentrated among a small number of senior leaders.**

Display:

- concise statement,
- confidence,
- why it matters,
- and optional supporting reasoning.

Then ask:

> **Does this feel accurate?**

Responses:

```text
Yes

Needs Refinement
```

This is the user’s first explicit model-stewardship interaction.

---

## Accepting an Understanding

When the user accepts:

- the understanding is validated,
- the Organization Model records that validation,
- the visualization becomes more coherent,
- and Discovery acknowledges the improvement.

Example:

> **My understanding of your organization just improved.**

Do not frame this as rating an AI response.

The user is validating the Organization Model.

---

## Challenging an Understanding

When the user selects Needs Refinement, ask:

> **What am I missing?**

Allow one concise correction.

Discovery should:

- preserve the original assertion,
- record the challenge,
- incorporate the correction,
- and explain that the model has been updated.

Example:

> **Thank you. I’ve adjusted my understanding to reflect that context.**

A challenge should improve trust, not appear as a failed interaction.

---

# State 3 — Active

## Purpose

Transition from initial stewardship into ongoing organizational understanding and decision support.

At this stage, the page contains:

```text
Organization Visualization

Today's Story

What Changed

Continue Improving
```

Decisions becomes available in navigation when Discovery has an actionable recommendation or decision opportunity.

---

## Today’s Story

Today’s Story is the primary executive narrative generated from the Organization Model.

It should contain exactly one dominant story.

Example:

> **Delivery quality remains dependent on founder-held knowledge, limiting the organization’s ability to scale consultant capacity.**

Supporting information:

- Confidence
- Why this matters
- What changed
- View Understanding
- Relevant decision opportunity, when available

Today’s Story should not compete with a separate collection of disconnected insights.

Supporting insights should appear as evidence beneath the story through progressive disclosure.

---

## What Changed

What Changed communicates how the Organization Model or organization has evolved.

Examples:

```text
Knowledge continuity improved

A new execution constraint emerged

Confidence increased

A prior assumption was corrected

A decision outcome changed the model
```

This gives users a reason to return.

It should feel closer to a meaningful change history than a generic activity feed.

---

## Continue Improving

Discovery requests one next stewardship action.

Examples:

- Add a board deck
- Upload leadership meeting notes
- Add an active initiative
- Connect NetSuite
- Correct an assumption
- Review an unresolved uncertainty

Discovery should explain why the information would be useful.

Example:

> **A recent financial report would help me determine whether the current execution constraint is affecting margin performance.**

Never ask for more information without communicating the expected value.

---

# State 4 — Evolving

## Purpose

Support continuous stewardship, decision-making, and organizational learning.

The page may surface whichever interaction is currently most useful:

- a new organizational story,
- a changed condition,
- an uncertainty that requires validation,
- a decision opportunity,
- a request for missing evidence,
- a learning generated from a completed decision,
- or a research opportunity.

The Organization Model should never appear finished or static.

The page should communicate:

> **Your organization has changed, and Discovery’s understanding has changed with it.**

---

# Stewardship Loop

The canonical stewardship loop is:

```text
Teach

↓

Discovery Learns

↓

Discovery Produces Value

↓

User Validates or Challenges

↓

Organization Model Improves

↓

Discovery Earns the Next Request
```

Discovery should alternate between asking and rewarding.

Correct rhythm:

```text
Teach me one thing

↓

I’ll show you something useful

↓

Validate or improve it

↓

I’ll become more useful

↓

Teach me one more thing
```

Avoid:

```text
Upload

Upload

Connect

Configure

Complete Setup
```

---

# Information Sources

The MVP may accept organizational context from:

- initiative descriptions,
- board decks,
- strategic plans,
- financial reports,
- operating plans,
- organizational charts,
- meeting transcripts,
- executive notes,
- decision records,
- and manual corrections.

Future integrations may include:

- NetSuite,
- accounting systems,
- CRM platforms,
- project-management systems,
- document repositories,
- Slack,
- and other organizational systems.

The first experience should not depend on integrations.

One user response and one document should be sufficient to demonstrate initial value.

---

# Screen 2 — Decisions

Decisions is the executive action layer of the Organization Model.

It consolidates:

- Discovery recommendations,
- executive-created decisions,
- committed decisions,
- decisions in progress,
- decisions requiring attention,
- decisions due for review,
- and completed decisions.

Recommended structure:

```text
Recommended

In Progress

Review Due

Completed
```

Discovery should not treat recommendations as a separate product surface disconnected from executive decisions.

A recommendation is a potential decision.

Once accepted or modified, it enters the same canonical decision lifecycle as an executive-created decision.

---

# Decision Workspace

Selecting a recommended or existing decision opens the Decision Workspace.

Canonical workflow:

```text
Current Understanding

↓

Decision Question

↓

Recommended Action

↓

Alternatives

↓

Simulation

↓

Trade-offs

↓

Commit Decision
```

---

## Current Understanding

Display:

- the relevant organizational story,
- the primary constraint,
- the organization-specific concept manifestation,
- confidence,
- and key uncertainty.

Detailed reasoning remains progressively disclosed.

---

## Decision Question

Frame the work as an executive decision.

Example:

> **Should we invest in structured knowledge transfer before expanding consultant capacity?**

Do not present recommendations merely as tasks or generic actions.

---

## Recommendation

Display:

- recommended decision,
- why now,
- expected organizational improvement,
- confidence,
- assumptions,
- risks,
- and unresolved uncertainty.

Discovery should present one clear recommended strategy while preserving alternatives.

---

## Simulation

Compare:

```text
Current Trajectory

Option A

Option B

Recommended Option
```

Each scenario may show:

- projected condition movement,
- expected organizational impact,
- risks,
- assumptions,
- constraints,
- confidence,
- and time horizon.

Simulation output should be concise enough for executive use and credible enough for board discussion.

---

## Trade-offs

Every recommendation should explain:

- What improves?
- What may worsen?
- What remains uncertain?
- What must be true for this to work?
- What happens if no action is taken?

Discovery should communicate uncertainty rather than manufacturing certainty.

---

## Commit Decision

Primary action:

```text
Commit Decision
```

Discovery records:

- decision,
- selected strategy,
- rationale,
- expected outcomes,
- success metrics,
- assumptions,
- owner,
- review date,
- supporting understanding,
- and relevant model ancestry.

A committed decision becomes part of the Organization Model’s institutional memory.

---

# Decision Detail

Every committed decision receives a persistent record.

Display:

- Status
- Owner
- Decision rationale
- Expected outcomes
- Success metrics
- Timeline
- Related initiatives
- Related understanding
- Related conditions
- Related concepts
- Assumptions
- Review date
- Current signals
- Learning history

Executives should understand:

- what was decided,
- why,
- what was expected,
- what has happened,
- and what Discovery has learned.

---

# Decision Review

When review becomes due, Discovery guides the executive through:

```text
Expected

↓

Actual

↓

Variance

↓

Explanation

↓

Learning
```

Capture:

- observed outcome,
- expected outcome,
- meaningful variance,
- causal explanation,
- changed assumptions,
- confidence adjustments,
- and model updates.

Review is not merely task completion.

It is the mechanism through which Discovery improves future judgment.

---

# Screen 3 — Research

Research is the exploratory interface to the Organization Model.

It supports questions such as:

- What happens if we hire five additional consultants?
- What if we remove an approval layer?
- What if revenue declines?
- What if we reorganize this function?
- What intervention produces the greatest expected improvement?
- Which constraints limit this initiative?
- What evidence would change the recommendation?

Research may support:

- initiative investigation,
- scenario generation,
- intervention comparison,
- constraint analysis,
- strategic optimization,
- and simulation.

Research should feel like structured executive investigation rather than an experimental AI playground.

---

# Screen 4 — Ask

Ask is the direct query and challenge interface to the Organization Model.

It should support concise executive questions such as:

- What changed this week?
- Why do you believe this?
- Show me the supporting evidence.
- What are you least certain about?
- What is the most important current constraint?
- What would improve your confidence?
- Which assumption is most fragile?
- Where might this analysis be wrong?
- What does this imply for a specific initiative?
- What should I investigate next?

Ask should also support correction:

- This is outdated.
- This assumption is wrong.
- This was intentional.
- That dependency no longer exists.
- This team has been reorganized.

The system should distinguish between:

- querying the model,
- challenging the model,
- and teaching the model.

---

# Learning

Every completed decision, correction, validation, and outcome should improve the Organization Model.

Executives should visibly experience:

```text
Decision

↓

Outcome

↓

Learning

↓

Organization Model Improved

↓

Future Judgment Improved
```

Learning is Discovery’s long-term competitive advantage.

The model becomes more valuable as it accumulates:

- validated organizational understanding,
- decision history,
- outcome history,
- confidence adjustments,
- and organization-specific causal knowledge.

---

# Executive UX Principles

## The Organization Model Is Always Present

The model should remain conceptually visible across the product.

Every major output should feel like it originates from the Organization Model.

Every meaningful action should visibly improve, test, or use the model.

---

## One Story

Every screen should reinforce one coherent executive narrative.

Avoid disconnected widgets and competing summaries.

---

## Progressive Disclosure

Show concise executive summaries first.

Allow expansion into:

- reasoning,
- evidence,
- assumptions,
- ancestry,
- and cognitive detail.

Executives should never be forced to consume the entire reasoning pipeline.

---

## Minimal Requests

Ask for one useful input at a time.

Every request should explain why the information matters.

---

## Immediate Value

The user should receive useful organizational understanding before Discovery asks for substantial additional effort.

---

## Stewardship, Not Setup

Users should feel they are improving their Organization Model.

They should not feel they are configuring software.

---

## Decision-Centric Action

Organizational understanding should naturally lead to executive action.

Discovery should not surface insights without helping the user determine what to do with them.

---

## Executive Trust

Discovery should explain:

- why it believes something,
- what supports the conclusion,
- what remains uncertain,
- how confident it is,
- and how the executive can improve or challenge the model.

Executives should never be expected to trust unexplained AI output.

---

## Honest Evolution

The visualization and model state should reflect actual learning, validation, and uncertainty.

Uploading a document alone should not automatically make the Organization Model appear healthier or more coherent.

The model should evolve because Discovery learned something meaningful.

---

# MVP Success Criteria

Within the first five minutes, a first-time executive can:

- Create or enter an organization.
- Describe one important initiative or objective.
- Provide one supporting document.
- Receive one meaningful organizational understanding.
- Validate or challenge that understanding.
- See the Organization Model visibly improve.
- Understand how to continue developing the model.
- See a relevant decision or next opportunity.

Within the complete MVP, the executive can:

- Observe the Organization Model.
- Read Today’s Story.
- Understand what changed.
- Improve the model.
- Review one recommended decision.
- Compare alternatives.
- Run a simulation.
- Commit a decision.
- Track the decision.
- Review the outcome.
- Observe Discovery learning.

All of this should occur without requiring the executive to understand Discovery’s internal cognitive architecture.

---

# Out of Scope

The MVP intentionally excludes:

- the final rich organism visualization,
- advanced visualization of the reasoning graph,
- external market intelligence,
- competitive intelligence,
- economic forecasting,
- additional Cognitive Operating Systems,
- decision portfolio optimization,
- multi-organization reasoning,
- complex enterprise administration,
- and broad workflow automation.

These may be developed after validating:

- model stewardship,
- initial trust,
- executive decision utility,
- and repeat engagement.

---

# Definition of MVP Success

Discovery succeeds when executives naturally develop the following loop:

1. Open Your Organization.
2. Observe what Discovery currently understands.
3. See what changed.
4. Improve, validate, or challenge the Organization Model.
5. Use the model to support a decision.
6. Return to observe outcomes and learning.
7. Trust Discovery more because every meaningful, validated contribution has the potential to improve the model.

At that point, Discovery is no longer another executive software application.

It has become the organization’s evolving system of understanding, judgment, and learning.
