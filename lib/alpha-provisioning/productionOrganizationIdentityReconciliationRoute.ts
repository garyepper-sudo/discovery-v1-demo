import { createHash, timingSafeEqual } from "node:crypto";

import { OrganizationIdentityReconciliationOperationError, reconcileProductionOrganizationIdentity } from "./productionOrganizationIdentityReconciliationOperation";

const privateResponse = (status: number, body: string) => new Response(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } });
const authorized = (request: Request): boolean => {
  const expected = process.env.DISCOVERY_ORGANIZATION_IDENTITY_RECONCILIATION_SECRET, supplied = request.headers.get("authorization");
  return Boolean(expected && expected.length >= 32 && supplied?.startsWith("Bearer ") && timingSafeEqual(createHash("sha256").update(expected).digest(), createHash("sha256").update(supplied.slice(7)).digest()));
};
export function createOrganizationIdentityReconciliationPostHandler(operation = reconcileProductionOrganizationIdentity) { return async (request: Request): Promise<Response> => {
  if (process.env.VERCEL_ENV !== "production" || process.env.NODE_ENV !== "production") return privateResponse(404, "Not found.");
  if (!authorized(request)) return privateResponse(401, "Unauthorized.");
  if ((request.headers.get("content-length") ?? "0") !== "0") return privateResponse(400, "Invalid request.");
  try { return Response.json(await operation(), { headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } }); }
  catch (error) { return error instanceof OrganizationIdentityReconciliationOperationError ? Response.json(error.receipt, { status: 409, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } }) : privateResponse(409, "Organization identity reconciliation failed."); }
}; }
