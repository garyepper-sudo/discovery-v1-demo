/**
 * Canonical application-level organization identity contract.
 *
 * Runtime persistence already supports multiple organizations.
 * This module centralizes the temporary default used while the
 * product transitions to explicit organization selection.
 */

export const DEFAULT_ORGANIZATION_ID =
  "default-organization";

export function resolveOrganizationId(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return DEFAULT_ORGANIZATION_ID;
  }

  return value.trim();
}
