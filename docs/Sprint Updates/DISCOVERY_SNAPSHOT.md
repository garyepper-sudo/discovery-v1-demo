# Discovery Snapshot (Sprint Startup)

This document is the **minimum canonical context** required to begin a
new Discovery sprint.

------------------------------------------------------------------------

# Discovery Identity

Discovery is an **Organizational Decision Intelligence Platform**.

Its purpose is to:

-   Understand organizations
-   Explain organizational behavior
-   Predict likely futures
-   Simulate executive interventions
-   Compare alternative futures
-   Recommend executive action
-   Continuously learn from outcomes

Discovery is **not** a dashboard or chatbot.

------------------------------------------------------------------------

# Current Architecture

The engine architecture is considered **stable**.

Do not add new architectural layers unless an existing canonical
producer cannot be extended.

Prefer improving reasoning quality over expanding architecture.

------------------------------------------------------------------------

# Canonical Pipeline

``` text
Evidence
↓
Observations
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
Predictions
↓
Prediction Reflection
↓
Executive Assessment
↓
Organizational Understanding
```

Decision Intelligence:

``` text
Executive Decision
↓
Intervention Options
↓
Selected Intervention
↓
Intervention Mapping
↓
Causal Propagation
↓
Influence Aggregation
↓
Condition Evolution
↓
Future Organizational State
↓
Canonical Prediction Engine
↓
Prediction Reflection
↓
Executive Assessment
↓
Organizational Understanding
↓
Simulation Scenario
↓
Scenario Comparison
↓
Executive Recommendation
↓
Executive Projection
↓
Executive Experience
```

------------------------------------------------------------------------

# Canonical Producers

-   Organizational Understanding
-   Organizational Prediction
-   Prediction Reflection
-   Organizational State Synthesis
-   Organizational Simulation
-   Condition Evolution
-   Simulation Scenario
-   Scenario Comparison
-   Executive Scenario Orchestration

Never duplicate reasoning already provided by these producers.

------------------------------------------------------------------------

# Current Status

Completed:

-   Canonical organizational simulation
-   Canonical condition evolution
-   Canonical organizational state synthesis
-   Canonical prediction regeneration
-   Simulation scenario builder
-   Scenario comparison engine
-   Executive scenario orchestrator
-   Executive projection
-   Runtime persistence

Architecture is stable.

------------------------------------------------------------------------

# Next Sprint

Primary objective:

**Executive Decision Experience**

Tasks:

1.  Wire `runExecutiveScenario()` into the API.
2.  Extend Executive Projection with decision scenarios.
3.  Build Executive Decision Workspace.
4.  Validate multiple intervention scenarios.
5.  Improve recommendation quality.

------------------------------------------------------------------------

# Development Rules

Before adding a capability ask:

1.  Which Operating System owns it?
2.  Which capability owns it?
3.  Which cognitive object does it produce?
4.  Is there already a canonical producer?
5.  Does Runtime persist it?
6.  Does Executive Projection expose it?
7.  Is it benchmarked?

Always extend canonical producers first.

------------------------------------------------------------------------

# Sprint Startup Checklist

Run:

``` bash
npm run sprint:start
npm run validate
npm run sprint:docs
npm run cognition:validate
```

Paste the outputs into a new chat along with this snapshot.

That should provide enough context to continue development without
relying on historical conversation context.
