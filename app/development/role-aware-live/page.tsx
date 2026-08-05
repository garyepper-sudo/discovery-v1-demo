import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import postgres from "postgres";

import RoleAwareExperience from "../../../components/role-aware/RoleAwareExperience";
import ClerkSessionTerminationControl from "../../../components/product-shell/ClerkSessionTerminationControl";
import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../../db/governance/postgresRepositories";
import { FilesystemOrganizationRuntimeRepository } from "../../../engine/v3/runtime/organizationRuntimeRepository";
import { resolvePersonaForSignedInUser, SANDBOX_ORGANIZATION_ID } from "../../../lib/access/sandboxMultiUserAccess";
import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import { isHostedDiscoveryEnvironment } from "../../../lib/production-route-policy";
import { assertFrontendSafeSerialization } from "../../../product/frontend/roleAwareLivingOrganization";
import { mapRoleAwarePresentation } from "../../../product/frontend/roleAwarePresentation";
import { readLiveScopedRoleAwareProjection } from "../../../product/integration/liveScopedRoleAwareAdapter";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Role-Aware Living Organization · Live Development" };

type ViewName = "home" | "understanding" | "decision" | "investigation" | "history";

export default async function RoleAwareLivePage({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  noStore();
  try { if (isHostedDiscoveryEnvironment() || validateOnboardingTestEnvironment().environment !== "development") notFound(); } catch { notFound(); }
  const { userId } = await auth();
  if (!userId) notFound();
  const persona = resolvePersonaForSignedInUser(userId);
  if (!persona) notFound();
  const evaluatedAt = new Date().toISOString();
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    const accessRecords = await new PostgresAlphaAccessRecordRepository(sql).findAccessRecords({ consumerId: userId, organizationId: SANDBOX_ORGANIZATION_ID, experience: "organization", resolvedAt: evaluatedAt });
    const live = await readLiveScopedRoleAwareProjection({ userId, organizationId: SANDBOX_ORGANIZATION_ID, persona, accessRecords, runtimeRepository: new FilesystemOrganizationRuntimeRepository(), evaluatedAt });
    if (live.disposition !== "authorized" || live.runtimeReads !== 1 || !live.sourceRevisionDigest) notFound();
    const rawView = (await searchParams).view;
    const workspace: ViewName = rawView === "understanding" ? "understanding" : rawView === "decisions" ? "decision" : rawView === "investigations" ? "investigation" : rawView === "history" ? "history" : "home";
    const view = mapRoleAwarePresentation({
      description: "Live scoped view of the retained Northstar sandbox",
      roleDescription: live.personaLabel,
      scopeLabel: live.scopeLabel,
      workspace,
      projection: live.projection,
      primaryHeading: workspace === "home" ? "What needs your attention" : workspace === "understanding" ? "What Discovery understands" : workspace === "decision" ? "Decision in context" : workspace === "investigation" ? "What remains unknown" : "Change and authorized history",
      expectedDisposition: live.projection.disposition === "available" ? "disclosed" : live.projection.disposition,
      routePath: "/development/role-aware-live",
      liveDiagnostic: { organizationId: SANDBOX_ORGANIZATION_ID, requestedScope: live.scopeLabel, sourceRevisionDigest: live.sourceRevisionDigest },
    });
    assertFrontendSafeSerialization(view);
    return <><RoleAwareExperience view={view} /><aside aria-label="Development session control"><ClerkSessionTerminationControl /></aside></>;
  } finally { await sql.end(); }
}
