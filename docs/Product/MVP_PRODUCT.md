# Discovery MVP Product

**Status:** Canonical  
**Phase:** Functional MVP & Product Validation

---

# Purpose

The purpose of this MVP is to expose Discovery's core capabilities through one coherent, highly functional executive workflow.

The MVP should demonstrate that Discovery can:

- maintain a living Operating Model of an organization,
- surface deeper executive insights than a traditional BI dashboard,
- evaluate active initiatives against current organizational reality,
- accept important executive decisions,
- suggest decisions and initiatives when supported by organizational evidence,
- compare alternative strategies,
- recommend a course of action,
- continuously learn from new organizational information,
- produce a board-ready executive brief.

The MVP is **not** intended to expose every capability within Discovery's Cognitive Operating System.

Its purpose is to demonstrate Discovery's unique value through one complete executive workflow.

---

# Product Philosophy

Discovery is an **Executive Operating System**.

Its purpose is to continuously improve executive judgment.

Discovery does not replace executive decision making.

Discovery helps executives:

- understand organizational reality,
- identify meaningful opportunities,
- evaluate important decisions,
- optimize organizational outcomes,
- continuously learn from organizational change.

---

# Executive Workflows

Discovery supports two primary workflows.

## Daily Operating Mode

Typical usage: approximately 20 minutes.

The executive should be able to:

1. Review current initiatives.
2. Review Discovery's suggested decisions.
3. Continue evaluating personal executive decisions.
4. Review a small number of meaningful insights.
5. Improve the Operating Model with additional information.
6. Observe how the Operating Model changes.

The daily experience should feel calm, focused, and trustworthy.

Discovery should never overwhelm executives with excessive discoveries, alerts, or notifications.

---

## Strategic Decision Mode

Used before:

- board meetings,
- strategic planning,
- acquisitions,
- hiring decisions,
- reorganizations,
- significant investments,
- major organizational commitments.

The executive should be able to:

1. Create a new decision.
2. Open a Discovery-suggested decision.
3. Define objectives.
4. Define constraints.
5. Compare strategies.
6. Run organizational simulations.
7. Review Discovery's recommendation.
8. Commit the selected decision as an initiative.
9. Produce a board-ready executive brief.

---

# Core Product Loop

```text
Improve Operating Model

↓

Understand Organization

↓

Surface Executive Insights

↓

Evaluate Decisions

↓

Compare Strategies

↓

Recommend Action

↓

Commit Initiative

↓

Track Against Reality

↓

Learn

↓

Improve Operating Model
```

This loop represents Discovery's complete executive flywheel.

---

# MVP Navigation

The MVP contains four primary product surfaces.

```text
Today

Operating Model

Decision Lab

Executive Brief
```

This intentionally minimizes navigation while exposing Discovery's complete value proposition.

---

# Today

## Purpose

The Today experience helps executives remain synchronized with the evolving organization.

It should answer:

- How is my business doing?
- How are my initiatives performing?
- What deserves executive attention?
- What has Discovery learned?
- Does Discovery need additional information?
- Which decisions should I evaluate today?

---

## Section 1 — Operating Model

Shows Discovery's current organizational understanding.

Display:

- Organizational State
- Primary Executive Constraint
- Overall Confidence
- Freshness
- Recent Meaningful Change
- Executive Assessment

Primary action:

```
View Operating Model →
```

---

## Section 2 — Executive Work

Executive Work is the center of the homepage.

It contains three groups.

### Discovery Suggested

Decisions or initiatives Discovery believes deserve executive evaluation.

Each card includes:

- title,
- why it matters,
- confidence,
- urgency,
- Evaluate button.

Suggested work should remain rare.

Discovery should only surface recommendations that could materially improve executive judgment.

---

### My Decisions

Executive-created decisions.

Examples:

- Hire VP Sales
- Acquire Company X
- Expand into Europe
- Replace ERP

Possible states:

- Draft
- Under Evaluation
- Recommendation Ready
- Decided

Primary action:

```
Continue →
```

---

### Active Initiatives

Committed executive decisions.

Each initiative displays:

- health,
- trend,
- Operating Model assessment,
- primary organizational constraint,
- recommended executive attention.

Initiatives are continuously evaluated as the Operating Model evolves.

---

## Section 3 — Key Insights

Discovery surfaces only a small number of meaningful insights.

Maximum:

- three visible insights.

Each insight explains:

- what Discovery believes,
- why it matters,
- confidence,
- why Discovery changed its understanding.

Primary action:

```
Read Analysis →
```

Insights should explain organizational mechanisms and relationships rather than merely reporting metric movement.

---

## Section 4 — Improve the Operating Model

Discovery recommends the highest-value missing information.

Examples:

- Upload latest board deck.
- Upload leadership update.
- Upload financial package.
- Connect CRM.
- Refresh strategic plan.

Discovery should explain why each input improves executive judgment.

Use language such as:

- Improve the Operating Model
- Strengthen Understanding
- Add Organizational Evidence

Avoid presenting uploads as routine software maintenance.

---

# Operating Model

## Purpose

Explain Discovery's current understanding of the organization.

Display:

- Organizational State
- Primary Constraint
- Organizational Conditions
- Executive Assessment
- Confidence
- Meaningful Changes
- Supporting Evidence
- Remaining Uncertainty

Executives should always be able to answer:

> Why does Discovery believe this?

and

> Why has Discovery changed its understanding?

Default to concise summaries.

Use progressive disclosure for deeper reasoning.

---

# Decision Lab

## Purpose

Evaluate any executive decision.

Decision origin does not matter.

Decisions may originate from:

- Discovery,
- Executive,
- Board,
- Investor,
- Customer,
- Market,
- Existing Initiative,
- Other.

Once inside the Decision Lab, every decision follows the same evaluation workflow.

---

## Workflow

```text
Decision

↓

Objectives

↓

Constraints

↓

Strategies

↓

Simulation

↓

Comparison

↓

Recommendation

↓

Executive Decision

↓

Commit Initiative
```

---

## Required Capabilities

The Decision Lab must allow executives to:

- create decisions,
- edit decisions,
- define objectives,
- define constraints,
- review assumptions,
- compare multiple strategies,
- review simulations,
- inspect trade-offs,
- understand recommendation confidence,
- commit decisions as initiatives.

All executive reasoning must originate from canonical engine outputs.

The UI must never recreate cognitive reasoning.

---

# Executive Brief

## Purpose

Produce a concise executive artifact suitable for leadership meetings.

Sections:

- Decision Context
- Current Organizational Understanding
- Primary Constraint
- Alternatives Considered
- Recommended Strategy
- Rationale
- Risks
- Trade-offs
- Confidence
- Assumptions
- Recommended Next Steps

The MVP contains one canonical brief format.

---

# Product Principles

## Operating Model First

The Operating Model is Discovery's organizational brain.

Everything else derives from it.

---

## Executive Work First

Executives primarily open Discovery to:

- review initiatives,
- continue important decisions,
- evaluate Discovery's suggestions.

Executive Work is therefore the primary homepage experience.

---

## Insights Before Discoveries

Insights are common.

Discoveries are rare.

Discovery should not manufacture activity simply to appear useful.

---

## Decisions Can Originate Anywhere

Discovery-generated decisions and executive-generated decisions follow the exact same lifecycle.

The quality of evaluation should never depend upon where a decision originated.

---

## Initiatives Are Living Commitments

Once committed, initiatives remain continuously evaluated against the evolving Operating Model.

Discovery should continuously reassess initiative health as organizational understanding improves.

---

## Progressive Disclosure

Default experience:

Executive Summary.

Detailed reasoning should appear only when requested.

---

## Minimize Reading

Every component should answer one executive question.

Avoid dense dashboards and excessive narrative.

---

## Functional Before Beautiful

The MVP prioritizes:

- complete workflows,
- real engine outputs,
- executive clarity,
- functional navigation,
- useful recommendations.

Visual polish follows customer validation.

---

## Stewardship

Discovery should encourage executives to strengthen the Operating Model.

Executives should feel responsible for maintaining an accurate representation of their organization because better understanding produces better judgment.

---

# MVP Data Policy

## Use Canonical Engine Data

Whenever possible, UI components should consume canonical Runtime and Executive Projection outputs.

---

## Expand Projection Only When Necessary

Only expose additional Runtime information when:

- the engine already owns the information,
- the workflow genuinely requires it,
- the UI would otherwise recreate reasoning.

---

## Temporary Fixtures

Temporary fixtures may be used for:

- My Decisions
- Active Initiatives
- Operating Model improvement requests

Fixtures must remain centralized and easily replaceable.

---

# Out of Scope

The MVP intentionally excludes:

- customizable dashboards,
- advanced portfolio management,
- collaboration,
- comments,
- notifications,
- complex settings,
- chat-first workflows,
- extensive integrations,
- multiple report templates,
- advanced personalization,
- gamification,
- mobile-first optimization.

These features should be driven by customer feedback rather than prediction.

---

# MVP Success Criteria

The MVP succeeds when an executive can complete the following workflow:

```text
Open Discovery

↓

Understand Current Organization

↓

Review Initiative Health

↓

Review Discovery Suggestions

↓

Continue Personal Decisions

↓

Read One Insight

↓

Improve Operating Model

↓

Observe Organizational Change

↓

Evaluate Decision

↓

Compare Strategies

↓

Accept Recommendation

↓

Commit Initiative

↓

Generate Executive Brief
```

When an executive can naturally complete this workflow without explanation, Discovery is ready for customer validation.