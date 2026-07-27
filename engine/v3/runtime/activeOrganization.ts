/**
 * Canonical application-level organization identity contract.
 *
 * Runtime persistence already supports multiple organizations.
 * Product and API boundaries require an explicit organization.
 * The retained default identifier is development compatibility
 * metadata only and is never selected as an application fallback.
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
    throw new Error(
      "organizationId is required.",
    );
  }

  return value.trim();
}
