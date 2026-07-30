import { createHash } from "node:crypto";

export const stableId = (prefix: string, ...parts: string[]): string =>
  `${prefix}-${createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 16)}`;

export const words = (value: string): string[] =>
  value.trim().split(/\s+/).filter(Boolean);

export const limitWords = (value: string, maximum: number): string =>
  words(value).slice(0, maximum).join(" ");

export const normalize = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

export const distinct = <T>(values: T[]): T[] => [...new Set(values)];

export const confidenceLevel = (score: number): "low" | "moderate" | "high" =>
  score >= 0.75 ? "high" : score >= 0.5 ? "moderate" : "low";

export const dimensionStatus = (
  value: number | null,
): "unknown" | "weak" | "developing" | "healthy" | "strong" => {
  if (value === null) return "unknown";
  if (value < 0.35) return "weak";
  if (value < 0.6) return "developing";
  if (value < 0.8) return "healthy";
  return "strong";
};
