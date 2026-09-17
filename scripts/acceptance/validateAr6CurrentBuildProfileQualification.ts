import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { acceptanceDigest, createAcceptanceMeasurementEnvelopeV1 } from "./authenticatedAlphaAcceptanceContracts";
import { adjudicateAuthenticatedAlphaAcceptance } from "./authenticatedAlphaAcceptanceAdjudicator";
import { ar5bAuthenticatedRecoveryConformanceProfile } from "./ar5bAuthenticatedRecoveryConformanceProfile";
import { ar6CurrentBuildAcceptanceProfile as profile, AR6_PROFILE_DIGEST, AR6_PREDECESSOR, Ar6Blocked } from "./ar6CurrentBuildAcceptanceProfile";
import { AR6_CASES, AR6_JOURNEY, deriveAr6BrowserObservations, measureAr6Browser, type Ar6BrowserInput, type Ar6BrowserSample, type Ar6RouteEvent, type Ar6RouteEvidence, type Ar6ComposedEvidence, ar6RouteCaptureDigest, classifyAr6Route } from "./ar6BrowserMeasurementProducer.spec";
import { validateAr6Infrastructure, prepareAr6ParticipantFixture, type Ar6Infrastructure, type Ar6FixtureOwners } from "./ar6ParticipantAcceptanceFixture";
import { ar6ServerEnvironment, startAr6AcceptanceServer, stopAr6AcceptanceServer, type Ar6ServerProcessOwner } from "./ar6AcceptanceServerLifecycle";
import { reconcileAr6CurrentBuild, recoverAr6InterruptedRun, type Ar6RunState, type Ar6RecoveryOwner } from "./validateAr6CurrentBuildConformance";

/** Synthetic adapter qualification only. No Product, browser, process or database is executed. */
export async function qualifyAr6CurrentBuildProfile() {
  let checks = 0;
  const check = (value: unknown) => { assert.ok(value); checks++; };
  const blocked = (run: () => unknown) => { assert.throws(run, Ar6Blocked); checks++; };
  const binding = { sourceDigest: "a".repeat(64), taskDigest: "b".repeat(64), runDigest: "c".repeat(64), profileDigest: AR6_PROFILE_DIGEST };
  const root = "/private/tmp/discovery-ar6-qualification";
  const infrastructure: Ar6Infrastructure = {
    binding, mode: "synthetic-qualification", root,
    database: { name: "discovery_ar6_acceptance_synthetic", application: "postgresql://127.0.0.1:55439/discovery_ar6_acceptance_synthetic", administration: "postgresql://127.0.0.1:55439/discovery_ar6_acceptance_synthetic", migration: "postgresql://127.0.0.1:55439/discovery_ar6_acceptance_synthetic", ownershipRef: "synthetic-db" },
    browser: { executablePath: root + "/browser", sha256: "d".repeat(64), ownership: "task-owned" },
    network: { enforcementRef: "synthetic-enforcement", allowedOrigins: ["http://127.0.0.1:3300"] },
    locator: { secret: "synthetic-only-not-a-secret-value-001", instance: "synthetic" }, issuerAuthority: "synthetic-issuer",
    subjects: { ceo: { subjectRef: "synthetic-ceo", verificationRef: "synthetic" }, director: { subjectRef: "synthetic-director", verificationRef: "synthetic" }, manager: { subjectRef: "synthetic-manager", verificationRef: "synthetic" }, denied: { subjectRef: "synthetic-denied", verificationRef: "synthetic" } },
  };
  validateAr6Infrastructure(infrastructure); checks++;
  for (const mutate of [
    (c: Ar6Infrastructure) => { c.database.name = "discovery_acceptance"; },
    (c: Ar6Infrastructure) => { c.database.migration += "_other"; },
    (c: Ar6Infrastructure) => { c.database.application = "postgresql://foreign/discovery_ar6_acceptance_synthetic"; },
    (c: Ar6Infrastructure) => { c.network.enforcementRef = ""; },
    (c: Ar6Infrastructure) => { c.locator.secret = ""; },
    (c: Ar6Infrastructure) => { c.subjects.ceo.verificationRef = ""; },
    (c: Ar6Infrastructure) => { c.subjects.director.subjectRef = c.subjects.ceo.subjectRef; },
    (c: Ar6Infrastructure) => { c.browser.executablePath = "/foreign/browser"; },
    (c: Ar6Infrastructure) => { c.browser.sha256 = ""; },
    (c: Ar6Infrastructure) => { c.binding.profileDigest = "e".repeat(64); },
  ]) { const c = structuredClone(infrastructure); mutate(c); blocked(() => validateAr6Infrastructure(c)); }
  check(profile.framework.id === "authenticated-alpha-acceptance" && profile.framework.version === "1");
  check(profile.profile.id === "ar6-current-build-conformance" && profile.profile.version === "version-1");
  assert.deepEqual(AR6_PREDECESSOR, ar5bAuthenticatedRecoveryConformanceProfile.profile); checks++;
  assert.deepEqual(profile.requiredMeasurements.filter(v => v.producer !== "browser"), ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements.filter(v => v.producer !== "browser")); checks++;
  check(Object.isFrozen(profile) && Object.isFrozen(profile.requiredMeasurements));
  const address = "a".repeat(24), origin = "http://127.0.0.1:3300", route = "/product-alpha/meetings/" + address;
  const seal = (outcome: Ar6RouteEvidence["outcome"], events: Ar6RouteEvent[]): Ar6RouteEvidence => ({ outcome, events, capture: { eventCount: events.length, digest: ar6RouteCaptureDigest(events) } });
  const traceFor = (role: typeof AR6_CASES[number]): Ar6RouteEvidence => {
    if (role === "malformed") return seal("EARLY_ADDRESS_REJECTION", [{ stage: "address-validation", result: "malformed" }]);
    const early = role === "denied" || role === "manager";
    const unknown = role === "unknown", allowed = role === "ceo" || role === "director";
    const events: Ar6RouteEvent[] = [{ stage: "address-validation", result: "well-formed" }, { stage: "directory", persona: role === "denied" ? "unmapped" : role === "manager" ? "manager" : role === "director" ? "director" : "ceo", target: early ? "excluded" : unknown ? "absent" : "eligible" }];
    if (!early) events.push({ stage: "bridge", checkId: "synthetic-check", organizationRef: "synthetic-org", seriesRef: "synthetic-series" }, { stage: "current-access", checkId: "synthetic-check", decision: allowed || unknown ? "authorized" : "denied", registration: role === "unbound" ? "not-found" : "found" });
    events.push({ stage: "directory-complete", authorizedEntries: allowed || unknown ? 1 : 0 }, { stage: "address-match", matches: allowed ? 1 : 0 });
    return seal(early ? "EARLY_DIRECTORY_REJECTION" : unknown ? "ADDRESS_NOT_FOUND_AFTER_DIRECTORY" : allowed ? "AUTHORIZED" : "CURRENT_ACCESS_DENIAL", events);
  };
  const samples: Ar6BrowserSample[] = AR6_CASES.flatMap(caseId => (["desktop", "narrow"] as const).map(viewport => {
    const allowed = caseId === "ceo" || caseId === "director";
    return { binding, caseId, viewport, width: viewport === "desktop" ? 1440 : 390, height: viewport === "desktop" ? 1000 : 844, navigation: "initial", processRef: "synthetic-process-one", status: allowed ? 200 : 404, origin, entryPath: route, directPath: route,
      organizationRef: "synthetic-org", seriesRef: "synthetic-series", occurrenceRef: "synthetic-successor",
      routing: traceFor(caseId),
      owner: { infrastructure: "ready", registration: caseId === "unbound" ? "not-found" : "found", access: allowed ? "authorized" : ["malformed", "denied", "manager", "unknown"].includes(caseId) ? "not-evaluated" : "denied", bridge: ["malformed", "denied", "manager"].includes(caseId) ? "not-exercised" : "exercised", organizationGrants: allowed || caseId === "manager" || caseId === "missing-grant" ? 1 : 0, seriesGrants: allowed ? 1 : 0, materialAccess: allowed ? "authorized" : "denied" },
      shared: allowed ? { title: "Prepared successor", phase: "Prepare", sharedSections: ["Shared preparation"] } : null,
      protectedSurfaceCount: 0, forbiddenActionCount: 0, existenceFallbackCount: 0, unauthorizedPrivateCount: 0, overflow: false, responseSurface: allowed ? "Prepared successor" : "Not found" };
  }));
  const input: Ar6BrowserInput = { binding, mode: "synthetic-qualification", approvedOrigin: origin, address, target: { organizationRef: "synthetic-org", seriesRef: "synthetic-series", predecessorRef: "synthetic-predecessor", successorRef: "synthetic-successor" }, denialTargets: Object.fromEntries(AR6_CASES.filter(r => r !== "ceo" && r !== "director").map(r => [r, { path: route, organizationRef: "synthetic-org", seriesRef: "synthetic-series" }])) as Ar6BrowserInput["denialTargets"], samples, journey: AR6_JOURNEY, durable: { closures: 1, whatChanged: 1, completions: 1, successors: 1, successorStarted: false, duplicates: 0 }, hardReload: structuredClone(samples[0]!), freshProcess: structuredClone(samples[0]!), protectedCanaries: ["synthetic-private-canary"] };
  input.denialTargets.unknown.path = "/product-alpha/meetings/" + "z".repeat(24);
  input.denialTargets.malformed.path = "/product-alpha/meetings/!";
  for (const s of input.samples.filter(v => v.caseId === "foreign")) s.owner.foreignScope = { organizationRef: "synthetic-foreign-org", seriesRef: "synthetic-foreign-series", activeGrants: 2 };
  for (const s of input.samples) if (s.caseId !== "ceo" && s.caseId !== "director") {
    const t = input.denialTargets[s.caseId]; s.entryPath = t.path; s.directPath = t.path; s.organizationRef = t.organizationRef; s.seriesRef = t.seriesRef;
  }
  input.hardReload.navigation = "hard-reload";
  input.freshProcess.navigation = "fresh-process"; input.freshProcess.processRef = "synthetic-process-two";
  const composedEvidence: Ar6ComposedEvidence = { outcome: "AUTHORIZED", stages: { addressValidation: "well-formed", directory: "reached", bridge: "reached", currentAccess: "authorized", addressMatch: "unique" }, deterministicOwner: { provenance: "CURRENT_DETERMINISTIC_VALIDATOR", validatorId: "w-001", sourceDigest: binding.sourceDigest, passed: true }, fixturePrecondition: { provenance: "REAL_FIXTURE_OWNER", fixtureId: "f-001", subjectState: "ceo-authorized", passed: true }, browser: { provenance: "REAL_BROWSER", requestId: "b-001", status: 200, passed: true }, healthyPositive: { provenance: "REAL_FIXTURE_OWNER", controlId: "p-001", passed: true }, nondisclosure: { provenance: "REAL_BROWSER", protectedSurfaceCount: 0, forbiddenActionCount: 0, existenceFallbackCount: 0, passed: true } };
  const composedSample = structuredClone(input.samples[0]!); delete composedSample.routing; composedSample.composedEvidence = composedEvidence;
  check(classifyAr6Route(composedSample).outcome === "AUTHORIZED");
  for (const field of ["deterministicOwner", "fixturePrecondition", "browser", "healthyPositive", "nondisclosure"] as const) { const broken = structuredClone(composedSample); (broken.composedEvidence as any)[field].passed = false; blocked(() => classifyAr6Route(broken)); }
  const malformedComposed = structuredClone(composedSample); malformedComposed.caseId = "malformed"; malformedComposed.directPath = "/product-alpha/meetings/!"; malformedComposed.status = 404; malformedComposed.composedEvidence!.outcome = "EARLY_ADDRESS_REJECTION"; malformedComposed.composedEvidence!.stages = { addressValidation: "malformed", directory: "not-reached", bridge: "not-reached", currentAccess: "not-reached", addressMatch: "not-reached" }; malformedComposed.composedEvidence!.browser.status = 404; check(classifyAr6Route(malformedComposed).outcome === "EARLY_ADDRESS_REJECTION");
  const falseDenied = structuredClone(composedSample); falseDenied.composedEvidence!.outcome = "CURRENT_ACCESS_DENIAL"; falseDenied.composedEvidence!.browser.status = 404; falseDenied.composedEvidence!.stages.currentAccess = "denied"; falseDenied.composedEvidence!.stages.bridge = "not-reached"; blocked(() => classifyAr6Route(falseDenied));
  const falseAuthorized = structuredClone(composedSample); falseAuthorized.composedEvidence!.stages.bridge = "not-reached"; blocked(() => classifyAr6Route(falseAuthorized));
  const falseEarly = structuredClone(malformedComposed); falseEarly.composedEvidence!.stages.bridge = "reached"; blocked(() => classifyAr6Route(falseEarly));
  const falseBridge = structuredClone(malformedComposed); falseBridge.composedEvidence!.diagnostic = { provenance: "OPTIONAL_DIAGNOSTIC_OBSERVATION", trace: traceFor("missing-grant") }; check(classifyAr6Route(falseBridge).bridgeChecks === 0);
  const browser = deriveAr6BrowserObservations(input);
  const rejectsEvidence = (changed: Ar6BrowserInput) => {
    try { check(deriveAr6BrowserObservations(changed).observations.some(v => v.state === "mismatch")); }
    catch (error) { if (!(error instanceof Ar6Blocked)) throw error; checks++; }
  };
  check(browser.observations.every(v => v.state === "match"));
  for (const role of AR6_CASES.filter(v => v !== "ceo" && v !== "director")) {
    for (const field of ["status", "protectedSurfaceCount", "forbiddenActionCount", "existenceFallbackCount", "responseSurface"] as const) {
      const changed = structuredClone(input); const s = changed.samples.find(v => v.caseId === role)!;
      if (field === "status") s.status = 200;
      else if (field === "responseSurface") s.responseSurface = "synthetic-private-canary";
      else s[field] = 1;
      rejectsEvidence(changed);
    }
  }
  for (const mutate of [
    (c: Ar6BrowserInput) => { c.samples[0]!.status = 404; },
    (c: Ar6BrowserInput) => { c.samples[4]!.owner.infrastructure = "unavailable"; },
    (c: Ar6BrowserInput) => { c.samples[4]!.owner.materialAccess = "unavailable"; },
    (c: Ar6BrowserInput) => { c.samples.pop(); },
    (c: Ar6BrowserInput) => { c.address = ""; },
    (c: Ar6BrowserInput) => { c.target.successorRef = c.target.predecessorRef; },
  ]) { const c = structuredClone(input); mutate(c); blocked(() => deriveAr6BrowserObservations(c)); }
  for (const role of AR6_CASES.filter(v => v !== "ceo" && v !== "director")) {
    for (const field of ["entryPath", "directPath", "organizationRef", "seriesRef"] as const) {
      const changed = structuredClone(input); changed.samples.find(v => v.caseId === role)![field] = "wrong";
      rejectsEvidence(changed);
    }
  }
  for (const mutate of [
    (c: Ar6BrowserInput) => { delete c.samples.find(s => s.caseId === "foreign")!.owner.foreignScope; },
    (c: Ar6BrowserInput) => { c.samples.find(s => s.caseId === "foreign")!.owner.foreignScope!.organizationRef = c.target.organizationRef; },
    (c: Ar6BrowserInput) => { c.samples.find(s => s.caseId === "foreign")!.owner.foreignScope!.activeGrants = 0; },
    (c: Ar6BrowserInput) => { c.samples.find(v => v.caseId === "missing-grant")!.owner.registration = "not-found"; },
    (c: Ar6BrowserInput) => { c.samples.find(v => v.caseId === "missing-grant")!.owner.bridge = "not-exercised"; },
    (c: Ar6BrowserInput) => { c.samples[4]!.owner.organizationGrants = 0; },
    (c: Ar6BrowserInput) => { c.samples[0]!.width = 100; },
    (c: Ar6BrowserInput) => { c.hardReload.navigation = "initial"; },
    (c: Ar6BrowserInput) => { c.freshProcess.processRef = c.samples[0]!.processRef; },
    (c: Ar6BrowserInput) => { c.samples[2]!.shared!.title = "Different"; },
    (c: Ar6BrowserInput) => { c.samples[2]!.unauthorizedPrivateCount = 1; },
    (c: Ar6BrowserInput) => { c.samples[2]!.owner.seriesGrants = 0; },
    (c: Ar6BrowserInput) => { c.samples[1]!.overflow = true; },
    (c: Ar6BrowserInput) => { c.freshProcess.occurrenceRef = "wrong"; },
    (c: Ar6BrowserInput) => { c.durable.successorStarted = true; },
    (c: Ar6BrowserInput) => { c.journey = [...AR6_JOURNEY].reverse(); },
  ]) { const c = structuredClone(input); mutate(c); rejectsEvidence(c); }
  // Route taxonomy controls: HTTP status stays 404 while causally distinct stages remain visible.
  const expected = { malformed: "EARLY_ADDRESS_REJECTION", denied: "EARLY_DIRECTORY_REJECTION", manager: "EARLY_DIRECTORY_REJECTION", unknown: "ADDRESS_NOT_FOUND_AFTER_DIRECTORY", unbound: "CURRENT_ACCESS_DENIAL", "missing-grant": "CURRENT_ACCESS_DENIAL", foreign: "CURRENT_ACCESS_DENIAL", ceo: "AUTHORIZED", director: "AUTHORIZED" } as const;
  for (const role of AR6_CASES) {
    check(browser.routing.find(r => r.caseId === role)!.outcome === expected[role]);
    const failedSetup = structuredClone(input); failedSetup.samples.find(v => v.caseId === role)!.owner.infrastructure = "unavailable";
    blocked(() => deriveAr6BrowserObservations(failedSetup));
  }
  const mutateRoute = (role: typeof AR6_CASES[number], mutation: (s: Ar6BrowserSample) => void, reseal = true) => {
    const changed = structuredClone(input), sample = changed.samples.find(s => s.caseId === role)!;
    mutation(sample);
    if (reseal) sample.routing!.capture = { eventCount: sample.routing!.events.length, digest: ar6RouteCaptureDigest(sample.routing!.events) };
    blocked(() => deriveAr6BrowserObservations(changed));
  };
  const extra: Ar6RouteEvent[] = [{ stage: "directory", persona: "ceo", target: "eligible" }, { stage: "bridge", checkId: "fake-check", organizationRef: "synthetic-org", seriesRef: "synthetic-series" }, { stage: "current-access", checkId: "fake-check", registration: "found", decision: "denied" }];
  for (const event of extra) mutateRoute("malformed", sample => { sample.routing!.events.push(event); });
  mutateRoute("denied", sample => { sample.routing!.events.splice(2, 0, ...extra.slice(1)); });
  for (const role of ["unbound", "missing-grant", "foreign", "ceo", "director"] as const) {
    for (const stage of ["bridge", "current-access", "directory", "address-match"] as const) {
      mutateRoute(role, sample => { sample.routing!.events = sample.routing!.events.filter(e => e.stage !== stage); });
    }
  }
  mutateRoute("unknown", sample => { sample.routing!.events = sample.routing!.events.filter(e => e.stage !== "current-access"); }, false);
  mutateRoute("unknown", sample => { sample.routing!.events = sample.routing!.events.filter(e => e.stage !== "directory"); }, false);
  mutateRoute("unknown", sample => { sample.routing!.outcome = "CURRENT_ACCESS_DENIAL"; });
  mutateRoute("unknown", sample => { sample.owner.access = "denied"; });
  mutateRoute("unknown", sample => { sample.routing!.events = sample.routing!.events.filter(e => e.stage !== "bridge" && e.stage !== "current-access"); });
  // A truthful unknown-address directory may be empty; it is still not an early parse rejection.
  const emptyUnknown = structuredClone(input), unknown = emptyUnknown.samples.find(s => s.caseId === "unknown")!;
  unknown.routing = seal("ADDRESS_NOT_FOUND_AFTER_DIRECTORY", [{ stage: "address-validation", result: "well-formed" }, { stage: "directory", persona: "ceo", target: "absent" }, { stage: "directory-complete", authorizedEntries: 0 }, { stage: "address-match", matches: 0 }]);
  unknown.owner.bridge = "not-exercised";
  check(deriveAr6BrowserObservations(emptyUnknown).observations.every(v => v.state === "match"));
  // Manager can trigger other series checks while still being excluded from the target.
  const otherEntry = structuredClone(input), manager = otherEntry.samples.find(s => s.caseId === "manager")!;
  manager.routing!.events.splice(2, 0, { stage: "bridge", checkId: "pipeline", organizationRef: "synthetic-org", seriesRef: "synthetic-pipeline" }, { stage: "current-access", checkId: "pipeline", decision: "denied", registration: "found" });
  manager.routing = seal("ADDRESS_NOT_FOUND_AFTER_DIRECTORY", manager.routing!.events); manager.owner.bridge = "exercised";
  check(deriveAr6BrowserObservations(otherEntry).observations.every(v => v.state === "match"));
  check(classifyAr6Route(manager).targetDecision === "not-evaluated");
  // For a persona-eligible Manager target, an actual current-access denial is required.
  const eligibleManager = structuredClone(input), eligible = eligibleManager.samples.find(s => s.caseId === "manager")!;
  eligible.routing = traceFor("missing-grant");
  const directory = eligible.routing!.events[1]; if (directory.stage === "directory") directory.persona = "manager";
  eligible.routing = seal("CURRENT_ACCESS_DENIAL", eligible.routing!.events); eligible.owner.bridge = "exercised"; eligible.owner.access = "denied";
  check(deriveAr6BrowserObservations(eligibleManager).observations.every(v => v.state === "match"));
  const summaries = browser.routing.filter(r => r.viewport === "desktop" && r.httpStatus === 404);
  check(new Set(summaries.map(r => r.outcome)).size === 4);
  for (const role of ["ceo", "director"] as const) {
    for (const viewport of ["desktop", "narrow"] as const) {
      const substituted = structuredClone(input), sample = substituted.samples.find(v => v.caseId === role && v.viewport === viewport)!;
      const directory = sample.routing!.events.find(e => e.stage === "directory")!;
      directory.persona = role === "ceo" ? "director" : "ceo";
      sample.routing = seal("AUTHORIZED", sample.routing!.events);
      rejectsEvidence(substituted);
    }
  }
  for (const field of ["hardReload", "freshProcess"] as const) {
    const substituted = structuredClone(input), sample = substituted[field];
    const directory = sample.routing!.events.find(e => e.stage === "directory")!;
    directory.persona = "director"; sample.caseId = "director";
    sample.routing = seal("AUTHORIZED", sample.routing!.events);
    rejectsEvidence(substituted);
  }
  let collections = 0;
  await assert.rejects(() => measureAr6Browser(infrastructure, { verifyInfrastructure: async () => { throw new Ar6Blocked("synthetic-unavailable"); }, collect: async () => { collections++; return input; } }), Ar6Blocked); checks++;
  check(collections === 0);
  check((await measureAr6Browser(infrastructure, { verifyInfrastructure: async () => {}, collect: async () => input })).observations.every(v => v.state === "match"));
  const measurements = profile.requiredMeasurements.map((r, index) => createAcceptanceMeasurementEnvelopeV1({ framework: profile.framework, profile: profile.profile, producer: r.producer, phase: r.phase, sourceDigest: binding.sourceDigest, taskDigest: binding.taskDigest, measurementId: acceptanceDigest({ index }), producerRunDigest: binding.runDigest, sequence: index + 1, observations: r.factIds.map(factId => ({ factId, state: "match" })) }));
  const adjudicate = (values: typeof measurements) => adjudicateAuthenticatedAlphaAcceptance({ profile, measurements: values, sourceDigest: binding.sourceDigest, taskDigest: binding.taskDigest });
  check(adjudicate(measurements).result === "PASS"); // Synthetic framework control, never an execution result.
  check(adjudicate(measurements.slice(1)).result !== "PASS");
  check(adjudicate([...measurements, measurements[0]!]).result !== "PASS");
  const wrong = structuredClone(measurements); wrong[0]!.profile = AR6_PREDECESSOR;
  check(adjudicate(wrong).result !== "PASS");
  const state: Ar6RunState = { binding, mode: "synthetic-qualification", status: "CLEANUP_PASS", interrupted: false, resources: [] };
  check(reconcileAr6CurrentBuild({ binding, mode: "synthetic-qualification", browser, measurements, runState: state }).result === "BLOCKED");
  const calls: string[] = [];
  const owners: Ar6FixtureOwners = {
    verifyInfrastructure: async () => { calls.push("verify"); }, initializeNamespace: async () => { calls.push("namespace"); },
    registerAuthenticatedSubject: async role => { calls.push("register:" + role); return { participantRef: "synthetic-" + role }; },
    administration: { activatePolicy: async () => { calls.push("policy"); }, grant: async value => { calls.push("grant:" + value.participantRef + ":" + value.scope); } } as Ar6FixtureOwners["administration"],
    inspectCurrentAccess: async role => role === "ceo" || role === "director" ? "authorized" : "denied",
    persist: async value => { calls.push(value.ready ? "ready" : "persist"); },
  };
  check((await prepareAr6ParticipantFixture(infrastructure, { organizationId: "synthetic-org", seriesId: "synthetic-series", occurredAt: "2026-01-01T00:00:00.000Z" }, owners)).ready);
  check(calls[0] === "verify" && calls[1] === "persist" && calls[2] === "namespace");
  check(calls.filter(v => v.startsWith("grant:")).length === 5 && !calls.some(v => v.startsWith("grant:synthetic-denied")));
  const c = { infrastructure, cwd: root + "/server", fixtureRoot: root + "/fixtures", nodeExecutable: "/usr/local/bin/node", port: 3300 };
  const env = ar6ServerEnvironment(c);
  check(!("DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED" in env) && !("NODE_OPTIONS" in env) && env.HOME === root + "/home");
  blocked(() => ar6ServerEnvironment({ ...c, fixtureRoot: "/foreign" }));
  const states: string[] = [];
  const processOwner: Ar6ServerProcessOwner = { verifyInfrastructure: async () => {}, verifyFilesystem: async () => {}, persist: async s => { states.push(s.status); }, spawn: async () => ({ pid: 12345, ownershipRef: "synthetic-process" }), ready: async () => {}, terminate: async () => {}, absent: async () => true };
  let unexpectedSpawns = 0;
  await assert.rejects(() => startAr6AcceptanceServer(c, { publishableKey: "pk_test_synthetic", secretKey: "sk_test_synthetic" }, { ...processOwner, verifyInfrastructure: async () => { throw new Ar6Blocked("synthetic-infrastructure-unavailable"); }, spawn: async () => { unexpectedSpawns++; return { pid: 12345, ownershipRef: "synthetic" }; } }), Ar6Blocked); checks++;
  check(unexpectedSpawns === 0);
  const handle = await startAr6AcceptanceServer(c, { publishableKey: "pk_test_synthetic", secretKey: "sk_test_synthetic" }, processOwner);
  await stopAr6AcceptanceServer(handle, processOwner);
  check(states.join(",") === "RUNNING,RUNNING,CLEANUP_REQUIRED,CLEANUP_PASS");
  let cleanups = 0;
  const recovery: Ar6RecoveryOwner = { persist: async () => {}, discover: async () => [{ kind: "root", ref: "synthetic-root", ownershipRef: "synthetic-owner" }], verifyOwnership: async () => true, cleanup: async () => { cleanups++; }, independentZero: async () => ({ local: true, external: true, foreignPreserved: true }) };
  const recovered = await recoverAr6InterruptedRun({ ...state, status: "RUNNING" }, recovery);
  check(recovered.interrupted && recovered.status === "CLEANUP_PASS" && cleanups === 2);
  cleanups = 0;
  await assert.rejects(() => recoverAr6InterruptedRun({ ...state, status: "RUNNING" }, { ...recovery, verifyOwnership: async () => false }), Ar6Blocked); checks++;
  check(cleanups === 0);
  await assert.rejects(() => recoverAr6InterruptedRun({ ...state, status: "RUNNING" }, { ...recovery, independentZero: async () => ({ local: true, external: false, foreignPreserved: true }) }), Ar6Blocked); checks++;
  return { kind: "ar6-synthetic-profile-qualification", status: "PASS", checks, authenticatedExecution: "NOT_RUN", productAcceptance: "NOT_ESTABLISHED", browserExecution: "NOT_RUN", databaseExecution: "NOT_RUN" };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  qualifyAr6CurrentBuildProfile().then(result => process.stdout.write(JSON.stringify(result) + "\n")).catch(() => { process.stderr.write("AR6 synthetic qualification FAIL\n"); process.exitCode = 1; });
}
