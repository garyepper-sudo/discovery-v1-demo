import assert from "node:assert/strict";

import { FounderBootstrapFailure, founderBootstrapInfrastructureSubstages, founderBootstrapStages } from "../../lib/alpha-provisioning/founderBootstrapDiagnostics";

const forbidden = ["postgres://", "sk_", "BLOB_READ_WRITE_TOKEN", "source body", "raw provider response"];
for (const stage of founderBootstrapStages) {
  const failure = new FounderBootstrapFailure({ correlationId: "bootstrap-test-correlation", stage, operation: "REGISTER", errorCode: "SOURCE_BINDING_PERSISTENCE_FAILED", retrySafe: false, resolutionFallbackAllowed: false, durableWriteOccurred: "unknown", durableWriteState: "AFTER_OR_DURING_DURABLE_WRITE" });
  assert.equal(failure.diagnostic.stage, stage, `stage is retained for ${stage}`);
  assert.equal(failure.diagnostic.operation, "REGISTER");
  assert.equal(failure.diagnostic.errorCode, "SOURCE_BINDING_PERSISTENCE_FAILED");
  assert.equal(failure.diagnostic.retrySafe, false);
  assert.equal(failure.diagnostic.resolutionFallbackAllowed, false);
  assert.equal(failure.diagnostic.durableWriteOccurred, "unknown");
  assert.equal(JSON.stringify(failure.diagnostic).includes("bootstrap-test-correlation"), true);
  assert.equal(forbidden.some(value => JSON.stringify(failure.diagnostic).includes(value)), false);
}
for (const infrastructureSubstage of founderBootstrapInfrastructureSubstages) {
  const failure = new FounderBootstrapFailure({ correlationId: "bootstrap-test-correlation", stage: "PRODUCTION_INFRASTRUCTURE", infrastructureSubstage, durableWriteState: "BEFORE_ANY_DURABLE_WRITE" });
  assert.equal(failure.diagnostic.infrastructureSubstage, infrastructureSubstage);
  assert.equal(forbidden.some(value => JSON.stringify(failure.diagnostic).includes(value)), false);
}
console.log(`RESULT PASS founder-bootstrap-diagnostics stages=${founderBootstrapStages.length} infrastructureSubstages=${founderBootstrapInfrastructureSubstages.length}`);
