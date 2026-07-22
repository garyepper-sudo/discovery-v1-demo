# Engine Capability Audit

**Status:** Canonical operational audit after Sprint 100

## Purpose

This document records the implemented and measured state of Discovery's engine capabilities. The machine Capability Registry remains authoritative for producer ownership. Architecture documents define intended behavior. Runtime and benchmarks establish actual behavior.

## Status language

- **Implemented:** production behavior exists.
- **Benchmark validated:** an active deterministic benchmark confirms the behavior.
- **Partial:** part of the canonical behavior exists, with explicit missing behavior.
- **Designed:** canonical architecture exists but production does not implement it fully.
- **Deferred:** intentionally outside the current implementation sequence.
- **Unresolved:** a benchmark-measured production weakness remains.

## Canonical engine boundary

Discovery's Cognitive Operating System, Runtime, Organization Model, Executive Projection, Executive Communication, and Executive Decision pipeline are established. New presentation requirements do not justify new cognition. Production changes require a measured benchmark gap and a producer-level trace.

## Current capability status

| Capability | Status | Current evidence |
|---|---|---|
| Organization-scoped Runtime and identity | Implemented | Runtime persists by organization ID; active identity flows through product navigation and APIs. |
| Semantic fidelity through Themes, Phenomena, and Conceptual Understanding | Benchmark validated | Executive Meaning Preservation reports no diagnostic degradation and no required semantic failure. |
| Executive Decision Lab | Benchmark validated | Typed cases, hidden ground truth, stress and metamorphic scenarios, semantic correspondence, scope comparison, sensitivity, robustness, and failure taxonomy are established. |
| Intervention Profiles | Implemented and benchmark validated | Intrinsic execution characteristics inform option-specific feasibility. |
| Capacity-aware feasibility | Implemented and benchmark validated | High-burden options can be disqualified and only viable options enter simulation. |
| Localized intervention scope | Implemented and benchmark validated | Targeted scope propagates through option, profile, simulation, and recommendation. |
| Operating Model Evolution Lab | Benchmark validated | Eight longitudinal dimensions, stress scenarios, metamorphic transformations, failure taxonomy, Runtime adapter, and production replay are established. |
| Production longitudinal replay | Benchmark validated | Chronological evidence runs through production cognition and in-memory Runtime snapshots without persistence. |
| Organizational Mechanism lifecycle semantics | Designed | Canonical lifecycle document covers creation, revision, unchanged continuity, merge, split, retirement, reactivation, and supersession. |
| Immediate-previous mechanism identity reconciliation | Implemented and benchmark validated | Replay identity continuity passes for `same mechanism` versus `new mechanism`. |
| Longitudinal contradiction synthesis | Implemented and benchmark validated | Current evidence is compared with immediately previous evidence; qualification is detected deterministically. |
| Contradiction-aware belief revision | Implemented and benchmark validated | Stable challenged mechanism identity enters existing contradiction ancestry; replay belief weakening passes. |
| Contradiction-aware mechanism confidence | Unresolved | Mechanism confidence still rises after qualifying evidence. |
| Historical mechanism continuity | Designed and deferred | No durable mechanism revisions, merge/split history, retirement, reactivation, supersession, or lineage exists in Runtime. |

## Executive Decision optimization

### Intervention Profiles

Canonical intervention options contain intrinsic execution characteristics:

- organizational scope;
- implementation burden;
- organizational disruption;
- reversibility;
- leadership attention;
- coordination requirements;
- expected time to impact;
- implementation risk;
- preconditions.

These characteristics are stable properties of the intervention and participate in context-specific feasibility. Ranking, simulation algorithms, recommendation selection, confidence, and disposition were not broadly rewritten.

### Capacity and localized scope

Reduced implementation capacity can disqualify high-burden interventions. Localized conditions and supporting mechanism scope can produce department-scoped interventions. Structured scope remains visible through generated option, simulation input, and final recommendation.

Open Decision Lab findings remain:

- risk specificity;
- direct recommendation evidence grounding.

## Longitudinal Organization Model capability

### Production replay

```text
Evidence update
↓
runDiscoveryV3
↓
evolveOrganizationRuntime
↓
Production Runtime snapshot
↓
Benchmark adapter
↓
Operating Model Evolution evaluation
```

Replay is deterministic and in memory. It does not write Runtime state.

### Mechanism identity

Current mechanisms are compared with unclaimed immediately previous mechanisms using phenomenon ancestry, compatible type and scope, and additional existing ancestry. Confident, unambiguous matches reuse the previous ID; otherwise current canonical ID generation remains in effect.

This capability distinguishes only the same mechanism from a new mechanism. Merge, split, retirement, reactivation, supersession, and history are not implemented.

### Longitudinal contradiction and belief revision

Contradiction synthesis compares current and previous evidence deterministically. The successful knowledge-transfer fixture is represented as a qualification of previous founder-dependency understanding.

Belief inference joins the contradiction to a participating mechanism using current provenance, then stores the stable challenged mechanism identity in the existing contradiction ancestry field. The unchanged belief-update formula observes contradiction growth and lowers belief confidence from approximately `0.2515` to `0.2226`.

Investigation-local evidence IDs such as `E6` remain positional and are not longitudinal identity.

The belief's stored trend remains `stable` because the observed decrease is below the existing weakening threshold. This audit records the behavior without redefining the confidence contract.

## Current measured weaknesses

### Mechanism confidence — unresolved

The contradiction exists and the mechanism ID remains stable, but mechanism inference does not consume contradiction ancestry. Mechanism confidence remains approximately `0.4135` after the qualifying update. This is the next producer-level investigation.

### Historical mechanism truth — designed and deferred

Runtime retains the current mechanism network. It does not retain explicit mechanism lifecycle events or historical states. Do not infer mechanism revision history from belief revisions or theory evolution.

## Benchmark structure

1. **Executive Judgment and Decision Lab:** established Executive Decision Lab plus decision regressions.
2. **Operating Model Evolution Lab:** established longitudinal contracts, stress, metamorphic validation, adapter, and production replay.
3. **Evidence and Model Integrity validation:** existing evidence, semantic, phenomenon, normalization, Runtime, and architecture checks.
4. **Cognitive System Reliability validation:** existing Judgment Lab, stress, simulation, recommendation, communication, and Decision Quality checks.

Future integrity and reliability checks should consolidate into durable grouped suites rather than proliferating standalone labs.

## Recent validation baseline

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS; existing React Hook warnings only |
| Production Operating Model Replay | Deterministic; identity and belief weakening pass |
| Operating Model Evolution Lab foundation | 14 passed, 0 failed |
| Evolution stress pilot | All scenarios and transformations pass |
| Executive Decision Lab | 39 passed, 0 failed |
| Judgment Lab expansion | 15 passed, 0 failed |
| Executive Decision regression gate | PASS |
| Decision Quality | Approximately 88%, B+ |

## Guardrails

- Preserve one canonical producer per cognitive object.
- Use benchmarks and Runtime output to establish behavior.
- Make one narrow production change per optimization sprint.
- Preserve deterministic replay.
- Run Decision and Evolution regressions after production changes.
- Do not implement mechanism history while diagnosing confidence.
- Do not mark designed lifecycle states as implemented.
