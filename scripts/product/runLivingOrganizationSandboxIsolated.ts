import { mkdir } from "node:fs/promises";
import path from "node:path";

import type { SandboxBatchId } from "../../product/simulations/living-organization-sandbox/manifest";

type Request = {
  role: "local-expected" | "synthetic-drive";
  sandboxRoot: string;
  throughBatch?: SandboxBatchId;
  startAtBatch?: SandboxBatchId;
  reset?: boolean;
  documentContents?: Array<[string, string]>;
};

async function main() {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) input += chunk;
  const request = JSON.parse(input) as Request;
  const runtimeDirectory = path.join(request.sandboxRoot, "runtime");
  await mkdir(runtimeDirectory, { recursive: true });
  process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY = runtimeDirectory;
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    const { runLivingOrganizationSandbox } = await import(
      "../../product/simulations/living-organization-sandbox/replay"
    );
    const result = await runLivingOrganizationSandbox({
      sandboxRoot: request.sandboxRoot,
      throughBatch: request.throughBatch,
      startAtBatch: request.startAtBatch,
      reset: request.reset,
      documentContents: request.documentContents
        ? new Map(request.documentContents)
        : undefined,
    });
    process.stdout.write(JSON.stringify({
      role: request.role,
      runtimeRoot: path.resolve(request.sandboxRoot),
      result,
    }));
  } finally {
    console.log = originalLog;
  }
}

void main();
