import "server-only";

import {
  loadOrganizationRuntimeState,
  resolveOrganizationId,
  type OrganizationRuntime,
} from "../../../engine/v3/runtime";

export type ProductOrganizationLoadState =
  | "available"
  | "missing-identity"
  | "invalid-identity"
  | "runtime-unavailable";

export type LoadedProductOrganization = {
  state: ProductOrganizationLoadState;
  organizationId?: string;
  organizationName?: string;
  runtime?: OrganizationRuntime;
};

const VALID_ORGANIZATION_ID = /^[a-zA-Z0-9_-]+$/;

export function loadProductOrganization(
  value: string | string[] | undefined,
): LoadedProductOrganization {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { state: "missing-identity" };
  }

  const organizationId = resolveOrganizationId(value);

  if (!VALID_ORGANIZATION_ID.test(organizationId)) {
    return { state: "invalid-identity" };
  }

  let runtime: OrganizationRuntime;

  try {
    runtime = loadOrganizationRuntimeState(organizationId);
  } catch {
    return {
      state: "runtime-unavailable",
      organizationId,
    };
  }

  const runtimeAvailable = runtime.metadata.investigationCount > 0;

  if (!runtimeAvailable) {
    return {
      state: "runtime-unavailable",
      organizationId,
    };
  }

  return {
    state: "available",
    organizationId,
    organizationName: runtime.metadata.name || "Your organization",
    runtime,
  };
}
