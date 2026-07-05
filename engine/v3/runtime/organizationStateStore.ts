import fs from "fs";
import path from "path";
import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntime,
} from "./organizationRuntime";

export type OrganizationId = string;

const STORE_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", ".discovery-runtime", "organizations")
    : path.join(process.cwd(), ".discovery-runtime", "organizations");

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function getOrganizationPath(organizationId: OrganizationId) {
  const safeId = organizationId.replace(/[^a-zA-Z0-9-_]/g, "_");
  return path.join(STORE_DIR, `${safeId}.json`);
}

export function loadOrganizationRuntimeState(
  organizationId: OrganizationId
): OrganizationRuntime {
  ensureStoreDir();

  const filePath = getOrganizationPath(organizationId);

  if (!fs.existsSync(filePath)) {
    return createEmptyOrganizationRuntime({ organizationId });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as OrganizationRuntime;
}

export function saveOrganizationRuntimeState(
  runtime: OrganizationRuntime
): OrganizationRuntime {
  ensureStoreDir();

  const now = new Date().toISOString();

  const nextRuntime: OrganizationRuntime = {
    ...runtime,
    metadata: {
      ...runtime.metadata,
      updatedAt: now,
      investigationCount: runtime.metadata.investigationCount + 1,
    },
  };

  fs.writeFileSync(
    getOrganizationPath(nextRuntime.metadata.organizationId),
    JSON.stringify(nextRuntime, null, 2),
    "utf-8"
  );

  return nextRuntime;
}

export function resetOrganizationRuntimeState(
  organizationId: OrganizationId
): OrganizationRuntime {
  ensureStoreDir();

  const nextRuntime = createEmptyOrganizationRuntime({ organizationId });

  fs.writeFileSync(
    getOrganizationPath(organizationId),
    JSON.stringify(nextRuntime, null, 2),
    "utf-8"
  );

  return nextRuntime;
}