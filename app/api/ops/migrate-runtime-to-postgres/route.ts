import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { migrateProductionRuntimeToPostgres } from "../../../../lib/alpha-provisioning/productionRuntimeMigrationOperation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateResponse = (status: number, body: string) => new Response(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } });
function authorized(request: Request): boolean {
  const expected = process.env.DISCOVERY_RUNTIME_MIGRATION_SECRET;
  const supplied = request.headers.get("authorization");
  if (!expected || expected.length < 32 || !supplied?.startsWith("Bearer ")) return false;
  return timingSafeEqual(createHash("sha256").update(expected).digest(), createHash("sha256").update(supplied.slice(7)).digest());
}
export async function POST(request: Request): Promise<Response> {
  if (process.env.VERCEL_ENV !== "production" || process.env.NODE_ENV !== "production") return privateResponse(404, "Not found.");
  if (!authorized(request)) return privateResponse(401, "Unauthorized.");
  if ((request.headers.get("content-length") ?? "0") !== "0") return privateResponse(400, "Invalid request.");
  try { return Response.json(await migrateProductionRuntimeToPostgres(), { headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } }); }
  catch { return privateResponse(409, "Runtime migration operation failed."); }
}
export async function GET(): Promise<Response> { return privateResponse(404, "Not found."); }
