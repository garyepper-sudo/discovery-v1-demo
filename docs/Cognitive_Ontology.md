# Discovery Cognitive Ontology

Discovery is an Organizational Cognition Engine.

Its purpose is not to produce more objects.
Its purpose is to transform organizational evidence into enduring executive understanding.

This document defines Discovery's internal cognitive ontology.

This ontology is proprietary and should not be exposed directly in the user interface. The UI may represent this model through compressed visual language, especially the organism, but should not reveal the full internal hierarchy or transformation logic.

---

## Core Principle

Every cognitive layer must answer exactly one question.

If two layers answer the same question, one should be removed, renamed, or demoted to an implementation detail.

Discovery's cognitive model is:

```text
Evidence
    ↓
Beliefs
    ↓
Patterns
    ↓
Mechanisms
    ↓
Organizational Theory

Capability Assessment
    ↓
Executive Understanding
```

Capability Assessment is not a causal reasoning layer.

It is an evaluative layer produced from the cognitive model. Beliefs, Patterns, Mechanisms, and Organizational Theory describe how the organization works. Capability Assessment evaluates the health of the organization based on that model.

---

## 1. Evidence

### Question Answered

What happened?

### Responsibility

Evidence represents raw organizational input.

Evidence is not interpretation.
Evidence is not explanation.
Evidence is not understanding.

### Examples

* Meeting transcripts
* Slack messages
* Emails
* Jira tickets
* Customer feedback
* Interview notes
* Operating metrics
* Strategy documents
* Org charts

### Rules

* Evidence may support beliefs.
* Evidence should preserve source traceability.
* Evidence should not directly produce mechanisms, capability assessments, theories, or executive conclusions.

### Organism Representation

Evidence appears as incoming signals.

It should be visually transient.

Evidence enters the organism, influences understanding, and then recedes behind the modeled cognitive state.

---

## 2. Beliefs

### Question Answered

What appears to be true?

### Responsibility

Beliefs are localized organizational observations inferred from evidence.

A belief should usually be expressible in one sentence.

### Examples

* Approvals require executive review.
* Scheduling priorities frequently change.
* Departments disagree about ownership.
* Customer issues are escalated late.
* Project status is inconsistently communicated.

### Rules

* Beliefs are observations, not explanations.
* Beliefs should be grounded in evidence.
* Beliefs may be uncertain.
* Beliefs may be strengthened, weakened, or revised over time.
* Beliefs produce patterns through generalization.
* Beliefs should not be treated as mechanisms.

### Organism Representation

Beliefs appear as small internal signals or nodes.

They are usually too granular for default executive display.

---

## 3. Patterns

### Question Answered

What repeats?

### Responsibility

Patterns represent recurring organizational behavior across multiple beliefs.

Patterns describe repetition.

They do not explain why the repetition exists.

### Examples

* Repeated approval delays
* Cross-functional disagreement
* Escalation loops
* Scheduling instability
* Knowledge bottlenecks
* Late-stage customer friction

### Rules

* Patterns emerge from multiple beliefs.
* Patterns describe recurring behavior.
* Patterns are not causes.
* Patterns should not be framed as organizational health.
* Patterns should be explainable by mechanisms.

### Organism Representation

Patterns appear as clusters, constellations, or stable recurring formations inside the organism.

They show that Discovery has detected repeated organizational behavior.

---

## 4. Mechanisms

### Question Answered

Why does this repeat?

### Responsibility

Mechanisms explain why patterns exist.

Mechanisms are Discovery's primary long-term cognitive objects.

A mechanism should explain multiple patterns simultaneously.

### Examples

* Decision Latency
* Governance Friction
* Execution Drag
* Knowledge Concentration
* Feedback Failure
* Priority Conflict
* Ownership Ambiguity

### Rules

* Mechanisms explain patterns, not isolated observations.
* A mechanism should usually connect to multiple patterns.
* Mechanisms should be canonicalized to avoid duplicate explanation-level mechanisms.
* Mechanisms may reinforce or suppress other mechanisms.
* Mechanisms should become durable memory objects over time.
* Mechanisms should not be confused with capability assessments.

### Organism Representation

Mechanisms appear as forces, distortions, pressures, or gravitational fields within the organism.

They shape how organizational behavior flows.

---

## 5. Organizational Theory

### Question Answered

How do mechanisms interact?

### Responsibility

Organizational theories model causal relationships between mechanisms and their effects on the organization.

Theories are causal organizational models.

### Examples

```text
Governance Friction
    ↓
Decision Latency
    ↓
Execution Drag
    ↓
Customer Friction
```

```text
Knowledge Concentration
    ↓
Execution Risk
    ↓
Planning Instability
```

### Rules

* Theories connect mechanisms into causal structures.
* Theories may explain effects across multiple capability areas.
* Discovery may generate competing theories when evidence is ambiguous.
* Theories should support executive understanding but should not replace it.
* Theories should be inspectable, but not necessarily exposed by default.

### Organism Representation

Theories appear as flows between organism regions.

They show how one part of the organization affects another.

---

## 6. Capability Assessment

### Question Answered

How healthy is this organizational ability?

### Responsibility

Capability Assessment evaluates organizational health.

It describes the condition of core organizational abilities based on the cognitive model.

Capability Assessment is not a cause.
Capability Assessment is not an explanation.
Capability Assessment is not another mechanism.

Mechanisms and Organizational Theories explain why a capability is healthy, stressed, improving, or declining.

### Examples

* Decision Making
* Execution
* Communication
* Planning
* Learning
* Governance
* Customer Responsiveness
* Adaptation

### Rules

* Capability Assessment evaluates health, vitality, or functional strength.
* Capability Assessment should be derived from mechanisms, theory, and supporting evidence.
* Capability Assessment should eventually contain measurable health signals.
* Capability Assessment should not duplicate mechanisms.
* Mechanisms explain why capabilities improve or degrade.
* Theories explain how multiple mechanisms interact to affect capabilities.
* Capability Assessment helps executives understand where the organization is strong, weak, or changing.

### Organism Representation

Capability Assessment appears as major organs, regions, or vital signs of the organism.

Its visual state may reflect health, activity, stress, confidence, or trend.

---

## 7. Executive Understanding

### Question Answered

What should leadership understand?

### Responsibility

Executive Understanding is the distilled expression of Discovery's cognitive model.

It translates evidence, beliefs, patterns, mechanisms, organizational theories, and capability assessments into leadership-relevant understanding.

### Examples

* Execution is slowing because governance centralizes too many approvals.
* Knowledge concentration increases execution risk.
* Customer friction originates upstream in scheduling instability.
* The organization is optimized for control at the expense of speed.

### Rules

* Executive Understanding should be concise.
* Executive Understanding should be grounded in the cognitive model.
* Executive Understanding should not expose every internal transformation.
* Executive Understanding should emphasize what matters, why it matters, and what leadership should watch.
* Executive Understanding is the primary user-facing output.

### Organism Representation

Executive Understanding appears as the organism's overall posture, state, or executive interpretation.

The organism should reveal what Discovery understands without exposing exactly how Discovery derived it.

---

## Cognitive Transformations

Discovery's ontology is defined not only by objects, but by transformations.

Each transformation has one semantic responsibility.

```text
Evidence
    ↓ Observation
Beliefs
    ↓ Generalization
Patterns
    ↓ Explanation
Mechanisms
    ↓ System Modeling
Organizational Theory
    ↓ Capability Assessment
Capability Assessment
    ↓ Executive Compression
Executive Understanding
```

---

## Transformation Rules

### Evidence → Beliefs

Transformation: Observation

Evidence supports localized beliefs about the organization.

Rule:

A belief must be traceable to evidence.

---

### Beliefs → Patterns

Transformation: Generalization

Multiple beliefs are generalized into recurring behavioral patterns.

Rule:

A pattern must represent repeated behavior, not a one-time event.

---

### Patterns → Mechanisms

Transformation: Explanation

Mechanisms explain why patterns exist.

Rule:

A mechanism should explain multiple patterns whenever possible.

---

### Mechanisms → Organizational Theory

Transformation: System Modeling

Mechanisms are assembled into causal organizational theories.

Rule:

A theory should explain how mechanisms interact across the organization.

---

### Organizational Theory → Capability Assessment

Transformation: Capability Assessment

The cognitive model is evaluated to determine the health of core organizational abilities.

Rule:

Capability Assessment describes health; mechanisms and theories explain causes.

---

### Capability Assessment → Executive Understanding

Transformation: Executive Compression

Capability Assessment and Organizational Theory are distilled into leadership-relevant understanding.

Rule:

Executive Understanding should communicate what matters without exposing unnecessary internal complexity.

---

## Deprecated or Demoted Concepts

### Organizational Phenomena

Organizational Phenomena should be replaced or absorbed by Patterns unless a separate semantic responsibility is clearly required.

Patterns answer:

What repeats?

If Phenomena answer the same question, they should not remain a top-level cognitive object.

---

### Understanding Clusters

Understanding Clusters should become implementation details.

They may support belief grouping, semantic similarity, and pattern formation, but they should not be treated as a primary cognitive layer.

---

### Semantic Concepts

Semantic Concepts should become a compression artifact or labeling aid.

They should not compete with beliefs, patterns, mechanisms, capability assessments, or theories.

---

## Semantic Compression

Semantic compression is not only a final pipeline stage.

Compression occurs throughout the ontology:

```text
Evidence compresses into Beliefs.
Beliefs compress into Patterns.
Patterns compress into Mechanisms.
Mechanisms compress into Organizational Theories.
Organizational Theories inform Capability Assessment.
Capability Assessment and Organizational Theories compress into Executive Understanding.
```

Semantic Compression may remain an implementation module, but conceptually it should serve the whole cognitive hierarchy.

---

## Organism Design Principle

The organism is not a diagram of Discovery's internal architecture.

The organism is a compressed visual projection of Discovery's modeled understanding of the business.

Internal ontology should remain proprietary.

The organism may expose:

* organizational health
* stress
* stability
* change
* relationships
* emerging risks
* areas of strength
* areas of friction
* confidence
* attention

The organism should not expose:

* the full cognitive hierarchy
* internal transformation logic
* raw mechanism construction logic
* proprietary reasoning structure
* implementation-level clustering
* confidence propagation details

---

## Public Product Language

The user-facing product should use simplified language.

Preferred exposed concepts:

* Organizational Health
* Areas of Strength
* Emerging Risks
* Sources of Friction
* Critical Relationships
* Understanding Confidence
* Executive Insights
* What Changed
* What Matters

Avoid exposing internal terms unless necessary:

* Beliefs
* Patterns
* Mechanism Candidates
* Mechanism Consolidation
* Cognitive Ontology
* Semantic Compression
* Internal Theory Graphs

---

## Design Invariants

Discovery should preserve these invariants:

1. Evidence describes what happened.
2. Beliefs describe what appears true.
3. Patterns describe what repeats.
4. Mechanisms explain why patterns exist.
5. Organizational Theories model how mechanisms interact.
6. Capability Assessment evaluates organizational health based on mechanisms and theories.
7. Executive Understanding communicates what leadership should understand.
8. The organism visualizes the modeled understanding, not the internal recipe.
9. Every top-level cognitive object must answer a distinct question.
10. New engines should strengthen the ontology, not create overlapping concepts.

---

## Sprint 17 Success Criteria

Sprint 17 succeeds when:

* every cognitive layer has one clearly defined purpose
* overlap between beliefs, patterns, capability assessments, mechanisms, and theories is minimized
* mechanisms explain patterns rather than observations
* capability assessment represents organizational health rather than causes
* organizational theories connect mechanisms into causal structures
* executive understanding becomes a distilled expression of the cognitive model
* deprecated concepts are either removed, renamed, or demoted to implementation details
* the ontology is stable enough to support a major UI/UX redesign in the following sprint

---

## Long-Term Direction

Discovery should increasingly resemble how experienced executives organize understanding.

Executives do not remember hundreds of observations.

They remember:

* recurring patterns
* enduring mechanisms
* causal theories
* organizational health
* executive-level understanding

Discovery's internal representation should progressively mirror that hierarchy while keeping the proprietary cognitive machinery hidden behind a simple, intuitive executive experience.
