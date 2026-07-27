import assert from "node:assert/strict";
import { createHash } from "node:crypto";

type OidcClaims = {
  iss?: unknown;
  aud?: unknown;
  sub?: unknown;
  project_id?: unknown;
  owner_id?: unknown;
  environment?: unknown;
  iat?: unknown;
  exp?: unknown;
};

export type BoundedVercelOidcEvidence = {
  issuer: string;
  audience: string | readonly string[];
  subject: string;
  projectId: string;
  teamId: string;
  environment: string;
  issuedAt: number;
  expiresAt: number;
  requestContextTokenDetected: boolean;
  environmentTokenDetected: boolean;
  tokenHashPrefix: string;
};

function stringClaim(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`OIDC ${label} claim is missing`);
  }
  assert.ok(value.length > 0, `OIDC ${label} claim is empty`);
  return value;
}

function numberClaim(value: unknown, label: string): number {
  if (typeof value !== "number") {
    throw new Error(`OIDC ${label} claim is missing`);
  }
  assert.ok(Number.isFinite(value), `OIDC ${label} claim is invalid`);
  return value;
}

function requestContextToken(): string | undefined {
  const context = (
    globalThis as typeof globalThis & {
      [key: symbol]: { get?: () => { headers?: Record<string, string> } };
    }
  )[Symbol.for("@vercel/request-context")]?.get?.();
  return context?.headers?.["x-vercel-oidc-token"];
}

export function boundedVercelOidcEvidence(
  token: string,
  expected: {
    environment: string;
    projectId?: string;
    nowSeconds?: number;
    requestContextToken?: string;
    environmentToken?: string;
  },
): BoundedVercelOidcEvidence {
  const parts = token.split(".");
  assert.equal(parts.length, 3, "OIDC token is malformed");
  const claims = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf8"),
  ) as OidcClaims;
  const environment = stringClaim(claims.environment, "environment");
  const projectId = stringClaim(claims.project_id, "project_id");
  const expiresAt = numberClaim(claims.exp, "exp");
  assert.equal(
    environment,
    expected.environment,
    "OIDC environment scope mismatch",
  );
  if (expected.projectId) {
    assert.equal(projectId, expected.projectId, "OIDC project scope mismatch");
  }
  assert.ok(
    expiresAt > (expected.nowSeconds ?? Math.floor(Date.now() / 1000)),
    "OIDC token is expired",
  );

  const requestToken = expected.requestContextToken ?? requestContextToken();
  const environmentToken =
    expected.environmentToken ?? process.env.VERCEL_OIDC_TOKEN;
  return {
    issuer: stringClaim(claims.iss, "issuer"),
    audience: Array.isArray(claims.aud)
      ? claims.aud.map((value) => stringClaim(value, "audience"))
      : stringClaim(claims.aud, "audience"),
    subject: stringClaim(claims.sub, "subject"),
    projectId,
    teamId: stringClaim(claims.owner_id, "owner_id"),
    environment,
    issuedAt: numberClaim(claims.iat, "iat"),
    expiresAt,
    requestContextTokenDetected: Boolean(requestToken),
    environmentTokenDetected: Boolean(environmentToken),
    tokenHashPrefix: createHash("sha256").update(token).digest("hex").slice(0, 12),
  };
}
