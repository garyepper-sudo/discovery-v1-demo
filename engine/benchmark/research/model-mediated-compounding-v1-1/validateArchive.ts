import assert from "node:assert/strict";
import { assertPhysicalV11Separation, v11ArchiveLayout } from "./archive";

const id = "a".repeat(64);
const layout = v11ArchiveLayout("/restricted/research", id);
assertPhysicalV11Separation(
  "/restricted/research/model-mediated-compounding-v1/v1-archive",
  layout.root,
);
assert.match(layout.ledger, /model-mediated-compounding-v1-1\/a{64}\/execution-ledger\.json$/);
assert.notEqual(layout.envelopes, layout.parsed);
assert.throws(() => v11ArchiveLayout("/restricted/research", "not-a-digest"));
assert.throws(() => assertPhysicalV11Separation(layout.root, layout.root));
console.log(JSON.stringify({ validation: "model-mediated-compounding-v1.1-archive-separation", result: "PASS", writes: 0 }));
