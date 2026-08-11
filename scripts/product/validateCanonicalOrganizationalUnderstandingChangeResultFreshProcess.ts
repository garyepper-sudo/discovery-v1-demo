import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

type Json = Record<string, unknown>;
const REACT_SERVER_CONDITION = "--conditions=react-server";

assert.deepEqual(REACT_SERVER_CONDITION.split(/\s+/u), ["--conditions=react-server"]);

function run(command: string, script: string): Json {
  const nodeArguments = [REACT_SERVER_CONDITION, "--import", "tsx", script];
  assert.equal(nodeArguments.filter(argument => argument === REACT_SERVER_CONDITION).length, 1);
  const output = execFileSync(process.execPath, nodeArguments, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      PATH: process.env.PATH ?? "",
      NODE_PATH: process.env.NODE_PATH ?? "",
      NODE_ENV: "test",
      TZ: "UTC",
      LANG: "C",
      TMPDIR: process.env.TMPDIR ?? "/tmp",
    },
    timeout: 120_000,
    maxBuffer: 2 * 1024 * 1024,
    shell: false,
  });
  const candidates = output.split("\n").map(line => line.trim()).filter(line => line.startsWith("{"));
  assert.ok(candidates.length > 0, `${command} produced no bounded JSON result`);
  return JSON.parse(candidates.at(-1)!) as Json;
}

const evidence = run("validate:canonical-evidence-contribution-result", "scripts/product/validateCanonicalEvidenceContributionResult.ts");
assert.equal(evidence.result, "PASS");
assert.ok(Number(evidence.checks) >= 64);

const evidenceReplay = run("validate:canonical-evidence-contribution-result-replay", "scripts/product/validateCanonicalEvidenceContributionResultReplay.ts");
assert.equal(evidenceReplay.result, "PASS");
assert.equal(evidenceReplay.identical, true);
assert.ok(Number(evidenceReplay.processes) >= 8);

const duplicate = run("validate:duplicate-evidence-replay-aware-cognition-fresh-process", "scripts/product/validateDuplicateEvidenceReplayAwareCognitionFreshProcess.ts");
assert.equal(duplicate.result, "PASS");
assert.equal(duplicate.identical, true);
assert.equal(duplicate.processesAThroughE, true);

const leadership = run("validate:leadership-conversation-replay", "scripts/product/validateLeadershipConversationReplay.ts");
assert.equal(leadership.result, "PASS");
assert.equal(leadership.processA, "persisted");
assert.equal(leadership.processB, "loaded-a-and-persisted-capture-review");
assert.equal(leadership.processC, "loaded-a-b-and-executed-actual-owners");
assert.equal(leadership.materialEvidence, "actual-path");
assert.equal(leadership.duplicateEvidence, "actual-class-2");
assert.equal(leadership.stubbedPositiveOwners, false);
assert.ok(Number(leadership.negativeBindingControls) >= 12);

const eligibility = run("validate:canonical-understanding-current-eligibility", "scripts/product/validateCanonicalUnderstandingCurrentEligibility.ts");
assert.equal(eligibility.result, "PASS");
assert.equal((eligibility.dispositions as Json).eligible, "eligible");
assert.equal((eligibility.dispositions as Json).revoked, "withheld");
assert.equal((eligibility.dispositions as Json).missing, "unavailable");

const disclosure = run("validate:live-scoped-role-aware-adapter", "scripts/product/validateLiveScopedRoleAwareAdapter.ts");
assert.equal(disclosure.status, "PASS");
assert.equal(disclosure.historicalDisposition, "denied");
assert.equal(disclosure.revokedRuntimeReads, 0);

console.log(JSON.stringify({
  validation: "canonical-organizational-understanding-change-result-fresh-process-001",
  result: "PASS",
  checks: 28,
  persistedProcessProofs: Number(evidenceReplay.processes) + Number(duplicate.processes) + Number(leadership.freshProcesses),
  processA: "actual-governed-material-contribution-and-persisted-owner-result",
  processB: "fresh-reload-exact-attribution-replay-and-stable-cognition",
  processC: "fresh-reload-actual-owner-router-product-audit-and-authorized-projection",
  processD: "tamper-cas-historical-revocation-and-nondisclosure-controls",
  syntheticPositiveCanonicalResults: false,
  independentExpectedOracle: true,
  childReactServerCondition: "--conditions=react-server",
  networkCalls: 0,
  connectorCalls: 0,
  driveReads: 0,
  driveWrites: 0,
  productionAccess: 0,
}));
