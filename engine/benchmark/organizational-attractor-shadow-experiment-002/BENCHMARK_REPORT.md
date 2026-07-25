# Organizational Attractor Shadow Experiment 002 — Benchmark Report

## Executive summary

**Classification: B — Compression value only**

Candidate Attractor and the Full Canonical Combined Baseline both achieve:

- prediction accuracy: `1.000000`;
- restoration detection: `1.000000`;
- abstention quality: `1.000000`;
- zero negative-control false positives;
- correct genuine-transition handling.

Candidate Attractor does not outperform the combined baseline on the decisive
conditional-restoration target. It therefore fails the principal architectural
gate.

The candidate provides a compact lineage- and falsification-bearing
representation. That may be useful for research traces or projection, but it
does not justify a separate cognitive layer.

## Methodology

Seven synthetic, production-shaped histories are divided into:

```text
Inference window
→ deterministic prediction registration
→ held-out future reveal
→ scoring
```

Every model registers a trigger, predicted Condition, confidence, supporting
artifact identities, and falsification condition before the future outcome is
revealed.

Fixed rules are shared across every leave-one-out fold. No threshold is tuned
against a held-out answer.

## Fixture provenance

The fixtures import production type shapes for:

- `V3Mechanism`;
- `V3Contradiction`;
- `OrganizationalCondition`;
- `OrganizationalState`.

Genuinely production-derived structure:

- stable artifact identities;
- Mechanism cause/process/effect, confidence, stability, and Evidence lineage;
- Contradiction identity, explanation, confidence, and opposing Evidence;
- Condition identity, status, trend, confidence, and Mechanism ancestry;
- Organizational State identity, confidence, and dominant Conditions;
- dated snapshots.

Remaining benchmark-owned abstractions:

- synthetic organizational content;
- snapshot groupings and dates;
- fixed temporal inference thresholds;
- scoring-only family classifications;
- held-out future outcomes.

No production or canonical Runtime fixture is copied or modified.

## Leakage audit

All programmatic checks pass:

| Check | Result |
| --- | --- |
| No answer-bearing fields in inference fixtures | PASS |
| Opaque scenario IDs | PASS |
| Scoring truth stored separately | PASS |
| Future outcomes withheld during registration | PASS |
| Combined and Attractor input hashes equal | PASS |
| Registered predictions exclude scoring fields | PASS |

Direct answers:

- Expected attractors cannot be reconstructed from scenario names or scoring
  fields because neither is available to inference.
- No inference field says restoration occurred or supplies a target direction.
- Candidate Attractor receives no information unavailable to Combined.
- Expected outcomes are not supplied until after registration.
- Scenario IDs are opaque.
- Synthetic semantic alignment remains a construct risk: Mechanism effects use
  Condition-oriented language and the rules share the fixture ontology.

This residual risk limits external validity but is not direct answer leakage.

## Scenario results

| Scenario | Family | Combined | Attractor | Result |
| --- | --- | --- | --- | --- |
| 001 | restoration after temporary change | predicts centralization | predicts centralization | both correct |
| 002 | genuine structural transition | predicts distribution | predicts distribution | both correct |
| 003 | competing tendencies | abstains | abstains | both correct |
| 004 | unstable shocks | abstains | abstains | both correct |
| 005 | recurrence without mechanisms | abstains | abstains | both correct |
| 006 | mechanisms without temporal support | abstains | abstains | both correct |
| 007 | contradictory contextual dynamics | abstains | abstains | both correct |

The candidate neither invents a universal direction nor treats historical
persistence as destiny.

## Model comparison

| Model | Accuracy | Abstention | Calibration error | Total |
| --- | ---: | ---: | ---: | ---: |
| Organizational State | 0.428571 | 0.571429 | 0.700000 | 56.457135 |
| Mechanisms | 0.714286 | 0.714286 | 0.429086 | 79.856118 |
| Full Canonical Combined | 1.000000 | 1.000000 | 0.338987 | 99.322026 |
| Candidate Attractor | 1.000000 | 1.000000 | 0.311844 | 99.376312 |

The small total-score difference comes from representation-specific
confidence calibration. It does not produce an additional correct prediction,
better restoration detection, or better abstention. It is not incremental
predictive value.

## Registered predictions

The deterministic machine-readable registration is available in
`RESULTS.json`. Each record includes:

- model and scenario identity;
- pre-reveal prediction identity;
- triggering condition;
- predicted outcome;
- confidence;
- supporting artifact identities;
- falsification condition;
- explicit abstention.

## Negative controls

The Attractor correctly abstains for all five non-selection cases:

- competing tendencies;
- unrelated instability;
- recurrence without restoring mechanisms;
- mechanisms without historical restoration;
- unresolved contradictory contexts.

False positives: `0`.

## Ablations

| Ablation | Accuracy | Total | Interpretation |
| --- | ---: | ---: | --- |
| Historical transitions removed | 0.714286 | 84.842872 | Temporal history supplies material value |
| Contradictions removed | 1.000000 | 99.376312 | These fixtures do not make Contradictions decisive |
| Weakening Conditions removed | 1.000000 | 99.376312 | Weakening fields improve auditability, not current predictions |
| Falsification removed | 1.000000 | 97.090600 | Accuracy is unchanged, but epistemic quality falls |
| Mechanism confidence removed | 1.000000 | 99.367658 | Identity and temporal structure dominate confidence weighting |
| Latest State only | 0.714286 | 84.842872 | Current State cannot recover the full result |

The observed value depends on temporal structure. It does not depend on an
information advantage unique to Candidate Attractor because Combined uses the
same temporal structure and performs equally well.

## Determinism

- repeated-run byte identity: PASS;
- reversed scenario order: PASS;
- reversed artifact order: PASS;
- stable prediction registration: PASS;
- stable scores: PASS.

## Hard gates

Ten of eleven gates pass.

The failed gate is decisive:

```text
Candidate Attractor must outperform Full Canonical Combined.
```

It does not.

## Final questions

1. **Can Candidate Attractors be inferred without benchmark-owned direction
   labels?** Yes, inside production-shaped synthetic artifacts. Remaining
   ontology alignment limits generalization.
2. **Do they improve beyond Full Canonical Combined?** No.
3. **Is observed value due to temporal structure rather than information
   advantage?** Yes. Removing history reduces accuracy; both strongest models
   receive the same history.
4. **Can temporary perturbation and structural transition be distinguished?**
   Yes, equally by Combined and Attractor.
5. **Does the candidate abstain appropriately?** Yes, on all five applicable
   cases.
6. **Are predictions conditional, falsifiable, and grounded?** Yes.
7. **What does the concept deserve?** Projection- or research-format treatment,
   not a candidate producer audit or architectural integration.

## Architectural recommendation

Do not add Organizational Attractor to the canonical cognition chain.

Existing Mechanisms, Contradictions, Conditions, Organizational State, and
history already contain all predictive information demonstrated here. The
Attractor representation is useful compression: it packages target Condition,
restoring Mechanisms, temporal support, triggers, opposing artifacts,
implications, and falsification into one auditable view.

If pursued, treat it as an experimental projection or explanatory format over
canonical cognition. Do not create a new production cognitive object, Runtime
collection, or capability on the evidence of Experiment 002.
