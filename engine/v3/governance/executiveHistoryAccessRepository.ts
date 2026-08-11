import { constants } from "node:fs";
import { lstat, mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";

import { BlobNotFoundError, BlobPreconditionFailedError, get, put } from "@vercel/blob";

import {
  assertExecutiveHistoryBinding,
  assertExecutiveHistoryPolicy,
  executiveHistoryDigest,
  executiveHistoryStable,
  type ExecutiveHistoryAccessStoreV1,
} from "./executiveHistoryCurrentAccessContracts";

export type ExecutiveHistoryAccessSnapshot = {
  store: ExecutiveHistoryAccessStoreV1;
  revision: string | null;
};

export interface ExecutiveHistoryAccessRepository {
  readonly backend: "filesystem" | "vercel-blob";
  read(organizationId: string): Promise<ExecutiveHistoryAccessSnapshot>;
  replace(
    organizationId: string,
    store: ExecutiveHistoryAccessStoreV1,
    expectedRevision: string | null,
  ): Promise<ExecutiveHistoryAccessSnapshot>;
}

export class ExecutiveHistoryAccessConflictError extends Error {}

const valid = /^[A-Za-z0-9_-]+$/;
const exactId = (value: string): string => {
  if (!valid.test(value)) throw new Error("Executive History organization identity is invalid.");
  return value;
};

const empty = (organizationId: string): ExecutiveHistoryAccessStoreV1 => {
  const unsigned = {
    contractVersion: "1" as const,
    organizationId,
    policies: [],
    bindings: [],
    events: [],
    idempotency: [],
  };
  return { ...unsigned, storeDigest: executiveHistoryDigest(unsigned) };
};

function bytes(store: ExecutiveHistoryAccessStoreV1): Uint8Array {
  const unsigned = {
    contractVersion: store.contractVersion,
    organizationId: store.organizationId,
    policies: store.policies,
    bindings: store.bindings,
    events: store.events,
    idempotency: store.idempotency,
  };
  return new TextEncoder().encode(
    `${executiveHistoryStable({ ...unsigned, storeDigest: executiveHistoryDigest(unsigned) })}\n`,
  );
}

function parse(organizationId: string, raw: Uint8Array): ExecutiveHistoryAccessStoreV1 {
  let value: ExecutiveHistoryAccessStoreV1;
  try {
    value = JSON.parse(new TextDecoder().decode(raw)) as ExecutiveHistoryAccessStoreV1;
  } catch {
    throw new Error("Executive History access store is malformed.");
  }
  if (value.organizationId !== organizationId || value.contractVersion !== "1") {
    throw new Error("Executive History access store organization mismatch.");
  }
  value.policies.forEach(assertExecutiveHistoryPolicy);
  value.bindings.forEach(assertExecutiveHistoryBinding);
  if (new TextDecoder().decode(bytes(value)) !== new TextDecoder().decode(raw)) {
    throw new Error("Executive History access store integrity failed.");
  }
  return value;
}

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export class FilesystemExecutiveHistoryAccessRepository implements ExecutiveHistoryAccessRepository {
  readonly backend = "filesystem" as const;

  constructor(
    private readonly root = path.join(process.cwd(), ".discovery-runtime/executive-history-access"),
  ) {}

  private target(organizationId: string): string {
    return path.join(this.root, `${exactId(organizationId)}.json`);
  }

  private lockTarget(organizationId: string): string {
    return path.join(this.root, `${exactId(organizationId)}.lock`);
  }

  async read(organizationId: string): Promise<ExecutiveHistoryAccessSnapshot> {
    try {
      const raw = new Uint8Array(await readFile(this.target(organizationId)));
      return { store: parse(organizationId, raw), revision: executiveHistoryDigest(raw) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { store: empty(organizationId), revision: null };
      }
      throw error;
    }
  }

  private async acquire(organizationId: string) {
    await mkdir(this.root, { recursive: true });
    const target = this.lockTarget(organizationId);
    for (let attempt = 0; attempt < 500; attempt += 1) {
      try {
        const handle = await open(target, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
        await handle.writeFile(`${process.pid}\n`);
        await handle.sync();
        return { handle, target };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        await pause(10);
      }
    }
    throw new ExecutiveHistoryAccessConflictError("Executive History access store is busy.");
  }

  async replace(
    organizationId: string,
    store: ExecutiveHistoryAccessStoreV1,
    expectedRevision: string | null,
  ): Promise<ExecutiveHistoryAccessSnapshot> {
    if (store.organizationId !== organizationId) {
      throw new Error("Executive History access store organization mismatch.");
    }
    const lock = await this.acquire(organizationId);
    try {
      const current = await this.read(organizationId);
      if (current.revision !== expectedRevision) {
        throw new ExecutiveHistoryAccessConflictError("Executive History access store revision changed.");
      }
      const target = this.target(organizationId);
      try {
        const status = await lstat(target);
        if (status.isSymbolicLink() || !status.isFile()) {
          throw new Error("Executive History access store target is unsafe.");
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      const raw = bytes(store);
      const temporary = `${target}.${executiveHistoryDigest(raw)}.${process.pid}.tmp`;
      try {
        await unlink(temporary);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      const handle = await open(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
      try {
        await handle.writeFile(raw);
        await handle.sync();
      } finally {
        await handle.close();
      }
      await rename(temporary, target);
      return this.read(organizationId);
    } finally {
      await lock.handle.close();
      await unlink(lock.target).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
  }
}

export class VercelBlobExecutiveHistoryAccessRepository implements ExecutiveHistoryAccessRepository {
  readonly backend = "vercel-blob" as const;

  constructor(
    private readonly prefix =
      process.env.DISCOVERY_EXECUTIVE_HISTORY_ACCESS_BLOB_PREFIX ??
      "discovery/executive-history-access/v1",
  ) {}

  private key(organizationId: string): string {
    return `${this.prefix.replace(/^\/+|\/+$/g, "")}/organizations/${exactId(organizationId)}/access.json`;
  }

  async read(organizationId: string): Promise<ExecutiveHistoryAccessSnapshot> {
    const result = await get(this.key(organizationId), { access: "private", useCache: false });
    if (!result) return { store: empty(organizationId), revision: null };
    if (result.statusCode !== 200) throw new Error("Unexpected Executive History access Blob response.");
    const raw = new Uint8Array(await new Response(result.stream).arrayBuffer());
    return { store: parse(organizationId, raw), revision: result.blob.etag };
  }

  async replace(
    organizationId: string,
    store: ExecutiveHistoryAccessStoreV1,
    expectedRevision: string | null,
  ): Promise<ExecutiveHistoryAccessSnapshot> {
    const raw = bytes(store);
    try {
      const result = await put(this.key(organizationId), Buffer.from(raw), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: expectedRevision !== null,
        ...(expectedRevision ? { ifMatch: expectedRevision } : {}),
        cacheControlMaxAge: 0,
        contentType: "application/json",
      });
      return { store: parse(organizationId, raw), revision: result.etag };
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError || error instanceof BlobNotFoundError) {
        throw new ExecutiveHistoryAccessConflictError("Executive History access store revision changed.");
      }
      throw error;
    }
  }
}

export function createExecutiveHistoryAccessRepository(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ExecutiveHistoryAccessRepository {
  const backend =
    environment.DISCOVERY_EXECUTIVE_HISTORY_ACCESS_STORAGE_BACKEND ??
    (environment.VERCEL === "1" ? "vercel-blob" : "filesystem");
  if (backend !== "filesystem" && backend !== "vercel-blob") {
    throw new Error("Executive History access storage backend is invalid.");
  }
  if (environment.VERCEL === "1" && backend !== "vercel-blob") {
    throw new Error("Vercel requires Executive History access Blob persistence.");
  }
  return backend === "vercel-blob"
    ? new VercelBlobExecutiveHistoryAccessRepository()
    : new FilesystemExecutiveHistoryAccessRepository(environment.DISCOVERY_EXECUTIVE_HISTORY_ACCESS_ROOT);
}
