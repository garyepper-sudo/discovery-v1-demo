import { createHash } from "node:crypto";
import { acceptanceDigest, type ObservedFact } from "./authenticatedAlphaAcceptanceContracts";
import { validateAr6Infrastructure, type Ar6Infrastructure } from "./ar6ParticipantAcceptanceFixture";
import { AR6_BROWSER_FACTS, assertAr6Binding, requireAr6, sameAr6Binding, type Ar6Binding, type Ar6Mode } from "./ar6CurrentBuildAcceptanceProfile";

export const AR6_JOURNEY = ["prepare", "freeze", "capture", "review", "route", "complete-reviewed", "close", "what-changed", "prepare-again", "successor"] as const;
export const AR6_CASES = ["ceo", "director", "manager", "denied", "unbound", "missing-grant", "foreign", "malformed", "unknown"] as const;
export type Ar6BrowserCase = typeof AR6_CASES[number];
export type Ar6SharedProjection = { title: string; phase: string; sharedSections: string[] };
export type Ar6RouteOutcome = "EARLY_ADDRESS_REJECTION" | "EARLY_DIRECTORY_REJECTION" | "ADDRESS_NOT_FOUND_AFTER_DIRECTORY" | "CURRENT_ACCESS_DENIAL" | "AUTHORIZED";
export type Ar6RouteEvent =
  | { stage: "address-validation"; result: "malformed" | "well-formed" }
  | { stage: "directory"; persona: "ceo" | "director" | "manager" | "unmapped"; target: "eligible" | "excluded" | "absent" }
  | { stage: "bridge"; checkId: string; organizationRef: string; seriesRef: string }
  | { stage: "current-access"; checkId: string; decision: "authorized" | "denied" | "unavailable"; registration: "found" | "not-found" }
  | { stage: "directory-complete"; authorizedEntries: number }
  | { stage: "address-match"; matches: number };
export type Ar6RouteEvidence = {
  outcome: Ar6RouteOutcome;
  events: Ar6RouteEvent[];
  // Captured by the collection boundary before projection. This detects lost/rewritten
  // events, not malicious fabrication by a trusted collector. Never derive it from HTTP.
  capture: { eventCount: number; digest: string };
};
export type Ar6EvidenceProvenance = "REAL_BROWSER" | "REAL_FIXTURE_OWNER" | "CURRENT_DETERMINISTIC_VALIDATOR" | "SYNTHETIC_QUALIFICATION" | "DIAGNOSTIC_ONLY";
export type Ar6ComposedEvidence = {
  outcome: Ar6RouteOutcome;
  stages: { addressValidation: "malformed" | "well-formed"; directory: "reached" | "not-reached"; bridge: "reached" | "not-reached"; currentAccess: "authorized" | "denied" | "not-reached"; addressMatch: "unique" | "none" | "not-reached" };
  deterministicOwner: { provenance: "CURRENT_DETERMINISTIC_VALIDATOR"; validatorId: string; sourceDigest: string; passed: boolean };
  fixturePrecondition: { provenance: "REAL_FIXTURE_OWNER"; fixtureId: string; subjectState: string; passed: boolean };
  browser: { provenance: "REAL_BROWSER"; requestId: string; status: number; passed: boolean };
  healthyPositive: { provenance: "REAL_FIXTURE_OWNER"; controlId: string; passed: boolean };
  nondisclosure: { provenance: "REAL_BROWSER"; protectedSurfaceCount: number; forbiddenActionCount: number; existenceFallbackCount: number; passed: boolean };
  diagnostic?: { provenance: "OPTIONAL_DIAGNOSTIC_OBSERVATION"; trace?: Ar6RouteEvidence };
};
export const ar6RouteCaptureDigest = (events: readonly Ar6RouteEvent[]) => createHash("sha256").update(JSON.stringify(events)).digest("hex");
export type Ar6RouteSummary = {
  outcome: Ar6RouteOutcome; addressValidation: "malformed" | "well-formed";
  directory: "not-reached" | "evaluated"; bridgeChecks: number; currentAccessChecks: number;
  targetDecision: "not-evaluated" | "authorized" | "denied";
  addressMatch: "not-reached" | "none" | "unique";
};

/** Validate canonical stage order; no authorization decisions are implemented here.
 * authorizedMeetingDirectory checks eligible entries BEFORE resolveAuthorizedMeetingAddress
 * matches addresses. Other entries' checks must never be attributed to the requested target.
 */
export function classifyAr6Route(sample: Ar6BrowserSample): Ar6RouteSummary {
  requireAr6(sample.owner.infrastructure === "ready", "fixture-unavailable");
  const trace = sample.routing;
  if (!trace) {
    const composed = sample.composedEvidence;
    requireAr6(composed?.deterministicOwner?.provenance === "CURRENT_DETERMINISTIC_VALIDATOR" && composed.deterministicOwner.passed && /^[a-f0-9]{64}$/.test(composed.deterministicOwner.sourceDigest), "deterministic-owner-evidence-missing");
    requireAr6(composed.fixturePrecondition?.provenance === "REAL_FIXTURE_OWNER" && composed.fixturePrecondition.passed && composed.fixturePrecondition.fixtureId.length > 0, "fixture-owner-evidence-missing");
    requireAr6(composed.browser?.provenance === "REAL_BROWSER" && composed.browser.passed && composed.browser.requestId.length > 0, "browser-evidence-missing");
    requireAr6(composed.healthyPositive?.provenance === "REAL_FIXTURE_OWNER" && composed.healthyPositive.passed, "healthy-positive-missing");
    requireAr6(composed.nondisclosure?.provenance === "REAL_BROWSER" && composed.nondisclosure.passed, "nondisclosure-evidence-missing");
    requireAr6(composed.outcome === "AUTHORIZED" ? composed.browser.status === 200 : composed.browser.status === 404, "composed-http-outcome-mismatch");
    const stages = composed.stages;
    requireAr6(stages.addressValidation === (composed.outcome === "EARLY_ADDRESS_REJECTION" ? "malformed" : "well-formed"), "composed-address-stage-conflict");
    requireAr6(stages.directory === (composed.outcome === "EARLY_ADDRESS_REJECTION" ? "not-reached" : "reached"), "composed-directory-stage-conflict");
    requireAr6(composed.outcome === "EARLY_ADDRESS_REJECTION" ? stages.bridge === "not-reached" && stages.currentAccess === "not-reached" : composed.outcome === "EARLY_DIRECTORY_REJECTION" ? stages.bridge === "not-reached" && stages.currentAccess === "not-reached" : true, "composed-early-access-stage-conflict");
    requireAr6(composed.outcome === "CURRENT_ACCESS_DENIAL" ? stages.bridge === "reached" && stages.currentAccess === "denied" : composed.outcome === "AUTHORIZED" ? stages.bridge === "reached" && stages.currentAccess === "authorized" : stages.currentAccess !== "denied", "composed-access-stage-conflict");
    requireAr6(stages.addressMatch === (composed.outcome === "AUTHORIZED" ? "unique" : composed.outcome === "EARLY_ADDRESS_REJECTION" ? "not-reached" : "none"), "composed-match-stage-conflict");
    return { outcome: composed.outcome, addressValidation: stages.addressValidation, directory: stages.directory === "reached" ? "evaluated" : "not-reached", bridgeChecks: stages.bridge === "reached" ? 1 : 0, currentAccessChecks: stages.currentAccess === "not-reached" ? 0 : 1, targetDecision: stages.currentAccess === "denied" ? "denied" : stages.currentAccess === "authorized" ? "authorized" : "not-evaluated", addressMatch: stages.addressMatch };
  }
  requireAr6(trace && Array.isArray(trace.events) && trace.capture && trace.capture.eventCount === trace.events.length && trace.capture.digest === ar6RouteCaptureDigest(trace.events), "route-capture-incomplete");
  const events = trace.events;
  const first = events[0];
  requireAr6(first?.stage === "address-validation", "address-stage-missing");
  const wellFormed = /^\/product-alpha\/meetings\/[A-Za-z0-9_-]{24}$/.test(sample.directPath);
  requireAr6(first.result === (wellFormed ? "well-formed" : "malformed"), "address-stage-conflict");
  if (first.result === "malformed") {
    requireAr6(events.length === 1 && trace.outcome === "EARLY_ADDRESS_REJECTION", "early-address-stage-conflict");
    return { outcome: trace.outcome, addressValidation: first.result, directory: "not-reached", bridgeChecks: 0, currentAccessChecks: 0, targetDecision: "not-evaluated", addressMatch: "not-reached" };
  }
  const directory = events[1];
  requireAr6(directory?.stage === "directory" && ["ceo", "director", "manager", "unmapped"].includes(directory.persona) && ["eligible", "excluded", "absent"].includes(directory.target), "directory-stage-missing");
  const ids = new Set<string>(); let cursor = 2, checks = 0, authorized = 0;
  let targetDecision: Ar6RouteSummary["targetDecision"] = "not-evaluated";
  let targetRegistration: "found" | "not-found" | undefined;
  while (events[cursor]?.stage === "bridge") {
    const bridge = events[cursor++] as Extract<Ar6RouteEvent, { stage: "bridge" }>;
    requireAr6(bridge.checkId && !ids.has(bridge.checkId) && bridge.organizationRef && bridge.seriesRef, "bridge-stage-invalid"); ids.add(bridge.checkId);
    const access = events[cursor++];
    requireAr6(access?.stage === "current-access" && access.checkId === bridge.checkId, "access-stage-missing");
    requireAr6(access.decision === "authorized" || access.decision === "denied", "access-unavailable");
    requireAr6(access.registration === "found" || access.registration === "not-found", "registration-unavailable");
    requireAr6(access.decision !== "authorized" || access.registration === "found", "authorization-identity-conflict");
    checks++; if (access.decision === "authorized") authorized++;
    if (directory.target === "eligible" && bridge.organizationRef === sample.organizationRef && bridge.seriesRef === sample.seriesRef) {
      requireAr6(targetDecision === "not-evaluated", "target-access-duplicated");
      targetDecision = access.decision; targetRegistration = access.registration;
    } else if (directory.target === "excluded") {
      requireAr6(bridge.organizationRef !== sample.organizationRef || bridge.seriesRef !== sample.seriesRef, "excluded-target-evaluated");
    }
  }
  const complete = events[cursor++], match = events[cursor++];
  requireAr6(complete?.stage === "directory-complete" && complete.authorizedEntries === authorized, "directory-result-conflict");
  requireAr6(match?.stage === "address-match" && (match.matches === 0 || match.matches === 1) && cursor === events.length, "address-match-invalid");
  requireAr6(directory.persona !== "unmapped" || directory.target === "excluded" && checks === 0, "unmapped-access-conflict");
  requireAr6(directory.target !== "eligible" || targetDecision !== "not-evaluated", "target-access-missing");
  let outcome: Ar6RouteOutcome;
  if (match.matches === 1) {
    requireAr6(directory.target === "eligible" && targetDecision === "authorized", "authorized-chain-incomplete"); outcome = "AUTHORIZED";
  } else if (targetDecision === "denied") outcome = "CURRENT_ACCESS_DENIAL";
  else {
    requireAr6(targetDecision !== "authorized", "authorized-target-not-matched");
    outcome = directory.target === "excluded" && checks === 0 ? "EARLY_DIRECTORY_REJECTION" : "ADDRESS_NOT_FOUND_AFTER_DIRECTORY";
  }
  requireAr6(trace.outcome === outcome, "route-outcome-conflict");
  if (targetRegistration !== undefined) requireAr6(sample.owner.registration === targetRegistration, "registration-attribution-conflict");
  return { outcome, addressValidation: first.result, directory: "evaluated", bridgeChecks: checks, currentAccessChecks: checks, targetDecision, addressMatch: match.matches === 1 ? "unique" : "none" };
}

export type Ar6BrowserSample = {
  binding: Ar6Binding; caseId: Ar6BrowserCase; viewport: "desktop" | "narrow";
  width: number; height: number; navigation: "initial" | "hard-reload" | "fresh-process"; processRef: string;
  status: number; origin: string; entryPath: string; directPath: string;
  organizationRef: string; seriesRef: string; occurrenceRef: string;
  routing?: Ar6RouteEvidence;
  composedEvidence?: Ar6ComposedEvidence;
  owner: { infrastructure: "ready" | "unavailable"; registration: "found" | "not-found" | "not-evaluated";
    access: "authorized" | "denied" | "unavailable" | "not-evaluated"; bridge: "exercised" | "not-exercised";
    foreignScope?: { organizationRef: string; seriesRef: string; activeGrants: number };
    organizationGrants: number; seriesGrants: number; materialAccess: "authorized" | "denied" | "unavailable" };
  shared: Ar6SharedProjection | null;
  protectedSurfaceCount: number; forbiddenActionCount: number; existenceFallbackCount: number;
  unauthorizedPrivateCount: number; overflow: boolean; responseSurface: string;
};
export type Ar6BrowserInput = {
  binding: Ar6Binding; mode: Ar6Mode; approvedOrigin: string; address: string;
  target: { organizationRef: string; seriesRef: string; predecessorRef: string; successorRef: string };
  denialTargets: Record<Exclude<Ar6BrowserCase, "ceo" | "director">, { path: string; organizationRef: string; seriesRef: string }>;
  samples: Ar6BrowserSample[]; journey: readonly string[];
  durable: { closures: number; whatChanged: number; completions: number; successors: number; successorStarted: boolean; duplicates: number };
  hardReload: Ar6BrowserSample; freshProcess: Ar6BrowserSample;
  protectedCanaries: string[];
};
export type Ar6BrowserResult = { kind: "ar6-browser-observations"; mode: Ar6Mode; binding: Ar6Binding; observations: ObservedFact[]; evidenceBinding: { browser: "REAL_BROWSER"; fixture: "REAL_FIXTURE_OWNER"; deterministic: "CURRENT_DETERMINISTIC_VALIDATOR"; healthy: "REAL_FIXTURE_OWNER"; nondisclosure: "REAL_BROWSER" }; routing: Array<Ar6RouteSummary & { caseId: Ar6BrowserCase; viewport: "desktop" | "narrow"; navigation: Ar6BrowserSample["navigation"]; httpStatus: number }> };
const sameProjection = (a: Ar6SharedProjection | null, b: Ar6SharedProjection | null) => a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b);

/** Pure derivation. Input comes from browser AND canonical read owners; an HTTP result alone never proves authorization. */
export function deriveAr6BrowserObservations(input: Ar6BrowserInput): Ar6BrowserResult {
  assertAr6Binding(input.binding);
  requireAr6(input.mode === "synthetic-qualification" || input.mode === "authenticated-current-build", "mode-invalid");
  requireAr6(/^http:\/\/(127\.0\.0\.1|localhost):[0-9]+$/.test(input.approvedOrigin) && /^[A-Za-z0-9_-]{24}$/.test(input.address), "browser-target-invalid");
  requireAr6(input.target.predecessorRef && input.target.successorRef && input.target.predecessorRef !== input.target.successorRef, "successor-identity-invalid");
  requireAr6(input.protectedCanaries.length > 0 && input.protectedCanaries.every(v => v.length > 8), "scanner-canaries-missing");
  requireAr6(input.denialTargets && AR6_CASES.filter(r => r !== "ceo" && r !== "director").every(r => input.denialTargets[r as keyof typeof input.denialTargets]), "denial-targets-missing");
  const expectedPath = "/product-alpha/meetings/" + input.address;
  for (const role of ["manager", "denied", "unbound", "missing-grant", "foreign"] as const) {
    const target = input.denialTargets[role];
    requireAr6(target.path === expectedPath && target.organizationRef === input.target.organizationRef && target.seriesRef === input.target.seriesRef, "denial-target-invalid");
  }
  requireAr6(/^\/product-alpha\/meetings\/[A-Za-z0-9_-]{24}$/.test(input.denialTargets.unknown.path) && input.denialTargets.unknown.path !== expectedPath, "unknown-target-invalid");
  requireAr6(input.denialTargets.malformed.path.startsWith("/product-alpha/meetings/") && !/^\/product-alpha\/meetings\/[A-Za-z0-9_-]{24}$/.test(input.denialTargets.malformed.path), "malformed-target-invalid");
  const sample = (role: Ar6BrowserCase, viewport: "desktop" | "narrow") => {
    const matches = input.samples.filter(s => s.caseId === role && s.viewport === viewport);
    requireAr6(matches.length === 1, "browser-case-missing-or-duplicate"); return matches[0]!;
  };
  requireAr6(input.samples.length === AR6_CASES.length * 2, "browser-inventory-invalid");
  if (input.mode === "authenticated-current-build") requireAr6([...input.samples, input.hardReload, input.freshProcess].every(s => !!s.composedEvidence), "composed-evidence-required");
  const routing = new Map<Ar6BrowserSample, Ar6RouteSummary>();
  for (const s of [...input.samples, input.hardReload, input.freshProcess]) {
    requireAr6(s && sameAr6Binding(s.binding, input.binding), "browser-binding-mismatch");
    requireAr6(s.owner.infrastructure === "ready" && s.owner.access !== "unavailable" && s.owner.materialAccess !== "unavailable", "fixture-unavailable");
    requireAr6([s.protectedSurfaceCount, s.forbiddenActionCount, s.existenceFallbackCount, s.unauthorizedPrivateCount, s.owner.organizationGrants, s.owner.seriesGrants].every(n => Number.isInteger(n) && n >= 0), "browser-measurement-invalid");
    requireAr6(typeof s.responseSurface === "string" && typeof s.overflow === "boolean", "browser-measurement-invalid");
    const trace = classifyAr6Route(s); routing.set(s, trace);
    if (s.routing) requireAr6(s.owner.bridge === (trace.bridgeChecks ? "exercised" : "not-exercised") && s.owner.access === trace.targetDecision, "access-attribution-conflict");
  }
  const validShared = (s: Ar6BrowserSample) => s.shared !== null && Object.keys(s.shared).sort().join(",") === "phase,sharedSections,title" && typeof s.shared.title === "string" && s.shared.title.length > 0 && typeof s.shared.phase === "string" && s.shared.phase.length > 0 && Array.isArray(s.shared.sharedSections) && s.shared.sharedSections.every(v => typeof v === "string");
  const positive = (s: Ar6BrowserSample) => (s.caseId === "ceo" || s.caseId === "director") && (!s.routing || s.routing.events.find(e => e.stage === "directory")?.persona === s.caseId) && routing.get(s)!.outcome === "AUTHORIZED" && s.status === 200 && s.origin === input.approvedOrigin && s.entryPath === expectedPath && s.directPath === expectedPath && s.organizationRef === input.target.organizationRef && s.seriesRef === input.target.seriesRef && s.occurrenceRef === input.target.successorRef && s.owner.access === "authorized" && (!s.routing || s.owner.bridge === "exercised") && s.owner.registration === "found" && s.owner.organizationGrants === 1 && s.owner.seriesGrants === 1 && s.owner.materialAccess === "authorized" && validShared(s) && s.unauthorizedPrivateCount === 0;
  // Healthy positive prevents a blanket 404, missing locator or dead server from passing denial.
  requireAr6(positive(sample("ceo", "desktop")), "authorized-positive-unavailable");
  const clean = (s: Ar6BrowserSample) => s.unauthorizedPrivateCount === 0 && !input.protectedCanaries.some(c => s.responseSurface.includes(c));
  const denial = (role: Ar6BrowserCase) => (["desktop", "narrow"] as const).every(v => {
    const s = sample(role, v);
    const target = input.denialTargets[role as keyof typeof input.denialTargets];
    const trace = routing.get(s)!;
    const directory = s.routing?.events.find(e => e.stage === "directory");
    const route = target && s.entryPath === target.path && s.directPath === target.path && s.organizationRef === target.organizationRef && s.seriesRef === target.seriesRef;
    // These controls have different prerequisites. A separate unmapped subject cannot
    // qualify an unbound-participant or missing-grant check at the current-access owner.
    let boundary = false;
    switch (role) {
      case "malformed": boundary = trace.outcome === "EARLY_ADDRESS_REJECTION"; break;
      case "denied": boundary = trace.outcome === "EARLY_DIRECTORY_REJECTION" && (!s.routing || directory?.persona === "unmapped"); break;
      case "unknown": boundary = trace.outcome === "ADDRESS_NOT_FOUND_AFTER_DIRECTORY" && (!s.routing || directory?.target === "absent") && trace.targetDecision === "not-evaluated"; break;
      case "manager":
        boundary = (!s.routing || directory?.persona === "manager") && (!s.routing || directory!.target === "excluded"
          ? (trace.outcome === "EARLY_DIRECTORY_REJECTION" || trace.outcome === "ADDRESS_NOT_FOUND_AFTER_DIRECTORY") && trace.targetDecision === "not-evaluated"
          : trace.outcome === "CURRENT_ACCESS_DENIAL" && s.owner.registration === "found");
        boundary = boundary && s.owner.organizationGrants === 1 && s.owner.seriesGrants === 0; break;
      case "unbound": boundary = trace.outcome === "CURRENT_ACCESS_DENIAL" && s.owner.registration === "not-found" && s.owner.organizationGrants === 0 && s.owner.seriesGrants === 0; break;
      case "missing-grant": boundary = trace.outcome === "CURRENT_ACCESS_DENIAL" && s.owner.registration === "found" && s.owner.organizationGrants === 1 && s.owner.seriesGrants === 0; break;
      case "foreign": boundary = trace.outcome === "CURRENT_ACCESS_DENIAL" && s.owner.registration === "found" && s.owner.organizationGrants === 0 && s.owner.seriesGrants === 0 && !!s.owner.foreignScope && !!s.owner.foreignScope.organizationRef && !!s.owner.foreignScope.seriesRef && s.owner.foreignScope.organizationRef !== input.target.organizationRef && s.owner.foreignScope.seriesRef !== input.target.seriesRef && Number.isInteger(s.owner.foreignScope.activeGrants) && s.owner.foreignScope.activeGrants > 0; break;
    }
    return boundary && route && s.status === 404 && s.origin === input.approvedOrigin && s.shared === null && s.protectedSurfaceCount === 0 && s.forbiddenActionCount === 0 && s.existenceFallbackCount === 0 && clean(s);
  });
  const bothPositive = (["desktop", "narrow"] as const).every(v => positive(sample("ceo", v)) && positive(sample("director", v)));
  const values: Record<typeof AR6_BROWSER_FACTS[number], boolean> = {
    "browser-journey-ordered": JSON.stringify(input.journey) === JSON.stringify(AR6_JOURNEY),
    "ceo-current-lifecycle-complete": input.durable.closures === 1 && input.durable.whatChanged === 1 && input.durable.completions === 1,
    "current-entry-meeting-home-bound": bothPositive,
    "participant-bridge-exercised": bothPositive && sample("missing-grant", "desktop").owner.bridge === "exercised",
    "participant-registration-bound": bothPositive,
    "exact-series-grants-checked": bothPositive && denial("missing-grant"),
    "director-shared-successor-visible": bothPositive && (["desktop", "narrow"] as const).every(v => sameProjection(sample("ceo", v).shared, sample("director", v).shared)),
    // A shared source-backed projection is lawful for both CEO and Director.  The
    // nonshared boundary is a Director-only control or private Working content.
    "director-authority-not-expanded": bothPositive && (["desktop", "narrow"] as const).every(v => sample("director", v).forbiddenActionCount === 0 && sample("director", v).unauthorizedPrivateCount === 0),
    "manager-not-found-nondisclosure": denial("manager"),
    "denied-not-found-nondisclosure": denial("denied"),
    "unbound-not-found-nondisclosure": denial("unbound"),
    "missing-series-grant-not-found": denial("missing-grant"),
    "foreign-scope-not-found": denial("foreign"),
    "invalid-address-not-found": denial("malformed") && denial("unknown"),
    "desktop-viewport": input.samples.filter(s => s.viewport === "desktop").every(s => !s.overflow && s.width === 1440 && s.height === 1000),
    "narrow-viewport": input.samples.filter(s => s.viewport === "narrow").every(s => !s.overflow && s.width === 390 && s.height === 844),
    "hard-reload-reconstructed": input.hardReload.caseId === "ceo" && input.hardReload.navigation === "hard-reload" && input.hardReload.processRef === sample("ceo", "desktop").processRef && positive(input.hardReload) && sameProjection(sample("ceo", "desktop").shared, input.hardReload.shared),
    "successor-fresh-process-reconstructed": input.freshProcess.caseId === "ceo" && input.freshProcess.navigation === "fresh-process" && !!input.freshProcess.processRef && input.freshProcess.processRef !== sample("ceo", "desktop").processRef && positive(input.freshProcess) && sameProjection(sample("ceo", "desktop").shared, input.freshProcess.shared),
    "successor-not-started": input.durable.successors === 1 && input.durable.successorStarted === false && input.durable.duplicates === 0,
    "successor-execution-not-claimed": input.durable.successorStarted === false,
  };
  return { kind: "ar6-browser-observations", mode: input.mode, binding: { ...input.binding }, evidenceBinding: { browser: "REAL_BROWSER", fixture: "REAL_FIXTURE_OWNER", deterministic: "CURRENT_DETERMINISTIC_VALIDATOR", healthy: "REAL_FIXTURE_OWNER", nondisclosure: "REAL_BROWSER" }, observations: AR6_BROWSER_FACTS.map(factId => ({ factId, state: values[factId] ? "match" : "mismatch" })), routing: [...routing].map(([s, trace]) => ({ ...trace, caseId: s.caseId, viewport: s.viewport, navigation: s.navigation, httpStatus: s.status })) };
}
/** Future browser adapter supplies actual samples. No Playwright import, launch or acquisition on import. */
export async function measureAr6Browser(configuration: Ar6Infrastructure, owner: { verifyInfrastructure(configuration: Ar6Infrastructure): Promise<void>; collect(): Promise<Ar6BrowserInput> }): Promise<Ar6BrowserResult> {
  validateAr6Infrastructure(configuration);
  await owner.verifyInfrastructure(configuration);
  const binding = configuration.binding;
  const input = await owner.collect();
  requireAr6(input.mode === configuration.mode, "browser-mode-mismatch");
  requireAr6(sameAr6Binding(binding, input.binding), "browser-binding-mismatch");
  return deriveAr6BrowserObservations(input);
}
export const ar6BrowserObservationDigest = (value: Ar6BrowserResult) => acceptanceDigest({ mode: value.mode, binding: value.binding, evidenceBinding: value.evidenceBinding, observations: value.observations, routing: value.routing });
