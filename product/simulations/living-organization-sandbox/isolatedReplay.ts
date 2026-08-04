import { spawn } from "node:child_process";
import path from "node:path";

import type { SandboxBatchId } from "./manifest";
import type { SandboxReplayResult } from "./replay";

type IsolatedReplayRequest = {
  role: "local-expected" | "synthetic-drive";
  sandboxRoot: string;
  throughBatch?: SandboxBatchId;
  startAtBatch?: SandboxBatchId;
  reset?: boolean;
  documentContents?: Array<[string, string]>;
};

export async function runLivingOrganizationSandboxIsolated(input: {
  role: "local-expected" | "synthetic-drive";
  sandboxRoot: string;
  throughBatch?: SandboxBatchId;
  startAtBatch?: SandboxBatchId;
  reset?: boolean;
  documentContents?: ReadonlyMap<string, string>;
}): Promise<SandboxReplayResult> {
  const worker = path.join(
    process.cwd(),
    "scripts/product/runLivingOrganizationSandboxIsolated.ts",
  );
  const child = spawn(process.execPath, ["--import", "tsx", worker], {
    cwd: process.cwd(),
    env: {
      NODE_ENV: "test",
      DISCOVERY_ENV: "sandbox",
      FORCE_COLOR: "0",
      ...(process.env.TMPDIR ? { TMPDIR: process.env.TMPDIR } : {}),
    },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const request: IsolatedReplayRequest = {
    role: input.role,
    sandboxRoot: input.sandboxRoot,
    throughBatch: input.throughBatch,
    startAtBatch: input.startAtBatch,
    reset: input.reset,
    documentContents: input.documentContents
      ? [...input.documentContents.entries()]
      : undefined,
  };
  child.stdin.end(JSON.stringify(request));
  let stdout = "";
  let stderr = "";
  let outputError: Error | undefined;
  let timedOut = false;
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  const maxOutputChars=4*1024*1024;
  const append=(current:string,chunk:string)=>{const next=current+chunk;if(next.length>maxOutputChars){outputError=new Error("Isolated sandbox replay exceeded its bounded output limit.");child.kill("SIGKILL");return current;}return next;};
  child.stdout.on("data", (chunk: string) => { stdout = append(stdout,chunk); });
  child.stderr.on("data", (chunk: string) => { stderr = append(stderr,chunk); });
  const timeout=setTimeout(()=>{timedOut=true;child.kill("SIGKILL");},30_000);
  let code: number | null;
  try {
    code = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    });
  } finally {
    clearTimeout(timeout);
  }
  if(outputError) throw outputError;
  if(timedOut) throw new Error("Isolated sandbox replay exceeded its 30 second timeout.");
  if (code !== 0) {
    throw new Error(`Isolated sandbox replay failed (${code ?? "signal"}): ${stderr.trim().slice(0, 500)}`);
  }
  const envelope=JSON.parse(stdout) as {role?:string;runtimeRoot?:string;result?:SandboxReplayResult};
  if(envelope.role!==input.role||envelope.runtimeRoot!==path.resolve(input.sandboxRoot)) throw new Error("Isolated sandbox replay returned a mismatched role or Runtime root.");
  const result=envelope.result;
  if(!result||!Array.isArray(result.checkpoints)||!Array.isArray(result.negativeControls)||result.connectorCalls!==0||result.networkCalls!==0||result.externalActions!==0||typeof result.manifestDigest!=="string") throw new Error("Isolated sandbox replay returned an invalid bounded result schema.");
  return result;
}
