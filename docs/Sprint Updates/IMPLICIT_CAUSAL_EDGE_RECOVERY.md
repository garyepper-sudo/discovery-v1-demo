# Implicit Causal Edge Recovery

**Status:** Sprint 118 complete

**Scope:** Benchmark-only production shadow

**Authoritative production behavior:** Unchanged

## Question

Can Discovery recover implicit intermediate causal relationships from existing production evidence and Mechanism ancestry without inventing edges in genuinely ambiguous cases?

## Edge-recovery design

```text
Sprint 117 observed edges
+ production Mechanisms
+ production Condition language
+ evidence ancestry
+ bounded temporal or consequential language
  → candidate intermediate edge
  → ancestry and direction validation
  → reverse-direction and cycle checks
  → accepted inferred edge or explained rejection
```

The shadow runs after production cognition and writes nothing back. Hidden truth is used only by scoring.

## Acceptance and abstention

A candidate requires:

1. distinct production-supported upstream and downstream Conditions;
2. connected production evidence and Mechanism ancestry;
3. explicit temporal or consequential direction;
4. no equally supported reverse direction;
5. no unsupported cycle;
6. evidence and Mechanism citations;
7. deterministic bounded acceptance; and
8. abstention when support is weak or direction remains ambiguous.

Weak language, equally supported reverse claims, closed feedback loops, equivalent roots, irrelevant shared vocabulary, and absent causal language retain abstention.

## Policies

| Policy | Behavior |
|---|---|
| E0 | Sprint 117 graph and shadow selection |
| E1 | Add bounded intermediate-edge interpretation while preserving E0 selection |
| E2 | Use accepted intermediate edges in shadow root selection |

No other policy variants were evaluated.

## Fixture and held-out design

The 18 accuracy scenarios cover:

- leadership dependency, decision flow, coordination, and capacity;
- ownership ambiguity and delayed decisions;
- knowledge fragmentation and rework;
- incentive conflict and local optimization;
- concurrent work and coordination overload;
- strategic ambiguity and execution churn;
- explicit intermediate-edge control;
- strong consequential and temporal paraphrases;
- weak insufficient support;
- ambiguous and reverse direction;
- feedback loops and multiple causes;
- irrelevant shared vocabulary;
- surface-language and industry-neutral variants; and
- held-out wording not used as a fixture-specific label.

Forward/reversed evidence-order and source-order controls are excluded from accuracy denominators.

## E0/E1/E2 comparison

| Policy | Missing-edge cases recovered | Edge precision | Edge recall | Direction | Primary constraint | Cause vs symptom | Abstention |
|---|---:|---:|---:|---:|---:|---:|---:|
| E0 | 11/18 | 1.000 | 0.714 | 18/18 | 16/18 | 16/18 | 16/18 |
| E1 | 15/18 | 1.000 | 0.857 | 18/18 | 16/18 | 16/18 | 16/18 |
| E2 | 15/18 | 1.000 | 0.857 | 18/18 | 17/18 | 17/18 | 17/18 |

E1 and E2 introduce no false edge and no unsupported cycle.

## Leadership-chain result

The target remains incomplete:

```text
Leadership Dependency → Decision Flow
Coordination System → Execution Capacity
```

The shadow still does not accept:

```text
Decision Flow → Coordination System
```

The evidence text is present, but the tested general recovery rule does not establish the required bridge through the available production-shaped ancestry without adding a fixture-specific exception.

No such exception was added.

## Harmful-correction and abstention analysis

- beneficial primary-constraint corrections: 1;
- harmful corrections: 0;
- unsupported edges: 0;
- unsupported cycles: 0;
- lost abstentions: 0;
- recommendation-family changes: 0;
- identity changes: 0; and
- Runtime or persistence effects: 0.

Weak support, ambiguous direction, an equally plausible reverse, feedback, multiple causes, and irrelevant shared vocabulary all abstain correctly.

## Explanation and ancestry fidelity

| Measure | Result |
|---|---:|
| Evidence ancestry preserved | 18/18 |
| Supporting Mechanisms cited | 18/18 |
| Observed and inferred edges distinguished | 18/18 |
| Uncertainty stated | 18/18 |
| Rejected candidates explained | 18/18 |

## Generalization and determinism

- consequential paraphrases execute deterministically;
- temporal paraphrases execute deterministically;
- surface-language variants pass;
- the industry-neutral variant passes;
- held-out wording passes;
- repeated replay is byte-identical;
- reversed evidence order is equivalent;
- reversed source order is equivalent;
- production recommendation and organization identity are unchanged;
- no Runtime is persisted; and
- canonical fixtures remain unchanged.

## Classification

### C — No meaningful improvement

Although E2 improves aggregate primary-constraint accuracy from 16/18 to 17/18 with no safety regression, it does not recover the authorized target edge. The result therefore does not establish the intended capability.

This is a negative benchmark result, not a production defect authorization.

## Recommendation

Do not authorize production integration of the tested recovery stage.

Abandon this specific bounded rule rather than add fixture-specific language or broaden semantic inference. Return to benchmark prioritization and choose a different measured reasoning limitation. Production cognition, Runtime, schemas, recommendations, and capability ownership should remain unchanged.
