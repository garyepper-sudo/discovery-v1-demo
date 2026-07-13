# Capability Trace — Architectural Planning

Generated: 2026-07-13T02:49:00.162Z

## Verified Architecture

**Connection status:** ❌ Incomplete

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

None declared.

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-SYS-001 |
| Canonical producer declared | ✅ | scripts/cognition/planArchitecture.mjs |
| Canonical producer exists | ✅ | scripts/cognition/planArchitecture.mjs |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | DiscoveryArchitectureState.architectureRecommendations |
| Executive destination | ✅ | ArchitectureHandoff, SprintBrief |
| Consumers | ❌ | No downstream consumers are declared. |
| Atlas coverage | ✅ | not-applicable |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

✅ No structural drift was detected between the declared implementation files and the capability trace.

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
| Other | ✅ Found | 1 |

### Detailed Matches

#### Other

##### `scripts/cognition/planArchitecture.mjs`

- Line 365 · **unknown** · matched `CAP-SYS-001`
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
