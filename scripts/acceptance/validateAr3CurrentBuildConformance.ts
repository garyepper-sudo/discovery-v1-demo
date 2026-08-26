import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash, createHmac, randomBytes } from "node:crypto";
import {
  access,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  acceptanceDigest,
  assertAcceptanceProfileRequirementsV1,
  createAcceptanceMeasurementEnvelopeV1,
  observationStates,
  type AcceptanceMeasurementEnvelopeV1,
  type AcceptanceProfileRequirementsV1,
} from "./authenticatedAlphaAcceptanceContracts";
import { adjudicateAuthenticatedAlphaAcceptance } from "./authenticatedAlphaAcceptanceAdjudicator";
import { ar3CurrentBuildProfile } from "./ar3CurrentBuildAcceptanceProfile";
import {
  createAcceptanceTaskManifest,
  createClerkIdentityInventoryReceipt,
  createPartialClerkIdentityInventoryReceipt,
  createTaskSecret,
  readClerkIdentityInventoryReceipt,
  readProtectedManifest,
  writeClerkIdentityInventoryReceipt,
  writeProtectedManifest,
  type AnyClerkIdentityInventoryReceipt,
  type PartialResourceInventory,
} from "./authenticatedAlphaAcceptanceTaskManifest";
import {
  captureAcceptanceClerkIdentityInventory,
  cleanupAcceptanceClerk,
  provisionAcceptanceUsers,
  verifyAcceptanceClerkZero,
  type ClerkOwnedIdentityInventory,
} from "./authenticatedAlphaClerkLifecycle";
import {
  closeAcceptanceBrowser,
  openAcceptanceBrowser,
  prepareClerkTesting,
  removeAcceptanceBrowserProfileRoots,
  removeBrowserBinaryRoot,
  signInAcceptanceRole,
} from "./authenticatedAlphaBrowserLifecycle";
import {
  currentAcceptanceServerLifecyclePhase,
  removeAcceptanceServerRoot,
  restartAcceptanceServer,
  startAcceptanceServer,
  stopAcceptanceServer,
  type AcceptanceServer,
} from "./authenticatedAlphaServerLifecycle";
import {
  currentBrowserMeasurementPhase,
  executeCeoJourney,
  markBrowserMeasurementPhase,
  observeAuthorizedParity,
  observeDenied,
  observeFreshSuccessorReconstruction,
  observeManagerUnavailable,
} from "./ar3BrowserMeasurementProducer.spec";
import {
  classifyAcceptanceChildProcess,
  createAcceptanceProducerDescriptorV1,
  createAcceptanceProducerRegistryV1,
  createAcceptanceProducerSourceManifestV1,
  inspectAcceptanceProducerSourceEntriesV1,
  runAcceptanceMeasurementChild,
} from "./authenticatedAlphaAcceptanceRunner";
import { scanText } from "../alpha-readiness/protectedValueScanner";

const evidenceRoot =
    "docs/agent-work-orders/evidence/alpha-readiness/ar2-pre-001b",
  jsonPath = path.join(
    evidenceRoot,
    "AR2_PRE_001B_AR3_CURRENT_BUILD_CONFORMANCE_RESULTS.json",
  ),
  reportPath = path.join(
    evidenceRoot,
    "AR2_PRE_001B_AR3_CURRENT_BUILD_CONFORMANCE_REPORT.md",
  );
const sourcePaths = [
  "package.json",
  "package-lock.json",
  "playwright.config.ts",
  "scripts/acceptance/authenticatedAlphaAcceptanceContracts.ts",
  "scripts/acceptance/authenticatedAlphaAcceptanceAdjudicator.ts",
  "scripts/acceptance/authenticatedAlphaAcceptanceTaskManifest.ts",
  "scripts/acceptance/authenticatedAlphaClerkLifecycle.ts",
  "scripts/acceptance/authenticatedAlphaServerLifecycle.ts",
  "scripts/acceptance/authenticatedAlphaBrowserLifecycle.ts",
  "scripts/acceptance/authenticatedAlphaAcceptanceRunner.ts",
  "scripts/acceptance/ar3CurrentBuildAcceptanceProfile.ts",
  "scripts/acceptance/ar3BrowserMeasurementProducer.spec.ts",
  "scripts/acceptance/ar3ReplayObservabilityMeasurementProducer.ts",
  "scripts/acceptance/validateAuthenticatedAlphaAcceptanceRunner.ts",
  "scripts/acceptance/validateAr3CurrentBuildConformance.ts",
] as const;
const sourceBoundaryHead = "1ae9beb2bfcb0dace4c1740d363f9e5c0c9d2b0d",
  evidencePrefix =
    "docs/agent-work-orders/evidence/alpha-readiness/ar2-pre-001b/";
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
let failurePhase = "initialization";

export const AUTHENTICATED_ALPHA_CURRENT_BUILD_API_ID =
  "authenticated-alpha-current-build-observation-api@1" as const;
export const AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID =
  "leadership-conversation-occurrence1-complete-occurrence2-prepared-v1" as const;
export const AUTHENTICATED_ALPHA_ORDINARY_FACT_CATALOG = Object.freeze({
  browser: Object.freeze([
    "browser-journey-ordered",
    "ceo-authorized",
    "director-authorized-parity",
    "manager-unavailable",
    "denied-not-found",
    "desktop-viewport",
    "narrow-viewport",
    "hard-reload-reconstructed",
    "successor-fresh-process-reconstructed",
    "successor-not-started",
    "successor-execution-not-claimed",
  ]),
  lifecycle: Object.freeze([
    "resource-plan-frozen",
    "acknowledgement-loss-recovered",
    "foreign-preserved",
    "organizations-capability-measured",
  ]),
  scanner: Object.freeze(["scanner-sensitive", "public-surfaces-clean"]),
  cleanup: Object.freeze([
    "cleanup-first-attempt",
    "cleanup-second-converged",
    "server-browser-roots-zero",
  ]),
  independentZero: Object.freeze([
    "users-zero",
    "sessions-zero",
    "memberships-zero",
    "organizations-zero-or-disabled",
    "local-residue-zero",
  ]),
});

export type AuthenticatedAlphaCurrentBuildMeasurementInputV1 = Readonly<{
  schemaVersion: "1";
  framework: { id: "authenticated-alpha-acceptance"; version: "1" };
  profile: AcceptanceProfileRequirementsV1;
  sourceDigest: string;
  taskDigest: string;
  runDigest: string;
  taskOwnership: ValidatedAuthenticatedAlphaTaskOwnershipV1;
  journeyProgram: typeof AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID;
  roles: readonly ["ceo", "director", "manager", "denied"];
  viewports: readonly ["desktop-1440x1000", "narrow-390x844"];
  ordinaryFactIds: readonly string[];
}>;
export type AuthenticatedAlphaCurrentBuildObservationsV1=Readonly<{schemaVersion:"1";kind:"authenticated-alpha-current-build-observations";apiIdentity:typeof AUTHENTICATED_ALPHA_CURRENT_BUILD_API_ID;journeyProgram:typeof AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID;framework:Readonly<{id:"authenticated-alpha-acceptance";version:"1"}>;profile:AcceptanceProfileRequirementsV1["profile"];sourceDigest:string;taskDigest:string;runDigest:string;resourcePlanDigest:string;envelopes:readonly AcceptanceMeasurementEnvelopeV1[];capturedSurfaceDigest:string;scanner:Readonly<{sensitivity:number;publicFindings:number}>;cleanup:Readonly<{attempts:number;localRoots:0|1;foreignPreserved:boolean;independentZero:"zero-verified"|"blocked"}>}>;
export type ValidatedAuthenticatedAlphaTaskOwnershipV1 = Readonly<{
  schemaVersion:"1";root:string;manifestPath:string;sourceDigest:string;taskDigest:string;runDigest:string;
  framework:Readonly<{id:"authenticated-alpha-acceptance";version:"1"}>;profile:AcceptanceProfileRequirementsV1;
  manifest:Awaited<ReturnType<typeof readProtectedManifest>>;resourcePlanDigest:string;
}>;
const activeTaskOwnerships=new WeakSet<object>();
const privateTaskSecrets=new WeakMap<object,Buffer>();
function deepFreeze<T>(value:T):T{if(value&&typeof value==="object"&&!Object.isFrozen(value)){for(const child of Object.values(value as Record<string,unknown>))deepFreeze(child);Object.freeze(value);}return value;}
const ordinaryProducerKeys=new Set(["browser:browser-journey","lifecycle:resource-lifecycle","scanner:surface-scan","cleanup:cleanup-attempts","independent-zero:zero-verification"]);
const ordinaryCatalogIds=Object.freeze(Object.values(AUTHENTICATED_ALPHA_ORDINARY_FACT_CATALOG).flat());
export async function validateAuthenticatedAlphaTaskOwnershipV1(input:Readonly<{schemaVersion:"1";root:string;manifestPath:string;secret:Buffer;framework:Readonly<{id:"authenticated-alpha-acceptance";version:"1"}>;profile:AcceptanceProfileRequirementsV1;sourceDigest:string;taskDigest:string;runDigest:string}>):Promise<ValidatedAuthenticatedAlphaTaskOwnershipV1>{
  if(Object.keys(input).sort().join("\0")!==["framework","manifestPath","profile","root","runDigest","schemaVersion","secret","sourceDigest","taskDigest"].sort().join("\0")||input.schemaVersion!=="1"||input.framework.id!=="authenticated-alpha-acceptance"||input.framework.version!=="1"||input.secret.length!==32||!/^[a-f0-9]{64}$/.test(input.sourceDigest)||!/^[a-f0-9]{64}$/.test(input.taskDigest)||!/^[a-f0-9]{64}$/.test(input.runDigest))throw new Error("Authenticated acceptance task ownership is invalid");
  assertAcceptanceProfileRequirementsV1(input.profile);if(input.profile.framework.id!==input.framework.id||input.profile.framework.version!==input.framework.version)throw new Error("Authenticated acceptance task ownership is invalid");
  const requestedRoot=path.resolve(input.root),requestedManifest=path.resolve(input.manifestPath),requestedRootStat=await lstat(requestedRoot),requestedManifestStat=await lstat(requestedManifest);
  if(!requestedRootStat.isDirectory()||requestedRootStat.isSymbolicLink()||(requestedRootStat.mode&0o777)!==0o700||path.dirname(requestedRoot)!=="/private/tmp"||!path.basename(requestedRoot).startsWith("discovery-ar2-pre-001b-task-")||!requestedManifestStat.isFile()||requestedManifestStat.isSymbolicLink())throw new Error("Authenticated acceptance task ownership is invalid");
  const root=await realpath(requestedRoot),manifestPath=await realpath(requestedManifest),relativeManifest=path.relative(root,manifestPath);
  if(!relativeManifest||relativeManifest===".."||relativeManifest.startsWith(`..${path.sep}`))throw new Error("Authenticated acceptance task ownership is invalid");
  const manifest=await readProtectedManifest(manifestPath,input.secret);if(manifest.environment!=="development"||manifest.sourceDigest!==input.sourceDigest||manifest.taskDigest!==input.taskDigest)throw new Error("Authenticated acceptance task ownership is invalid");
  const frozenManifest=deepFreeze(structuredClone(manifest)),frozenProfile=deepFreeze(structuredClone(input.profile)),value=deepFreeze({schemaVersion:"1" as const,root,manifestPath,sourceDigest:input.sourceDigest,taskDigest:input.taskDigest,runDigest:input.runDigest,framework:{...input.framework},profile:frozenProfile,manifest:frozenManifest,resourcePlanDigest:acceptanceDigest(frozenManifest.resources)});activeTaskOwnerships.add(value);privateTaskSecrets.set(value,Buffer.from(input.secret));return value;
}
async function sourceIdentity(
  input: { committed: boolean } = { committed: false },
) {
  const generationHead = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  execFileSync("git", ["cat-file", "-e", `${sourceBoundaryHead}^{commit}`]);
  execFileSync("git", [
    "merge-base",
    "--is-ancestor",
    sourceBoundaryHead,
    generationHead,
  ]);
  if (input.committed) {
    execFileSync("git", ["diff", "--quiet", "HEAD", "--"]);
    execFileSync("git", ["diff", "--cached", "--quiet", "HEAD", "--"]);
  }
  const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
      .split("\0")
      .filter((file) => file && !file.startsWith(evidencePrefix)),
    paths = [...new Set([...tracked, ...sourcePaths])].sort(),
    digest = sha(
      (
        await Promise.all(
          paths.map(async (file) => `${file}\0${await readFile(file, "utf8")}`),
        )
      ).join("\0"),
    );
  return {
    boundaryHead: sourceBoundaryHead,
    generationHead,
    trackedFileCount: paths.length,
    pathDigests: paths.map((file) => sha(file)),
    digest,
  };
}
function assertSourceManifest(
  recorded: any,
  current: any,
  input: { boundaryAncestor: boolean },
) {
  assert.equal(input.boundaryAncestor, true);
  assert.equal(recorded.boundaryHead, sourceBoundaryHead);
  assert.equal(recorded.trackedFileCount, recorded.pathDigests.length);
  assert.deepEqual(recorded.pathDigests, current.pathDigests);
  assert.equal(recorded.trackedFileCount, current.trackedFileCount);
  assert.equal(recorded.digest, current.digest);
}
function validateSourceBindingControls(recorded: any, current: any) {
  let checks = 0;
  const accepts = (value: any, ancestor = true) => {
      assertSourceManifest(value, current, { boundaryAncestor: ancestor });
      checks++;
    },
    rejects = (value: any, ancestor = true) => {
      assert.throws(() =>
        assertSourceManifest(value, current, { boundaryAncestor: ancestor }),
      );
      checks++;
    };
  accepts(recorded);
  accepts({ ...recorded, generationHead: "f".repeat(40) });
  rejects({ ...recorded, digest: "0".repeat(64) });
  rejects({
    ...recorded,
    pathDigests: recorded.pathDigests.slice(1),
    trackedFileCount: recorded.trackedFileCount - 1,
  });
  rejects({
    ...recorded,
    pathDigests: [...recorded.pathDigests, sha("unexpected/source.ts")],
    trackedFileCount: recorded.trackedFileCount + 1,
  });
  rejects(recorded, false);
  return checks;
}
async function sourceDigest() {
  return (await sourceIdentity()).digest;
}
const exists = (root: string) =>
  access(root).then(
    () => true,
    () => false,
  );
const ownedProfileRoot = (taskRef: string, ordinal: number) =>
  `/private/tmp/discovery-ar2-pre-001b-profile-${sha(`${taskRef}:${ordinal}`).slice(0, 24)}`;
const receiptIdentityInventory=(receipt:AnyClerkIdentityInventoryReceipt)=>receipt.schemaVersion==="1"?{userIds:[...receipt.userIds],sessionIds:[...receipt.sessionIds]}:{userIds:[...(receipt.resources.find(value=>value.kind==="user")?.identityRefs??[])],sessionIds:[...(receipt.resources.find(value=>value.kind==="session")?.identityRefs??[])]};
async function independentZeroChild() {
  failurePhase = "independent-zero-input";
  const input = JSON.parse(
      Buffer.from(
        process.env.AR2_PRE_001B_ZERO_MANIFEST ?? "",
        "base64",
      ).toString("utf8"),
    ),
    secretKey = process.env.CLERK_SECRET_KEY,
    secret = Buffer.from(process.env.AR2_PRE_001B_TASK_SECRET ?? "", "base64");
  if (!secretKey || secret.length !== 32)
    throw new Error("Independent zero configuration unavailable");
  failurePhase = "independent-zero-manifest";
  const manifest = await readProtectedManifest(input.manifestPath, secret);
  failurePhase = "independent-zero-receipt";
  const receipt = await readClerkIdentityInventoryReceipt(
      input.inventoryPath,
      manifest,
      secret,
    );
  failurePhase = "independent-zero-clerk";
  process.stdout.write(
    `${JSON.stringify(await verifyAcceptanceClerkZero({ manifest, inventory: receiptIdentityInventory(receipt), secretKey }))}\n`,
  );
}
async function freshBrowserChild() {
  const input = JSON.parse(
    Buffer.from(
      process.env.AR2_PRE_001B_FRESH_BROWSER ?? "",
      "base64",
    ).toString("utf8"),
  );
  await prepareClerkTesting();
  const browser = await openAcceptanceBrowser({
    profileRoot: ownedProfileRoot(input.userId, 5),
    viewport: { width: 1440, height: 1000 },
  });
  try {
    await signInAcceptanceRole(browser, {
      email: input.email,
      userId: input.userId,
      baseUrl: input.baseUrl,
    });
    process.stdout.write(`${JSON.stringify({kind:"execution-phase",frameworkId:input.frameworkId,profileId:input.profileId,sourceDigest:input.sourceDigest,taskDigest:input.taskDigest,runDigest:input.runDigest,producer:"browser",phase:"browser-journey",action:"fresh-reconstruction"})}\n`);
    const observation = await observeFreshSuccessorReconstruction(
        browser.page,
        input.baseUrl,
      ),
      rendered = await browser.page.locator("body").innerText(),
      renderedFindings = scanText(
        "rendered",
        rendered,
        input.protectedValues.map((value: string) => ({
          category: "identity",
          value,
        })),
      ).length;
    process.stdout.write(
      `${JSON.stringify({kind:"fresh-browser-measurement",reconstructed: observation.reconstructed === true, renderedFindings})}\n`,
    );
  } finally {
    await closeAcceptanceBrowser(browser);
  }
}
function freshReconstructionProcess(
  baseUrl: string,
  user: { email: string; id: string; protectedValues?: string[] },
  identity: {frameworkId:string;profileId:string;sourceDigest:string;taskDigest:string;runDigest:string},
  protectedValues = user.protectedValues ?? [],
  profileRoot = ownedProfileRoot(user.id, 5),
) {
  assert.ok(protectedValues.length >= 9);
  const child = spawnSync(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      import.meta.filename,
      "--fresh-browser-child",
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        AR2_PRE_001B_FRESH_BROWSER: Buffer.from(
          JSON.stringify({
            baseUrl,
            email: user.email,
            userId: user.id,
            profileRoot,
            protectedValues,
            ...identity,
          }),
        ).toString("base64"),
      },
      timeout: 120_000,
    },
  );
  if (child.status !== 0) failurePhase = "fresh-child-unavailable";
  assert.equal(child.status, 0);
  const frames=child.stdout.split("\n").filter(Boolean).map(line=>JSON.parse(line)),phaseFrames=frames.filter(value=>value.kind==="execution-phase"),measurementFrames=frames.filter(value=>value.kind==="fresh-browser-measurement");
  assert.equal(phaseFrames.length,1);assert.equal(measurementFrames.length,1);assert.deepEqual(phaseFrames[0],{kind:"execution-phase",...identity,producer:"browser",phase:"browser-journey",action:"fresh-reconstruction"});
  const measured = measurementFrames[0];
  assert.equal(measured.renderedFindings, 0);
  return {
    reconstructed: measured.reconstructed === true,
    renderedFindings: measured.renderedFindings,
    stdout: child.stdout,
    stderr: child.stderr,
  };
}
function envelope(input: {
  profile: AcceptanceProfileRequirementsV1;
  source: string;
  task: string;
  run: string;
  producer: any;
  phase: any;
  sequence: number;
  facts: { factId: string; state: any }[];
}) {
  return createAcceptanceMeasurementEnvelopeV1({
    framework: input.profile.framework,
    profile: input.profile.profile,
    producer: input.producer,
    phase: input.phase,
    sourceDigest: input.source,
    taskDigest: input.task,
    measurementId: acceptanceDigest({
      producer: input.producer,
      phase: input.phase,
      task: input.task,
      facts: input.facts,
    }),
    producerRunDigest: input.run,
    sequence: input.sequence,
    observations: input.facts,
  });
}
async function roleBrowserChild() {
  const input = JSON.parse(
    Buffer.from(process.env.AR2_PRE_001B_ROLE_BROWSER ?? "", "base64").toString(
      "utf8",
    ),
  );
  markBrowserMeasurementPhase("browser-prepare");
  await prepareClerkTesting();
  const ordinals = {
      ceo: 0,
      denied: 1,
      manager: 2,
      narrow: 3,
      director: 4,
    } as const,
    viewport =
      input.action === "narrow"
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 };
  markBrowserMeasurementPhase("browser-open");
  const browser = await openAcceptanceBrowser({
    profileRoot: ownedProfileRoot(
      input.userId,
      ordinals[input.action as keyof typeof ordinals],
    ),
    viewport,
  });
  try {
    markBrowserMeasurementPhase("browser-sign-in");
    await signInAcceptanceRole(browser, {
      email: input.email,
      userId: input.userId,
      baseUrl: input.baseUrl,
    });
    process.stdout.write(
      `${JSON.stringify({ kind: "execution-phase", frameworkId: input.frameworkId, profileId: input.profileId, sourceDigest: input.sourceDigest, taskDigest: input.taskDigest, runDigest: input.runDigest, producer: "browser", phase: "browser-journey", action: input.action })}\n`,
    );
    const result =
        input.action === "ceo"
          ? await executeCeoJourney(browser.page, input.baseUrl)
          : input.action === "denied"
            ? await observeDenied(browser.page, input.baseUrl)
            : input.action === "manager"
              ? await observeManagerUnavailable(browser.page, input.baseUrl)
              : await observeAuthorizedParity(
                  browser.page,
                  input.baseUrl,
                  input.action === "narrow" ? "narrow" : "desktop",
                ),
      rendered = await browser.page.locator("body").innerText(),
      renderedFindings = scanText(
        "rendered",
        rendered,
        input.protectedValues.map((value: string) => ({
          category: "identity",
          value,
        })),
      ).length;
    process.stdout.write(
      `${JSON.stringify({ kind: "browser-measurement", result, consoleErrors: browser.consoleErrors, pageErrors: browser.pageErrors, renderedFindings })}\n`,
    );
  } finally {
    await closeAcceptanceBrowser(browser);
  }
}
function roleBrowserProcess(
  baseUrl: string,
  user: { email: string; id: string },
  action: "ceo" | "denied" | "manager" | "narrow" | "director",
  profileRoot: string,
  protectedValues: string[],
  identity: { frameworkId:string;profileId:string;sourceDigest: string; taskDigest: string; runDigest: string },
) {
  const request = {
      baseUrl,
      email: user.email,
      userId: user.id,
      action,
      profileRoot,
      protectedValues,
      ...identity,
    },
    child = spawnSync(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        import.meta.filename,
        "--role-browser-child",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          AR2_PRE_001B_ROLE_BROWSER: Buffer.from(
            JSON.stringify(request),
          ).toString("base64"),
        },
        timeout: 180_000,
        maxBuffer: 4_000_000,
      },
    ),
    frames = child.stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }),
    phaseFrames = frames.filter((value) => value?.kind === "execution-phase"),
    measurementFrames = frames.filter(
      (value) => value?.kind === "browser-measurement",
    ),
    diagnostic = classifyAcceptanceChildProcess({
      status: child.status,
      signal: child.signal,
      errorCode: (child.error as NodeJS.ErrnoException | undefined)?.code,
      stdout: child.stdout,
    });
  if (child.status !== 0 || diagnostic.protocol !== "complete") {
    const closed = frames.findLast((value) => value?.outcome === "failed"),
      allowed = new Set([
        "browser-prepare",
        "browser-open",
        "browser-sign-in",
        "initial-load",
        "prepare-entry",
        "private-working-open",
        "private-working-confirm",
        "private-working-select",
        "private-working-contribute",
        "freeze",
        "capture",
        "review-heading",
        "review-dispositions",
        "review-evidence-accept",
        "review-evidence-routed",
        "review-remaining",
        "closure-ready",
        "closure",
        "prepare-again",
        "successor-reload",
        "denied-load",
        "denied-navigation",
        "denied-status",
        "denied-hard-reload",
        "denied-private-working",
        "denied-personal-room",
        "authorized-viewport",
        "authorized-load",
        "authorized-status",
        "authorized-successor",
        "authorized-no-execution",
        "authorized-overflow",
      ]);
    failurePhase = `browser-${action}-${allowed.has(closed?.phase) ? closed.phase : `pre-phase-${diagnostic.spawn}-${diagnostic.exit}-${diagnostic.signal}-${diagnostic.protocol}`}`;
  }
  assert.equal(child.status, 0);
  assert.equal(diagnostic.protocol, "complete");
  assert.equal(phaseFrames.length, 1);
  assert.equal(measurementFrames.length, 1);
  const phase = phaseFrames[0];
  assert.deepEqual(
    {
      frameworkId: phase.frameworkId,
      profileId: phase.profileId,
      sourceDigest: phase.sourceDigest,
      taskDigest: phase.taskDigest,
      runDigest: phase.runDigest,
      producer: phase.producer,
      phase: phase.phase,
      action: phase.action,
    },
    {
      frameworkId: identity.frameworkId,
      profileId: identity.profileId,
      sourceDigest: identity.sourceDigest,
      taskDigest: identity.taskDigest,
      runDigest: identity.runDigest,
      producer: "browser",
      phase: "browser-journey",
      action,
    },
  );
  return {
    ...measurementFrames[0],
    stdout: child.stdout,
    stderr: child.stderr,
  };
}
async function browserRun(
  baseUrl: string,
  users: Awaited<ReturnType<typeof provisionAcceptanceUsers>>,
  identity: { frameworkId:string;profileId:string;sourceDigest: string; taskDigest: string; runDigest: string },
  profileRoots = [
    ownedProfileRoot(users.users.ceo.id, 0),
    ownedProfileRoot(users.users.denied.id, 1),
    ownedProfileRoot(users.users.manager.id, 2),
    ownedProfileRoot(users.users.ceo.id, 3),
    ownedProfileRoot(users.users.director.id, 4),
  ],
) {
  failurePhase = "browser-setup";
  const protectedValues = [
    ...Object.values(users.users).flatMap((value) => [value.id, value.email]),
    users.password,
  ];
  (users.users.ceo as any).protectedValues = protectedValues;
  const ceo = roleBrowserProcess(
      baseUrl,
      users.users.ceo,
      "ceo",
      profileRoots[0]!,
      protectedValues,
      identity,
    ),
    denied = roleBrowserProcess(
      baseUrl,
      users.users.denied,
      "denied",
      profileRoots[1]!,
      protectedValues,
      identity,
    ),
    manager = roleBrowserProcess(
      baseUrl,
      users.users.manager,
      "manager",
      profileRoots[2]!,
      protectedValues,
      identity,
    ),
    narrow = roleBrowserProcess(
      baseUrl,
      users.users.ceo,
      "narrow",
      profileRoots[3]!,
      protectedValues,
      identity,
    ),
    director = roleBrowserProcess(
      baseUrl,
      users.users.director,
      "director",
      profileRoots[4]!,
      protectedValues,
      identity,
    ),
    all = [ceo, denied, manager, narrow, director],
    renderedFindings = all.reduce(
      (sum, value) => sum + value.renderedFindings,
      0,
    );
  assert.equal(renderedFindings, 0);
  return {
    ceo: ceo.result,
    denied: denied.result,
    manager: manager.result,
    narrow: narrow.result,
    director: director.result,
    renderedFindings,
    profileRoots: [...profileRoots, ownedProfileRoot(users.users.ceo.id, 5)],
    streams: all.flatMap((value) => [
      value.stdout,
      value.stderr,
      JSON.stringify(value.consoleErrors),
      JSON.stringify(value.pageErrors),
    ]),
    counts: () => ({
      consoleErrors: all.reduce(
        (sum, value) => sum + value.consoleErrors.length,
        0,
      ),
      pageErrors: all.reduce((sum, value) => sum + value.pageErrors.length, 0),
    }),
  };
}
async function measured(execution?:Readonly<{ownership:ValidatedAuthenticatedAlphaTaskOwnershipV1;ordinaryOnly:true;ordinaryFactIds:readonly string[]}>) {
  const profile=execution?.ownership.profile??ar3CurrentBuildProfile,
    source = execution?.ownership.sourceDigest??await sourceDigest(),
    secret = execution?privateTaskSecrets.get(execution.ownership):createTaskSecret(),
    taskRoot = execution?.ownership.root??await mkdtemp(path.join(tmpdir(), "discovery-ar2-pre-001b-task-")),
    serverRoot = path.join(taskRoot,`server-${randomBytes(10).toString("hex")}`),
    browserRoot = process.env.PLAYWRIGHT_BROWSERS_PATH,
    secretKey = process.env.CLERK_SECRET_KEY,
    publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!secret||execution&&!activeTaskOwnerships.has(execution.ownership)||
    !browserRoot ||
    path.dirname(browserRoot) !== "/private/tmp" ||
    !path.basename(browserRoot).startsWith("discovery-ar2-pre-001b-browser-") ||
    !secretKey?.startsWith("sk_test_") ||
    !publishable?.startsWith("pk_test_")
  )
    throw new Error("Authenticated acceptance environment is unavailable");
  const manifest = execution?.ownership.manifest??createAcceptanceTaskManifest({
      sourceDigest: source,
      secret,
      organizationPlan: "not-applicable-capability-disabled",
    }),
    manifestPath = execution?.ownership.manifestPath??path.join(taskRoot, "manifest.json"),
    run = execution?.ownership.runDigest??acceptanceDigest({
      source,
      task: manifest.taskDigest,
      profile: profile.profile,
    }),
    measurements: any[] = [],
    streams: string[] = [],
    protectedCanary = "AR2 PRE001B protected canary",
    credentialCanary = "AR2-PRE001B-secret-credential",
    canaryFile = path.join(taskRoot, "protected-canary.txt");
  if(!execution)await writeProtectedManifest(manifestPath, manifest);
  assert.deepEqual(await readProtectedManifest(manifestPath, secret), manifest);
  await writeFile(canaryFile, `${protectedCanary}\n${credentialCanary}\n`, {
    mode: 0o600,
  });
  let users: Awaited<ReturnType<typeof provisionAcceptanceUsers>> | null = null,
    server: AcceptanceServer | null = null,
    cleanupAttempts = 0,
    cleanupForeign = false,
    external: any = null,
    localZero = false,
    scannerSensitivity = 0,
    scannerPublic = 0,
    freshReconstructed = false,
    primaryFailurePhase = "none",
    includeExtendedProducers=!execution?.ordinaryOnly;
  try {
    users = await provisionAcceptanceUsers({
      manifest,
      secretKey,
      injectAcknowledgementLossRole: "denied",
    });
    server = await startAcceptanceServer({
      root: serverRoot,
      port: 3137,
      users: {
        ceo: users.users.ceo.id,
        director: users.users.director.id,
        manager: users.users.manager.id,
      },
      browserRoot,
    });
    const browser = await browserRun(server.baseUrl, users, {
      frameworkId:profile.framework.id,
      profileId:profile.profile.id,
      sourceDigest: source,
      taskDigest: manifest.taskDigest,
      runDigest: run,
    });
    await stopAcceptanceServer(server);
    streams.push(...browser.streams, ...server.stdout, ...server.stderr);
    server = await restartAcceptanceServer({
      root: serverRoot,
      port: 3137,
      users: {
        ceo: users.users.ceo.id,
        director: users.users.director.id,
        manager: users.users.manager.id,
      },
      browserRoot,
    });
    const fresh = freshReconstructionProcess(server.baseUrl, users.users.ceo,{frameworkId:profile.framework.id,profileId:profile.profile.id,sourceDigest:source,taskDigest:manifest.taskDigest,runDigest:run});
    freshReconstructed = fresh.reconstructed;
    streams.push(
      fresh.stdout,
      fresh.stderr,
      ...server.stdout,
      ...server.stderr,
    );
    (users as any).identityInventory =
      await captureAcceptanceClerkIdentityInventory({ manifest, secretKey });
    failurePhase = "replay-observability";
    const counts = browser.counts();
    measurements.push(
      envelope({
        profile,
        source,
        task: manifest.taskDigest,
        run,
        producer: "browser",
        phase: "browser-journey",
        sequence: 1,
        facts: [
          {
            factId: "browser-journey-ordered",
            state: browser.ceo.ordered ? "observed" : "not-observed",
          },
          {
            factId: "ceo-authorized",
            state:
              browser.ceo.ordered && browser.ceo.successorStatusCount === 1
                ? "observed"
                : "not-observed",
          },
          {
            factId: "director-authorized-parity",
            state:
              browser.director.reconstructed &&
              browser.director.overflow === false
                ? "observed"
                : "not-observed",
          },
          {
            factId: "manager-unavailable",
            state: browser.manager ? "observed" : "not-observed",
          },
          {
            factId: "denied-not-found",
            state: browser.denied ? "observed" : "not-observed",
          },
          {
            factId: "desktop-viewport",
            state:
              browser.director.reconstructed &&
              browser.director.overflow === false
                ? "observed"
                : "not-observed",
          },
          {
            factId: "narrow-viewport",
            state:
              browser.narrow.reconstructed && browser.narrow.overflow === false
                ? "observed"
                : "not-observed",
          },
          {
            factId: "hard-reload-reconstructed",
            state:
              browser.ceo.successorStatusCount === 1
                ? "observed"
                : "not-observed",
          },
          {
            factId: "successor-fresh-process-reconstructed",
            state: freshReconstructed ? "observed" : "not-observed",
          },
          {
            factId: "successor-not-started",
            state:
              browser.ceo.successorStatusCount === 1
                ? "observed"
                : "not-observed",
          },
          {
            factId: "successor-execution-not-claimed",
            state:
              browser.ceo.successorExecutionActionCount === 0
                ? "observed"
                : "not-observed",
          },
        ],
      }),
    );
    assert.equal(counts.consoleErrors + counts.pageErrors, 0);
    if(includeExtendedProducers){const producerStages=[
        {token:"initialize",category:"bootstrap" as const},
        ...["replay-enabled","replay-repeat","replay-disabled","replay-rejecting","replay-throwing","replay-compare","parity","typed-runtime","typed-recovery","typed-cas","owner-inventory"].map(token=>({token,category:"execution" as const})),
        {token:"measurement-envelope",category:"measurement" as const},
      ],
      producerScripts=["scripts/acceptance/ar3ReplayObservabilityMeasurementProducer.ts"],
      producerEntries=await inspectAcceptanceProducerSourceEntriesV1(producerScripts),
      producerAuthorityMac=createHmac("sha256",secret).update(JSON.stringify({schemaVersion:"1",sourceDigest:source,entries:producerEntries})).digest("hex"),
      producerSourceManifest=await createAcceptanceProducerSourceManifestV1({sourceDigest:source,scripts:producerScripts,authorityMac:producerAuthorityMac,taskOwnership:{manifestPath,secret}}),
      producerDescriptors=await Promise.all(([
        ["replay-recovery","replay-recovery",2],
        ["observability","event-observation",3],
      ] as const).map(([producer,phase,sequence])=>createAcceptanceProducerDescriptorV1({script:"scripts/acceptance/ar3ReplayObservabilityMeasurementProducer.ts",mode:producer,environmentKeys:["AR2_PRE_001B_WORKFLOW_ROOT"],sourceManifestDigest:producerSourceManifest.manifestDigest,profileId:ar3CurrentBuildProfile.profile.id,profileVersion:ar3CurrentBuildProfile.profile.version,producer,phase,sequence,stages:producerStages,timeoutMs:600_000}))),
      producerRegistry=createAcceptanceProducerRegistryV1(producerSourceManifest,producerDescriptors);
    for (const [producer, phase, sequence] of [
      ["replay-recovery", "replay-recovery", 2],
      ["observability", "event-observation", 3],
    ] as const) {
      failurePhase = `measurement-${producer}`;
      const descriptor=producerDescriptors.find(value=>value.producer===producer&&value.phase===phase)!;
      const child = await runAcceptanceMeasurementChild({
        descriptor,
        registry:producerRegistry,
        profile:ar3CurrentBuildProfile,
        taskOwnership:{root:taskRoot,manifestPath,secret},
        request: {
          frameworkId: ar3CurrentBuildProfile.framework.id,
          frameworkVersion: ar3CurrentBuildProfile.framework.version,
          profileId: ar3CurrentBuildProfile.profile.id,
          profileVersion: ar3CurrentBuildProfile.profile.version,
          sourceDigest: source,
          taskDigest: manifest.taskDigest,
          runDigest: run,
          producer,
          phase,
        },
        producerEnvironment: {AR2_PRE_001B_WORKFLOW_ROOT:path.join(serverRoot, "workflow")},
      });
      if (child.outcome !== "accepted-envelope") {
        failurePhase = `measurement-${producer}-${child.outcome}-${child.diagnostic.protocolCategory}-${child.diagnostic.producerStageCategory}-${child.diagnostic.structuralAdmissionCategory}-${child.diagnostic.identityBindingCategory}`;
        throw new Error(
          "Acceptance producer did not provide an accepted envelope",
        );
      }
      measurements.push(child.measurement);
      streams.push(child.stdout, child.stderr);
    }}
    failurePhase = "post-admission-protected-inventory";
    const protectedValues = [
      { category: "protected", value: protectedCanary },
      { category: "credential", value: credentialCanary },
      ...Object.values(users.users).flatMap((value) => [
        { category: "identity", value: value.id },
        { category: "identity", value: value.email },
      ]),
      { category: "credential", value: users.password },
      ...(users as any).identityInventory.sessionIds.map((value: string) => ({
        category: "identity",
        value,
      })),
    ];
    failurePhase = "post-admission-scanner-sensitivity";
    scannerSensitivity = scanText(
      "positive",
      `${protectedCanary}\n${credentialCanary}`,
      [
        { category: "protected", value: protectedCanary },
        { category: "credential", value: credentialCanary },
      ],
    ).length;
    failurePhase = "post-admission-public-scan";
    scannerPublic = scanText(
      "public",
      `${streams.join("\n")}\n${JSON.stringify(measurements)}`,
      protectedValues,
    ).length;
    failurePhase = "post-admission-scanner-envelope";
    measurements.push(
      envelope({
        profile,
        source,
        task: manifest.taskDigest,
        run,
        producer: "scanner",
        phase: "surface-scan",
        sequence: 5,
        facts: [
          {
            factId: "scanner-sensitive",
            state: scannerSensitivity === 2 ? "observed" : "not-observed",
          },
          {
            factId: "public-surfaces-clean",
            state: scannerPublic === 0 ? "match" : "mismatch",
          },
        ],
      }),
    );
  } catch(error) {
    primaryFailurePhase=failurePhase==="initialization"?`server-${currentAcceptanceServerLifecyclePhase()}`:failurePhase;
    throw error;
  } finally {
    failurePhase = "cleanup-server-stop";
    if (server) await stopAcceptanceServer(server).catch(() => {});
    const inventoryPath = path.join(taskRoot, "clerk-identity-inventory.json"),primarySucceeded=primaryFailurePhase==="none";let inventory:ClerkOwnedIdentityInventory={userIds:[],sessionIds:[]},inventoryPreparationFailure=false;
    try{inventory=(users as any)?.identityInventory??await captureAcceptanceClerkIdentityInventory({manifest,secretKey});if(inventory.userIds.length>4||inventory.sessionIds.length>6||(primarySucceeded&&(inventory.userIds.length!==4||inventory.sessionIds.length!==6)))throw new Error("Acceptance identity inventory cardinality is invalid");}catch{inventoryPreparationFailure=true;}
    const partial=(kind:PartialResourceInventory["kind"],plannedMaximum:number,identityRefs:string[],dispatchState:PartialResourceInventory["dispatchState"],acknowledgedCount:number,rediscoveredCount:number,cleanupAttemptedCount=0,removedCount=0,zeroVerifiedCount=0,cleanupBlockedCount=0,absenceVerified=false):PartialResourceInventory=>({kind,plannedMaximum,identityRefs,dispatchState,acknowledgedCount,acknowledgementLostCount:rediscoveredCount,rediscoveredCount,cleanupAttemptedCount,removedCount,zeroVerifiedCount,cleanupBlockedCount,absenceVerified}),receiptFor=(state:"observed"|"blocked"|"removed"|"zero-verified",remaining:ClerkOwnedIdentityInventory=inventory)=>{
      const userRemaining=new Set(remaining.userIds),sessionRemaining=new Set(remaining.sessionIds),userRemoved=inventory.userIds.filter(value=>!userRemaining.has(value)).length,sessionRemoved=inventory.sessionIds.filter(value=>!sessionRemaining.has(value)).length,userState=state==="blocked"?(userRemaining.size?"cleanup-blocked":"removed"):state==="observed"?(inventory.userIds.length?(users?(users.acknowledgementLossRecovered?"rediscovered":"acknowledged"):"rediscovered"):"not-dispatched"):state==="removed"?"removed":"zero-verified",sessionState=state==="blocked"?(sessionRemaining.size?"cleanup-blocked":"removed"):state==="observed"?(inventory.sessionIds.length?"acknowledged":"not-dispatched"):state==="removed"?"removed":"zero-verified";
      return createPartialClerkIdentityInventoryReceipt({manifest,secret,resources:[
        partial("user",4,inventory.userIds,userState,users?.acknowledgementLossRecovered?Math.max(0,inventory.userIds.length-1):users?inventory.userIds.length:0,users?.acknowledgementLossRecovered&&inventory.userIds.length?1:users?0:inventory.userIds.length,state==="observed"?0:inventory.userIds.length,state==="observed"?0:state==="blocked"?userRemoved:inventory.userIds.length,state==="zero-verified"?inventory.userIds.length:0,state==="blocked"?userRemaining.size:0,state==="zero-verified"),
        partial("session",6,inventory.sessionIds,sessionState,inventory.sessionIds.length,0,state==="observed"?0:inventory.sessionIds.length,state==="observed"?0:state==="blocked"?sessionRemoved:inventory.sessionIds.length,state==="zero-verified"?inventory.sessionIds.length:0,state==="blocked"?sessionRemaining.size:0,state==="zero-verified"),
        partial("membership",0,[],"never-created",0,0),partial("organization",0,[],"never-created",0,0),
      ]});
    };
    if(!inventoryPreparationFailure){failurePhase="cleanup-identity-receipt";try{await writeClerkIdentityInventoryReceipt(inventoryPath,receiptFor("observed"));await readClerkIdentityInventoryReceipt(inventoryPath,manifest,secret);}catch{inventoryPreparationFailure=true;}}
    let convergedCleanup: Awaited<ReturnType<typeof cleanupAcceptanceClerk>> | null =
      null;
    for (const attempt of ["first", "second"] as const) {
      failurePhase = `cleanup-clerk-${attempt}`;
      cleanupAttempts++;
      try {
        convergedCleanup = await cleanupAcceptanceClerk({ manifest, secretKey });
      } catch {
        if(!inventoryPreparationFailure){try{const remaining=await captureAcceptanceClerkIdentityInventory({manifest,secretKey});await writeClerkIdentityInventoryReceipt(inventoryPath,receiptFor("blocked",remaining));}catch{inventoryPreparationFailure=true;}}
        if (attempt === "second") throw new Error("Clerk cleanup did not converge");
        continue;
      }
      if(!inventoryPreparationFailure)await writeClerkIdentityInventoryReceipt(inventoryPath,receiptFor("removed",{userIds:[],sessionIds:[]}));
    }
    if(inventoryPreparationFailure)throw new Error("Acceptance cleanup inventory remains blocked");
    cleanupForeign = convergedCleanup?.foreignPreserved === true;
    failurePhase = "cleanup-server-root";
    if (server) await removeAcceptanceServerRoot(server);
    const profileRoots = users
      ? [
          ownedProfileRoot(users.users.ceo.id, 0),
          ownedProfileRoot(users.users.denied.id, 1),
          ownedProfileRoot(users.users.manager.id, 2),
          ownedProfileRoot(users.users.ceo.id, 3),
          ownedProfileRoot(users.users.director.id, 4),
          ownedProfileRoot(users.users.ceo.id, 5),
        ]
      : [];
    failurePhase = "cleanup-browser-profiles";
    await removeAcceptanceBrowserProfileRoots(profileRoots);
    failurePhase = "cleanup-canary";
    await rm(canaryFile, { force: true });
    failurePhase = "cleanup-independent-zero-child";
    failurePhase = "cleanup-browser-binary";
    await removeBrowserBinaryRoot(browserRoot);
    failurePhase = "cleanup-independent-zero-child";
    const child = spawnSync(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        import.meta.filename,
        "--independent-zero-child",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          AR2_PRE_001B_ZERO_MANIFEST: Buffer.from(
            JSON.stringify({ manifestPath, inventoryPath }),
          ).toString("base64"),
          AR2_PRE_001B_TASK_SECRET: secret.toString("base64"),
        },
        timeout: 120_000,
      },
    );
    if (child.status !== 0) {
      const childDiagnostic = classifyAcceptanceChildProcess({
        status: child.status,
        signal: child.signal,
        errorCode: (child.error as NodeJS.ErrnoException | undefined)?.code,
        stdout: child.stdout,
      });
      const zeroStage=["input","manifest","receipt","clerk"].find(value=>child.stderr.includes(`independent-zero-${value}-server-failure`))??"unclassified";
      failurePhase = `cleanup-independent-zero-child-${zeroStage}-${childDiagnostic.spawn}-${childDiagnostic.exit}-${childDiagnostic.signal}-${childDiagnostic.protocol}`;
      throw new Error("Independent zero verification failed");
    }
    failurePhase = "cleanup-independent-zero-result";
    external = JSON.parse(child.stdout.trim());
    await writeClerkIdentityInventoryReceipt(inventoryPath,receiptFor("zero-verified"));
    failurePhase = "cleanup-task-root";
    await rm(taskRoot, { recursive: true, force: true });
    failurePhase = "cleanup-local-zero";
    localZero = !(
      await Promise.all(
        [taskRoot, serverRoot, browserRoot, ...profileRoots].map(exists),
      )
    ).some(Boolean);
  }
  failurePhase = "post-cleanup-lifecycle-derivation";
  const lifecycleMeasured =
      users !== null &&
      users.acknowledgementLossRecovered &&
      users.organizationDisposition === "not_applicable_capability_disabled" &&
      users.organizationAdapterInvocations === 0 &&
      users.organizationNetworkAttempts === 0,
    externalZero =
      external?.users === 0 &&
      external?.activeSessions === 0 &&
      external?.memberships === 0 &&
      external?.organizations === 0 &&
      external?.organizationDisposition ===
        "not_applicable_capability_disabled",
    resourcePlanMeasured =
      manifest.resources.filter((value) => value.kind === "user").length ===
        4 &&
      manifest.resources.filter((value) => value.kind === "session").length ===
        ((users as any).identityInventory?.sessionIds.length ?? -1) &&
      manifest.resources.filter((value) => value.kind === "session").length ===
        6 &&
      manifest.resources.filter((value) => value.kind === "browser-profile")
        .length === 6;
  failurePhase = "post-cleanup-lifecycle-envelopes";
  measurements.push(
    envelope({
      profile,
      source,
      task: manifest.taskDigest,
      run,
      producer: "lifecycle",
      phase: "resource-lifecycle",
      sequence: 4,
      facts: [
        {
          factId: "resource-plan-frozen",
          state: resourcePlanMeasured ? "observed" : "not-observed",
        },
        {
          factId: "acknowledgement-loss-recovered",
          state: users?.acknowledgementLossRecovered
            ? "observed"
            : "not-observed",
        },
        {
          factId: "foreign-preserved",
          state: cleanupForeign ? "match" : "mismatch",
        },
        {
          factId: "organizations-capability-measured",
          state: lifecycleMeasured ? "observed" : "not-observed",
        },
      ],
    }),
    envelope({
      profile,
      source,
      task: manifest.taskDigest,
      run,
      producer: "cleanup",
      phase: "cleanup-attempts",
      sequence: 6,
      facts: [
        {
          factId: "cleanup-first-attempt",
          state: cleanupAttempts >= 1 ? "executed" : "failed",
        },
        {
          factId: "cleanup-second-converged",
          state: cleanupAttempts === 2 ? "match" : "mismatch",
        },
        {
          factId: "server-browser-roots-zero",
          state: localZero ? "match" : "mismatch",
        },
      ],
    }),
    envelope({
      profile,
      source,
      task: manifest.taskDigest,
      run,
      producer: "independent-zero",
      phase: "zero-verification",
      sequence: 7,
      facts: [
        {
          factId: "users-zero",
          state: external?.users === 0 ? "match" : "mismatch",
        },
        {
          factId: "sessions-zero",
          state: external?.activeSessions === 0 ? "match" : "mismatch",
        },
        {
          factId: "memberships-zero",
          state: external?.memberships === 0 ? "match" : "mismatch",
        },
        {
          factId: "organizations-zero-or-disabled",
          state:
            external?.organizations === 0 &&
            external?.organizationDisposition ===
              "not_applicable_capability_disabled"
              ? "match"
              : "mismatch",
        },
        {
          factId: "local-residue-zero",
          state: localZero ? "match" : "mismatch",
        },
      ],
    }),
  );
  if(execution){
    const requirements=profile.requiredMeasurements.filter(value=>ordinaryProducerKeys.has(`${value.producer}:${value.phase}`)),expectedFacts=requirements.flatMap(value=>value.factIds).sort(),requestedFacts=[...execution.ordinaryFactIds].sort();
    if(requirements.length!==5||new Set(requestedFacts).size!==requestedFacts.length||requestedFacts.some(value=>!ordinaryCatalogIds.includes(value))||JSON.stringify(requestedFacts)!==JSON.stringify(expectedFacts))throw new Error("Authenticated acceptance ordinary fact contract is invalid");
    const requested=new Set(requestedFacts),ordinary=measurements.filter(value=>ordinaryProducerKeys.has(`${value.producer}:${value.phase}`));
    if(ordinary.length!==5||new Set(ordinary.map(value=>`${value.producer}:${value.phase}`)).size!==5)throw new Error("Authenticated acceptance ordinary measurements are incomplete");
    const projected=ordinary.map(value=>{const required=requirements.find(item=>item.producer===value.producer&&item.phase===value.phase)!,facts=value.observations.filter((fact:{factId:string})=>requested.has(fact.factId));if(JSON.stringify(facts.map((fact:{factId:string})=>fact.factId).sort())!==JSON.stringify([...required.factIds].sort()))throw new Error("Authenticated acceptance ordinary facts are incomplete");return createAcceptanceMeasurementEnvelopeV1({framework:value.framework,profile:value.profile,producer:value.producer,phase:value.phase,sourceDigest:value.sourceDigest,taskDigest:value.taskDigest,measurementId:acceptanceDigest({producer:value.producer,phase:value.phase,task:value.taskDigest,facts}),producerRunDigest:value.producerRunDigest,sequence:value.sequence,observations:facts});});
    for(const measurement of projected)for(const observation of measurement.observations)if(!observationStates.includes(observation.state))throw new Error("Authenticated acceptance ordinary fact state is invalid");
    return Object.freeze({schemaVersion:"1" as const,kind:"authenticated-alpha-current-build-observations" as const,apiIdentity:AUTHENTICATED_ALPHA_CURRENT_BUILD_API_ID,journeyProgram:AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID,framework:execution.ownership.framework,profile:execution.ownership.profile.profile,sourceDigest:source,taskDigest:manifest.taskDigest,runDigest:run,resourcePlanDigest:execution.ownership.resourcePlanDigest,envelopes:Object.freeze(projected),capturedSurfaceDigest:acceptanceDigest({scannerSensitivity,scannerPublic}),scanner:Object.freeze({sensitivity:scannerSensitivity,publicFindings:scannerPublic}),cleanup:Object.freeze({attempts:cleanupAttempts,localRoots:localZero?0:1,foreignPreserved:cleanupForeign,independentZero:externalZero&&localZero?"zero-verified" as const:"blocked" as const})});
  }
  failurePhase = "post-cleanup-fact-validation";
  for (const measurement of measurements)
    for (const observation of measurement.observations)
      if (!["observed", "match", "executed"].includes(observation.state)) {
        failurePhase = `fact-${observation.factId}`;
        throw new Error("Required acceptance fact was not satisfied");
      }
  failurePhase = "post-cleanup-adjudication";
  const adjudication = adjudicateAuthenticatedAlphaAcceptance({
    profile,
    measurements,
    sourceDigest: source,
    taskDigest: manifest.taskDigest,
  });
  assert.equal(adjudication.result, "PASS");
  failurePhase = "post-cleanup-source-manifest";
  const currentSourceManifest = await sourceIdentity();
  failurePhase = "post-cleanup-evidence-value";
  const value = {
      schemaVersion: "1",
      kind: "ar3-current-build-conformance",
      frameworkQualification: {
        frameworkId: "authenticated-alpha-acceptance",
        frameworkVersion: "1",
        qualificationSourceDigest:
          "55b470abeb44b5269583bbea5bb23d5a8cc2a32d8406ce3627ed6714d6f77d85",
        qualificationResultDigest:
          "590afaaa8a91e7cb57b562d9ccedce40f7bd02d2a2b9f46b068dda3b3933fefd",
      },
      sourceManifest: currentSourceManifest,
      sourceDigest: source,
      taskDigest: manifest.taskDigest,
      profile: {
        ...ar3CurrentBuildProfile.profile,
        digest: acceptanceDigest(ar3CurrentBuildProfile),
      },
      measurements,
      producerEnvelopeDigests: measurements.map(
        (value) => value.measurementDigest,
      ),
      adjudication,
      scanner: {
        sensitivityFindings: scannerSensitivity,
        publicFindings: scannerPublic,
      },
      cleanup: {
        attempts: cleanupAttempts,
        status: localZero ? "zero-verified" : "blocked",
      },
      independentZero: {
        status: externalZero && localZero ? "zero-verified" : "blocked",
        organizations: external?.organizationDisposition,
      },
      status: adjudication.result,
    };
  failurePhase = "post-cleanup-result-digest";
  const resultDigest = acceptanceDigest(value),
    finalValue = { ...value, resultDigest };
  failurePhase = "post-cleanup-protected-inventory";
  const finalProtected = [
      ...Object.values(users!.users).flatMap((item) => [
        { category: "identity", value: item.id },
        { category: "identity", value: item.email },
      ]),
      { category: "credential", value: users!.password },
      ...(users as any).identityInventory.sessionIds.map((item: string) => ({
        category: "identity",
        value: item,
      })),
    ];
  failurePhase = "post-cleanup-final-scan";
  assert.equal(
    scanText(
      "final-evidence",
      `${JSON.stringify(finalValue)}\n${report(finalValue)}`,
      finalProtected,
    ).length,
    0,
  );
  assert.equal(value.status, "PASS");
  return finalValue;
}
export async function measureAuthenticatedAlphaCurrentBuild(input:AuthenticatedAlphaCurrentBuildMeasurementInputV1):Promise<AuthenticatedAlphaCurrentBuildObservationsV1>{
  const keys=["framework","journeyProgram","ordinaryFactIds","profile","roles","runDigest","schemaVersion","sourceDigest","taskDigest","taskOwnership","viewports"].sort().join("\0");
  if(Object.keys(input).sort().join("\0")!==keys||input.schemaVersion!=="1"||input.journeyProgram!==AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID||JSON.stringify(input.roles)!==JSON.stringify(["ceo","director","manager","denied"])||JSON.stringify(input.viewports)!==JSON.stringify(["desktop-1440x1000","narrow-390x844"])||!activeTaskOwnerships.has(input.taskOwnership)||input.framework.id!==input.taskOwnership.framework.id||input.framework.version!==input.taskOwnership.framework.version||acceptanceDigest(input.profile)!==acceptanceDigest(input.taskOwnership.profile)||input.sourceDigest!==input.taskOwnership.sourceDigest||input.taskDigest!==input.taskOwnership.taskDigest||input.runDigest!==input.taskOwnership.runDigest)throw new Error("Authenticated acceptance observation request is invalid");
  try{const result=await measured({ownership:input.taskOwnership,ordinaryOnly:true,ordinaryFactIds:input.ordinaryFactIds});if(result.kind!=="authenticated-alpha-current-build-observations"||!("apiIdentity" in result))throw new Error("Authenticated acceptance observation result is invalid");return result;}finally{activeTaskOwnerships.delete(input.taskOwnership);const secret=privateTaskSecrets.get(input.taskOwnership);secret?.fill(0);privateTaskSecrets.delete(input.taskOwnership);}
}
function report(value: any) {
  return `# AR-2-PRE-001B AR-3 Current-Build Conformance\n\n- Result: **${value.status}**\n- Framework: \`${value.frameworkQualification.frameworkId}@${value.frameworkQualification.frameworkVersion}\`\n- Profile: \`${value.profile.id}@${value.profile.version}\`\n- Adjudication: **${value.adjudication.result}**\n- Producer envelopes: ${value.producerEnvelopeDigests.length}\n- Scanner public findings: ${value.scanner.publicFindings}\n- Cleanup attempts: ${value.cleanup.attempts}\n- Independent zero: **${value.independentZero.status}**\n- Source digest: \`${value.sourceDigest}\`\n- Result digest: \`${value.resultDigest}\`\n\nOccurrence 1 completed through What Changed and Prepare Again. Occurrence 2 was owner-issued, prepared, reconstructed, and remained truthfully not started. No later Occurrence-2 execution was claimed.\n`;
}
async function write() {
  const value = await measured();
  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(value, null, 2)}\n`);
  await writeFile(reportPath, report(value));
  await verify();
}
async function verify() {
  const value = JSON.parse(await readFile(jsonPath, "utf8")),
    { resultDigest, ...unsigned } = value,
    liveHead = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    committed = liveHead !== value.sourceManifest.generationHead,
    currentSource = await sourceIdentity({ committed });
  assertSourceManifest(value.sourceManifest, currentSource, {
    boundaryAncestor: true,
  });
  const sourceBindingChecks = validateSourceBindingControls(
    value.sourceManifest,
    currentSource,
  );
  assert.equal(value.sourceDigest, currentSource.digest);
  for (const measurement of value.measurements)
    assert.equal(
      measurement.measurementDigest,
      acceptanceDigest(
        Object.fromEntries(
          Object.entries(measurement).filter(
            ([key]) => key !== "measurementDigest",
          ),
        ),
      ),
    );
  const adjudication = adjudicateAuthenticatedAlphaAcceptance({
    profile: ar3CurrentBuildProfile,
    measurements: value.measurements,
    sourceDigest: value.sourceDigest,
    taskDigest: value.taskDigest,
  });
  assert.deepEqual(value.adjudication, adjudication);
  assert.equal(resultDigest, acceptanceDigest(unsigned));
  assert.equal(await readFile(reportPath, "utf8"), report(value));
  assert.equal(value.status, "PASS");
  process.stdout.write(
    `${JSON.stringify({ validation: "ar3-current-build-conformance", mode: "verify", result: "PASS", sourceDigest: value.sourceDigest, resultDigest, sourceBindingChecks })}\n`,
  );
}
if(fileURLToPath(import.meta.url)===path.resolve(process.argv[1]??"")){const operation = process.argv.includes("--independent-zero-child")
  ? independentZeroChild()
  : process.argv.includes("--fresh-browser-child")
    ? freshBrowserChild()
    : process.argv.includes("--role-browser-child")
      ? roleBrowserChild()
      : process.argv.includes("--write")
        ? write()
        : process.argv.includes("--verify")
          ? verify()
          : measured().then((value) => {if(value.kind!=="ar3-current-build-conformance")throw new Error("Historical conformance result is invalid");return process.stdout.write(
                `${JSON.stringify({ validation: "ar3-current-build-conformance", result: value.status, sourceDigest: value.sourceDigest, resultDigest: value.resultDigest, scanner:value.scanner, cleanup:value.cleanup, independentZero:value.independentZero, measurementCount:value.measurements.length, adjudication:value.adjudication.result })}\n`,
              );});
void operation.catch(() => {
  if (process.argv.includes("--role-browser-child"))
    process.stdout.write(
      `${JSON.stringify({ outcome: "failed", phase: currentBrowserMeasurementPhase() })}\n`,
    );
  const phase =
    failurePhase === "initialization"
      ? `server-${currentAcceptanceServerLifecyclePhase()}-server-failure`
      : `${failurePhase}-server-failure`;
  process.stderr.write(`AR-3 current-build conformance failed: ${phase}.\n`);
  process.exitCode = 1;
});}
