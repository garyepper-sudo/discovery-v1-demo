import "server-only";

import { createOrganizationIdentityReconciliationPostHandler } from "../../../../lib/alpha-provisioning/productionOrganizationIdentityReconciliationRoute";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> { return createOrganizationIdentityReconciliationPostHandler()(request); }
export async function GET(): Promise<Response> { return new Response("Not found.", { status: 404, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } }); }
