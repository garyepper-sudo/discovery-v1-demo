import { createHash } from "node:crypto";

export function sourceContentStableSerialize(value: unknown): string {
  const seen = new Set<object>();
  const render = (item: unknown): string => {
    if (item === undefined || typeof item === "function" || typeof item === "symbol" || typeof item === "bigint") throw new Error("Unsupported governed source content value.");
    if (typeof item === "number" && !Number.isFinite(item)) throw new Error("Unsupported governed source content number.");
    if (item === null || typeof item !== "object") return JSON.stringify(item);
    if (seen.has(item)) throw new Error("Circular governed source content value.");
    seen.add(item);
    const value = Array.isArray(item)
      ? `[${item.map(render).join(",")}]`
      : `{${Object.keys(item as object).sort().map(key => `${JSON.stringify(key)}:${render((item as Record<string, unknown>)[key])}`).join(",")}}`;
    seen.delete(item);
    return value;
  };
  return render(value);
}

export const sourceContentDigest = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");

export function decodeAndNormalizeSourceContent(bytes: Uint8Array): { text: string; normalizedText: string } {
  const body = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? bytes.slice(3) : bytes;
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(body); }
  catch { throw new Error("Governed source content must be valid UTF-8."); }
  const normalizedText = text.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").replace(/^(?:[ \t]*\n)+|(?:\n[ \t]*)+$/g, "");
  return { text, normalizedText };
}

export function sourceContentVersionId(input: { organizationId: string; sourceBindingId: string; exactContentDigest: string }): string {
  return `source-content-version:${sourceContentDigest(sourceContentStableSerialize(["1", input.organizationId, input.sourceBindingId, input.exactContentDigest]))}`;
}
