import {
  ACCEPTANCE_FRAMEWORK_ID,
  ACCEPTANCE_FRAMEWORK_VERSION,
  assertAcceptanceProfileRequirementsV1,
  type AcceptanceProfileRequirementsV1,
} from "./authenticatedAlphaAcceptanceContracts";

export const AR5B_PROFILE_ID = "ar5b-authenticated-recovery-conformance";
export const AR5B_PROFILE_VERSION = "version-1";
export const AR5B_PRODUCT_JOURNEY =
  "occurrence-one-complete-what-changed-prepare-again-occurrence-two-prepared";
export const AR5B_ROLES = ["ceo", "director", "manager", "denied"] as const;
export const AR5B_VIEWPORTS = ["desktop-1440x1000", "narrow-390x844"] as const;

const browserFacts = [
  "browser-journey-ordered",
  "ceo-authorized",
  "director-authorized-parity",
  "manager-unavailable",
  "denied-not-found",
  "desktop-viewport",
  "narrow-viewport",
  "hard-reload-reconstructed",
  "successor-fresh-process-reconstructed",
  "successor-not-started",
  "successor-execution-not-claimed",
] as const;
const lifecycleFacts = [
  "resource-plan-frozen",
  "acknowledgement-loss-recovered",
  "foreign-preserved",
  "organizations-capability-measured",
] as const;
const scannerFacts = ["scanner-sensitive", "public-surfaces-clean"] as const;
const cleanupFacts = [
  "cleanup-first-attempt",
  "cleanup-second-converged",
  "server-browser-roots-zero",
] as const;
const zeroFacts = [
  "users-zero",
  "sessions-zero",
  "memberships-zero",
  "organizations-zero-or-disabled",
  "local-residue-zero",
] as const;

export const ar5bAuthenticatedRecoveryConformanceProfile: AcceptanceProfileRequirementsV1 =
  {
    schemaVersion: "1",
    kind: "acceptance-profile-requirements",
    framework: {
      id: ACCEPTANCE_FRAMEWORK_ID,
      version: ACCEPTANCE_FRAMEWORK_VERSION,
    },
    profile: { id: AR5B_PROFILE_ID, version: AR5B_PROFILE_VERSION },
    requiredMeasurements: [
      {
        producer: "browser",
        phase: "browser-journey",
        multiplicity: "exactly-one",
        factIds: browserFacts,
      },
      {
        producer: "replay-recovery",
        phase: "replay-recovery",
        multiplicity: "exactly-one",
        factIds: [
          "ar5a-provenance-exact",
          "current-build-owner-measured",
          "exact-replay",
          "incompatible-replay",
          "cas-conflict",
          "acknowledgement-loss-recovered-current-build",
          "exact-operation-precedence",
          "claim-help-converged",
          "stale-terminal-reconstructed",
          "original-reader-converged",
          "fresh-materialization-process-executed",
          "fresh-materialization-durable-state-reconstructed",
          "joined-owner-inventory-matched",
          "joined-owner-missing-findings-zero",
          "joined-owner-foreign-state-preserved",
          "repeated-reconciliation-converged",
          "recovery-blocked",
          "winning-canonical-bytes-unchanged",
          "authorization-before-protected-read",
          "authorized-read",
          "unavailable-shape-neutral",
          "unauthorized-protected-reads-zero",
          "joined-duplicate-inventory-zero",
        ],
      },
      {
        producer: "observability",
        phase: "event-observation",
        multiplicity: "exactly-one",
        factIds: [
          "observer-parity",
          "telemetry-parity",
          "product-output-parity",
          "durable-state-parity",
          "recovery-outcome-parity",
          "authorization-parity",
        ],
      },
      {
        producer: "lifecycle",
        phase: "resource-lifecycle",
        multiplicity: "exactly-one",
        factIds: lifecycleFacts,
      },
      {
        producer: "scanner",
        phase: "surface-scan",
        multiplicity: "exactly-one",
        factIds: scannerFacts,
      },
      {
        producer: "cleanup",
        phase: "cleanup-attempts",
        multiplicity: "exactly-one",
        factIds: cleanupFacts,
      },
      {
        producer: "independent-zero",
        phase: "zero-verification",
        multiplicity: "exactly-one",
        factIds: zeroFacts,
      },
    ],
    orderingConstraints: [
      {
        beforeFactId: "browser-journey-ordered",
        afterFactId: "current-build-owner-measured",
      },
      {
        beforeFactId: "current-build-owner-measured",
        afterFactId: "observer-parity",
      },
      { beforeFactId: "observer-parity", afterFactId: "resource-plan-frozen" },
      {
        beforeFactId: "resource-plan-frozen",
        afterFactId: "public-surfaces-clean",
      },
      {
        beforeFactId: "public-surfaces-clean",
        afterFactId: "cleanup-first-attempt",
      },
      { beforeFactId: "cleanup-second-converged", afterFactId: "users-zero" },
    ],
    identityBindings: ["framework", "profile", "source", "task"],
  };

assertAcceptanceProfileRequirementsV1(
  ar5bAuthenticatedRecoveryConformanceProfile,
);
