# Discovery Active Path Inventory

## Purpose

This document identifies the active canonical product path and classifies surrounding code before cleanup begins.

The objective is to prepare Discovery for business simulation without removing code that is still required by:

- runtime evolution,
- Executive Projection,
- benchmarks,
- simulations,
- legacy compatibility,
- active routes.

No file should be removed until its imports, callers, and runtime role have been verified.

---

# Canonical Active Path

```text
runDiscoveryV3
↓
evolveOrganizationRuntime
↓
saveOrganizationRuntimeState
↓
buildExecutiveProjection
↓
Executive Workspace
```

This is the canonical Discovery product path.

---

# Classification Rules

## CANONICAL

Part of the active product path or required by the canonical runtime architecture.

## ADAPTER

Converts canonical objects between representations without creating new cognition.

## LEGACY-ACTIVE

Belongs to an older architecture but still has active callers, routes, benchmarks, or compatibility responsibilities.

## UNUSED

Has no active callers and is not required by:

- runtime,
- projection,
- UI,
- simulation,
- benchmark,
- migration,
- compatibility.

Only code verified as `UNUSED` may be removed immediately.

---

# Active Path Inventory

| Area | File or Component | Classification | Active Callers | Simulation Required? | Decision | Verification |
|---|---|---|---|:---:|---|---|
| Engine Entry | `runDiscoveryV3` | CANONICAL | `app/api/discovery-lab/route.ts`; additional callers to verify | ✅ | Keep | Active in mixed architecture API route |
| Runtime Evolution | `engine/v3/runtime/evolveOrganizationRuntime.ts` | CANONICAL | `app/api/discovery-lab/route.ts` | ✅ | Keep | Verified active |
| Runtime Persistence | `saveOrganizationRuntimeState` | CANONICAL | `app/api/discovery-lab/route.ts` | ✅ | Keep | Verified active in canonical route path |
| Executive Projection | `components/executive-v2/projection/buildExecutiveProjection.ts` | CANONICAL | `app/api/discovery-lab/route.ts`; Executive Workspace path to verify | ✅ | Keep | Verified canonical boundary |
| Executive Workspace | Executive Workspace component | CANONICAL | Active application route | ✅ | Keep | Pending exact route trace |
| Executive Assessment | `engine/v3/model/judgment/buildExecutiveAssessment.ts` | CANONICAL | Runtime evolution | ✅ | Keep | Verified canonical producer |
| Organizational Understanding | `engine/v3/understanding/synthesizeUnderstanding.ts` | CANONICAL | Runtime path | ✅ | Keep | Verified semantic owner |
| Organizational Reasoning | `engine/v3/model/reasoning/organizationalReasoningEngine.ts` | CANONICAL | Runtime path | ✅ | Keep | Verified semantic owner |
| Organizational Mechanisms | `engine/v3/model/judgment/mechanismInterpreter.ts` | CANONICAL | Runtime path | ✅ | Keep | Verified semantic owner |
| Organizational Theory Formation | `engine/v3/model/judgment/formOrganizationalTheories.ts` | CANONICAL | Runtime cognition pipeline | ✅ | Keep | Produces `OrganizationalTheory`; local `buildExecutiveInterpretation()` creates only a theory-level string |
| Executive Interpretation | `engine/v3/executive/interpretations/buildExecutiveInterpretation.ts` | LEGACY-ACTIVE | `engine/v3/executive/buildExecutiveDashboard.ts` | ❌ | Preserve pending migration | Produces derived `ExecutiveInterpretation`; active only through legacy dashboard path currently traced |
| Executive Briefing | `engine/v3/executive/buildExecutiveBriefing.ts` | UNVERIFIED | To trace | Unknown | Audit | Pending |
| Executive Dashboard | `engine/v3/executive/buildExecutiveDashboard.ts` | LEGACY-ACTIVE | Multiple legacy React components; `engine/v3/executive/index.ts`; `app/api/discovery-lab/route.ts` | ❌ | Migrate callers, then remove | Explicit compatibility layer around `ExecutiveInterpretation` |
| Discovery Lab API | `app/api/discovery-lab/route.ts` | LEGACY-ACTIVE | Discovery Lab frontend — caller trace required | ✅ | Migrate response consumers, then simplify | Mixed architecture entry point: executes legacy engine, V2, V3, legacy understanding, legacy dashboard, and canonical Executive Projection |
| Legacy Brief | `engine/brief.ts` | UNVERIFIED | To trace | Unknown | Audit | Pending |
| Legacy Executive UI | `components/executive/` | LEGACY-ACTIVE | Multiple components import dashboard compatibility types | ❌ | Migrate component tree | Legacy executive experience ecosystem |
| Results UI | `components/results/` | LEGACY-ACTIVE | Imports dashboard compatibility types | ❌ | Migrate or remove after route tracing | Legacy result presentation path |
| Discovery Lab | `app/discovery-lab/` | UNVERIFIED | To trace | Unknown | Audit | Pending route and response-field usage audit |

---

# Verified Compatibility Layer

`buildExecutiveDashboard()` is not part of the canonical runtime-first Executive Projection path.

It remains active to support older consumers through compatibility fields including:

- `narratives`
- `keyInsights`
- `currentOrganizationalState`
- `operatingMechanisms`
- `rememberedEvidence`

The canonical semantic object inside that legacy path is:

```ts
dashboard.interpretation
```

No new consumer should depend on the compatibility fields.

---

# Mixed Architecture Entry Point

`app/api/discovery-lab/route.ts` currently executes multiple generations of Discovery in one request:

- `runDiscovery`
- `buildUnderstanding`
- `runDiscoveryV2`
- `runDiscoveryV3`
- `buildExecutiveLearningExperience`
- `buildExecutiveDashboard`
- `buildExecutiveProjection`

The canonical simulation-ready path already exists inside the route:

```text
runDiscoveryV3
↓
evolveOrganizationRuntime
↓
saveOrganizationRuntimeState
↓
buildExecutiveProjection
```

Legacy outputs must not be removed until response consumers are traced.

---

# Cleanup Rules

Before changing or removing a file:

1. Search all imports.
2. Search all direct function calls.
3. Search route usage.
4. Search benchmark usage.
5. Search simulation usage.
6. Search type-only usage.
7. Classify the file.
8. Record the decision here.
9. Run validation.
10. Run architecture verification.
11. Commit separately.

---

# Validation Required After Every Cleanup

```bash
npm run validate
npm run verify:architecture
```

Do not combine multiple uncertain removals in one commit.

---

# Current Cleanup Sequence

1. Trace consumers of `/api/discovery-lab`.
2. Record which response fields each consumer uses.
3. Classify each response field as:
   - canonical,
   - legacy dependency,
   - debug only,
   - unused.
4. Migrate one consumer at a time to `executiveProjection`.
5. Remove compatibility fields only after caller count reaches zero.
6. Simplify `app/api/discovery-lab/route.ts` to the canonical runtime-first path.
7. Remove `buildExecutiveDashboard.ts` only after all callers are migrated.
8. Continue through legacy executive and results component trees.

---

# Current Status

Cleanup phase: Simulation Readiness Cleanup

Implementation changes authorized: No

Current task: Trace every consumer of:

```text
/api/discovery-lab
```

For each consumer, identify usage of:

```ts
understandingObject
v2
v3
organizationRuntime
executiveLearning
executiveDashboard
executiveProjection
```
