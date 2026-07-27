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
  let sql;
  try {
    if (
      process.env.DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED !== "true" ||
      !organizationId ||
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      !process.env.CLERK_SECRET_KEY
    ) {
      throw new Error("configuration");
    }
    checks.configuration = true;
    sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
    const [{ ok }] = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
    checks.database = ok === 1;
    checks.runtime =
      await createOrganizationRuntimeRepository().exists(organizationId);
  } catch {
    // The response intentionally exposes only bounded readiness categories.
  } finally {
    await sql?.end();
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
