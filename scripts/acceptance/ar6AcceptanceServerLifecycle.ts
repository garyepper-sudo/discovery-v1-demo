import path from "node:path";
import { requireAr6 } from "./ar6CurrentBuildAcceptanceProfile";
import { containedAr6Path, validateAr6Infrastructure, type Ar6Infrastructure } from "./ar6ParticipantAcceptanceFixture";

export type Ar6ServerConfig = { infrastructure: Ar6Infrastructure; cwd: string; port: number; nodeExecutable: string; fixtureRoot: string };
export type Ar6ServerHandle = { pid: number; ownershipRef: string };
export interface Ar6ServerProcessOwner {
  verifyInfrastructure(c: Ar6Infrastructure): Promise<void>;
  verifyFilesystem(c: Ar6ServerConfig): Promise<void>; // realpath containment, cwd identity, no dotenv, dependency read-only enforcement
  persist(state: { status: "RUNNING" | "CLEANUP_REQUIRED" | "CLEANUP_PASS"; handle: Ar6ServerHandle | null }): Promise<void>;
  spawn(input: { executable: string; args: string[]; cwd: string; env: Record<string, string> }): Promise<Ar6ServerHandle>;
  ready(handle: Ar6ServerHandle, url: string): Promise<void>;
  terminate(handle: Ar6ServerHandle): Promise<void>;
  absent(handle: Ar6ServerHandle): Promise<boolean>;
}
export function ar6ServerEnvironment(c: Ar6ServerConfig): Record<string, string> {
  validateAr6Infrastructure(c.infrastructure);
  const i = c.infrastructure;
  requireAr6(containedAr6Path(i.root, c.cwd) && containedAr6Path(i.root, c.fixtureRoot), "server-root-escape");
  requireAr6(Number.isInteger(c.port) && c.port >= 1024 && c.port <= 65535 && path.isAbsolute(c.nodeExecutable), "server-config-invalid");
  requireAr6(i.network.allowedOrigins.includes("http://127.0.0.1:" + c.port), "server-origin-not-approved");
  return {
    PATH: path.dirname(c.nodeExecutable) + ":/usr/bin:/bin", HOME: path.join(i.root, "home"), TMPDIR: path.join(i.root, "tmp"),
    TZ: "UTC", LANG: "C", NODE_ENV: "development", NEXT_TELEMETRY_DISABLED: "1",
    DISCOVERY_ENV: "development", NEXT_PUBLIC_DISCOVERY_ENV: "development",
    DISCOVERY_ONBOARDING_TEST_ENABLED: "true", NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED: "true", DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
    DISCOVERY_DATABASE_URL: i.database.application, DISCOVERY_DATABASE_ADMIN_URL: i.database.administration, DISCOVERY_DATABASE_MIGRATION_URL: i.database.migration,
    DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY: i.locator.secret,
    DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: path.join(c.fixtureRoot, "runtime"),
    DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT: path.join(c.fixtureRoot, "workflow"),
    DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT: path.join(c.fixtureRoot, "sources"),
    DISCOVERY_GOVERNED_SOURCE_CONTENT_ROOT: path.join(c.fixtureRoot, "sources"),
    DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT: c.fixtureRoot,
    DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false", DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false", DISCOVERY_ATLAS_LIVE_PROVISIONING_ENABLED: "false",
    DISCOVERY_HOSTED_ENVIRONMENT: "false", DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
    DISCOVERY_SANDBOX_CEO_USER_ID: i.subjects.ceo.subjectRef, DISCOVERY_SANDBOX_DIRECTOR_USER_ID: i.subjects.director.subjectRef, DISCOVERY_SANDBOX_MANAGER_USER_ID: i.subjects.manager.subjectRef,
  };
}
export async function startAr6AcceptanceServer(c: Ar6ServerConfig, auth: { publishableKey: string; secretKey: string }, owner: Ar6ServerProcessOwner): Promise<Ar6ServerHandle> {
  const env = ar6ServerEnvironment(c);
  requireAr6(auth?.publishableKey?.startsWith("pk_test_") && auth?.secretKey?.startsWith("sk_test_"), "development-auth-missing");
  // Credentials are never inherited, persisted in public logs or returned.
  env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = auth.publishableKey; env.CLERK_SECRET_KEY = auth.secretKey;
  await owner.verifyInfrastructure(c.infrastructure);
  await owner.verifyFilesystem(c);
  await owner.persist({ status: "RUNNING", handle: null });
  let handle: Ar6ServerHandle | null = null;
  try {
    handle = await owner.spawn({ executable: c.nodeExecutable, args: [path.join(c.cwd, "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(c.port)], cwd: c.cwd, env });
    requireAr6(Number.isInteger(handle.pid) && handle.pid > 0 && handle.ownershipRef, "server-handle-invalid");
    await owner.persist({ status: "RUNNING", handle });
    await owner.ready(handle, "http://127.0.0.1:" + c.port + "/alpha-access"); return handle;
  } catch {
    await owner.persist({ status: "CLEANUP_REQUIRED", handle });
    throw new Error("AR6 BLOCKED: server-not-ready");
  }
}
export async function stopAr6AcceptanceServer(handle: Ar6ServerHandle, owner: Ar6ServerProcessOwner): Promise<void> {
  requireAr6(handle.ownershipRef && Number.isInteger(handle.pid) && handle.pid > 0, "server-handle-invalid");
  await owner.persist({ status: "CLEANUP_REQUIRED", handle }); await owner.terminate(handle);
  requireAr6(await owner.absent(handle), "server-still-present"); await owner.persist({ status: "CLEANUP_PASS", handle });
}
