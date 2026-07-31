# Organizational Understanding Research Framework

**Status:** Canonical benchmark research methodology

**Scope:** Experimental evaluation of organizational understanding

**Authority:** Benchmark and research interpretation only

**Canonical parent:** `docs/Architecture/Canon/DISCOVERY_SCORECARD.md`

**Conceptual subject:** `docs/Product/ORGANIZATIONAL_UNDERSTANDING_MODEL.md`

---

# Purpose

This framework answers:

> What scientific evidence shows that a bounded change improves Discovery's
> organizational understanding?

It supplies the experimental layer beneath the Organizational Understanding
Index (OUI). It does not replace, redefine, or add to the five canonical
Discovery Scorecard scores. It standardizes how heterogeneous experiments
describe treatments, controls, outcomes, uncertainty, contribution, and
complexity before their results are interpreted through the Scorecard.

This is research methodology, not production architecture. Its adapters,
dimension assessments, and experiment results are benchmark-only artifacts.
They do not become Runtime objects, cognitive objects, capabilities, or
production contracts.

---

# Measurement hierarchy

The complete measurement hierarchy is:

```text
Local Benchmark
↓
Capability Health
↓
Organizational Understanding Research Dimensions
↓
Local Understanding Utility, when a bounded experiment defines it
↓
Organizational Understanding Index
↓
Discovery Scorecard
```

Each level has a separate responsibility.

| Level | Question | Output |
| --- | --- | --- |
| Local Benchmark | Did one bounded behavior change under controlled conditions? | Scenario-level observations and invariants |
| Capability Health | Is the responsible capability correct, useful, stable, and safe? | Traceable capability movement |
| Research Dimensions | What kind of organizational understanding changed, and how convincingly? | Six-dimensional research profile |
| Local Understanding Utility | Did the bounded treatment improve useful local understanding under the named experiment protocol? | Optional benchmark-only profile, traceable to dimensions and native measures |
| Organizational Understanding Index | Is the Organizational Model becoming better at explaining and understanding the organization? | Evidence-supported North Star movement |
| Discovery Scorecard | Is the improvement useful, collectively valuable, governed, and sustainable? | Five-score profile and promotion judgment |

A strong local result cannot skip levels. No dimension result is a sixth
canonical score, and no experiment-level aggregate may substitute for the OUI.

Local Understanding Utility is an optional benchmark-only profile for
experiments that already expose a bounded utility comparison. It may summarize
whether one local treatment produced more useful understanding under that
experiment's unchanged protocol. It does not create a universal utility
formula, cross-experiment leaderboard, production object, or additional
Scorecard score. It sits beneath the OUI and before any User Intelligence
claim because benchmark-local usefulness is not evidence that a user became
more capable.

---

# Core measurement rules

## Treatments are not metrics

A **treatment** is the bounded difference introduced between a baseline and an
experimental path. Examples include a new evidence-composition policy, a
localized nonlinear operator, or additional candidate-relative structure.

A **metric** observes an outcome. Examples include recovery of a grounded
causal relation, preservation of an alternative explanation, or reduction in
duplicate-support inflation.

The treatment must never define its own success. In particular:

- adding a causal relation is not evidence of Explanatory Depth;
- adding more evidence links is not evidence of Evidence Integration;
- producing a different winner is not evidence of Alternative Resolution;
- changing more objects is not evidence of learning;
- producing novel output is not evidence of Emergent Insight.

Success requires an independently stated expected outcome, an unchanged
comparison protocol, and traceable observations.

## Direction before aggregation

Research results use deterministic component observations and bounded
qualitative states. They do not use permanent arbitrary weights.

Every dimension receives:

```text
measurement state:
  not-measured | unsupported | mixed | supported | replicated

movement:
  regressed | unchanged | improved | indeterminate
```

`replicated` requires the same directional result in an independent fixture,
scenario family, or preregistered replication. Repeated execution of the same
fixture establishes determinism, not replication.

## Evidence before interpretation

Every conclusion must retain this trace:

```text
scenario observation
→ local benchmark result
→ capability movement
→ research-dimension assessment
→ OUI interpretation
→ five-score effect
→ research decision
```

Observed evidence and architectural inference must be reported separately.

---

# The six research dimensions

## 1. Explanatory Depth

### Research question

> Does Discovery explain why organizational outcomes occur, beyond describing
> co-occurrence or restating evidence?

### Acceptable measures

- recovery of known causal or mechanism structure;
- correct directionality and intermediary structure;
- counterfactual or intervention discrimination when the fixture supplies it;
- explanation completeness without unsupported edges;
- preservation of causal ancestry through completed explanations.

### Improvement

An explanation becomes more causally adequate against an independently defined
truth or discrimination test while unsupported explanatory claims do not grow.

### Failure

- relabeling correlation as causation;
- adding plausible but ungrounded edges;
- increasing confidence without stronger explanatory discrimination;
- matching benchmark wording without recovering meaning.

### Required trace

Expected relation, produced relation, supporting ancestry, earliest responsible
producer, false-positive set, and counterfactual result where available.

## 2. Evidence Integration

### Research question

> Does Discovery combine relevant, independent, and governed evidence without
> treating repetition or volume as corroboration?

### Acceptable measures

- independent-source corroboration;
- duplicate and repeated-source resistance;
- relevant evidence coverage;
- provenance and evidence-identity preservation;
- resistance to irrelevant but plausible evidence;
- bounded treatment of missing or unprovenanced evidence.

### Improvement

Support changes in response to independent information rather than raw record
volume, with stable identities and unchanged provenance.

### Failure

- duplicate inflation;
- erased ancestry;
- evidence-volume ranking;
- semantic deduplication that removes materially distinct observations;
- use of reliability or recency in an experiment that holds them out.

### Required trace

Evidence identities, source identities, relevance determination, contribution
by source, omissions, and downstream support deltas.

## 3. Alternative Resolution

### Research question

> Does Discovery distinguish competing explanations using candidate-relative
> evidence while retaining unresolved alternatives?

### Acceptable measures

- correct use of supporting, weakening, differentiating, and disqualifying
  evidence where those roles are canonically available;
- recovery of the better-supported candidate;
- calibrated retention of unresolved candidates;
- contradiction and disconfirming-test sensitivity;
- resistance to candidate-order effects.

### Improvement

The evidence changes relative candidate support for a stated reason, and the
winning or unresolved disposition agrees with the fixture's discrimination
logic.

### Failure

- winner selection from generic confidence alone;
- deletion of alternatives;
- order-sensitive adjudication;
- invented candidate-relative semantics;
- false certainty when evidence does not discriminate.

### Required trace

Candidate identities, comparative roles, test outcomes, before-and-after
support, ranking, unresolved set, and adjudication owner.

## 4. State and Dynamics Awareness

### Research question

> Does Discovery understand that organizational mechanisms and outcomes may
> depend on state, sequence, threshold, feedback, and time?

### Acceptable measures

- discrimination between identical inputs in materially different states;
- recovery of lag, threshold, feedback, or phase-transition behavior;
- correct sequence sensitivity;
- correct persistence or reversal after intervention;
- rejection of state-dependent claims when the fixture lacks the required
  evidence.

### Improvement

The produced understanding distinguishes state-dependent behavior that a
static explanation misses, without destabilizing state-independent controls.

### Failure

- state labels without behavioral consequence;
- nondeterministic transitions;
- circular inference from the desired outcome;
- pervasive nonlinear treatment that damages controls;
- claiming dynamics from a single static observation.

### Required trace

Initial state, transition inputs, clock, expected trajectory, produced
trajectory, control trajectory, and transition owner.

## 5. Longitudinal Learning

### Research question

> Does Discovery improve its understanding across cycles while preserving
> identity, revision history, contradictions, and permission boundaries?

### Acceptable measures

- correction after new evidence;
- stable identity through revision;
- appropriate confidence and explanation movement;
- retained or explicitly superseded prior understanding;
- reduced repeated investigation;
- deterministic replay of the same learning history.

### Improvement

Later understanding is more accurate or discriminating because of prior
learning, with attributable changes and no invalid persistence.

### Failure

- treating accumulation as learning;
- overwriting history;
- confidence ratcheting without information gain;
- cross-cycle leakage;
- sensitivity to replay order rather than event semantics.

### Required trace

Cycle identities, input deltas, pre/post understanding, revision links,
contradiction state, permission state, and replay digest.

## 6. Emergent Insight

### Research question

> Does Discovery derive a valid organizational insight that no isolated input,
> silo, or local path states by itself?

### Acceptable measures

- cross-silo implication recovery;
- multi-source mechanism or relation synthesis;
- useful novel implication supported by complete ancestry;
- failure under required-source ablation;
- survival under irrelevant-source and wording perturbations.

### Improvement

The insight is novel relative to individual inputs, entailed by their governed
composition, useful to organizational understanding, and lost when a necessary
contributor is removed.

### Failure

- novelty without entailment;
- template completion;
- hidden benchmark truth leakage;
- output present in one input;
- false emergence driven by duplication or unrestricted cross-context access.

### Required trace

Input silos, isolated-path outputs, joint output, novelty check, entailment
evidence, necessary-source ablations, governance disposition, and producer.

---

# Common benchmark-only experiment adapter

Existing experiments should retain their native fixtures, runners, and result
files. A thin adapter maps their outputs into this common research envelope.
The adapter must not call alternative cognition, repair benchmark output, or
simulate a platform capability.

The smallest common contract is:

```ts
type ResearchDimension =
  | "explanatory-depth"
  | "evidence-integration"
  | "alternative-resolution"
  | "state-and-dynamics-awareness"
  | "longitudinal-learning"
  | "emergent-insight";

type ExperimentDecision =
  | "reject"
  | "continue-research"
  | "replicate"
  | "eligible-for-production-contract-design";

interface OrganizationalUnderstandingExperimentResult {
  experimentId: string;
  protocolVersion: string;
  treatment: {
    name: string;
    boundedDifference: string;
  };
  scenarios: Array<{
    scenarioId: string;
    baselineArtifact: string;
    treatmentArtifact: string;
    invariantResults: Record<string, boolean>;
    observations: Array<{
      observationId: string;
      dimension: ResearchDimension;
      measure: string;
      baseline: string | number | boolean;
      treatment: string | number | boolean;
      expectedDirection: "increase" | "decrease" | "preserve" | "discriminate";
      observedMovement:
        | "regressed"
        | "unchanged"
        | "improved"
        | "indeterminate";
      evidenceRefs: string[];
    }>;
  }>;
  dimensionResults: Array<{
    dimension: ResearchDimension;
    state: "not-measured" | "unsupported" | "mixed" | "supported" | "replicated";
    movement: "regressed" | "unchanged" | "improved" | "indeterminate";
    evidenceRefs: string[];
    limitations: string[];
  }>;
  scorecardEffects: {
    organizationalUnderstanding: "++" | "+" | "=" | "-" | "--" | "?";
    userIntelligence: "++" | "+" | "=" | "-" | "--" | "?";
    collectiveIntelligence: "++" | "+" | "=" | "-" | "--" | "?";
    governanceIntegrity: "++" | "+" | "=" | "-" | "--" | "?";
    systemSustainability: "++" | "+" | "=" | "-" | "--" | "?";
  };
  scientificEvidence: {
    deterministicReplay: boolean;
    orderIndependent: boolean;
    fixtureIsolated: boolean;
    ablations: string[];
    controls: string[];
    limitations: string[];
  };
  complexity: {
    runtimeGrowth: string;
    processingGrowth: string;
    contractGrowth: string;
    duplicateDerivationRisk: string;
    rollbackBoundary: string;
  };
  decision: ExperimentDecision;
}
```

Strings in the adapter are references or exact normalized observations, not
free-form substitute judgments. Native machine-readable artifacts remain the
source of truth. A mapping must fail closed when a required native field is
missing.

No combined dimension score is part of this contract.

---

# Deterministic paired methodology

## Preregistration

Before execution, record:

- hypothesis and bounded treatment;
- earliest responsible production boundary under investigation;
- expected dimension movement;
- success and failure criteria;
- fixtures and ground truth;
- controls and ablations;
- permitted and forbidden inputs;
- expected five-score effects;
- rollback or rejection rule.

Changing these after observing results creates a new protocol version and
preserves the original result.

## Paired execution

Baseline and treatment paths must receive identical:

- Evidence and evidence identities;
- organizational scope and identity;
- scenario inputs;
- expected outcomes and ground truth;
- clock and timestamps;
- entropy, seed, and ordering policy;
- governance and visibility context;
- downstream evaluation protocol.

Only the preregistered treatment may differ.

## Required controls

Use the controls that are relevant to the claimed capability, and explain
inapplicable controls:

- repeated-run byte equality;
- reversed evidence and source order;
- isolated fixture and Runtime restoration;
- positive and negative controls;
- irrelevant but plausible evidence;
- malformed and missing inputs;
- duplicate and high-volume inputs;
- candidate and scenario order reversal;
- single-silo and cross-silo paths;
- single-cycle and multi-cycle paths;
- held-out wording or fixture variants;
- stable identity, support ancestry, and serialization.

Production and shadow paths run side by side. Shadow output must not persist,
alter production output, or become input to production reasoning.

---

# Contribution and ablation analysis

Improvement claims must identify what caused the observed movement.

At minimum, evaluate:

1. **Treatment ablation:** remove the treatment and recover the baseline.
2. **Necessary-input ablation:** remove each claimed decisive contributor.
3. **Irrelevant-input addition:** add plausible noncausal material.
4. **Volume perturbation:** duplicate an existing contributor without adding
   independent information.
5. **Order perturbation:** reverse all semantically irrelevant orders.
6. **Boundary isolation:** execute local paths separately before composing them.
7. **Downstream holdout:** show whether later movement comes from the treatment
   or an independent downstream rule.

For each changed object, report:

- identity;
- changed field;
- baseline and treatment values;
- direct contributing inputs;
- earliest changed producer;
- downstream consumers;
- whether the change disappears under the expected ablation.

A treatment that improves an outcome but cannot explain its contribution is
not eligible for production contract design.

---

# Complexity and System Sustainability

Complexity is not part of the OUI and cannot be traded invisibly against it.
It is reported separately through the System Sustainability Index.

Every experiment records:

- new production objects, fields, capabilities, and owners proposed;
- new benchmark-only adapters or duplicated logic;
- branch and state-space growth;
- processing and memory growth;
- serialization and migration impact;
- identity and ordering risk;
- rollback boundary;
- maintenance and test surface;
- risk of duplicate derivation or overlapping truth.

Prefer an existing-object extension at the earliest responsible producer.
Reject a treatment whose apparent understanding gain depends on an unnecessary
universal abstraction, parallel reasoning pipeline, or unbounded path growth.

Complexity measures may be numeric where directly measured—such as object
count, elapsed processing, memory, or branch count—but are never folded into
an arbitrary OUI weight.

---

# Canonical research output

Every adapted experiment report contains, in this order:

1. experiment identity and protocol version;
2. bounded treatment and unchanged baseline;
3. scenario and control results;
4. six research-dimension results, including `not-measured`;
5. contribution and ablation findings;
6. determinism, identity, isolation, and governance findings;
7. five canonical Scorecard effects;
8. separate complexity and System Sustainability assessment;
9. scientific limitations and architectural inference;
10. exactly one decision:

```text
reject
continue research
replicate
eligible for production contract design
```

Decision meanings:

| Decision | Meaning |
| --- | --- |
| reject | The hypothesis failed, regressed a guardrail, or cannot be isolated safely. |
| continue research | Evidence is informative but incomplete, mixed, or dependent on unresolved protocol weaknesses. |
| replicate | The bounded result is supported and should be tested on an independent fixture, organization, or scenario family. |
| eligible for production contract design | The promotion standard below is satisfied. This authorizes contract design, not production implementation. |

---

# Applying the framework

The framework supports different experiments without pretending their
treatments or measures are interchangeable.

| Comparison | Primary dimensions | Required discrimination |
| --- | --- | --- |
| Existing pipeline vs candidate-relative explanation testing | Alternative Resolution, Explanatory Depth | Better candidate discrimination without erased alternatives or invented roles |
| Raw evidence composition vs independent-source contribution | Evidence Integration | Corroboration responds to independent sources, not repeated records |
| Static reasoning vs state-dependent dynamics | State and Dynamics Awareness | State-sensitive cases improve while static controls remain stable |
| Single-cycle inference vs multi-cycle learning | Longitudinal Learning | Later cycles revise attributable understanding without identity drift or leakage |
| Isolated silo reasoning vs governed cross-silo composition | Emergent Insight, Evidence Integration | Joint insight is entailed, novel, permission-valid, and ablation-sensitive |
| Stable composition vs localized nonlinear cognition | Explanatory Depth, Emergent Insight, System Sustainability | Localized gain survives controls without pervasive instability or path explosion |

Each comparison may leave dimensions `not-measured`. Absence of measurement
must not be converted into a neutral or positive result.

---

# Production-readiness standard

An experiment is `eligible for production contract design` only when all of
the following are demonstrated:

1. the treatment is isolated to one stated semantic responsibility;
2. at least one research dimension improves against independent expected
   outcomes;
3. the improvement survives relevant controls and contribution ablations;
4. deterministic replay, ordering, identity, and fixture isolation hold;
5. no material regression appears in any measured dimension;
6. Governance Integrity and System Sustainability remain acceptable;
7. the earliest responsible canonical producer is identified;
8. the smallest compatible existing-object extension is known, with a bounded
   rollback path;
9. an independent replication or equivalently strong held-out evaluation
   supports the result.

Passing this standard does not authorize code. It permits a separate,
read-only production contract design followed by explicit implementation
authorization.

---

# Long-term experimental pipeline

```text
Research question
↓
Preregistered bounded hypothesis
↓
Native local benchmark
↓
Paired baseline and treatment execution
↓
Common result adapter
↓
Six-dimension assessment
↓
Contribution, ablation, and guardrail review
↓
Five-score interpretation
↓
One research decision
↓
Reject / refine / independently replicate
↓
Production contract design only when eligible
↓
Separately authorized production shadow
↓
Canonical regression and promotion review
```

Historical native outputs and protocol versions remain immutable. New
methodology is evaluated alongside old baselines before becoming the default.

---

# Changes required in benchmark evaluation

Existing experiments do not need to adopt a shared runner. They need only:

- stable machine-readable scenario identities;
- explicit baseline and treatment artifacts;
- declared invariants, controls, and expected outcomes;
- references to changed objects and their ancestry;
- deterministic replay and isolation results;
- a thin adapter into the common result contract;
- explicit `not-measured` dimension results;
- separate Scorecard and complexity interpretations;
- one permitted research decision.

Adapters must not:

- change native scoring;
- repair missing output;
- introduce a benchmark-only reasoning engine;
- overwrite historical baselines;
- imply that shadow behavior exists in production;
- aggregate dimensions into a synthetic research score.

---

# Smallest benchmark-only implementation

The smallest useful first implementation is to adapt the existing
`localized-nonlinear-cognition-experiment-001` artifacts to this framework.

That experiment already exposes a bounded treatment, stable and pervasive
comparators, deterministic scenario outputs, and architecture-cost questions.
The initial implementation should add only:

1. a benchmark-only adapter that reads its existing result artifact;
2. explicit assessments for Explanatory Depth, Emergent Insight, and System
   Sustainability;
3. `not-measured` results for the other four research dimensions;
4. a contribution/ablation record using the experiment's existing controls;
5. one common-format report without rerunning, rescoring, or changing the
   experiment.

This first adapter validates the framework's ability to distinguish
understanding movement from architecture cost. It must not modify production,
promote localized nonlinear cognition, or generalize the adapter into a new
platform abstraction.

---

# Explicit non-goals

This framework does not:

- alter the five canonical Discovery scores;
- define a numeric OUI formula;
- create permanent dimension weights;
- modify cognition, Runtime, Governance, or capability ownership;
- introduce a universal experiment or cognitive object;
- authorize any completed research treatment for production;
- compare providers or use provider judgment as ground truth;
- replace native benchmark semantics;
- claim that unmeasured user or collective outcomes improved;
- turn scientific evidence into a single leaderboard score.

---

# Open calibration questions

These questions remain empirical:

- which independent fixtures are sufficient for replication by experiment
  class;
- which measures best detect explanatory usefulness without wording bias;
- how longitudinal revision quality should be calibrated across different
  cycle lengths;
- which direct complexity measures predict unacceptable production cost;
- when a held-out scenario family is strong enough to substitute for a second
  organizational fixture.

They should be resolved through versioned benchmark evidence, not permanent
weights or architectural speculation.

---

**ORGANIZATIONAL UNDERSTANDING RESEARCH FRAMEWORK DESIGNED**
