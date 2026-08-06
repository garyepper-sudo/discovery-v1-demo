import assert from "node:assert/strict";

import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { buildGenericScopedProductSource } from "../../product/integration/runtimeToScopedProductSource";

const ORG = "synthetic-runtime-product-population-001";
const runtime = createEmptyOrganizationRuntime({ organizationId: ORG, name: "Synthetic" });
runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{ id: "must-not-be-mapped" }] as never;
const stored: StoredOrganizationRuntime = { bytes: new Uint8Array([1]), revision: "revision:stored-owner", runtime };
const input = { stored, organizationId: ORG, requestedScope: { organizationId: ORG, type: "organization" as const, id: ORG } };
const first = buildGenericScopedProductSource(input);
const second = buildGenericScopedProductSource(input);

assert.deepEqual(first, second);
assert.equal(first.sourceRevisionRef, stored.revision);
assert.equal(first.items.length, 0);
assert.equal(first.metrics.length, 0);
assert.doesNotMatch(JSON.stringify(first), /must-not-be-mapped/);
assert.throws(() => buildGenericScopedProductSource({ ...input, organizationId: "foreign" }), /identity mismatch/);
console.log(JSON.stringify({ status: "PASS", checks: 6, genericItems: 0, canonicalUnderstandingMappedAsGeneric: false, sourceRevisionOwner: "stored.revision", externalActivity: 0 }));
