import mammoth from "mammoth";
import pdf from "pdf-parse";
import JSZip from "jszip";
import type { GoogleDrivePassage } from "./contracts";
import type { GoogleDriveClient, GoogleDriveFile } from "./googleApi";
import {
  googleDrivePassageIdentity,
  normalizeExtractedContent,
} from "./identity";
import { sha256 } from "./repositories";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_CHARS = 200_000;
const PASSAGE_CHARS = 2_000;

const GOOGLE_DOC = "application/vnd.google-apps.document";
const GOOGLE_SHEET = "application/vnd.google-apps.spreadsheet";
const GOOGLE_SLIDE = "application/vnd.google-apps.presentation";

function passages(input: {
  file: GoogleDriveFile;
  text: string;
  extractedAt: string;
  sourceIdentity: string;
}): GoogleDrivePassage[] {
  const bounded = input.text.replace(/\u0000/g, "").trim().slice(0, MAX_CHARS);
  const chunks = bounded.match(new RegExp(`.{1,${PASSAGE_CHARS}}(?:\\s|$)`, "gs")) ?? [];
  return chunks.map((rawContent, index) => {
    const legacyContent = rawContent.trim();
    const content = normalizeExtractedContent(legacyContent);
    const location = `passage ${index + 1}`;
    const contentDigest = sha256(content);
    return {
    id: googleDrivePassageIdentity({
      sourceIdentity: input.sourceIdentity,
      location,
      contentDigest,
    }),
    googleFileId: input.file.id!,
    fileName: input.file.name ?? "Untitled",
    mimeType: input.file.mimeType ?? "application/octet-stream",
    revisionId: String(input.file.version ?? input.file.modifiedTime ?? "unknown"),
    modifiedAt: input.file.modifiedTime ?? input.extractedAt,
    extractedAt: input.extractedAt,
    location,
    content,
    contentDigest,
    ...(sha256(legacyContent) !== contentDigest
      ? { legacyContentDigest: sha256(legacyContent) }
      : {}),
  };
  });
}

async function bytes(response: { data: unknown }): Promise<Buffer> {
  const data = response.data;
  const buffer = Buffer.isBuffer(data)
    ? data
    : data instanceof ArrayBuffer
      ? Buffer.from(data)
      : Buffer.from(String(data));
  if (buffer.byteLength > MAX_BYTES) throw new Error("File exceeds the 10 MB extraction limit.");
  return buffer;
}

function xmlText(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractOfficeArchive(
  buffer: Buffer,
  prefix: "xl/worksheets/" | "ppt/slides/",
  label: "Sheet" | "Slide",
): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const paths = Object.keys(zip.files)
    .filter((path) => path.startsWith(prefix) && path.endsWith(".xml"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const sections: string[] = [];
  for (const [index, path] of paths.entries()) {
    const entry = zip.file(path);
    if (!entry) continue;
    sections.push(`${label} ${index + 1}\n${xmlText(await entry.async("text"))}`);
  }
  return sections.join("\n\n");
}

export async function extractGoogleDriveFile(input: {
  drive: GoogleDriveClient;
  file: GoogleDriveFile;
  extractedAt: string;
  sourceIdentity: string;
}): Promise<{ passages: GoogleDrivePassage[]; limitation: string | null }> {
  const mime = input.file.mimeType ?? "";
  let text: string;
  if (mime === GOOGLE_DOC) {
    text = (await input.drive.files.export(
      { fileId: input.file.id!, mimeType: "text/plain" },
      { responseType: "text" },
    )).data as string;
  } else if (mime === GOOGLE_SHEET) {
    text = (await input.drive.files.export(
      { fileId: input.file.id!, mimeType: "text/csv" },
      { responseType: "text" },
    )).data as string;
  } else if (mime === GOOGLE_SLIDE) {
    text = (await input.drive.files.export(
      { fileId: input.file.id!, mimeType: "text/plain" },
      { responseType: "text" },
    )).data as string;
  } else {
    const response = await input.drive.files.get<ArrayBuffer>(
      { fileId: input.file.id!, alt: "media" },
      { responseType: "arraybuffer" },
    );
    const buffer = await bytes(response);
    if (mime === "application/pdf") text = (await pdf(buffer)).text;
    else if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) text = (await mammoth.extractRawText({ buffer })).value;
    else if (
      mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) text = await extractOfficeArchive(buffer, "xl/worksheets/", "Sheet");
    else if (
      mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) text = await extractOfficeArchive(buffer, "ppt/slides/", "Slide");
    else if (mime.startsWith("text/")) text = buffer.toString("utf8");
    else return { passages: [], limitation: `Unsupported MIME type: ${mime || "unknown"}` };
  }
  const result = passages({
    file: input.file,
    text,
    extractedAt: input.extractedAt,
    sourceIdentity: input.sourceIdentity,
  });
  return {
    passages: result,
    limitation: text.length > MAX_CHARS ? "Content was truncated at 200,000 characters." : null,
  };
}
