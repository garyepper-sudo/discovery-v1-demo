import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EXCLUDED_DIRECTORIES = new Set([
  ".discovery-runtime",
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);

// Add only repository paths that are proven to be intentionally distinct.
const ALLOWLIST = new Set([]);

const DUPLICATE_SUFFIX =
  /(?: [2-9]\d*| \([2-9]\d*\)| copy|-copy|_copy)(?=\.[^.]+$|$)/i;

async function collectFiles(directory, root, files) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name, "en"));

  for (const entry of entries) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(absolutePath, root, files);
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      files.push(path.relative(root, absolutePath));
    }
  }
}

function normalizeFilename(filePath) {
  const directory = path.dirname(filePath);
  const filename = path.basename(filePath);
  const normalizedFilename = filename.replace(DUPLICATE_SUFFIX, "");
  return path.join(directory, normalizedFilename);
}

const root = process.cwd();
const files = [];
await collectFiles(root, root, files);
const repositoryPaths = new Set(files);

const suspiciousGroups = new Map();
for (const file of files) {
  if (ALLOWLIST.has(file) || !DUPLICATE_SUFFIX.test(path.basename(file))) continue;

  const canonical = normalizeFilename(file);
  // A standalone numbered artifact such as "Chapter 2.md" is legitimate.
  // Treat the suffix as an accidental copy only when its canonical peer exists.
  if (!repositoryPaths.has(canonical)) continue;

  const group = suspiciousGroups.get(canonical) ?? [];
  group.push(file);
  suspiciousGroups.set(canonical, group);
}

if (suspiciousGroups.size === 0) {
  console.log("Duplicate filename validation passed.");
  process.exit(0);
}

console.error("Duplicate filename validation failed.");
console.error(
  "Rename or remove each suspicious copy, or document an intentional path in ALLOWLIST.",
);
for (const [canonical, duplicates] of [...suspiciousGroups].sort(([left], [right]) =>
  left.localeCompare(right, "en"),
)) {
  console.error(`\nCanonical candidate: ${canonical}`);
  for (const duplicate of duplicates.sort((left, right) =>
    left.localeCompare(right, "en"),
  )) {
    console.error(`  - ${duplicate}`);
  }
}
process.exit(1);
