import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import postgres from "postgres";

import AlphaExperience from "../../../components/alpha/AlphaExperience";
import ClerkSessionTerminationControl from "../../../components/product-shell/ClerkSessionTerminationControl";
import ProtectedPageLifecycleGuard from "../../../components/product-shell/ProtectedPageLifecycleGuard";
import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../../db/governance/postgresRepositories";
import { FilesystemOrganizationRuntimeRepository } from "../../../engine/v3/runtime/organizationRuntimeRepository";
import { resolvePersonaForSignedInUser, SANDBOX_ORGANIZATION_ID } from "../../../lib/access/sandboxMultiUserAccess";
import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import { isHostedDiscoveryEnvironment } from "../../../lib/production-route-policy";
import { readLiveScopedRoleAwareProjection } from "../../../product/integration/liveScopedRoleAwareAdapter";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Role-Aware Living Organization · Live Development" };

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
    if (live.disposition !== "authorized" || !live.sourceRevisionDigest) notFound();
    void searchParams;
    return <ProtectedPageLifecycleGuard><AlphaExperience experience={live.experience} initialScene="home" hosted sessionControl={<ClerkSessionTerminationControl />} /></ProtectedPageLifecycleGuard>;
  } finally { await sql.end(); }
}
