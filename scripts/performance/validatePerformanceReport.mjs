import fs from "node:fs";
import path from "node:path";
import { depsPaths, projectRoot } from "./depsPaths.mjs";

const allowedStates = new Set([
  "Improved",
  "Regressed",
  "Unchanged",
  "Not Measured",
]);

const requiredScorecardMetrics = [
  "Organizational Understanding",
  "User Intelligence",
  "Collective Intelligence",
  "Governance Integrity",
  "System Sustainability",
];

function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} does not exist: ${filePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `${label} is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function requireNonEmptyString(value, label, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label} must be a non-empty string.`);
  }
}

function validateArtifact(artifact, label, errors) {
  requireNonEmptyString(artifact, label, errors);

  if (
    typeof artifact === "string" &&
    artifact !== "git diff --check process result" &&
    !fs.existsSync(path.join(projectRoot, artifact))
  ) {
    errors.push(`${label} does not resolve to a repository artifact: ${artifact}`);
  }
}

function validateObservation(
  observation,
  label,
  evidenceIds,
  errors,
  options = {},
) {
  if (!allowedStates.has(observation?.state)) {
    errors.push(`${label}.state must be an allowed DEPS state.`);
  }

  if (options.requireEvidence !== false) {
    if (
      !Array.isArray(observation?.evidenceRefs) ||
      observation.evidenceRefs.length === 0
    ) {
      errors.push(`${label} must reference authoritative evidence.`);
    } else {
      for (const evidenceRef of observation.evidenceRefs) {
        if (!evidenceIds.has(evidenceRef)) {
          errors.push(`${label} references unknown evidence: ${evidenceRef}`);
        }
      }
    }
  }

  const explanation =
    observation?.rationale ?? observation?.observation ?? observation?.reason;
  requireNonEmptyString(explanation, `${label} explanation`, errors);
}

export function validatePerformanceReport({
  catalogPath = depsPaths.catalog,
  manifestPath = depsPaths.manifest,
} = {}) {
  const catalog = loadJson(catalogPath, "DEPS measurement source catalog");
  const manifest = loadJson(manifestPath, "DEPS performance report manifest");
  const errors = [];

  requireNonEmptyString(catalog.catalogId, "catalogId", errors);
  requireNonEmptyString(catalog.version, "catalog.version", errors);

  if (!Array.isArray(catalog.sources) || catalog.sources.length === 0) {
    errors.push("Catalog must contain measurement sources.");
  }

  const sourceIds = new Set();
  for (const [index, source] of (catalog.sources ?? []).entries()) {
    const label = `catalog.sources[${index}]`;
    for (const field of [
      "id",
      "purpose",
      "domain",
      "owner",
      "determinism",
      "baselineCompatibility",
      "maturity",
    ]) {
      requireNonEmptyString(source?.[field], `${label}.${field}`, errors);
    }

    if (sourceIds.has(source?.id)) {
      errors.push(`Duplicate measurement source id: ${source.id}`);
    }
    sourceIds.add(source?.id);

    if (
      !Array.isArray(source?.authoritativeOutputs) ||
      source.authoritativeOutputs.length === 0
    ) {
      errors.push(`${label} must declare authoritative outputs.`);
    } else {
      for (const [outputIndex, output] of source.authoritativeOutputs.entries()) {
        validateArtifact(
          output,
          `${label}.authoritativeOutputs[${outputIndex}]`,
          errors,
        );
      }
    }
  }

  for (const field of [
    "schemaVersion",
    "reportVersion",
    "generationTimestamp",
    "reportId",
    "title",
    "status",
    "disposition",
  ]) {
    requireNonEmptyString(manifest?.[field], `manifest.${field}`, errors);
  }

  for (const field of [
    "name",
    "classification",
    "repositoryRevision",
    "worktreeState",
    "scope",
  ]) {
    requireNonEmptyString(manifest?.sprint?.[field], `manifest.sprint.${field}`, errors);
  }

  if (manifest?.trend?.currentReport !== manifest?.reportId) {
    errors.push("Current report reference must identify the selected report.");
  }
  requireNonEmptyString(
    manifest?.trend?.baselineReference,
    "manifest.trend.baselineReference",
    errors,
  );
  requireNonEmptyString(
    manifest?.trend?.comparabilityCohort,
    "manifest.trend.comparabilityCohort",
    errors,
  );

  let predecessor = null;
  if (manifest?.trend?.previousCompatibleReport !== null) {
    requireNonEmptyString(
      manifest?.trend?.previousCompatibleReport,
      "manifest.trend.previousCompatibleReport",
      errors,
    );
    requireNonEmptyString(
      manifest?.trend?.previousCompatibleReportPath,
      "manifest.trend.previousCompatibleReportPath",
      errors,
    );

    if (typeof manifest?.trend?.previousCompatibleReportPath === "string") {
      const predecessorPath = path.join(
        projectRoot,
        manifest.trend.previousCompatibleReportPath,
      );
      predecessor = loadJson(predecessorPath, "DEPS compatible predecessor");

      if (predecessor?.reportId !== manifest.trend.previousCompatibleReport) {
        errors.push(
          "Compatible predecessor id does not match previousCompatibleReport.",
        );
      }
      if (predecessor?.schemaVersion !== manifest.schemaVersion) {
        errors.push("Current and predecessor report schema versions are incompatible.");
      }
      if (
        predecessor?.trend?.comparabilityCohort !==
        manifest.trend.comparabilityCohort
      ) {
        errors.push("Current and predecessor comparability cohorts do not match.");
      }
      if (manifest?.trend?.baselineReference !== predecessor?.trend?.baselineReference) {
        errors.push("Current and predecessor baseline references do not match.");
      }
    }
  } else if (
    manifest?.trend?.baselineReference !== manifest?.reportId ||
    manifest?.trend?.previousCompatibleReportPath !== undefined
  ) {
    errors.push(
      "A baseline report must reference itself and omit a predecessor path.",
    );
  }

  const evidenceIds = new Set();
  for (const [index, evidence] of (manifest.evidence ?? []).entries()) {
    const label = `manifest.evidence[${index}]`;
    for (const field of ["id", "sourceId", "artifact", "claimBoundary"]) {
      requireNonEmptyString(evidence?.[field], `${label}.${field}`, errors);
    }
    if (evidenceIds.has(evidence?.id)) {
      errors.push(`Duplicate evidence id: ${evidence.id}`);
    }
    evidenceIds.add(evidence?.id);
    if (!sourceIds.has(evidence?.sourceId)) {
      errors.push(`${label} references unknown source: ${evidence?.sourceId}`);
    }
    validateArtifact(evidence?.artifact, `${label}.artifact`, errors);
  }

  const actualMetrics = (manifest.scorecard ?? []).map((entry) => entry.metric);
  if (
    actualMetrics.length !== requiredScorecardMetrics.length ||
    requiredScorecardMetrics.some(
      (metric, index) => actualMetrics[index] !== metric,
    )
  ) {
    errors.push(
      "Scorecard must contain exactly the five canonical metrics in canonical order.",
    );
  }

  for (const [index, observation] of (manifest.scorecard ?? []).entries()) {
    validateObservation(
      observation,
      `manifest.scorecard[${index}]`,
      evidenceIds,
      errors,
    );
  }

  for (const section of [
    "architecture",
    "researchObservations",
    "governanceObservations",
    "sustainabilityObservations",
    "regressions",
  ]) {
    if (!Array.isArray(manifest?.[section]) || manifest[section].length === 0) {
      errors.push(`manifest.${section} must be explicit and non-empty.`);
      continue;
    }
    for (const [index, observation] of manifest[section].entries()) {
      validateObservation(
        observation,
        `manifest.${section}[${index}]`,
        evidenceIds,
        errors,
      );
    }
  }

  if (!Array.isArray(manifest.benchmarks) || manifest.benchmarks.length === 0) {
    errors.push("manifest.benchmarks must reference executed benchmark evidence.");
  }
  for (const [index, benchmark] of (manifest.benchmarks ?? []).entries()) {
    const label = `manifest.benchmarks[${index}]`;
    requireNonEmptyString(benchmark?.sourceId, `${label}.sourceId`, errors);
    requireNonEmptyString(benchmark?.result, `${label}.result`, errors);
    requireNonEmptyString(benchmark?.summary, `${label}.summary`, errors);
    if (!sourceIds.has(benchmark?.sourceId)) {
      errors.push(`${label} references unknown source: ${benchmark?.sourceId}`);
    }

    if (predecessor) {
      if (!allowedStates.has(benchmark?.movement)) {
        errors.push(`${label}.movement must be an allowed DEPS state.`);
      }
      requireNonEmptyString(
        benchmark?.previousResult,
        `${label}.previousResult`,
        errors,
      );

      const previousBenchmark = predecessor.benchmarks?.find(
        (entry) => entry.sourceId === benchmark?.sourceId,
      );
      if (
        !previousBenchmark &&
        !(
          benchmark?.previousResult === "Not Measured" &&
          benchmark?.movement === "Improved"
        )
      ) {
        errors.push(
          `${label} has no matching predecessor benchmark for ${benchmark?.sourceId}.`,
        );
      } else if (
        previousBenchmark &&
        previousBenchmark.result !== benchmark?.previousResult
      ) {
        errors.push(
          `${label}.previousResult does not match the authoritative predecessor.`,
        );
      }
    }
    if (!Array.isArray(benchmark?.evidenceRefs) || benchmark.evidenceRefs.length === 0) {
      errors.push(`${label} must reference native evidence.`);
    } else {
      for (const evidenceRef of benchmark.evidenceRefs) {
        if (!evidenceIds.has(evidenceRef)) {
          errors.push(`${label} references unknown evidence: ${evidenceRef}`);
        }
      }
    }
  }

  if (
    !Array.isArray(manifest.unknownsAndUnmeasured) ||
    manifest.unknownsAndUnmeasured.length === 0
  ) {
    errors.push("Unknown and unmeasured areas must be explicit.");
  }
  for (const [index, unknown] of (manifest.unknownsAndUnmeasured ?? []).entries()) {
    validateObservation(
      unknown,
      `manifest.unknownsAndUnmeasured[${index}]`,
      evidenceIds,
      errors,
      { requireEvidence: false },
    );
    if (unknown?.state !== "Not Measured") {
      errors.push(
        `manifest.unknownsAndUnmeasured[${index}] must use Not Measured.`,
      );
    }
  }

  const complexity = manifest.complexity;
  if (
    !Array.isArray(complexity?.introduced) ||
    !Array.isArray(complexity?.removed)
  ) {
    errors.push("Complexity introduced and removed must both be explicit arrays.");
  }
  requireNonEmptyString(complexity?.netEffect, "manifest.complexity.netEffect", errors);
  requireNonEmptyString(
    complexity?.justification,
    "manifest.complexity.justification",
    errors,
  );
  if (complexity?.netEffect === "Increased") {
    if (complexity?.justified !== true) {
      errors.push("Increased complexity must be explicitly justified.");
    }
    if (!Array.isArray(complexity?.evidenceRefs) || complexity.evidenceRefs.length === 0) {
      errors.push("Increased complexity must reference evidence.");
    }
  }
  for (const evidenceRef of complexity?.evidenceRefs ?? []) {
    if (!evidenceIds.has(evidenceRef)) {
      errors.push(`Complexity references unknown evidence: ${evidenceRef}`);
    }
  }

  if (manifest?.rollback?.available !== true) {
    errors.push("Rollback evidence must be available.");
  }
  requireNonEmptyString(
    manifest?.rollback?.description,
    "manifest.rollback.description",
    errors,
  );
  if (
    !Array.isArray(manifest?.rollback?.evidenceRefs) ||
    manifest.rollback.evidenceRefs.length === 0
  ) {
    errors.push("Rollback must reference authoritative evidence.");
  }
  for (const evidenceRef of manifest?.rollback?.evidenceRefs ?? []) {
    if (!evidenceIds.has(evidenceRef)) {
      errors.push(`Rollback references unknown evidence: ${evidenceRef}`);
    }
  }

  if (typeof manifest?.engineeringDecision?.accept !== "boolean") {
    errors.push("Engineering decision must explicitly accept or reject.");
  }
  requireNonEmptyString(
    manifest?.engineeringDecision?.rationale,
    "manifest.engineeringDecision.rationale",
    errors,
  );
  if (
    !Array.isArray(manifest?.engineeringDecision?.evidenceRefs) ||
    manifest.engineeringDecision.evidenceRefs.length === 0
  ) {
    errors.push("Engineering decision must reference evidence.");
  }
  for (const evidenceRef of manifest?.engineeringDecision?.evidenceRefs ?? []) {
    if (!evidenceIds.has(evidenceRef)) {
      errors.push(`Engineering decision references unknown evidence: ${evidenceRef}`);
    }
  }

  if (predecessor) {
    for (const field of [
      "nextBlockingDependency",
      "remainingDiscoveryPhase",
      "remainingBenchmarkGap",
    ]) {
      requireNonEmptyString(
        manifest?.remainingRisks?.[field],
        `manifest.remainingRisks.${field}`,
        errors,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`DEPS validation failed:\n- ${errors.join("\n- ")}`);
  }

  return {
    catalog,
    manifest,
    predecessor,
    sourceCount: sourceIds.size,
    evidenceCount: evidenceIds.size,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validatePerformanceReport();
  console.log(
    `DEPS validation passed: ${result.sourceCount} sources, ${result.evidenceCount} evidence references, 5 Scorecard observations.`,
  );
}
