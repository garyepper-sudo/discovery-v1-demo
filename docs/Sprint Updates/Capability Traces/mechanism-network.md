# Capability Trace — Mechanism Network

Generated: 2026-07-10T23:27:14.406Z

## Search Terms

- `Mechanism Network`
- `mechanismNetwork`
- `MechanismNetwork`
- `mechanism-network`
- `mechanism network`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 26 |
| Runtime | ✅ Found | 27 |
| Executive | ✅ Found | 1 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 2 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/compression/semanticCompression.ts`

- Line 35 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork?: SourceRecord[];`
- Line 442 · **read** · matched `mechanismNetwork`
  - `mechanismNetworks: asArray(params.mechanismNetwork),`

#### `engine/v3/concepts/buildConceptCandidates.ts`

- Line 334 · **unknown** · matched `mechanism-network`
  - `"mechanism-network",`

#### `engine/v3/concepts/conceptCandidateTypes.ts`

- Line 3 · **unknown** · matched `mechanism-network`
  - `\| "mechanism-network"`

#### `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`

- Line 173 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork?: SemanticObservationInput[];`
- Line 195 · **read** · matched `mechanismNetwork`
  - `mechanismNetworks: asArray(params.mechanismNetwork),`

#### `engine/v3/model/judgment/buildMechanismNetwork.ts`

- Line 12 · **unknown** · matched `mechanismNetwork`
  - `export type MechanismNetworkEdge = {`
- Line 21 · **unknown** · matched `mechanismNetwork`
  - `export type MechanismNetwork = {`
- Line 23 · **unknown** · matched `mechanismNetwork`
  - `edges: MechanismNetworkEdge[];`
- Line 122 · **unknown** · matched `mechanismNetwork`
  - `): MechanismNetworkEdge \| null {`
- Line 175 · **unknown** · matched `mechanismNetwork`
  - `edges: MechanismNetworkEdge[],`
- Line 201 · **unknown** · matched `mechanismNetwork`
  - `export function buildMechanismNetwork(`
- Line 203 · **unknown** · matched `mechanismNetwork`
  - `): MechanismNetwork {`
- Line 205 · **unknown** · matched `mechanismNetwork`
  - `const edges: MechanismNetworkEdge[] = [];`

#### `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`

- Line 2 · **unknown** · matched `mechanismNetwork`
  - `buildMechanismNetwork,`
- Line 3 · **type** · matched `mechanismNetwork`
  - `type MechanismNetwork,`
- Line 4 · **import** · matched `mechanismNetwork`
  - `} from "./buildMechanismNetwork";`
- Line 17 · **unknown** · matched `mechanismNetwork`
  - `): MechanismNetwork {`
- Line 45 · **unknown** · matched `mechanismNetwork`
  - `return buildMechanismNetwork(mechanisms);`
- Line 60 · **unknown** · matched `mechanismNetwork`
  - `return buildMechanismNetwork(safeMechanisms);`

#### `engine/v3/model/judgment/organizationalMechanism.ts`

- Line 110 · **unknown** · matched `Mechanism Network`
  - `* Mechanism network relationships.`

#### `engine/v3/semantic/buildSemanticObservations.ts`

- Line 32 · **unknown** · matched `mechanismNetwork`
  - `mechanismNetworks?: SemanticObservationInput[];`
- Line 615 · **unknown** · matched `mechanism-network`
  - `params.sourceType === "mechanism-network" && id ? [id] : [],`
- Line 756 · **read** · matched `mechanismNetwork`
  - `inputs: params.mechanismNetworks,`
- Line 757 · **unknown** · matched `mechanism-network`
  - `sourceType: "mechanism-network",`

#### `engine/v3/semantic/types.ts`

- Line 9 · **unknown** · matched `mechanism-network`
  - `\| "mechanism-network"`

### Runtime

#### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 56 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork?: any;`
- Line 301 · **definition** · matched `mechanismNetwork`
  - `const mechanismNetwork = inferOrganizationalMechanisms({`
- Line 312 · **unknown** · matched `mechanismNetwork`
  - `const safeMechanismNetwork = {`
- Line 313 · **read** · matched `mechanismNetwork`
  - `...mechanismNetwork,`
- Line 314 · **unknown** · matched `mechanismNetwork`
  - `mechanisms: Array.isArray(mechanismNetwork?.mechanisms)`
- Line 315 · **unknown** · matched `mechanismNetwork`
  - `? mechanismNetwork.mechanisms`
- Line 317 · **unknown** · matched `mechanismNetwork`
  - `edges: Array.isArray(mechanismNetwork?.edges) ? mechanismNetwork.edges : [],`
- Line 318 · **unknown** · matched `mechanismNetwork`
  - `centralMechanismIds: Array.isArray(mechanismNetwork?.centralMechanismIds)`
- Line 319 · **unknown** · matched `mechanismNetwork`
  - `? mechanismNetwork.centralMechanismIds`
- Line 323 · **unknown** · matched `Mechanism Network`
  - `console.log("Mechanism Network", safeMechanismNetwork);`
- Line 326 · **unknown** · matched `mechanismNetwork`
  - `mechanisms: safeMechanismNetwork.mechanisms,`
- Line 327 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork: safeMechanismNetwork.edges,`
- Line 328 · **unknown** · matched `mechanismNetwork`
  - `centralMechanismIds: safeMechanismNetwork.centralMechanismIds,`
- Line 354 · **unknown** · matched `mechanismNetwork`
  - `mechanisms: safeMechanismNetwork.mechanisms,`
- Line 367 · **unknown** · matched `mechanismNetwork`
  - `recurringMechanisms: safeMechanismNetwork.mechanisms.length,`
- Line 405 · **unknown** · matched `mechanismNetwork`
  - `mechanisms: safeMechanismNetwork.mechanisms,`
- Line 406 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork: safeMechanismNetwork.edges,`
- Line 423 · **unknown** · matched `mechanismNetwork`
  - `mechanisms: safeMechanismNetwork.mechanisms,`
- Line 457 · **unknown** · matched `mechanismNetwork`
  - `mechanisms: safeMechanismNetwork.mechanisms,`
- Line 487 · **unknown** · matched `mechanismNetwork`
  - `mechanismCount: safeMechanismNetwork.mechanisms.length,`
- Line 488 · **unknown** · matched `mechanismNetwork`
  - `mechanismEdgeCount: safeMechanismNetwork.edges.length,`
- Line 489 · **unknown** · matched `mechanismNetwork`
  - `centralMechanismCount: safeMechanismNetwork.centralMechanismIds.length,`
- Line 579 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork: safeMechanismNetwork,`
- Line 661 · **unknown** · matched `mechanismNetwork`
  - `mechanismCount: safeMechanismNetwork.mechanisms.length,`
- Line 662 · **unknown** · matched `mechanismNetwork`
  - `mechanismEdgeCount: safeMechanismNetwork.edges.length,`
- Line 663 · **unknown** · matched `mechanismNetwork`
  - `centralMechanismCount: safeMechanismNetwork.centralMechanismIds.length,`
- Line 695 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork: typeof safeMechanismNetwork;`

### Executive

#### `engine/v3/executive/buildExecutiveState.ts`

- Line 408 · **read** · matched `mechanismNetwork`
  - `(runtime as any)?.mechanismNetwork?.mechanisms ??`

### Benchmark

#### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 55 · **type** · matched `mechanismNetwork`
  - `mechanismNetwork?: {`
- Line 237 · **read** · matched `mechanismNetwork`
  - `memory.mechanismNetwork?.mechanisms?.map(`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
