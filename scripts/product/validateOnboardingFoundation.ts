import assert from "node:assert/strict";

import {
  runOrganizationOnboarding,
  summarizeOnboarding,
  type AccessInspection,
  type OrganizationOnboardingDependencies,
  type OrganizationOnboardingReceipt,
  type RuntimeInspection,
} from "../../lib/onboarding";

const ORGANIZATION_ID = "organization-onboarding-validation";
const CONSUMERS = ["user_initial_002", "user_initial_001"];
const DIGEST = "a".repeat(64);

type Harness = {
  dependencies: OrganizationOnboardingDependencies;
  calls: Record<string, number>;
  observations: OrganizationOnboardingReceipt[];
  failSmokeTest: boolean;
  runtimeDigest: string;
};

function harness(): Harness {
  let tick = 0;
  let runtime: RuntimeInspection = { status: "absent" };
  const access = new Map<string, AccessInspection>();
  const calls: Record<string, number> = {};
  const observations: OrganizationOnboardingReceipt[] = [];
  const result: Harness = {
    calls,
    observations,
    failSmokeTest: false,
    runtimeDigest: DIGEST,
    dependencies: {
      now() {
        tick += 1;
        return new Date(Date.UTC(2026, 0, 1, 0, 0, tick)).toISOString();
      },
      observe(receipt) {
        observations.push(receipt);
      },
      async validateConfiguration() {
        calls.validateConfiguration = (calls.validateConfiguration ?? 0) + 1;
        return {
          checks: {
            exactOrganization: true,
            runtimeAuthorityAvailable: true,
          },
        };
      },
      async inspectRuntime() {
        calls.inspectRuntime = (calls.inspectRuntime ?? 0) + 1;
        return runtime;
      },
      async provisionRuntime({ expectedDigest }) {
        calls.provisionRuntime = (calls.provisionRuntime ?? 0) + 1;
        runtime = {
          status: "present",
          location: `runtime://${ORGANIZATION_ID}`,
          digest: result.runtimeDigest || expectedDigest,
          revision: "revision-001",
          provisionedAt: "2026-01-01T00:00:00.000Z",
        };
        return runtime;
      },
      async validateGovernance() {
        calls.validateGovernance = (calls.validateGovernance ?? 0) + 1;
        return {
          checks: {
            accessStoreReady: true,
            lifecycleStoreReady: true,
          },
        };
      },
      async inspectAccess({ consumerId }) {
        calls.inspectAccess = (calls.inspectAccess ?? 0) + 1;
        return access.get(consumerId) ?? { status: "absent" };
      },
      async assignAccess({ consumerId }) {
        calls.assignAccess = (calls.assignAccess ?? 0) + 1;
        const assigned: AccessInspection = {
          status: "active",
          accessRecordId: `access:${consumerId}`,
          assignedAt: "2026-01-01T00:00:00.000Z",
        };
        access.set(consumerId, assigned);
        return assigned;
      },
      async verifyHealth() {
        calls.verifyHealth = (calls.verifyHealth ?? 0) + 1;
        return {
          ready: true,
          checks: {
            configuration: true,
            database: true,
            runtime: true,
          },
        };
      },
      async runSmokeTest() {
        calls.runSmokeTest = (calls.runSmokeTest ?? 0) + 1;
        return {
          passed: !result.failSmokeTest,
          checks: result.failSmokeTest
            ? ["organization-resolution-failed"]
            : [
                "organization-resolved",
                "runtime-readable-after-authorization",
                "canonical-entry-ready",
              ],
        };
      },
    },
  };
  return result;
}

function request(previousReceipt?: OrganizationOnboardingReceipt) {
  return {
    organizationId: ORGANIZATION_ID,
    organizationName: "Onboarding Validation",
    runtime: {
      bytes: new TextEncoder().encode("{}"),
      digest: DIGEST,
    },
    initialConsumerIds: [...CONSUMERS],
    ...(previousReceipt ? { previousReceipt } : {}),
  };
}

async function main(): Promise<void> {
  const firstHarness = harness();
  const first = await runOrganizationOnboarding(
    request(),
    firstHarness.dependencies,
  );
  assert.equal(first.lifecycleState, "Ready");
  assert.equal(first.stages.every(({ status }) => status === "Succeeded"), true);
  assert.deepEqual(
    first.assignedUsers.map(({ consumerId }) => consumerId),
    [...CONSUMERS].sort(),
  );
  assert.equal(firstHarness.calls.provisionRuntime, 1);
  assert.equal(firstHarness.calls.assignAccess, 2);
  assert.equal(
    firstHarness.observations.some((receipt) =>
      receipt.stages.some(({ status }) => status === "Running")
    ),
    true,
  );
  assert.equal(summarizeOnboarding(first).ready, true);
  assert.deepEqual(summarizeOnboarding(first).remainingStages, []);

  const idempotent = await runOrganizationOnboarding(
    request(first),
    firstHarness.dependencies,
  );
  assert.equal(idempotent.lifecycleState, "Ready");
  assert.equal(firstHarness.calls.provisionRuntime, 1);
  assert.equal(firstHarness.calls.assignAccess, 2);
  assert.equal(firstHarness.calls.runSmokeTest, 1);
  await assert.rejects(
    () => runOrganizationOnboarding(
      {
        ...request(first),
        initialConsumerIds: [...CONSUMERS, "user_unreviewed"],
      },
      firstHarness.dependencies,
    ),
    /receipt does not match/,
  );

  const retryHarness = harness();
  retryHarness.failSmokeTest = true;
  const failed = await runOrganizationOnboarding(
    request(),
    retryHarness.dependencies,
  );
  assert.equal(failed.lifecycleState, "Failed");
  assert.equal(failed.currentStage, "SmokeTestPassed");
  assert.equal(failed.retry.allowed, true);
  assert.equal(
    failed.stages.find(({ stage }) => stage === "SmokeTestPassed")?.attempts,
    1,
  );

  retryHarness.failSmokeTest = false;
  const retried = await runOrganizationOnboarding(
    request(failed),
    retryHarness.dependencies,
  );
  assert.equal(retried.lifecycleState, "Ready");
  assert.equal(retryHarness.calls.provisionRuntime, 1);
  assert.equal(retryHarness.calls.assignAccess, 2);
  assert.equal(retryHarness.calls.verifyHealth, 1);
  assert.equal(retryHarness.calls.runSmokeTest, 2);
  assert.equal(
    retried.stages.find(({ stage }) => stage === "SmokeTestPassed")?.attempts,
    2,
  );

  const conflictHarness = harness();
  conflictHarness.runtimeDigest = "b".repeat(64);
  const conflict = await runOrganizationOnboarding(
    request(),
    conflictHarness.dependencies,
  );
  assert.equal(conflict.lifecycleState, "Failed");
  assert.equal(conflict.currentStage, "RuntimeProvisioned");
  assert.equal(conflict.retry.allowed, false);
  assert.equal(conflictHarness.calls.assignAccess ?? 0, 0);

  console.log(JSON.stringify({
    validation: "organization-onboarding-foundation",
    result: "PASS",
    checks: {
      deterministicStageOrder: true,
      runningObservability: true,
      receiptCompleteness: true,
      idempotentCompletedRetry: true,
      changedRetryRequestRejected: true,
      restartFromFirstIncompleteStage: true,
      runtimeDigestConflictFailsClosed: true,
      userAssignmentIsBounded: true,
      summaryProjectionReady: true,
    },
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
