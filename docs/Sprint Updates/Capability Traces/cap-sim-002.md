# Capability Trace — Organizational Intervention Modeling

Generated: 2026-07-13T20:27:20.364Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-SIM-002` |
| Capability name | Organizational Intervention Modeling |
| Cognitive domain | SIM |
| Architectural layer | COG |
| Canonical producer | `engine/v3/model/simulate/buildOrganizationalIntervention.ts` |
| Runtime destination | `OrganizationRuntime.organizationalInterventions` |
| Executive destination | `Simulation` |
| Atlas coverage | planned |
| Registry status | proposed |

### Produced Cognitive Objects

- `OrganizationalIntervention`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/simulate/buildOrganizationalIntervention.ts`
- `engine/v3/model/simulate/organizationalIntervention.ts`

### Capability Dependencies

None declared.

### Declared Consumers

- `CAP-SIM-001`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-SIM-002 |
| Canonical producer declared | ✅ | engine/v3/model/simulate/buildOrganizationalIntervention.ts |
| Canonical producer exists | ✅ | engine/v3/model/simulate/buildOrganizationalIntervention.ts |
| Implementation files | ✅ | 2 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.organizationalInterventions |
| Executive destination | ✅ | Simulation |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | planned |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `engine/v3/model/simulate/simulateOrganization.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/runtime/organizationRuntime.ts`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Organizational Intervention Modeling`
- `organizationalInterventionModeling`
- `OrganizationalInterventionModeling`
- `organizational-intervention-modeling`
- `organizational intervention modeling`
- `CAP-SIM-002`
- `capSim002`
- `CapSim002`
- `cap-sim-002`
- `organizationalIntervention`
- `OrganizationalIntervention`
- `organizational-intervention`
- `organizationalintervention`
- `buildOrganizationalIntervention`
- `BuildOrganizationalIntervention`
- `build-organizational-intervention`
- `buildorganizationalintervention`
- `organizationalInterventions`
- `OrganizationalInterventions`
- `organizational-interventions`
- `organizationalinterventions`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 26 |
| Runtime | ✅ Found | 8 |
| Executive | ❌ Not found | 0 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ❌ Not found | 0 |

### Detailed Matches

#### Engine

##### `engine/v3/model/simulate/buildOrganizationalIntervention.ts`

- Line 2 · **unknown** · matched `organizationalIntervention`
  - `OrganizationalIntervention,`
- Line 3 · **unknown** · matched `organizationalIntervention`
  - `OrganizationalInterventionScope,`
- Line 4 · **unknown** · matched `organizationalIntervention`
  - `OrganizationalInterventionStatus,`
- Line 5 · **unknown** · matched `organizationalIntervention`
  - `OrganizationalInterventionTimeHorizon,`
- Line 6 · **unknown** · matched `organizationalIntervention`
  - `OrganizationalInterventionType,`
- Line 7 · **import** · matched `organizationalIntervention`
  - `} from "./organizationalIntervention";`
- Line 9 · **unknown** · matched `organizationalIntervention`
  - `export type BuildOrganizationalInterventionInput = {`
- Line 12 · **unknown** · matched `organizationalIntervention`
  - `type: OrganizationalInterventionType;`
- Line 20 · **unknown** · matched `organizationalIntervention`
  - `scope?: OrganizationalInterventionScope;`
- Line 22 · **unknown** · matched `organizationalIntervention`
  - `timeHorizon?: OrganizationalInterventionTimeHorizon;`
- Line 24 · **unknown** · matched `organizationalIntervention`
  - `status?: OrganizationalInterventionStatus;`
- Line 62 · **unknown** · matched `organizationalIntervention`
  - `export function buildOrganizationalIntervention(`
- Line 63 · **unknown** · matched `organizationalIntervention`
  - `input: BuildOrganizationalInterventionInput,`
- Line 64 · **unknown** · matched `organizationalIntervention`
  - `): OrganizationalIntervention {`

##### `engine/v3/model/simulate/organizationalIntervention.ts`

- Line 1 · **unknown** · matched `organizationalIntervention`
  - `export type OrganizationalInterventionType =`
- Line 14 · **unknown** · matched `organizationalIntervention`
  - `export type OrganizationalInterventionScope =`
- Line 19 · **unknown** · matched `organizationalIntervention`
  - `export type OrganizationalInterventionTimeHorizon =`
- Line 25 · **unknown** · matched `organizationalIntervention`
  - `export type OrganizationalInterventionStatus =`
- Line 33 · **unknown** · matched `organizationalIntervention`
  - `export type OrganizationalIntervention = {`
- Line 47 · **unknown** · matched `organizationalIntervention`
  - `type: OrganizationalInterventionType;`
- Line 67 · **unknown** · matched `organizationalIntervention`
  - `scope: OrganizationalInterventionScope;`
- Line 72 · **unknown** · matched `organizationalIntervention`
  - `timeHorizon: OrganizationalInterventionTimeHorizon;`
- Line 77 · **unknown** · matched `organizationalIntervention`
  - `status: OrganizationalInterventionStatus;`

##### `engine/v3/model/simulate/simulateOrganization.ts`

- Line 6 · **import** · matched `organizationalIntervention`
  - `import type { OrganizationalIntervention } from "./organizationalIntervention";`
- Line 22 · **unknown** · matched `organizationalIntervention`
  - `intervention?: OrganizationalIntervention;`
- Line 67 · **unknown** · matched `organizationalIntervention`
  - `intervention?: OrganizationalIntervention;`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 96 · **unknown** · matched `organizationalIntervention`
  - `organizationalInterventions?: any[];`
- Line 1008 · **unknown** · matched `organizationalIntervention`
  - `organizationalInterventions:`
- Line 1009 · **read** · matched `organizationalIntervention`
  - `memory.organizationalInterventions ?? [],`
- Line 1066 · **unknown** · matched `organizationalIntervention`
  - `organizationalInterventions:`
- Line 1067 · **read** · matched `organizationalIntervention`
  - `memory.organizationalInterventions ?? [],`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 14 · **import** · matched `organizationalIntervention`
  - `import type { OrganizationalIntervention } from "../model/simulate/organizationalIntervention";`
- Line 98 · **unknown** · matched `organizationalIntervention`
  - `organizationalInterventions: OrganizationalIntervention[];`
- Line 194 · **unknown** · matched `organizationalIntervention`
  - `organizationalInterventions: [],`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
