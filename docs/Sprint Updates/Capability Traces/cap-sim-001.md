# Capability Trace — Organizational Simulation

Generated: 2026-07-13T18:58:28.018Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-SIM-001` |
| Capability name | Organizational Simulation |
| Cognitive domain | SIM |
| Architectural layer | COG |
| Canonical producer | `engine/v3/model/simulate/simulateOrganization.ts` |
| Runtime destination | `OrganizationRuntime.simulatedOrganizationStates` |
| Executive destination | `Atlas, ExecutiveProjection, ExecutiveWorkspace` |
| Atlas coverage | planned |
| Registry status | proposed |

### Produced Cognitive Objects

- `SimulatedOrganizationState`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/simulate/simulateOrganization.ts`

### Capability Dependencies

- `CAP-ADP-001`
- `CAP-LRN-002`
- `CAP-PRD-001`
- `CAP-UND-002`
- `CAP-UND-004`

### Declared Consumers

- `CAP-SYS-001`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-SIM-001 |
| Canonical producer declared | ✅ | engine/v3/model/simulate/simulateOrganization.ts |
| Canonical producer exists | ✅ | engine/v3/model/simulate/simulateOrganization.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationRuntime.simulatedOrganizationStates |
| Executive destination | ✅ | Atlas, ExecutiveProjection, ExecutiveWorkspace |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | planned |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/executive-v2/simulation/ExecutiveSimulation.tsx`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/runtime/organizationRuntime.ts`
- `scripts/cognition/reviewCognitiveDomain.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Organizational Simulation`
- `organizationalSimulation`
- `OrganizationalSimulation`
- `organizational-simulation`
- `organizational simulation`
- `CAP-SIM-001`
- `capSim001`
- `CapSim001`
- `cap-sim-001`
- `simulateOrganization`
- `SimulateOrganization`
- `simulate-organization`
- `simulateorganization`
- `simulatedOrganizationStates`
- `SimulatedOrganizationStates`
- `simulated-organization-states`
- `simulatedorganizationstates`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 3 |
| Runtime | ✅ Found | 14 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 3 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ✅ Found | 1 |
| Benchmark | ❌ Not found | 0 |
| Other | ✅ Found | 1 |

### Detailed Matches

#### Engine

##### `engine/v3/model/simulate/simulateOrganization.ts`

- Line 58 · **unknown** · matched `simulateOrganization`
  - `export type SimulateOrganizationInput = {`
- Line 96 · **definition** · matched `simulateOrganization`
  - `export function simulateOrganization(`
- Line 97 · **unknown** · matched `simulateOrganization`
  - `input: SimulateOrganizationInput,`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 46 · **import** · matched `simulateOrganization`
  - `import { simulateOrganization } from "../model/simulate/simulateOrganization";`
- Line 96 · **type** · matched `simulatedOrganizationStates`
  - `simulatedOrganizationStates?: any[];`
- Line 949 · **unknown** · matched `Organizational Simulation`
  - `* CAP-SIM-001 — Organizational Simulation`
- Line 955 · **unknown** · matched `simulateOrganization`
  - `simulateOrganization({`
- Line 980 · **definition** · matched `simulatedOrganizationStates`
  - `const simulatedOrganizationStates = [`
- Line 981 · **read** · matched `simulatedOrganizationStates`
  - `...(memory.simulatedOrganizationStates ?? []),`
- Line 1005 · **unknown** · matched `simulatedOrganizationStates`
  - `simulatedOrganizationStates,`
- Line 1061 · **unknown** · matched `simulatedOrganizationStates`
  - `simulatedOrganizationStates,`
- Line 1280 · **type** · matched `simulatedOrganizationStates`
  - `simulatedOrganizationStates:`
- Line 1281 · **unknown** · matched `simulatedOrganizationStates`
  - `typeof simulatedOrganizationStates;`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 23 · **import** · matched `simulateOrganization`
  - `import type { SimulatedOrganizationState } from "../model/simulate/simulateOrganization";`
- Line 96 · **unknown** · matched `Organizational Simulation`
  - `* Organizational Simulation.`
- Line 98 · **type** · matched `simulatedOrganizationStates`
  - `simulatedOrganizationStates: SimulatedOrganizationState[];`
- Line 186 · **type** · matched `simulatedOrganizationStates`
  - `simulatedOrganizationStates: [],`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 552 · **unknown** · matched `Organizational Simulation`
  - `* Produced by CAP-SIM-001 — Organizational Simulation.`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 213 · **type** · matched `simulatedOrganizationStates`
  - `simulatedOrganizationStates?: RuntimeSimulation[];`
- Line 820 · **read** · matched `simulatedOrganizationStates`
  - `runtimeMemory?.simulatedOrganizationStates;`

#### Simulation

##### `components/executive-v2/simulation/ExecutiveSimulation.tsx`

- Line 15 · **unknown** · matched `Organizational Simulation`
  - `Organizational Simulation`

#### Other

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 223 · **unknown** · matched `organizationalSimulation`
  - `candidateObject: "OrganizationalSimulationResult",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
