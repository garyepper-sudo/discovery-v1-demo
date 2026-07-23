export const ALPHA_ACCESS_COOKIE = "discovery_alpha_access";
export const ALPHA_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

const TOKEN_VERSION = "v1";
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      Math.ceil(value.length / 4) * 4,
      "=",
    );
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}

async function hmac(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
  );
}

export function safeAlphaPath(candidate: string | null | undefined): string {
  if (!candidate || candidate.length > 2048) return "/alpha";

  let decoded: string;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return "/alpha";
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/alpha";

  try {
    const base = new URL("https://alpha.discovery.invalid");
    const destination = new URL(decoded, base);
    if (destination.origin !== base.origin) return "/alpha";
    if (!/^\/alpha(?:\/|$)/.test(destination.pathname)) return "/alpha";
    return `${destination.pathname}${destination.search}`;
  } catch {
    return "/alpha";
  }
}

export async function passwordsMatch(
  submitted: string,
  configured: string,
): Promise<boolean> {
  const [submittedHash, configuredHash] = await Promise.all([
    sha256(submitted),
    sha256(configured),
  ]);
  return constantTimeEqual(submittedHash, configuredHash);
}

export async function createAlphaSession(
  secret: string,
  now = Date.now(),
): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + ALPHA_SESSION_MAX_AGE_SECONDS;
  const payload = `${TOKEN_VERSION}:${expiresAt}`;
  const signature = toBase64Url(await hmac(payload, secret));
  return `${TOKEN_VERSION}.${expiresAt}.${signature}`;
}

export async function verifyAlphaSession(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const [version, expiration, encodedSignature, ...remainder] = token.split(".");
  if (
    remainder.length > 0 ||
    version !== TOKEN_VERSION ||
    !/^\d+$/.test(expiration ?? "") ||
    !encodedSignature
  ) {
    return false;
  }

  const expiresAt = Number(expiration);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) {
    return false;
  }

  const receivedSignature = fromBase64Url(encodedSignature);
  if (!receivedSignature) return false;
  const expectedSignature = await hmac(
    `${TOKEN_VERSION}:${expiresAt}`,
    secret,
  );
  return constantTimeEqual(receivedSignature, expectedSignature);
}

export function alphaAccessConfigured(): boolean {
  return Boolean(
    process.env.ALPHA_ACCESS_PASSWORD && process.env.ALPHA_SESSION_SECRET,
  );
}

export function secureAlphaCookie(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "production"
  );
}
