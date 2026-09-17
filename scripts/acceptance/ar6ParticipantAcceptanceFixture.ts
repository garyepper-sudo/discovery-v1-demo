import path from "node:path";
import type { ParticipantReferenceAccessAdministration } from "../../lib/alpha-activation/participantReferenceAccess";
import { assertAr6Binding, requireAr6, type Ar6Binding, type Ar6Mode } from "./ar6CurrentBuildAcceptanceProfile";

export const AR6_ROLES = ["ceo", "director", "manager", "denied"] as const;
export type Ar6Role = typeof AR6_ROLES[number];
export type Ar6Database = { name: string; application: string; administration: string; migration: string; ownershipRef: string };
export type Ar6Infrastructure = {
  binding: Ar6Binding; mode: Ar6Mode; root: string; database: Ar6Database;
  browser: { executablePath: string; sha256: string; ownership: "borrowed" | "task-owned" };
  network: { enforcementRef: string; allowedOrigins: string[] };
  locator: { secret: string; instance: string }; issuerAuthority: string;
  subjects: Record<Ar6Role, { subjectRef: string; verificationRef: string }>;
};

export function containedAr6Path(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return path.isAbsolute(candidate) && relative.length > 0 && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
}
export function validateAr6Infrastructure(c: Ar6Infrastructure): void {
  requireAr6(c, "configuration-missing"); assertAr6Binding(c.binding);
  requireAr6(c.mode === "synthetic-qualification" || c.mode === "authenticated-current-build", "mode-invalid");
  requireAr6(typeof c.root === "string" && /^\/private\/tmp\/discovery-ar6-[a-z0-9-]+$/.test(c.root), "root-invalid");
  requireAr6(c.database && /^discovery_ar6_acceptance_[a-z0-9]+$/.test(c.database.name) && c.database.ownershipRef, "database-unowned");
  let urls: URL[];
  try { urls = [c.database.application, c.database.administration, c.database.migration].map(v => new URL(v)); }
  catch { requireAr6(false, "database-invalid"); }
  const first = urls![0]!;
  for (const u of urls!) {
    requireAr6(["postgres:", "postgresql:"].includes(u.protocol) && ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname), "database-target-invalid");
    requireAr6(u.pathname === "/" + c.database.name && u.hostname === first.hostname && u.port === first.port && !u.search && !u.hash, "database-target-mismatch");
  }
  requireAr6(c.browser && path.isAbsolute(c.browser.executablePath) && /^[a-f0-9]{64}$/.test(c.browser.sha256) && ["borrowed", "task-owned"].includes(c.browser.ownership), "browser-missing");
  if (c.browser.ownership === "task-owned") requireAr6(containedAr6Path(c.root, c.browser.executablePath), "browser-root-escape");
  requireAr6(c.network?.enforcementRef && Array.isArray(c.network.allowedOrigins) && c.network.allowedOrigins.length > 0, "network-enforcement-missing");
  for (const origin of c.network.allowedOrigins) {
    let u: URL; try { u = new URL(origin); } catch { requireAr6(false, "network-origin-invalid"); }
    requireAr6(u!.origin === origin && !u!.username && !u!.password && (u!.protocol === "https:" || u!.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u!.hostname)), "network-origin-invalid");
  }
  requireAr6(c.locator && typeof c.locator.secret === "string" && c.locator.secret.length >= 32 && c.locator.instance && c.issuerAuthority, "locator-or-issuer-missing");
  requireAr6(c.subjects && AR6_ROLES.every(r => c.subjects[r]?.subjectRef && c.subjects[r]?.verificationRef), "authenticated-subjects-missing");
  requireAr6(new Set(AR6_ROLES.map(r => c.subjects[r].subjectRef)).size === 4, "subject-alias");
}

export type Ar6OwnedResource = { kind: "auth-user" | "auth-session" | "database" | "server" | "browser-profile" | "root"; ref: string; ownershipRef: string };
export type Ar6FixtureRecord = {
  binding: Ar6Binding; mode: Ar6Mode; organizationId: string; seriesId: string;
  participants: Partial<Record<Ar6Role, string>>; ready: boolean;
};
/** Adapters must call the named canonical owners. They are injected to keep imports and qualification nonexternal. */
export interface Ar6FixtureOwners {
  verifyInfrastructure(c: Ar6Infrastructure): Promise<void>; // Actual ownership, browser bytes, enforcement and verified subjects, not just URL parsing.
  initializeNamespace(): Promise<void>;
  registerAuthenticatedSubject(role: Ar6Role): Promise<{ participantRef: string }>; // Real request owner; never construct a VerifiedClerkLocator here.
  administration: {
    activatePolicy(input: Parameters<ParticipantReferenceAccessAdministration["activatePolicy"]>[0]): Promise<unknown>;
    grant(input: Parameters<ParticipantReferenceAccessAdministration["grant"]>[0]): Promise<unknown>;
  };
  inspectCurrentAccess(role: Ar6Role, seriesId: string): Promise<"authorized" | "denied" | "unavailable">;
  persist(record: Ar6FixtureRecord): Promise<void>;
}
export async function prepareAr6ParticipantFixture(c: Ar6Infrastructure, target: { organizationId: string; seriesId: string; occurredAt: string }, owners: Ar6FixtureOwners): Promise<Ar6FixtureRecord> {
  validateAr6Infrastructure(c);
  requireAr6(target.organizationId && target.seriesId && Number.isFinite(Date.parse(target.occurredAt)), "fixture-target-invalid");
  const record: Ar6FixtureRecord = { binding: { ...c.binding }, mode: c.mode, ...target, participants: {}, ready: false };
  await owners.verifyInfrastructure(c);
  await owners.persist(structuredClone(record)); // Before the first identity write; the outer runner already owns auth/DB creation.
  await owners.initializeNamespace();
  await owners.administration.activatePolicy({ organizationId: target.organizationId, issuerAuthority: c.issuerAuthority, operationId: c.binding.taskDigest + ":policy", occurredAt: target.occurredAt });
  for (const role of AR6_ROLES) {
    const identity = await owners.registerAuthenticatedSubject(role);
    requireAr6(identity?.participantRef && !Object.values(record.participants).includes(identity.participantRef), "participant-binding-invalid");
    record.participants[role] = identity.participantRef;
    await owners.persist(structuredClone(record));
    if (role === "denied") continue;
    await owners.administration.grant({ organizationId: target.organizationId, participantRef: identity.participantRef, scope: "organization", issuerAuthority: c.issuerAuthority, operationId: c.binding.taskDigest + ":" + role + ":organization", occurredAt: target.occurredAt });
    if (role === "ceo" || role === "director") await owners.administration.grant({ organizationId: target.organizationId, participantRef: identity.participantRef, scope: "meeting-series", meetingSeriesId: target.seriesId, issuerAuthority: c.issuerAuthority, operationId: c.binding.taskDigest + ":" + role + ":series", occurredAt: target.occurredAt });
  }
  for (const role of AR6_ROLES) requireAr6(await owners.inspectCurrentAccess(role, target.seriesId) === (role === "ceo" || role === "director" ? "authorized" : "denied"), "fixture-access-not-established");
  record.ready = true; await owners.persist(structuredClone(record)); return record;
}
