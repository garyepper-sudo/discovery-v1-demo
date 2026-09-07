import "server-only";

const publishableKey = /^(?:pk_test_|pk_live_)([A-Za-z0-9_-]+)$/;

/** Returns the canonical Clerk Frontend API URL encoded by a publishable key. */
export function resolveClerkStableInstanceIdentity(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = publishableKey.exec(value);
  if (!match) return undefined;
  let decoded: string;
  try {
    const payload = match[1]!;
    const bytes = Buffer.from(payload, "base64url");
    if (bytes.toString("base64url") !== payload) return undefined;
    decoded = bytes.toString("utf8");
  } catch {
    return undefined;
  }
  if (!decoded.endsWith("$") || decoded.slice(0, -1).includes("\0")) return undefined;
  try {
    const url = new URL(`https://${decoded.slice(0, -1)}`);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash || decoded.slice(0, -1) !== url.hostname || url.href !== `https://${url.hostname}/`) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
