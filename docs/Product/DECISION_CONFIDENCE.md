# Discovery Decision Confidence

**Status:** Canonical

---

# Purpose

This document defines how Discovery measures, communicates, and improves confidence.

Confidence is not a platform metric.

Confidence is attached to a specific executive decision.

The purpose of Decision Confidence is not to convince executives to trust Discovery.

The purpose is to help executives determine whether they are ready to make an important decision.

---

# Product Philosophy

Discovery should never communicate confidence as an isolated percentage.

Confidence only has meaning when executives understand:

- why confidence is high,
- why confidence is limited,
- what assumptions remain,
- how confidence can improve.

Confidence should always create better executive thinking.

---

# Decision Confidence

Decision Confidence answers one question.

> **How prepared are we to make this decision?**

Confidence belongs to the current decision.

Not the organization.

Not Discovery.

---

# Confidence Components

Every Decision contains four confidence states.

---

## Current Confidence

Discovery's current confidence in the recommendation.

This represents the quality of today's decision.

---

## Confidence Potential

The highest confidence Discovery believes is realistically achievable using currently available organizational information.

Confidence Potential is not 100%.

Some uncertainty always remains.

---

## Confidence Gap

Confidence Gap represents the remaining confidence available before reaching Confidence Potential.

Example

```
Current

82%

Potential

91%

Gap

9%
```

Discovery should always explain why the gap exists.

---

## Confidence Drivers

Confidence should never appear without explanation.

Discovery should identify:

- strongest supporting evidence,
- strongest assumptions,
- remaining uncertainty,
- competing explanations.

---

# Assumptions

Every recommendation depends upon assumptions.

Examples:

- customer demand remains stable,
- hiring can occur within ninety days,
- approval latency remains unchanged.

Discovery should explicitly expose important assumptions.

Assumptions are not weaknesses.

They are opportunities for validation.

---

# Validation

Discovery should never request generic uploads.

Instead Discovery should recommend validating one specific assumption.

Example

```
Current Confidence

82%

Remaining Assumption

Customer demand remains stable.

Suggested Validation

Current pipeline review

Estimated Confidence

89%
```

Discovery should always explain:

Why this information matters.

---

# Evidence Requests

Discovery never requests information because the AI needs more data.

Discovery requests information because a specific assumption limits the quality of the current decision.

Every evidence request should answer:

Why?

How much confidence could improve?

What assumption is being tested?

---

# Confidence Improvements

Discovery should always estimate the value of additional evidence.

Examples:

Engineering Retrospective

+4%

Operations Review

+7%

Customer Interviews

+9%

Discovery should prioritize information by expected decision improvement.

---

# Progressive Confidence

Confidence should increase naturally as executives collaborate with Discovery.

Example

```
Question

↓

Understanding

↓

Challenge

↓

Simulation

↓

Validation

↓

Confidence

↓

Decision
```

Confidence becomes a journey rather than a score.

---

# Executive Collaboration

Discovery should never make executives feel responsible for improving the AI.

Instead Discovery should invite executives to improve the current decision.

Example

Instead of:

"Upload more information."

Discovery says:

"One assumption remains uncertain.

Would you like to strengthen this decision?"

This distinction is fundamental.

---

# Immediate Learning

Discovery begins learning immediately.

Learning occurs through:

- executive disagreement,
- assumption validation,
- simulation choices,
- evidence selection,
- confidence improvements.

Discovery should improve continuously without requiring long implementation cycles.

---

# Product Goal

Executives should never leave Discovery wondering:

"Can I trust this recommendation?"

Instead they should leave thinking:

"I understand exactly why Discovery believes this.

I know what still remains uncertain.

I know what information would make this decision even stronger."

Confidence should become one of Discovery's strongest competitive advantages.
