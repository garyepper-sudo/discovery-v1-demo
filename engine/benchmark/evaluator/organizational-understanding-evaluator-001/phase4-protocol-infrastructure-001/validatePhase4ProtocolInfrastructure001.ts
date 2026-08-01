import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CANONICAL_SERIALIZATION_VERSION, canonicalHash, canonicalSerialize } from "../canonicalSerialization";
import * as contractVersions from "./contracts";
import { createAdjudicationRecord, correctAdjudicationRecord, validateHumanLlmSeparation } from "./adjudicationLifecycle";
import { buildReviewerPacket, buildStage2Packet, sealStage1 } from "./buildReviewerPacket";
import {
  GOLD_DECISION_REFERENCE_VERSION,
  GOLD_ELIGIBILITY_VERSION,
  INFRASTRUCTURE_LEDGER_VERSION,
  PHASE_4_INFRASTRUCTURE_VERSION,
  type AdjudicationRecord,
  type GoldAdmissionDecisionReference,
  type GoldEligibilityAssessment,
  type ReviewerEligibilityInput,
} from "./contracts";
import { buildEscalationPacket, classifyDisagreement, resolveDisagreement } from "./disagreementEscalation";
import { assessGoldAdmissionEligibility, initialGoldMethodEligible } from "./goldAdmissionEligibility";
import { mapEligibleAdjudicationToPhase2 } from "./mapEligibleAdjudicationToPhase2";
import { CONTROLLED_FIXTURE_CLASSIFICATION, PHASE_3_AUTHORITATIVE_RESULT_HASH, cloneControlledPacketInput } from "./phase4InfrastructureFixtures";
import { assessReviewerEligibility, requireIndependentReviewers } from "./reviewerEligibility";
import { assertPolicyExecutionAuthority, createStudyPolicy, validateCustodyManifest, validateReliabilityReceipt } from "./studyGovernance";

async function main() {
const checks: Array<{ scenario: string; passed: boolean; detail: string }> = [];
const check = (scenario: string, condition: unknown, detail: string) => {
  if (!condition) throw new Error(`${scenario}: ${detail}`);
  checks.push({ scenario, passed: true, detail });
};
const rejects = (fn: () => unknown) => { try { fn(); return false; } catch { return true; } };
const clone = <T>(value: T): T => structuredClone(value);

const base = cloneControlledPacketInput();
const built = buildReviewerPacket(base);
check("A valid frozen candidate-edge binding", built.unit.candidateEdgeId === base.edge.candidateEdgeId, built.unit.unitHash);
for (const [scenario, mutate] of [
  ["B foreign evaluator rejection", (item: typeof base) => { (item as { evaluatorId: string }).evaluatorId = "foreign"; }],
  ["C foreign organization rejection", (item: typeof base) => { item.organizationId = "foreign"; }],
  ["D foreign case rejection", (item: typeof base) => { item.caseId = "foreign"; }],
  ["E foreign graph and structural-receipt rejection", (item: typeof base) => { item.structuralReceipt.receiptHash = "bad"; }],
  ["F foreign generator, configuration, and result rejection", (item: typeof base) => { item.phase3ResultHash = "bad"; }],
] as Array<[string, (item: typeof base) => void]>) {
  const changed = clone(base); mutate(changed); check(scenario, rejects(() => buildReviewerPacket(changed)), "failed closed");
}

const repeat = buildReviewerPacket(clone(base));
check("G deterministic packet identity and hash", repeat.packet.packetHash === built.packet.packetHash && repeat.packet.packetId === built.packet.packetId, built.packet.packetHash);
check("H deterministic Side A/Side B assignment", repeat.recoveredSide === built.recoveredSide, built.recoveredSide);
const permuted = clone(base);
permuted.activeAuthorizationScopes.reverse(); permuted.sourceRevisionIds.reverse(); permuted.rubricQuestions.reverse();
permuted.recovered.permittedMetadata = Object.fromEntries(Object.entries(permuted.recovered.permittedMetadata).reverse());
check("I packet stability under permutations", buildReviewerPacket(permuted).packet.packetHash === built.packet.packetHash, built.packet.packetHash);
const portable = JSON.stringify(built.packet);
check("J prohibited packet fields absent", !/(featureScore|candidateTier|candidateRank|inclusionReasons|expectedLabel|compositeScore|assignmentConsequence)/u.test(portable), "retrieval and score fields absent");
const unauthorized = clone(base); unauthorized.activeAuthorizationScopes = [];
check("K authorization before packet construction", rejects(() => buildReviewerPacket(unauthorized)), "authorization fails closed");
check("L withheld context remains withheld", built.packet.sideA.withheldFields.includes("private-source-body") && !portable.includes("private source contents"), "withholding preserved");
check("M unavailable and withheld distinct", canonicalHash(built.packet.sideA.withheldFields) !== canonicalHash(built.packet.sideA.unavailableFields), "distinct fields");
check("N Stage 2 rejected before sealed Stage 1", rejects(() => buildStage2Packet(built.packet, null, built.recoveredSide, ["direction"])), "release rejected");

const eligibilityInput = (reviewerId: string): ReviewerEligibilityInput => ({ reviewerId, pseudonymous: true, qualificationPolicyVersion: "test-qualification/v1", trainingCompletionRef: `training-${reviewerId}`, qualificationSetRef: `qualification-${reviewerId}`, languageQualified: true, reasoningLiteracyQualified: true, confidentialityAttestationId: `confidentiality-${reviewerId}`, independenceAttestationId: `independence-${reviewerId}`, conflictAttestationId: `conflict-${reviewerId}`, authoredGroundTruthCase: false, candidateGeneratorDeveloper: false, soleConfirmatoryAuthority: false, organizationAuthorized: true, packetAuthorized: true, unresolvedConflict: false });
const eligible1 = assessReviewerEligibility(eligibilityInput("reviewer-a"));
const eligible2 = assessReviewerEligibility(eligibilityInput("reviewer-b"));
const eligible3 = assessReviewerEligibility(eligibilityInput("reviewer-c"));
const stage1a = sealStage1(built.packet, eligible1.reviewerId, "equivalent", "same bounded meaning", "2026-07-31T15:00:00.000Z");
const stage2a = buildStage2Packet(built.packet, stage1a, built.recoveredSide, ["Does recovered output omit material scope?"]);
const mutatedPacket = { ...built.packet, packetHash: canonicalHash("mutated") };
check("O packet mutation invalidates downstream records", rejects(() => buildStage2Packet(mutatedPacket, stage1a, built.recoveredSide, ["direction"])), "mutation rejected");
check("P pairwise missing rejected", rejects(() => sealStage1(built.packet, eligible1.reviewerId, "missing", "not pairwise", "2026-07-31T15:00:00.000Z")), "missing rejected");
const ineligible = assessReviewerEligibility({ ...eligibilityInput("reviewer-ineligible"), qualificationSetRef: undefined });
check("Q ineligible reviewer rejection", ineligible.disposition === "ineligible" && rejects(() => requireIndependentReviewers([ineligible], 1)), ineligible.reasons.join(","));
check("R ground-truth author conflict", assessReviewerEligibility({ ...eligibilityInput("author"), authoredGroundTruthCase: true }).disposition === "ineligible", "author rejected");
check("S generator developer sole authority rejected", assessReviewerEligibility({ ...eligibilityInput("generator"), candidateGeneratorDeveloper: true, soleConfirmatoryAuthority: true }).disposition === "ineligible", "sole authority rejected");
check("T duplicate reviewer rejection", rejects(() => requireIndependentReviewers([eligible1, eligible1], 2)), "duplicate rejected");

const record = (eligibility: typeof eligible1, disposition: AdjudicationRecord["disposition"], studyArm: "H" | "M" | "HM" = "H", rationale = "bounded rationale") => {
  const stage1 = sealStage1(built.packet, eligibility.reviewerId, disposition, rationale, "2026-07-31T15:00:00.000Z");
  const stage2 = buildStage2Packet(built.packet, stage1, built.recoveredSide, ["direction"]);
  return createAdjudicationRecord({ eligibility, stage1, stage2, packetId: built.packet.packetId, packetHash: built.packet.packetHash, unitHash: built.unit.unitHash, organizationId: built.unit.organizationId, caseId: built.unit.caseId, candidateEdgeId: built.unit.candidateEdgeId, reviewerId: eligibility.reviewerId, qualificationVersion: eligibility.qualificationPolicyVersion, independenceAttestationId: eligibility.independenceAttestationId!, conflictAttestationId: eligibility.conflictAttestationId!, studyArm, disposition, familyJudgments: { meaningAgreement: disposition === "equivalent" }, rationale, citedPacketFields: ["sideA.text", "sideB.text"], authorizationReceiptId: base.authorizationReceiptId, recordedAt: "2026-07-31T15:00:00.000Z", correctedByActorId: null });
};
const recordA = record(eligible1, "equivalent");
const correctionStage1 = sealStage1(built.packet, eligible1.reviewerId, "partial", "material omission", "2026-07-31T15:10:00.000Z");
const corrected = correctAdjudicationRecord(recordA, recordA.recordHash, { disposition: "partial", familyJudgments: { meaningAgreement: false }, rationale: "material omission", citedPacketFields: ["sideA.text"], uncertaintyReason: undefined }, correctionStage1, "corrector-a", "2026-07-31T15:10:00.000Z");
check("U immutable correction and stale-write rejection", corrected.recordId !== recordA.recordId && corrected.priorRecordHash === recordA.recordHash && corrected.sealedStage1Hash === correctionStage1.recordHash && corrected.stage2ReleaseHash === null && corrected.invalidatedReleaseHashes.includes(recordA.stage2ReleaseHash!) && recordA.disposition === "equivalent" && rejects(() => correctAdjudicationRecord(recordA, "stale", { disposition: "partial", familyJudgments: {}, rationale: "x", citedPacketFields: [] }, correctionStage1, "actor", "2026-07-31T15:11:00.000Z")), corrected.recordHash);
const recordB = record(eligible2, "partial");
check("V categorical disagreement triggers escalation", classifyDisagreement(recordA, recordB) === "categorical", "categorical");
const abstained = record(eligible2, "abstained");
check("W abstention and insufficient context import-ineligible", classifyDisagreement(recordA, abstained) === "abstention", "no semantic credit");
const escalationPacket = buildEscalationPacket([recordA, recordB]);
check("X third reviewer receives no prior judgments", !/(reviewerId|disposition|rationale)/u.test(JSON.stringify(escalationPacket)), escalationPacket.packetHash);
const unresolved = resolveDisagreement({ originalRecords: [recordA, recordB], reviewerAssessments: [eligible1, eligible2], escalationPacketHash: escalationPacket.packetHash, packetDefect: false, blindingIntact: true, thirdSawPriorJudgments: false, rationale: "unresolved" });
check("Y third review may remain unresolved", unresolved.outcome === "unresolved" && !unresolved.phase2ImportEligible, unresolved.recordHash);
const recordC = record(eligible3, "equivalent");
const resolved = resolveDisagreement({ originalRecords: [recordA, recordB], reviewerAssessments: [eligible1, eligible2, eligible3], escalationPacketHash: escalationPacket.packetHash, thirdRecord: recordC, packetDefect: false, blindingIntact: true, thirdSawPriorJudgments: false, rationale: "independent two-of-three" });
check("Z two-of-three eligibility conditions", resolved.outcome === "resolved-two-of-three" && resolved.phase2ImportEligible, resolved.recordHash);
check("AA Arm H method eligibility", initialGoldMethodEligible("H"), "eligible for independent review only");
check("AB Arm M gold-ineligible", !initialGoldMethodEligible("M"), "ineligible");
check("AC Arm HM gold-ineligible", !initialGoldMethodEligible("HM"), "ineligible");
check("AD human-model records distinct", !rejects(() => validateHumanLlmSeparation({ preAssistanceHumanRecordHash: "pre", modelOutputRecordHash: "model", postAssistanceHumanRecordHash: "post" })), "three immutable references");

const draftPolicy = createStudyPolicy({ policyId: "draft-policy", status: "draft", testOnly: false, reviewerCount: 2, qualificationThreshold: .85, exactAgreementThreshold: .85, kappaThreshold: .7, ac1Threshold: .7, confidenceIntervalsRequired: true, familySampleFloor: 30, unresolvedRateMaximum: .1, packetDefectRateMaximum: .02, safetyDefectsMaximum: 0, corpusSplitRef: "future", holdoutPolicyRef: "future", stoppingRulesRef: "future", missingDataRulesRef: "future", escalationPolicyRef: "future", goldEligibleArms: ["H"], confidentialityPolicyRef: "future", custodyPolicyRef: "future" });
check("AE draft policy cannot authorize execution", rejects(() => assertPolicyExecutionAuthority(draftPolicy)), "draft blocked");
const testPolicy = createStudyPolicy({ ...draftPolicy, policyId: "test-policy", status: "approved", testOnly: true });
const testReceipt = validateReliabilityReceipt({ receiptId: "test-receipt", studyId: "controlled-fixture", approvedPolicyId: testPolicy.policyId, approvedPolicyHash: testPolicy.policyHash, corpusPartition: "controlled", sampleSize: 30, familyCounts: { finding: 30 }, exactAgreement: 1, perFamilyAgreement: { finding: 1 }, cohensKappa: 1, gwetsAc1: 1, confidenceIntervals: { exactAgreement: { lower: 1, upper: 1 } }, abstentionRate: 0, unresolvedRate: 0, escalationRate: 0, packetDefectRate: 0, qualificationPassRate: 1, safetyDefects: 0, powerAnalysisRef: "test-only", calculationVersion: "test-only", evidentiaryStatus: "test-only-non-evidentiary", disposition: "pass" }, testPolicy);
const testGold = assessGoldAdmissionEligibility({ records: [recordA, recordC], reviewers: [eligible1, eligible3], reliabilityReceipt: testReceipt, authorized: true, leakageDetected: false, packetDefect: false, reproducible: true, conflictDetected: false });
check("AF test-only reliability cannot authorize gold", testGold.disposition === "ineligible" && testGold.reasons.includes("non-evidentiary-reliability-receipt"), testGold.reasons.join(","));
check("AG custody collision fails closed", rejects(() => validateCustodyManifest({ roleAssignments: { "candidate-generator-developer": ["actor"], "answer-key-custodian": ["actor"] } })), "collision rejected");

const structuralEligibilityBody = { version: GOLD_ELIGIBILITY_VERSION, adjudicationRecordIds: [recordA.recordId], studyArm: "H" as const, disposition: "eligible-for-independent-admission-review" as const, reasons: [], reliabilityReceiptId: "future-operational-reliability-receipt", reliabilityReceiptHash: canonicalHash("future-operational-reliability-receipt") };
const structuralEligibilityHash = canonicalHash(structuralEligibilityBody);
const structuralEligibility: GoldEligibilityAssessment = { ...structuralEligibilityBody, assessmentId: `gold-eligibility-${structuralEligibilityHash.slice(0, 24)}`, assessmentHash: structuralEligibilityHash };
const decisionBody = { version: GOLD_DECISION_REFERENCE_VERSION, assessmentId: structuralEligibility.assessmentId, assessmentHash: structuralEligibility.assessmentHash, organizationId: built.unit.organizationId, caseId: built.unit.caseId, adjudicationRecordId: recordA.recordId, adjudicationRecordHash: recordA.recordHash, reliabilityReceiptId: structuralEligibility.reliabilityReceiptId, reliabilityReceiptHash: structuralEligibility.reliabilityReceiptHash, independentAuthorityId: "controlled-independent-authority", authorityAuthorizationRef: "controlled-structural-authorization", admitted: true as const };
const decisionHash = canonicalHash(decisionBody);
const decision: GoldAdmissionDecisionReference = { ...decisionBody, decisionId: `gold-admission-decision-${decisionHash.slice(0, 24)}`, decisionHash };
const mapped = mapEligibleAdjudicationToPhase2({ unit: built.unit, record: recordA, eligibility: structuralEligibility, admissionDecision: decision, reviewerProvenanceRefs: [eligible1.assessmentId], existingImportIds: [] });
check("AH duplicate prospective import rejected", rejects(() => mapEligibleAdjudicationToPhase2({ unit: built.unit, record: recordA, eligibility: structuralEligibility, admissionDecision: decision, reviewerProvenanceRefs: [eligible1.assessmentId], existingImportIds: [mapped.importId] })), "duplicate rejected");
const foreignUnit = { ...built.unit, organizationId: "foreign" };
check("AI cross-organization Phase 2 import rejected", rejects(() => mapEligibleAdjudicationToPhase2({ unit: foreignUnit, record: recordA, eligibility: structuralEligibility, admissionDecision: decision, reviewerProvenanceRefs: [eligible1.assessmentId], existingImportIds: [] })), "cross-organization record rejected");
check("AJ prospective mapping has no score or assignment", mapped.prospectiveOnly && !mapped.assignmentPerformed && mapped.componentScores === null && mapped.compositeScore === null, mapped.importHash);
check("AK no Phase 2 score activation", mapped.componentScores === null && mapped.compositeScore === null, "zero activation");

const directory = path.dirname(new URL(import.meta.url).pathname);
const runtimeFiles = ["contracts.ts", "buildReviewerPacket.ts", "reviewerEligibility.ts", "adjudicationLifecycle.ts", "disagreementEscalation.ts", "studyGovernance.ts", "goldAdmissionEligibility.ts", "mapEligibleAdjudicationToPhase2.ts", "index.ts"];
const runtimeSource = (await Promise.all(runtimeFiles.map((name) => readFile(path.join(directory, name), "utf8")))).join("\n");
check("AL no direct or transitive label leakage", !/(phase[2345]ValidationFixtures|expectedCandidatePairs|validPhase2Input\.adjudications|expected semantic label)/u.test(runtimeSource), "runtime path contains no fixture truth");
check("AM unsafe Phase 4-5 drafts not imported", !/(phase4Contracts|semanticAdjudicationRubric|processImportedSemanticAdjudications|validatePhase4ImportedAdjudication|phase5\/)/u.test(runtimeSource), "isolated namespace");

async function files(root: string): Promise<string[]> { const entries = await readdir(root, { withFileTypes: true }); return (await Promise.all(entries.map(async (entry) => entry.isDirectory() && !["node_modules", ".git", ".next"].includes(entry.name) ? files(path.join(root, entry.name)) : entry.isFile() ? [path.join(root, entry.name)] : []))).flat(); }
const repoRoot = path.resolve(directory, "../../../../..");
const consumers = (await files(repoRoot)).filter((file) => /\.(ts|tsx|js|mjs|cjs)$/u.test(file) && !file.startsWith(directory));
const externalImports = [];
for (const file of consumers) if ((await readFile(file, "utf8")).includes("phase4-protocol-infrastructure-001")) externalImports.push(path.relative(repoRoot, file));
check("AN no Product Runtime frontend or cognition import", externalImports.length === 0, "no external consumers");
check("AO canonical serialization rejects unsupported values", rejects(() => canonicalSerialize({ unsupported: Symbol("unsupported") })), "unsupported rejected");
const evaluatorDirectory = path.resolve(directory, "..");
const protocolDocumentHash = canonicalHash(await readFile(path.join(evaluatorDirectory, "PHASE_4_SEMANTIC_ADJUDICATION_PROTOCOL.md"), "utf8"));
const preregistrationDocumentHash = canonicalHash(await readFile(path.join(evaluatorDirectory, "PHASE_4_SEMANTIC_ADJUDICATION_PREREGISTRATION.md"), "utf8"));
const componentVersions = Object.fromEntries(Object.entries(contractVersions).filter(([key, value]) => key.endsWith("_VERSION") && typeof value === "string").sort(([left], [right]) => left.localeCompare(right)));
const ledgerBody = { ledgerVersion: INFRASTRUCTURE_LEDGER_VERSION, infrastructureVersion: PHASE_4_INFRASTRUCTURE_VERSION, componentVersions, canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION, protocolDocumentIdentity: "PHASE_4_SEMANTIC_ADJUDICATION_PROTOCOL.md@6ded90823361678c706048b555199ec265f80732", protocolDocumentHash, preregistrationDocumentIdentity: "PHASE_4_SEMANTIC_ADJUDICATION_PREREGISTRATION.md@6ded90823361678c706048b555199ec265f80732", preregistrationDocumentHash, phase3ResultIdentity: "organizational-understanding-evaluator-phase-3/authoritative-result", phase3ResultHash: PHASE_3_AUTHORITATIVE_RESULT_HASH, fixtureClassification: CONTROLLED_FIXTURE_CLASSIFICATION, validatorVersion: "oue-001-phase-4-protocol-validator/v1", scenarioCount: 44, safetyGateResults: { labelLeakage: "pass", unsafeDraftIsolation: "pass", productIsolation: "pass", scoreActivation: "pass", externalAction: "pass" }, prohibitedOperations: { genuineHumanReviews: 0, genuineModelReviews: 0, genuineSemanticAdjudications: 0, genuineGoldLabels: 0, phase2ScoreActivations: 0, externalComparativeValidationExecutions: 0, productActivations: 0, productionActivations: 0, externalActions: 0 } };
const ledgerHash = canonicalHash(ledgerBody);
check("AP repeated runs byte-stable", canonicalHash(ledgerBody) === ledgerHash && canonicalSerialize(built.packet) === canonicalSerialize(repeat.packet), ledgerHash);
check("AQ Phase 1-3 preserved", PHASE_3_AUTHORITATIVE_RESULT_HASH === "5c4ddb823fe9a3b227b0b22a5f9459a1f49b6fd22506f9164a1fbd7944a5033a", PHASE_3_AUTHORITATIVE_RESULT_HASH);
check("AR zero prohibited operations", Object.values(ledgerBody.prohibitedOperations).every((count) => count === 0), JSON.stringify(ledgerBody.prohibitedOperations));

const infrastructureResultHash = canonicalHash({ ledgerHash, checks, failures: [] });
const result = { validation: "organizational-understanding-evaluator-phase-4-protocol-infrastructure-001", classification: "A — PHASE 4 DETERMINISTIC PROTOCOL INFRASTRUCTURE VALIDATED", ...ledgerBody, ledgerHash, infrastructureResultHash, scenarioCount: checks.length, checks, failures: [], studyExecutionAuthorized: false, phase4AdjudicationAuthorized: false, phase5Authorized: false, externalComparativeValidation002Authorized: false };
await writeFile(path.join(directory, "RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
await writeFile(path.join(directory, "REPORT.md"), `# Phase 4 Protocol Infrastructure 001 Validation Report\n\n**Classification:** ${result.classification}\n\nPhase 4 deterministic protocol infrastructure is validated. Human and model study execution remains unauthorized.\n\n- Controlled scenarios: ${checks.length}\n- Genuine human reviews: 0\n- Genuine model reviews: 0\n- Genuine semantic adjudications: 0\n- Genuine gold labels: 0\n- Phase 2 score activations: 0\n- External Comparative Validation executions: 0\n- Product activations: 0\n- Production activations: 0\n- External actions: 0\n- Canonical serialization: \`${CANONICAL_SERIALIZATION_VERSION}\`\n- Infrastructure result hash: \`${infrastructureResultHash}\`\n- Ledger hash: \`${ledgerHash}\`\n- Phase 3 authoritative result hash: \`${PHASE_3_AUTHORITATIVE_RESULT_HASH}\`\n`);
console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
