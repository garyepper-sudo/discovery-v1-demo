import "server-only";
import { createAuthenticatedFounderAccessGetHandler } from "../../../../lib/alpha-provisioning/authenticatedFounderAccessReconciliationRoute";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(): Promise<Response> { return createAuthenticatedFounderAccessGetHandler()(); }
export async function POST(): Promise<Response> { return new Response("Not found.", { status: 404, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } }); }
