import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type MeetingPackBuildTraceStage =
  | "request-received" | "server-action-entered" | "transport-normalized"
  | "authenticated-request-resolved" | "participant-resolved" | "opaque-meeting-resolved"
  | "organization-access-allowed" | "meeting-access-allowed" | "preparation-open-verified"
  | "current-scope-resolved" | "current-prepared-work-resolved" | "contract3-access-allowed"
  | "source-material-authorized" | "source-material-built" | "pack-identity-derived"
  | "composer-entered" | "composer-completed" | "publication-entered" | "publication-completed"
  | "artifact-body-write-entered" | "artifact-body-write-completed" | "canonical-reread-entered"
  | "canonical-reread-found" | "action-success-returned" | "action-failed";

type TraceEvent = { attempt: string; recordedAt: string; stage: MeetingPackBuildTraceStage; result: "entered" | "completed" | "failed"; errorClass?: string; errorMessage?: string };
let activeTrace: ReturnType<typeof createMeetingPackBuildTrace>;
export function currentMeetingPackBuildTrace() { return activeTrace; }

/** Content-safe, local-only trace for one founder Build request. */
export function createMeetingPackBuildTrace(): ((stage: MeetingPackBuildTraceStage, result?: TraceEvent["result"], error?: unknown) => void) | undefined {
  if (process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED !== "true") return undefined;
  const file = process.env.DISCOVERY_MEETING_PACK_TRACE_PATH ?? path.join(process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_RUNTIME_ROOT ?? "/Users/garyepper/Library/Application Support/Discovery/founder-local-alpha-epoch2", "logs", "meeting-pack-build-stage.jsonl");
  if (!file || !path.isAbsolute(file)) return undefined;
  const attempt = randomUUID();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  try { if (!fs.existsSync(file)) fs.writeFileSync(file, "", { mode: 0o600 }); fs.chmodSync(file, 0o600); } catch { return undefined; }
  const trace = (stage: MeetingPackBuildTraceStage, result: TraceEvent["result"] = "entered", error?: unknown) => {
    const event: TraceEvent = { attempt, recordedAt: new Date().toISOString(), stage, result };
    if (error instanceof Error) { event.errorClass = error.constructor.name; event.errorMessage = error.message.slice(0, 240); }
    try { fs.appendFileSync(file, `${JSON.stringify(event)}\n`, { encoding: "utf8", mode: 0o600 }); } catch { /* diagnostics must never alter product behavior */ }
  };
  activeTrace = trace;
  return trace;
}
