import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { comparativeCases } from "./fixtures";
import { comparativeUtilityWeights } from "./evaluate";
import { EXTERNAL_COMPARATIVE_PROTOCOL_VERSION, type PreregistrationManifest } from "./types";

const directory = path.dirname(new URL(import.meta.url).pathname);
const sourceFiles = ["types.ts", "fixtures.ts", "treatments.ts", "evaluate.ts", "preregistration.ts", "runExternalComparativeValidation001.ts"];
const sha = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");

export async function implementationHashes(): Promise<Record<string, string>> {
  return Object.fromEntries(await Promise.all(sourceFiles.map(async (file) => [file, sha(await readFile(path.join(directory, file))) ])));
}

export async function freezePreregistration(outputFile: string): Promise<PreregistrationManifest> {
  const fileHashes = await implementationHashes();
  const manifest: PreregistrationManifest = {
    protocolVersion: EXTERNAL_COMPARATIVE_PROTOCOL_VERSION,
    experimentId: "external-comparative-validation-001",
    repositoryCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    benchmarkImplementationHash: sha(JSON.stringify(fileHashes)), evaluatorVersion: "1", fixtureHashes: fileHashes,
    contractVersions: { treatmentOutput: "1", preregistration: "1", discoveryRuntime: "existing-canonical", comparativeUtility: "1" },
    cases: comparativeCases.map((item) => ({ caseId: item.caseId, organizationId: item.organizationId, holdout: item.holdout, scenarioTypes: item.scenarioTypes,
      phases: item.phases, permissionBoundaries: ["Only evidence marked all-benchmark-treatments is visible to treatments.", "No treatment may inspect another organization."] })),
    treatments: [
      { id: "human-only", executionClass: "not-yet-evaluated" },
      { id: "llm-only-fixture-proxy", executionClass: "deterministic-fixture-backed-proxy" },
      { id: "retrieval-plus-synthesis", executionClass: "deterministic-local-baseline" },
      { id: "traditional-structured-analysis", executionClass: "deterministic-local-baseline" },
      { id: "discovery", executionClass: "canonical-discovery" },
    ],
    weights: comparativeUtilityWeights,
    robustnessTests: ["repeated-run-determinism", "evidence-order-invariance", "irrelevant-evidence-resistance", "organization-isolation", "permission-isolation", "identifier-stability", "timestamp-control", "missing-evidence-handling", "malformed-input-handling", "contradiction-preservation", "stale-evidence-sensitivity", "outcome-driven-revision", "negative-controls", "holdout-cases", "benchmark-contamination-check"],
    classificationRules: [
      "A requires material advantage over every completed genuine baseline, no blocking guardrail failure, and holdout support.",
      "B requires a bounded material advantage on named dimensions or case types with no blocking guardrail failure.",
      "C means no material comparative advantage within benchmark resolution.",
      "D means a simpler approach materially outperforms Discovery without unacceptable guardrail failure.",
      "E means missing treatments, evaluator reliability, or evidence volume prevents a valid conclusion.",
      "F means preregistration, leakage, identity, safety, or implementation defects invalidate the experiment.",
    ],
    invalidationGates: ["ground-truth-mutated-after-output", "cross-treatment-evidence-inequivalence", "permission-leakage", "cross-organization-leakage", "treatment-reads-ground-truth", "post-hoc-weight-change", "selective-case-exclusion", "fixture-wording-reward", "repository-source-changed-during-run"],
    frozenAt: "2026-07-31T22:00:00.000Z",
  };
  await writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function verifyPreregistration(file: string): Promise<PreregistrationManifest> {
  const manifest = JSON.parse(await readFile(file, "utf8")) as PreregistrationManifest;
  const current = await implementationHashes();
  if (manifest.repositoryCommit !== execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim()) throw new Error("Preregistered repository commit changed.");
  if (JSON.stringify(manifest.fixtureHashes) !== JSON.stringify(current) || manifest.benchmarkImplementationHash !== sha(JSON.stringify(current))) throw new Error("Preregistered implementation or fixtures changed.");
  return manifest;
}

