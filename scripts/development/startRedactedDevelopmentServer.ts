import { spawn } from "node:child_process";
import { createRequire } from "node:module";

import { createGoogleDriveOAuthLogSanitizer, redactGoogleDriveOAuthLogText } from "../../product/connectors/google-drive/logRedaction";

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
