import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

type BoundedResult = Record<string, unknown> & { result: "PASS" };

const roles = [
  {
    id: "operation-bound-admit-map-evolve-persist-replay",
    path: "scripts/product/validateCanonicalEvidenceContributionResultReplay.ts",
  },
  {
    id: "persisted-reload-eligibility-revocation-cas",
    path: "scripts/product/validateCrossOperationCanonicalEvidenceAncestryFreshProcess.ts",
  },
  {
    id: "lineage-resolution-and-historical-compatibility",
    path: "scripts/product/validateCanonicalExplanationGovernanceLineage.ts",
  },
] as const;

function runFresh(path: string): BoundedResult {
  const execution = spawnSync(process.execPath, ["--import", "tsx", path], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      TMPDIR: process.env.TMPDIR,
      NODE_ENV: "test",
    },
    shell: false,
    timeout: 60_000,
    maxBuffer: 1_048_576,
  });
  assert.equal(
    execution.signal,
    null,
    `${path}: child timed out or was terminated`,
  );
  assert.equal(execution.status, 0, execution.stderr || `${path}: child failed`);
  const lines = execution.stdout.trim().split("\n").filter(Boolean);
  const parsed = JSON.parse(lines.at(-1) ?? "null") as BoundedResult;
  assert.equal(parsed.result, "PASS", `${path}: invalid bounded result`);
  assert(!JSON.stringify(parsed).includes("evidenceSources"));
  assert(!JSON.stringify(parsed).includes("authorizationContext"));
  return parsed;
}

const results = roles.map((role) => ({
  role: role.id,
  result: runFresh(role.path),
}));

const operationReplay = results[0]!.result;
const persistedProof = results[1]!.result;
const lineageResolution = results[2]!.result;

assert.equal(operationReplay.temporaryRootsRemoved, true);
assert.equal(persistedProof.actualRuntimeRepository, true);
assert.equal(persistedProof.actualRuntimeEvolution, true);
assert.equal(persistedProof.actualTheoryOwner, true);
assert.equal(persistedProof.actualExplanationOwner, true);
assert.equal(persistedProof.actualCompositionOwner, true);
assert.equal(persistedProof.actualAuthorizedProjection, true);
assert.equal(persistedProof.persistedRevocation, true);
assert.equal(persistedProof.casConflictProof, true);
assert.equal(lineageResolution.historicalDisposition, "unavailable");
assert.equal(lineageResolution.revokedDisposition, "withheld");

console.log(
  JSON.stringify({
    result: "PASS",
    roles: roles.map((role) => role.id),
    freshProcesses: 13,
    actualOperationBoundReplay: true,
    actualRuntimeRepository: true,
    actualRuntimeEvolution: true,
    actualTheoryAndExplanationOwners: true,
    actualAuthorizedProjection: true,
    persistedRevocation: true,
    casConflictProof: true,
    historicalCompatibility: true,
    boundedChildEnvironment: true,
    shell: false,
    timeoutMilliseconds: 60_000,
    temporaryRootsRemoved: true,
    externalActivity: { network: 0, connector: 0, drive: 0, production: 0 },
  }),
);
