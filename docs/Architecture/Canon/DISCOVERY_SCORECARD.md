# Discovery Scorecard

**Status:** Canonical
**Scope:** Permanent engineering optimization and promotion framework
**Authority:** Project-level measurement of Discovery improvement

---

# Purpose

The Discovery Scorecard answers:

> Is Discovery becoming better?

It provides one stable engineering framework for evaluating implementation
phases, benchmark results, architectural changes, product enhancements, and
regressions throughout Discovery 2 and beyond.

The scorecard contains exactly five canonical scores. It deliberately avoids a
large collection of top-level metrics so engineering attention remains
focused on the quality of Discovery's organizational intelligence.

The framework is canonical. Individual benchmark composition and score
methodology may evolve when deterministic evidence justifies the change.

The benchmark research methodology beneath the Organizational Understanding
Index is defined by:

```text
engine/benchmark/research/ORGANIZATIONAL_UNDERSTANDING_RESEARCH_FRAMEWORK.md
```

Its six research dimensions and any Local Understanding Utility profile are
benchmark-level interpretations. They are not additional top-level Discovery
Scorecard metrics.

---

# Canonical engineering principle

> Discovery optimizes understanding, not feature count.

Engineering success is measured by improvement in organizational understanding
rather than implementation volume.

Features, objects, integrations, providers, screens, and lines of code are not
evidence that Discovery improved. They matter only when deterministic
measurement demonstrates better understanding or a necessary improvement to
the conditions that preserve it.

---

# Measurement hierarchy

Discovery uses four distinct measurement levels:

```text
Local Benchmark
↓
Capability Health
↓
Organizational Understanding Research Dimensions
↓
Discovery Scorecard
↓
Overall Discovery Health
```

## Local Benchmark

A Local Benchmark validates one bounded behavior, invariant, failure mode, or
production hypothesis.

It answers:

> Did this specific capability behave correctly under the tested conditions?

A benchmark result is evidence. It is not, by itself, a project-level score.

## Capability Health

Capability Health synthesizes the relevant deterministic benchmarks for one
existing capability or production responsibility.

It answers:

> Is this capability becoming more correct, useful, stable, and safe?

Capability Health remains traceable to individual benchmark results. It is not
a sixth canonical score.

## Organizational Understanding Research Dimensions

Research adapters may interpret local benchmark and capability movement
through Explanatory Depth, Evidence Integration, Alternative Resolution, State
and Dynamics Awareness, Longitudinal Learning, and Emergent Insight.

For experiments that evaluate the usefulness of one bounded understanding
change before user-level outcomes can be measured, those observations may be
reported as a **Local Understanding Utility** profile. The profile must remain
traceable to the six dimensions, controls, ablations, and native benchmark
artifacts.

Local Understanding Utility is:

- benchmark-only;
- local to a named experiment and protocol;
- subordinate to the Organizational Understanding Index;
- evaluated before any claim about the User Intelligence Index;
- never a sixth Scorecard metric, permanent weighted formula, production
  object, or substitute for user-outcome evidence.

## Discovery Scorecard

The Discovery Scorecard interprets measured capability movement through five
project-level dimensions.

It answers:

> How did the bounded change affect Discovery's organizational intelligence,
> its users, its collective learning, its trustworthiness, and its ability to
> evolve?

## Overall Discovery Health

Overall Discovery Health is the engineering judgment formed from the complete
five-score profile.

It is not a hidden weighted average or an additional score. A strong North
Star result does not cancel a material Governance or Sustainability
regression.

---

# The five canonical scores

## 1. Organizational Understanding Index

**Role:** North Star
**Optimization posture:** Discovery's only directly optimized score

### Question

> Is the Organizational Model becoming better at explaining and understanding
> the organization?

### Meaning

The Organizational Understanding Index measures whether Discovery forms more
accurate, useful, evidence-grounded, revisable, and coherent organizational
understanding.

It evaluates improvement in the product's central object: the living
Organizational Model. It must reward explanatory quality rather than mere
output volume, confidence, agreement, or benchmark-specific wording.

### Contributing benchmark dimensions

Examples include:

- Explanation Quality;
- Evidence Quality;
- Organizational Model Quality;
- Learning Quality;
- Insight Quality;
- causal and mechanism fidelity;
- competing-explanation discipline;
- uncertainty and contradiction preservation;
- understanding revision quality.

These are contributing dimensions, not permanently weighted components.

### Desired movement

Discovery intentionally optimizes this Index upward, subject to both guardrail
indices.

An apparent improvement is invalid when it results from:

- benchmark overfitting;
- unsupported confidence;
- erased contradictions or alternatives;
- broken provenance;
- nondeterministic output;
- architectural duplication;
- leakage across authority or permission boundaries.

---

## 2. User Intelligence Index

**Role:** Human capability outcome
**Optimization posture:** Observed outcome of better organizational
understanding and interaction

### Question

> Are users becoming more capable because Discovery exists?

### Meaning

The User Intelligence Index measures whether authorized users can understand
their organization, investigate uncertainty, evaluate explanations, and act
with less avoidable cognitive burden because Discovery exists.

It measures increased human capability, not application consumption.

### Contributing benchmark dimensions

Examples include:

- understanding growth;
- contextual richness;
- investigation efficiency;
- explanation usefulness;
- reduced cognitive effort;
- appropriate challenge;
- conversational continuity;
- decision comprehension;
- ability to inspect evidence, uncertainty, and alternatives.

### Explicit exclusion

The User Intelligence Index is not engagement.

Session count, time in product, clicks, messages, retention mechanics, and
feature adoption do not demonstrate that a user became more intelligent.
Usage data may help diagnose delivery, but it cannot substitute for measured
capability improvement.

---

## 3. Collective Intelligence Index

**Role:** Organizational learning outcome
**Optimization posture:** Observed system-level outcome of governed shared
intelligence

### Question

> Is the organization becoming more intelligent than the sum of its
> contributors?

### Meaning

The Collective Intelligence Index measures whether governed contributions
combine into useful organizational understanding that no isolated contributor
or application could produce alone.

It rewards synthesis without treating volume, seniority, visibility, or
repetition as truth.

### Contributing benchmark dimensions

Examples include:

- emergent insights;
- reusable explanations;
- cross-functional knowledge;
- reduced duplicated investigation;
- organizational learning velocity;
- independent corroboration;
- preservation of local and conflicting perspectives;
- valid sanitized influence across contexts;
- cumulative learning without cumulative privacy leakage.

### Strategic importance

Collective Intelligence is Discovery's long-term competitive advantage because
the living Organizational Model can retain, reconcile, and reuse governed
learning across people, time, scopes, and applications.

Individual features can be copied. A trustworthy, continuously improving body
of shared organizational understanding compounds through use and is harder to
reproduce.

---

## 4. Governance Integrity Index

**Role:** Trust guardrail
**Optimization posture:** Maintain or improve; material regression normally
blocks promotion

### Question

> Can Discovery still trust its own organizational knowledge?

### Meaning

The Governance Integrity Index measures whether organizational knowledge
remains attributable, authorized, contextually valid, revisable, and safe to
use.

It protects the epistemic and permission conditions under which improvements
to understanding are legitimate.

### Contributing benchmark dimensions

Examples include:

- provenance preservation;
- authority correctness;
- contradiction handling;
- deterministic behavior where it establishes epistemic reproducibility;
- revision correctness;
- permission correctness;
- purpose limitation;
- organization and tenant isolation;
- disclosure and privacy projection;
- temporal authorization behavior.

### Guardrail policy

A material regression normally blocks promotion even when the Organizational
Understanding Index improves.

An exception requires explicit authorization, bounded impact, a documented
recovery plan, and evidence that no protected knowledge, identity, authority,
or permission boundary is compromised.

---

## 5. System Sustainability Index

**Role:** Evolution guardrail
**Optimization posture:** Maintain or improve; material regression normally
blocks promotion

### Question

> Can Discovery continue evolving without architectural decay?

### Meaning

The System Sustainability Index measures whether Discovery can preserve,
validate, migrate, operate, and extend its intelligence without accumulating
uncontrolled complexity or fragile behavior.

It protects the platform's ability to improve repeatedly rather than only
succeed once.

### Contributing benchmark dimensions

Examples include:

- deterministic replay;
- benchmark stability;
- Runtime compatibility;
- migration safety;
- architectural simplicity;
- maintainability;
- performance envelope;
- stable identity and ordering;
- rollback readiness;
- bounded context and processing growth;
- absence of unnecessary universal abstractions.

### Guardrail policy

A material regression normally blocks promotion. Local speed or benchmark
gain does not justify hidden persistence risk, nondeterminism, unbounded
complexity, or architectural duplication.

---

# Optimization policy

Discovery directly optimizes only the Organizational Understanding Index.

The User Intelligence and Collective Intelligence indices determine whether
better organizational understanding creates the intended human and
organizational outcomes. They prevent the North Star from becoming internally
correct but practically inert.

Governance Integrity and System Sustainability are guardrails. They define the
conditions under which measured improvement is trustworthy and durable.

The five scores must be reviewed together. Discovery must not collapse them
into an arbitrary weighted total.

---

# Engineering hypothesis requirement

Every implementation phase is an explicit engineering hypothesis.

Before implementation, the phase must record:

## Expected Score Impact

The expected direction and rationale for all materially affected scores.

Example:

```text
Expected

Organizational Understanding  ++
User Intelligence             =
Collective Intelligence       =
Governance Integrity          =
System Sustainability         =
```

`++`, `+`, `=`, `-`, and `--` describe expected direction and materiality.
They are not numeric weights.

After deterministic validation, the phase must record:

## Observed Score Impact

The evidence-supported movement for the same score profile.

Example:

```text
Observed

Organizational Understanding  +
User Intelligence             =
Collective Intelligence       =
Governance Integrity          =
System Sustainability         =
```

## Regression Analysis

The phase must identify:

- every benchmark movement;
- whether movement was expected;
- the capability responsible;
- any scorecard dimension affected;
- whether the result is an acceptable tradeoff;
- whether rollback or further investigation is required.

## Result

The review classifies the engineering hypothesis, for example:

```text
Result: Partial Success
```

The classification must follow the evidence. Implementation completion,
schedule pressure, or feature value cannot override an unacceptable
guardrail regression.

---

# Canonical regression and promotion policy

No implementation phase is complete simply because code was written.

Completion requires deterministic benchmark evidence demonstrating improvement
in at least one optimization objective without unacceptable regression in the
guardrail indices.

For the scorecard:

- the Organizational Understanding Index is the direct optimization
  objective;
- User Intelligence and Collective Intelligence are validated outcome
  objectives when the phase can affect them;
- Governance Integrity and System Sustainability are promotion guardrails.

A phase that produces no demonstrated objective improvement is not successful
production optimization, even if all regressions pass. It may still yield
useful benchmark evidence, a rejected hypothesis, or infrastructure, but must
be reported accurately.

A phase with a material guardrail regression must stop, roll back, or receive
explicit exception review. It must not silently accumulate regression debt.

Accepted pre-existing findings remain visible and unchanged. They do not
authorize new regressions.

---

# Score evolution and traceability

## Stable framework, evolving method

The five-score framework is canonical.

The exact scoring methodology is expected to evolve through benchmark
evidence. Discovery must not hard-code arbitrary weights to create an
appearance of precision.

Methodology changes require:

1. a stated measurement deficiency;
2. deterministic evidence;
3. historical baseline preservation;
4. before-and-after comparison;
5. documentation of changed interpretation;
6. proof that the change does not hide regression.

## Benchmark traceability

Every observed movement must be traceable:

```text
benchmark result
→ capability movement
→ scorecard interpretation
→ promotion decision
```

Score reports must retain:

- benchmark and scenario identity;
- baseline and observed result;
- deterministic replay status;
- affected capability and earliest responsible producer;
- scorecard dimension;
- direction and rationale;
- guardrail disposition.

No provider opinion, stakeholder preference, aggregate score, or narrative
claim may replace this trace.

## No permanent arbitrary weights

Discovery may test score composition experimentally, but no numerical weighting
becomes canonical without benchmark evidence that it improves engineering
decisions across representative cases.

Until then, score profiles remain multidimensional and explainable.

---

# Relationship to canonical architecture

## Discovery 2 Sequential Implementation Program

The Sequential Implementation Program defines execution order, phase
dependencies, benchmark gates, rollback boundaries, and completion criteria.

This Scorecard defines how each phase states its expected impact and how
observed benchmark evidence becomes a project-level promotion decision.

Every phase must reference the scorecard before implementation begins and
after benchmark validation completes.

## Cognitive Architecture

The Cognitive Architecture defines objects, producers, consumers, ownership,
and transformations. This Scorecard does not create cognitive capabilities or
change ownership.

Score movement must be attributed to the earliest responsible canonical
producer rather than to a projection or benchmark wrapper.

## Governance

Governance defines authority, permissions, purpose, visibility, and temporal
policy behavior. The Governance Integrity Index measures whether implementation
preserves those canonical responsibilities; it does not redefine them.

## Runtime

Organization Runtime remains the canonical technical persistence boundary.
The System Sustainability and Governance Integrity indices measure Runtime
compatibility and isolation where relevant; the Scorecard adds no Runtime
state.

## Product and applications

Applications expose and contribute to shared organizational intelligence.
Product behavior may affect User or Collective Intelligence, but usage volume
is not score movement. Product improvement must remain traceable to measurable
human capability or organizational learning.

---

# Review template

Every implementation phase should use this minimum scorecard record:

```text
Phase:
Engineering hypothesis:
Baseline:

Expected Score Impact
- Organizational Understanding:
- User Intelligence:
- Collective Intelligence:
- Governance Integrity:
- System Sustainability:

Observed Score Impact
- Organizational Understanding:
- User Intelligence:
- Collective Intelligence:
- Governance Integrity:
- System Sustainability:

Benchmark trace:
Capability Health:
Regression Analysis:
Guardrail disposition:
Result:
Rollback decision:
```

The record may link to detailed benchmark artifacts. It must not replace them
with an unexplained aggregate.

---

# Explicit non-goals

The Discovery Scorecard does not:

- implement a scoring algorithm;
- assign numerical weights;
- create a dashboard;
- create a Runtime object;
- create a cognitive capability;
- replace benchmark-specific pass/fail criteria;
- turn engagement into intelligence;
- redefine User, Organizational, or Collective Intelligence;
- authorize production changes;
- hide accepted or new regressions inside an aggregate;
- make all five scores direct optimization targets;
- measure engineering productivity by feature or code volume.

---

# Completion standard

The Scorecard is operating as intended when every future implementation phase:

1. begins with an explicit expected five-score profile;
2. remains grounded in deterministic local benchmarks;
3. attributes movement through Capability Health;
4. reports the observed five-score profile;
5. analyzes regressions explicitly;
6. blocks unacceptable Governance or Sustainability regression;
7. preserves traceability from benchmark evidence to promotion decision;
8. evaluates engineering success through improved understanding rather than
   implementation volume.
