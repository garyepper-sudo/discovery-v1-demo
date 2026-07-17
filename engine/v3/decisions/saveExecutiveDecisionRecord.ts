import type {
  ExecutiveDecisionRecord,
} from "./executiveDecisionRecord";

import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

export type SaveExecutiveDecisionRecordInput = {
  runtime: OrganizationRuntime;
  record: ExecutiveDecisionRecord;
};

function requireMatchingOrganization(
  runtime: OrganizationRuntime,
  record: ExecutiveDecisionRecord,
): void {
  if (
    runtime.metadata.organizationId !==
    record.organizationId
  ) {
    throw new Error(
      "Executive Decision Record and Organization Runtime must reference the same organization.",
    );
  }
}

export function saveExecutiveDecisionRecord({
  runtime,
  record,
}: SaveExecutiveDecisionRecordInput): OrganizationRuntime {
  requireMatchingOrganization(
    runtime,
    record,
  );

  const existingRecords =
    runtime.memory.executiveDecisionRecords ??
    [];

  const recordIndex =
    existingRecords.findIndex(
      (candidate) =>
        candidate.id === record.id,
    );

  const executiveDecisionRecords =
    recordIndex >= 0
      ? existingRecords.map(
          (candidate, index) =>
            index === recordIndex
              ? record
              : candidate,
        )
      : [
          ...existingRecords,
          record,
        ];

  return {
    ...runtime,

    metadata: {
      ...runtime.metadata,
      updatedAt:
        record.updatedAt,
    },

    memory: {
      ...runtime.memory,
      executiveDecisionRecords,
    },
  };
}