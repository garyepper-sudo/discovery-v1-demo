import { spawn } from "node:child_process";
import { chmod, lstat, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { resolveFounderLocalAlphaRuntimeRootFromEnvironment } from "../../lib/alpha-activation/founderLocalAlphaRuntimeRoot";
import { createGoogleDriveOAuthLogSanitizer, redactGoogleDriveOAuthLogText } from "../../product/connectors/google-drive/logRedaction";
import { SourceScopedFrontierAttemptLifecycleV1 } from "../../product/integration/sourceScopedExecutiveAnalysis";

if (process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED === "true") {
  const founderRoot = await resolveFounderLocalAlphaRuntimeRootFromEnvironment();
  if (founderRoot.status !== "ready") throw new Error("Founder source-scoped analysis lifecycle root is unavailable.");
  const lifecycleRoot = path.join(founderRoot.value.root, "source-scoped-lifecycle");
  try {
    const state = await lstat(lifecycleRoot);
    if (!state.isDirectory() || state.isSymbolicLink()) throw new Error("Founder source-scoped analysis lifecycle root is unavailable.");
    for (const child of ["attempts", "active"]) {
      try { const childState = await lstat(path.join(lifecycleRoot, child)); if (!childState.isDirectory() || childState.isSymbolicLink()) throw new Error("Founder source-scoped analysis lifecycle root is unavailable."); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await mkdir(lifecycleRoot, { mode: 0o700 });
  }
  await chmod(lifecycleRoot, 0o700);
  await SourceScopedFrontierAttemptLifecycleV1.inspect(lifecycleRoot);
}

const require = createRequire(import.meta.url);
const next = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [next, "dev", ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

function sanitize(stream: NodeJS.ReadableStream, destination: NodeJS.WriteStream) {
  const sanitizer=createGoogleDriveOAuthLogSanitizer(value=>destination.write(value));
  stream.setEncoding("utf8");
  stream.on("data", (chunk: string) => sanitizer.write(chunk));
  stream.on("end", () => sanitizer.end());
}

sanitize(child.stdout, process.stdout);
sanitize(child.stderr, process.stderr);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

child.on("error", (error) => {
  process.stderr.write(`${redactGoogleDriveOAuthLogText(error.message)}\n`);
  process.exitCode = 1;
});
child.on("close", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
