import fs from "fs";
import path from "path";

import { getRuntimeOrganizationsDirectory } from "./runtimeStorageLocation";

export type OrganizationSummary = {
  organizationId: string;
  name: string;
  industry?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  investigationCount: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function parseOrganizationSummary(value: unknown): OrganizationSummary | null {
  if (!isRecord(value) || !isRecord(value.metadata)) return null;

  const metadata = value.metadata;
  const organizationId = optionalString(metadata.organizationId);
  const createdAt = optionalString(metadata.createdAt);
  const updatedAt = optionalString(metadata.updatedAt);
  const investigationCount = metadata.investigationCount;

  if (
    !organizationId ||
    !createdAt ||
    !updatedAt ||
    Number.isNaN(Date.parse(createdAt)) ||
    Number.isNaN(Date.parse(updatedAt)) ||
    typeof investigationCount !== "number" ||
    !Number.isInteger(investigationCount) ||
    investigationCount < 0
  ) {
    return null;
  }

  if (
    (metadata.name !== undefined && typeof metadata.name !== "string") ||
    (metadata.industry !== undefined && typeof metadata.industry !== "string") ||
    (metadata.website !== undefined && typeof metadata.website !== "string")
  ) {
    return null;
  }

  return {
    organizationId,
    name: optionalString(metadata.name) ?? organizationId,
    industry: optionalString(metadata.industry),
    website: optionalString(metadata.website),
    createdAt,
    updatedAt,
    investigationCount,
  };
}

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function listOrganizations(): OrganizationSummary[] {
  const directory = getRuntimeOrganizationsDirectory();

  if (!fs.existsSync(directory)) return [];

  const summaries = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
      try {
        const contents = fs.readFileSync(path.join(directory, entry.name), "utf-8");
        return parseOrganizationSummary(JSON.parse(contents));
      } catch {
        return null;
      }
    })
    .filter((summary): summary is OrganizationSummary => summary !== null);

  return summaries.sort((left, right) => {
    const updatedAtDifference = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    if (updatedAtDifference !== 0) return updatedAtDifference;

    const nameDifference = compareStrings(left.name, right.name);
    if (nameDifference !== 0) return nameDifference;

    return compareStrings(left.organizationId, right.organizationId);
  });
}
