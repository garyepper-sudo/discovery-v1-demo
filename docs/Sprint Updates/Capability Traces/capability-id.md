# Capability Trace — <CAPABILITY ID>

Generated: 2026-07-16T03:47:39.036Z

## Verified Architecture

❌ No matching entry was found in `COGNITIVE_CAPABILITY_REGISTRY.json`.

The structural search remains available below, but architectural connectivity cannot be verified until this capability is registered.

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `<CAPABILITY ID>`
- `capabilityId`
- `CapabilityId`
- `capability-id`
- `<capability id>`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 49 |
| Runtime | ❌ Not found | 0 |
| Executive | ❌ Not found | 0 |
| Projection | ❌ Not found | 0 |
| UI | ✅ Found | 24 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 30 |
| Other | ✅ Found | 87 |

### Detailed Matches

#### Engine

##### `engine/v3/capabilities/updateOrganizationalCapabilities.ts`

- Line 40 · **unknown** · matched `capabilityId`
  - `function createCapabilityId(index: number): string {`
- Line 117 · **unknown** · matched `capabilityId`
  - `id: createCapabilityId(updatedCapabilities.length),`

##### `engine/v3/entities/entityUtils.ts`

- Line 52 · **unknown** · matched `capabilityId`
  - `capabilityIds: [],`
- Line 123 · **unknown** · matched `capabilityId`
  - `capabilityIds: Array.from(`
- Line 124 · **read** · matched `capabilityId`
  - `new Set([...existing.capabilityIds, ...incoming.capabilityIds])`

##### `engine/v3/entities/organizationalEntity.ts`

- Line 58 · **unknown** · matched `capabilityId`
  - `capabilityIds: string[];`

##### `engine/v3/functional/functionalInterpretation.ts`

- Line 69 · **unknown** · matched `capabilityId`
  - `supportingCapabilityIds?: string[];`

##### `engine/v3/functional/inferFunctionalInterpretations.ts`

- Line 208 · **unknown** · matched `capabilityId`
  - `supportingCapabilityIds: existing?.supportingCapabilityIds,`

##### `engine/v3/model/judgment/buildMechanismNetwork.ts`

- Line 56 · **unknown** · matched `capabilityId`
  - `...safeStringArray(mechanism.affectedCapabilityIds),`
- Line 57 · **read** · matched `capabilityId`
  - `...safeStringArray(mechanism.capabilityIds),`
- Line 78 · **unknown** · matched `capabilityId`
  - `affectedCapabilityIds: safeStringArray(mechanism.affectedCapabilityIds),`
- Line 79 · **read** · matched `capabilityId`
  - `capabilityIds: safeStringArray(mechanism.capabilityIds),`
- Line 131 · **unknown** · matched `capabilityId`
  - `...safeStringArray(source.affectedCapabilityIds),`
- Line 132 · **read** · matched `capabilityId`
  - `...safeStringArray(source.capabilityIds),`
- Line 136 · **unknown** · matched `capabilityId`
  - `...safeStringArray(target.affectedCapabilityIds),`
- Line 137 · **read** · matched `capabilityId`
  - `...safeStringArray(target.capabilityIds),`

##### `engine/v3/model/judgment/consolidateOrganizationalMechanisms.ts`

- Line 164 · **unknown** · matched `capabilityId`
  - `const affectedCapabilityIds = uniqueStrings(`
- Line 166 · **unknown** · matched `capabilityId`
  - `...safeStringArray(mechanism.affectedCapabilityIds),`
- Line 167 · **read** · matched `capabilityId`
  - `...safeStringArray(mechanism.capabilityIds),`
- Line 184 · **definition** · matched `capabilityId`
  - `const capabilityIds = uniqueStrings(`
- Line 186 · **read** · matched `capabilityId`
  - `...safeStringArray(mechanism.capabilityIds),`
- Line 187 · **unknown** · matched `capabilityId`
  - `...safeStringArray(mechanism.affectedCapabilityIds),`
- Line 271 · **unknown** · matched `capabilityId`
  - `capabilityIds,`
- Line 279 · **unknown** · matched `capabilityId`
  - `affectedCapabilityIds,`

##### `engine/v3/model/judgment/mechanismCandidateBuilder.ts`

- Line 231 · **read** · matched `capabilityId`
  - `asArray(candidate.capabilityIds).length +`
- Line 349 · **unknown** · matched `capabilityId`
  - `capabilityIds: [],`
- Line 372 · **read** · matched `capabilityId`
  - `...asArray(candidate.capabilityIds).sort(),`
- Line 511 · **definition** · matched `capabilityId`
  - `const capabilityIds = capabilities`
- Line 562 · **unknown** · matched `capabilityId`
  - `capabilityIds.length +`
- Line 605 · **unknown** · matched `capabilityId`
  - `capabilityIds,`
- Line 735 · **definition** · matched `capabilityId`
  - `const capabilityIds = capabilities`
- Line 785 · **unknown** · matched `capabilityId`
  - `capabilityIds.length +`
- Line 826 · **unknown** · matched `capabilityId`
  - `capabilityIds,`

##### `engine/v3/model/judgment/mechanismInferenceTypes.ts`

- Line 142 · **unknown** · matched `capabilityId`
  - `capabilityIds: string[];`

##### `engine/v3/model/judgment/mechanismInterpreter.ts`

- Line 43 · **read** · matched `capabilityId`
  - `capabilityIds: safeArray(candidate.capabilityIds),`
- Line 120 · **read** · matched `capabilityId`
  - `const capabilities = normalizedCandidate.capabilityIds;`
- Line 202 · **read** · matched `capabilityId`
  - `const capabilities = normalizedCandidate.capabilityIds;`
- Line 302 · **unknown** · matched `capabilityId`
  - `affectedCapabilityIds: affectedCapabilities,`
- Line 313 · **read** · matched `capabilityId`
  - `capabilityIds: candidate.capabilityIds,`
- Line 336 · **read** · matched `capabilityId`
  - `(mechanism.capabilityIds?.length ?? 0) +`
- Line 337 · **unknown** · matched `capabilityId`
  - `(mechanism.affectedCapabilityIds?.length ?? 0);`

##### `engine/v3/model/judgment/organizationalMechanism.ts`

- Line 76 · **unknown** · matched `capabilityId`
  - `affectedCapabilityIds: string[];`
- Line 88 · **unknown** · matched `capabilityId`
  - `supportingCapabilityIds?: string[];`
- Line 105 · **unknown** · matched `capabilityId`
  - `explainsCapabilityIds?: string[];`
- Line 140 · **unknown** · matched `capabilityId`
  - `capabilityIds?: string[];`

##### `engine/v3/understanding/understandingClusters.ts`

- Line 61 · **unknown** · matched `capabilityId`
  - `...asArray(m.affectedCapabilityIds),`
- Line 62 · **read** · matched `capabilityId`
  - `...asArray(m.capabilityIds),`
- Line 263 · **read** · matched `capabilityId`
  - `asArray(m.capabilityIds).length;`
- Line 269 · **read** · matched `capabilityId`
  - `asArray(m.capabilityIds).length * 0.25 +`

#### UI

##### `components/executive-v2/capabilities/ExecutiveCapabilityDefinition.tsx`

- Line 5 · **unknown** · matched `capabilityId`
  - `export type ExecutiveCapabilityId =`
- Line 29 · **type** · matched `capabilityId`
  - `capabilityId: ExecutiveCapabilityId;`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRegistry.tsx`

- Line 13 · **unknown** · matched `capabilityId`
  - `export type ExecutiveCapabilityId =`
- Line 29 · **type** · matched `capabilityId`
  - `capabilityId: ExecutiveCapabilityId;`
- Line 61 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-005",`
- Line 76 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-004",`
- Line 91 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-004",`
- Line 107 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-ABS-001",`
- Line 123 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-002",`
- Line 139 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-SELF-002",`
- Line 155 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-LRN-002",`
- Line 170 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-SIM-001",`

##### `components/executive-v2/capabilities/ExecutiveCapabilityRendererRegistry.tsx`

- Line 13 · **import** · matched `capabilityId`
  - `import type { ExecutiveCapabilityId } from "./ExecutiveCapabilityRegistry";`
- Line 16 · **type** · matched `capabilityId`
  - `capabilityId: ExecutiveCapabilityId;`
- Line 24 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-005",`
- Line 35 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-004",`
- Line 46 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-004",`
- Line 58 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-ABS-001",`
- Line 70 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-UND-002",`
- Line 82 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-SELF-002",`
- Line 94 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-LRN-002",`
- Line 105 · **type** · matched `capabilityId`
  - `capabilityId: "CAP-SIM-001",`
- Line 117 · **type** · matched `capabilityId`
  - `capabilityId: ExecutiveCapabilityId,`
- Line 122 · **assignment** · matched `capabilityId`
  - `renderer.capabilityId === capabilityId &&`

#### Benchmark

##### `engine/benchmark/architecture/types.ts`

- Line 4 · **type** · matched `capabilityId`
  - `capabilityId: string;`

##### `engine/benchmark/architecture/verifyDependencies.ts`

- Line 10 · **unknown** · matched `capabilityId`
  - `function normalizeCapabilityIds(value: unknown): {`
- Line 39 · **unknown** · matched `capabilityId`
  - `const consumes = normalizeCapabilityIds(`
- Line 43 · **unknown** · matched `capabilityId`
  - `const consumedBy = normalizeCapabilityIds(`
- Line 79 · **unknown** · matched `capabilityId`
  - `const reciprocalConsumers = normalizeCapabilityIds(`
- Line 107 · **unknown** · matched `capabilityId`
  - `const reciprocalDependencies = normalizeCapabilityIds(`
- Line 119 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 135 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`

##### `engine/benchmark/architecture/verifyExecutive.ts`

- Line 16 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 36 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 50 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 59 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`

##### `engine/benchmark/architecture/verifyOperatingSystemCoverage.ts`

- Line 74 · **type** · matched `capabilityId`
  - `capabilityId: \`OS-${domain.code}\`,`
- Line 81 · **type** · matched `capabilityId`
  - `capabilityId: \`OS-${domain.code}\`,`
- Line 90 · **type** · matched `capabilityId`
  - `capabilityId: \`OS-${domain.code}\`,`
- Line 99 · **type** · matched `capabilityId`
  - `capabilityId: \`OS-${domain.code}\`,`
- Line 108 · **type** · matched `capabilityId`
  - `capabilityId: \`OS-${domain.code}\`,`
- Line 117 · **type** · matched `capabilityId`
  - `capabilityId: \`OS-${domain.code}\`,`

##### `engine/benchmark/architecture/verifyOperatingSystems.ts`

- Line 25 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 45 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`

##### `engine/benchmark/architecture/verifyProducers.ts`

- Line 83 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 96 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 112 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 125 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`

##### `engine/benchmark/architecture/verifyRuntime.ts`

- Line 17 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 26 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`

##### `engine/benchmark/auditCapability.ts`

- Line 372 · **definition** · matched `capabilityId`
  - `function capabilityIdentityValues(`
- Line 393 · **unknown** · matched `capabilityId`
  - `const identities = capabilityIdentityValues(capability);`
- Line 408 · **unknown** · matched `capabilityId`
  - `capabilityIdentityValues(capability).some(`

##### `engine/benchmark/verifyArchitecture.ts`

- Line 102 · **assignment** · matched `capabilityId`
  - `(check) => check.capabilityId === capability.id,`

#### Other

##### `scripts/cognition/discoverCapabilities.mjs`

- Line 201 · **unknown** · matched `capabilityId`
  - `proposedCapabilityId: null,`

##### `scripts/cognition/generateArchitectureState.mjs`

- Line 205 · **unknown** · matched `capabilityId`
  - `leftCapabilityId: left.id,`
- Line 207 · **unknown** · matched `capabilityId`
  - `rightCapabilityId: right.id,`
- Line 387 · **unknown** · matched `capabilityId`
  - `function loadCapabilityTrace(capabilityId) {`
- Line 390 · **unknown** · matched `capabilityId`
  - `\`${String(capabilityId).toLowerCase()}.md\`,`
- Line 535 · **unknown** · matched `capabilityId`
  - `const structurallyConnectedCapabilityIds =`
- Line 554 · **unknown** · matched `capabilityId`
  - `const uiVisibleCapabilityIds = projectedCapabilities`
- Line 572 · **unknown** · matched `capabilityId`
  - `const hiddenCapabilityIds = projectedCapabilities`
- Line 575 · **unknown** · matched `capabilityId`
  - `!structurallyConnectedCapabilityIds.includes(`
- Line 581 · **unknown** · matched `capabilityId`
  - `const projectedButNotDisplayedCapabilityIds =`
- Line 582 · **unknown** · matched `capabilityId`
  - `structurallyConnectedCapabilityIds.filter(`
- Line 583 · **unknown** · matched `capabilityId`
  - `(capabilityId) =>`
- Line 584 · **unknown** · matched `capabilityId`
  - `!uiVisibleCapabilityIds.includes(capabilityId),`
- Line 594 · **unknown** · matched `capabilityId`
  - `executiveCapabilityIds:`
- Line 602 · **unknown** · matched `capabilityId`
  - `projectedCapabilityIds:`
- Line 610 · **unknown** · matched `capabilityId`
  - `workspaceDeclaredCapabilityIds:`
- Line 623 · **unknown** · matched `capabilityId`
  - `structurallyConnectedCapabilityIds.length,`
- Line 625 · **unknown** · matched `capabilityId`
  - `structurallyVisibleCapabilityIds:`
- Line 626 · **unknown** · matched `capabilityId`
  - `structurallyConnectedCapabilityIds,`
- Line 629 · **unknown** · matched `capabilityId`
  - `structurallyConnectedCapabilityIds.length,`
- Line 631 · **unknown** · matched `capabilityId`
  - `structurallyConnectedCapabilityIds,`
- Line 634 · **unknown** · matched `capabilityId`
  - `uiVisibleCapabilityIds.length,`
- Line 636 · **unknown** · matched `capabilityId`
  - `uiVisibleCapabilityIds,`
- Line 639 · **unknown** · matched `capabilityId`
  - `projectedButNotDisplayedCapabilityIds.length,`
- Line 641 · **unknown** · matched `capabilityId`
  - `projectedButNotDisplayedCapabilityIds,`
- Line 644 · **unknown** · matched `capabilityId`
  - `hiddenCapabilityIds.length,`
- Line 646 · **unknown** · matched `capabilityId`
  - `potentiallyHiddenCapabilityIds:`
- Line 647 · **unknown** · matched `capabilityId`
  - `hiddenCapabilityIds,`
- Line 678 · **unknown** · matched `capabilityId`
  - `missingCapabilityIds: [],`
- Line 710 · **definition** · matched `capabilityId`
  - `const capabilityIds = new Set(`
- Line 719 · **unknown** · matched `capabilityId`
  - `capabilityIds.has("CAP-PRD-001");`
- Line 722 · **unknown** · matched `capabilityId`
  - `capabilityIds.has("CAP-PRD-002");`
- Line 760 · **unknown** · matched `capabilityId`
  - `proposedCapabilityId: "CAP-ADP-001",`

##### `scripts/cognition/generateCapabilityRegistry.mjs`

- Line 116 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 131 · **read** · matched `capabilityId`
  - `console.log(\`- ${item.capabilityId}: ${item.path}\`);`

##### `scripts/cognition/planArchitecture.mjs`

- Line 138 · **unknown** · matched `capabilityId`
  - `const hiddenCapabilityIds = asArray(`
- Line 140 · **unknown** · matched `capabilityId`
  - `?.potentiallyHiddenCapabilityIds,`
- Line 159 · **unknown** · matched `capabilityId`
  - `hiddenCapabilityIds.includes(`
- Line 197 · **unknown** · matched `capabilityId`
  - `hiddenCapabilityIds,`
- Line 294 · **unknown** · matched `capabilityId`
  - `context.hiddenCapabilityIds.length === 0`
- Line 296 · **unknown** · matched `capabilityId`
  - `: \`${context.hiddenCapabilityIds.length} projected capability(s) remain structurally hidden.\`,`
- Line 301 · **unknown** · matched `capabilityId`
  - `hiddenCapabilityIds:`
- Line 302 · **unknown** · matched `capabilityId`
  - `context.hiddenCapabilityIds,`
- Line 329 · **unknown** · matched `capabilityId`
  - `capabilityIds:`
- Line 357 · **type** · matched `capabilityId`
  - `capabilityId:`
- Line 637 · **unknown** · matched `capabilityId`
  - `context.hiddenCapabilityIds.length > 0`
- Line 762 · **unknown** · matched `capabilityId`
  - `context.hiddenCapabilityIds.length === 0;`
- Line 907 · **unknown** · matched `capabilityId`
  - `capabilityIds: [],`
- Line 952 · **unknown** · matched `capabilityId`
  - `capabilityIds:`
- Line 1003 · **unknown** · matched `capabilityId`
  - `capabilityIds:`
- Line 1058 · **unknown** · matched `capabilityId`
  - `capabilityIds: [`
- Line 1107 · **unknown** · matched `capabilityId`
  - `capabilityIds: [],`
- Line 1148 · **unknown** · matched `capabilityId`
  - `capabilityIds: [],`
- Line 1231 · **unknown** · matched `capabilityId`
  - `capabilityIds: [],`
- Line 1245 · **type** · matched `capabilityId`
  - `capabilityId:`
- Line 1287 · **unknown** · matched `capabilityId`
  - `context.hiddenCapabilityIds.length,`

##### `scripts/cognition/projectArchitectureRecommendation.mjs`

- Line 71 · **unknown** · matched `capabilityId`
  - `capabilityIds:`
- Line 72 · **read** · matched `capabilityId`
  - `asArray(opportunity.capabilityIds),`
- Line 106 · **unknown** · matched `capabilityId`
  - `capabilityIds: [],`
- Line 117 · **type** · matched `capabilityId`
  - `capabilityId:`
- Line 123 · **unknown** · matched `capabilityId`
  - `sourceCapabilityId:`
- Line 124 · **read** · matched `capabilityId`
  - `recommendation.capabilityId ??`

##### `scripts/cognition/renderSprintStartup.mjs`

- Line 309 · **unknown** · matched `capabilityId`
  - `function capabilityNamesById(state, capabilityIds) {`
- Line 317 · **unknown** · matched `capabilityId`
  - `return capabilityIds.map(`
- Line 318 · **unknown** · matched `capabilityId`
  - `(capabilityId) =>`
- Line 319 · **unknown** · matched `capabilityId`
  - `capabilityMap.get(capabilityId) ?? capabilityId,`
- Line 475 · **unknown** · matched `capabilityId`
  - `intelligence.potentiallyHiddenCapabilityIds,`

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 49 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 68 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 86 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: ["CAP-MEM-001"],`
- Line 102 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 116 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 130 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 156 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 184 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 211 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 237 · **unknown** · matched `capabilityId`
  - `likelyCapabilityIds: [`
- Line 393 · **unknown** · matched `capabilityId`
  - `const related = definition.likelyCapabilityIds`

##### `scripts/cognition/validateCapabilityRegistry.mjs`

- Line 57 · **unknown** · matched `capabilityId`
  - `const consumersByCapabilityId = new Map();`
- Line 62 · **unknown** · matched `capabilityId`
  - `consumersByCapabilityId.get(dependencyId) ?? [];`
- Line 66 · **unknown** · matched `capabilityId`
  - `consumersByCapabilityId.set(`
- Line 79 · **unknown** · matched `capabilityId`
  - `...(consumersByCapabilityId.get(capability.id) ?? []),`
- Line 110 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 125 · **type** · matched `capabilityId`
  - `capabilityId: capability.id,`
- Line 168 · **unknown** · matched `capabilityId`
  - `.filter(([, capabilityIds]) => capabilityIds.length > 1)`
- Line 169 · **unknown** · matched `capabilityId`
  - `.map(([path, capabilityIds]) => ({`
- Line 171 · **unknown** · matched `capabilityId`
  - `capabilityIds: unique(capabilityIds),`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
