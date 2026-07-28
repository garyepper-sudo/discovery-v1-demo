import DiscoveryOnboardingExperience from "../../components/onboarding/DiscoveryOnboardingExperience";

/**
 * Legacy route retained for direct compatibility only.
 *
 * Canonical onboarding state and entry routing belong to /onboarding. Do not
 * use /discovery-v1 as an onboarding destination.
 */
export default async function DiscoveryV1Page({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const organizationId =
    typeof resolvedSearchParams.organizationId === "string"
      ? resolvedSearchParams.organizationId.trim() || undefined
      : undefined;

  return (
    <DiscoveryOnboardingExperience initialOrganizationId={organizationId} />
  );
}
