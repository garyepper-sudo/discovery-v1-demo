# Primary Constraint Ranking Ground-Truth Benchmark

**Status:** Sprint 115 complete

**Scope:** Benchmark infrastructure only

**Production behavior:** Unchanged

## Question

Given a corrected Signal shadow and known hidden ground truth, why does the engine fail to rank the true organizational condition as the primary constraint?

## Production call graph

```text
evolveOrganizationRuntime()
  → inferOrganizationalConditions()
    → match Concepts, Beliefs, Mechanisms, Theories, and evolution to each Condition definition
    → Condition confidence = average confidence across matched cognitive layers
    → Condition strength = confidence 65% + support breadth 27% + continuity 8%
    → derive status, trend, and priority
    → rankOrganizationalCondition()
      → strength 24%
      → confidence 18%
      → priority 20%
      → status 16%
      → trend 8%
      → support breadth 14%
  → buildPrimaryExecutiveConstraint()
    → calculateLeverageScore()
      → priority 28%
      → status 14%
      → trend 14%
      → confidence 14%
      → strength 14%
      → downstream breadth 12%
      → support breadth 4%
    → sort by leverage
    → tie-break by priority, confidence, strength, downstream count, condition id
```

`buildPrimaryExecutiveConstraint()` owns the selected Executive Primary Constraint.

`rankExecutiveConstraint()` is a separate existing ranking function used when Organizational State selects dominant Conditions. It combines Condition significance, downstream leverage, and root-constraint position, but it does not own `primaryExecutiveConstraint`.

## Experimental boundary

The benchmark compares only:

- P0: production cognition and production ranking; and
- P1: the Sprint 112 Signal-only independent-source shadow.

Theme and Mechanism Evidence Independence are excluded.

Against P1, five ranking diagnostics are applied independently:

| Policy | Isolated ranking question |
|---|---|
| R0 | What does the production primary-constraint selector choose? |
| R1 | What would confidence alone choose? |
| R2 | What would independent support ancestry alone choose? |
| R3 | What would generic Mechanism specificity alone choose? |
| R4 | What would the existing `rankExecutiveConstraint()` leverage model choose? |

These are diagnostic shadows, not candidate production formulas.

## Hidden-ground-truth fixture

The pipeline receives only the organizational question and synthetic evidence. Hidden labels are used only after execution.

The fixture identifies:

- decision-authority ambiguity as the true mechanism;
- Decision Flow as the true Condition and primary constraint;
- Coordination System, Execution Capacity, and Leadership Dependency as plausible secondary Conditions;
- Execution Capacity as the plausible volume-dominant symptom;
- three independent true sources;
- duplicate-heavy staffing evidence from one source;
- irrelevant and non-decisive contradictory evidence; and
- decision-authority, delegation, or approval reduction as the expected recommendation family.

Fourteen cases cover all required scenarios, including forward and reversed order controls and a dedicated equal-score tie probe.

## Policy results

| Policy | Correct primary constraint | Mean true rank | MRR | Mean false-Condition rank | Leverage aligned | Explanation fidelity | Recommendation alignment |
|---|---:|---:|---:|---:|---:|---:|---:|
| P0 + R0 | 0/14 | 4.14 | 0.270 | 7.57 | 0/14 | 11/14 | 14/14 |
| P1 + R0 | 0/14 | 4.21 | 0.269 | 7.29 | 0/14 | 10/14 | 14/14 |
| P1 + R1 | 0/14 | 6.43 | 0.160 | 3.79 | 0/14 | 14/14 | 14/14 |
| P1 + R2 | 0/14 | 2.29 | 0.464 | 3.36 | 0/14 | 0/14 | 14/14 |
| P1 + R3 | 6/14 | 2.00 | 0.655 | 4.00 | 0/14 | 6/14 | 14/14 |
| P1 + R4 | 0/14 | 3.57 | 0.302 | 6.07 | 0/14 | 12/14 | 14/14 |

## Condition-rank analysis

Under P1 + R0, Decision Flow averages rank 4.21 and never wins.

Production winners are distributed across:

- Strategic Alignment;
- Knowledge Continuity;
- Leadership Dependency; and
- Operating Model.

The designated volume-dominant symptom, Execution Capacity, averages rank 7.29. Raw symptom volume is therefore not the direct cause of the primary-selection failure in this fixture.

Confidence-only ranking makes the true Condition materially worse, moving its mean rank to 6.43. Poor confidence calibration contributes to the result, but confidence alone is not the complete explanation.

Independent-support ranking moves Decision Flow consistently to rank 2 but never rank 1. Support quality therefore recovers substantial causal signal without resolving selection.

Generic Mechanism-specificity ranking is best at 6/14 with an MRR of 0.679. It demonstrates that broad Conditions are absorbing more general cognitive support than the causally specific Decision Flow condition. Its incomplete accuracy and explanation coverage show that specificity is not a sufficient standalone repair.

## Primary-constraint diagnosis

The production selector is driven by a composite leverage score in which 70% comes from priority, status, trend, confidence, and strength. Those inputs are themselves derived from broad semantic matching and support composition.

Decision Flow has the highest production leverage in 0/14 cases. This is not primarily a final sort or tie-break failure: its R0 score is already lower before tie-breaking in every natural scenario.

The separately existing `rankExecutiveConstraint()` model improves mean rank from 4.21 to 3.57 but also selects Decision Flow in 0/14 cases. Changing which existing leverage function owns selection would not resolve the benchmark.

## Tie-breaking analysis

No natural fixture case reaches an exact R0 score tie. A bounded probe using two pipeline-produced Condition candidates with equalized existing ranking inputs confirms the production path resolves the final tie by ascending stable Condition ID.

The probe selects `condition-a-tie` over `condition-z-tie` deterministically. Tie-breaking is stable and is not responsible for the measured 0/14 result.

## Cause versus symptom

The benchmark rules out a single simple cause:

1. Confidence-only ranking performs worse.
2. Independent support improves rank but not selection.
3. Mechanism specificity improves selection in only 6/14 cases.
4. Existing constraint leverage improves rank modestly but never selects the truth.
5. The false volume-dominant symptom does not systematically win.
6. Stable ID tie-breaking is not reached in the natural failures.
7. Decision Flow is present in every scenario, so the ontology can express the hidden truth.

The remaining loss occurs across Condition composition and primary leverage: broad Conditions acquire strong confidence, status, priority, and strength from shared cognitive objects, while causal specificity and independent ancestry are not represented in the primary selector.

## Recommendation impact

Recommendation-family alignment remains 14/14 across the diagnostic policies because the benchmark does not replace production recommendations. Risks and opportunities remain unchanged. Shadow rankings are scored without projecting them into production output.

No executive output movement is described as improvement.

## Determinism and isolation

- repeated P0 and P1 runs are byte-identical;
- reversed evidence order is equivalent after input normalization;
- reversed source order is equivalent after input normalization;
- Condition, evidence, and organization identities remain stable;
- evidence ancestry remains intact;
- no Runtime is persisted;
- no canonical fixture is mutated;
- no provider is called; and
- production output is unchanged.

## Classification

### D — Mixed or unsafe

Mechanism specificity is the strongest isolated diagnostic, but it resolves only 6/14 cases. Independent support improves rank without producing a winner, confidence-only ranking regresses, and both existing leverage models fail.

Multiple Condition-composition and leverage inputs interact. The evidence does not justify a narrow production ranking change.

## Recommended next sprint

Do not modify production primary-constraint ranking.

The next benchmark should isolate why broad Condition definitions accumulate shared Concepts, Beliefs, Mechanisms, and Theories more readily than the more causally specific Decision Flow condition. It should compare Condition support assignment and semantic specificity before confidence, strength, priority, and leverage are calculated.

No new evidence-weighting policy should be introduced.
