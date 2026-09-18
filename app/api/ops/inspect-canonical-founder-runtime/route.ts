import "server-only";

import { createCanonicalFounderRuntimePreservationPostHandler } from "../../../../lib/alpha-provisioning/productionCanonicalFounderRuntimePreservationRoute";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> { return createCanonicalFounderRuntimePreservationPostHandler()(request); }
export async function GET(): Promise<Response> { return new Response("Not found.", { status: 404, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } }); }
