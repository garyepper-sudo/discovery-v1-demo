import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  configuredRuntimeStorageBackend,
  FilesystemOrganizationRuntimeRepository,
  organizationRuntimeBackupObjectKey,
  organizationRuntimeObjectKey,
  RuntimeStorageConflictError,
  RuntimeStorageIntegrityError,
  VercelBlobOrganizationRuntimeRepository,
  type PrivateBlobClient,
} from "../../engine/v3/runtime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";

let checks = 0;
async function check(run: () => void | Promise<void>): Promise<void> {
  await run();
  checks += 1;
}

function bytes(organizationId: string, revision: number): Uint8Array {
  const runtime = createEmptyOrganizationRuntime({ organizationId });
  runtime.metadata.investigationCount = revision;
  return new TextEncoder().encode(`${JSON.stringify(runtime, null, 2)}\n`);
}

class IsolatedPrivateBlobClient implements PrivateBlobClient {
  readonly objects = new Map<string, { bytes: Uint8Array; etag: string }>();
  private revision = 0;

  async get(pathname: string) {
    const value = this.objects.get(pathname);
    return value
      ? { bytes: value.bytes.slice(), etag: value.etag }
      : null;
  }

  async head(pathname: string) {
    const value = this.objects.get(pathname);
    return value ? { etag: value.etag } : null;
  }

  async put(
    pathname: string,
    value: Uint8Array,
    options: { allowOverwrite: boolean; ifMatch?: string },
  ) {
    const current = this.objects.get(pathname);
    if (!options.allowOverwrite && current) {
      throw new RuntimeStorageConflictError("Object already exists");
    }
    if (options.ifMatch && current?.etag !== options.ifMatch) {
      throw new RuntimeStorageConflictError("Object revision changed");
    }
    this.revision += 1;
    const next = { bytes: value.slice(), etag: `etag-${this.revision}` };
    this.objects.set(pathname, next);
    return { etag: next.etag };
  }
}

const organizationId = "atlas-hosted-validation";
const metadata = {
  requestId: "hosted-runtime-validation",
  operatorId: "deterministic-validator",
};
const first = bytes(organizationId, 1);
const second = bytes(organizationId, 2);

async function main(): Promise<void> {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "discovery-runtime-repository-"),
  );
  try {
  const local = new FilesystemOrganizationRuntimeRepository(temporaryDirectory);
  await check(() => assert.equal(local.backend, "filesystem"));
  await check(async () => assert.equal(await local.exists(organizationId), false));
  const localCreated = await local.create(organizationId, first, metadata);
  await check(() => assert.deepEqual(localCreated.bytes, first));
  await check(async () => {
    const onDisk = await readFile(path.join(temporaryDirectory, `${organizationId}.json`));
    assert.deepEqual(onDisk, Buffer.from(first));
  });
  await check(() => assert.rejects(
    local.create(organizationId, first, metadata),
    RuntimeStorageConflictError,
  ));
  await local.backup(organizationId, "before-replace", metadata);
  const localReplaced = await local.replace(
    organizationId,
    second,
    localCreated.revision,
    metadata,
  );
  await check(() => assert.deepEqual(localReplaced.bytes, second));
  await check(() => assert.rejects(
    local.replace(organizationId, first, localCreated.revision, metadata),
    RuntimeStorageConflictError,
  ));
  const localRestored = await local.restore(
    organizationId,
    "before-replace",
    localReplaced.revision,
    metadata,
  );
  await check(() => assert.deepEqual(localRestored.bytes, first));

  const client = new IsolatedPrivateBlobClient();
  const hosted = new VercelBlobOrganizationRuntimeRepository(
    client,
    "validation/runtime/v1",
  );
  await check(() => assert.equal(hosted.backend, "vercel-blob"));
  await check(async () => assert.equal(await hosted.read(organizationId), null));
  const hostedCreated = await hosted.create(organizationId, first, metadata);
  await check(() => assert.deepEqual(hostedCreated.bytes, first));
  await hosted.backup(organizationId, "before-replace", metadata);
  const hostedReplaced = await hosted.replace(
    organizationId,
    second,
    hostedCreated.revision,
    metadata,
  );
  await check(() => assert.deepEqual(hostedReplaced.bytes, second));
  await check(() => assert.rejects(
    hosted.replace(organizationId, first, hostedCreated.revision, metadata),
    RuntimeStorageConflictError,
  ));
  const hostedRestored = await hosted.restore(
    organizationId,
    "before-replace",
    hostedReplaced.revision,
    metadata,
  );
  await check(() => assert.deepEqual(hostedRestored.bytes, first));
  await check(async () => assert.equal(
    await hosted.exists("another-organization"),
    false,
  ));
  await check(() => assert.equal(
    client.objects.has(organizationRuntimeObjectKey(
      "another-organization",
      "validation/runtime/v1",
    )),
    false,
  ));

  await check(() => assert.equal(
    organizationRuntimeObjectKey(organizationId),
    `discovery/runtime/v1/organizations/${organizationId}/runtime.json`,
  ));
  await check(() => assert.equal(
    organizationRuntimeBackupObjectKey(organizationId, "backup-001"),
    `discovery/runtime/v1/organizations/${organizationId}/backups/backup-001.json`,
  ));
  await check(() => assert.rejects(
    hosted.create(organizationId, first, metadata),
    RuntimeStorageConflictError,
  ));
  await check(() => assert.rejects(
    hosted.create("malformed-runtime", new TextEncoder().encode("{"), metadata),
    RuntimeStorageIntegrityError,
  ));
  await check(() => assert.rejects(
    hosted.create("wrong-organization", first, metadata),
    RuntimeStorageIntegrityError,
  ));
  await check(() => assert.throws(
    () => configuredRuntimeStorageBackend({
      VERCEL: "1",
      DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
    }),
    /Vercel requires/,
  ));
  await check(() => assert.throws(
    () => configuredRuntimeStorageBackend({ VERCEL: "1" }),
    /required on Vercel/,
  ));
  await check(() => assert.equal(
    configuredRuntimeStorageBackend({}),
    "filesystem",
  ));

  const activationSource = await readFile(
    "components/product-shell/data/loadActivatedYourOrganization.ts",
    "utf8",
  );
  await check(() => assert.ok(
    activationSource.indexOf("runDurableAlphaDisclosureTransaction") <
      activationSource.indexOf("createOrganizationRuntimeRepository().read"),
    "Runtime repository read must remain inside the authorized disclosure transaction",
  ));
  const healthSource = await readFile("app/api/health/route.ts", "utf8");
  await check(() => assert.match(
    healthSource,
    /createOrganizationRuntimeRepository\(\)\.exists\(organizationId\)/,
  ));
  const locationSource = await readFile(
    "engine/v3/runtime/runtimeStorageLocation.ts",
    "utf8",
  );
  await check(() => assert.doesNotMatch(
    `${activationSource}\n${healthSource}`,
    /getRuntimeOrganizationsDirectory/,
    "Hosted activation and health must not use the filesystem location directly",
  ));
  await check(() => assert.match(locationSource, /process\.env\.VERCEL/));

  console.log(JSON.stringify({
    validation: "hosted-runtime-storage",
    result: "PASS",
    checks,
    localFilesystemParity: true,
    privateBlobTestDouble: true,
    organizationIsolation: true,
    deterministicKeys: true,
    authorizationBeforeRuntime: true,
    revisionSafeReplacement: true,
    healthUsesConfiguredRepository: true,
    vercelTmpFallbackRejected: true,
  }, null, 2));
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
