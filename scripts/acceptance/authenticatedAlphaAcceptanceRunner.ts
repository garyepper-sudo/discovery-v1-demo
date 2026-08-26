import { spawn } from "node:child_process";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ACCEPTANCE_FRAMEWORK_ID,
  ACCEPTANCE_FRAMEWORK_VERSION,
  acceptanceDigest,
  assertAcceptanceMeasurementEnvelopeV1,
  type AcceptanceMeasurementEnvelopeV1,
  type AcceptanceProfileRequirementsV1,
  type PhaseCategory,
  type ProducerCategory,
} from "./authenticatedAlphaAcceptanceContracts";
import { readProtectedManifest } from "./authenticatedAlphaAcceptanceTaskManifest";
export type AcceptanceProducerStageV1 = Readonly<{
  token: string;
  category: AcceptanceMeasurementChildDiagnostic["producerStageCategory"];
}>;
export type AcceptanceProducerSourceManifestV1 = Readonly<{schemaVersion:"1";sourceDigest:string;entries:readonly Readonly<{script:string;scriptDigest:string}>[];authorityMac:string;manifestDigest:string}>;
export type AcceptanceProducerDescriptorV1 = Readonly<{
  schemaVersion: "1";
  script: string;
  mode: string;
  environmentKeys: readonly string[];
  profileId: string;
  profileVersion: string;
  producer: ProducerCategory;
  phase: PhaseCategory;
  sequence: number;
  stages: readonly AcceptanceProducerStageV1[];
  timeoutMs: number;
  scriptDigest: string;
  sourceManifestDigest: string;
  descriptorDigest: string;
}>;
export type AcceptanceProducerRegistryV1 = Readonly<{
  schemaVersion: "1";
  sourceManifest: AcceptanceProducerSourceManifestV1;
  descriptors: readonly AcceptanceProducerDescriptorV1[];
  registryDigest: string;
}>;
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
const descriptorKeys = ["schemaVersion","script","mode","environmentKeys","profileId","profileVersion","producer","phase","sequence","stages","timeoutMs","scriptDigest","sourceManifestDigest","descriptorDigest"].sort().join("\0");
const digest = (value: string | object) => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
const safeId = (value: string) => /^[a-z][a-z0-9-]{2,95}$/.test(value);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const approvedRoot = resolve(repositoryRoot,"scripts/acceptance");
const ownedRegistries = new WeakSet<object>();
const inspectScript = async (script: string) => {
  if (!/^scripts\/acceptance\/[A-Za-z0-9][A-Za-z0-9.-]*\.ts$/.test(script) || script.includes("..")) throw new Error("Acceptance producer path is invalid");
  const absolute=resolve(repositoryRoot,script), rel=relative(approvedRoot,absolute);
  if (!rel || rel.startsWith(`..${sep}`) || rel === "..") throw new Error("Acceptance producer path is invalid");
  const stat=await lstat(absolute);if(!stat.isFile()||stat.isSymbolicLink())throw new Error("Acceptance producer path is invalid");
  if(await realpath(absolute)!==absolute)throw new Error("Acceptance producer path is invalid");
  return digest(await readFile(absolute));
};
export async function inspectAcceptanceProducerSourceEntriesV1(scripts:readonly string[]){const entries=[] as {script:string;scriptDigest:string}[];for(const script of [...scripts].sort())entries.push({script,scriptDigest:await inspectScript(script)});return entries;}
export async function createAcceptanceProducerSourceManifestV1(input:{sourceDigest:string;scripts:readonly string[];authorityMac:string;taskOwnership:Readonly<{manifestPath:string;secret:Buffer}>}):Promise<AcceptanceProducerSourceManifestV1>{if(!/^[a-f0-9]{64}$/.test(input.sourceDigest)||!input.scripts.length||new Set(input.scripts).size!==input.scripts.length||!/^[a-f0-9]{64}$/.test(input.authorityMac))throw new Error("Acceptance producer source manifest is invalid");const protectedManifest=await readProtectedManifest(await realpath(resolve(input.taskOwnership.manifestPath)),input.taskOwnership.secret);if(protectedManifest.sourceDigest!==input.sourceDigest)throw new Error("Acceptance producer source authority is invalid");const frozen=Object.freeze((await inspectAcceptanceProducerSourceEntriesV1(input.scripts)).map(value=>Object.freeze(value))),payload={schemaVersion:"1" as const,sourceDigest:input.sourceDigest,entries:frozen},expected=createHmac("sha256",input.taskOwnership.secret).update(JSON.stringify(payload)).digest("hex");if(!timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(input.authorityMac,"hex")))throw new Error("Acceptance producer source authority is invalid");const manifestDigest=digest(payload);return Object.freeze({...payload,authorityMac:input.authorityMac,manifestDigest});}
export async function createAcceptanceProducerDescriptorV1(input:Omit<AcceptanceProducerDescriptorV1,"schemaVersion"|"scriptDigest"|"descriptorDigest">):Promise<AcceptanceProducerDescriptorV1>{
  if(!safeId(input.profileId)||!safeId(input.profileVersion)||!safeId(input.mode)||!Number.isSafeInteger(input.sequence)||input.sequence<1||!Number.isSafeInteger(input.timeoutMs)||input.timeoutMs<1_000||input.timeoutMs>900_000||!input.stages.length)throw new Error("Acceptance producer descriptor is invalid");
  const environmentKeys=[...input.environmentKeys];if(new Set(environmentKeys).size!==environmentKeys.length||environmentKeys.some(value=>!/^AR2_PRE_001B_[A-Z0-9_]+$/.test(value)))throw new Error("Acceptance producer environment contract is invalid");
  const tokens=new Set<string>();for(const stage of input.stages){if(Object.keys(stage).sort().join("\0")!=="category\0token"||!safeId(stage.token)||tokens.has(stage.token)||!["bootstrap","execution","measurement","cleanup"].includes(stage.category))throw new Error("Acceptance producer descriptor is invalid");tokens.add(stage.token);}
  const scriptDigest=await inspectScript(input.script),canonical={...input,environmentKeys:Object.freeze(environmentKeys),stages:Object.freeze(input.stages.map(value=>Object.freeze({...value})))},unsigned={schemaVersion:"1" as const,...canonical,scriptDigest},descriptorDigest=digest(unsigned);return Object.freeze({...unsigned,descriptorDigest});
}
export function createAcceptanceProducerRegistryV1(sourceManifest:AcceptanceProducerSourceManifestV1,descriptors:readonly AcceptanceProducerDescriptorV1[]):AcceptanceProducerRegistryV1{
  if(sourceManifest.manifestDigest!==digest({schemaVersion:"1",sourceDigest:sourceManifest.sourceDigest,entries:sourceManifest.entries})||sourceManifest.entries.some(entry=>Object.keys(entry).sort().join("\0")!=="script\0scriptDigest"))throw new Error("Acceptance producer source manifest is invalid");
  if(!descriptors.length)throw new Error("Acceptance producer registry is invalid");const identities=new Set<string>(),digests=new Set<string>();
  const owned:AcceptanceProducerDescriptorV1[]=[];for(const value of descriptors){if(Object.keys(value).sort().join("\0")!==descriptorKeys||value.sourceManifestDigest!==sourceManifest.manifestDigest||!sourceManifest.entries.some(entry=>entry.script===value.script&&entry.scriptDigest===value.scriptDigest))throw new Error("Acceptance producer registry is invalid");const{descriptorDigest,...unsigned}=value;if(descriptorDigest!==digest(unsigned))throw new Error("Acceptance producer descriptor digest is invalid");const identity=`${value.profileId}:${value.profileVersion}:${value.producer}:${value.phase}`;if(identities.has(identity)||digests.has(descriptorDigest))throw new Error("Acceptance producer registry is duplicated");identities.add(identity);digests.add(descriptorDigest);owned.push(Object.freeze({...value,environmentKeys:Object.freeze([...value.environmentKeys]),stages:Object.freeze(value.stages.map(stage=>Object.freeze({...stage})))}));}
  const frozen=Object.freeze(owned),ownedManifest=Object.freeze({...sourceManifest,entries:Object.freeze(sourceManifest.entries.map(entry=>Object.freeze({...entry})))}),registry=Object.freeze({schemaVersion:"1" as const,sourceManifest:ownedManifest,descriptors:frozen,registryDigest:digest({schemaVersion:"1",sourceManifestDigest:ownedManifest.manifestDigest,descriptorDigests:frozen.map(value=>value.descriptorDigest)})});ownedRegistries.add(registry);return registry;
}
const producerStage = (stderr: string, descriptor:AcceptanceProducerDescriptorV1) => {
  const markers = stderr
      .split("\n")
      .filter((line) => line.startsWith("AR2_PRE001B_PRODUCER_FAILED:")),
    tokens = markers.map((line) =>
      line.slice("AR2_PRE001B_PRODUCER_FAILED:".length),
    );
  const stages=new Map(descriptor.stages.map(value=>[value.token,value.category]));
  return markers.length === 1 && stages.has(tokens[0]!)
    ? stages.get(tokens[0]!)!
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
  descriptor:AcceptanceProducerDescriptorV1,
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
                : value.sequence !== descriptor.sequence
                  ? "sequence-mismatch"
                  : "matched";
export async function runAcceptanceMeasurementChild(input: {
  descriptor: AcceptanceProducerDescriptorV1;
  registry: AcceptanceProducerRegistryV1;
  profile: AcceptanceProfileRequirementsV1;
  request: ChildMeasurementRequest;
  taskOwnership: Readonly<{root:string;manifestPath:string;secret:Buffer}>;
  producerEnvironment?: Readonly<Record<string, string>>;
}): Promise<AcceptanceMeasurementChildResult> {
  const supplied=input.descriptor,registered=input.registry.descriptors.find(value=>value.descriptorDigest===supplied.descriptorDigest),descriptor=registered??supplied,requirement=input.profile.requiredMeasurements.find(value=>value.producer===descriptor.producer&&value.phase===descriptor.phase),expectedSequence=input.profile.requiredMeasurements.findIndex(value=>value.producer===descriptor.producer&&value.phase===descriptor.phase)+1,providedEnvironment=input.producerEnvironment??{},providedKeys=Object.keys(providedEnvironment).sort(),allowedKeys=[...descriptor.environmentKeys].sort();
  const requestedRoot=resolve(input.taskOwnership.root),taskRoot=await realpath(requestedRoot),manifestPath=await realpath(resolve(input.taskOwnership.manifestPath)),rootStat=await lstat(taskRoot),manifest=await readProtectedManifest(manifestPath,input.taskOwnership.secret),environmentPaths=await Promise.all(Object.values(providedEnvironment).map(async value=>realpath(resolve(value))));
  if (!rootStat.isDirectory()||rootStat.isSymbolicLink()||relative(taskRoot,manifestPath).startsWith("..")||manifest.taskDigest!==input.request.taskDigest||manifest.sourceDigest!==input.request.sourceDigest||input.registry.sourceManifest.sourceDigest!==input.request.sourceDigest||environmentPaths.some(value=>{const rel=relative(taskRoot,value);return !rel||rel===".."||rel.startsWith(`..${sep}`);})||!ownedRegistries.has(input.registry)||!registered||JSON.stringify(supplied)!==JSON.stringify(registered)||Object.keys(descriptor).sort().join("\0")!==descriptorKeys||descriptor.descriptorDigest!==digest(Object.fromEntries(Object.entries(descriptor).filter(([key])=>key!=="descriptorDigest")))||input.registry.registryDigest!==digest({schemaVersion:"1",sourceManifestDigest:input.registry.sourceManifest.manifestDigest,descriptorDigests:input.registry.descriptors.map(value=>value.descriptorDigest)})||descriptor.sourceManifestDigest!==input.registry.sourceManifest.manifestDigest||!input.registry.sourceManifest.entries.some(entry=>entry.script===descriptor.script&&entry.scriptDigest===descriptor.scriptDigest)||!requirement||expectedSequence!==descriptor.sequence||descriptor.profileId!==input.profile.profile.id||descriptor.profileVersion!==input.profile.profile.version||input.request.profileId!==descriptor.profileId||input.request.profileVersion!==descriptor.profileVersion||input.request.producer!==descriptor.producer||input.request.phase!==descriptor.phase||providedKeys.join("\0")!==allowedKeys.join("\0")||providedKeys.some(key=>typeof providedEnvironment[key]!=="string"||providedEnvironment[key]!.includes("\0"))||await inspectScript(descriptor.script)!==descriptor.scriptDigest)
    throw new Error("Acceptance producer invocation is invalid");
  return await new Promise<AcceptanceMeasurementChildResult>(
    (resolveResult) => {
      const child = spawn(
        process.execPath,
        [
          "--conditions=react-server",
          "--import",
          "tsx",
          resolve(repositoryRoot,descriptor.script),
          descriptor.mode,
        ],
        {
          cwd: repositoryRoot,
          env: {
            PATH: "/usr/local/bin:/usr/bin:/bin",
            TMPDIR: "/private/tmp",
            TZ: "UTC",
            LANG: "C",
            NODE_ENV: "test",
            ...providedEnvironment,
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
        }, descriptor.timeoutMs);
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
          stage: producerStage(stderr,descriptor),
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
          identity = identityCategory(value, input.request,descriptor);
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
