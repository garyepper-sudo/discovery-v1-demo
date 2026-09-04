import path from "node:path";

export const V11_ARCHIVE_NAMESPACE = "model-mediated-compounding-v1-1" as const;

export function v11ArchiveLayout(restrictedRoot: string, archiveId: string) {
  if (!/^[a-f0-9]{64}$/.test(archiveId)) throw new Error("invalid V1.1 archive identity");
  const root = path.resolve(restrictedRoot, V11_ARCHIVE_NAMESPACE, archiveId);
  return {
    root,
    ledger: path.join(root, "execution-ledger.json"),
    manifest: path.join(root, "archive-manifest.json"),
    envelopes: path.join(root, "response-envelopes"),
    extracted: path.join(root, "extracted-artifacts"),
    parsed: path.join(root, "parsed-artifacts"),
  };
}

export function assertPhysicalV11Separation(v1Archive: string, v11Root: string) {
  const v1 = path.resolve(v1Archive);
  const v11 = path.resolve(v11Root);
  if (v1 === v11 || v11.startsWith(`${v1}${path.sep}`) || v1.startsWith(`${v11}${path.sep}`)) {
    throw new Error("V1 and V1.1 archives are not physically distinct");
  }
  if (!v11.split(path.sep).includes(V11_ARCHIVE_NAMESPACE)) {
    throw new Error("V1.1 archive namespace missing");
  }
}
