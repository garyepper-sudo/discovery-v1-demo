# Phenomenon Architecture

**Status:** Proposed

---

# Purpose

This document defines the canonical architectural contract for Organizational Phenomena in Discovery.

It exists to resolve ambiguity between:

* a phenomenon as a synthesized organizational reality,
* a phenomenon as a classified organizational category,
* and a phenomenon as a precursor to causal explanation.

The Phenomenon layer belongs to the Perception Operating System.

It must remain distinct from Signals upstream and Mechanisms downstream.

---

# Canonical Definition

An **Organizational Phenomenon** is a synthesized representation of a recurring organizational reality that is supported by one or more reinforcing signals and is significant enough to require causal explanation.

A phenomenon answers:

> **What meaningful organizational reality appears to be occurring?**

A phenomenon does not answer:

> **Why is it occurring?**

Causal explanation belongs to the Mechanism layer.

---

# Position in the Cognitive Pipeline

```text
Evidence

↓

Observation

↓

Signal

↓

Contradiction

↓

Organizational Phenomenon

↓

Mechanism

↓

Belief

↓

Concept

↓

Theory
```

The Phenomenon layer transforms lower-level perceptual indicators into a coherent representation of organizational reality.

---

# Architectural Boundary

## Signal

A Signal is a meaningful organizational indicator supported by observations.

A Signal answers:

> What indicator is emerging?

Examples:

* approval time is increasing,
* work is repeatedly escalated,
* documentation is distributed across systems,
* teams are repeating previously completed work.

## Organizational Phenomenon

A Phenomenon synthesizes one or more related signals into a coherent organizational reality.

A Phenomenon answers:

> What recurring organizational reality do these signals collectively indicate?

Examples:

* routine work is accumulating around centralized approval points,
* critical knowledge is becoming inaccessible across team boundaries,
* teams are repeatedly recreating work because prior learning is not reusable.

## Mechanism

A Mechanism explains why the phenomenon exists or persists.

A Mechanism answers:

> What causal organizational process is producing this reality?

Examples:

* centralized governance,
* unclear decision rights,
* weak knowledge transfer,
* fragmented documentation practices,
* accountability gaps.

---

# Phenomenon Identity

A phenomenon must not be identified solely by its taxonomy type.

Its identity should be based on the synthesized organizational reality it represents.

Two phenomena with the same classification type may remain distinct when they:

* affect different organizational entities,
* arise from different signal groups,
* occur in different operating contexts,
* represent different recurring realities,
* or require different causal explanations.

Two phenomena should be merged only when benchmark evidence shows they represent the same organizational reality.

---

# Classification

`OrganizationalPhenomenonType` is classification metadata.

It supports:

* organization,
* comparison,
* retrieval,
* benchmark analysis,
* downstream mechanism candidate selection,
* and executive communication.

The classification is not, by itself, the phenomenon.

The canonical production flow is:

```text
Signals and contradictions

↓

Synthesize organizational reality

↓

Classify synthesized reality

↓

Produce Organizational Phenomenon
```

Classification must not replace synthesis.

---

# Canonical Inputs

The Phenomenon Engine may consume:

* Organizational Signals,
* Organizational Contradictions,
* Organizational Patterns derived from observations and signals,
* Understanding clusters when they preserve traceable signal ancestry,
* prior Phenomena state for longitudinal continuity.

Every produced phenomenon must retain traceability to its perceptual inputs.

---

# Canonical Output

The canonical output is an `OrganizationalPhenomenon`.

Every phenomenon should include:

* a stable identifier,
* a synthesized label,
* a synthesized description,
* classification type,
* supporting signal references,
* supporting pattern references when applicable,
* supporting understanding references when applicable,
* related organizational entities,
* confidence,
* strength,
* longitudinal status,
* executive meaning,
* evidence summary,
* candidate mechanism types,
* first detected timestamp,
* last updated timestamp.

---

# Synthesis Requirements

A valid phenomenon should:

1. represent a coherent organizational reality,
2. be supported by traceable perceptual inputs,
3. remain distinct from causal explanation,
4. preserve uncertainty,
5. remain stable enough for longitudinal comparison,
6. avoid duplicating an existing phenomenon unless the realities are meaningfully distinct.

A phenomenon may be supported by a single high-quality signal when evidence is unusually strong, but multiple reinforcing signals should increase confidence and stability.

---

# Deduplication Rules

Phenomena must not be deduplicated solely by `OrganizationalPhenomenonType`.

Deduplication should consider:

* semantic similarity,
* shared signal ancestry,
* shared pattern ancestry,
* related entity overlap,
* organizational context,
* temporal overlap,
* and whether the inferred realities require the same causal explanation.

The engine should merge phenomena only when they represent the same underlying organizational reality.

When uncertainty remains, preserving two distinct phenomena is preferable to silently collapsing materially different realities.

---

# Longitudinal Lifecycle

A phenomenon may be:

* emerging,
* strengthening,
* stable,
* weakening,
* fragmented.

Lifecycle updates should be based on changes in:

* signal support,
* evidence quality,
* confidence,
* strength,
* entity scope,
* contradictory evidence,
* and persistence over time.

A prior phenomenon should be refreshed only when the new perceptual inputs represent the same organizational reality.

---

# Relationship to Mechanisms

Phenomena are inputs to Mechanism formation.

`possibleMechanismTypes` represents candidate causal explanations.

These candidates must not be treated as confirmed mechanisms.

The Mechanism Engine remains responsible for determining:

* which causal process is operating,
* how strongly it is supported,
* what evidence confirms it,
* and what alternative explanations remain plausible.

---

# Relationship to Executive Projection

Phenomena may be communicated through Executive Projection.

Projection transports the canonical phenomenon.

Narrative may explain:

* what is occurring,
* why it matters,
* how confident Discovery is,
* what evidence supports it,
* and what causal explanation remains uncertain.

Projection and presentation must not recreate phenomenon synthesis.

---

# Canonical Producer

The canonical producer is currently:

```text
engine/v3/phenomena/inferOrganizationalPhenomena.ts
```

The producer is responsible for:

* synthesizing organizational realities,
* classifying those realities,
* preserving perceptual traceability,
* assigning longitudinal identity,
* and avoiding invalid deduplication.

The producer must remain the sole canonical producer of Organizational Phenomena.

---

# Current Architectural Risk

The current implementation may identify and deduplicate Phenomena primarily by `OrganizationalPhenomenonType`.

This can cause:

* distinct organizational realities to be collapsed,
* classification to substitute for synthesis,
* signal support to be discarded during deduplication,
* pattern-driven and cluster-driven phenomena to overwrite one another,
* and downstream mechanisms to receive an incomplete representation of organizational reality.

This is an architectural finding, not yet a confirmed implementation defect.

It must be validated through benchmark evidence before changing the producer.

---

# Benchmark Requirements

The Phenomenon layer should be validated through a dedicated semantic benchmark.

The benchmark should verify:

* every phenomenon has traceable signal ancestry,
* the phenomenon describes an organizational reality rather than a cause,
* classification is consistent with the synthesized reality,
* equivalent realities merge correctly,
* distinct realities are not collapsed because they share a type,
* reinforcing signals increase support,
* contradictory signals reduce confidence or fragment the phenomenon,
* longitudinal updates preserve identity correctly,
* candidate mechanisms remain unconfirmed,
* downstream mechanisms consume the canonical phenomenon.

The existing Cognitive Layer Validation benchmark should continue validating pipeline presence and handoff integrity.

It should not be treated as semantic validation of the Phenomenon layer.

---

# Architectural Invariants

* Every Organizational Phenomenon is supported by perceptual inputs.
* Every Organizational Phenomenon has one canonical producer.
* Phenomenon synthesis occurs before classification.
* Classification does not define phenomenon identity.
* Phenomena do not contain confirmed causal explanations.
* Mechanisms consume Phenomena.
* Projection transports Phenomena.
* Presentation does not recreate Phenomena.
* Phenomena are merged only when they represent the same organizational reality.
* Benchmark evidence governs changes to the Phenomenon architecture.

---

# Validation Decision

No implementation change should be made until a Phenomenon Semantic Validation benchmark demonstrates at least one of the following:

* distinct realities are incorrectly collapsed,
* equivalent realities are incorrectly duplicated,
* classification replaces synthesis,
* signal ancestry is lost,
* longitudinal identity is incorrect,
* or downstream mechanism formation is materially degraded.

Until then, the current producer should be treated as a potentially incomplete but functioning implementation of the Phenomenon contract.
