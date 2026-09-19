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
  RuntimeStoragePreconditionFailedError,
  RuntimeStorageIntegrityError,
  VercelBlobOrganizationRuntimeRepository,
  type OrganizationRuntimeReplaceAuditEvent,
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
  getCount = 0;
  putCount = 0;
  failNextGet = false;
  private revision = 0;

  async get(pathname: string) {
    this.getCount += 1;
    if (this.failNextGet) {
      this.failNextGet = false;
      throw new Error("diagnostic-read-failure");
    }
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
    this.putCount += 1;
    const current = this.objects.get(pathname);
    if (!options.allowOverwrite && current) {
      throw new RuntimeStorageConflictError("Object already exists");
    }
    if (options.ifMatch && current?.etag !== options.ifMatch) {
      throw new RuntimeStoragePreconditionFailedError("Object revision changed");
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
  const priorStoreId = process.env.BLOB_STORE_ID;
  process.env.BLOB_STORE_ID = "store-private-locator";
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
    local.create(organizationId, first, { ...metadata, requestId: "hosted-runtime-validation:duplicate" }),
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
    local.replace(organizationId, first, localCreated.revision, { ...metadata, requestId: "hosted-runtime-validation:stale" }),
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
  const replaceAudit: OrganizationRuntimeReplaceAuditEvent[] = [];
  const hosted = new VercelBlobOrganizationRuntimeRepository(
    client,
    "validation/runtime/v1",
    (event) => replaceAudit.push(event),
  );
  await check(() => assert.equal(hosted.backend, "vercel-blob"));
  await check(async () => assert.equal(await hosted.read(organizationId), null));
  const hostedCreated = await hosted.create(organizationId, first, metadata);
  await check(() => assert.deepEqual(hostedCreated.bytes, first));
  await hosted.backup(organizationId, "before-replace", metadata);
  await hosted.readWithRuntimeProvenance(organizationId, {
    ...metadata,
    writerClass: "CanonicalLocalSourceBindingService",
    correlationId: "correlation-runtime-audit-001",
  });
  const hostedReplaced = await hosted.replace(
    organizationId,
    second,
    hostedCreated.revision,
    { ...metadata, writerClass: "CanonicalLocalSourceBindingService", correlationId: "correlation-runtime-audit-001" },
  );
  await check(() => assert.deepEqual(hostedReplaced.bytes, second));
  const getsBeforeConflict = client.getCount;
  const putsBeforeConflict = client.putCount;
  await check(() => assert.rejects(
    hosted.replace(organizationId, first, hostedCreated.revision, { ...metadata, writerClass: "CanonicalProductWorkspaceAdapter" }),
    RuntimeStorageConflictError,
  ));
  await check(() => assert.equal(client.getCount, getsBeforeConflict + 1, "genuine Blob precondition failure performs exactly one diagnostic read"));
  await check(() => assert.equal(client.putCount, putsBeforeConflict + 1, "conflict performs no mutation retry"));
  await check(() => assert.deepEqual(
    replaceAudit.map((event) => event.event),
    [
      "ORGANIZATION_RUNTIME_READ",
      "ORGANIZATION_RUNTIME_REPLACE_ATTEMPT",
      "ORGANIZATION_RUNTIME_REPLACE_SUCCESS",
      "ORGANIZATION_RUNTIME_REPLACE_ATTEMPT",
      "ORGANIZATION_RUNTIME_POST_CONFLICT_READ",
      "ORGANIZATION_RUNTIME_REPLACE_CONFLICT",
    ],
  ));
  await check(() => {
    const [read, attempt, success, conflictAttempt, postConflictRead, conflict] = replaceAudit;
    assert.equal(read?.writerClass, "CanonicalLocalSourceBindingService");
    assert.equal(read?.retrievalMethod, "GET");
    assert.ok(read?.revisionFingerprint);
    assert.equal(attempt?.writerClass, "CanonicalLocalSourceBindingService");
    assert.equal(success?.writerClass, "CanonicalLocalSourceBindingService");
    assert.ok(success?.correlationFingerprint);
    assert.equal(conflictAttempt?.writerClass, "CanonicalProductWorkspaceAdapter");
    assert.equal(conflict?.writerClass, "CanonicalProductWorkspaceAdapter");
    assert.equal(postConflictRead?.retrievalMethod, "GET");
    assert.equal(read?.organizationFingerprint, attempt?.organizationFingerprint);
    assert.equal(read?.runtimeObjectKeyFingerprint, attempt?.runtimeObjectKeyFingerprint);
    assert.equal(read?.blobStoreIdFingerprint, attempt?.blobStoreIdFingerprint);
    assert.equal(postConflictRead?.organizationFingerprint, conflict?.organizationFingerprint);
    assert.equal(postConflictRead?.runtimeObjectKeyFingerprint, conflict?.runtimeObjectKeyFingerprint);
    assert.equal(postConflictRead?.blobStoreIdFingerprint, conflict?.blobStoreIdFingerprint);
    assert.equal(postConflictRead?.revisionFingerprint, conflict?.currentRevisionFingerprint);
    assert.ok(success?.resultingRevisionFingerprint);
    assert.ok(conflict?.currentRevisionFingerprint);
    assert.notEqual(conflict?.expectedRevisionFingerprint, conflict?.currentRevisionFingerprint);
  });
  await check(() => {
    const serialized = JSON.stringify(replaceAudit);
    assert.doesNotMatch(serialized, /etag-[0-9]|validation\/runtime\/v1|atlas-hosted-validation|sensitive-source-body|private-locator|store-private-locator|correlation-runtime-audit-001|token|bytes|runtime"/i);
    assert.doesNotMatch(serialized, /private.*blob|blob.*private/i);
  });
  await check(async () => {
    const hostileEvents: OrganizationRuntimeReplaceAuditEvent[] = [];
    const hostile = new VercelBlobOrganizationRuntimeRepository(
      client,
      "validation/runtime/v1",
      (event) => hostileEvents.push(event),
    );
    await assert.rejects(
      hostile.replace(
        organizationId,
        first,
        hostedCreated.revision,
        {
          requestId: "private-locator:https://private.blob.example/token",
          operatorId: "private-locator",
          writerClass: "RuntimeProvisioningRecovery",
          correlationId: "private-locator:correlation",
        },
      ),
      RuntimeStorageConflictError,
    );
    const serialized = JSON.stringify(hostileEvents);
    assert.equal(hostileEvents.at(-1)?.writerClass, "RuntimeProvisioningRecovery");
    assert.doesNotMatch(serialized, /private-locator|private\.blob\.example|token/i);
  });
  await check(async () => {
    client.failNextGet = true;
    const putsBeforeDiagnosticFailure = client.putCount;
    const eventsBeforeDiagnosticFailure = replaceAudit.length;
    await assert.rejects(
      hosted.replace(
        organizationId,
        first,
        hostedCreated.revision,
        { ...metadata, writerClass: "CanonicalLocalSourceBindingService" },
      ),
      RuntimeStorageConflictError,
    );
    assert.equal(client.putCount, putsBeforeDiagnosticFailure + 1);
    const diagnosticFailureEvents = replaceAudit.slice(eventsBeforeDiagnosticFailure);
    assert.deepEqual(
      diagnosticFailureEvents.map((event) => event.event),
      [
        "ORGANIZATION_RUNTIME_REPLACE_ATTEMPT",
        "ORGANIZATION_RUNTIME_POST_CONFLICT_READ",
        "ORGANIZATION_RUNTIME_REPLACE_CONFLICT",
      ],
    );
    assert.equal(diagnosticFailureEvents[1]?.revisionFingerprint, undefined);
  });
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
    hosted.create(organizationId, first, { ...metadata, requestId: "hosted-runtime-validation:duplicate" }),
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
      activationSource.indexOf("createOrganizationRuntimeRepository(process.env, sql).read"),
    "Runtime repository read must remain inside the authorized disclosure transaction",
  ));
  const healthSource = await readFile("app/api/health/route.ts", "utf8");
  await check(() => assert.match(healthSource, /inspectCanonicalFounderRuntimeHealth\(sql, process\.env\)/));
  const healthOperationSource = await readFile("lib/alpha-provisioning/productionFounderRuntimeHealth.ts", "utf8");
  await check(() => assert.match(healthOperationSource, /new PostgresOrganizationRuntimeRepository\(connection\)/));
  await check(() => assert.doesNotMatch(healthOperationSource, /createOrganizationRuntimeRepository/));
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

  if (priorStoreId === undefined) delete process.env.BLOB_STORE_ID;
  else process.env.BLOB_STORE_ID = priorStoreId;
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
    healthUsesCanonicalFounderRuntimeRead: true,
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
