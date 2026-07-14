# Executive Decision Operating System

**Status:** Proposed

---

# Purpose

The Executive Decision Operating System defines Discovery’s canonical process for transforming an executive objective into a ranked, explainable, and recommended organizational intervention.

Its purpose is to coordinate existing Decision Intelligence, Simulation, Prediction, Executive Assessment, and Executive Understanding capabilities without recreating their reasoning.

The Executive Decision Operating System answers:

> Given an executive objective, which intervention should leadership choose, why, and what future organizational state is expected to result?

---

# Operating Principle

The Executive Decision Operating System does not introduce an independent reasoning model.

It composes existing canonical producers.

Each stage must remain:

- independently inspectable,
- independently benchmarkable,
- deterministic when inputs are fixed,
- explainable,
- reusable outside the final orchestration layer,
- and non-mutating until leadership explicitly accepts an intervention.

The system must not select an intervention before evaluating all viable options through the same canonical pipeline.

---

# Canonical Pipeline

```text
Executive Objective
↓
Executive Decision Definition
↓
Intervention Option Generation
↓
Intervention Option Normalization
↓
Intervention Evaluation
↓
Scenario Execution
↓
Scenario Projection
↓
Cross-Scenario Comparison
↓
Decision Ranking
↓
Executive Recommendation
```

---

# Current Architecture

Discovery already possesses the following parts of this pipeline.

---

# Executive Decision Definition

## Canonical Object

```text
ExecutiveDecision
```

## Current Responsibilities

- represent the executive objective,
- define success metrics,
- preserve decision constraints,
- define the decision time horizon,
- define allowed intervention types,
- record assumptions,
- identify target organizational conditions,
- identify open questions,
- and preserve decision confidence.

The Executive Decision object establishes the executive intent against which all intervention options should ultimately be evaluated.

---

# Intervention Option Generation

## Canonical Producer

```text
engine/v3/reasoning/generateInterventionOptions.ts
```

## Canonical Object

```text
InterventionOption
```

## Current Responsibilities

- generate candidate interventions,
- connect options to target conditions,
- preserve executive constraints,
- identify expected mechanisms,
- identify risks,
- identify missing evidence,
- preserve assumptions,
- and assign option confidence.

Intervention Option Generation proposes possible leadership actions.

It does not evaluate simulated organizational futures and must not determine the final recommendation.

---

# Intervention Option Normalization

## Canonical Producer

```text
engine/v3/reasoning/convertInterventionOptionToIntervention.ts
```

## Canonical Object

```text
OrganizationalIntervention
```

## Current Responsibilities

- convert a generated option into the canonical simulation object,
- preserve intervention identity,
- preserve intervention type,
- preserve scope,
- preserve time horizon,
- preserve target conditions,
- preserve assumptions,
- preserve expected mechanisms,
- preserve confidence,
- and ensure every scenario consumes the same intervention format.

This stage creates the stable bridge between generated Decision Intelligence options and Organizational Simulation.

---

# Intervention Evaluation

## Canonical Producer

```text
engine/v3/reasoning/evaluateInterventionOption.ts
```

## Canonical Output

```text
EvaluatedInterventionOption
```

## Current Responsibilities

- convert an intervention option into a canonical intervention,
- map the intervention to direct causal changes,
- propagate direct organizational effects,
- propagate indirect organizational effects,
- aggregate organizational influence safely,
- preserve causal explanations,
- and return one evaluated intervention option.

Intervention Evaluation does not:

- generate options,
- compare options,
- rank outcomes,
- execute full future-state cognition,
- or synthesize the final executive recommendation.

---

# Scenario Context

## Canonical Producer

```text
engine/v3/scenarios/buildExecutiveDecisionContext.ts
```

## Canonical Output

```text
ExecutiveDecisionContext
```

## Current Responsibilities

- adapt the persisted Organization Runtime into scenario inputs,
- preserve the current Executive Assessment,
- preserve the current Organizational State,
- preserve current organizational conditions,
- preserve current organizational predictions,
- preserve the causal model,
- preserve organizational judgments,
- preserve organizational mechanisms,
- preserve concept candidates,
- preserve conceptual understanding,
- preserve organizational beliefs,
- preserve investigation opportunities,
- preserve theories,
- preserve the organizational learning profile,
- and prevent API or UI layers from depending on runtime storage details.

The Scenario Context is a non-reasoning adapter.

It must not create new cognition or mutate the runtime.

---

# Scenario Execution

## Canonical Producer

```text
engine/v3/scenarios/runExecutiveScenario.ts
```

## Canonical Output

```text
ExecutiveScenarioResult
```

## Current Responsibilities

- apply one canonical intervention,
- simulate the organizational future,
- synthesize the projected Organizational State,
- regenerate Prediction Reflection,
- regenerate Executive Assessment,
- regenerate Executive Understanding candidates,
- compare current and projected cognition,
- and return one complete executive scenario result.

Scenario Execution is the canonical one-option orchestrator.

Multi-option orchestration must call this producer rather than recreate its logic.

---

# Scenario Projection

## Canonical Producer

```text
components/executive-v2/projection/buildExecutiveScenarioProjection.ts
```

## Canonical Output

```text
ExecutiveScenarioProjection
```

## Current Responsibilities

- convert scenario cognition into a stable executive-facing contract,
- expose the intervention,
- expose the projected organizational future,
- expose regenerated Prediction Reflection,
- expose regenerated Executive Assessment,
- expose regenerated Executive Understanding,
- expose current-versus-projected comparison,
- and prevent presentation layers from consuming raw engine objects.

Scenario Projection performs no new organizational reasoning.

---

# Current Product Surface

## Executive Decision Workspace

Current component:

```text
components/executive-v2/decision/ExecutiveDecisionWorkspace.tsx
```

Current responsibilities:

- accept one executive intervention,
- accept an affected organizational condition,
- accept intervention strength,
- call the Executive Scenario API,
- display the simulated intervention,
- display projected Executive Understanding,
- and expose current-versus-projected comparison.

The current workspace validates the one-scenario product path.

It does not yet compare multiple intervention options or recommend the strongest option.

---

# Current API Surface

## Executive Scenario API

Current route:

```text
app/api/executive-scenario/route.ts
```

Current responsibilities:

- load the persisted Organization Runtime,
- build a hypothetical Organizational Intervention,
- build the Executive Decision Context,
- run one Executive Scenario,
- build the Executive Scenario Projection,
- and return the projected future.

The route must not call:

```text
saveOrganizationRuntimeState()
```

Scenario execution remains hypothetical and non-mutating.

---

# Missing Capabilities

The Executive Decision Operating System is not complete until Discovery can compare and rank multiple simulated options.

The following canonical capabilities remain to be implemented.

---

# CAP-DEC-001 — Executive Decision Orchestration

## Responsibility

Coordinate the complete multi-option executive decision cycle.

## Proposed Canonical Producer

```text
engine/v3/decision/runExecutiveDecisionCycle.ts
```

## Consumes

- `ExecutiveDecision`
- `ExecutiveDecisionContext`
- `InterventionOption[]`

## Produces

```text
ExecutiveDecisionCycle
```

## Required Behavior

1. Accept one canonical Executive Decision.
2. Generate viable Intervention Options.
3. Preserve every generated option.
4. Convert each option into a canonical Organizational Intervention.
5. Evaluate each option through canonical causal reasoning.
6. Execute each intervention through `runExecutiveScenario()`.
7. Preserve every scenario result.
8. Pass all completed scenarios to cross-scenario comparison.
9. Pass the comparison set to Decision Ranking.
10. Pass ranked scenarios to Executive Recommendation Synthesis.
11. Return the complete decision cycle.
12. Preserve the live Organization Runtime as an unchanged baseline.

## Non-Responsibilities

CAP-DEC-001 must not:

- invent independent intervention logic,
- duplicate option generation,
- duplicate causal mapping,
- duplicate causal propagation,
- duplicate influence aggregation,
- duplicate organizational simulation,
- duplicate Prediction Reflection,
- duplicate Executive Assessment,
- duplicate Executive Understanding,
- assign rankings itself,
- or synthesize the final recommendation itself.

Its responsibility is orchestration.

---

# CAP-DEC-002 — Cross-Scenario Comparison

## Responsibility

Compare multiple completed executive scenarios using one consistent decision framework.

## Proposed Canonical Producer

```text
engine/v3/decision/compareExecutiveScenarios.ts
```

## Consumes

```text
ExecutiveScenarioResult[]
```

## Produces

```text
ExecutiveScenarioComparisonSet
```

## Minimum Comparison Dimensions

- target-condition improvement,
- downstream organizational benefit,
- downstream organizational deterioration,
- breadth of positive influence,
- breadth of negative influence,
- prediction improvement,
- prediction deterioration,
- executive-assessment confidence,
- understanding change,
- intervention confidence,
- intervention assumptions,
- identified risks,
- evidence gaps,
- implementation complexity,
- reversibility,
- and time horizon.

## Required Behavior

Comparison must preserve:

- the current-state baseline,
- every evaluated intervention,
- every projected future,
- every condition change,
- every prediction change,
- every recommendation,
- every causal explanation,
- every assumption,
- every risk,
- and every reason one option differs from another.

Cross-Scenario Comparison must not rank options.

It produces the structured evidence required for ranking.

---

# CAP-DEC-003 — Decision Ranking

## Responsibility

Rank evaluated scenarios according to executive objectives, constraints, and projected organizational outcomes.

## Proposed Canonical Producer

```text
engine/v3/decision/rankExecutiveScenarios.ts
```

## Consumes

- `ExecutiveDecision`
- `ExecutiveScenarioComparisonSet`

## Produces

```text
RankedExecutiveScenario[]
```

## Ranking Dimensions

Potential ranking dimensions include:

- objective attainment,
- success metric improvement,
- target-condition improvement,
- breadth of positive organizational effect,
- severity of negative organizational effect,
- executive confidence,
- intervention confidence,
- required-constraint satisfaction,
- optional-constraint satisfaction,
- implementation risk,
- reversibility,
- time to effect,
- evidence sufficiency,
- uncertainty,
- and missing evidence.

## Ranking Principle

A scenario must not rank first merely because it produces the largest positive delta.

Ranking must balance:

```text
Expected Benefit
− Organizational Risk
− Constraint Violations
− Uncertainty
− Evidence Gaps
− Implementation Burden
```

Ranking must also preserve the executive objective.

A scenario that produces broad improvement but fails the defined objective should not automatically rank first.

## Determinism

Given the same:

- Executive Decision,
- baseline Organization Runtime,
- options,
- timestamps,
- and scenario results,

the ranking must remain deterministic.

---

# CAP-DEC-004 — Executive Recommendation Synthesis

## Responsibility

Produce the final executive recommendation after all viable scenarios have been compared and ranked.

## Proposed Canonical Producer

```text
engine/v3/decision/buildExecutiveDecisionRecommendation.ts
```

## Consumes

- `ExecutiveDecision`
- `RankedExecutiveScenario[]`
- `ExecutiveScenarioComparisonSet`

## Produces

```text
ExecutiveDecisionRecommendation
```

## Required Output

The recommendation should include:

- recommended intervention,
- recommendation status,
- recommendation confidence,
- executive summary,
- why the intervention ranked first,
- expected benefits,
- expected trade-offs,
- major risks,
- assumptions,
- missing evidence,
- conditions under which leadership should not proceed,
- evidence that would change the recommendation,
- next-best alternative,
- and reasons the other options ranked lower.

## Canonical Recommendation Status

Recommendation statuses must remain aligned with the existing scenario comparison contract:

```text
proceed
do-not-proceed
investigate-further
```

## Recommendation Principle

The strongest recommendation is not always to proceed.

Discovery must be able to conclude:

```text
proceed
```

when the expected organizational benefits outweigh identified risk.

Discovery must be able to conclude:

```text
do-not-proceed
```

when deterioration or constraint violations outweigh expected benefits.

Discovery must be able to conclude:

```text
investigate-further
```

when uncertainty, evidence gaps, or mixed effects prevent a reliable choice.

---

# Proposed Cognitive Objects

## ExecutiveDecisionCycle

```ts
type ExecutiveDecisionCycle = {
  executiveDecision: ExecutiveDecision;
  generatedOptions: InterventionOption[];
  evaluatedOptions: EvaluatedInterventionOption[];
  scenarios: ExecutiveScenarioResult[];
  comparisonSet: ExecutiveScenarioComparisonSet;
  rankedScenarios: RankedExecutiveScenario[];
  recommendation: ExecutiveDecisionRecommendation;
  completedAt: string;
};
```

## Meaning

`ExecutiveDecisionCycle` is the complete record of one hypothetical executive decision process.

It preserves:

- what leadership wanted,
- which options Discovery considered,
- how each option affected the causal model,
- what future each option produced,
- how those futures differed,
- how the options ranked,
- and why Discovery made its recommendation.

---

# ExecutiveScenarioComparisonEntry

```ts
type ExecutiveScenarioComparisonEntry = {
  interventionId: string;
  scenarioId: string;

  targetConditionChanges: Array<{
    conditionId: string;
    change:
      | "improved"
      | "worsened"
      | "unchanged";
    strengthDelta: number;
    confidenceDelta: number;
  }>;

  improvedConditionIds: string[];
  worsenedConditionIds: string[];
  addedPredictionIds: string[];
  removedPredictionIds: string[];

  executiveRecommendation:
    | "proceed"
    | "do-not-proceed"
    | "investigate-further";

  scenarioConfidence: number;
  risks: string[];
  assumptions: string[];
  missingEvidence: string[];
};
```

---

# ExecutiveScenarioComparisonSet

```ts
type ExecutiveScenarioComparisonSet = {
  baselineOrganizationId: string;
  scenarioComparisons:
    ExecutiveScenarioComparisonEntry[];
  sharedBenefits: string[];
  sharedRisks: string[];
  sharedUnknowns: string[];
  differentiatingFactors: string[];
  generatedAt: string;
};
```

## Meaning

The comparison set captures what all scenarios share and what distinguishes them.

It creates a stable input for deterministic ranking.

---

# RankedExecutiveScenario

```ts
type RankedExecutiveScenario = {
  rank: number;
  interventionId: string;
  scenarioId: string;
  score: number;
  objectiveAttainmentScore: number;
  organizationalBenefitScore: number;
  organizationalRiskScore: number;
  confidenceScore: number;
  constraintSatisfactionScore: number;
  evidenceSufficiencyScore: number;
  uncertaintyScore: number;
  implementationBurdenScore: number;
  reasonsForRank: string[];
};
```

## Meaning

A ranked scenario preserves both the overall score and the individual dimensions that produced it.

Discovery must never return an unexplained rank.

---

# ExecutiveDecisionRecommendation

```ts
type ExecutiveDecisionRecommendation = {
  executiveDecisionId: string;
  recommendedInterventionId?: string;

  status:
    | "proceed"
    | "do-not-proceed"
    | "investigate-further";

  confidence: number;
  summary: string;
  whyRecommended: string[];
  expectedBenefits: string[];
  tradeOffs: string[];
  risks: string[];
  assumptions: string[];
  missingEvidence: string[];
  evidenceThatWouldChangeRecommendation: string[];
  nextBestInterventionId?: string;
  generatedAt: string;
};
```

---

# Runtime and Persistence

Version 1 of the Executive Decision Operating System must remain non-mutating.

Decision cycles are hypothetical until explicitly accepted by leadership.

The system must not automatically:

- alter current organizational conditions,
- replace current organizational beliefs,
- replace the current Organizational State,
- replace the current Executive Assessment,
- replace current predictions,
- treat simulated outcomes as observed evidence,
- treat scenario confidence as learned confidence,
- or save projected futures into organizational truth.

A later capability may persist decision records separately from organizational truth.

## Proposed Future Runtime Destinations

```text
OrganizationRuntime.memory.executiveDecisions
OrganizationRuntime.memory.executiveDecisionCycles
OrganizationRuntime.memory.acceptedInterventions
OrganizationRuntime.memory.decisionOutcomes
```

These destinations should not be added until persistence, governance, and outcome-observation requirements are explicitly defined.

---

# Accepted Intervention Lifecycle

A future accepted-intervention workflow may follow:

```text
Hypothetical Intervention
↓
Executive Recommendation
↓
Leadership Acceptance
↓
Accepted Intervention Record
↓
Observed Organizational Change
↓
Decision Outcome Evaluation
↓
Organizational Learning
```

A simulated outcome must remain separate from an observed outcome.

Discovery must not learn that a recommendation was correct until later organizational evidence supports that conclusion.

---

# Executive Projection

The Executive Decision Experience should eventually expose:

```text
Executive Objective
↓
Options Considered
↓
Projected Outcomes
↓
Trade-Off Comparison
↓
Recommended Option
↓
Why Discovery Recommends It
↓
What Could Change the Recommendation
```

The UI must not expose raw engine objects.

## Proposed Canonical Projection

```text
ExecutiveDecisionProjection
```

## Proposed Producer

```text
components/executive-v2/projection/buildExecutiveDecisionProjection.ts
```

## Proposed Projection Contents

- executive objective,
- decision constraints,
- options considered,
- projected outcome summary for each option,
- target-condition changes,
- major downstream effects,
- major risks,
- evidence gaps,
- ranked options,
- recommended option,
- recommendation confidence,
- next-best alternative,
- and evidence that would change the recommendation.

---

# Executive Experience

The future product flow should become:

```text
What is the objective?
↓
What constraints must be respected?
↓
Which options did Discovery consider?
↓
What future does each option produce?
↓
What are the trade-offs?
↓
Which option ranks first?
↓
Why does Discovery recommend it?
↓
What could change Discovery’s mind?
```

The experience should emphasize decision clarity rather than raw simulation detail.

---

# Benchmark Strategy

The Executive Decision Operating System requires four benchmark layers.

## 1. Capability Tests

Validate each producer independently:

- option generation,
- option normalization,
- option evaluation,
- scenario execution,
- scenario projection,
- cross-scenario comparison,
- scenario ranking,
- and recommendation synthesis.

Each producer should be testable without requiring the full Executive Decision Cycle.

## 2. Scenario Integration

Validate:

```text
Runtime
→ Decision Context
→ Scenario
→ Scenario Projection
```

Current benchmark:

```text
engine/benchmark/decision-intelligence/scenarioIntegrationExperiment001.ts
```

Current validation responsibilities include:

- runtime loading,
- baseline cognition availability,
- decision-context creation,
- intervention preservation,
- simulation completion,
- projected-condition creation,
- projected-prediction creation,
- Prediction Reflection regeneration,
- Executive Assessment regeneration,
- Executive Understanding regeneration,
- scenario comparison,
- scenario projection,
- organization identity preservation,
- and runtime non-mutation.

## 3. Decision Calibration

Validate that known interventions produce expected directional outcomes and executive recommendations.

Current command:

```bash
npm run decision:calibrate
```

Current validated cases:

1. Clarify Decision Rights
2. Increase Approval Layers
3. Standardize Knowledge Transfer
4. Clarify Strategic Priorities

Current status:

```text
Cases ............. 4
Checks ............ 24
Passed ............ 24
Failed ............ 0
Score ............. 100%
```

## Current Validated Organizational Laws

```text
Clarify Decision Rights
→ Decision Flow improves
→ Coordination improves
→ Execution Capacity improves
→ Proceed
```

```text
Increase Approval Layers
→ Decision Flow worsens
→ Coordination worsens
→ Execution Capacity worsens
→ Do Not Proceed
```

```text
Standardize Knowledge Transfer
→ Knowledge Continuity improves
→ Coordination improves
→ Execution Capacity improves
→ Proceed
```

```text
Clarify Strategic Priorities
→ Strategic Alignment improves
→ Decision Flow improves
→ Coordination improves
→ Proceed
```

## 4. Multi-Option Decision Benchmark

Future benchmark:

```text
Executive Objective
→ Generate Multiple Options
→ Evaluate Every Option
→ Simulate Every Option
→ Compare Every Future
→ Rank Every Option
→ Recommend the Best Option
```

The benchmark must verify:

- every viable option is evaluated,
- all options use the same baseline,
- all options use the same canonical scenario pipeline,
- rankings are deterministic,
- constraint violations reduce rank,
- harmful interventions do not rank first,
- weak evidence reduces recommendation confidence,
- uncertainty affects recommendation status,
- the recommended option matches the expected executive choice,
- and the live runtime remains unchanged.

---

# Architectural Rules

1. `generateInterventionOptions()` remains the canonical option generator.
2. `convertInterventionOptionToIntervention()` remains the canonical option normalization producer.
3. `evaluateInterventionOption()` remains responsible only for causal option evaluation.
4. `runExecutiveScenario()` remains the canonical one-scenario orchestrator.
5. Multi-option orchestration must call `runExecutiveScenario()` rather than duplicate its logic.
6. Cross-scenario comparison must remain separate from scenario execution.
7. Decision Ranking must remain separate from cross-scenario comparison.
8. Executive Recommendation Synthesis must remain separate from Decision Ranking.
9. The live Organization Runtime must not be mutated by hypothetical decision cycles.
10. Every evaluated option must preserve its causal explanation.
11. Every scenario must preserve its baseline comparison.
12. Every rank must preserve the reasons that produced it.
13. Every recommendation must state what could change Discovery’s conclusion.
14. A new Decision Intelligence capability must not be created when an existing producer already owns the responsibility.
15. Decision Intelligence must be benchmarked against expected organizational behavior, not merely object completeness.
16. Simulated outcomes must remain separate from observed outcomes.
17. Leadership acceptance must remain separate from recommendation generation.
18. Discovery must evaluate all viable options through the same canonical pipeline before ranking them.
19. An option must not rank first solely because it has the largest projected positive delta.
20. Recommendation confidence must reflect uncertainty, evidence quality, and scenario differentiation.

---

# Current Implementation Status

## Complete

- Executive Decision object
- Intervention Option Generation
- Intervention Option Normalization
- Intervention Evaluation
- Organizational Intervention Modeling
- Organizational Causal Mapping
- Organizational Influence Propagation
- Organizational Influence Aggregation
- Organizational Simulation
- Projected Organizational State synthesis
- Projected Prediction Reflection
- Projected Executive Assessment
- Projected Executive Understanding
- Current-versus-projected Scenario Comparison
- Executive Scenario Projection
- Executive Scenario API
- Executive Decision Workspace
- Scenario Integration Experiment
- Executive Decision Calibration Suite

## In Progress

- reusable multi-option Executive Decision architecture
- extraction of experiment-specific reasoning into canonical producers

## Not Yet Implemented

- Executive Decision Cycle
- Cross-Scenario Comparison Set
- Decision Ranking
- Executive Recommendation Synthesis
- Executive Decision Projection
- multi-option Executive Decision Workspace
- accepted-intervention persistence
- decision-outcome evaluation
- decision-learning feedback loop

---

# Recommended Implementation Sequence

## Step 1 — Complete Reusable Option Evaluation

Use:

```text
evaluateInterventionOption()
```

inside the existing Decision Intelligence experiment so the experiment consumes the same canonical producer as future orchestration.

## Step 2 — Multi-Option Scenario Execution

Create a producer that accepts:

```text
InterventionOption[]
```

and returns:

```text
ExecutiveScenarioResult[]
```

Every option must use the same Executive Decision Context.

## Step 3 — Cross-Scenario Comparison

Create:

```text
compareExecutiveScenarios()
```

and produce:

```text
ExecutiveScenarioComparisonSet
```

## Step 4 — Decision Ranking

Create:

```text
rankExecutiveScenarios()
```

and produce:

```text
RankedExecutiveScenario[]
```

## Step 5 — Executive Recommendation Synthesis

Create:

```text
buildExecutiveDecisionRecommendation()
```

and produce:

```text
ExecutiveDecisionRecommendation
```

## Step 6 — Executive Decision Cycle

Create:

```text
runExecutiveDecisionCycle()
```

and compose the existing canonical producers.

## Step 7 — Executive Decision Projection

Create:

```text
buildExecutiveDecisionProjection()
```

for the product layer.

## Step 8 — Multi-Option Executive Experience

Allow leadership to:

- define an objective,
- review considered options,
- compare projected futures,
- inspect rankings,
- review the recommendation,
- and understand what could change Discovery’s conclusion.

## Step 9 — Multi-Option Benchmark

Validate the complete cycle against canonical executive decision cases.

---

# Definition of Success

The Executive Decision Operating System is complete when Discovery can:

1. accept an executive objective,
2. preserve success metrics,
3. preserve constraints,
4. generate multiple viable intervention options,
5. normalize every option into a canonical intervention,
6. evaluate every option through the canonical causal model,
7. simulate every resulting organizational future,
8. regenerate predictions for every future,
9. regenerate Executive Assessment for every future,
10. regenerate Executive Understanding for every future,
11. compare all futures consistently,
12. rank all options against the executive objective and constraints,
13. recommend one option or recommend further investigation,
14. explain why the option ranked first,
15. explain why other options ranked lower,
16. explain major trade-offs and risks,
17. state what evidence could change the recommendation,
18. preserve the next-best alternative,
19. preserve the current organization as an unchanged baseline,
20. and remain benchmarked against expected organizational behavior.

At that point, Discovery will move from:

> What happens if leadership chooses this intervention?

to:

> Which intervention should leadership choose, and why?
