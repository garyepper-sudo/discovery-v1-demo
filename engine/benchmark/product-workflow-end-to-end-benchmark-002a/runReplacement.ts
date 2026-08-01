import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../v3/runtime/organizationRuntimeRepository";
import { buildDurableProductQuestion, createDurableProductQuestion } from "../../../product/questions/questionLifecycle";
import { selectMaterialInformationAcquisition } from "../../../product/acquisition/shadow/selectMaterialInformationAcquisition";
import type { MaterialInformationAcquisitionResult } from "../../../product/acquisition/contracts";
import { buildBenchmarkCommunicationBrief, renderBenchmarkCommunication, verifyBenchmarkCommunication } from "../product-workflow-end-to-end-benchmark-001/communication";
import { replacementScenario } from "./replacementInput";

const selectedId = (result: MaterialInformationAcquisitionResult): string | null => result.kind === "selected-action" ? result.selected.candidateId : null;
const signature = (result: MaterialInformationAcquisitionResult): string => `${result.kind}:${selectedId(result) ?? "none"}:${result.explanation.rationale}:${result.explanation.alternativeCandidateIds.join(",")}`;
function communicationInput(input: { understanding: typeof replacementScenario.baselineUnderstanding; evidence: typeof replacementScenario.baselineEvidence }) {
  return { id: replacementScenario.id, question: replacementScenario.question, understanding: input.understanding, evidence: input.evidence, objective: replacementScenario.objective, optimizationContext: replacementScenario.optimizationContext, ambiguousFacts: replacementScenario.ambiguousFacts, withheld: replacementScenario.withheld, prohibitedRecommendations: replacementScenario.prohibitedRecommendations } as unknown as Parameters<typeof buildBenchmarkCommunicationBrief>[0];
}

export async function runReplacementScenario002A() {
  const directory = await mkdtemp(path.join(tmpdir(), "discovery-heldout-002a-"));
  try {
    const runtime = createEmptyOrganizationRuntime({ organizationId: replacementScenario.organizationId, name: "Cold-chain controlled holdout", industry: "Cold-chain logistics" });
    const created = createDurableProductQuestion({ runtime, title: replacementScenario.question.text, questionId: replacementScenario.question.id, createdAt: replacementScenario.deterministicClock });
    await new FilesystemOrganizationRuntimeRepository(directory).create(replacementScenario.organizationId, new TextEncoder().encode(JSON.stringify(created.runtime)), { requestId: "heldout-002a-create", operatorId: "benchmark:controlled-holdout" });
    const stored = await new FilesystemOrganizationRuntimeRepository(directory).read(replacementScenario.organizationId);
    const question = stored ? buildDurableProductQuestion({ runtime: stored.runtime, questionId: replacementScenario.question.id }) : null;
    if (!question || question.organizationId !== replacementScenario.organizationId || question.title !== replacementScenario.question.text) throw new Error("Replacement ProductQuestion failed independent reload.");
    if (replacementScenario.materialOutcome.organizationId !== replacementScenario.organizationId || !replacementScenario.materialOutcome.authorized || replacementScenario.materialOutcome.version !== 1 || !replacementScenario.materialOutcome.operationRef || replacementScenario.materialOutcome.lineage.length < 2) throw new Error("Material Outcome lineage is not exact and authorized.");
    if (replacementScenario.admittedEvidence.sourceOutcomeRef !== `${replacementScenario.materialOutcome.outcomeId}:v1` || replacementScenario.resultingInformation.sourceOutcomeRef !== `${replacementScenario.materialOutcome.outcomeId}:v1`) throw new Error("Outcome-to-information-to-Evidence lineage is broken.");
    const baseline = selectMaterialInformationAcquisition(structuredClone(replacementScenario.baselineInput));
    const materialOutcome = selectMaterialInformationAcquisition(structuredClone(replacementScenario.materialOutcomeInput));
    const unrelatedOutcome = selectMaterialInformationAcquisition(structuredClone(replacementScenario.unrelatedOutcomeInput));
    const baselineBrief = buildBenchmarkCommunicationBrief(communicationInput({ understanding: replacementScenario.baselineUnderstanding, evidence: replacementScenario.baselineEvidence }), baseline);
    const materialBrief = buildBenchmarkCommunicationBrief(communicationInput({ understanding: replacementScenario.revisedUnderstanding as typeof replacementScenario.baselineUnderstanding, evidence: [...replacementScenario.baselineEvidence, replacementScenario.admittedEvidence] }), materialOutcome);
    const unrelatedBrief = buildBenchmarkCommunicationBrief(communicationInput({ understanding: replacementScenario.baselineUnderstanding, evidence: replacementScenario.baselineEvidence }), unrelatedOutcome);
    const baselinePresentation = renderBenchmarkCommunication(baselineBrief);
    const materialPresentation = renderBenchmarkCommunication(materialBrief);
    const unrelatedPresentation = renderBenchmarkCommunication(unrelatedBrief);
    verifyBenchmarkCommunication(baselineBrief, baselinePresentation);
    verifyBenchmarkCommunication(materialBrief, materialPresentation);
    verifyBenchmarkCommunication(unrelatedBrief, unrelatedPresentation);
    const reorderedMaterial = selectMaterialInformationAcquisition({ ...replacementScenario.materialOutcomeInput, candidates: [...replacementScenario.materialOutcomeInput.candidates].reverse() });
    return { scenarioId: replacementScenario.id, scenarioHash: replacementScenario.scenarioHash, priorExposureCount: replacementScenario.priorExposureCount, questionReloaded: true as const, baseline: { selection: baseline, brief: baselineBrief, presentation: baselinePresentation }, materialOutcome: { outcome: replacementScenario.materialOutcome, resultingInformation: replacementScenario.resultingInformation, evidenceCandidacy: replacementScenario.evidenceCandidacy, admittedEvidence: replacementScenario.admittedEvidence, revisedUnderstanding: replacementScenario.revisedUnderstanding, selection: materialOutcome, brief: materialBrief, presentation: materialPresentation }, unrelatedOutcome: { outcome: replacementScenario.unrelatedOutcome, selection: unrelatedOutcome, brief: unrelatedBrief, presentation: unrelatedPresentation }, checks: { materialChanged: selectedId(baseline) !== selectedId(materialOutcome), unrelatedInvariant: signature(baseline) === signature(unrelatedOutcome) && baselineBrief.digest === unrelatedBrief.digest && baselinePresentation === unrelatedPresentation, inputOrderInvariant: signature(materialOutcome) === signature(reorderedMaterial), objectivePreserved: replacementScenario.baselineInput.purpose === replacementScenario.materialOutcomeInput.purpose, contextPreserved: JSON.stringify(replacementScenario.baselineInput.budgetContext) === JSON.stringify(replacementScenario.materialOutcomeInput.budgetContext), governancePreserved: replacementScenario.materialOutcomeInput.governanceContextRefs.join() === replacementScenario.baselineInput.governanceContextRefs.join(), authorizationPreserved: replacementScenario.materialOutcomeInput.authorizationContextRef === replacementScenario.baselineInput.authorizationContextRef } };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
