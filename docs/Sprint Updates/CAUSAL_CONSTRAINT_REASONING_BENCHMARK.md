# Causal Constraint Reasoning Benchmark

**Status:** Sprint 116 complete

**Scope:** Benchmark infrastructure only

**Production behavior:** Unchanged

## Capability-gap diagnosis

Discovery currently:

- composes cognitive support into Organizational Conditions;
- describes relationships among Conditions;
- ranks Condition significance;
- calculates a separate primary-constraint leverage score; and
- projects a selected primary Executive Constraint.

It does not explicitly interpret which observed Condition causes or reinforces another, distinguish a root from its downstream symptoms, or test which candidate's removal would weaken the greatest part of the observed causal structure.

Sprint 115 showed the result: Decision Flow existed in every fixture but production leverage selected it in 0/14 cases. Confidence, support quality, Mechanism specificity, and both existing leverage models could not recover it reliably.

## Causal Constraint Reasoning design

The benchmark evaluates one coherent capability rather than another ranking formula.

```text
Explicit causal observation
  → identify cause and effect Conditions
  → construct a directed Condition graph
  → eliminate Conditions with an observed upstream cause
  → calculate transitive downstream consequences
  → select the remaining root with greatest causal reach
  → identify the intervention family for that root
  → preserve observations, evidence ancestry, inference, and uncertainty separately
```

Selection is lexicographic and graph-based:

1. retain candidates with no observed incoming causal edge;
2. prefer the candidate that reaches the most downstream Conditions;
3. prefer the candidate with more direct causal relationships;
4. use stable Condition identity only as a final deterministic tie-break.

This is not a weighted sum over confidence, strength, priority, leverage, support breadth, or evidence volume.

The graph permits a within-Condition causal mechanism, such as excessive concurrent work causing perceived execution-capacity shortage. Such a relationship identifies an internal root mechanism without treating the Condition as downstream of itself.

## Experimental policies

| Policy | Behavior |
|---|---|
| B0 | Current production reasoning and primary-constraint selection |
| B1 | Construct and evaluate the causal graph while preserving the production primary constraint |
| B2 | Use the causal graph to select the primary constraint and aligned intervention family |

B1 and B2 are benchmark-local. They do not modify production output or Runtime.

## Hidden causal fixture suite

Hidden labels are retained outside pipeline input and used only for scoring.

The 12 core cases cover:

1. decision ambiguity causing coordination delay and execution overload;
2. concurrent work causing perceived capacity shortage;
3. leadership dependency causing slow decisions and accountability gaps;
4. knowledge fragmentation causing rework and inconsistent execution;
5. incentive conflict causing local optimization and friction;
6. process weakness downstream of ownership ambiguity;
7. strategic-alignment symptoms masking Decision Flow;
8. a genuinely broad strategic root beating a narrow symptom;
9. interacting constraints with one causally upstream;
10. sparse evidence with one decisive mechanism;
11. contradictory but non-decisive evidence; and
12. an industry-neutral structural variant.

Additional forward/reverse evidence and source-order controls are excluded from accuracy denominators.

The suite spans manufacturing, software, professional services, biotechnology, financial services, logistics, consumer goods, energy, healthcare, hospitality, retail, and education.

## Production-versus-capability results

| Policy | Root mechanism | Primary constraint | Cause vs symptom | Causal-chain accuracy | Irrelevant rejection | Intervention alignment | Upstream intervention |
|---|---:|---:|---:|---:|---:|---:|---:|
| B0 | 2/12 | 2/12 | 2/12 | 0.000 | 10/12 | 12/12 | 0/12 |
| B1 | 12/12 | 2/12 | 2/12 | 0.958 | 10/12 | 12/12 | 0/12 |
| B2 | 12/12 | 12/12 | 12/12 | 0.958 | 12/12 | 12/12 | 12/12 |

B1 demonstrates that causal interpretation can recover the root structure without changing the production selector. B2 demonstrates that the interpreted structure can select the correct root and intervention family.

## Mechanism accuracy

Production identifies the hidden root mechanism in 2/12 cases.

Causal graph interpretation identifies it in 12/12. It uses industry-agnostic Condition semantics and explicit causal relationships; it does not receive the hidden mechanism label.

## Primary-constraint accuracy

Production selects the true primary constraint in 2/12 cases.

B2 selects it in 12/12, exceeding the 80% success threshold and improving accuracy by 83 percentage points.

The gain is not produced by changing confidence, strength, priority, leverage, or support weights.

## Cause-versus-symptom accuracy

B2 distinguishes the upstream cause from downstream symptoms in 12/12 cases.

It correctly handles both directions required by the suite:

- narrow upstream roots beating broad downstream symptoms; and
- a genuinely broad Strategic Alignment root beating narrower Decision Flow and Coordination symptoms.

## Intervention accuracy

Recommendation-family alignment is 12/12 for all policies. Production already often generates an intervention in the correct family even when its selected primary constraint is wrong.

B2 improves a different property: its intervention explicitly targets the selected upstream cause in 12/12 cases. Production does so in 0/12 under the benchmark's primary-constraint trace.

## Explanation quality

| Measure | B1 | B2 |
|---|---:|---:|
| Downstream consequence chain coherent | 11/12 | 11/12 |
| Evidence ancestry preserved | 12/12 | 12/12 |
| Observations separated from inference | 12/12 | 12/12 |
| Appropriate uncertainty | 12/12 | 12/12 |

The leadership-dependency case misses one secondary Decision Flow-to-Coordination edge. It still selects the correct root and intervention, but the incomplete downstream chain remains a concrete production-shadow risk.

Explanations identify:

- the selected root;
- why it is upstream;
- its inferred downstream effects;
- the exact evidence records supporting the graph; and
- uncertainty when only one causal relationship is available.

## Generalization

The capability preserves the same causal structure across the industrial and education variants despite different industry context and surface wording.

It also succeeds across 12 industries and multiple causal expressions:

- causes;
- leads to;
- results in;
- reinforces; and
- is downstream of.

Cross-industry generalization: PASS.

## Determinism and isolation

- repeated production and benchmark-local runs are byte-identical;
- reversed evidence order is equivalent after normalization;
- reversed source order is equivalent after normalization;
- evidence ancestry remains stable;
- organization and cognitive identities remain stable;
- Runtime is not persisted;
- canonical fixtures are unchanged;
- no provider is called; and
- production output is unchanged.

## Classification

### A — Breakthrough capability

Causal Constraint Reasoning raises true primary-constraint accuracy from 2/12 to 12/12, root-mechanism accuracy from 2/12 to 12/12, and cause-versus-symptom accuracy from 2/12 to 12/12 while preserving intervention-family alignment, ancestry, determinism, and cross-industry structure.

The benchmark meets the target performance range.

## Recommendation

Authorize a separate production-shadow sprint, not direct production integration.

That sprint should:

- consume existing Mechanisms, Conditions, and preserved evidence ancestry;
- create no persistent Runtime object initially;
- compare causal-root selection with production primary-constraint selection;
- test less explicit causal language and multi-cause structures;
- preserve uncertainty when causal direction is ambiguous; and
- verify the incomplete leadership-dependency consequence chain.

Do not replace production primary-constraint selection until the production shadow reproduces the benchmark gain on broader held-out language.
