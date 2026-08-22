import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export type ScannerFinding = { surfaceId: string; category: string };
export type ProtectedValue = { category: string; value: string };

const normalized = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]/g, "");

export function scanText(surfaceId: string, text: string, values: readonly ProtectedValue[]): ScannerFinding[] {
  const content = normalized(text);
  return values.flatMap(item => {
    const variants = [item.value, item.value.toUpperCase(), Buffer.from(item.value).toString("base64"), Buffer.from(item.value).toString("hex"), item.value.split("").join(" ")];
    return variants.some(value => text.includes(value) || content.includes(normalized(value))) ? [{ surfaceId, category: item.category }] : [];
  });
}

export async function scanRoot(root: string, values: readonly ProtectedValue[]): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error("scanner refuses symlinked root");
      if (entry.isDirectory()) await visit(absolute);
      else findings.push(...scanText(path.relative(root, absolute), (await readFile(absolute)).toString("utf8"), values));
    }
  }
  await visit(root);
  return findings;
}
