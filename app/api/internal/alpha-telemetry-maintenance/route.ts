import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { NextResponse } from "next/server";

import { requireDiscoveryDatabaseUrl } from "../../../../db/config";
import { createHostedAlphaTelemetryComposition } from "../../../../lib/telemetry/alphaTelemetryComposition";
import { runAlphaTelemetryMaintenance } from "../../../../lib/telemetry/alphaTelemetryMaintenance";

export const dynamic = "force-dynamic";

function authorized(request:Request):boolean {
  const secret=process.env.CRON_SECRET;
  return Boolean(secret&&request.headers.get("authorization")===`Bearer ${secret}`);
}

export async function GET(request:Request) {
  if(!authorized(request))return NextResponse.json({status:"unauthorized"},{status:401});
  const sql=postgres(requireDiscoveryDatabaseUrl("application"),{max:1});
  try {
    const composition=createHostedAlphaTelemetryComposition({sql});
    if(!composition)throw new Error("Alpha telemetry maintenance configuration unavailable.");
    const receipt=await runAlphaTelemetryMaintenance({invocationId:`alpha-telemetry-maintenance:${randomUUID()}`,now:composition.now,repository:composition.repository,consent:composition.consent,operators:composition.operators});
    return NextResponse.json(receipt,{status:200});
  } catch {
    return NextResponse.json({status:"unavailable"},{status:503});
  } finally { await sql.end({timeout:1}); }
}
