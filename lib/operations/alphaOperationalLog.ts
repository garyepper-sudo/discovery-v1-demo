import "server-only";

type AlphaOperationalEvent =
  | "alpha.request.started"
  | "alpha.access.denied"
  | "alpha.runtime.failed"
  | "alpha.database.failed"
  | "alpha.audit.failed"
  | "alpha.disclosure.completed";

export function writeAlphaOperationalLog(input: {
  event: AlphaOperationalEvent;
  requestId: string;
  organizationId?: string;
  outcome: "started" | "allowed" | "denied" | "failed";
  reason?: string;
}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level: input.outcome === "failed" ? "error" : "info",
    service: "discovery",
    event: input.event,
    requestId: input.requestId,
    ...(input.organizationId
      ? { organizationId: input.organizationId }
      : {}),
    outcome: input.outcome,
    ...(input.reason ? { reason: input.reason } : {}),
  };
  const line = JSON.stringify(entry);
  if (input.outcome === "failed") console.error(line);
  else console.info(line);
}
