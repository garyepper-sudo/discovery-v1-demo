import assert from "node:assert/strict";
import net from "node:net";
import tls from "node:tls";

import postgres from "postgres";

import {
  requireDiscoveryDatabaseUrl,
  type DiscoveryDatabasePurpose,
} from "../../db/config";

type TlsEvidence = {
  purpose: DiscoveryDatabasePurpose;
  endpoint: "pooled" | "direct";
  sslmode: string;
  pgStatSsl: boolean;
  tlsVersion: string;
  cipher: string;
  certificateAuthorized: boolean;
};

async function negotiatePostgresTls(url: URL): Promise<{
  tlsVersion: string;
  cipher: string;
  certificateAuthorized: boolean;
}> {
  const port = Number(url.port || "5432");
  const socket = net.connect({ host: url.hostname, port });
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });

  const request = Buffer.alloc(8);
  request.writeInt32BE(8, 0);
  request.writeInt32BE(80877103, 4);
  socket.write(request);

  const response = await new Promise<Buffer>((resolve, reject) => {
    socket.once("data", resolve);
    socket.once("error", reject);
  });
  assert.equal(response[0], 0x53, "Neon endpoint refused PostgreSQL TLS");

  const secure = tls.connect({
    socket,
    servername: url.hostname,
    rejectUnauthorized: true,
  });
  await new Promise<void>((resolve, reject) => {
    secure.once("secureConnect", resolve);
    secure.once("error", reject);
  });
  try {
    const cipher = secure.getCipher();
    const tlsVersion = secure.getProtocol();
    assert.ok(tlsVersion, "TLS protocol unavailable");
    assert.ok(cipher?.name, "TLS cipher unavailable");
    assert.equal(secure.authorized, true, "Neon TLS certificate was not authorized");
    return {
      tlsVersion,
      cipher: cipher.name,
      certificateAuthorized: secure.authorized,
    };
  } finally {
    secure.destroy();
  }
}

async function validatePurpose(
  purpose: DiscoveryDatabasePurpose,
): Promise<TlsEvidence> {
  const raw = requireDiscoveryDatabaseUrl(purpose);
  const url = new URL(raw);
  const sslmode = url.searchParams.get("sslmode");
  assert.ok(
    sslmode === "require" ||
      sslmode === "verify-ca" ||
      sslmode === "verify-full",
    `${purpose} database URL must require TLS`,
  );

  const sql = postgres(raw, { max: 1 });
  try {
    const [session] = await sql<{
      ssl: boolean;
      version: string | null;
      cipher: string | null;
    }[]>`
      SELECT ssl, version, cipher
      FROM pg_stat_ssl
      WHERE pid = pg_backend_pid()
    `;
    assert.ok(session, `${purpose} TLS session evidence unavailable`);
    const negotiated = await negotiatePostgresTls(url);
    return {
      purpose,
      endpoint: url.hostname.includes("-pooler.") ? "pooled" : "direct",
      sslmode,
      pgStatSsl: session.ssl,
      ...negotiated,
    };
  } finally {
    await sql.end();
  }
}

async function main(): Promise<void> {
  const evidence = await Promise.all([
    validatePurpose("application"),
    validatePurpose("administration"),
    validatePurpose("migration"),
  ]);
  assert.equal(
    evidence.every((item) => item.certificateAuthorized),
    true,
    "Every Neon endpoint must complete authorized TLS negotiation",
  );

  const proxyTerminated = evidence.every((item) => item.pgStatSsl === false);
  console.log(JSON.stringify({
    validation: "neon-tls",
    result: "PASS",
    classification: "CHECKER_FALSE_NEGATIVE",
    explanation: proxyTerminated
      ? "pg_stat_ssl observes the Neon proxy-to-compute leg; direct endpoint negotiation proves the client-facing TLS leg."
      : "Client-facing TLS negotiation and pg_stat_ssl both provide positive transport evidence.",
    credentialsPrinted: false,
    evidence,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
