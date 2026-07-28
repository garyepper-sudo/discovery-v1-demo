import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { createOrganizationRuntimeRepository } from "../../engine/v3/runtime";
import DiscoveryOnboardingExperience from "../../components/onboarding/DiscoveryOnboardingExperience";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import { resolveOnboardingRouteState } from "../../lib/onboarding/testing";

export const dynamic = "force-dynamic";

export default async function OnboardingEntryPage() {
  validateOnboardingTestEnvironment();
  const authentication = await auth();
  if (!authentication.userId) {
    throw new Error("Authenticated Clerk development user is required.");
  }

  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    const state = await resolveOnboardingRouteState({
      consumerId: authentication.userId,
      resolvedAt: new Date().toISOString(),
      accessRepository: new PostgresAlphaAccessRecordRepository(sql),
      runtimeRepository: createOrganizationRuntimeRepository(),
    });
    if (state.status === "active" ||
        state.status === "organization-selection-required") {
      redirect(state.destination);
    }
    return (
      <DiscoveryOnboardingExperience
        initialOrganizationId={
          state.status === "interrupted" ? state.organizationId : undefined
        }
      />
    );
  } finally {
    await sql.end();
  }
}
