import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get,
  head,
  put,
} from "@vercel/blob";

import type { OrganizationRuntime } from "./organizationRuntime";
import { normalizeOrganizationRuntime } from "./organizationStateStore";
import { getRuntimeOrganizationsDirectory } from "./runtimeStorageLocation";

export type RuntimeStorageBackend = "filesystem" | "vercel-blob";

export type StoredOrganizationRuntime = {
  bytes: Uint8Array;
  revision: string;
  runtime: OrganizationRuntime;
};

export type RuntimeStorageOperationMetadata = {
  requestId: string;
  operatorId: string;
};

export interface OrganizationRuntimeRepository {
  readonly backend: RuntimeStorageBackend;
  read(organizationId: string): Promise<StoredOrganizationRuntime | null>;
  exists(organizationId: string): Promise<boolean>;
  create(
    organizationId: string,
    bytes: Uint8Array,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime>;
  replace(
    organizationId: string,
    bytes: Uint8Array,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime>;
  backup(
    organizationId: string,
    backupId: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime>;
  restore(
    organizationId: string,
    backupId: string,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime>;
}

export class RuntimeStorageConflictError extends Error {}
export class RuntimeStorageIntegrityError extends Error {}

const VALID_ID = /^[a-zA-Z0-9_-]+$/;

function exactId(value: string, label: string): string {
  if (!VALID_ID.test(value)) {
    throw new RuntimeStorageIntegrityError(`${label} is invalid`);
  }
  return value;
}

function digest(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function parseRuntime(
  organizationId: string,
  bytes: Uint8Array,
): OrganizationRuntime {
  let parsed: OrganizationRuntime;
  try {
    parsed = JSON.parse(Buffer.from(bytes).toString("utf8")) as OrganizationRuntime;
  } catch {
    throw new RuntimeStorageIntegrityError("Runtime JSON is malformed");
  }
  if (parsed?.metadata?.organizationId !== organizationId) {
    throw new RuntimeStorageIntegrityError("Runtime organization mismatch");
  }
  return normalizeOrganizationRuntime(parsed);
}

function stored(
  organizationId: string,
  bytes: Uint8Array,
  revision = digest(bytes),
): StoredOrganizationRuntime {
  return {
    bytes,
    revision,
    runtime: parseRuntime(organizationId, bytes),
  };
}

export function organizationRuntimeObjectKey(
  organizationId: string,
  prefix = "discovery/runtime/v1",
): string {
  return `${prefix.replace(/^\/+|\/+$/g, "")}/organizations/${exactId(
    organizationId,
    "Organization id",
  )}/runtime.json`;
}

export function organizationRuntimeBackupObjectKey(
  organizationId: string,
  backupId: string,
  prefix = "discovery/runtime/v1",
): string {
  return `${prefix.replace(/^\/+|\/+$/g, "")}/organizations/${exactId(
    organizationId,
    "Organization id",
  )}/backups/${exactId(backupId, "Backup id")}.json`;
}

export class FilesystemOrganizationRuntimeRepository
implements OrganizationRuntimeRepository {
  readonly backend = "filesystem" as const;

  constructor(
    private readonly directory = getRuntimeOrganizationsDirectory(),
  ) {}

  private activePath(organizationId: string): string {
    return path.join(this.directory, `${exactId(organizationId, "Organization id")}.json`);
  }

  private backupPath(organizationId: string, backupId: string): string {
    return path.join(
      this.directory,
      ".backups",
      exactId(organizationId, "Organization id"),
      `${exactId(backupId, "Backup id")}.json`,
    );
  }

  async read(organizationId: string): Promise<StoredOrganizationRuntime | null> {
    try {
      const bytes = await readFile(this.activePath(organizationId));
      return stored(organizationId, new Uint8Array(bytes));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async exists(organizationId: string): Promise<boolean> {
    return (await this.read(organizationId)) !== null;
  }

  async create(
    organizationId: string,
    bytes: Uint8Array,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const value = stored(organizationId, bytes);
    await mkdir(this.directory, { recursive: true });
    try {
      await writeFile(this.activePath(organizationId), bytes, { flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        throw new RuntimeStorageConflictError("Runtime already exists");
      }
      throw error;
    }
    return value;
  }

  async replace(
    organizationId: string,
    bytes: Uint8Array,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const current = await this.read(organizationId);
    if (!current || current.revision !== expectedRevision) {
      throw new RuntimeStorageConflictError("Runtime revision changed");
    }
    const value = stored(organizationId, bytes);
    const temporary = `${this.activePath(organizationId)}.${createHash("sha256")
      .update(metadata.requestId)
      .digest("hex")}.tmp`;
    await writeFile(temporary, bytes, { flag: "wx" });
    await rename(temporary, this.activePath(organizationId));
    return value;
  }

  async backup(
    organizationId: string,
    backupId: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const current = await this.read(organizationId);
    if (!current) throw new RuntimeStorageIntegrityError("Runtime is missing");
    const destination = this.backupPath(organizationId, backupId);
    await mkdir(path.dirname(destination), { recursive: true });
    try {
      await copyFile(
        this.activePath(organizationId),
        destination,
        constants.COPYFILE_EXCL,
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        throw new RuntimeStorageConflictError("Backup already exists");
      }
      throw error;
    }
    return current;
  }

  async restore(
    organizationId: string,
    backupId: string,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const current = await this.read(organizationId);
    if (!current || current.revision !== expectedRevision) {
      throw new RuntimeStorageConflictError("Runtime revision changed");
    }
    const bytes = new Uint8Array(
      await readFile(this.backupPath(organizationId, backupId)),
    );
    const value = stored(organizationId, bytes);
    const temporary = `${this.activePath(organizationId)}.${createHash("sha256")
      .update(metadata.requestId)
      .digest("hex")}.restore`;
    await copyFile(this.backupPath(organizationId, backupId), temporary);
    await rename(temporary, this.activePath(organizationId));
    return value;
  }
}

export interface PrivateBlobClient {
  get(pathname: string): Promise<{ bytes: Uint8Array; etag: string } | null>;
  head(pathname: string): Promise<{ etag: string } | null>;
  put(
    pathname: string,
    bytes: Uint8Array,
    options: { allowOverwrite: boolean; ifMatch?: string },
  ): Promise<{ etag: string }>;
}

export function createVercelPrivateBlobClient(): PrivateBlobClient {
  return {
    async get(pathname) {
      const result = await get(pathname, {
        access: "private",
        useCache: false,
      });
      if (!result) return null;
      if (result.statusCode !== 200) {
        throw new Error("Unexpected private Blob response");
      }
      return {
        bytes: new Uint8Array(await new Response(result.stream).arrayBuffer()),
        etag: result.blob.etag,
      };
    },
    async head(pathname) {
      try {
        const result = await head(pathname);
        return { etag: result.etag };
      } catch (error) {
        if (error instanceof BlobNotFoundError) return null;
        throw error;
      }
    },
    async put(pathname, bytes, options) {
      try {
        const result = await put(pathname, Buffer.from(bytes), {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: options.allowOverwrite,
          ...(options.ifMatch ? { ifMatch: options.ifMatch } : {}),
          cacheControlMaxAge: 0,
          contentType: "application/json",
        });
        return { etag: result.etag };
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) {
          throw new RuntimeStorageConflictError("Runtime revision changed");
        }
        throw error;
      }
    },
  };
}

export class VercelBlobOrganizationRuntimeRepository
implements OrganizationRuntimeRepository {
  readonly backend = "vercel-blob" as const;

  constructor(
    private readonly client: PrivateBlobClient = createVercelPrivateBlobClient(),
    private readonly prefix = process.env.DISCOVERY_RUNTIME_BLOB_PREFIX ??
      "discovery/runtime/v1",
  ) {}

  private key(organizationId: string): string {
    return organizationRuntimeObjectKey(organizationId, this.prefix);
  }

  private backupKey(organizationId: string, backupId: string): string {
    return organizationRuntimeBackupObjectKey(organizationId, backupId, this.prefix);
  }

  async read(organizationId: string): Promise<StoredOrganizationRuntime | null> {
    const result = await this.client.get(this.key(organizationId));
    return result ? stored(organizationId, result.bytes, result.etag) : null;
  }

  async exists(organizationId: string): Promise<boolean> {
    return (await this.client.head(this.key(organizationId))) !== null;
  }

  async create(
    organizationId: string,
    bytes: Uint8Array,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const value = stored(organizationId, bytes);
    if (await this.exists(organizationId)) {
      throw new RuntimeStorageConflictError("Runtime already exists");
    }
    const result = await this.client.put(this.key(organizationId), bytes, {
      allowOverwrite: false,
    });
    return { ...value, revision: result.etag };
  }

  async replace(
    organizationId: string,
    bytes: Uint8Array,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const value = stored(organizationId, bytes);
    const result = await this.client.put(this.key(organizationId), bytes, {
      allowOverwrite: true,
      ifMatch: expectedRevision,
    });
    return { ...value, revision: result.etag };
  }

  async backup(
    organizationId: string,
    backupId: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const current = await this.read(organizationId);
    if (!current) throw new RuntimeStorageIntegrityError("Runtime is missing");
    if (await this.client.head(this.backupKey(organizationId, backupId))) {
      throw new RuntimeStorageConflictError("Backup already exists");
    }
    await this.client.put(this.backupKey(organizationId, backupId), current.bytes, {
      allowOverwrite: false,
    });
    return current;
  }

  async restore(
    organizationId: string,
    backupId: string,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const backup = await this.client.get(this.backupKey(organizationId, backupId));
    if (!backup) throw new RuntimeStorageIntegrityError("Runtime backup is missing");
    const value = stored(organizationId, backup.bytes);
    const result = await this.client.put(this.key(organizationId), backup.bytes, {
      allowOverwrite: true,
      ifMatch: expectedRevision,
    });
    return { ...value, revision: result.etag };
  }
}

export function configuredRuntimeStorageBackend(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): RuntimeStorageBackend {
  const configured = environment.DISCOVERY_RUNTIME_STORAGE_BACKEND;
  if (configured === "filesystem" || configured === "vercel-blob") {
    if (environment.VERCEL === "1" && configured !== "vercel-blob") {
      throw new Error("Vercel requires DISCOVERY_RUNTIME_STORAGE_BACKEND=vercel-blob");
    }
    return configured;
  }
  if (environment.VERCEL === "1") {
    throw new Error("DISCOVERY_RUNTIME_STORAGE_BACKEND is required on Vercel");
  }
  return "filesystem";
}

export function createOrganizationRuntimeRepository(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): OrganizationRuntimeRepository {
  return configuredRuntimeStorageBackend(environment) === "vercel-blob"
    ? new VercelBlobOrganizationRuntimeRepository()
    : new FilesystemOrganizationRuntimeRepository();
}
