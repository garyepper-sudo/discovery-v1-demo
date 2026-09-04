import assert from "node:assert/strict";
import { V11_OUTPUT_VERSION } from "./contracts";
import { deriveV11ResponseArtifact } from "./envelope";

const output = { schemaVersion: V11_OUTPUT_VERSION, items: [], agenda: [], questions: [], followThrough: [] };
const body = Buffer.from(JSON.stringify({
  id: "v11-fake-response", object: "response", model: "gpt-5.6-sol", status: "completed",
  output: [{ id: "message-0", type: "message", content: [{ type: "output_text", text: JSON.stringify(output) }] }],
  usage: { input_tokens: 10, output_tokens: 10, total_tokens: 20 },
  unknownFutureField: { preserved: true },
}));
const artifact = deriveV11ResponseArtifact(body);
assert.equal(artifact.responseId, "v11-fake-response");
assert.equal(artifact.envelopeBytes, body.length);
assert.equal(artifact.envelopeDigest.length, 64);
assert.equal(artifact.parsedDigest.length, 64);
for (const status of ["in_progress", "failed"] as const) {
  const malformed = Buffer.from(JSON.stringify({ id: `v11-${status}`, model: "gpt-5.6-sol", status, output: [] }));
  assert.throws(() => deriveV11ResponseArtifact(malformed));
}
console.log(JSON.stringify({ validation: "model-mediated-compounding-v1.1-envelope", result: "PASS", providerRequests: 0 }));
