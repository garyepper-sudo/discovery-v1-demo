import postgres from "postgres";
import { NextRequest, NextResponse } from "next/server";

import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { createOrganizationRuntimeRepository } from "../../../engine/v3/runtime";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestId =
    request.headers.get("x-request-id") ?? crypto.randomUUID();
  const organizationId = process.env.DISCOVERY_ALPHA_ORGANIZATION_ID;
  const checks = { configuration: false, database: false, runtime: false };
  let stage = "configuration";
  let sql;

  checks.configuration = Boolean(
    organizationId &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );

  try {
    stage = "database";
    sql = postgres(requireDiscoveryDatabaseUrl("application"), {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 2,
    });
    const [{ ok }] = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
    checks.database = ok === 1;
    if (!checks.database) throw new Error("database");

    if (checks.configuration && organizationId) {
      stage = "runtime";
      checks.runtime =
        await createOrganizationRuntimeRepository().exists(organizationId);
    }
  } catch (error) {
    const provider = error as { name?: string; code?: string; sqlState?: string };
    console.error(JSON.stringify({
      event: "alpha.health-check-failed",
      requestId,
      stage,
      errorClass: provider.name ?? "Error",
      errorCode: provider.code ?? null,
      sqlState: provider.sqlState ??
        (provider.code && /^[0-9A-Z]{5}$/.test(provider.code)
          ? provider.code
          : null),
    }));
  } finally {
    await sql?.end({ timeout: 1 }).catch(() => {});
  }

  const ready = Object.values(checks).every(Boolean);
  return NextResponse.json(
    { status: ready ? "ready" : "not-ready", requestId, checks },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
