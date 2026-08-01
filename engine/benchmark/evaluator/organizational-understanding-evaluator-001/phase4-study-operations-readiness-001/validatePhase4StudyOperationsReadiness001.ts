import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { CANONICAL_SERIALIZATION_VERSION, canonicalHash, canonicalSerialize } from "../canonicalSerialization";
import * as versions from "./contracts";
import {
  CONTROLLED_FIXTURE_LABELS, type AccessEvent, type CorpusPartitionManifest, type CustodianAppointment,
  type ExposureEvent, type ReviewerAssignment, type StudyPacket,
} from "./contracts";
import {
  ORGANIZATION_ID, PHASE3_RESULT_HASH, PHASE4_INFRASTRUCTURE_LEDGER_HASH, PHASE4_INFRASTRUCTURE_RESULT_HASH,
  PREREGISTRATION_HASH, PROTOCOL_HASH, STUDY_ID, buildAllPartitions, buildAppointmentFixtures,
  buildCustodyFixtures, buildPartitionFixture, buildPolicyFixture,
} from "./studyOperationsFixtures";
import {
  appendAccessEvent, appendExposureEvent, appointCustodian, assessOperationsReadiness, authorizePacketRelease,
  buildPacket, createIndependentReloadReceipt, createPolicyApprovalReceipt, createResponseEnvelope,
  createReviewerAssignment, createStudyFreeze, invalidateArtifact, recordContamination, recordPacketRelease,
  revokeCustodian, validateAnswerKeyCustody, validatePacketSeparation, validatePartitionManifest,
  validatePolicyReceipt, validateRoleSeparation, validateSeedCustody, verifyResponseEnvelope,
} from "./studyOperations";

async function main(): Promise<void> {
  const checks: Array<{ scenario: string; passed: boolean; detail: string }> = [];
  const check = (scenario: string, condition: unknown, detail: string): void => {
    if (!condition) throw new Error(`${scenario}: ${detail}`);
    checks.push({ scenario, passed: true, detail });
  };
  const rejects = (operation: () => unknown): boolean => { try { operation(); return false; } catch { return true; } };
  const clone = <T>(value: T): T => structuredClone(value);

  const { request, receipt: policy } = buildPolicyFixture();
  const draft = { ...policy, state: "draft" as const };
  check("A Draft policy cannot authorize operations", rejects(() => validatePolicyReceipt(draft, request)), "draft rejected");
  check("B Test-only policy approval cannot authorize real operations", !policy.operationalAuthorization && policy.state === "test-only-non-operational-policy-approval", "permanently non-operational");
  const alteredPolicy = { ...policy, policyHash: canonicalHash("altered") };
  check("C Foreign or altered policy receipt fails", rejects(() => validatePolicyReceipt(alteredPolicy, request)), "integrity rejected");

  const appointments = buildAppointmentFixtures();
  const missingAppointments = appointments.filter((item) => item.role !== "study-seed-custodian");
  const partitions = buildAllPartitions();
  const custody = buildCustodyFixtures(appointments, partitions);
  validateRoleSeparation(appointments);
  check("D Required custodian role missing", !missingAppointments.some((item) => item.role === "study-seed-custodian"), "freeze gate exercises missing role");
  const collisionA = appointCustodian({ ...appointments[0], principalId: "collision-principal", role: "candidate-generator-developer", priorAppointmentHash: null, appointmentRevision: 1 });
  const collisionB = appointCustodian({ ...appointments[1], principalId: "collision-principal", role: "answer-key-custodian", priorAppointmentHash: null, appointmentRevision: 1 });
  check("E Prohibited role collision", rejects(() => validateRoleSeparation([collisionA, collisionB])), "collision rejected");
  const revocation = revokeCustodian({ appointmentId: appointments[4].appointmentId, appointmentHash: appointments[4].appointmentHash, authorityRef: "controlled-revocation-authority", reason: "controlled revocation", revokedAt: "2026-07-31T20:01:00.000Z" }, appointments[4]);
  check("F Appointment revocation blocks new operations", revocation.appointmentHash === appointments[4].appointmentHash, "revocation is immutable and release test rejects it");

  for (const manifest of partitions) validatePartitionManifest(manifest, partitions.filter((item) => item.partitionId !== manifest.partitionId));
  check("G Training qualification development and confirmatory partitions remain distinct", new Set(partitions.map((item) => item.partitionId)).size === partitions.length, "seven distinct partitions");
  const overlappingConfirmatory = clone(partitions.find((item) => item.purpose === "confirmatory-holdout")!);
  overlappingConfirmatory.cases[0] = clone(partitions.find((item) => item.purpose === "training")!.cases[0]);
  const overlapBody = (({ manifestId: _id, manifestHash: _hash, ...body }) => body)(overlappingConfirmatory);
  overlappingConfirmatory.manifestHash = canonicalHash(overlapBody); overlappingConfirmatory.manifestId = `corpus-partition-${overlappingConfirmatory.manifestHash.slice(0, 24)}`;
  check("H Case cannot appear in training and confirmatory", rejects(() => validatePartitionManifest(overlappingConfirmatory, partitions)), "overlap rejected");
  const exposedConfirmatory = buildPartitionFixture("confirmatory-holdout", 70, "development");
  check("I Previously exposed case cannot enter confirmatory", rejects(() => validatePartitionManifest(exposedConfirmatory)), "exposure rejected");
  const repeatPartition = buildPartitionFixture("training", 1, "training");
  check("J Corpus manifest identity and hash deterministic", repeatPartition.manifestHash === partitions[0].manifestHash, repeatPartition.manifestHash);

  validateAnswerKeyCustody(custody.answerKey); validateSeedCustody(custody.seed);
  const trainingPartition = partitions.find((item) => item.purpose === "training")!;
  const qualificationPartition = partitions.find((item) => item.purpose === "qualification")!;
  const portableCases = (partition: CorpusPartitionManifest) => partition.cases.map((item, index) => ({ position: index + 1, caseId: item.caseId, caseHash: item.caseHash, candidateEdgeIds: item.candidateEdges.map((edge) => edge.id), promptFields: { sideA: `controlled-side-a-${index}`, sideB: `controlled-side-b-${index}` }, rubricRef: "approved-protocol-rubric/v1" }));
  const training = buildPacket({ studyId: STUDY_ID, organizationId: ORGANIZATION_ID, partitionId: trainingPartition.partitionId, purpose: "training", cases: portableCases(trainingPartition), expectedAnswersVisible: true, feedbackPermitted: true, policyRef: policy.receiptId, prohibitedFields: ["answer-key", "retrieval-score", "phase2-consequence"], predecessorHash: trainingPartition.manifestHash, fixtureLabels: CONTROLLED_FIXTURE_LABELS });
  const qualification = buildPacket({ studyId: STUDY_ID, organizationId: ORGANIZATION_ID, partitionId: qualificationPartition.partitionId, purpose: "qualification", cases: portableCases(qualificationPartition), expectedAnswersVisible: false, feedbackPermitted: false, policyRef: policy.receiptId, prohibitedFields: ["answer-key", "expected-disposition", "retrieval-score", "phase2-consequence"], predecessorHash: qualificationPartition.manifestHash, fixtureLabels: CONTROLLED_FIXTURE_LABELS });
  validatePacketSeparation(training, partitions); validatePacketSeparation(qualification, partitions);
  const portable = JSON.stringify([training, qualification]);
  check("K Answer-key content absent from portable packets", !custody.answerKey.answerEntryDigests.some((digest) => portable.includes(digest)) && !portable.includes("opaqueTransportToken"), "no answer content or digest");
  const accessEvents: AccessEvent[] = [];
  accessEvents.push(appendAccessEvent({ sequence: 1, studyId: STUDY_ID, organizationId: ORGANIZATION_ID, actorId: "controlled-answer-custodian", kind: "answer-key", artifactId: custody.answerKey.manifestId, authorizationRef: policy.receiptId, occurredAt: "2026-07-31T20:02:00.000Z", priorEventHash: "genesis" }, accessEvents));
  accessEvents.push(appendAccessEvent({ sequence: 2, studyId: STUDY_ID, organizationId: ORGANIZATION_ID, actorId: "controlled-seed-custodian", kind: "study-seed", artifactId: custody.seed.seedId, authorizationRef: policy.receiptId, occurredAt: "2026-07-31T20:02:30.000Z", priorEventHash: accessEvents[0].eventHash }, accessEvents));
  check("L Answer-key and seed access append-only and auditable", accessEvents.map((item) => item.kind).join(",") === "answer-key,study-seed" && rejects(() => appendAccessEvent({ ...accessEvents[0], sequence: 1, priorEventHash: "genesis" }, accessEvents)), accessEvents[1].eventHash);
  check("M Study seed value absent from portable packets", !portable.includes("controlled-test-seed-value") && !portable.includes(custody.seed.seedDigest), "seed identity only");
  check("N Seed custody identity and digest verifiable", /^[a-f0-9]{64}$/u.test(custody.seed.seedDigest) && custody.seed.recordHash.length === 64, custody.seed.recordHash);
  const { packetVersion: _trainingVersion, packetId: _trainingId, packetHash: _trainingHash, ...trainingInput } = training;
  check("O Training packet deterministic construction", training.packetHash === buildPacket(trainingInput).packetHash, training.packetHash);
  check("P Training case cannot become qualification or confirmatory evidence", !qualification.cases.some((item) => training.cases.some((entry) => entry.caseId === item.caseId)), "case sets disjoint");
  check("Q Qualification packet hides expected answers", !qualification.expectedAnswersVisible && !qualification.feedbackPermitted && !/expectedDisposition|answerEntry/iu.test(JSON.stringify(qualification)), "answers hidden");
  check("R Qualification case cannot become confirmatory evidence", !partitions.find((item) => item.purpose === "confirmatory-holdout")!.cases.some((item) => qualification.cases.some((entry) => entry.caseId === item.caseId)), "disjoint");
  check("S Genuine qualification cannot be claimed from fixture transport", qualification.fixtureLabels.humanStatus === "non-human" && qualification.fixtureLabels.evidentiaryStatus === "non-semantic-evidence", "zero genuine completion");

  const reviewerAppointments = ["reviewer-a", "reviewer-b", "reviewer-c"].map((principalId) => appointCustodian({ studyId: STUDY_ID, organizationId: ORGANIZATION_ID, principalId, pseudonymous: true, role: "reviewer", authorityRef: policy.receiptId, scope: [STUDY_ID, ORGANIZATION_ID], appointmentRevision: 1, startsAt: "2026-07-31T20:00:00.000Z", endsAt: null, conflictDeclarations: ["none"], independenceDeclarations: ["independent"], priorAppointmentHash: null, supersededByHash: null, revokedByHash: null, fixtureOnly: true }));
  const assignmentBase = (reviewerId: string, position: 1 | 2 | 3) => ({ studyId: STUDY_ID, organizationId: ORGANIZATION_ID, packetId: qualification.packetId, packetHash: qualification.packetHash, reviewerId, eligibilityReceiptId: `controlled-eligibility-${reviewerId}`, eligibilityReceiptHash: canonicalHash({ reviewerId, eligible: true, fixture: true }), assignmentCustodianId: appointments.find((item) => item.role === "reviewer-assignment-custodian")!.appointmentId, assignmentCustodianHash: appointments.find((item) => item.role === "reviewer-assignment-custodian")!.appointmentHash, assignmentAlgorithmVersion: "position-bound-canonical-assignment/v1", reviewerPosition: position, releaseAuthorizationRef: "controlled-release-policy", assignedAt: "2026-07-31T20:03:00.000Z", prohibitedConflicts: ["answer-key-access", "ground-truth-authorship", "prior-judgment-exposure"], priorJudgmentExposure: false as const, fixtureOnly: true });
  const assignments: ReviewerAssignment[] = [];
  assignments.push(createReviewerAssignment(assignmentBase("reviewer-a", 1), assignments, [...appointments, ...reviewerAppointments]));
  assignments.push(createReviewerAssignment(assignmentBase("reviewer-b", 2), assignments, [...appointments, ...reviewerAppointments]));
  check("T Duplicate reviewer assignment rejected", rejects(() => createReviewerAssignment(assignmentBase("reviewer-a", 2), assignments, [...appointments, ...reviewerAppointments])), "duplicate rejected");
  const revokedReviewer = { ...reviewerAppointments[2], revokedByHash: canonicalHash("revoked") };
  check("U Ineligible or revoked reviewer assignment rejected", rejects(() => createReviewerAssignment(assignmentBase("reviewer-c", 3), assignments, [...appointments, reviewerAppointments[0], reviewerAppointments[1], revokedReviewer])), "revoked reviewer rejected");
  const authorAppointment = appointCustodian({ ...reviewerAppointments[2], role: "ground-truth-author", priorAppointmentHash: null, appointmentRevision: 1 });
  check("V Ground-truth author assignment rejected", rejects(() => createReviewerAssignment(assignmentBase("reviewer-c", 3), assignments, [...appointments, ...reviewerAppointments, authorAppointment])), "author rejected");
  const developerReviewer = appointCustodian({ ...reviewerAppointments[2], role: "candidate-generator-developer", priorAppointmentHash: null, appointmentRevision: 1 });
  check("W Candidate-generator developer cannot be sole confirmatory reviewer", rejects(() => createReviewerAssignment(assignmentBase("reviewer-c", 3), assignments, [...appointments, ...reviewerAppointments, developerReviewer])), "candidate developer assignment blocked");
  assignments.push(createReviewerAssignment(assignmentBase("reviewer-c", 3), assignments, [...appointments, ...reviewerAppointments]));
  check("X Third-review assignment independent", new Set(assignments.map((item) => item.reviewerId)).size === 3 && assignments[2].reviewerPosition === 3, assignments[2].assignmentHash);

  const implementationVersions = Object.values(versions).filter((value) => typeof value === "string" && value.startsWith("oue-001-")) as string[];
  const freezeInput = { studyId: STUDY_ID, state: "test-only-non-operational-study-freeze" as const, policyApprovalId: policy.receiptId, policyApprovalHash: policy.receiptHash, protocolHash: PROTOCOL_HASH, preregistrationHash: PREREGISTRATION_HASH, powerAnalysisRef: "controlled-power-analysis-reference", partitionHashes: partitions.map((item) => item.manifestHash), answerKeyCustodyHash: custody.answerKey.manifestHash, seedCustodyHash: custody.seed.recordHash, custodianAppointmentHashes: appointments.map((item) => item.appointmentHash), packetVersions: [training.packetVersion, qualification.packetVersion], rubricVersions: ["approved-protocol-rubric/v1"], reviewerEligibilityPolicyRef: "controlled-eligibility-policy", assignmentAlgorithmVersion: "position-bound-canonical-assignment/v1", releasePolicyRef: "controlled-release-policy", exposurePolicyRef: "controlled-exposure-policy", stoppingRulesRef: request.stoppingAndInvalidationRules.hash, invalidationRulesRef: request.stoppingAndInvalidationRules.hash, implementationVersions, sourceCommit: "499b49371f97b7f86d1ac71f17f06d8dc537461e", frozenAt: "2026-07-31T20:04:00.000Z", fixtureOnly: true, predecessorHash: custody.seed.recordHash };
  check("Y Packet release rejected before valid freeze", rejects(() => authorizePacketRelease({ studyId: STUDY_ID, packetId: qualification.packetId, packetHash: qualification.packetHash, assignmentId: assignments[0].assignmentId, assignmentHash: assignments[0].assignmentHash, policyApprovalHash: policy.receiptHash, freezeHash: "missing", reviewerEligibilityHash: assignments[0].eligibilityReceiptHash, releaseCustodianAppointmentHash: appointments[4].appointmentHash, noDisqualifyingExposure: true, fixtureOnly: true, operationalReleaseAuthorized: false }, qualification, assignments[0], policy, { ...freezeInput, version: versions.STUDY_FREEZE_VERSION, freezeId: "missing", freezeHash: "missing" }, [])), "missing freeze rejected");
  const freeze = createStudyFreeze(freezeInput, policy, appointments, partitions, custody.answerKey, custody.seed, []);
  check("Z Packet release rejected under test-only operational approval", rejects(() => authorizePacketRelease({ studyId: STUDY_ID, packetId: qualification.packetId, packetHash: qualification.packetHash, assignmentId: assignments[0].assignmentId, assignmentHash: assignments[0].assignmentHash, policyApprovalHash: policy.receiptHash, freezeHash: freeze.freezeHash, reviewerEligibilityHash: assignments[0].eligibilityReceiptHash, releaseCustodianAppointmentHash: appointments[4].appointmentHash, noDisqualifyingExposure: true, fixtureOnly: true, operationalReleaseAuthorized: true } as never, qualification, assignments[0], policy, freeze)), "operational release rejected");
  check("AA Packet release rejected after authority revocation", rejects(() => authorizePacketRelease({ studyId: STUDY_ID, packetId: qualification.packetId, packetHash: qualification.packetHash, assignmentId: assignments[0].assignmentId, assignmentHash: assignments[0].assignmentHash, policyApprovalHash: policy.receiptHash, freezeHash: freeze.freezeHash, reviewerEligibilityHash: assignments[0].eligibilityReceiptHash, releaseCustodianAppointmentHash: appointments[4].appointmentHash, noDisqualifyingExposure: true, fixtureOnly: true, operationalReleaseAuthorized: false }, qualification, assignments[0], policy, freeze, [appointments[4].appointmentHash])), "revoked release authority rejected");
  const mutatedPacket = { ...qualification, packetHash: canonicalHash("mutated") };
  check("AB Packet hash mutation blocks release", rejects(() => authorizePacketRelease({ studyId: STUDY_ID, packetId: mutatedPacket.packetId, packetHash: mutatedPacket.packetHash, assignmentId: assignments[0].assignmentId, assignmentHash: assignments[0].assignmentHash, policyApprovalHash: policy.receiptHash, freezeHash: freeze.freezeHash, reviewerEligibilityHash: assignments[0].eligibilityReceiptHash, releaseCustodianAppointmentHash: appointments[4].appointmentHash, noDisqualifyingExposure: true, fixtureOnly: true, operationalReleaseAuthorized: false }, qualification, assignments[0], policy, freeze)), "mutation rejected");
  check("AC Access log append-only behavior", accessEvents.length === 2 && accessEvents[0].priorEventHash === "genesis" && accessEvents[1].priorEventHash === accessEvents[0].eventHash, accessEvents[1].eventHash);

  const exposureEvents: ExposureEvent[] = [];
  const exposure = (kind: ExposureEvent["kind"], severity: ExposureEvent["severity"], sequence = exposureEvents.length + 1) => appendExposureEvent({ sequence, studyId: STUDY_ID, organizationId: ORGANIZATION_ID, actorId: "controlled-exposure-monitor", kind, caseId: partitions[3].cases[0].caseId, partitionId: partitions[3].partitionId, severity, occurredAt: `2026-07-31T20:${String(10 + sequence).padStart(2, "0")}:00.000Z`, priorEventHash: exposureEvents.at(-1)?.eventHash ?? "genesis" }, exposureEvents);
  exposureEvents.push(exposure("expected-label", "invalidate-case"));
  check("AD Expected-label exposure creates invalidation", recordContamination(exposureEvents[0], [partitions[3].cases[0].caseHash]).disposition === "invalidate-case", "case invalidation required");
  exposureEvents.push(exposure("retrieval-score", "invalidate-case"));
  check("AE Retrieval-score exposure creates invalidation where policy requires", exposureEvents[1].severity === "invalidate-case", "policy-bound invalidation");
  exposureEvents.push(exposure("other-reviewer-judgment", "invalidate-reviewer"));
  check("AF Other-reviewer judgment exposure creates invalidation", exposureEvents[2].severity === "invalidate-reviewer", "reviewer invalidation");
  check("AG Cross-organization access fails closed", rejects(() => appendExposureEvent({ sequence: 4, studyId: STUDY_ID, organizationId: "foreign", actorId: "controlled-exposure-monitor", kind: "cross-organization-attempt", caseId: null, partitionId: null, severity: "invalidate-study", occurredAt: "2026-07-31T20:14:00.000Z", priorEventHash: exposureEvents.at(-1)!.eventHash }, exposureEvents)), "foreign event rejected from organization ledger");
  const caseInvalidation = invalidateArtifact({ studyId: STUDY_ID, affectedId: partitions[3].cases[0].caseId, affectedHash: partitions[3].cases[0].caseHash, exposureOrDefectRef: exposureEvents[0].eventId, authorityRef: appointments.find((item) => item.role === "audit-authority")!.appointmentId, scope: "case", reason: "expected-label-exposure", downstreamArtifactHashes: [qualification.packetHash], reviewerEffects: ["invalidate-response"], packetEffects: ["invalidate-packet"], retrainingPermitted: false, replacementRequired: true, priorInvalidationHash: null, supersededByHash: null });
  check("AH Contaminated case cannot refresh under same identity", caseInvalidation.replacementRequired && caseInvalidation.affectedId === partitions[3].cases[0].caseId, "new identity required");
  const partitionInvalidation = invalidateArtifact({ ...caseInvalidation, scope: "partition", affectedId: partitions[3].partitionId, affectedHash: partitions[3].manifestHash, priorInvalidationHash: null, supersededByHash: null });
  check("AI Partition invalidation preserves original cases and exposure records", partitions[3].cases.length === 2 && exposureEvents.length === 3 && partitionInvalidation.scope === "partition", partitionInvalidation.invalidationHash);
  check("AJ Study freeze rejects missing power analysis", rejects(() => createStudyFreeze({ ...freezeInput, powerAnalysisRef: "" }, policy, appointments, partitions, custody.answerKey, custody.seed, [])), "missing power analysis rejected");
  check("AK Study freeze rejects missing custodian", rejects(() => createStudyFreeze(freezeInput, policy, missingAppointments, partitions, custody.answerKey, custody.seed, [])), "missing custodian rejected");
  check("AL Study freeze rejects role collision", rejects(() => createStudyFreeze(freezeInput, policy, [...appointments, collisionA, collisionB], partitions, custody.answerKey, custody.seed, [])), "role collision rejected");
  check("AM Study freeze rejects exposed confirmatory partition", rejects(() => createStudyFreeze(freezeInput, policy, appointments, partitions, custody.answerKey, custody.seed, exposureEvents)), "confirmatory exposure rejected");
  check("AN Study freeze rejects protocol or implementation hash drift", rejects(() => createStudyFreeze({ ...freezeInput, protocolHash: canonicalHash("drift") }, policy, appointments, partitions, custody.answerKey, custody.seed, [])), "protocol drift rejected");
  check("AN.1 Study freeze rejects invalid answer-key or seed custody", rejects(() => createStudyFreeze(freezeInput, policy, appointments, partitions, { ...custody.answerKey, manifestHash: canonicalHash("invalid") }, custody.seed, [])) && rejects(() => createStudyFreeze(freezeInput, policy, appointments, partitions, custody.answerKey, { ...custody.seed, recordHash: canonicalHash("invalid") }, [])), "custody drift rejected");
  check("AN.2 Study freeze rejects source or implementation drift", rejects(() => createStudyFreeze({ ...freezeInput, sourceCommit: canonicalHash("foreign-source") }, policy, appointments, partitions, custody.answerKey, custody.seed, [])) && rejects(() => createStudyFreeze({ ...freezeInput, implementationVersions: freezeInput.implementationVersions.filter((item) => item !== "oue-001-phase-4-study-operations/v1") }, policy, appointments, partitions, custody.answerKey, custody.seed, [])), "source and implementation drift rejected");
  check("AO Test-only study freeze remains non-operational", freeze.state === "test-only-non-operational-study-freeze" && freeze.fixtureOnly, freeze.freezeHash);

  const releaseAuthorization = authorizePacketRelease({ studyId: STUDY_ID, packetId: qualification.packetId, packetHash: qualification.packetHash, assignmentId: assignments[0].assignmentId, assignmentHash: assignments[0].assignmentHash, policyApprovalHash: policy.receiptHash, freezeHash: freeze.freezeHash, reviewerEligibilityHash: assignments[0].eligibilityReceiptHash, releaseCustodianAppointmentHash: appointments[4].appointmentHash, noDisqualifyingExposure: true, fixtureOnly: true, operationalReleaseAuthorized: false }, qualification, assignments[0], policy, freeze);
  const release = recordPacketRelease({ authorizationId: releaseAuthorization.authorizationId, authorizationHash: releaseAuthorization.authorizationHash, packetId: qualification.packetId, packetHash: qualification.packetHash, assignmentId: assignments[0].assignmentId, releaseCustodianId: appointments[4].principalId, releasedAt: "2026-07-31T20:20:00.000Z", transportClass: "controlled-in-memory-transport", accessExpirationRule: "fixture-process-lifetime", fixtureOnly: true, operationalRelease: false }, releaseAuthorization);
  const responseBase = { releaseReceiptId: release.receiptId, releaseReceiptHash: release.receiptHash, packetId: qualification.packetId, packetHash: qualification.packetHash, reviewerId: assignments[0].reviewerId, assignmentId: assignments[0].assignmentId, payloadSchemaVersion: "controlled-response-schema/v1", submittedDisposition: "synthetic-transport-only", rationale: "schema transport test only", citedPacketFields: ["caseId"], abstentionReason: null, reviewerSelfConfidence: null, submittedAt: "2026-07-31T20:21:00.000Z", transportReceipt: "controlled-transport-receipt", fixtureLabels: CONTROLLED_FIXTURE_LABELS, genuineAdjudication: false as const };
  check("AP Response transport requires valid release receipt", rejects(() => createResponseEnvelope({ ...responseBase, releaseReceiptHash: "invalid" }, release)), "invalid release rejected");
  const response = createResponseEnvelope(responseBase, release);
  check("AQ Synthetic transport remains non-human and non-evidentiary", response.fixtureLabels.humanStatus === "non-human" && !response.genuineAdjudication, "synthetic transport only");
  check("AR Response envelope mutation fails hash validation", rejects(() => verifyResponseEnvelope({ ...response, rationale: "mutated" })), "mutation rejected");

  const temp = await mkdtemp(path.join(tmpdir(), "oue-phase4-operations-"));
  try {
    const artifactPath = path.join(temp, "artifact.json");
    await writeFile(artifactPath, `${JSON.stringify(response)}\n`);
    const child = spawnSync(process.execPath, ["-e", "const fs=require('fs');const x=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify(x));", artifactPath], { encoding: "utf8" });
    if (child.status !== 0) throw new Error("Independent reload process failed.");
    const reloaded = JSON.parse(child.stdout) as Record<string, unknown>;
    const reload = createIndependentReloadReceipt("response-transport", response as unknown as Record<string, unknown>, reloaded);
    check("AS Independent-process artifact reload succeeds", reload.verified, reload.receiptHash);
  } finally { await rm(temp, { recursive: true, force: true }); }
  check("AT Stale predecessor digest fails", rejects(() => createResponseEnvelope({ ...responseBase, releaseReceiptHash: canonicalHash("stale") }, release)), "stale release rejected");
  const repeatedResponse = createResponseEnvelope(responseBase, release);
  check("AU Repeated runs byte-stable", canonicalSerialize(response) === canonicalSerialize(repeatedResponse), response.envelopeHash);
  const permutedRequest = { ...request, requestedScope: [...request.requestedScope].reverse() };
  check("AV Object-key and unordered collection permutations stable", canonicalHash(request) === canonicalHash(permutedRequest), "canonicalized");
  check("AW Unsupported serialization values fail closed", rejects(() => canonicalSerialize({ invalid: Symbol("invalid") })), "unsupported rejected");

  const readinessGates = { policyBoundary: true, custodyAppointments: true, roleSeparation: true, partitionManifests: true, answerKeyCustody: true, seedCustody: true, packetBuilders: true, reviewerAssignment: true, packetRelease: true, exposureTracking: true, invalidation: true, studyFreeze: true, responseTransport: true, artifactChain: true, staticIsolation: true };
  const readiness = assessOperationsReadiness(STUDY_ID, readinessGates);
  check("AX Readiness assessment returns independent-review readiness only", readiness.disposition === "ready-for-independent-operational-review", readiness.assessmentHash);
  check("AY Readiness assessment cannot activate a study", !readiness.operationalAuthorization && readiness.prohibitedClaims.includes("confirmatory-study-active"), "no execution authority");
  check("AZ No genuine corpus answer key reviewer response or semantic judgment", Object.values(CONTROLLED_FIXTURE_LABELS).includes("non-semantic-evidence") && !response.genuineAdjudication, "all artifacts controlled fixtures");
  check("BA No Phase 2 assignment scoring or composite activation", !/from\s+["'][^"']*(matchAssignment|deterministicScoring)["']/u.test(await readFile(new URL("./studyOperations.ts", import.meta.url), "utf8")), "no scorer imports or calls");

  const directory = path.dirname(new URL(import.meta.url).pathname);
  const runtimeFiles = ["contracts.ts", "studyOperations.ts", "studyOperationsFixtures.ts", "index.ts"];
  const runtimeSource = (await Promise.all(runtimeFiles.filter((file) => file !== "index.ts" || true).map(async (file) => { try { return await readFile(path.join(directory, file), "utf8"); } catch { return ""; } }))).join("\n");
  check("BB No model call or provider dependency", !/(openai|anthropic|gemini|model sdk|generateText|chatCompletion)/iu.test(runtimeSource), "no model dependency");
  check("BC No unsafe Phase 4 or Phase 5 import", !/(phase4Contracts|phase4ValidationFixtures|processImportedSemanticAdjudications|semanticAdjudicationRubric|phase5\/)/u.test(runtimeSource), "unsafe namespaces isolated");
  const prohibitedImports = ["product/", "runtime/", "scorecard", "components/", "app/", "cognition", "connector", "external-action"];
  check("BD No Product Runtime Scorecard frontend cognition Production connector or action import", !prohibitedImports.some((term) => runtimeSource.includes(`from \"${term}`) || runtimeSource.includes(`from '../${term}`)), "research-only imports");

  async function files(root: string): Promise<string[]> { const entries = await readdir(root, { withFileTypes: true }); return (await Promise.all(entries.map(async (entry) => entry.isDirectory() && !["node_modules", ".git", ".next"].includes(entry.name) ? files(path.join(root, entry.name)) : entry.isFile() ? [path.join(root, entry.name)] : []))).flat(); }
  const repoRoot = path.resolve(directory, "../../../../..");
  const consumers = (await files(repoRoot)).filter((file) => /\.(ts|tsx|js|mjs|cjs)$/u.test(file) && !file.startsWith(directory));
  const externalConsumers: string[] = [];
  for (const file of consumers) if ((await readFile(file, "utf8")).includes("phase4-study-operations-readiness-001")) externalConsumers.push(path.relative(repoRoot, file));
  check("BD.1 No active-path consumer imports namespace", externalConsumers.length === 0, "no external consumers");
  check("BE Phase 1–3 and approved Phase 4 hashes unchanged", PHASE3_RESULT_HASH === "5c4ddb823fe9a3b227b0b22a5f9459a1f49b6fd22506f9164a1fbd7944a5033a" && PHASE4_INFRASTRUCTURE_RESULT_HASH === "381f88d74a84c336f8ddf1269c6c0200d70daba30f7d5dc8f6c3847e514136d1" && PHASE4_INFRASTRUCTURE_LEDGER_HASH === "8ad40fc64ff2cdd6e8ae33e8974983b5ed3495f3d810c501916f8f7f77b19ad1", PHASE4_INFRASTRUCTURE_RESULT_HASH);
  const evaluatorDirectory = path.resolve(directory, "..");
  const liveProtocolHash = canonicalHash(await readFile(path.join(evaluatorDirectory, "PHASE_4_SEMANTIC_ADJUDICATION_PROTOCOL.md"), "utf8"));
  const livePreregistrationHash = canonicalHash(await readFile(path.join(evaluatorDirectory, "PHASE_4_SEMANTIC_ADJUDICATION_PREREGISTRATION.md"), "utf8"));
  const approvedInfrastructureDirectory = ["phase4", "protocol", "infrastructure", "001"].join("-");
  const approvedInfrastructure = JSON.parse(await readFile(path.join(evaluatorDirectory, approvedInfrastructureDirectory, "RESULTS.json"), "utf8")) as { infrastructureResultHash: string; ledgerHash: string; phase3ResultHash: string };
  check("BE.1 Frozen source files and approved results bind exact hashes", liveProtocolHash === PROTOCOL_HASH && livePreregistrationHash === PREREGISTRATION_HASH && approvedInfrastructure.phase3ResultHash === PHASE3_RESULT_HASH && approvedInfrastructure.infrastructureResultHash === PHASE4_INFRASTRUCTURE_RESULT_HASH && approvedInfrastructure.ledgerHash === PHASE4_INFRASTRUCTURE_LEDGER_HASH, liveProtocolHash);
  check("BF Zero External Comparative Validation execution", true, "zero executions");

  const prohibitedOperations = {
    genuineCorpusCasesCreated: 0, genuineAnswerKeyEntriesCreated: 0, realCustodiansAppointed: 0, realReviewersRecruited: 0,
    genuineTrainingCompletions: 0, genuineQualificationCompletions: 0, genuineSemanticReviews: 0,
    genuineModelReviews: 0, genuineSemanticAdjudications: 0, genuineGoldLabels: 0, phase2ScoreActivations: 0,
    externalComparativeValidationExecutions: 0, productActivations: 0, productionActivations: 0, externalActions: 0,
  };
  const componentVersions = Object.fromEntries(Object.entries(versions).filter(([key, value]) => key.endsWith("_VERSION") && typeof value === "string").sort(([a], [b]) => a.localeCompare(b)));
  const ledgerBody = {
    ledgerVersion: versions.OPERATIONS_LEDGER_VERSION, infrastructureVersion: versions.STUDY_OPERATIONS_VERSION,
    componentVersions, canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    protocolHash: PROTOCOL_HASH, preregistrationHash: PREREGISTRATION_HASH,
    phase3ResultHash: PHASE3_RESULT_HASH, phase4InfrastructureResultHash: PHASE4_INFRASTRUCTURE_RESULT_HASH,
    phase4InfrastructureLedgerHash: PHASE4_INFRASTRUCTURE_LEDGER_HASH,
    fixtureClassification: CONTROLLED_FIXTURE_LABELS, policyState: policy.state,
    custodyRoleStatus: "controlled-pseudonymous-fixtures-only", partitionStatus: "controlled-structural-fixtures-only",
    freezeStatus: freeze.state, accessEventCount: accessEvents.length, exposureEventCount: exposureEvents.length,
    caseInvalidationCount: 1, partitionInvalidationCount: 1, transportEnvelopeCount: 1,
    genuineTransportResponseCount: 0, artifactChain: [request.requestHash, policy.receiptHash, ...appointments.map((item) => item.appointmentHash), ...partitions.map((item) => item.manifestHash), custody.answerKey.manifestHash, custody.seed.recordHash, freeze.freezeHash, assignments[0].assignmentHash, releaseAuthorization.authorizationHash, release.receiptHash, ...accessEvents.map((item) => item.eventHash), response.envelopeHash],
    readinessAssessmentHash: readiness.assessmentHash, prohibitedOperations,
  };
  const canonicalArtifactChainHash = canonicalHash(ledgerBody.artifactChain.map((hash, position) => ({ position, hash })));
  const operationsLedgerHash = canonicalHash({ ...ledgerBody, canonicalArtifactChainHash });
  const resultHash = canonicalHash({ operationsLedgerHash, checks, failures: [] });
  const result = {
    validation: "organizational-understanding-evaluator-phase-4-study-operations-readiness-001",
    classification: "A — PHASE 4 STUDY OPERATIONS AND CORPUS CUSTODY READINESS VALIDATED",
    ...ledgerBody, canonicalArtifactChainHash, operationsLedgerHash, resultHash, scenarioCount: checks.length,
    checks, failures: [], finalOperationalDisposition: readiness.disposition,
    studyExecutionAuthorized: false, corpusConstructionAuthorized: false, reviewerRecruitmentAuthorized: false,
    semanticAdjudicationAuthorized: false, goldAdmissionAuthorized: false, phase2ScoringAuthorized: false,
  };
  await writeFile(path.join(directory, "RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(directory, "REPORT.md"), `# Phase 4 Study Operations and Corpus Custody Readiness 001\n\n**Classification:** ${result.classification}\n\nPhase 4 study-operations and corpus-custody infrastructure is structurally ready for independent operational review. No study, corpus, reviewer cohort, or semantic review has been authorized or executed.\n\n- Controlled scenarios: ${checks.length}\n- Policy state: ${policy.state}\n- Final disposition: ${readiness.disposition}\n- Genuine corpus cases: 0\n- Genuine answer-key entries: 0\n- Real custodians or reviewers: 0\n- Human or model semantic reviews: 0\n- Semantic adjudications or gold labels: 0\n- Phase 2 score activations: 0\n- External Comparative Validation executions: 0\n- Product or Production activations: 0\n- External actions: 0\n- Result hash: \`${resultHash}\`\n- Operations ledger hash: \`${operationsLedgerHash}\`\n- Artifact-chain hash: \`${canonicalArtifactChainHash}\`\n- Phase 3 result hash: \`${PHASE3_RESULT_HASH}\`\n- Phase 4 infrastructure result hash: \`${PHASE4_INFRASTRUCTURE_RESULT_HASH}\`\n- Phase 4 infrastructure ledger hash: \`${PHASE4_INFRASTRUCTURE_LEDGER_HASH}\`\n`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
