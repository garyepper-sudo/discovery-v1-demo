import fs from "node:fs";
import { depsPaths } from "./depsPaths.mjs";
import { comparePerformanceReports } from "./comparePerformanceReports.mjs";

function list(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function evidenceSuffix(evidenceRefs) {
  return `Evidence: ${evidenceRefs.map((ref) => `\`${ref}\``).join(", ")}`;
}

function renderObservations(observations, nameKey, detailKey) {
  return observations
    .map(
      (entry) =>
        `### ${entry[nameKey] ?? entry.category ?? entry.state}\n\n` +
        `**${entry.state}** — ${entry[detailKey]}\n\n` +
        `${evidenceSuffix(entry.evidenceRefs)}`,
    )
    .join("\n\n");
}

export function renderPerformanceReport(options = {}) {
  const { catalog, manifest, comparison } = comparePerformanceReports(options);
  const sourceById = new Map(catalog.sources.map((source) => [source.id, source]));
  const decision = manifest.engineeringDecision.accept ? "ACCEPT" : "REJECT";
  const scorecardComparison = new Map(
    (comparison?.scorecard ?? []).map((entry) => [entry.metric, entry]),
  );

  return `# Discovery Engineering Report

═══════════════════════════════

## Sprint

**Report:** ${manifest.title}
**Sprint:** ${manifest.sprint.name}
**Status:** ${manifest.sprint.classification}
**Overall engineering disposition:** ${decision}
**Report version:** ${manifest.reportVersion}
**Generation timestamp:** ${manifest.generationTimestamp}
**Repository revision:** \`${manifest.sprint.repositoryRevision}\`
**Worktree state:** ${manifest.sprint.worktreeState}

${manifest.sprint.scope}

## Trend References

- Baseline: \`${manifest.trend.baselineReference}\`
- Previous compatible report: ${manifest.trend.previousCompatibleReport ? `\`${manifest.trend.previousCompatibleReport}\`` : "None — this is DEPS Baseline v1"}
- Current report: \`${manifest.trend.currentReport}\`
- Comparability cohort: \`${manifest.trend.comparabilityCohort}\`

No synthetic history or historical score is created.

${comparison ? `Compatibility confirmed: schema ${comparison.comparability.schemaVersion}, cohort \`${comparison.comparability.cohort}\`.` : ""}

═══════════════════════════════

## Discovery Scorecard

${manifest.scorecard
  .map((entry) => {
    const previousState = scorecardComparison.get(entry.metric)?.predecessorState;
    return (
      `### ${entry.metric}\n\n` +
      `**${entry.state}** — ${entry.rationale}\n\n` +
      `${comparison ? `Previous report state: **${previousState ?? "Not present"}**\n\n` : ""}` +
      `${evidenceSuffix(entry.evidenceRefs)}`
    );
  })
  .join("\n\n")}

No new Scorecard metrics or numerical movement are computed.

═══════════════════════════════

## Architecture

${renderObservations(manifest.architecture, "area", "observation")}

═══════════════════════════════

## Benchmarks

${manifest.benchmarks
  .map((benchmark) => {
    const source = sourceById.get(benchmark.sourceId);
    const outputs = source.authoritativeOutputs
      .map((output) => `\`${output}\``)
      .join(", ");
    return (
      `### ${source.purpose}\n\n` +
      `**Result:** ${benchmark.result}\n\n` +
      `${comparison ? `**Movement:** ${benchmark.movement}\n\n**Previous:** ${benchmark.previousResult}\n\n**Current:** ${benchmark.result}\n\n` : ""}` +
      `${benchmark.summary}\n\n` +
      `${evidenceSuffix(benchmark.evidenceRefs)}\n\n` +
      `Authoritative outputs: ${outputs}`
    );
  })
  .join("\n\n")}

Native reports remain authoritative; DEPS references rather than duplicates
their results.

═══════════════════════════════

## Research

${renderObservations(manifest.researchObservations, "area", "observation")}

═══════════════════════════════

## Complexity

### Introduced

${list(manifest.complexity.introduced)}

### Removed

${list(manifest.complexity.removed)}

**Net effect:** ${manifest.complexity.netEffect}
**Justified:** ${manifest.complexity.justified ? "Yes" : "No"}

${manifest.complexity.justification}

${evidenceSuffix(manifest.complexity.evidenceRefs)}

═══════════════════════════════

## Governance

${renderObservations(manifest.governanceObservations, "area", "observation")}

## System Sustainability

${renderObservations(manifest.sustainabilityObservations, "area", "observation")}

═══════════════════════════════

## Regression

${renderObservations(manifest.regressions, "area", "observation")}

### Unknown and Unmeasured Areas

${manifest.unknownsAndUnmeasured
  .map(
    (unknown) =>
      `- **${unknown.area}: ${unknown.state}.** ${unknown.reason}`,
  )
  .join("\n")}

### Rollback

**Available.** ${manifest.rollback.description}

${evidenceSuffix(manifest.rollback.evidenceRefs)}

${comparison ? `### Remaining Architectural Risks

- **Next blocking dependency:** ${comparison.remainingRisks.nextBlockingDependency}
- **Remaining Discovery phase:** ${comparison.remainingRisks.remainingDiscoveryPhase}
- **Remaining benchmark gap:** ${comparison.remainingRisks.remainingBenchmarkGap}
` : ""}

═══════════════════════════════

## Engineering Decision

**${decision}**

${manifest.engineeringDecision.rationale}

${evidenceSuffix(manifest.engineeringDecision.evidenceRefs)}

---

This report is a DEPS summary. Native benchmarks, validators, research
artifacts, and canonical documentation remain authoritative.
`;
}

export function renderTerminalSummary(options = {}) {
  const { comparison, manifest } = comparePerformanceReports(options);

  if (!comparison) {
    return `══════════════════════════════════════
DISCOVERY ENGINEERING REPORT
══════════════════════════════════════
Baseline established: ${manifest.title}
No compatible predecessor exists.
══════════════════════════════════════`;
  }

  const scorecard = comparison.scorecard
    .map((entry) => `${entry.symbol} ${entry.metric}: ${entry.state}`)
    .join("\n");
  const architecture = comparison.architecture
    .map((entry) => `${entry.symbol} ${entry.area}: ${entry.state}`)
    .join("\n");
  const benchmarks = comparison.benchmarks
    .map(
      (entry) =>
        `${entry.symbol} ${entry.sourceId}: ${entry.previousResult} → ${entry.result}`,
    )
    .join("\n");
  const regressions = comparison.regressions
    .map(
      (entry) =>
        `${entry.category ?? "reported"}: ${entry.state} — ${entry.observation}`,
    )
    .join("\n");

  return `══════════════════════════════════════
DISCOVERY ENGINEERING REPORT
══════════════════════════════════════
Compared against
${comparison.predecessor.title}

Discovery Scorecard
${scorecard}

Architecture
${architecture}

Benchmarks
${benchmarks}

Complexity
Net: ${comparison.complexity.netEffect}
Justified: ${comparison.complexity.justified ? "Yes" : "No"}

Regression
${regressions}

Next Discovery Phase
${comparison.remainingRisks.remainingDiscoveryPhase}
══════════════════════════════════════`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const output = renderPerformanceReport();

  if (process.argv.includes("--stdout")) {
    process.stdout.write(output);
  } else {
    fs.writeFileSync(depsPaths.markdownReport, output, "utf8");
    console.log(renderTerminalSummary());
    console.log("");
    console.log(`DEPS report generated: ${depsPaths.markdownReport}`);
  }
}
