import { createHash } from "node:crypto";
import {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  unlink,
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

type RuntimeFilesystemClaimV1 = {
  contractVersion: "1";
  organizationId: string;
  operation: "create" | "replace" | "restore";
  expectedRevision: string | null;
  requestFingerprint: string;
  operationBindingDigest: string;
  intendedDigest: string;
  candidate: string;
  integrityDigest: string;
};
type RuntimeFilesystemAcknowledgementV1 = {
  contractVersion: "1";
  organizationId: string;
  expectedRevision: string | null;
  requestFingerprint: string;
  operationBindingDigest: string;
  intendedDigest: string;
  resultingRevision: string;
  disposition: "already-committed" | "cas-conflict";
  integrityDigest: string;
};

type RuntimeFilesystemIntentV1 = {
  contractVersion: "1";
  organizationId: string;
  ownerPid: number;
  ownerToken: string;
  operation: "create" | "replace" | "restore";
  expectedRevision: string | null;
  requestFingerprint: string;
  intendedDigest: string;
  transient: string;
  integrityDigest: string;
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
export class RuntimeStorageIncompatibleReplayError extends Error {
  readonly code = "runtime_storage_incompatible_replay" as const;
}
export class RuntimeStorageIntegrityError extends Error {}
export class RuntimeStorageRecoveryBlockedError extends Error {
  readonly code = "recovery_blocked" as const;
}

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
    parsed = JSON.parse(
      Buffer.from(bytes).toString("utf8"),
    ) as OrganizationRuntime;
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
  implements OrganizationRuntimeRepository
{
  readonly backend = "filesystem" as const;

  constructor(
    private readonly directory = getRuntimeOrganizationsDirectory(),
    private readonly faultInjector?: Readonly<{
      afterBackupLink?(): void;
      afterRestorePublication?(): void;
      afterInitialCanonicalParentValidationBeforeCandidateWrite?():
        | void
        | Promise<void>;
      afterValidatedClaimBeforeCanonicalParentRevalidation?():
        | void
        | Promise<void>;
    }>,
  ) {}

  private activePath(organizationId: string): string {
    return path.join(
      this.directory,
      `${exactId(organizationId, "Organization id")}.json`,
    );
  }

  private backupPath(organizationId: string, backupId: string): string {
    return path.join(
      this.directory,
      ".backups",
      exactId(organizationId, "Organization id"),
      `${exactId(backupId, "Backup id")}.json`,
    );
  }

  private claimPath(
    organizationId: string,
    expectedRevision: string | null,
  ): string {
    return `${this.activePath(organizationId)}.${expectedRevision ?? "absent"}.claim`;
  }

  private acknowledgementPath(
    organizationId: string,
    requestFingerprint: string,
  ): string {
    return path.join(
      this.directory,
      ".operations",
      exactId(organizationId, "Organization id"),
      `${requestFingerprint}.json`,
    );
  }

  private async readAcknowledgement(
    organizationId: string,
    requestFingerprint: string,
  ): Promise<RuntimeFilesystemAcknowledgementV1 | null> {
    const target = this.acknowledgementPath(organizationId, requestFingerprint);
    try {
      const status = await lstat(target);
      if (
        !status.isFile() ||
        status.isSymbolicLink() ||
        (status.mode & 0o777) !== 0o600
      )
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      const value = JSON.parse(await readFile(target, "utf8")) as Record<
        string,
        unknown
      >;
      if (
        Object.keys(value).sort().join(",") !==
          "contractVersion,disposition,expectedRevision,integrityDigest,intendedDigest,operationBindingDigest,organizationId,requestFingerprint,resultingRevision" ||
        value.contractVersion !== "1" ||
        value.organizationId !== organizationId ||
        value.requestFingerprint !== requestFingerprint ||
        !["already-committed", "cas-conflict"].includes(
          String(value.disposition),
        ) ||
        typeof value.operationBindingDigest !== "string" ||
        !/^[a-f0-9]{64}$/.test(value.operationBindingDigest) ||
        typeof value.intendedDigest !== "string" ||
        !/^[a-f0-9]{64}$/.test(value.intendedDigest) ||
        typeof value.resultingRevision !== "string" ||
        !/^[a-f0-9]{64}$/.test(value.resultingRevision) ||
        !(
          value.expectedRevision === null ||
          (typeof value.expectedRevision === "string" &&
            /^[a-f0-9]{64}$/.test(value.expectedRevision))
        )
      )
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      const { integrityDigest, ...unsigned } = value;
      if (integrityDigest !== digest(Buffer.from(JSON.stringify(unsigned))))
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      return value as RuntimeFilesystemAcknowledgementV1;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  private async acknowledgeAndRetire(
    claimTarget: string,
    claim: RuntimeFilesystemClaimV1,
    result: StoredOrganizationRuntime,
  ): Promise<void> {
    const acknowledgement = this.acknowledgementPath(
      claim.organizationId,
      claim.requestFingerprint,
    );
    await mkdir(path.dirname(acknowledgement), {
      recursive: true,
      mode: 0o700,
    });
    const unsigned = {
        contractVersion: "1" as const,
        organizationId: claim.organizationId,
        expectedRevision: claim.expectedRevision,
        requestFingerprint: claim.requestFingerprint,
        operationBindingDigest: claim.operationBindingDigest,
        intendedDigest: claim.intendedDigest,
        resultingRevision: result.revision,
        disposition: "already-committed" as const,
      },
      complete = {
        ...unsigned,
        integrityDigest: digest(Buffer.from(JSON.stringify(unsigned))),
      },
      representation = Buffer.from(JSON.stringify(complete));
    const acknowledgementCandidate = `${acknowledgement}.${complete.integrityDigest}.candidate`,
      handle = await open(
        acknowledgementCandidate,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      ).catch(async (error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
        return null;
      });
    if (handle) {
      try {
        await handle.writeFile(representation);
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    try {
      await link(acknowledgementCandidate, acknowledgement);
    } catch (error) {
      if (
        !(["EEXIST", "ENOENT"] as string[]).includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      )
        throw error;
    }
    const existing = await this.readAcknowledgement(
      claim.organizationId,
      claim.requestFingerprint,
    );
    if (
      !existing ||
      existing.operationBindingDigest !== claim.operationBindingDigest ||
      existing.intendedDigest !== claim.intendedDigest ||
      existing.resultingRevision !== result.revision
    )
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    const operationDirectory = await open(
      path.dirname(acknowledgement),
      constants.O_RDONLY,
    );
    try {
      await operationDirectory.sync();
    } finally {
      await operationDirectory.close();
    }
    for (const target of [
      path.join(this.directory, claim.candidate),
      path.join(this.directory, `${claim.candidate}.intent`),
      claimTarget,
      acknowledgementCandidate,
    ])
      await unlink(target).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    const directory = await open(this.directory, constants.O_RDONLY);
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  }

  private async recordConflictAndRetire(
    claimTarget: string,
    claim: RuntimeFilesystemClaimV1,
    resultingRevision: string,
  ): Promise<void> {
    const acknowledgement = this.acknowledgementPath(
      claim.organizationId,
      claim.requestFingerprint,
    );
    await mkdir(path.dirname(acknowledgement), {
      recursive: true,
      mode: 0o700,
    });
    const unsigned = {
        contractVersion: "1" as const,
        organizationId: claim.organizationId,
        expectedRevision: claim.expectedRevision,
        requestFingerprint: claim.requestFingerprint,
        operationBindingDigest: claim.operationBindingDigest,
        intendedDigest: claim.intendedDigest,
        resultingRevision,
        disposition: "cas-conflict" as const,
      },
      complete = {
        ...unsigned,
        integrityDigest: digest(Buffer.from(JSON.stringify(unsigned))),
      },
      candidate = `${acknowledgement}.${complete.integrityDigest}.candidate`,
      handle = await open(
        candidate,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      ).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
        return null;
      });
    if (handle) {
      try {
        await handle.writeFile(JSON.stringify(complete));
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    try {
      await link(candidate, acknowledgement);
    } catch (error) {
      if (
        !(["EEXIST", "ENOENT"] as string[]).includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      )
        throw error;
    }
    const terminal = await this.readAcknowledgement(
      claim.organizationId,
      claim.requestFingerprint,
    );
    if (
      !terminal ||
      terminal.disposition !== "cas-conflict" ||
      terminal.operationBindingDigest !== claim.operationBindingDigest ||
      terminal.resultingRevision !== resultingRevision ||
      terminal.intendedDigest !== claim.intendedDigest
    )
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    const operationDirectory = await open(
      path.dirname(acknowledgement),
      constants.O_RDONLY,
    );
    try {
      await operationDirectory.sync();
    } finally {
      await operationDirectory.close();
    }
    for (const residue of [
      path.join(this.directory, claim.candidate),
      path.join(this.directory, `${claim.candidate}.intent`),
      claimTarget,
      candidate,
    ])
      await unlink(residue).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    const directory = await open(this.directory, constants.O_RDONLY);
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  }

  private async prepareDirectory(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await chmod(this.directory, 0o700);
    const status = await lstat(this.directory);
    if (!status.isDirectory() || status.isSymbolicLink()) {
      throw new RuntimeStorageIntegrityError("Runtime storage root is unsafe");
    }
    const resolved = await realpath(this.directory);
    const resolvedParent = await realpath(path.dirname(this.directory));
    if (resolved !== path.join(resolvedParent, path.basename(this.directory))) {
      throw new RuntimeStorageIntegrityError("Runtime storage root is aliased");
    }
  }

  private async readClaim(
    target: string,
    organizationId: string,
  ): Promise<RuntimeFilesystemClaimV1> {
    const status = await lstat(target);
    if (
      !status.isFile() ||
      status.isSymbolicLink() ||
      (status.mode & 0o777) !== 0o600
    )
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    let input: Record<string, unknown>;
    try {
      input = JSON.parse(await readFile(target, "utf8")) as Record<
        string,
        unknown
      >;
    } catch {
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    }
    if (
      Object.keys(input).sort().join(",") !==
      "candidate,contractVersion,expectedRevision,integrityDigest,intendedDigest,operation,operationBindingDigest,organizationId,requestFingerprint"
    )
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    if (
      input.contractVersion !== "1" ||
      input.organizationId !== organizationId ||
      !["create", "replace", "restore"].includes(String(input.operation)) ||
      !(
        input.expectedRevision === null ||
        (typeof input.expectedRevision === "string" &&
          /^[a-f0-9]{64}$/.test(input.expectedRevision))
      ) ||
      typeof input.requestFingerprint !== "string" ||
      !/^[a-f0-9]{64}$/.test(input.requestFingerprint) ||
      typeof input.operationBindingDigest !== "string" ||
      !/^[a-f0-9]{64}$/.test(input.operationBindingDigest) ||
      typeof input.intendedDigest !== "string" ||
      !/^[a-f0-9]{64}$/.test(input.intendedDigest) ||
      typeof input.candidate !== "string" ||
      path.basename(input.candidate) !== input.candidate ||
      typeof input.integrityDigest !== "string"
    )
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    const { integrityDigest, ...unsigned } = input;
    if (integrityDigest !== digest(Buffer.from(JSON.stringify(unsigned))))
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    return input as RuntimeFilesystemClaimV1;
  }

  private async candidateBytes(
    claim: RuntimeFilesystemClaimV1,
  ): Promise<Uint8Array> {
    const target = path.join(this.directory, claim.candidate);
    const status = await lstat(target);
    if (
      !status.isFile() ||
      status.isSymbolicLink() ||
      (status.mode & 0o777) !== 0o600
    )
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    const bytes = new Uint8Array(await readFile(target));
    if (digest(bytes) !== claim.intendedDigest)
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    stored(claim.organizationId, bytes);
    return bytes;
  }

  private async finalizeClaim(
    claimTarget: string,
    claim: RuntimeFilesystemClaimV1,
  ): Promise<StoredOrganizationRuntime> {
    const intended = await this.candidateBytes(claim);
    await this.faultInjector
      ?.afterValidatedClaimBeforeCanonicalParentRevalidation?.();
    const current = await this.read(claim.organizationId);
    if (current?.revision === claim.intendedDigest) {
      await this.acknowledgeAndRetire(claimTarget, claim, current);
      return current;
    }
    if (
      claim.operation === "create"
        ? current !== null
        : current?.revision !== claim.expectedRevision
    ) {
      if (!current)
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      await this.recordConflictAndRetire(claimTarget, claim, current.revision);
      throw new RuntimeStorageConflictError("Runtime revision changed");
    }
    const publication = `${this.activePath(claim.organizationId)}.${claim.requestFingerprint}.publication`;
    const handle = await open(
      publication,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      0o600,
    ).catch(async (error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
      const status = await lstat(publication);
      if (
        !status.isFile() ||
        status.isSymbolicLink() ||
        (status.mode & 0o777) !== 0o600
      )
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      return null;
    });
    if (handle) {
      try {
        await handle.writeFile(intended);
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    let publicationBytes: Uint8Array;
    try {
      publicationBytes = new Uint8Array(await readFile(publication));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const completed = await this.read(claim.organizationId);
      if (completed?.revision !== claim.intendedDigest)
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      await this.acknowledgeAndRetire(claimTarget, claim, completed);
      return completed;
    }
    if (digest(publicationBytes) !== claim.intendedDigest)
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    const rechecked = await this.read(claim.organizationId);
    if (rechecked?.revision === claim.intendedDigest) {
      await this.acknowledgeAndRetire(claimTarget, claim, rechecked);
      return rechecked;
    }
    if (
      claim.operation === "create"
        ? rechecked !== null
        : rechecked?.revision !== claim.expectedRevision
    ) {
      if (!rechecked)
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      await this.recordConflictAndRetire(
        claimTarget,
        claim,
        rechecked.revision,
      );
      throw new RuntimeStorageConflictError("Runtime revision changed");
    }
    await rename(publication, this.activePath(claim.organizationId)).catch(
      async (error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
        const completed = await this.read(claim.organizationId);
        if (completed?.revision !== claim.intendedDigest)
          throw new RuntimeStorageRecoveryBlockedError(
            "Runtime recovery is blocked",
          );
      },
    );
    const directory = await open(this.directory, constants.O_RDONLY);
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
    const result = await this.read(claim.organizationId);
    if (!result || result.revision !== claim.intendedDigest)
      throw new RuntimeStorageIntegrityError(
        "Runtime publication integrity failed",
      );
    if (claim.operation === "restore")
      this.faultInjector?.afterRestorePublication?.();
    await this.acknowledgeAndRetire(claimTarget, claim, result);
    return result;
  }

  private async publish(
    organizationId: string,
    bytes: Uint8Array,
    expectedRevision: string | null,
    metadata: RuntimeStorageOperationMetadata,
    operation: "create" | "replace" | "restore",
    operationBindingDigest: string,
  ): Promise<StoredOrganizationRuntime> {
    const value = stored(organizationId, bytes);
    await this.prepareDirectory();
    const requestFingerprint = digest(
      Buffer.from(
        `${operation}:${metadata.requestId}:${expectedRevision ?? "absent"}`,
      ),
    );
    const acknowledgement = await this.readAcknowledgement(
      organizationId,
      requestFingerprint,
    );
    if (acknowledgement) {
      const current = await this.read(organizationId);
      if (
        acknowledgement.operationBindingDigest !== operationBindingDigest ||
        acknowledgement.intendedDigest !== value.revision ||
        acknowledgement.expectedRevision !== expectedRevision
      )
        throw new RuntimeStorageIncompatibleReplayError(
          "Runtime storage incompatible replay",
        );
      if (acknowledgement.disposition === "cas-conflict")
        throw new RuntimeStorageConflictError("Runtime revision changed");
      if (current?.revision === acknowledgement.resultingRevision)
        return current;
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    }
    const candidate = `${path.basename(this.activePath(organizationId))}.${requestFingerprint}.${value.revision}.candidate`;
    const claimTarget = this.claimPath(organizationId, expectedRevision);
    const existingClaim = await this.readClaim(
      claimTarget,
      organizationId,
    ).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (
      existingClaim &&
      existingClaim.operation === operation &&
      existingClaim.expectedRevision === expectedRevision &&
      existingClaim.requestFingerprint === requestFingerprint &&
      existingClaim.operationBindingDigest === operationBindingDigest &&
      existingClaim.intendedDigest === value.revision &&
      existingClaim.candidate === candidate
    )
      return this.finalizeClaim(claimTarget, existingClaim);
    const currentBeforeClaim = await this.read(organizationId);
    if (
      operation === "create"
        ? currentBeforeClaim !== null
        : currentBeforeClaim?.revision !== expectedRevision
    )
      throw new RuntimeStorageConflictError("Runtime revision changed");
    await this.faultInjector
      ?.afterInitialCanonicalParentValidationBeforeCandidateWrite?.();
    const candidateTarget = path.join(this.directory, candidate);
    const candidateHandle = await open(
      candidateTarget,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      0o600,
    ).catch(async (error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
      return null;
    });
    if (candidateHandle) {
      try {
        await candidateHandle.writeFile(bytes);
        await candidateHandle.sync();
      } finally {
        await candidateHandle.close();
      }
    }
    const unsigned = {
      contractVersion: "1" as const,
      organizationId,
      operation,
      expectedRevision,
      requestFingerprint,
      operationBindingDigest,
      intendedDigest: value.revision,
      candidate,
    };
    const claim = {
      ...unsigned,
      integrityDigest: digest(Buffer.from(JSON.stringify(unsigned))),
    };
    const intentTarget = `${candidateTarget}.intent`;
    const intentHandle = await open(
      intentTarget,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      0o600,
    ).catch(async (error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
      return null;
    });
    if (intentHandle) {
      try {
        await intentHandle.writeFile(JSON.stringify(claim));
        await intentHandle.sync();
      } finally {
        await intentHandle.close();
      }
    }
    try {
      await link(intentTarget, claimTarget);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    let winner: RuntimeFilesystemClaimV1;
    try {
      winner = await this.readClaim(claimTarget, organizationId);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const completed = await this.readAcknowledgement(
          organizationId,
          requestFingerprint,
        ),
        current = await this.read(organizationId);
      if (
        completed &&
        (completed.operationBindingDigest !== operationBindingDigest ||
          completed.intendedDigest !== value.revision ||
          completed.expectedRevision !== expectedRevision)
      )
        throw new RuntimeStorageIncompatibleReplayError(
          "Runtime storage incompatible replay",
        );
      if (completed?.disposition === "cas-conflict")
        throw new RuntimeStorageConflictError("Runtime revision changed");
      if (completed && current?.revision === value.revision) return current;
      const own = await this.readClaim(intentTarget, organizationId);
      if (current && current.revision !== own.expectedRevision) {
        await this.recordConflictAndRetire(claimTarget, own, current.revision);
        throw new RuntimeStorageConflictError("Runtime revision changed");
      }
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    }
    const result = await this.finalizeClaim(claimTarget, winner);
    if (
      winner.requestFingerprint !== requestFingerprint ||
      winner.intendedDigest !== value.revision
    ) {
      if (winner.requestFingerprint === requestFingerprint) {
        for (const residue of [candidateTarget, intentTarget])
          await unlink(residue).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== "ENOENT") throw error;
          });
        const directory = await open(this.directory, constants.O_RDONLY);
        try {
          await directory.sync();
        } finally {
          await directory.close();
        }
        throw new RuntimeStorageIncompatibleReplayError(
          "Runtime storage incompatible replay",
        );
      }
      const own = await this.readClaim(intentTarget, organizationId);
      await this.recordConflictAndRetire(intentTarget, own, result.revision);
      throw new RuntimeStorageConflictError("Runtime revision changed");
    }
    return result;
  }

  async read(
    organizationId: string,
  ): Promise<StoredOrganizationRuntime | null> {
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
    return this.publish(
      organizationId,
      bytes,
      null,
      metadata,
      "create",
      digest(Buffer.from("runtime-create-v1")),
    );
  }

  async replace(
    organizationId: string,
    bytes: Uint8Array,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    return this.publish(
      organizationId,
      bytes,
      expectedRevision,
      metadata,
      "replace",
      digest(Buffer.from("runtime-replace-v1")),
    );
  }

  async backup(
    organizationId: string,
    backupId: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const requestFingerprint = digest(
        Buffer.from(`backup:${metadata.requestId}:${backupId}`),
      ),
      operationBindingDigest = digest(
        Buffer.from(`runtime-backup-v1:${backupId}`),
      ),
      prior = await this.readAcknowledgement(
        organizationId,
        requestFingerprint,
      ),
      destination = this.backupPath(organizationId, backupId),
      directoryPath = path.dirname(destination);
    if (prior) {
      const status = await lstat(destination);
      if (
        !status.isFile() ||
        status.isSymbolicLink() ||
        (status.mode & 0o777) !== 0o600
      )
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      const replay = stored(
        organizationId,
        new Uint8Array(await readFile(destination)),
      );
      if (
        prior.disposition !== "already-committed" ||
        prior.operationBindingDigest !== operationBindingDigest ||
        prior.intendedDigest !== replay.revision ||
        prior.resultingRevision !== replay.revision
      )
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      return replay;
    }
    const current = await this.read(organizationId);
    if (!current) throw new RuntimeStorageIntegrityError("Runtime is missing");
    await mkdir(directoryPath, { recursive: true, mode: 0o700 });
    await chmod(directoryPath, 0o700);
    const directoryStatus = await lstat(directoryPath);
    if (!directoryStatus.isDirectory() || directoryStatus.isSymbolicLink())
      throw new RuntimeStorageIntegrityError(
        "Runtime backup storage is unsafe",
      );
    const candidate = `${destination}.${requestFingerprint}.candidate`,
      handle = await open(
        candidate,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      ).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
        return null;
      });
    if (handle) {
      try {
        await handle.writeFile(current.bytes);
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    const candidateStatus = await lstat(candidate);
    if (
      !candidateStatus.isFile() ||
      candidateStatus.isSymbolicLink() ||
      (candidateStatus.mode & 0o777) !== 0o600 ||
      digest(new Uint8Array(await readFile(candidate))) !== current.revision
    )
      throw new RuntimeStorageIntegrityError(
        "Runtime backup candidate integrity failed",
      );
    try {
      await link(candidate, destination);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const candidateIdentity = await lstat(candidate),
        destinationIdentity = await lstat(destination);
      if (
        !destinationIdentity.isFile() ||
        destinationIdentity.isSymbolicLink() ||
        (destinationIdentity.mode & 0o777) !== 0o600 ||
        candidateIdentity.dev !== destinationIdentity.dev ||
        candidateIdentity.ino !== destinationIdentity.ino
      ) {
        await unlink(candidate).catch((cleanupError: NodeJS.ErrnoException) => {
          if (cleanupError.code !== "ENOENT") throw cleanupError;
        });
        const conflictDirectory = await open(directoryPath, constants.O_RDONLY);
        try {
          await conflictDirectory.sync();
        } finally {
          await conflictDirectory.close();
        }
        throw new RuntimeStorageConflictError("Backup already exists");
      }
    }
    const directory = await open(directoryPath, constants.O_RDONLY);
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
    this.faultInjector?.afterBackupLink?.();
    const acknowledgement = this.acknowledgementPath(
      organizationId,
      requestFingerprint,
    );
    await mkdir(path.dirname(acknowledgement), {
      recursive: true,
      mode: 0o700,
    });
    const unsigned = {
        contractVersion: "1" as const,
        organizationId,
        expectedRevision: current.revision,
        requestFingerprint,
        operationBindingDigest,
        intendedDigest: current.revision,
        resultingRevision: current.revision,
        disposition: "already-committed" as const,
      },
      complete = {
        ...unsigned,
        integrityDigest: digest(Buffer.from(JSON.stringify(unsigned))),
      },
      acknowledgementCandidate = `${acknowledgement}.${complete.integrityDigest}.candidate`,
      acknowledgementHandle = await open(
        acknowledgementCandidate,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      ).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
        return null;
      });
    if (acknowledgementHandle) {
      try {
        await acknowledgementHandle.writeFile(JSON.stringify(complete));
        await acknowledgementHandle.sync();
      } finally {
        await acknowledgementHandle.close();
      }
    }
    try {
      await link(acknowledgementCandidate, acknowledgement);
    } catch (error) {
      if (
        !["EEXIST", "ENOENT"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      )
        throw error;
    }
    const recorded = await this.readAcknowledgement(
      organizationId,
      requestFingerprint,
    );
    if (
      !recorded ||
      recorded.operationBindingDigest !== operationBindingDigest ||
      recorded.intendedDigest !== current.revision ||
      recorded.resultingRevision !== current.revision
    )
      throw new RuntimeStorageRecoveryBlockedError(
        "Runtime recovery is blocked",
      );
    const operationDirectory = await open(
      path.dirname(acknowledgement),
      constants.O_RDONLY,
    );
    try {
      await operationDirectory.sync();
    } finally {
      await operationDirectory.close();
    }
    for (const residue of [candidate, acknowledgementCandidate])
      await unlink(residue).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    const retiredDirectory = await open(directoryPath, constants.O_RDONLY);
    try {
      await retiredDirectory.sync();
    } finally {
      await retiredDirectory.close();
    }
    return current;
  }

  async restore(
    organizationId: string,
    backupId: string,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const backup = this.backupPath(organizationId, backupId),
      status = await lstat(backup).catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT")
          throw new RuntimeStorageIntegrityError("Runtime backup is missing");
        throw error;
      });
    if (
      !status.isFile() ||
      status.isSymbolicLink() ||
      (status.mode & 0o777) !== 0o600
    )
      throw new RuntimeStorageIntegrityError("Runtime backup integrity failed");
    const bytes = new Uint8Array(await readFile(backup));
    stored(organizationId, bytes);
    const intendedDigest = digest(bytes),
      operationBindingDigest = digest(
        Buffer.from(`runtime-restore-backup-v1:${backupId}`),
      ),
      current = await this.read(organizationId);
    if (
      current?.revision === intendedDigest &&
      current.revision !== expectedRevision
    ) {
      const requestFingerprint = digest(
          Buffer.from(`restore:${metadata.requestId}:${expectedRevision}`),
        ),
        acknowledgement = await this.readAcknowledgement(
          organizationId,
          requestFingerprint,
        );
      if (acknowledgement)
        return this.publish(
          organizationId,
          bytes,
          expectedRevision,
          metadata,
          "restore",
          operationBindingDigest,
        );
      const claimTarget = this.claimPath(organizationId, expectedRevision),
        claim = await this.readClaim(claimTarget, organizationId).catch(
          (error: NodeJS.ErrnoException) => {
            if (error.code === "ENOENT") return null;
            throw error;
          },
        );
      if (
        !claim ||
        claim.operation !== "restore" ||
        claim.expectedRevision !== expectedRevision ||
        claim.requestFingerprint !== requestFingerprint ||
        claim.operationBindingDigest !== operationBindingDigest ||
        claim.intendedDigest !== intendedDigest
      )
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      return this.finalizeClaim(claimTarget, claim);
    }
    return this.publish(
      organizationId,
      bytes,
      expectedRevision,
      metadata,
      "restore",
      operationBindingDigest,
    );
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
  implements OrganizationRuntimeRepository
{
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
    return organizationRuntimeBackupObjectKey(
      organizationId,
      backupId,
      this.prefix,
    );
  }

  async read(
    organizationId: string,
  ): Promise<StoredOrganizationRuntime | null> {
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
    await this.client.put(
      this.backupKey(organizationId, backupId),
      current.bytes,
      {
        allowOverwrite: false,
      },
    );
    return current;
  }

  async restore(
    organizationId: string,
    backupId: string,
    expectedRevision: string,
    metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    const backup = await this.client.get(
      this.backupKey(organizationId, backupId),
    );
    if (!backup)
      throw new RuntimeStorageIntegrityError("Runtime backup is missing");
    const value = stored(organizationId, backup.bytes);
    const result = await this.client.put(
      this.key(organizationId),
      backup.bytes,
      {
        allowOverwrite: true,
        ifMatch: expectedRevision,
      },
    );
    return { ...value, revision: result.etag };
  }
}

export function configuredRuntimeStorageBackend(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): RuntimeStorageBackend {
  const configured = environment.DISCOVERY_RUNTIME_STORAGE_BACKEND;
  if (configured === "filesystem" || configured === "vercel-blob") {
    if (environment.VERCEL === "1" && configured !== "vercel-blob") {
      throw new Error(
        "Vercel requires DISCOVERY_RUNTIME_STORAGE_BACKEND=vercel-blob",
      );
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
