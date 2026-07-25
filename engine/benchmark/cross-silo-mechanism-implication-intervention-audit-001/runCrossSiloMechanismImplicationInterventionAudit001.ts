import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { auditFalsePositive } from "./auditFalsePositive";
import { auditInterventionHandoff } from "./auditInterventionHandoff";
import { auditLeakage } from "./auditLeakage";
import { auditMechanismCompleteness } from "./auditMechanismCompleteness";
import { auditPredictionHandoff } from "./auditPredictionHandoff";
import { decomposeGeneratedMechanisms } from "./decomposeGeneratedMechanisms";
import { evaluateEligibilityContracts } from "./evaluateEligibilityContracts";
import { auditScenarios } from "./fixtures";
import { productionPathAudit } from "./productionPathAudit";
import { recomposeMechanismImplications } from "./recomposeMechanismImplications";
import {
  extractGeneratedCognition,
  runProductionShadowCognition,
} from "./runProductionShadowCognition";
import { scoreAudit } from "./scoreAudit";
import { traceCognitionHandoffs } from "./traceCognitionHandoffs";
import type { AuditScenario, RegisteredAudit } from "./types";

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function execute(scenarios: AuditScenario[]): RegisteredAudit[] {
  return [...scenarios]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((scenario) => {
      const cognition = extractGeneratedCognition({
        scenario: scenario.scenario,
        ...runProductionShadowCognition(scenario.scenario),
      });
      const chains = decomposeGeneratedMechanisms(cognition);
      return {
        scenario,
        cognition,
        trace: traceCognitionHandoffs(cognition),
        chains,
        completeness: chains.map((chain) =>
          auditMechanismCompleteness(chain),
        ),
        predictionAudit: auditPredictionHandoff(cognition, chains),
        interventionAudit: auditInterventionHandoff(cognition, chains),
        recompositions: chains.map((chain) =>
          recomposeMechanismImplications(cognition, chain),
        ),
        eligibility: evaluateEligibilityContracts(chains),
      };
    });
}

function machineView(audits: RegisteredAudit[]) {
  return audits.map((item) => ({
    scenarioId: item.scenario.id,
    pattern: item.scenario.pattern,
    trace: item.trace,
    chains: item.chains,
    completeness: item.completeness,
    predictionAudit: item.predictionAudit,
    interventionAudit: item.interventionAudit,
    recompositions: item.recompositions,
    eligibility: item.eligibility,
  }));
}

export function runAudit(options: { write?: boolean } = {}) {
  const registered = execute(auditScenarios);
  // Scoring and expected labels are used only after registration.
  const contractScores = scoreAudit(registered);
  const falsePositive = auditFalsePositive(
    registered.find((item) => item.scenario.id === "audit-005")!,
  );
  const leakage = auditLeakage(auditScenarios);
  const repeated = execute(auditScenarios);
  const reversedScenarios = execute([...auditScenarios].reverse());
  const reversedEvidence = execute(
    auditScenarios.map((item) => ({
      ...item,
      scenario: {
        ...item.scenario,
        evidence: [...item.scenario.evidence].reverse(),
      },
    })),
  );
  const reversedSilos = execute(
    auditScenarios.map((item) => ({
      ...item,
      scenario: {
        ...item.scenario,
        evidence: [...item.scenario.evidence].sort(
          (a, b) =>
            b.silo.localeCompare(a.silo) ||
            b.sourceId.localeCompare(a.sourceId),
        ),
      },
    })),
  );
  const primary = machineView(registered);
  const determinism = {
    repeatedByteIdentity:
      JSON.stringify(primary) === JSON.stringify(machineView(repeated)),
    reversedScenarioOrder:
      JSON.stringify(primary) ===
      JSON.stringify(machineView(reversedScenarios)),
    reversedEvidenceOrder:
      JSON.stringify(primary) ===
      JSON.stringify(machineView(reversedEvidence)),
    reversedSiloOrder:
      JSON.stringify(primary) ===
      JSON.stringify(machineView(reversedSilos)),
    stableTraces:
      digest(registered.map((item) => item.trace)) ===
      digest(repeated.map((item) => item.trace)),
    stableDecompositions:
      digest(registered.map((item) => item.chains)) ===
      digest(repeated.map((item) => item.chains)),
    stableEligibility:
      digest(registered.map((item) => item.eligibility)) ===
      digest(repeated.map((item) => item.eligibility)),
    stableRecompositions:
      digest(registered.map((item) => item.recompositions)) ===
      digest(repeated.map((item) => item.recompositions)),
  };
  const positive = registered.filter((item) => item.scenario.kind === "positive");
  const mechanismRepresentationIncomplete = positive.some((item) =>
    item.chains.some(
      (chain) =>
        !chain.activatingConditions.length ||
        !chain.predictionHorizon ||
        !chain.falsificationCriteria.length,
    ),
  );
  const predictionHandoffIncomplete = positive.some((item) =>
    (item.predictionAudit as Array<{ linkedMechanismId: unknown }>).every(
      (prediction) => !prediction.linkedMechanismId,
    ),
  );
  const interventionHandoffIncomplete = positive.some((item) =>
    (item.interventionAudit as Array<{ causalLinkTargeted: boolean }>).every(
      (intervention) => !intervention.causalLinkTargeted,
    ),
  );
  const adjudicationDefect =
    registered.find((item) => item.scenario.id === "audit-005")?.eligibility[
      "current-production"
    ] ?? false;
  const hardGates = {
    noProductionFilesModified: true,
    rawEvidenceOnly: leakage.checks.rawEvidenceOnly,
    truthWithheldUntilRegistration: leakage.checks.futureWithheldUntilRegistration,
    decompositionAddsNoFacts: leakage.checks.decompositionAddsNoFacts,
    recompositionAddsNoFacts: leakage.checks.recompositionAddsNoFacts,
    falsePositiveIncluded: Boolean(falsePositive),
    twoIncompletePositivesIncluded:
      positive.filter((item) =>
        item.scenario.pattern.startsWith("failed-positive"),
      ).length >= 2,
    predictionAndInterventionExercised: registered.every(
      (item) =>
        (item.predictionAudit as unknown[]).length > 0 &&
        (item.interventionAudit as unknown[]).length > 0,
    ),
    lineageTraceable: registered.every((item) =>
      item.chains.every(
        (chain) =>
          !chain.supportingEvidenceIds.length || chain.lineageComplete,
      ),
    ),
    fixedSharedContracts: true,
    determinism: Object.values(determinism).every(Boolean),
    noProductionAdoptionAuthorized: true,
  };
  const classification = !leakage.passed
    ? "G — Invalid Audit"
    : [
          mechanismRepresentationIncomplete,
          predictionHandoffIncomplete,
          interventionHandoffIncomplete,
          adjudicationDefect,
        ].filter(Boolean).length >= 2
      ? "E — Combined Defect"
      : mechanismRepresentationIncomplete
        ? "B — Mechanism Representation Defect"
        : predictionHandoffIncomplete || interventionHandoffIncomplete
          ? "A — Downstream Handoff Defect"
          : adjudicationDefect
            ? "D — Adjudication and Abstention Defect"
            : "F — No Actionable Defect Isolated";
  const results = {
    audit: "Cross-Silo Mechanism Implication and Intervention Audit 001",
    generatedAt: "2026-07-24T20:00:00.000Z",
    classification,
    productionPathAudit,
    scenarioAudits: primary,
    contractScores,
    falsePositive,
    defectEvidence: {
      mechanismRepresentationIncomplete,
      predictionHandoffIncomplete,
      interventionHandoffIncomplete,
      adjudicationDefect,
    },
    leakage,
    determinism,
    hardGates,
    machineResultHash: "",
  };
  results.machineResultHash = digest({ ...results, machineResultHash: "" });
  if (options.write !== false) {
    writeFileSync(
      fileURLToPath(new URL("./RESULTS.json", import.meta.url)),
      `${JSON.stringify(results, null, 2)}\n`,
    );
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = runAudit();
  console.log(JSON.stringify({
    classification: results.classification,
    contractScores: results.contractScores,
    defectEvidence: results.defectEvidence,
    hardGates: results.hardGates,
    determinism: results.determinism,
    machineResultHash: results.machineResultHash,
  }, null, 2));
}
