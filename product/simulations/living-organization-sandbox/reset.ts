import { createHash } from "node:crypto";
import { lstat, mkdir, readdir, realpath, rm } from "node:fs/promises";
import path from "node:path";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest } from "./manifest";

export type SandboxResetReceipt = { version: "1"; organizationId: string; removed: string[]; absent: string[]; baselineEmpty: boolean; digest: string };

export async function resetLivingOrganizationSandbox(input: { environment: string; organizationId: string; sandboxRoot: string }): Promise<SandboxResetReceipt> {
  if (!['development','sandbox','test'].includes(input.environment)) throw new Error("Sandbox reset refused outside development, sandbox, or test.");
  if (input.organizationId !== SANDBOX_ORGANIZATION_ID) throw new Error("Sandbox reset organization mismatch.");
  const root = path.resolve(input.sandboxRoot);
  const temp = path.resolve(process.env.TMPDIR ?? "/tmp");
  if (!root.startsWith(`${temp}${path.sep}`) || !path.basename(root).startsWith("discovery-living-organization-sandbox-")) throw new Error("Sandbox reset path is not an explicitly designated temporary sandbox.");
  await mkdir(root, { recursive: true });
  const rootStatus = await lstat(root);
  if (rootStatus.isSymbolicLink() || !rootStatus.isDirectory()) throw new Error("Sandbox reset requires a real sandbox directory.");
  const actualRoot = await realpath(root);
  const actualTemp = await realpath(temp);
  if (!actualRoot.startsWith(`${actualTemp}${path.sep}`)) throw new Error("Sandbox reset refuses path aliases or escapes.");
  for (const ownedDirectory of sandboxManifest.expectedTemporaryPaths) {
    const directory = path.join(root, ownedDirectory);
    try {
      const status = await lstat(directory);
      if (status.isSymbolicLink() || !status.isDirectory()) throw new Error(`Sandbox reset refuses unsafe ${ownedDirectory} directory.`);
      if (await realpath(directory) !== path.join(actualRoot, ownedDirectory)) throw new Error(`Sandbox reset refuses aliased ${ownedDirectory} directory.`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await mkdir(directory);
    }
  }
  const owned = [path.join(root,"runtime",sandboxManifest.resetOwnership.runtimeFile), path.join(root,"output",sandboxManifest.resetOwnership.checkpointFile), path.join(root,"output",sandboxManifest.resetOwnership.receiptFile)];
  const removed: string[] = [], absent: string[] = [];
  for (const target of owned) { try { await lstat(target); await rm(target); removed.push(path.relative(root,target)); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") absent.push(path.relative(root,target)); else throw error; } }
  const unexpected = [...await readdir(path.join(root,"runtime")), ...await readdir(path.join(root,"output"))].filter((name) => name !== sandboxManifest.resetOwnership.receiptFile);
  if (unexpected.length) throw new Error(`Sandbox reset found unowned artifacts: ${unexpected.sort().join(", ")}`);
  const base = { version:"1" as const, organizationId:input.organizationId, removed:removed.sort(), absent:absent.sort(), baselineEmpty:true };
  return {...base,digest:createHash("sha256").update(JSON.stringify(base)).digest("hex")};
}
