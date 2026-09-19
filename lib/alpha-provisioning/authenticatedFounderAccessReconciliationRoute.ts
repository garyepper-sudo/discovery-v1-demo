import { AuthenticatedFounderAccessReconciliationError, AuthenticatedFounderAccessUnauthenticatedError, inspectAuthenticatedFounderAccess } from "./authenticatedFounderAccessReconciliationOperation";

const privateResponse = (status: number, body: string) => new Response(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } });
export function createAuthenticatedFounderAccessGetHandler(operation = inspectAuthenticatedFounderAccess) { return async (): Promise<Response> => {
  try { return Response.json(await operation(), { headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } }); }
  catch (error) { return error instanceof AuthenticatedFounderAccessUnauthenticatedError ? privateResponse(401, "Unauthorized.") : error instanceof AuthenticatedFounderAccessReconciliationError ? privateResponse(409, "Founder access reconciliation unavailable.") : privateResponse(409, "Founder access reconciliation unavailable."); }
}; }
