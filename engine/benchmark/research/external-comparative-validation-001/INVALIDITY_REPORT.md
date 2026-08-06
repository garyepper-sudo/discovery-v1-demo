# External Comparative Validation 001 — Invalidity Report

## Classification

**F — Invalid or Blocked**

The frozen treatment run completed, but the Discovery shared-output adapter
failed to preserve canonical observable structures. The original raw result is
retained unchanged in `RESULTS.json`; it is non-evaluative.

## Blocking defect

Canonical Discovery runs reported internal contradiction and mechanism artifact
counts, including contradictions in every case-phase. The shared adapter emitted:

- zero observable contradictions in all 20 Discovery case-phases;
- zero uncertainty statements in all 20 Discovery case-phases;
- zero evidence-gap outputs in all 20 Discovery case-phases.

The adapter assumed shapes that do not match the canonical result structures.
Therefore the benchmark cannot distinguish absent Discovery capability from
information lost by the benchmark adapter. Repairing the adapter after seeing
outputs and rerunning the same cases would violate the frozen-case protocol.

## Additional validity failures

- Evidence-order invariance failed overall.
- Follow-up attribution found order sensitivity in the fixture-backed generic
  synthesis proxy, traditional structured analysis, and Discovery treatments.
- The lexical evaluator is not independently validated for paraphrase recovery.
- Human-only remains `not-yet-evaluated`.
- The generic synthesis treatment is fixture-backed, not a genuine live LLM.
- No clean Discovery ablation was available without introducing invasive
  benchmark-only cognition flags.

## Preserved raw observations

The raw adapter-level mean scores were:

| Treatment | Mean | Median | Guardrail failures |
|---|---:|---:|---:|
| Fixture-backed synthesis proxy | 0.745 | 0.752 | 3 |
| Retrieval plus deterministic synthesis | 0.747 | 0.752 | 2 |
| Traditional structured analysis | 0.733 | 0.756 | 4 |
| Discovery adapter | 0.519 | 0.536 | 27 |

These values must not be interpreted as treatment superiority. They diagnose
the current benchmark boundary and are retained to prevent selective deletion.

## Required next experiment

Create a new untouched case suite and preregistration after independently
validating a read-only Discovery observable-output adapter against canonical
contradiction, uncertainty, evidence-gap, mechanism, and lineage fixtures.
Validate evaluator paraphrase recovery and treatment-specific order invariance
before exposing any new case outputs. Import genuine fixed-version model output
and blinded human responses when authorized.

No production architecture or product behavior should change in response to
this invalidated run.
