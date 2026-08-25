import { spawn } from "node:child_process";
import { resolve } from "node:path";
import {
  ACCEPTANCE_FRAMEWORK_ID,
  ACCEPTANCE_FRAMEWORK_VERSION,
  acceptanceDigest,
  assertAcceptanceMeasurementEnvelopeV1,
  type AcceptanceMeasurementEnvelopeV1,
  type PhaseCategory,
  type ProducerCategory,
} from "./authenticatedAlphaAcceptanceContracts";
export type ChildMeasurementRequest = {
  frameworkId: typeof ACCEPTANCE_FRAMEWORK_ID;
  frameworkVersion: typeof ACCEPTANCE_FRAMEWORK_VERSION;
  profileId: string;
  profileVersion: string;
  sourceDigest: string;
  taskDigest: string;
  runDigest: string;
  producer: ProducerCategory;
  phase: PhaseCategory;
};
export type ChildProcessDiagnostic = {
  outcome:
    | "child_process_terminated_before_execution_phase"
    | "child_process_completed";
  spawn: "succeeded" | "failed";
  executionPhaseCount: number;
  measurementCount: number;
  exit: "zero" | "nonzero" | "unavailable";
  signal: "none" | "terminated" | "killed" | "other";
  protocol: "complete" | "incomplete" | "invalid";
};
export type AcceptanceMeasurementChildDiagnostic = {
  schemaVersion: "1";
  producerCategory: ProducerCategory;
  phaseCategory: PhaseCategory;
  spawnCategory: "not-attempted" | "spawned" | "spawn-failed";
  exitCategory: "not-observed" | "zero" | "nonzero";
  signalCategory: "none" | "terminated";
  timeoutCategory: "none" | "expired";
  protocolCategory:
    | "not-established"
    | "bootstrap-observed"
    | "execution-phase-observed"
    | "envelope-observed"
    | "malformed";
  producerStageCategory:
    | "not-observed"
    | "bootstrap"
    | "execution"
    | "measurement"
    | "cleanup";
  envelopePresenceCategory: "absent" | "present";
  structuralAdmissionCategory:
    | "not-attempted"
    | "accepted"
    | "rejected-schema"
    | "rejected-digest"
    | "rejected-duplicate"
    | "rejected-conflict"
    | "rejected-identity";
  identityBindingCategory:
    | "not-evaluated"
    | "matched"
    | "framework-mismatch"
    | "profile-mismatch"
    | "source-mismatch"
    | "task-mismatch"
    | "run-mismatch"
    | "producer-mismatch"
    | "phase-mismatch"
    | "sequence-mismatch";
};
export type AcceptanceMeasurementChildResult =
  | {
      outcome: "accepted-envelope";
      diagnostic: AcceptanceMeasurementChildDiagnostic;
      measurement: AcceptanceMeasurementEnvelopeV1;
      stdout: string;
      stderr: string;
    }
  | {
      outcome: "child-production-failure" | "parent-admission-rejection";
      diagnostic: AcceptanceMeasurementChildDiagnostic;
      stdout: string;
      stderr: string;
    };
export function classifyAcceptanceChildProcess(input: {
  status: number | null;
  signal: string | null;
  errorCode?: string;
  stdout: string;
}): ChildProcessDiagnostic {
  const lines = input.stdout.split("\n").filter(Boolean);
  let executionPhaseCount = 0,
    measurementCount = 0,
    invalid = false;
  for (const line of lines)
    try {
      const value = JSON.parse(line);
      if (value?.kind === "execution-phase") executionPhaseCount++;
      else if (value?.kind === "browser-measurement") measurementCount++;
      else invalid = true;
    } catch {
      invalid = true;
    }
  const complete =
    !invalid &&
    executionPhaseCount === 1 &&
    measurementCount === 1 &&
    input.status === 0;
  return {
    outcome: complete
      ? "child_process_completed"
      : "child_process_terminated_before_execution_phase",
    spawn: input.errorCode ? "failed" : "succeeded",
    executionPhaseCount,
    measurementCount,
    exit:
      input.status === 0
        ? "zero"
        : typeof input.status === "number"
          ? "nonzero"
          : "unavailable",
    signal:
      input.signal === null
        ? "none"
        : input.signal === "SIGTERM"
          ? "terminated"
          : input.signal === "SIGKILL"
            ? "killed"
            : "other",
    protocol: invalid ? "invalid" : complete ? "complete" : "incomplete",
  };
}
const allowedScripts = new Set([
  "scripts/acceptance/ar3ReplayObservabilityMeasurementProducer.ts",
  "scripts/acceptance/validateAr3CurrentBuildConformance.ts",
]);
const stageTokens = new Map<
  string,
  AcceptanceMeasurementChildDiagnostic["producerStageCategory"]
>([
  ["initialize", "bootstrap"],
  ["replay-enabled", "execution"],
  ["replay-repeat", "execution"],
  ["replay-disabled", "execution"],
  ["replay-rejecting", "execution"],
  ["replay-throwing", "execution"],
  ["replay-compare", "execution"],
  ["parity", "execution"],
  ["typed-runtime", "execution"],
  ["typed-recovery", "execution"],
  ["typed-cas", "execution"],
  ["owner-inventory", "execution"],
  ["measurement-envelope", "measurement"],
]);
const producerStage = (stderr: string) => {
  const markers = stderr
      .split("\n")
      .filter((line) => line.startsWith("AR2_PRE001B_PRODUCER_FAILED:")),
    tokens = markers.map((line) =>
      line.slice("AR2_PRE001B_PRODUCER_FAILED:".length),
    );
  return markers.length === 1 && stageTokens.has(tokens[0]!)
    ? stageTokens.get(tokens[0]!)!
    : ("not-observed" as const);
};
const diagnostic = (input: {
  request: ChildMeasurementRequest;
  spawn?: AcceptanceMeasurementChildDiagnostic["spawnCategory"];
  exit?: AcceptanceMeasurementChildDiagnostic["exitCategory"];
  signal?: AcceptanceMeasurementChildDiagnostic["signalCategory"];
  timeout?: AcceptanceMeasurementChildDiagnostic["timeoutCategory"];
  protocol?: AcceptanceMeasurementChildDiagnostic["protocolCategory"];
  stage?: AcceptanceMeasurementChildDiagnostic["producerStageCategory"];
  envelope?: AcceptanceMeasurementChildDiagnostic["envelopePresenceCategory"];
  admission?: AcceptanceMeasurementChildDiagnostic["structuralAdmissionCategory"];
  identity?: AcceptanceMeasurementChildDiagnostic["identityBindingCategory"];
}): AcceptanceMeasurementChildDiagnostic => ({
  schemaVersion: "1",
  producerCategory: input.request.producer,
  phaseCategory: input.request.phase,
  spawnCategory: input.spawn ?? "not-attempted",
  exitCategory: input.exit ?? "not-observed",
  signalCategory: input.signal ?? "none",
  timeoutCategory: input.timeout ?? "none",
  protocolCategory: input.protocol ?? "not-established",
  producerStageCategory: input.stage ?? "not-observed",
  envelopePresenceCategory: input.envelope ?? "absent",
  structuralAdmissionCategory: input.admission ?? "not-attempted",
  identityBindingCategory: input.identity ?? "not-evaluated",
});
const identityCategory = (
  value: AcceptanceMeasurementEnvelopeV1,
  request: ChildMeasurementRequest,
): AcceptanceMeasurementChildDiagnostic["identityBindingCategory"] =>
  value.framework.id !== request.frameworkId ||
  value.framework.version !== request.frameworkVersion
    ? "framework-mismatch"
    : value.profile.id !== request.profileId ||
        value.profile.version !== request.profileVersion
      ? "profile-mismatch"
      : value.sourceDigest !== request.sourceDigest
        ? "source-mismatch"
        : value.taskDigest !== request.taskDigest
          ? "task-mismatch"
          : value.producerRunDigest !== request.runDigest
            ? "run-mismatch"
            : value.producer !== request.producer
              ? "producer-mismatch"
              : value.phase !== request.phase
                ? "phase-mismatch"
                : value.sequence !==
                    (request.producer === "replay-recovery"
                      ? 2
                      : request.producer === "observability"
                        ? 3
                        : value.sequence)
                  ? "sequence-mismatch"
                  : "matched";
export async function runAcceptanceMeasurementChild(input: {
  script: string;
  mode: string;
  request: ChildMeasurementRequest;
  env?: Record<string, string | undefined>;
  timeoutMs?: number;
}): Promise<AcceptanceMeasurementChildResult> {
  if (
    !allowedScripts.has(input.script) ||
    !/^[a-z][a-z0-9-]{2,63}$/.test(input.mode)
  )
    throw new Error("Acceptance producer invocation is invalid");
  return await new Promise<AcceptanceMeasurementChildResult>(
    (resolveResult) => {
      const child = spawn(
        process.execPath,
        [
          "--conditions=react-server",
          "--import",
          "tsx",
          resolve(input.script),
          input.mode,
        ],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            ...input.env,
            AR2_PRE_001B_MEASUREMENT_REQUEST: Buffer.from(
              JSON.stringify(input.request),
            ).toString("base64"),
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let stdout = "",
        stderr = "",
        settled = false,
        timedOut = false;
      const finish = (value: AcceptanceMeasurementChildResult) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolveResult(value);
        },
        timer = setTimeout(() => {
          timedOut = true;
          if (child.exitCode === null) child.kill("SIGTERM");
        }, input.timeoutMs ?? 180_000);
      child.stdout.on("data", (value) => (stdout += String(value)));
      child.stderr.on("data", (value) => (stderr += String(value)));
      child.once("error", () =>
        finish({
          outcome: "child-production-failure",
          diagnostic: diagnostic({
            request: input.request,
            spawn: "spawn-failed",
          }),
          stdout,
          stderr,
        }),
      );
      child.once("exit", (code, signal) => {
        if (settled) return;
        const base = {
          request: input.request,
          spawn: "spawned" as const,
          exit: code === 0 ? ("zero" as const) : ("nonzero" as const),
          signal: signal ? ("terminated" as const) : ("none" as const),
          timeout: timedOut ? ("expired" as const) : ("none" as const),
          stage: producerStage(stderr),
        };
        if (code !== 0 || signal || timedOut)
          return finish({
            outcome: "child-production-failure",
            diagnostic: diagnostic({
              ...base,
              protocol:
                base.stage === "not-observed"
                  ? "not-established"
                  : "bootstrap-observed",
            }),
            stdout,
            stderr,
          });
        const lines = stdout.split("\n").filter(Boolean);
        if (lines.length !== 1)
          return finish({
            outcome: "child-production-failure",
            diagnostic: diagnostic({
              ...base,
              protocol: lines.length ? "malformed" : "not-established",
            }),
            stdout,
            stderr,
          });
        let candidate: unknown;
        try {
          candidate = JSON.parse(lines[0]!);
        } catch {
          return finish({
            outcome: "child-production-failure",
            diagnostic: diagnostic({ ...base, protocol: "malformed" }),
            stdout,
            stderr,
          });
        }
        if (
          !candidate ||
          typeof candidate !== "object" ||
          Array.isArray(candidate)
        )
          return finish({
            outcome: "parent-admission-rejection",
            diagnostic: diagnostic({
              ...base,
              protocol: "envelope-observed",
              envelope: "present",
              admission: "rejected-schema",
            }),
            stdout,
            stderr,
          });
        const record = candidate as Record<string, unknown>,
          { measurementDigest, ...unsigned } = record;
        if (
          typeof measurementDigest !== "string" ||
          measurementDigest !== acceptanceDigest(unsigned)
        )
          return finish({
            outcome: "parent-admission-rejection",
            diagnostic: diagnostic({
              ...base,
              protocol: "envelope-observed",
              envelope: "present",
              admission: "rejected-digest",
            }),
            stdout,
            stderr,
          });
        try {
          assertAcceptanceMeasurementEnvelopeV1(candidate);
        } catch {
          return finish({
            outcome: "parent-admission-rejection",
            diagnostic: diagnostic({
              ...base,
              protocol: "envelope-observed",
              envelope: "present",
              admission: "rejected-schema",
            }),
            stdout,
            stderr,
          });
        }
        const value = candidate as AcceptanceMeasurementEnvelopeV1,
          identity = identityCategory(value, input.request);
        if (identity !== "matched")
          return finish({
            outcome: "parent-admission-rejection",
            diagnostic: diagnostic({
              ...base,
              protocol: "envelope-observed",
              envelope: "present",
              admission: "rejected-identity",
              identity,
            }),
            stdout,
            stderr,
          });
        return finish({
          outcome: "accepted-envelope",
          diagnostic: diagnostic({
            ...base,
            protocol: "envelope-observed",
            stage: "measurement",
            envelope: "present",
            admission: "accepted",
            identity: "matched",
          }),
          measurement: value,
          stdout,
          stderr,
        });
      });
    },
  );
}
