import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import postgres from "postgres";
import ClerkSessionTerminationControl from "../../../components/product-shell/ClerkSessionTerminationControl";
import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../../db/governance/postgresRepositories";
import { resolvePersonaForSignedInUser, safeAssignment, SANDBOX_ORGANIZATION_ID } from "../../../lib/access/sandboxMultiUserAccess";
import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import { isHostedDiscoveryEnvironment } from "../../../lib/production-route-policy";
export const dynamic = "force-dynamic";
export default async function SandboxAccessDiagnostic() {
  noStore();
  try { if (isHostedDiscoveryEnvironment() || validateOnboardingTestEnvironment().environment !== "development") notFound(); } catch { notFound(); }
  const { userId } = await auth();
  if (!userId) notFound();
  const persona = resolvePersonaForSignedInUser(userId);
  if (!persona) notFound();
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    const records = await new PostgresAlphaAccessRecordRepository(sql).findAccessRecords({ consumerId: userId, organizationId: SANDBOX_ORGANIZATION_ID, experience: "organization", resolvedAt: new Date().toISOString() });
    const assignment = safeAssignment(persona, records);
    return <main><h1>Development sandbox access</h1><dl><dt>Signed-in user</dt><dd>{assignment.userReference}</dd><dt>Organization</dt><dd>{assignment.organizationId}</dd><dt>Persona</dt><dd>{assignment.displayLabel}</dd><dt>Status</dt><dd>{assignment.status}</dd><dt>Scopes</dt><dd>{assignment.scopeIds.join(", ") || "None"}</dd><dt>Operations</dt><dd>{assignment.operationIds.join(", ") || "None"}</dd></dl><p>Live Product data is not wired.</p><ClerkSessionTerminationControl /></main>;
  } finally { await sql.end(); }
}
