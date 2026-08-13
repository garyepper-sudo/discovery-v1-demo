import assert from "node:assert/strict";
import { runHistoricalCheckpointLifecycleValidation } from "./validateHistoricalCheckpointLifecycleLinkage";

runHistoricalCheckpointLifecycleValidation("cross-organization").then((value) => {
  assert.equal(value.validation, "historical-checkpoint-lifecycle-organization-scoped-addressability");
  assert.equal(value.scenarios?.length, 6);
  assert.equal(value.requestOrganizationFields, 1);
  assert.equal(value.endpointOrganizationFields, 0);
  assert.equal(value.crossOrganizationRelationshipKinds, 0);
  assert.equal(value.deniedAdditionalProtectedReads, 0);
  assert.ok(value.scenarios?.every((scenario) => scenario.foreignProtectedLoads === 0));
  assert.ok(value.scenarios?.filter((scenario) => scenario.disposition === "inaccessible").every((scenario) => scenario.relationshipMutations === 0 && scenario.eventMutations === 0 && scenario.receiptMutations === 0 && scenario.idempotencyMutations === 0));
  console.log(JSON.stringify(value));
});
