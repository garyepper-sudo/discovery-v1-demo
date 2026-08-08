import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  createCanonicalEvidenceScopeAttribution,
  createCanonicalScopeLineageIndex,
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import type {
  CanonicalExplanationGovernanceLineageV1,
  OrganizationalExplanation,
} from "../../engine/v3/model/judgment/organizationalJudgment";
import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  produceCanonicalUnderstandingAudienceLineage,
  validateCanonicalUnderstandingAudienceLineage,
} from "../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";
const oracleStable=(value:unknown):string=>Array.isArray(value)?`[${value.map(oracleStable).join(",")}]`:value&&typeof value==="object"?`{${Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${oracleStable(item)}`).join(",")}}`:JSON.stringify(value);
const oracleDigest=(value:unknown)=>createHash("sha256").update(oracleStable(value)).digest("hex");

const ORG = "canonical-explanation-lineage-fixture";
const OTHER_ORG = "foreign-organization";
const AT = "2026-08-07T12:00:00.000Z";
const LATER = "2026-08-07T13:00:00.000Z";
const root = { organizationId: ORG, type: "organization" as const, id: ORG };
const team = { organizationId: ORG, type: "team" as const, id: "team:delivery" };
const topology = createCanonicalScopeTopology({
  organizationId: ORG,
  topologyVersion: 1,
  effectiveAt: AT,
  nodes: [root, team],
  relationships: [{ kind: "contains", from: root, to: team }],
});
const binding = createCanonicalSourceScopeBinding({
  organizationId: ORG,
  bindingVersion: 1,
  source: { sourceId: "source:one", sourceVersion: "1", normalizedContentDigest: "11111111111111111111111111111111" },
  topology,
  assertions: [{ relationship: "origin", scope: team }],
  basisRefs: ["governed-source-basis:one"],
  effectiveAt: AT,
  sourceType: "authorized-record",
  purposeRef: "organizational-understanding",
  availability: "available",
});
const bindingTwo = createCanonicalSourceScopeBinding({
  organizationId: ORG,
  bindingVersion: 1,
  source: { sourceId: "source:two", sourceVersion: "1", normalizedContentDigest: "22222222222222222222222222222222" },
  topology,
  assertions: [{ relationship: "applies-to", scope: team }],
  basisRefs: ["governed-source-basis:two"],
  effectiveAt: AT,
  sourceType: "authorized-record",
  purposeRef: "organizational-understanding",
  availability: "available",
});
const attribution = createCanonicalEvidenceScopeAttribution({
  organizationId: ORG,
  attributionVersion: 1,
  evidenceId: "canonical-evidence:v2:one",
  evidenceAdmissionId: "canonical-evidence-admission:one",
  bindings: [binding, bindingTwo],
  topology,
  effectiveAt: AT,
});

function lineage(role: "material" | "contradictory-material" = "material"): CanonicalExplanationGovernanceLineageV1 {
  const support = {
    canonicalEvidenceId: attribution.evidenceId,
    canonicalAdmissionId: attribution.evidenceAdmissionId,
    attributionId: attribution.attributionId,
    attributionRevision: attribution.attributionVersion,
    attributionDigest: attribution.digest,
    sourceBindingRefs: [binding, bindingTwo].map((item) => ({
      sourceBindingId: item.bindingId,
      sourceGovernanceRevision: item.digest,
    })).sort((left, right) => left.sourceBindingId.localeCompare(right.sourceBindingId)),
    purposeRefs: ["organizational-understanding"],
    topologyId: topology.topologyId,
    originBatchDigest: "c".repeat(64),
    role,
  };
  const unsigned = {
    contractVersion: "canonical-explanation-governance-lineage.v1" as const,
    organizationId: ORG,
    directMaterialSupports: [support],
    inheritedMaterialAncestorRefs: [{
      derivedArtifactType: "organizational-theory" as const,
      derivedArtifactId: "theory:one",
      derivedArtifactRevisionId: "theory:one:revision:1",
      ancestryDigest: "d".repeat(64),
      supportRole: role,
    }],
    materialSupports: [support],
    topologyIds: [topology.topologyId],
    purposeRefs: ["organizational-understanding"],
    operationRefs: [{contributionOperationId:"operation:one",questionId:"question:one",purposeRef:"organizational-understanding",canonicalOperationResultDigest:"a".repeat(64),envelopeDigest:"b".repeat(64)}],
    lineagePolicyVersion: "conservative-material-support.v1" as const,
  };
  return { ...unsigned, lineageDigest: oracleDigest(unsigned) };
}

const explanation: OrganizationalExplanation = {
  id: "explanation:one",
  organizationId: ORG,
  semanticKey: "one",
  claim: { scope: team, rootMechanismIds: ["mechanism:one"], outcomeRefs: [{ type: "phenomenon", id: "phenomenon:one" }], causalRelationFamily: "constraint" },
  explanationSeedIds: ["seed:one"],
  reasoningPathIds: ["path:one"],
  mechanismIds: ["mechanism:one"],
  beliefIds: ["belief:one"],
  theoryIds: ["theory:one"],
  evidenceIds: ["investigation-local:one", "investigation-local:two"],
  contradictionIds: [],
  assumptions: [],
  comparativeEvidenceRoles: [],
  canonicalGovernanceLineage: lineage(),
  viability: "unadjudicated",
  uncertainty: [],
  createdAt: AT,
  updatedAt: AT,
};
const composition: CanonicalUnderstandingComposition = {
  id: "composition:one",
  revisionId: "composition:one:revision:1",
  previousRevisionId: null,
  organizationId: ORG,
  scope: root,
  outcomeRef: { type: "phenomenon", id: "phenomenon:one" },
  explanationIds: [explanation.id],
  compositionUncertainty: [],
  createdAt: AT,
  updatedAt: AT,
};

function run(input: {
  explanation?: OrganizationalExplanation;
  sourceBindings?: typeof binding[];
  attributions?: typeof attribution[];
}) {
  const sourceBindings = input.sourceBindings ?? [binding, bindingTwo];
  const attributions = input.attributions ?? [attribution];
  const index = createCanonicalScopeLineageIndex({ organizationId: ORG, topology, sourceBindings, evidenceAttributions: attributions });
  return produceCanonicalUnderstandingAudienceLineage({
    organizationId: ORG,
    compositions: [structuredClone(composition)],
    explanations: [structuredClone(input.explanation ?? explanation)],
    scopeLineageIndex: index,
    scopeTopology: topology,
  });
}

const eligible = run({});
validateCanonicalUnderstandingAudienceLineage(eligible);
assert(eligible.records.every((record) => record.completeness === "complete"));
assert.equal(eligible.records.filter((record) => record.fieldFamily === "evidence-reference").length, 1);
assert(eligible.records.some((record) => record.supports.some((support) => support.sourceBindingRefs.length === 2)));
assert(!JSON.stringify(eligible).includes("investigation-local:"));
assert(!JSON.stringify(eligible).includes("normalizedContentDigest"));

const repeat = run({});
assert.equal(repeat.digest, eligible.digest, "normalized lineage output is not deterministic");
assert.equal(explanation.id, "explanation:one");
assert.equal(composition.id, "composition:one");
assert.equal(composition.revisionId, "composition:one:revision:1");

const historical = structuredClone(explanation);
delete historical.canonicalGovernanceLineage;
const historicalResult = run({ explanation: historical });
assert(historicalResult.records.every((record) => record.completeness === "incomplete"));
assert(historicalResult.records.some((record) => record.reasons.includes("historical-local-only-lineage")));
assert.equal(historicalResult.records.filter((record) => record.fieldFamily === "evidence-reference").length, 0);

const contradictory = structuredClone(explanation);
contradictory.canonicalGovernanceLineage = lineage("contradictory-material");
assert(run({ explanation: contradictory }).records.some((record) => record.supports.some((support) => support.role === "opposes")));

const revoked = createCanonicalSourceScopeBinding({
  organizationId: ORG,
  bindingVersion: 2,
  source: binding.source,
  topology,
  assertions: binding.assertions,
  basisRefs: binding.basisRefs,
  effectiveAt: LATER,
  supersedesBindingId: binding.bindingId,
  sourceType: binding.sourceType,
  purposeRef: binding.purposeRef,
  availability: "revoked",
});
const revokedResult = run({ sourceBindings: [binding, revoked, bindingTwo] });
assert(revokedResult.records.some((record) => record.completeness === "conflicting" && record.reasons.includes("material-source-binding-revoked")));
assert(revokedResult.records.find((record) => record.fieldFamily === "composition-claim")?.completeness === "conflicting");

const wrongOrganization = structuredClone(explanation);
wrongOrganization.canonicalGovernanceLineage!.organizationId = OTHER_ORG;
assert(run({ explanation: wrongOrganization }).records.some((record) => record.completeness === "incomplete"));

const fabricated = structuredClone(explanation);
fabricated.canonicalGovernanceLineage!.materialSupports[0]!.canonicalAdmissionId = "fabricated-admission";
assert(run({ explanation: fabricated }).records.some((record) => record.reasons.includes("canonical-evidence-lineage-mismatch")));

const duplicate = structuredClone(explanation);
const incompatible = structuredClone(duplicate.canonicalGovernanceLineage!.materialSupports[0]!);
incompatible.canonicalAdmissionId = "incompatible-admission";
duplicate.canonicalGovernanceLineage!.materialSupports.push(incompatible);
const { lineageDigest: _discard, ...duplicateUnsigned } = duplicate.canonicalGovernanceLineage!;
duplicate.canonicalGovernanceLineage!.lineageDigest = oracleDigest(duplicateUnsigned);
assert(run({ explanation: duplicate }).records.some((record) => record.reasons.includes("duplicate-incompatible-material-lineage")));

console.log(JSON.stringify({
  result: "PASS",
  eligibleRecords: eligible.records.length,
  historicalDisposition: "unavailable",
  revokedDisposition: "withheld",
  deterministic: true,
  rawContentDisclosed: false,
}));
