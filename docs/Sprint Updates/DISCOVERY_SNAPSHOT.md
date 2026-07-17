# Discovery Snapshot (Sprint Startup)

This document is the **minimum canonical context** required to begin a new Discovery sprint.

Read this document before making architectural, product, UX, or implementation decisions.

---

# Discovery Identity

Discovery is an **Adaptive Executive Cognitive Operating System**.

Its purpose is to continuously improve the quality of executive judgment.

Discovery does not replace executive decision-making.

Discovery improves it through structured organizational cognition, explicit executive reasoning, optimization, simulation, and accumulated executive experience.

Discovery helps executive teams:

* understand organizational reality,
* identify the highest-leverage executive objective,
* understand why organizational conditions exist,
* evaluate alternative interventions,
* optimize recommendations under real constraints,
* simulate organizational futures,
* understand tradeoffs and uncertainty,
* communicate executive reasoning,
* learn from completed executive decisions,
* retain organizational and executive memory,
* and continuously improve future recommendations.

Discovery is **not**:

* a dashboard,
* a chatbot,
* a document repository,
* a reporting platform.

Discovery organizes itself around **Executive Decisions**.

---

# Current Product Focus

Discovery has entered **Executive Simulation, Executive Experience, and Product Validation**.

The Cognitive Operating System is architecturally complete through **Executive Optimization**.

The following executive reasoning systems are now considered stable:

* Executive Assessment
* Executive Recommendation
* Executive Optimization

Current development focuses on:

* completing Executive Simulation,
* exposing canonical cognition through the Executive Experience,
* improving reasoning quality through benchmarks,
* improving executive explanation and trust,
* validating runtime and architectural integrity,
* and validating the complete executive decision workflow with real users.

Current MVP:

```text
Question

↓

Current Understanding

↓

Executive Assessment

↓

Executive Explanation

↓

Executive Recommendation

↓

Challenge

↓

Executive Optimization

↓

Optimized Executive Recommendation

↓

Executive Simulation

↓

Executive Decision

↓

Implementation

↓

Outcome

↓

Reflection

↓

Learning

↓

Memory

↓

Better Recommendation
```

Everything else is secondary until this workflow has been validated with real executive users.

---

# Current Architecture

Discovery is organized as cooperating **Cognitive Operating Systems**.

Current Operating Systems:

* Perception
* Organizational Understanding
* Organizational Memory
* Organizational Learning
* Organizational Epistemics
* Organizational Prediction
* Adaptive Learning
* Executive Assessment
* Executive Recommendation
* Executive Optimization
* Executive Simulation
* Executive Communication
* Executive Decision Learning

Every Operating System owns a distinct cognitive responsibility.

Consumers reuse canonical cognitive objects rather than recreating reasoning.

Do not introduce a new Operating System unless an existing responsibility cannot reasonably be extended.

Future work should strengthen, integrate, validate, and expose existing cognition rather than introduce parallel reasoning.

---

# Canonical Executive Responsibility Boundaries

```text
Assessment
Determines what is happening.

Recommendation
Determines what leadership should attempt to accomplish.

Optimization
Determines the strongest feasible version of the recommendation.

Simulation
Determines what is likely to happen if the optimized recommendation is executed.

Executive Decision
Determines what leadership chooses.

Decision Learning
Determines what Discovery should learn from the observed outcome.
```

These responsibility boundaries are canonical.

No downstream Operating System should recreate cognition owned by an upstream Operating System.

---

# Canonical Cognitive Pipeline

## Perception

```text
Evidence

↓

Observations

↓

Signals

↓

Contradictions

↓

Organizational Phenomena
```

---

## Organizational Understanding

```text
Organizational Phenomena

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

Organizational Understanding
```

---

## Executive Assessment

```text
Organizational State

↓

Primary Judgment

↓

Dominant Causal Chain

↓

Executive Focus

↓

Executive Risks

↓

Executive Assessment
```

Executive Assessment determines:

> **What is happening, why it matters, and where executive attention belongs.**

Executive Assessment does not recommend an intervention.

---

## Executive Recommendation

```text
Executive Assessment

↓

Recommended Executive Objective

↓

Recommended Executive Strategy

↓

Recommended Executive Intervention

↓

Executive Recommendation
```

Executive Recommendation determines:

> **What should leadership attempt to accomplish?**

Recommendation does not:

* optimize the intervention,
* simulate its effects,
* select the final executive decision,
* or produce a detailed implementation plan.

---

## Executive Optimization

```text
Executive Recommendation

↓

Executive Optimization Problem

↓

Optimization Options

↓

Constraint Evaluation

↓

Option Scoring

↓

Option Ranking

↓

Optimized Executive Recommendation
```

Executive Optimization determines:

> **What is the strongest feasible version of the recommendation under current constraints, preferences, confidence, and uncertainty?**

Optimization does not:

* replace the original recommendation,
* record the executive decision,
* execute the intervention,
* or simulate organizational outcomes.

---

## Executive Simulation

Target canonical flow:

```text
Optimized Executive Recommendation

↓

Simulation Scenario

↓

Organizational Intervention

↓

Organizational Causal Model

↓

Influence Propagation

↓

Projected Organizational Conditions

↓

Projected Organizational State

↓

Projected Beliefs

↓

Projected Predictions

↓

Simulation Evaluation

↓

Executive Simulation
```

Executive Simulation determines:

> **What is likely to happen if leadership executes the optimized recommendation?**

Simulation must not recreate Assessment, Recommendation, or Optimization cognition.

---

## Organizational Learning

```text
Organizational Understanding

↓

Belief Evolution

↓

Theory Evolution

↓

Prediction Evaluation

↓

Learning Events

↓

Organizational Learning Profile
```

---

## Organizational Epistemics

```text
Evidence

+

Organizational Learning

+

Prediction Evaluation

↓

Organizational Uncertainty

↓

Investigation Opportunity Refinement
```

---

## Executive Decision Learning

```text
Executive Decision

↓

Simulation

↓

Observed Outcome

↓

Executive Decision Outcome

↓

Executive Decision Reflection

↓

Executive Decision Learning

↓

Executive Decision Memory

↓

Decision Playbook

↓

Future Executive Decisions
```

---

## Executive Communication

```text
Executive Assessment

+

Executive Recommendation

+

Optimized Executive Recommendation

+

Executive Simulation

+

Organizational Uncertainty

↓

Executive Explanation

↓

Executive Projection

↓

Executive Narrative

↓

Executive Workspace
```

Executive Communication does not perform independent cognition.

It communicates canonical cognition.

---

# Canonical Runtime Objects

The canonical Organization Runtime now persists:

```text
runtime.memory.organizationalState

runtime.memory.executiveAssessment

runtime.memory.executiveRecommendation

runtime.memory.optimizedExecutiveRecommendation
```

These objects form the canonical downstream executive reasoning contract.

Executive Simulation should consume:

```text
runtime.memory.optimizedExecutiveRecommendation
```

rather than reconstructing recommendation or optimization cognition.

---

# Canonical Producers

Current canonical producers include:

* Organizational Understanding
* Organizational Conditions
* Organizational State
* Organizational Learning Profile
* Organizational Prediction
* Prediction Reflection
* Organizational Uncertainty
* Investigation Opportunity Refinement
* Primary Judgment
* Dominant Causal Chain
* Executive Focus
* Executive Risks
* Executive Assessment
* Recommended Executive Objective
* Recommended Executive Strategy
* Recommended Executive Intervention
* Executive Recommendation
* Executive Optimization Problem
* Optimization Option Generation
* Constraint Evaluation
* Option Scoring
* Option Ranking
* Optimized Executive Recommendation
* Organizational Causal Model
* Organizational Intervention
* Organizational Simulation
* Scenario Comparison
* Executive Explanation
* Executive Projection
* Executive Narrative
* Executive Decision Outcome
* Executive Decision Reflection
* Executive Decision Learning
* Executive Decision Memory
* Decision Playbook

Never duplicate reasoning already produced by these canonical capabilities.

Reasoning belongs in producers.

Runtime stores canonical cognition.

Projection transports cognition.

Narrative communicates cognition.

The UI presents cognition.

---

# Product Principles

Every feature should improve at least one of:

* Organizational Understanding
* Executive Judgment
* Decision Quality
* Executive Confidence
* Organizational Learning
* Executive Trust

Discovery should:

* surface understanding before recommendations,
* distinguish assessment from recommendation,
* preserve the original recommendation through optimization,
* explain every recommendation,
* explain every optimized recommendation,
* expose uncertainty,
* expose constraints,
* expose tradeoffs,
* identify missing evidence,
* recommend the highest-value investigations,
* simulate likely organizational consequences,
* learn from completed decisions,
* preserve executive experience,
* and continuously improve future recommendations.

Executives own decisions.

Discovery improves judgment.

---

# Current Status

## Completed and Validated

* Canonical Organizational Understanding
* Canonical Organizational Learning
* Canonical Organizational Epistemics
* Canonical Organizational Prediction
* Canonical Organizational Conditions
* Canonical Organizational State
* Executive Assessment Operating System
* Primary Judgment
* Dominant Causal Chain
* Executive Focus
* Executive Risks
* Executive Recommendation Operating System
* Recommended Executive Objective
* Recommended Executive Strategy
* Recommended Executive Intervention
* Executive Recommendation Orchestration
* Executive Recommendation Runtime Persistence
* Executive Optimization Operating System
* Executive Optimization Problem Definition
* Optimization Option Generation
* Constraint Evaluation
* Transparent Option Scoring
* Deterministic Option Ranking
* Optimized Executive Recommendation
* Optimized Executive Recommendation Runtime Contract
* Organizational Causal Model
* Existing Organizational Simulation
* Executive Explanation
* Executive Projection
* Executive Narrative
* Executive Decision Outcome
* Executive Decision Reflection
* Executive Decision Learning
* Executive Decision Memory
* Decision Playbook
* Stress Testing Framework
* Runtime Persistence
* Longitudinal Learning
* High-Volume Northstar Validation
* Cognitive Trace Validation
* Cognitive Layer Validation

---

# Validation Status

Current benchmark baseline:

```text
Executive Ground Truth .............. 84 / 100

Executive Explanation Ground Truth .. 71.33 / 100

Legacy Object-Level Ground Truth .... 54.22 / 100
```

The **84 / 100 Executive Ground Truth benchmark** is the primary measure of Executive Assessment quality.

Current validation status:

* TypeScript compilation: Passing
* Capability Registry Health: 100%
* Executive Assessment Benchmarks: Passing
* Executive Recommendation Benchmarks: Passing
* Northstar Executive Recommendation: Passing
* Recommendation Runtime Persistence: Passing
* Executive Optimization Problem: Passing
* Optimization Option Generation: Passing
* Constraint Evaluation: Passing
* Option Scoring: Passing
* Option Ranking: Passing
* Optimized Executive Recommendation: Passing
* High-Volume Northstar: Passing
* Cognitive Trace: Operational
* Cognitive Layer Validation: Passing

---

# Current Northstar Executive Reasoning

## Executive Assessment

```text
Primary constraint
Execution Capacity
```

## Executive Recommendation

```text
Objective
Increase Execution Capacity.

Strategy
Reduce competing work.
Clarify decision rights.
Strengthen cross-functional coordination.

Intervention
Reduce active work in progress.
```

## Executive Optimization Options

```text
Focus Reset

Sequenced Governance

Controlled Pilot
```

## Constraint Result

```text
Focus Reset
Not feasible under current constraints.

Sequenced Governance
Feasible with binding constraints.

Controlled Pilot
Feasible with the strongest current constraint profile.
```

## Current Ranking

```text
1. Controlled Pilot
2. Sequenced Governance
3. Focus Reset
```

## Preferred Optimized Profile

```text
Controlled Pilot
```

The preferred option trades some speed and immediate expected value for:

* stronger feasibility,
* lower implementation risk,
* greater reversibility,
* bounded organizational disruption,
* and better evidence generation.

---

# Architecture Health

**Capability Registry Health: 100%**

Current architecture health:

* Zero duplicate capability ownership
* Zero missing canonical producers
* Zero missing runtime destinations
* Zero missing consumers
* Explicit producer → consumer relationships
* Assessment ancestry preserved
* Recommendation ancestry preserved
* Optimization ancestry preserved
* Runtime persistence validated
* Recommendation and Optimization boundaries validated
* Zero TypeScript errors

---

# Current Development Phase

The primary bottleneck is no longer Assessment, Recommendation, or Optimization cognition.

The primary bottleneck is:

> **Executive Simulation and the Adaptive Executive Experience**

Current priorities:

* Executive Simulation Operating System
* Optimized Recommendation → Simulation translation
* Canonical Simulation Scenario
* Optimized Recommendation → Organizational Intervention
* Projected Organizational Conditions
* Projected Organizational State
* Projected Beliefs
* Projected Predictions
* Simulation Evaluation
* Scenario Comparison
* Executive Workspace
* Executive Explanation
* Executive Narrative
* Recommendation and Optimization Explainability
* Constraint and Tradeoff Communication
* Board-ready Executive Reports
* Executive Decision Flywheel
* Customer Validation

Future work should expose, integrate, test, and reuse existing cognition rather than introduce duplicate reasoning.

---

# Next Sprint

## Primary Objective

**Complete the Executive Simulation Operating System**

Tasks:

1. Validate Optimized Executive Recommendation runtime persistence.
2. Make Simulation consume `runtime.memory.optimizedExecutiveRecommendation`.
3. Translate the preferred optimized plan into a canonical Simulation Scenario.
4. Translate the Simulation Scenario into a canonical Organizational Intervention.
5. Remove deterministic test interventions from the canonical executive simulation path.
6. Model optimized scope, sequence, timing, intensity, and decision rights.
7. Produce projected Organizational Conditions.
8. Produce a projected Organizational State.
9. Produce projected Organizational Beliefs.
10. Produce projected Organizational Predictions.
11. Evaluate the projected future.
12. Preserve complete ancestry from Assessment through Simulation.
13. Benchmark the complete Recommendation → Optimization → Simulation pipeline.
14. Continue behavioral stress testing.
15. Improve Executive Ground Truth beyond **84 / 100** where benchmark evidence supports refinement.

Do not introduce additional reasoning layers unless Simulation validation demonstrates a genuine cognitive gap.

---

# Current Risks

Current risks include:

* Executive Simulation is not yet a complete first-class Operating System.
* Existing simulation may still rely on deterministic test interventions.
* Simulation may not yet consume the canonical Optimized Executive Recommendation.
* Simulation must preserve Recommendation and Optimization ancestry.
* Simulation confidence and uncertainty require explicit calibration.
* Executive Experience exposes only part of Discovery's canonical cognition.
* Executive Explanation should become the primary communication layer.
* Executive Narrative migration remains incomplete.
* Executive Ground Truth remains at **84 / 100**.
* Customer validation has not yet begun.
* Product-market fit remains unvalidated.

---

# Working Principle

Before implementing anything, ask:

1. Does this improve executive understanding?
2. Does this improve executive judgment?
3. Does this improve decision quality?
4. Does this improve future recommendations?
5. Does this improve reasoning correctness?
6. Does this improve benchmark performance?
7. Does this strengthen executive trust?
8. Which Operating System owns it?
9. Which capability owns it?
10. Does a canonical producer already exist?
11. Can an existing producer be extended?
12. Does it preserve upstream cognitive ancestry?
13. Does it improve organizational learning?
14. Can it be objectively validated?
15. Does it duplicate Assessment, Recommendation, or Optimization cognition?

If an existing canonical producer can be extended, extend it.

Do not create parallel cognition.

---

> **Product before implementation.**
>
> **Architecture serves the executive experience.**
>
> **Reasoning belongs in canonical producers.**
>
> **Runtime stores canonical cognition.**
>
> **Projection transports canonical cognition.**
>
> **Narrative communicates canonical cognition.**
>
> **Presentation never recreates reasoning.**
>
> **Assessment determines what is happening.**
>
> **Recommendation determines what should be done.**
>
> **Optimization determines the strongest feasible version.**
>
> **Simulation determines what is likely to happen.**
>
> **The executive determines what is chosen.**
>
> **Decision Learning determines what Discovery should learn.**
>
> **Every recommendation should explain itself.**
>
> **Every optimized recommendation should expose constraints and tradeoffs.**
>
> **Every uncertainty should recommend its highest-value validation.**
>
> **Stress-test cognition before exposing it to executives.**
>
> **Benchmark reasoning before expanding capability.**
>
> **The Executive Decision is the canonical product object.**
>
> **The Executive Decision Flywheel is the canonical product workflow.**
>
> **Every completed decision should strengthen the next recommendation.**
>
> **Trust is Discovery's most valuable product feature.**
>
> **Reasoning quality is measured—not assumed.**
>
> **Validation drives architecture evolution.**

---

# Sprint Startup Checklist

Run:

```bash
npm run sprint:start
npm run validate
npm run sprint:docs
npm run cognition:validate
npm run architecture:state
npm run discovery:brief
```

Paste the outputs into a new chat together with this snapshot.

This provides the complete canonical architectural state, cognitive state, product state, benchmark state, and Executive Cognitive Operating System context required to continue Discovery without relying on previous conversation history.
