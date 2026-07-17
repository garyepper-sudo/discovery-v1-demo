import fs from "fs";
import path from "path";

import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntime,
} from "./organizationRuntime";

export type OrganizationId = string;

const STORE_DIR =
  process.env.VERCEL === "1"
    ? path.join(
        "/tmp",
        ".discovery-runtime",
        "organizations",
      )
    : path.join(
        process.cwd(),
        ".discovery-runtime",
        "organizations",
      );

function ensureStoreDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(
      STORE_DIR,
      {
        recursive: true,
      },
    );
  }
}

function getOrganizationPath(
  organizationId: OrganizationId,
): string {
  const safeId =
    organizationId.replace(
      /[^a-zA-Z0-9-_]/g,
      "_",
    );

  return path.join(
    STORE_DIR,
    `${safeId}.json`,
  );
}

function normalizeOrganizationRuntime(
  runtime: OrganizationRuntime,
): OrganizationRuntime {
  return {
    ...runtime,

    memory: {
      ...runtime.memory,

      /**
       * Backward-compatible normalization for runtime files
       * created before Executive Decision Recording existed.
       */
      executiveDecisionRecords:
        runtime.memory
          .executiveDecisionRecords ??
        [],
    },
  };
}

function writeOrganizationRuntimeState(
  runtime: OrganizationRuntime,
): OrganizationRuntime {
  ensureStoreDir();

  fs.writeFileSync(
    getOrganizationPath(
      runtime.metadata.organizationId,
    ),
    JSON.stringify(
      runtime,
      null,
      2,
    ),
    "utf-8",
  );

  return runtime;
}

export function loadOrganizationRuntimeState(
  organizationId: OrganizationId,
): OrganizationRuntime {
  ensureStoreDir();

  const filePath =
    getOrganizationPath(
      organizationId,
    );

  if (!fs.existsSync(filePath)) {
    return createEmptyOrganizationRuntime({
      organizationId,
    });
  }

  const raw =
    fs.readFileSync(
      filePath,
      "utf-8",
    );

  const runtime =
    JSON.parse(
      raw,
    ) as OrganizationRuntime;

  return normalizeOrganizationRuntime(
    runtime,
  );
}

/**
 * Persists a completed investigation and advances the
 * investigation count.
 */
export function saveOrganizationRuntimeState(
  runtime: OrganizationRuntime,
): OrganizationRuntime {
  const now =
    new Date().toISOString();

  const nextRuntime:
    OrganizationRuntime = {
      ...runtime,

      metadata: {
        ...runtime.metadata,

        updatedAt:
          now,

        investigationCount:
          runtime.metadata
            .investigationCount +
          1,
      },
    };

  return writeOrganizationRuntimeState(
    nextRuntime,
  );
}

/**
 * Persists a runtime change that is not a new investigation.
 *
 * Use this for executive decisions, reviews, workflow state,
 * and other durable organizational-memory updates.
 */
export function persistOrganizationRuntimeState(
  runtime: OrganizationRuntime,
): OrganizationRuntime {
  const nextRuntime =
    normalizeOrganizationRuntime(
      runtime,
    );

  return writeOrganizationRuntimeState(
    nextRuntime,
  );
}

export function resetOrganizationRuntimeState(
  organizationId: OrganizationId,
): OrganizationRuntime {
  const nextRuntime =
    createEmptyOrganizationRuntime({
      organizationId,
    });

  return writeOrganizationRuntimeState(
    nextRuntime,
  );
}