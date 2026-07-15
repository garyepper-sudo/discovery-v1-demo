# Discovery Organizational Theory

## Purpose

Organizational Theory is Discovery's highest-order cognitive model.

Beliefs describe observations.

Patterns describe recurring behavior.

Mechanisms explain why those patterns exist.

Organizational Theory explains how multiple mechanisms interact to produce the organization's behavior.

It is the first level where Discovery begins reasoning about the organization as an integrated system rather than as individual mechanisms.

---

# Core Question

Every cognitive layer answers one question.

Organizational Theory answers:

> **How does this organization work?**

This is different from:

* What happened?
* What appears true?
* What repeats?
* Why does this repeat?

Organizational Theory answers:

> **How do all of these mechanisms work together to create organizational behavior?**

---

# Organizational Theory Is A Model

An Organizational Theory is not:

* a summary
* a recommendation
* a capability score
* a list of mechanisms

It is a causal explanation.

Example:

```text
Governance Friction
        ↓
Decision Latency
        ↓
Execution Drag
        ↓
Customer Friction
```

That is a theory.

---

# Multiple Theories May Exist

Discovery should never assume there is only one explanation.

Organizations often have competing explanations.

Example:

## Theory A

```text
Governance Friction
        ↓
Decision Latency
        ↓
Execution Drag
```

Confidence

91%

---

## Theory B

```text
Knowledge Concentration
        ↓
Planning Instability
        ↓
Execution Drag
```

Confidence

73%

Both theories may be simultaneously valid.

Discovery should preserve competing explanations until evidence resolves them.

---

# Organizational Theory Is A Graph

Conceptually:

```text
Mechanism

↓

Mechanism

↓

Mechanism

↓

Mechanism
```

Each node is a canonical mechanism.

Each edge represents a causal influence.

Unlike the mechanism network, theory edges represent explanatory relationships rather than similarity.

---

# Theory Objects

A future OrganizationalTheory object may contain:

```ts
type OrganizationalTheory = {

    id

    title

    summary

    confidence

    mechanisms

    rootMechanismIds

    downstreamMechanismIds

    capabilityImpacts

    supportingPatternIds

    supportingBeliefIds

    supportingEvidenceIds

    competingTheoryIds

    executiveSummary
}
```

This should evolve over time rather than be implemented immediately.

---

# Theory Formation

Theories emerge through successive abstraction.

```text
Evidence

↓

Beliefs

↓

Patterns

↓

Mechanisms

↓

Theory
```

Each stage compresses organizational complexity.

Theory is therefore not another inference engine.

It is the organization of previously discovered mechanisms into coherent causal structures.

---

# Capability Assessment

Capability Assessment should never invent explanations.

Instead:

```text
Theory

↓

Capability Assessment
```

Example:

Theory

```text
Governance Friction

↓

Decision Latency

↓

Execution Drag
```

Capability Assessment

```text
Execution

Health

61%

Reason

Decision Latency produced by Governance Friction
```

Capability Assessment evaluates.

Theory explains.

---

# Executive Understanding

Executive Understanding compresses one or more Organizational Theories.

Example:

Theory

```text
Governance Friction

↓

Decision Latency

↓

Execution Drag
```

Executive Understanding

```text
Execution is slowing because governance
centralizes too many approvals.
```

The executive should not need to inspect the theory to benefit from it.

The theory exists so Discovery can explain itself whenever necessary.

---

# Theory Evolution

Theories are living cognitive objects.

Discovery should eventually:

* strengthen theories
* weaken theories
* merge theories
* split theories
* retire theories
* generate competing theories

Theory evolution is expected as organizations change.

---

# Theory Memory

Discovery should preserve historical theories.

Future capabilities include:

* What changed?
* Why did the dominant theory change?
* Which mechanism disappeared?
* Which mechanism emerged?
* Which theory became stronger?
* What organizational event caused the shift?

This becomes organizational memory.

---

# Relationship To The Organism

The organism should not display theories directly.

Instead:

Mechanisms become stable structures.

Theory becomes the invisible force organizing those structures.

The organism's overall architecture should emerge from the dominant organizational theories without revealing Discovery's internal reasoning.

This preserves the proprietary cognitive model while providing intuitive visual understanding.

---

# Relationship To Capability Assessment

Organizational Theory builds understanding.

Capability Assessment evaluates health.

These are separate responsibilities.

Theory explains.

Capability Assessment measures.

---

# Design Invariants

Discovery should preserve the following:

1. Every theory connects multiple mechanisms.
2. Every mechanism may belong to multiple theories.
3. Competing theories may coexist.
4. Theories explain capability health.
5. Executive Understanding compresses theories rather than replacing them.
6. Theory should remain inspectable.
7. Theory should evolve over time.
8. Theory should become one of Discovery's primary long-term memory objects.

---

# Long-Term Vision

Today Discovery discovers mechanisms.

Tomorrow Discovery will discover organizational theories.

Eventually Discovery will maintain an evolving scientific model of how an organization functions.

That model becomes the organization's institutional understanding.

Executives change.

Employees leave.

Processes evolve.

The theory endures, improving as Discovery accumulates evidence over time.

This is one of the defining capabilities of an Organizational Cognition Engine.
