import { createHash } from "node:crypto";
import type { OracleResult, SafeObservation } from "./nonDisclosureContracts";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  return JSON.stringify(value);
}

export function safeDigest(value: unknown): string {
  return createHash("sha256").update(canonical(value)).digest("hex");
}

function differences(left: unknown, right: unknown, at = "$", output: string[] = []): string[] {
  if (canonical(left) === canonical(right)) return output;
  if (!left || !right || typeof left !== "object" || typeof right !== "object") { output.push(at); return output; }
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  for (const key of keys) differences((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key], `${at}.${key}`, output);
  return output;
}

export function differencePaths(left: unknown, right: unknown): string[] { return differences(left, right); }

export function compareAllowedSurfaces(control: SafeObservation, counterfactual: SafeObservation, permittedDifferencePaths: readonly string[] = []): OracleResult {
  const differingPaths = differences(control, counterfactual);
  const permittedDifferingPaths = differingPaths.filter(path => permittedDifferencePaths.some(permitted => path === permitted || path.startsWith(`${permitted}.`)));
  const unexpectedDifferingPaths = differingPaths.filter(path => !permittedDifferingPaths.includes(path));
  return { contractVersion: "1", equal: unexpectedDifferingPaths.length === 0, earliestDivergence: unexpectedDifferingPaths[0] ?? null, differingPaths, permittedDifferingPaths, unexpectedDifferingPaths, controlDigest: safeDigest(control), counterfactualDigest: safeDigest(counterfactual) };
}
