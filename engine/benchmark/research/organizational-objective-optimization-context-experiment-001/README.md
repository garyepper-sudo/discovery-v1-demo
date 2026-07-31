# Organizational Objective and Optimization Context Experiment 001

## Status

Benchmark-only Phase 2D contract research. It does not export production code,
generate an Objective Recommendation, mutate Runtime, or authorize persistence.

## Question

Does `Organizational Understanding + Organizational Objective + Optimization
Context` provide the smallest sufficient governed input model for future
Objective Recommendation generation?

## Method

- 41 deterministic scenarios, including three negative controls and a wording
  perturbation.
- Current Phase 2C.2 baseline plus Architectures A–G.
- Explicit penalties for missing semantics and unnecessary object complexity.
- Separate comparison of full-form, fixed-question, and value-of-information
  adaptive elicitation.
- No Recommendation candidates, Runtime reads/writes, cognition, persistence,
  or frontend imports.

## Architectures

- A: Understanding + Objective.
- B: Objective plus loose context parameters.
- C: Objective plus structured Optimization Context.
- D: C plus a separate Operating Context object.
- E: Objective-first policy.
- F: Understanding-first policy.
- G: balanced governed policy.

## Promotion boundary

The benchmark may support contract design. It cannot establish real-world
objective legitimacy, stakeholder utility, causal validity, willingness to
pay, calibrated outcome forecasts, or implementation readiness.

Run:

```text
npm run experiment:organizational-objective-optimization-context-001
npm run validate:organizational-objective-optimization-context-001
```
