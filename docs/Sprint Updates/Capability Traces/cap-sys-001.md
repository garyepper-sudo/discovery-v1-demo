# Capability Trace — Architectural Planning

Generated: 2026-07-16T03:44:04.239Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-SYS-001` |
| Capability name | Architectural Planning |
| Cognitive domain | SYS |
| Architectural layer | SYS |
| Canonical producer | `scripts/cognition/planArchitecture.mjs` |
| Runtime destination | `DiscoveryArchitectureState.architectureRecommendations` |
| Executive destination | `ArchitectureHandoff, SprintBrief` |
| Atlas coverage | not-applicable |
| Registry status | proposed |

### Produced Cognitive Objects

- `ArchitectureRecommendation`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `scripts/cognition/planArchitecture.mjs`

### Capability Dependencies

- `CAP-MEM-001`
- `CAP-SELF-001`
- `CAP-SELF-002`

### Declared Consumers

- `CAP-SYS-002`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-SYS-001 |
| Canonical producer declared | ✅ | scripts/cognition/planArchitecture.mjs |
| Canonical producer exists | ✅ | scripts/cognition/planArchitecture.mjs |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | DiscoveryArchitectureState.architectureRecommendations |
| Executive destination | ✅ | ArchitectureHandoff, SprintBrief |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | not-applicable |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `scripts/cognition/projectArchitectureRecommendation.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Architectural Planning`
- `architecturalPlanning`
- `ArchitecturalPlanning`
- `architectural-planning`
- `architectural planning`
- `CAP-SYS-001`
- `capSys001`
- `CapSys001`
- `cap-sys-001`
- `planArchitecture`
- `PlanArchitecture`
- `plan-architecture`
- `planarchitecture`
- `architectureRecommendations`
- `ArchitectureRecommendations`
- `architecture-recommendations`
- `architecturerecommendations`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ❌ Not found | 0 |
| Runtime | ❌ Not found | 0 |
| Executive | ❌ Not found | 0 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ✅ Found | 6 |

### Detailed Matches

#### Other

##### `scripts/cognition/planArchitecture.mjs`

- Line 175 · **unknown** · matched `CAP-SYS-001`
  - `"CAP-SYS-001",`
- Line 379 · **unknown** · matched `Architectural Planning`
  - `? "The System Operating System now includes both Architectural Planning and Architecture Recommendation Projection."`
- Line 385 · **unknown** · matched `architecturalPlanning`
  - `architecturalPlanningImplemented:`
- Line 565 · **unknown** · matched `Architectural Planning`
  - `"Architectural Planning now produces recommendations that are projected into Sprint Startup, allowing Discovery's own architecture state to influence development sequencing.",`
- Line 1246 · **unknown** · matched `CAP-SYS-001`
  - `"CAP-SYS-001",`

##### `scripts/cognition/projectArchitectureRecommendation.mjs`

- Line 125 · **unknown** · matched `CAP-SYS-001`
  - `"CAP-SYS-001",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
