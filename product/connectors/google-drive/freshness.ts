import type {
  GoogleDriveConnectedFolder,
  GoogleDriveFileRecord,
} from "./contracts";

export type GoogleDriveQuestionFreshness = {
  status: "current" | "stale" | "unknown" | "inaccessible";
  observedAt: string | null;
  synchronizedAt: string | null;
  limiter: string | null;
};

export function assessGoogleDriveQuestionFreshness(input: {
  folder: GoogleDriveConnectedFolder;
  files: GoogleDriveFileRecord[];
  relevantFileIds: string[];
  now: string;
  maximumAgeMs?: number;
}): GoogleDriveQuestionFreshness {
  if (input.folder.revokedAt) {
    return {
      status: "inaccessible",
      observedAt: null,
      synchronizedAt: input.folder.lastSynchronizedAt,
      limiter: "The authorized folder is disconnected.",
    };
  }
  if (!input.folder.lastSynchronizedAt || !input.relevantFileIds.length) {
    return {
      status: "unknown",
      observedAt: null,
      synchronizedAt: input.folder.lastSynchronizedAt,
      limiter: "No synchronized source evidence is relevant to this Question.",
    };
  }
  const files = input.files.filter((file) => input.relevantFileIds.includes(file.googleFileId));
  if (!files.length || files.some((file) => file.status !== "accessible")) {
    return {
      status: "inaccessible",
      observedAt: null,
      synchronizedAt: input.folder.lastSynchronizedAt,
      limiter: "One or more relevant source records are no longer accessible.",
    };
  }
  const observedAt = files.map((file) => file.modifiedAt).sort().at(-1) ?? null;
  const maximumAgeMs = input.maximumAgeMs ?? 30 * 24 * 60 * 60 * 1000;
  const stale = !observedAt
    || Date.parse(input.now) - Date.parse(observedAt) > maximumAgeMs;
  return {
    status: stale ? "stale" : "current",
    observedAt,
    synchronizedAt: input.folder.lastSynchronizedAt,
    limiter: stale ? "Relevant source evidence is older than the governed freshness window." : null,
  };
}
