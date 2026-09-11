import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { REQUIRED_OUTPUT_FIELDS } from "./fixtures";

export type SealedOutputImport = {
  path: string;
  sha256: string;
  value: Record<string, unknown>;
};

const sha256 = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");

export async function importSealedOutput(path: string, expectedSha256: string): Promise<SealedOutputImport> {
  const raw = await readFile(path, "utf8");
  assert.equal(sha256(raw), expectedSha256, `Sealed output hash mismatch for ${path}`);
  const value: unknown = JSON.parse(raw);
  assert.ok(value && typeof value === "object" && !Array.isArray(value), "Candidate output must be a JSON object");
  assert.deepEqual(Object.keys(value).sort(), [...REQUIRED_OUTPUT_FIELDS].sort(), "Candidate output fields differ from the frozen contract");
  return { path, sha256: expectedSha256, value: value as Record<string, unknown> };
}

export async function importExactlyThreeSealedOutputs(entries: Array<{ path: string; sha256: string }>) {
  assert.equal(entries.length, 3, "Addendum V3 permits exactly three sealed outputs");
  return Promise.all(entries.map((entry) => importSealedOutput(entry.path, entry.sha256)));
}
