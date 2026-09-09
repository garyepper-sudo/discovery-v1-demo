import "server-only";

import path from "node:path";
import { chmod, lstat, mkdir, readFile, readdir, realpath } from "node:fs/promises";

export type FounderLocalAlphaRuntimeRoot = Readonly<{
  root: string;
  sourceContentRoot: string;
  productArtifactBodyRoot: string;
}>;

export type FounderLocalAlphaRuntimeRootResolution =
  | { status: "ready"; value: FounderLocalAlphaRuntimeRoot }
  | { status: "unavailable"; reason: "disabled" | "missing" | "invalid" | "unsafe" };

const inside = (candidate: string, owner: string) =>
  candidate === owner || candidate.startsWith(`${owner}${path.sep}`);

async function status(candidate: string) {
  try { return await lstat(candidate); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function resolveProspectivePath(candidate: string): Promise<string> {
  let ancestor = candidate;
  const missingSegments: string[] = [];
  while (!(await status(ancestor))) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) throw new Error("Runtime root has no existing ancestor.");
    missingSegments.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  const ancestorStat = await lstat(ancestor);
  if (!ancestorStat.isDirectory() && !ancestorStat.isSymbolicLink()) {
    throw new Error("Runtime root ancestor is not a directory.");
  }
  return path.join(await realpath(ancestor), ...missingSegments);
}

async function nearestGitMarker(start: string): Promise<string | null> {
  let current = start;
  while (true) {
    if (await status(path.join(current, ".git"))) return path.join(current, ".git");
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

async function registeredGitRoots(cwd: string): Promise<readonly string[]> {
  const marker = await nearestGitMarker(cwd);
  if (!marker) return [];
  const markerStat = await lstat(marker);
  let commonDirectory: string;
  if (markerStat.isDirectory()) commonDirectory = await realpath(marker);
  else {
    if (!markerStat.isFile() || markerStat.isSymbolicLink()) throw new Error("Git worktree marker is invalid.");
    const line = (await readFile(marker, "utf8")).trim();
    if (!line.startsWith("gitdir: ")) throw new Error("Git worktree marker is invalid.");
    const gitDirectory = await realpath(path.resolve(path.dirname(marker), line.slice(8)));
    commonDirectory = await realpath(path.resolve(gitDirectory, "..", ".."));
  }
  const roots = new Set<string>([commonDirectory, await realpath(path.dirname(commonDirectory))]);
  const entries = await readdir(path.join(commonDirectory, "worktrees"), { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const raw = await readFile(path.join(commonDirectory, "worktrees", entry.name, "gitdir"), "utf8").catch(() => null);
    if (!raw || !path.isAbsolute(raw.trim())) continue;
    const root = path.dirname(raw.trim());
    if ((await status(root))?.isDirectory()) roots.add(await realpath(root));
  }
  return [...roots];
}

export async function resolveFounderLocalAlphaRuntimeRoot(input: {
  nodeEnv: string | undefined;
  enabled: string | undefined;
  configuredRoot: string | undefined;
  cwd?: string;
  forbiddenRoots?: readonly string[];
}): Promise<FounderLocalAlphaRuntimeRootResolution> {
  if (input.nodeEnv === "production" || input.enabled !== "true") return { status: "unavailable", reason: "disabled" };
  if (!input.configuredRoot?.trim() || !path.isAbsolute(input.configuredRoot)) return { status: "unavailable", reason: "missing" };
  const requested = path.resolve(input.configuredRoot);
  try {
    const requestedStat = await status(requested);
    if (requestedStat?.isSymbolicLink() || (requestedStat && !requestedStat.isDirectory())) return { status: "unavailable", reason: "invalid" };
    const cwd = await realpath(input.cwd ?? process.cwd());
    const forbidden = [...new Set([...(await registeredGitRoots(cwd)), ...(await Promise.all((input.forbiddenRoots ?? []).map(value => realpath(value))))])];
    const prospectiveRoot = await resolveProspectivePath(requested);
    if (forbidden.some(owner => inside(requested, owner) || inside(prospectiveRoot, owner))) return { status: "unavailable", reason: "unsafe" };
    const requestedChildren = [path.join(requested, "source-content"), path.join(requested, "product-artifact-bodies")];
    for (const child of requestedChildren) {
      const childStat = await status(child);
      if (childStat?.isSymbolicLink() || (childStat && !childStat.isDirectory())) return { status: "unavailable", reason: "invalid" };
      const prospectiveChild = await resolveProspectivePath(child);
      if (forbidden.some(owner => inside(prospectiveChild, owner))) return { status: "unavailable", reason: "unsafe" };
    }
    await mkdir(requested, { recursive: true, mode: 0o700 });
    const root = await realpath(requested);
    const rootStat = await lstat(requested);
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink() || forbidden.some(owner => inside(root, owner))) return { status: "unavailable", reason: "unsafe" };
    await chmod(root, 0o700);
    const sourceContentRoot = path.join(root, "source-content");
    const productArtifactBodyRoot = path.join(root, "product-artifact-bodies");
    await mkdir(sourceContentRoot, { recursive: true, mode: 0o700 });
    await mkdir(productArtifactBodyRoot, { recursive: true, mode: 0o700 });
    if (await realpath(sourceContentRoot) !== sourceContentRoot || await realpath(productArtifactBodyRoot) !== productArtifactBodyRoot) return { status: "unavailable", reason: "unsafe" };
    await chmod(sourceContentRoot, 0o700);
    await chmod(productArtifactBodyRoot, 0o700);
    return { status: "ready", value: Object.freeze({ root, sourceContentRoot, productArtifactBodyRoot }) };
  } catch {
    return { status: "unavailable", reason: "invalid" };
  }
}

export function resolveFounderLocalAlphaRuntimeRootFromEnvironment() {
  return resolveFounderLocalAlphaRuntimeRoot({
    nodeEnv: process.env.NODE_ENV,
    enabled: process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED,
    configuredRoot: process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_RUNTIME_ROOT,
  });
}
