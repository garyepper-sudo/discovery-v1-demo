import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type {
  GoogleDriveConnectorMetadata,
  GoogleDriveCredential,
} from "./contracts";
import {
  googleDriveExternalSourceIdentity,
  googleDrivePassageIdentity,
  googleDriveSourceVersionIdentity,
  normalizeExtractedContent,
} from "./identity";

export interface GoogleDriveCredentialRepository {
  read(sourceId: string): Promise<GoogleDriveCredential | null>;
  write(sourceId: string, credential: GoogleDriveCredential): Promise<void>;
  delete(sourceId: string): Promise<boolean>;
}

export interface GoogleDriveMetadataRepository {
  read(): Promise<GoogleDriveConnectorMetadata>;
  replace(metadata: GoogleDriveConnectorMetadata): Promise<void>;
}

export interface GoogleDriveAuthorizationStateRepository {
  create(record: GoogleDriveAuthorizationStateRecord): Promise<void>;
  inspect(stateDigest: string): Promise<GoogleDriveAuthorizationStateRecord | null>;
  consume(stateDigest: string, consumedAt: string): Promise<GoogleDriveAuthorizationStateConsumeResult>;
}

export type GoogleDriveAuthorizationStateRecord = {
  stateDigest: string;
  userId: string;
  organizationId: string;
  issuedAt: string;
  expiresAt: string;
  consumedAt: string | null;
};

export type GoogleDriveAuthorizationStateConsumeResult =
  | "consumed"
  | "missing"
  | "expired"
  | "already-consumed";

type EncryptedRecord = { iv: string; tag: string; ciphertext: string };

export class EncryptedFileGoogleDriveCredentialRepository
implements GoogleDriveCredentialRepository {
  private readonly key: Buffer;

  constructor(
    private readonly filePath: string,
    encryptionKey: string,
  ) {
    if (Buffer.from(encryptionKey, "base64").length !== 32) {
      throw new Error("Google Drive credential encryption key must be 32 base64 bytes.");
    }
    this.key = Buffer.from(encryptionKey, "base64");
  }

  private async records(): Promise<Record<string, EncryptedRecord>> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as Record<string, EncryptedRecord>;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw error;
    }
  }

  private async persist(records: Record<string, EncryptedRecord>): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(records), { mode: 0o600 });
    await rename(temporary, this.filePath);
  }

  async read(sourceId: string): Promise<GoogleDriveCredential | null> {
    const record = (await this.records())[sourceId];
    if (!record) return null;
    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(record.iv, "base64"));
    decipher.setAuthTag(Buffer.from(record.tag, "base64"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(record.ciphertext, "base64")),
      decipher.final(),
    ]);
    return JSON.parse(plaintext.toString("utf8")) as GoogleDriveCredential;
  }

  async write(sourceId: string, credential: GoogleDriveCredential): Promise<void> {
    const records = await this.records();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(credential), "utf8"),
      cipher.final(),
    ]);
    records[sourceId] = {
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      ciphertext: ciphertext.toString("base64"),
    };
    await this.persist(records);
  }

  async delete(sourceId: string): Promise<boolean> {
    const records = await this.records();
    if (!records[sourceId]) return false;
    delete records[sourceId];
    await this.persist(records);
    return true;
  }
}

export class FileGoogleDriveMetadataRepository implements GoogleDriveMetadataRepository {
  constructor(private readonly filePath: string) {}

  async read(): Promise<GoogleDriveConnectorMetadata> {
    try {
      const metadata = JSON.parse(
        await readFile(this.filePath, "utf8"),
      ) as GoogleDriveConnectorMetadata;
      const folderById = new Map(metadata.folders.map((folder) => [folder.id, folder]));
      const fileById = new Map(metadata.files.map((file) => [file.googleFileId, file]));
      const passages = metadata.passages.map((passage) => {
        const file = fileById.get(passage.googleFileId);
        const folder = file ? folderById.get(file.folderId) : undefined;
        if (!file || !folder) return passage;
        const sourceIdentity = googleDriveExternalSourceIdentity({
          organizationId: folder.organizationId,
          connectedSourceId: folder.sourceId,
          googleFileId: file.googleFileId,
        });
        const content = normalizeExtractedContent(passage.content);
        const contentDigest = sha256(content);
        return {
          ...passage,
          content,
          contentDigest,
          ...(contentDigest !== passage.contentDigest
            ? { legacyContentDigest: passage.contentDigest }
            : {}),
          id: googleDrivePassageIdentity({
            sourceIdentity,
            location: passage.location,
            contentDigest,
          }),
        };
      });
      const passagesByFile = new Map(metadata.files.map((file) => [
        file.googleFileId,
        passages.filter((passage) => passage.googleFileId === file.googleFileId),
      ]));
      const files = metadata.files.map((file) => {
        const folder = folderById.get(file.folderId);
        const filePassages = passagesByFile.get(file.googleFileId) ?? [];
        return {
          ...file,
          sourceIdentity: file.sourceIdentity ?? (folder
            ? googleDriveExternalSourceIdentity({
                organizationId: folder.organizationId,
                connectedSourceId: folder.sourceId,
                googleFileId: file.googleFileId,
              })
            : `google-drive-source:legacy:${file.googleFileId}`),
          ...(file.status === "accessible"
            ? {
                extractionDigest: sha256(
                  filePassages.map((passage) => passage.contentDigest).join(":"),
                ),
              }
            : {}),
        };
      });
      const sourceVersions = metadata.sourceVersions ?? files.map((file) => ({
        id: googleDriveSourceVersionIdentity({
          sourceIdentity: file.sourceIdentity,
          revisionId: file.revisionId,
        }),
        sourceIdentity: file.sourceIdentity,
        googleFileId: file.googleFileId,
        revisionId: file.revisionId,
        modifiedAt: file.modifiedAt,
        observedAt: file.extractedAt ?? file.lastSeenAt,
        extractionDigest: file.extractionDigest,
        passageIds: (passagesByFile.get(file.googleFileId) ?? []).map(
          (passage) => passage.id,
        ).sort(),
        contentDisposition: file.status === "accessible" ? "initial" : "unsupported",
      }));
      return { ...metadata, files, passages, sourceVersions };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {
          sources: [],
          folders: [],
          files: [],
          passages: [],
          sourceVersions: [],
        };
      }
      throw error;
    }
  }

  async replace(metadata: GoogleDriveConnectorMetadata): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(metadata, null, 2), { mode: 0o600 });
    await rename(temporary, this.filePath);
  }
}

export class FileGoogleDriveAuthorizationStateRepository
implements GoogleDriveAuthorizationStateRepository {
  constructor(private readonly filePath: string) {}

  private async records(): Promise<Record<string, GoogleDriveAuthorizationStateRecord>> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as
        Record<string, GoogleDriveAuthorizationStateRecord | string>;
      return Object.fromEntries(Object.entries(parsed).map(([digest, record]) => [
        digest,
        typeof record === "string"
          ? {
              stateDigest: digest,
              userId: "",
              organizationId: "",
              issuedAt: record,
              expiresAt: record,
              consumedAt: record,
            }
          : record,
      ]));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw error;
    }
  }

  private async locked<T>(operation: () => Promise<T>): Promise<T> {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 });
    const lockPath = `${this.filePath}.lock`;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        const lock = await open(lockPath, "wx", 0o600);
        await lock.close();
        try {
          return await operation();
        } finally {
          await unlink(lockPath).catch(() => undefined);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    }
    throw new Error("Google Drive OAuth state store unavailable.");
  }

  private async persist(records: Record<string, GoogleDriveAuthorizationStateRecord>): Promise<void> {
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(records), { mode: 0o600 });
    await rename(temporary, this.filePath);
  }

  async create(record: GoogleDriveAuthorizationStateRecord): Promise<void> {
    await this.locked(async () => {
      const records = await this.records();
      for (const [digest, existing] of Object.entries(records)) {
        if (Date.parse(existing.expiresAt) < Date.parse(record.issuedAt)) {
          delete records[digest];
        }
      }
      records[record.stateDigest] = record;
      await this.persist(records);
    });
  }

  async inspect(stateDigest: string): Promise<GoogleDriveAuthorizationStateRecord | null> {
    return (await this.records())[stateDigest] ?? null;
  }

  async consume(
    stateDigest: string,
    consumedAt: string,
  ): Promise<GoogleDriveAuthorizationStateConsumeResult> {
    return this.locked(async () => {
      const records = await this.records();
      const record = records[stateDigest];
      if (!record) return "missing";
      if (record.consumedAt) return "already-consumed";
      if (Date.parse(record.expiresAt) < Date.parse(consumedAt)) return "expired";
      records[stateDigest] = { ...record, consumedAt };
      await this.persist(records);
      return "consumed";
    });
  }
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}
