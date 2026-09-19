import postgres from "postgres";
import { NextRequest, NextResponse } from "next/server";

import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { canonicalFounderRuntimeHealthReceipt, type CanonicalFounderRuntimeHealthStage, inspectCanonicalFounderRuntimeHealth } from "../../../lib/alpha-provisioning/productionFounderRuntimeHealth";
import { writeAlphaOperationalLog } from "../../../lib/operations/alphaOperationalLog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestId =
    request.headers.get("x-request-id") ?? crypto.randomUUID();
  const checks = { configuration: false, database: false, runtime: false };
  let runtimeStage: Exclude<CanonicalFounderRuntimeHealthStage, "PASS"> | undefined;
  let sql;

  checks.configuration = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );

  try {
    sql = postgres(requireDiscoveryDatabaseUrl("application"), {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 2,
    });
    const [{ ok }] = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
    checks.database = ok === 1;
    if (!checks.database) throw new Error("database");

    if (checks.configuration) {
      const runtimeHealth = await inspectCanonicalFounderRuntimeHealth(sql, process.env);
      const receipt = canonicalFounderRuntimeHealthReceipt(runtimeHealth);
      checks.runtime = receipt.runtime;
      runtimeStage = receipt.runtimeStage;
    }
  } catch {
    writeAlphaOperationalLog({eventCategory:"health",workflowStage:"health",transitionCategory:"completed",outcomeCategory:"server-failure",failureCategory:"server"});
  } finally {
    await sql?.end({ timeout: 1 }).catch(() => {});
  }

  const ready = Object.values(checks).every(Boolean);
  return NextResponse.json(
    { status: ready ? "ready" : "not-ready", requestId, checks, ...(!checks.runtime && runtimeStage ? { runtimeStage } : {}) },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
