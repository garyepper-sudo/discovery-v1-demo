import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  ExecutiveWork,
} from "./executiveWork";

export type SaveExecutiveWorkInput = {
  runtime: OrganizationRuntime;

  work: ExecutiveWork;
};

/**
 * Persists one canonical Executive Work item into Organization Runtime.
 *
 * This function performs no independent reasoning and does not mutate the
 * original Runtime. It returns a new Runtime with the work item appended.
 */
export function saveExecutiveWork({
  runtime,
  work,
}: SaveExecutiveWorkInput): OrganizationRuntime {
  if (
    runtime.metadata.organizationId !==
    work.organizationId
  ) {
    throw new Error(
      `Cannot save Executive Work ${work.id}: organization ${work.organizationId} does not match Runtime organization ${runtime.metadata.organizationId}.`,
    );
  }

  const existingWork =
    runtime.memory.executiveWork.find(
      (candidate) =>
        candidate.id === work.id,
    );

  if (existingWork) {
    throw new Error(
      `Cannot save Executive Work ${work.id}: a work item with this ID already exists.`,
    );
  }

  return {
    ...runtime,

    metadata: {
      ...runtime.metadata,

      updatedAt:
        work.updatedAt,
    },

    memory: {
      ...runtime.memory,

      executiveWork: [
        ...runtime.memory
          .executiveWork,

        work,
      ],
    },
  };
}
