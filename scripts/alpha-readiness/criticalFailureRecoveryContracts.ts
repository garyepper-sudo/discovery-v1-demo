export const recoveryOutcomes = [
  "committed",
  "exact-replay",
  "incompatible-replay",
  "cas-conflict",
  "recovered-uncommitted",
  "already-committed",
  "recovery-blocked",
  "unavailable",
  "cleanup-complete",
  "cleanup-blocked",
] as const;

export type CriticalFailureRecoveryOutcome = (typeof recoveryOutcomes)[number];
export const criticalFailureRecoveryProducers = [
  "focused-owner-recovery",
  "materialization-atomicity",
  "materialization-failure",
  "materialization-fresh-process",
  "joined-replay-inventory",
  "scanner",
  "cleanup-zero",
] as const;
export type CriticalFailureRecoveryProducer =
  (typeof criticalFailureRecoveryProducers)[number];
export type RecoveryCaseResult = { id: string; outcome: CriticalFailureRecoveryOutcome | "verified" };
export type FocusedOwnerRecoveryMeasurement = {
  status: "PASS"; checks: number; faultCases: number; concurrency: number;
  freshProcesses: number; exactReplay: number; incompatibleReplay: number;
  recoveryBlocked: number; duplicateFindings: number; authorizationFindings: number;
  protectedReads: number; unauthorizedProtectedReads: number;
  actualOwnerAuthorizationChecks: number; scannerSurfaceSensitivity: number;
  caseResults: RecoveryCaseResult[]; deterministicRepeat: boolean;
};
export type MaterializationAtomicityMeasurement = {
  status: "PASS";
  boundaries: { exactReplay: boolean; incompatibleReplay: boolean; runtimeBeforeWorkflow: boolean; workflowAfterRuntime: boolean };
  inventory: { productMaterializations: number; productMaterializationReceipts: number; whatChangedPublications: number; changeLinks: number; runtimeWrites: number; workflowWrites: number; duplicateFindings: number };
};
export type MaterializationFailureMeasurement = {
  status: "PASS";
  stages: { draftConflict: string; recovered: string; workflowPending: string };
  inventory: { writesBeforeRecovery: number; writesAfterRecovery: number; duplicateRuntimeWrites: number };
  measurementDigest: string;
};
export type MaterializationFreshProcessMeasurement = {
  status: "PASS"; workers: number; durableWorkers: number; totalWorkers: number;
  roles: string[]; deterministicAtomicity: boolean; deterministicFailureRecovery: boolean;
  durableBoundary: {
    runtimeOnly: { status: "PASS"; stage: string; runtimeEvents: number; workflowMaterializations: number };
    recovered: { status: "PASS"; stage: string; runtimeEvents: number; workflowMaterializations: number; workflowReceipts: number; workflowPublications: number; duplicateFindings: number };
  };
};
export type JoinedReplayInventoryMeasurement = {
  status: "PASS"; checks: number; freshProcesses: number;
  inventory: { families: Record<string, number>; duplicateFindings: number };
  observability: { eventCount: number; neutralityCaseCount: number };
};
export type ScannerMeasurement = { findings: number; sensitivity: number; surfaces: number };
export type CleanupMeasurement = { status: "cleanup-complete"; rootsRemaining: number };
export type CriticalFailureRecoveryMeasurementByProducer = {
  "focused-owner-recovery": FocusedOwnerRecoveryMeasurement;
  "materialization-atomicity": MaterializationAtomicityMeasurement;
  "materialization-failure": MaterializationFailureMeasurement;
  "materialization-fresh-process": MaterializationFreshProcessMeasurement;
  "joined-replay-inventory": JoinedReplayInventoryMeasurement;
  scanner: ScannerMeasurement;
  "cleanup-zero": CleanupMeasurement;
};
export type CriticalFailureRecoveryEnvelopeFor<P extends CriticalFailureRecoveryProducer> = {
  contractVersion: "ar5a-measurement-v1";
  producer: P;
  phase: P;
  sequence: number;
  sourceDigest: string;
  taskId: "ar5a-core-failure-recovery";
  runId: string;
  measurement: CriticalFailureRecoveryMeasurementByProducer[P];
  measurementDigest: string;
};
export type CriticalFailureRecoveryMeasurementEnvelope = {
  [P in CriticalFailureRecoveryProducer]: CriticalFailureRecoveryEnvelopeFor<P>
}[CriticalFailureRecoveryProducer];
export type CriticalFailureRecoveryResult = {
  contractVersion: "ar5a-core-failure-recovery-v1";
  ownerRecoveryStatus: "PASS" | "BLOCKED";
  productReadinessStatus: "PASS" | "BLOCKED";
  faultCaseTotal: number;
  concurrencyTotal: number;
  freshProcessTotal: number;
  exactReplayTotal: number;
  incompatibleReplayTotal: number;
  recoveryBlockedTotal: number;
  duplicateFindingTotal: number;
  authorizationFindingTotal: number;
  scannerFindingTotal: number;
  scannerSensitivityTotal: number;
  cleanupStatus: "cleanup-complete" | "cleanup-blocked";
  ar3OwnerParityStatus: "PASS" | "BLOCKED";
  ar4OwnerParityStatus: "PASS" | "BLOCKED";
  historicalEvidenceDisposition: "preserved-source-stale";
  deterministicRepeatStatus: "PASS" | "BLOCKED";
  bodyRepositoryPath: "unchanged";
  replayValidatorPath: "activated";
  packageLockStatus: "unchanged";
  durationCategories: readonly ("immediate" | "bounded-local")[];
  recoverableDataCategories: readonly ("no-loss" | "owner-issued-replay")[];
  sourceDigest: string;
  changedPathsDigest: string;
  envelopeDigestAggregate: string;
  resultDigest: string;
};

export function assertRecoveryOutcome(
  value: unknown,
): asserts value is CriticalFailureRecoveryOutcome {
  if (!recoveryOutcomes.includes(value as CriticalFailureRecoveryOutcome)) {
    throw new Error("AR-5 recovery outcome is invalid");
  }
}
