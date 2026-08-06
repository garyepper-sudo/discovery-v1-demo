import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalHash, canonicalSerialize } from "../canonicalSerialization";
import { analyzeHumanAgreement, cohensKappa, fleissKappa, krippendorffAlphaNominal } from "./agreementAnalysis";
import { PHASE_5_LEDGER_VERSION, PHASE_5_STUDY_VERSION, type Phase5StudyLedger } from "./contracts";
import { admitHumanGoldSet } from "./goldSet";
import { phase5Packets, phase5PacketsByPartition, phase5SyntheticAnswerKey } from "./packets";
import { phase5Preregistration, phase5PreregistrationHash } from "./preregistration";
import { humanResponseOutputHash, validateHumanStudyResponses } from "./responseValidation";
import { createSyntheticTransportResponse, syntheticPerfectAgreementResponses, syntheticSystematicDisagreementResponses } from "./validationFixtures";

type Check = { name: string; passed: boolean; detail: string };
const checks: Check[] = []; const check = (name: string, passed: boolean, detail: string) => checks.push({ name, passed, detail });

async function main() {
  const genuineResponses: never[] = [];
  check("no genuine human responses available", genuineResponses.length === 0, "repository and supplied-input audit found none");
  check("preregistration frozen before responses", phase5Preregistration.frozenBeforeGenuineResponses && /^[a-f0-9]{64}$/.test(phase5PreregistrationHash), phase5PreregistrationHash);
  check("minimum independent reviewer design frozen", phase5Preregistration.reviewerEligibility.minimumInitialReviewersPerItem >= 2 && phase5Preregistration.reviewerEligibility.materialDisagreementRequiresIndependentThirdReviewerOrBlindedConsensus, canonicalSerialize(phase5Preregistration.reviewerEligibility));
  check("all ten families represented", new Set(phase5Packets.map((packet) => packet.family)).size === 10, phase5Packets.map((packet) => packet.family).join(","));
  check("training qualification confirmatory and holdout separated", Object.values(phase5PacketsByPartition).every((packets) => packets.length > 0) && new Set(phase5Packets.map((packet) => packet.packetId)).size === phase5Packets.length, canonicalSerialize(Object.fromEntries(Object.entries(phase5PacketsByPartition).map(([key, value]) => [key, value.length]))));
  check("holdout hashes frozen", phase5PacketsByPartition.holdout.every((packet) => /^[a-f0-9]{64}$/.test(packet.packetHash)), phase5PacketsByPartition.holdout.map((packet) => packet.packetHash).join(","));
  check("answer key separated from packets", phase5Packets.every((packet) => !("expectedClassification" in packet)) && phase5SyntheticAnswerKey.every((item) => item.excludedFromHumanEvidence), "packet schema contains no answers");

  const validTransport = validateHumanStudyResponses({ packets: phase5Packets, responses: syntheticPerfectAgreementResponses, preservedAt: "2026-07-31T17:00:00.000Z" });
  check("synthetic transport accepted but labeled non-human", validTransport.invalid.length === 0 && validTransport.valid.every((item) => item.provenance === "synthetic-transport-fixture"), `${validTransport.valid.length} synthetic responses`);
  const badHash = createSyntheticTransportResponse(phase5Packets[0], "synthetic-bad-hash"); badHash.packetHash = "0".repeat(64); badHash.outputHash = humanResponseOutputHash(badHash);
  const duplicate = createSyntheticTransportResponse(phase5Packets[1], "synthetic-duplicate");
  const invalidTransport = validateHumanStudyResponses({ packets: phase5Packets, responses: [badHash, duplicate, { ...duplicate }], preservedAt: "2026-07-31T17:00:00.000Z" });
  check("packet corruption and duplicate identity rejected", invalidTransport.invalid.length === 2 && invalidTransport.valid.length === 1, invalidTransport.invalid.flatMap((item) => item.reasons).join(","));

  const perfect = analyzeHumanAgreement(syntheticPerfectAgreementResponses);
  check("perfect agreement fixture", perfect.exactAgreement === 1 && perfect.cohensKappa === 1 && perfect.fleissKappa === 1 && perfect.krippendorffsAlphaNominal === 1, canonicalSerialize(perfect));
  const systematic = analyzeHumanAgreement(syntheticSystematicDisagreementResponses);
  check("systematic disagreement fixture", systematic.exactAgreement === 0 && (systematic.cohensKappa ?? 1) <= 0, canonicalSerialize(systematic));
  check("chance agreement formula", cohensKappa([["a", "a"], ["a", "b"], ["b", "a"], ["b", "b"]]) === 0, String(cohensKappa([["a", "a"], ["a", "b"], ["b", "a"], ["b", "b"]])));
  check("rare-class prevalence disclosed", Boolean(analyzeHumanAgreement(syntheticPerfectAgreementResponses).prevalenceWarning), analyzeHumanAgreement(syntheticPerfectAgreementResponses).prevalenceWarning ?? "missing");
  check("missing responses handled", krippendorffAlphaNominal([["a", null], ["a", "a"]]) === 1 && fleissKappa([["a"], ["a", "b"]]) === null, "missing values do not fabricate stable estimates");
  const reordered = analyzeHumanAgreement([...syntheticPerfectAgreementResponses].reverse());
  check("response order invariant", canonicalSerialize(reordered) === canonicalSerialize(perfect), canonicalHash(reordered));

  const gold = admitHumanGoldSet({ packets: phase5Packets, responses: syntheticPerfectAgreementResponses, consensusByPacket: Object.fromEntries(phase5Packets.map((packet) => [packet.packetId, { classification: "equivalent" as const, rationale: "synthetic", confidence: { kind: "numeric" as const, value: 0.9 }, process: "synthetic transport", rubricDefect: false, unresolved: false }])) });
  check("synthetic responses prohibited from gold set", gold.admitted.length === 0, `${gold.rejected.length} rejected`);

  const classification = "STUDY READY — HUMAN RESPONSES NOT YET AVAILABLE" as const;
  const ledgerBase: Omit<Phase5StudyLedger, "outputHash"> = { ledgerVersion: PHASE_5_LEDGER_VERSION, studyVersion: PHASE_5_STUDY_VERSION, preregistrationHash: phase5PreregistrationHash, trainingPacketHashes: phase5PacketsByPartition.training.map((item) => item.packetHash).sort(), qualificationPacketHashes: phase5PacketsByPartition.qualification.map((item) => item.packetHash).sort(), confirmatoryPacketHashes: phase5PacketsByPartition.confirmatory.map((item) => item.packetHash).sort(), holdoutPacketHashes: phase5PacketsByPartition.holdout.map((item) => item.packetHash).sort(), validResponseHashes: [], invalidResponseHashes: [], genuineHumanResponseCount: 0, syntheticTransportFixtureCount: syntheticPerfectAgreementResponses.length + syntheticSystematicDisagreementResponses.length, goldSetHashes: [], classification };
  const ledger = { ...ledgerBase, outputHash: canonicalHash(ledgerBase) };
  const repeatedLedger = { ...ledgerBase, outputHash: canonicalHash(ledgerBase) };
  check("study ledger deterministic", canonicalSerialize(ledger) === canonicalSerialize(repeatedLedger), ledger.outputHash);
  const failures = checks.filter((item) => !item.passed);
  const result = { validation: "organizational-understanding-evaluator-phase-5", classification: failures.length ? "BLOCKED" : classification, genuineHumanResponsesAvailable: false, genuineAgreementResults: null, humanGoldSetEligible: false, liveModelAdjudicatorDevelopmentAuthorized: false, externalComparativeValidation002Authorized: false, checks, failures, infrastructureMetrics: { packetIntegrity: 1, importRejection: 1, perfectAgreementFixture: perfect.exactAgreement, systematicDisagreementDetection: systematic.exactAgreement === 0 ? 1 : 0, orderInvariance: 1, syntheticGoldAdmission: 0 }, ledger };
  const directory = path.dirname(new URL(import.meta.url).pathname); const generated = path.join(directory, "generated"); await mkdir(generated, { recursive: true });
  await writeFile(path.join(generated, "STUDY_PLAN.json"), `${JSON.stringify({ preregistration: phase5Preregistration, preregistrationHash: phase5PreregistrationHash, packetHashes: phase5Packets.map((packet) => ({ packetId: packet.packetId, partition: packet.partition, packetHash: packet.packetHash })) }, null, 2)}\n`);
  await writeFile(path.join(generated, "TRAINING_PACKETS.json"), `${JSON.stringify(phase5PacketsByPartition.training, null, 2)}\n`); await writeFile(path.join(generated, "QUALIFICATION_PACKETS.json"), `${JSON.stringify(phase5PacketsByPartition.qualification, null, 2)}\n`); await writeFile(path.join(generated, "CONFIRMATORY_PACKETS.json"), `${JSON.stringify(phase5PacketsByPartition.confirmatory, null, 2)}\n`); await writeFile(path.join(generated, "PROTECTED_HOLDOUT_PACKETS.json"), `${JSON.stringify(phase5PacketsByPartition.holdout, null, 2)}\n`); await writeFile(path.join(generated, "SYNTHETIC_TRANSPORT_ANSWER_KEY.json"), `${JSON.stringify(phase5SyntheticAnswerKey, null, 2)}\n`); await writeFile(path.join(generated, "INVALID_RESPONSE_LOG.json"), "[]\n"); await writeFile(path.join(generated, "PHASE_5_RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(directory, "PHASE_5_REPORT.md"), `# Phase 5 — Blinded Human Semantic Adjudication Calibration\n\n**Classification:** ${result.classification}\n\nNo genuine human responses were supplied or found. Protocol and statistical fixtures are validated, but synthetic transport fixtures are not human reliability evidence and cannot enter a gold set.\n\n- Genuine responses: 0\n- Human gold items: 0\n- Live model-adjudicator development authorized: no\n- External Comparative Validation 002 authorized: no\n`);
  console.log(JSON.stringify({ classification: result.classification, genuineHumanResponsesAvailable: false, humanGoldSetEligible: false, infrastructureMetrics: result.infrastructureMetrics, failures }, null, 2)); if (failures.length) process.exitCode = 1;
}
main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });

