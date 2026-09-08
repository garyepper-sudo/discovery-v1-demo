import "server-only";

import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

export type LocalGovernedSourceDescriptor = { sourceKey: string; relativePath: string; purpose: string };
export type LocalGovernedSourceAdmission = { sourceKey: string; purpose: string; byteLength: number; bytes: Uint8Array };

const key = /^[a-z0-9][a-z0-9._:-]{0,127}$/u;
const supported = new Set([".txt", ".md", ".markdown"]);
const MAX_SOURCE_BYTES = 1024 * 1024;
const text = (value: unknown): value is string => typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= 500;

/** Reads each locally selected source once, before any persistence begins. The
 * resulting byte snapshot is safe to retain through the admission protocol. */
export async function readLocalGovernedSources(input: { sourceRoot: string; descriptors: readonly LocalGovernedSourceDescriptor[] }): Promise<readonly LocalGovernedSourceAdmission[]> {
  if (process.env.NODE_ENV === "production" || !path.isAbsolute(input.sourceRoot) || !input.descriptors.length) throw new Error("Local governed source intake is unavailable.");
  const root = await realpath(input.sourceRoot);
  const rootPrefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  const seen = new Set<string>();
  const admissions: LocalGovernedSourceAdmission[] = [];
  for (const descriptor of input.descriptors) {
    if (!key.test(descriptor.sourceKey) || !text(descriptor.relativePath) || !text(descriptor.purpose) || seen.has(descriptor.sourceKey)) throw new Error("Local governed source descriptor is invalid.");
    seen.add(descriptor.sourceKey);
    if (path.isAbsolute(descriptor.relativePath) || descriptor.relativePath.split(/[\\/]/u).includes("..")) throw new Error("Local governed source path is invalid.");
    const candidate = path.resolve(root, descriptor.relativePath);
    if (!candidate.startsWith(rootPrefix) || !supported.has(path.extname(candidate).toLowerCase())) throw new Error("Local governed source path is invalid.");
    const status = await lstat(candidate);
    if (status.isSymbolicLink() || !status.isFile() || status.size < 1 || status.size > MAX_SOURCE_BYTES) throw new Error("Local governed source path is invalid.");
    const resolved = await realpath(candidate);
    if (!resolved.startsWith(rootPrefix)) throw new Error("Local governed source path is invalid.");
    const bytes = new Uint8Array(await readFile(resolved));
    if (!bytes.byteLength || bytes.byteLength > MAX_SOURCE_BYTES) throw new Error("Local governed source is unavailable.");
    admissions.push({ sourceKey: descriptor.sourceKey, purpose: descriptor.purpose, byteLength: bytes.byteLength, bytes });
  }
  return admissions.sort((left, right) => left.sourceKey.localeCompare(right.sourceKey));
}
