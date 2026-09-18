import { createHash, timingSafeEqual } from "node:crypto";

import { CanonicalFounderRuntimePreservationOperationError, inspectCanonicalFounderRuntimePreservation } from "./productionCanonicalFounderRuntimePreservationOperation";

const headers = { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" };
const privateResponse = (status: number, body: string) => new Response(body, { status, headers });
const authorized = (request: Request): boolean => {
  const expected = process.env.DISCOVERY_CANONICAL_FOUNDER_RUNTIME_PRESERVATION_SECRET;
  const supplied = request.headers.get("authorization");
  return Boolean(expected && expected.length >= 32 && supplied?.startsWith("Bearer ") && timingSafeEqual(createHash("sha256").update(expected).digest(), createHash("sha256").update(supplied.slice(7)).digest()));
};
export function createCanonicalFounderRuntimePreservationPostHandler(operation = inspectCanonicalFounderRuntimePreservation) { return async (request: Request): Promise<Response> => {
  if (process.env.VERCEL_ENV !== "production" || process.env.NODE_ENV !== "production") return privateResponse(404, "Not found.");
  if (!authorized(request)) return privateResponse(401, "Unauthorized.");
  if ((request.headers.get("content-length") ?? "0") !== "0") return privateResponse(400, "Invalid request.");
  try { return Response.json(await operation(), { headers }); }
  catch (error) { return error instanceof CanonicalFounderRuntimePreservationOperationError ? Response.json(error.receipt, { status: 409, headers }) : privateResponse(409, "Canonical founder Runtime preservation diagnostic failed."); }
}; }
