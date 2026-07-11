# Discovery Canonical Producer Registry

## Purpose

This document identifies the canonical ownership path for every significant Discovery capability.

It exists to ensure that each capability has:

* one canonical producer,
* one runtime representation,
* one Executive Projection representation,
* one executive presentation,
* one simulation path,
* one benchmark path.

Everything else should be classified as:

* translator,
* adapter,
* legacy compatibility,
* presentation,
* deprecated,
* or duplicate.

This registry must be updated from verified capability traces and direct code inspection.

Do not infer canonical ownership from file names alone.

---

# Governing Principle

> **One capability. One canonical producer.**

> **Expose existing intelligence before expanding intelligence.**

Before creating a new capability, verify that it does not already exist somewhere in:

* Engine
* Runtime
* Executive Projection
* Executive Experience
* Simulation
* Benchmark

---

# Capability Classification

## 🟢 Connected

The capability has a verified canonical producer and is actively integrated through the complete product path.

```text
Engine
↓
Runtime
↓
Executive Projection
↓
Executive Experience
↓
Simulation
↓
Benchmark
```

## 🟡 Partial

The capability exists and has a canonical producer, but one or more downstream layers are incomplete, indirect, or not yet verified.

## 🔴 Hidden

The capability exists in Engine or Runtime but is not exposed through the Executive Projection and Executive Experience.

## 🟠 Duplicate

Multiple implementations appear to produce competing versions of the same capability.

No implementation should be removed until the canonical producer has been verified.

## ⚪ Unverified

The capability is known or suspected to exist, but its canonical ownership path has not yet been established.

---

# Ownership Roles

## Canonical Producer

The only component authorized to create the authoritative capability output.

## Runtime Representation

The canonical persisted or longitudinal representation of the capability.

## Projection Object

The object exposed through the canonical Executive Projection contract.

## Executive Presentation

The component responsible for presenting the projected capability to the executive.

The presentation layer must not recreate, reinterpret, or independently produce organizational cognition.

## Simulation Path

The simulation or scenario runner that exercises the capability.

## Benchmark Path

The benchmark implementation that evaluates the capability.

---

# Canonical Producer Registry

| Capability                               | Canonical Producer                                                                                                  | Runtime Representation                                     | Projection Object                                                                                         | Executive Presentation               | Simulation            | Benchmark                                                               | Classification | Verification                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------- | ----------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| Executive Understanding                  | To verify                                                                                                           | Runtime understanding                                      | Executive Projection understanding                                                                        | Executive Workspace                  | Verified              | Verified                                                                | 🟢 Connected   | Audit required for producer                                                             |
| Synthesized Organizational Understanding | To verify                                                                                                           | Runtime understanding                                      | Executive Projection understanding                                                                        | Executive Workspace                  | Verified              | Verified                                                                | 🟢 Connected   | Audit required for producer                                                             |
| Executive Assessment                     | `engine/v3/model/judgment/buildExecutiveAssessment.ts` → `buildExecutiveAssessment()`                               | `OrganizationRuntime.executiveAssessment`                  | Currently translated into Executive Projection fields; canonical first-class object requires verification | No verified first-class presentation | Partial or unverified | `engine/benchmark/benchmarkScorer.ts` and investigation benchmark paths | 🟡 Partial     | Producer and runtime verified; projection semantics and UI ownership require inspection |
| Theory Validation                        | Currently appears to originate within Executive Assessment; verify whether it has an independent canonical producer | `OrganizationRuntime.executiveAssessment.theoryValidation` | Executive Projection theory-validation representation                                                     | Executive Workspace                  | Verified              | Verified                                                                | 🟢 Connected   | Producer relationship requires verification                                             |
| Investigation Opportunities              | To verify                                                                                                           | Present in runtime                                         | Highest-value opportunity is projected                                                                    | Partial presentation                 | Verified              | Verified                                                                | 🟡 Partial     | Full model remains hidden                                                               |
| Organizational State                     | To verify                                                                                                           | Present in runtime                                         | Partial                                                                                                   | Partial                              | Verified              | Verified                                                                | 🟡 Partial     | Not yet a first-class executive object                                                  |
| Organizational Conditions                | To verify                                                                                                           | Present in runtime                                         | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Producer audit required                                                                 |
| Organizational Beliefs                   | To verify                                                                                                           | Present in longitudinal runtime memory                     | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Producer audit required                                                                 |
| Domain Understanding                     | To verify                                                                                                           | Present in runtime                                         | None verified                                                                                             | None                                 | None verified         | None verified                                                           | 🔴 Hidden      | Full path requires audit                                                                |
| Organizational Learning Profile          | `engine/v3/model/learning/computeOrganizationalLearningProfile.ts` appears likely; must verify                      | Present in runtime                                         | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Canonical producer must be confirmed                                                    |
| Learning Velocity                        | To verify                                                                                                           | Present in runtime learning data                           | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Audit required                                                                          |
| Memory Growth                            | To verify                                                                                                           | Present in runtime learning data                           | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Audit required                                                                          |
| Knowledge Retention                      | To verify                                                                                                           | Present in runtime learning data                           | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Audit required                                                                          |
| Belief Stability                         | To verify                                                                                                           | Present in runtime learning data                           | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Audit required                                                                          |
| Theory Stability                         | To verify                                                                                                           | Present in runtime learning data                           | None verified                                                                                             | None                                 | Verified              | Verified                                                                | 🔴 Hidden      | Audit required                                                                          |
| Mechanism Network                        | To verify                                                                                                           | Present in runtime                                         | None verified                                                                                             | None                                 | Partial               | Partial                                                                 | 🔴 Hidden      | Producer and canonical data structure require audit                                     |
| Executive Summary                        | Multiple competing implementations                                                                                  | Multiple or unclear                                        | Partial                                                                                                   | Legacy implementation exists         | None verified         | None verified                                                           | 🟠 Duplicate   | Canonical producer not yet established                                                  |

---

# Verified Capability Record

Each capability must receive a detailed record after its audit is complete.

---

## Executive Assessment

### Capability

Executive Assessment

### Executive Question

What does Discovery currently conclude about the organization, and what deserves executive attention?

### Classification

🟡 Partial

### Canonical Producer

```text
engine/v3/model/judgment/buildExecutiveAssessment.ts
```

```ts
buildExecutiveAssessment()
```

### Runtime Integration

The capability is created during runtime evolution in:

```text
engine/v3/runtime/evolveOrganizationRuntime.ts
```

It is persisted as:

```ts
executiveAssessment
```

The runtime also uses its confidence in the organizational learning profile.

### Runtime Representation

```text
OrganizationRuntime.executiveAssessment
```

Exact runtime type ownership still needs to be strengthened because portions of the runtime currently use permissive typing.

### Projection Integration

Executive Projection reads the runtime assessment in:

```text
components/executive-v2/projection/buildExecutiveProjection.ts
```

Known projected use includes:

* assessment confidence,
* assessment summary,
* theory validation.

The audit does not yet prove that the complete Executive Assessment is projected as one canonical first-class object.

### Executive Presentation

No directly named Executive Assessment presentation was found by the structural audit.

The Executive Workspace may present translated assessment content indirectly, but this must be confirmed through direct code inspection.

### Simulation

Benchmark and Atlas simulation code consume Executive Assessment.

The canonical simulation ownership path requires final verification.

### Benchmark

Executive Assessment is directly evaluated by:

```text
engine/benchmark/benchmarkScorer.ts
```

It is also used in:

```text
engine/benchmark/runBenchmarkInvestigation.ts
engine/benchmark/runAtlasSimulation.ts
engine/benchmark/benchmarkReporter.ts
```

### Current Gaps

* No verified first-class Executive Assessment UI object.
* Projection may flatten or translate the assessment rather than preserve it canonically.
* Runtime typing includes permissive representations that should eventually be replaced with canonical types.
* Simulation ownership is present but has not yet been classified as canonical.
* The relationship between Executive Assessment and Theory Validation requires explicit ownership documentation.

### Next Architectural Decision

Determine whether:

1. `ExecutiveProjection` should expose a first-class `executiveAssessment` object, or
2. Executive Assessment is intentionally decomposed into separately owned projection objects.

Do not modify the producer until that contract decision is complete.

---

# Audit Procedure

For each capability:

## 1. Run the structural trace

```bash
npm run audit:capability -- "<Capability Name>"
```

## 2. Inspect the active implementation

Verify:

* where the capability is created,
* which function owns its semantics,
* where it is persisted,
* whether it survives runtime evolution,
* where it enters Executive Projection,
* where it is displayed,
* whether simulations exercise it,
* whether benchmarks evaluate it.

## 3. Identify competing producers

Search for functions that independently construct equivalent semantic output.

Do not classify translators, adapters, or presentation formatters as producers unless they create new organizational meaning.

## 4. Record canonical ownership

Update the registry with:

* Canonical Producer
* Runtime Representation
* Projection Object
* Executive Presentation
* Simulation Path
* Benchmark Path
* Classification
* Verification Notes

## 5. Update the Capability Audit

Keep this registry and `ENGINE_CAPABILITY_AUDIT.md` aligned.

The Capability Audit records capability status.

The Canonical Producer Registry records capability ownership.

---

# Audit Order

Audit capabilities in this order:

1. Executive Summary
2. Executive Assessment
3. Organizational State
4. Organizational Conditions
5. Organizational Beliefs
6. Investigation Opportunities
7. Domain Understanding
8. Mechanism Network
9. Organizational Learning Profile
10. Learning Velocity
11. Memory Growth
12. Knowledge Retention
13. Belief Stability
14. Theory Stability
15. Executive Understanding
16. Synthesized Organizational Understanding
17. Theory Validation

This order prioritizes:

* confirmed duplicates,
* partially integrated executive capabilities,
* high-value hidden cognition,
* foundational understanding capabilities.

---

# Current Architectural Decisions

## Executive Projection Boundary

Executive Projection is the canonical boundary between cognition and presentation.

```text
Engine
↓
Organization Runtime
↓
Executive Projection
↓
Executive Workspace
↓
React
```

React must not:

* consume runtime cognition directly,
* reconstruct executive meaning,
* select between competing engine outputs,
* create new organizational conclusions,
* bypass Executive Projection.

## Legacy Removal Rule

Do not remove a suspected legacy implementation until:

1. its imports and callers have been traced,
2. the canonical producer has been verified,
3. downstream consumers have been migrated,
4. validation passes,
5. benchmarks remain stable,
6. the implementation is either archived clearly or removed through version control.

## New Capability Rule

Do not add a new reasoning capability unless:

1. the Capability Audit has been completed,
2. no existing canonical or hidden implementation provides the capability,
3. extending an existing producer would be inappropriate,
4. the capability has a defined runtime representation,
5. the capability has a defined projection contract,
6. the capability has a benchmark plan,
7. it measurably improves the Discovery Understanding Scorecard.

---

# Definition of Architecture Baseline Complete

The Discovery Architecture Baseline is complete when:

* every major capability has been audited,
* every major capability has one verified canonical producer,
* every runtime representation is documented,
* every projection object is documented,
* every executive presentation is documented,
* every duplicate has a migration decision,
* every hidden capability has an integration decision,
* the Canonical Architecture Map can be generated from this registry,
* validation passes,
* benchmark integrity remains intact.

---

# Current Status

Architecture Baseline: In progress

Canonical Producer Registry: Created

Verified capability records:

* Executive Assessment — Partial verification

Next capability:

* Executive Summary
