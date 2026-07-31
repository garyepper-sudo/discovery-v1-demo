# Experiment 001 Report

**Classification:** A — Objective and Optimization Context contracts benchmark-supported

## Result

| Architecture | Correct disposition | Complexity-adjusted score |
|---|---:|---:|
| Current Phase 2C.2 | 0.073 | 0.161 |
| A — Objective only | 0.000 | 0.101 |
| B — Flat parameters | 0.000 | 0.021 |
| C — Structured Optimization Context | 1.000 | 0.800 |
| D — C plus Operating Context object | 1.000 | 0.600 |
| E — Objective-first | 0.756 | 0.635 |
| F — Understanding-first | 0.610 | 0.443 |
| G — Balanced governed | 1.000 | 0.800 |

Architecture C and governed policy G cover all synthetic authority, conflict,
context, governance, alternatives, Goodhart, distributional-harm, inference,
correction, and fallback conditions. Architecture D adds no accuracy and loses
complexity-adjusted value. Operating condition therefore remains represented
through Organizational Understanding plus Optimization Context references.

## Adaptive elicitation

| Strategy | Average questions | Missed material context | Correct disposition |
|---|---:|---:|---:|
| Full form | 12.000 | 0.000 | 1.000 |
| Three fixed questions | 3.000 | 0.732 | 0.366 |
| Adaptive value-of-information | 1.512 | 0.000 | 1.000 |

## Baseline delta

Structured contracts improve synthetic correct-disposition coverage from
`0.073` at the current Phase 2C.2 placeholder boundary to `1.000`. This gain is
caused by explicit authority, version, conflict, success-criterion, context,
alternatives, governance, distribution, and metric boundaries. It is not a
claim that a production generator will achieve these scores.

## Safety and isolation

- Objective Recommendation generation: 0
- Runtime reads/writes: 0 / 0
- Understanding mutations: 0
- Frontend imports or changes: 0
- Negative controls: 3
- Wording perturbations: stable

## Limitations

The evaluator measures whether an architecture can express and enforce authored
scenario requirements. Full coverage is partly structural and must not be read
as empirical recommendation quality, causal accuracy, stakeholder agreement,
or generalization to real organizations. Scenario labels do not affect scoring,
but the feature requirements remain human-authored. Live validation, authority
policy implementation, persistence, and outcome calibration remain unproven.
