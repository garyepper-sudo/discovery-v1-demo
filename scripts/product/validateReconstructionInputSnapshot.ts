import assert from "node:assert/strict";
import {
  buildLivingOrganizationReconstructionInputSnapshot,
  digestLivingOrganizationReconstructionInputSnapshot,
  normalizeReconstructionContent,
  serializeLivingOrganizationReconstructionInputSnapshot,
} from "../../product/simulations/living-organization-sandbox/reconstructionInputSnapshot";

const record = {
  logicalSourceId: "source:one",
  sourceVersion: "1",
  batchId: "batch-1",
  effectiveAt: "2026-01-01T00:00:00Z",
  sourceType: "text/markdown",
  sourceRole: "governance evidence",
  content: "Evidence\r\n\r\n",
  normalizedContentDigest: "A".repeat(64),
  binding: {
    bindingId: "binding:one",
    topologyId: "topology:one",
    assertions: [
      { relationship: "subject", scope: { organizationId: "org-one", type: "team", id: "engineering" } },
      { relationship: "origin", scope: { organizationId: "org-one", type: "organization", id: "org-one" } },
    ],
  },
  controlDisposition: "not-a-control",
  duplicateOf: null,
  formattingEquivalentTo: null,
};

const build = (records = [record]) => buildLivingOrganizationReconstructionInputSnapshot({
  organizationId: "org-one",
  topologyId: "topology:one",
  topologyVersion: 1,
  records,
});

const forward = build();
const reordered = build([{ ...record, binding: { ...record.binding, assertions: [...record.binding.assertions].reverse() } }]);
assert.equal(normalizeReconstructionContent(record.content), "Evidence");
assert.deepEqual(serializeLivingOrganizationReconstructionInputSnapshot(forward), serializeLivingOrganizationReconstructionInputSnapshot(reordered));
assert.equal(digestLivingOrganizationReconstructionInputSnapshot(forward), digestLivingOrganizationReconstructionInputSnapshot(reordered));
assert.notEqual(digestLivingOrganizationReconstructionInputSnapshot(forward), digestLivingOrganizationReconstructionInputSnapshot(build([{ ...record, content: "Changed evidence" }])));
assert.ok(Buffer.from(serializeLivingOrganizationReconstructionInputSnapshot(forward)).toString("utf8").endsWith("\n"));
console.log(JSON.stringify({ validation: "living-organization-reconstruction-input-snapshot-v1", result: "PASS", checks: 5 }));
