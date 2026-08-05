import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { GoogleDriveConnectorMetadata } from "../../connectors/google-drive/contracts";
import {
  buildLivingOrganizationReconstructionInputSnapshot,
  digestLivingOrganizationReconstructionInputSnapshot,
  normalizeReconstructionContent,
  serializeLivingOrganizationReconstructionInputSnapshot,
  type LivingOrganizationReconstructionInputSnapshot,
} from "./reconstructionInputSnapshot";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest } from "./manifest";
import {
  northstarScopeTopology,
  northstarSourceScopeRecords,
} from "./sourceScopeBindings";

export const NORTHSTAR_RECONSTRUCTION_INPUT_DIGEST =
  "1c6577ab69236f84d9b5011e40c069e8130a941f6f8865431dfe1d43b37535e2" as const;

const corpusRoot = path.dirname(new URL(import.meta.url).pathname);
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

function buildFromContents(
  contents: ReadonlyMap<string, string>,
): LivingOrganizationReconstructionInputSnapshot {
  return buildLivingOrganizationReconstructionInputSnapshot({
    organizationId: SANDBOX_ORGANIZATION_ID,
    topologyId: northstarScopeTopology.topologyId,
    topologyVersion: northstarScopeTopology.topologyVersion,
    records: sandboxManifest.documents.map((document) => {
      const scoped = northstarSourceScopeRecords.find((item) => item.documentId === document.id);
      const original = contents.get(document.id);
      if (!scoped || original === undefined) throw new Error(`Missing exact Northstar source: ${document.id}.`);
      const content = normalizeReconstructionContent(original);
      return {
        logicalSourceId: scoped.sourceId,
        sourceVersion: scoped.sourceVersion,
        batchId: document.batchId,
        effectiveAt: document.effectiveAt,
        sourceType: document.sourceType,
        sourceRole: document.semanticRole,
        content,
        normalizedContentDigest: sha256(content),
        binding: scoped.binding ? {
          bindingId: scoped.binding.bindingId,
          topologyId: scoped.binding.topologyId,
          assertions: scoped.assertions,
        } : null,
        controlDisposition: scoped.controlDisposition,
        duplicateOf: document.negativeControl === "exact-duplicate"
          ? `sandbox:${document.duplicateOf}:v${document.version}`
          : null,
        formattingEquivalentTo: document.negativeControl === "formatting-only"
          ? `sandbox:${document.duplicateOf}:v${document.version}`
          : null,
      };
    }),
  });
}

export async function deriveNorthstarPackageFromRepository(): Promise<LivingOrganizationReconstructionInputSnapshot> {
  const contents = new Map<string, string>();
  for (const document of sandboxManifest.documents) {
    contents.set(document.id, await readFile(path.join(corpusRoot, document.relativePath), "utf8"));
  }
  return buildFromContents(contents);
}

export function deriveNorthstarPackageFromMetadata(input: {
  metadata: GoogleDriveConnectorMetadata;
  sourceId: string;
  connectedFolderId: string;
  googleFolderId: string;
}): LivingOrganizationReconstructionInputSnapshot {
  const folder = input.metadata.folders.find((item) => item.id === input.connectedFolderId);
  if (!folder || folder.organizationId !== SANDBOX_ORGANIZATION_ID || folder.sourceId !== input.sourceId) {
    throw new Error("Exact Northstar metadata source/folder binding is absent.");
  }
  if (folder.googleFolderId !== input.googleFolderId || folder.includeNested || folder.revokedAt) {
    throw new Error("Northstar metadata folder binding is not the exact active non-recursive binding.");
  }
  const files = input.metadata.files.filter((item) => item.folderId === folder.id && item.status === "accessible");
  if (files.length !== 16) throw new Error("Northstar metadata must contain exactly sixteen accessible files.");
  const contents = new Map<string, string>();
  for (const document of sandboxManifest.documents) {
    const file = files.find((item) => item.name === path.basename(document.relativePath));
    if (!file) throw new Error(`Missing exact Northstar metadata file: ${document.id}.`);
    const passages = input.metadata.passages.filter((item) => item.googleFileId === file.googleFileId);
    if (passages.length !== 1) throw new Error(`Northstar source must have exactly one passage: ${document.id}.`);
    const versions = input.metadata.sourceVersions.filter((item) => item.googleFileId === file.googleFileId);
    if (versions.length !== 1 || versions[0]!.sourceIdentity !== file.sourceIdentity) {
      throw new Error(`Northstar source-version identity mismatch: ${document.id}.`);
    }
    contents.set(document.id, passages[0]!.content);
  }
  if (input.metadata.passages.filter((item) => files.some((file) => file.googleFileId === item.googleFileId)).length !== 16) {
    throw new Error("Northstar metadata must contain exactly sixteen bounded passages.");
  }
  if (input.metadata.sourceVersions.filter((item) => files.some((file) => file.googleFileId === item.googleFileId)).length !== 16) {
    throw new Error("Northstar metadata must contain exactly sixteen source versions.");
  }
  return buildFromContents(contents);
}

export function verifyNorthstarReconstructionPackage(
  snapshot: LivingOrganizationReconstructionInputSnapshot,
): { bytes: Uint8Array; digest: string; recordCount: number; uniqueDigestCount: number } {
  const bytes = serializeLivingOrganizationReconstructionInputSnapshot(snapshot);
  const digest = digestLivingOrganizationReconstructionInputSnapshot(snapshot);
  if (snapshot.records.length !== 16) throw new Error("Northstar package record count mismatch.");
  const uniqueDigestCount = new Set(snapshot.records.map((item) => item.normalizedContentDigest)).size;
  if (uniqueDigestCount !== 15) throw new Error("Northstar package normalized-digest count mismatch.");
  if (digest !== NORTHSTAR_RECONSTRUCTION_INPUT_DIGEST) {
    throw new Error("Northstar package does not match the committed authoritative digest.");
  }
  return { bytes, digest, recordCount: snapshot.records.length, uniqueDigestCount };
}
