import {
  type OrganizationOnboardingDependencies,
  type OrganizationOnboardingReceipt,
  type OrganizationOnboardingRequest,
  type OrganizationOnboardingStage,
} from "./types";

export type OnboardingStageResult = {
  explanation: string;
  validationResults: string[];
  warnings?: string[];
};

export class OnboardingStageError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly recoverable: boolean,
    readonly operatorAction?: string,
  ) {
    super(message);
    this.name = "OnboardingStageError";
  }
}

function passedChecks(checks: Record<string, boolean>): string[] {
  return Object.entries(checks)
    .filter(([, passed]) => passed)
    .map(([check]) => check)
    .sort((left, right) => left.localeCompare(right, "en"));
}

function requireAllChecks(
  checks: Record<string, boolean>,
  code: string,
  message: string,
): void {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([check]) => check)
    .sort((left, right) => left.localeCompare(right, "en"));
  if (failed.length > 0) {
    throw new OnboardingStageError(
      code,
      `${message}: ${failed.join(", ")}`,
      true,
      "Correct the failed checks, then retry from this stage.",
    );
  }
}

function idempotencyKey(
  receipt: OrganizationOnboardingReceipt,
  stage: OrganizationOnboardingStage,
  subject = receipt.organizationId,
): string {
  return `${receipt.receiptId}:${stage}:${subject}`;
}

export function createOnboardingStageHandlers(input: {
  request: OrganizationOnboardingRequest;
  receipt: OrganizationOnboardingReceipt;
  dependencies: OrganizationOnboardingDependencies;
}): Record<OrganizationOnboardingStage, () => Promise<OnboardingStageResult>> {
  const { request, receipt, dependencies } = input;
  return {
    async Created() {
      if (!/^[a-zA-Z0-9_-]+$/.test(request.organizationId)) {
        throw new OnboardingStageError(
          "invalid-organization-id",
          "Organization id is invalid.",
          false,
          "Create a new onboarding request with a valid organization id.",
        );
      }
      if (!request.organizationName.trim()) {
        throw new OnboardingStageError(
          "invalid-organization-name",
          "Organization name is required.",
          false,
        );
      }
      if (
        !/^[a-f0-9]{64}$/.test(request.runtime.digest) ||
        request.runtime.bytes.byteLength === 0
      ) {
        throw new OnboardingStageError(
          "invalid-runtime-artifact",
          "A nonempty Runtime artifact and exact SHA-256 digest are required.",
          false,
        );
      }
      const consumers = [...new Set(request.initialConsumerIds)].sort();
      if (
        consumers.length === 0 ||
        consumers.some((consumerId) =>
          !consumerId || consumerId.trim() !== consumerId || consumerId === "*"
        )
      ) {
        throw new OnboardingStageError(
          "invalid-initial-users",
          "At least one exact initial consumer id is required.",
          false,
        );
      }
      return {
        explanation: "Organization onboarding request accepted.",
        validationResults: [
          "organization-id-valid",
          "organization-name-present",
          "runtime-artifact-bounded",
          "initial-users-exact",
        ],
      };
    },

    async ConfigurationValidated() {
      const result = await dependencies.validateConfiguration({
        organizationId: request.organizationId,
      });
      requireAllChecks(
        result.checks,
        "configuration-validation-failed",
        "Onboarding configuration validation failed",
      );
      return {
        explanation: "Onboarding configuration is valid.",
        validationResults: passedChecks(result.checks),
        warnings: result.warnings,
      };
    },

    async RuntimeProvisioned() {
      let runtime = await dependencies.inspectRuntime({
        organizationId: request.organizationId,
      });
      if (runtime.status === "absent") {
        runtime = await dependencies.provisionRuntime({
          organizationId: request.organizationId,
          runtimeBytes: request.runtime.bytes,
          expectedDigest: request.runtime.digest,
          idempotencyKey: idempotencyKey(receipt, "RuntimeProvisioned"),
        });
      }
      if (runtime.digest !== request.runtime.digest) {
        throw new OnboardingStageError(
          "runtime-digest-conflict",
          "Existing Runtime digest does not match the onboarding request.",
          false,
          "Resolve the Runtime identity conflict before retrying.",
        );
      }
      receipt.runtime = {
        location: runtime.location,
        digest: runtime.digest,
        revision: runtime.revision,
        provisionedAt: runtime.provisionedAt,
      };
      return {
        explanation: "Organization Runtime is present with the expected digest.",
        validationResults: [
          "runtime-present",
          "runtime-organization-matched",
          "runtime-digest-matched",
        ],
      };
    },

    async GovernanceProvisioned() {
      const result = await dependencies.validateGovernance({
        organizationId: request.organizationId,
      });
      requireAllChecks(
        result.checks,
        "governance-validation-failed",
        "Governance validation failed",
      );
      return {
        explanation: "Governance storage is ready for bounded user assignment.",
        validationResults: passedChecks(result.checks),
        warnings: result.warnings,
      };
    },

    async UsersAssigned() {
      const assigned = [];
      for (const consumerId of [...new Set(request.initialConsumerIds)].sort()) {
        let access = await dependencies.inspectAccess({
          organizationId: request.organizationId,
          consumerId,
        });
        if (access.status === "absent") {
          access = await dependencies.assignAccess({
            organizationId: request.organizationId,
            consumerId,
            idempotencyKey: idempotencyKey(receipt, "UsersAssigned", consumerId),
          });
        }
        assigned.push({
          consumerId,
          accessRecordId: access.accessRecordId,
          assignedAt: access.assignedAt,
        });
      }
      receipt.assignedUsers = assigned;
      return {
        explanation: `${assigned.length} initial user assignment(s) are active.`,
        validationResults: assigned.map(({ consumerId }) =>
          `active-access:${consumerId}`
        ),
      };
    },

    async HealthVerified() {
      const result = await dependencies.verifyHealth({
        organizationId: request.organizationId,
      });
      receipt.health = {
        status: result.ready ? "Ready" : "Failed",
        checks: { ...result.checks },
      };
      requireAllChecks(
        { ...result.checks, ready: result.ready },
        "health-verification-failed",
        "Organization health verification failed",
      );
      return {
        explanation: "Organization health checks are ready.",
        validationResults: passedChecks(result.checks),
      };
    },

    async SmokeTestPassed() {
      const result = await dependencies.runSmokeTest({
        organizationId: request.organizationId,
        consumerIds: [...new Set(request.initialConsumerIds)].sort(),
      });
      receipt.smokeTest = {
        status: result.passed ? "Passed" : "Failed",
        checks: [...result.checks],
      };
      if (!result.passed) {
        throw new OnboardingStageError(
          "smoke-test-failed",
          "Organization smoke test failed.",
          true,
          "Correct the failed product path, then retry from this stage.",
        );
      }
      return {
        explanation: "Organization smoke test passed.",
        validationResults: [...result.checks],
        warnings: result.warnings,
      };
    },

    async Ready() {
      return {
        explanation: "Organization onboarding is ready for launch.",
        validationResults: [
          "all-stages-succeeded",
          "health-ready",
          "smoke-test-passed",
        ],
      };
    },
  };
}
