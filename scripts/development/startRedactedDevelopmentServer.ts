import { spawn } from "node:child_process";
import { chmod, lstat, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { createGoogleDriveOAuthLogSanitizer, redactGoogleDriveOAuthLogText } from "../../product/connectors/google-drive/logRedaction";

async function main() {
if (process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED === "true") {
  if (!process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_RUNTIME_ROOT) process.loadEnvFile(path.join(process.cwd(), ".env.local"));
  const founderRoot = process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_RUNTIME_ROOT;
  if (!founderRoot || !path.isAbsolute(founderRoot)) throw new Error("Founder source-scoped analysis lifecycle root is unavailable.");
  const lifecycleRoot = path.join(founderRoot, "source-scoped-lifecycle");
  const ensureDirectory = async (directory: string) => {
    try { const state = await lstat(directory); if (!state.isDirectory() || state.isSymbolicLink() || (state.mode & 0o777) !== 0o700 || state.uid !== process.getuid?.()) throw new Error("Founder source-scoped analysis lifecycle root is unavailable."); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; await mkdir(directory, { mode: 0o700 }); await chmod(directory, 0o700); }
  };
  await ensureDirectory(lifecycleRoot);
  for (const child of ["attempts", "active"]) await ensureDirectory(path.join(lifecycleRoot, child));
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
}

void main();
