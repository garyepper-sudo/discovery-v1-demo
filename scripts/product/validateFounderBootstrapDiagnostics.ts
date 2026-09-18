import assert from "node:assert/strict";

import { FounderBootstrapFailure, founderBootstrapStages } from "../../lib/alpha-provisioning/founderBootstrapDiagnostics";

const forbidden = ["postgres://", "sk_", "BLOB_READ_WRITE_TOKEN", "source body", "raw provider response"];
for (const stage of founderBootstrapStages) {
  const failure = new FounderBootstrapFailure({ correlationId: "bootstrap-test-correlation", stage, durableWriteState: "AFTER_OR_DURING_DURABLE_WRITE" });
  assert.equal(failure.diagnostic.stage, stage, `stage is retained for ${stage}`);
  assert.equal(failure.diagnostic.errorCode, "BOOTSTRAP_STAGE_FAILED");
  assert.equal(failure.diagnostic.retrySafe, true);
  assert.equal(JSON.stringify(failure.diagnostic).includes("bootstrap-test-correlation"), true);
  assert.equal(forbidden.some(value => JSON.stringify(failure.diagnostic).includes(value)), false);
}
console.log(`RESULT PASS founder-bootstrap-diagnostics stages=${founderBootstrapStages.length}`);
