import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import postgres from "postgres";
import { requireDiscoveryDatabaseUrl } from "../../../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../../../db/governance/postgresRepositories";
import { resolvePersonaForSignedInUser, safeAssignment, SANDBOX_ORGANIZATION_ID } from "../../../../lib/access/sandboxMultiUserAccess";
import { validateOnboardingTestEnvironment } from "../../../../lib/environment/discoveryEnvironment";
import { isHostedDiscoveryEnvironment } from "../../../../lib/production-route-policy";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache", Vary: "Cookie" };
export async function GET(): Promise<NextResponse> {
  let sql: ReturnType<typeof postgres> | undefined;
  try {
    if (isHostedDiscoveryEnvironment() || validateOnboardingTestEnvironment().environment !== "development") throw new Error("Unavailable");
    await auth.protect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ status: "denied" }, { status: 401, headers: privateHeaders });
    const persona = resolvePersonaForSignedInUser(userId);
    if (!persona) return NextResponse.json({ status: "denied" }, { status: 403, headers: privateHeaders });
    sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
    const records = await new PostgresAlphaAccessRecordRepository(sql).findAccessRecords({ consumerId: userId, organizationId: SANDBOX_ORGANIZATION_ID, experience: "organization", resolvedAt: new Date().toISOString() });
    return NextResponse.json({ ...safeAssignment(persona, records), liveProductDataWired: false }, { headers: privateHeaders });
  } catch { return NextResponse.json({ status: "not-found" }, { status: 404, headers: privateHeaders }); }
  finally { if (sql) await sql.end(); }
}
