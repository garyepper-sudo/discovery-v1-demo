import { createHash } from "node:crypto";
import type { CanonicalEvidenceScopeAttribution, CanonicalSourceScopeBinding } from "../../engine/v3/governance/canonicalScopeLineage";
import { canonicalScopeLineageDigest } from "../../engine/v3/governance/canonicalScopeLineage";
import type { GovernedScopeRef } from "../../engine/v3/governance/scopedGovernanceContext";
import { assertCanonicalProductMaterializationInstructionIntegrityV1 } from "../workflow/leadershipConversation/canonicalProductMaterializationContracts";
import type { LeadershipConversationArtifactStoreV1 } from "../workflow/leadershipConversation/contracts";
import type { CanonicalEvidenceContributionOperationRecordV1 } from "./contracts";

export const CHIEF_EVIDENCE_SUPPORT_RESOLUTION_CONTRACT = "DiscoveryChiefEvidenceSupportResolution001" as const;

export type ChiefEvidenceSupportResolutionInputV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  subjectId: string;
  requestedScope: GovernedScopeRef;
  purposeRef: string;
  sensitivity: "standard" | "restricted" | "private";
  evaluatedAt: string;
  evidenceIds: string[];
  replayKey: string;
};

export type ResolvedChiefEvidenceSupportItemV1 = {
  evidenceId: string;
  canonicalAdmissionId: string;
  attributionId: string;
  contributionOperationId: string;
  materializationInstructionId: string;
  proposalId: string;
  sourceBindingId: string;
  sourceContentVersionId: string;
  normalizedText: string;
  normalizedTextDigest: string;
  currentAccessResultDigest: string;
  resolutionDigest: string;
};

export type ResolvedCanonicalEvidenceSupportItemV1 = {
  resolutionKind: "canonical-evidence-admission";
  evidenceId: string;
  canonicalAdmissionId: string;
  attributionId: string;
  attributionVersion: number;
  attributionDigest: string;
  sourceBindingId: string;
  sourceContentVersionId: string;
  normalizedText: string;
  normalizedTextDigest: string;
  currentAccessResultDigest: string;
  bindingRevisionDigest: string;
  storageIntegrityDigest: string;
  resolutionDigest: string;
};

export type ChiefEvidenceSupportItemV1 = ResolvedChiefEvidenceSupportItemV1 | ResolvedCanonicalEvidenceSupportItemV1;

export type ChiefEvidenceSupportSafeProjectionV1 = {
  contractVersion: "1";
  authority: "non-authoritative";
  organizationId: string;
  questionId: string;
  supportDisposition: "resolved-for-server-assessment";
  boundedEvidenceReferences: Array<{ evidenceId: string; sourceReferenceDigest: string }>;
  uncertainty: [];
  withholdingReason: null;
  projectionDigest: string;
};

export type ChiefEvidenceSupportResolutionResultV1 = {
  serverOnly: {
    contract: typeof CHIEF_EVIDENCE_SUPPORT_RESOLUTION_CONTRACT;
    organizationId: string;
    questionId: string;
    authorizedScope: GovernedScopeRef;
    items: ChiefEvidenceSupportItemV1[];
    bundleDigest: string;
  };
  projection: ChiefEvidenceSupportSafeProjectionV1;
};

type ExactContentRead = {
  sourceBindingId: string;
  sourceContentVersionId: string;
  text: string;
  exactContentDigest: string;
  normalizedContentDigest: string;
  storageIntegrityDigest: string;
};

export type ChiefLeadershipEvidenceSupportResolverDependencies = {
  authorizeCurrent(input: ChiefEvidenceSupportResolutionInputV1): Promise<{ authorized: boolean; resultDigest: string }>;
  loadAdmissionOperations(organizationId: string): Promise<readonly CanonicalEvidenceContributionOperationRecordV1[]>;
  loadCanonicalEvidenceAncestry(organizationId: string): Promise<readonly CanonicalEvidenceScopeAttribution[]>;
  loadWorkflowStore(organizationId: string): Promise<LeadershipConversationArtifactStoreV1>;
  resolveCurrentSourceBinding(input: { request: ChiefEvidenceSupportResolutionInputV1; sourceBindingId: string; normalizedContentDigest: string }): Promise<CanonicalSourceScopeBinding | null>;
  readExactSourceContent(input: { request: ChiefEvidenceSupportResolutionInputV1; sourceBindingId: string; sourceContentVersionId: string }): Promise<ExactContentRead>;
  resolveExactSourceContentMetadata(input: { request: ChiefEvidenceSupportResolutionInputV1; sourceBindingId: string; normalizedContentDigest: string }): Promise<{ sourceContentVersionId: string } | null>;
};

const stable = (value: unknown): string => Array.isArray(value)
  ? `[${value.map(stable).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.keys(value as object).sort().map(key => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`
    : JSON.stringify(value);
const digest = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
const fail = (): never => { throw Object.assign(new Error("Claim-support source resolution unavailable."), { code: "CLAIM_SUPPORT_SOURCE_RESOLUTION_UNAVAILABLE" }); };
const exact = (value: string): boolean => value.trim() === value && value.length > 0 && value !== "*";

function validateRecord(record: CanonicalEvidenceContributionOperationRecordV1): void {
  const { recordDigest, ...unsigned } = record;
  if (record.kind !== "canonical-evidence-contribution-operation" || record.contractVersion !== "1" || recordDigest !== digest(unsigned)) fail();
  const { batchDigest, ...batch } = record.canonicalAdmissionBatch;
  if (record.canonicalAdmissionBatch.organizationId !== record.organizationId || batchDigest !== canonicalScopeLineageDigest(batch)) fail();
  const instruction = record.productMaterializationInstruction;
  if (!instruction) return fail();
  try { assertCanonicalProductMaterializationInstructionIntegrityV1(instruction); } catch { fail(); }
  if (instruction.organizationId !== record.organizationId || instruction.questionId !== record.questionId || instruction.canonicalOperationId !== record.contributionOperationId || instruction.requestFingerprint !== record.requestFingerprint) fail();
}

function sameScope(binding: CanonicalSourceScopeBinding, request: ChiefEvidenceSupportResolutionInputV1): boolean {
  return binding.assertions.some(value => value.scope.organizationId === request.requestedScope.organizationId && value.scope.type === request.requestedScope.type && value.scope.id === request.requestedScope.id);
}

export class ChiefLeadershipEvidenceSupportResolver {
  constructor(private readonly dependencies: ChiefLeadershipEvidenceSupportResolverDependencies) {}

  private abstain(request: ChiefEvidenceSupportResolutionInputV1): ChiefEvidenceSupportResolutionResultV1 {
    const bundleUnsigned = {
      contract: CHIEF_EVIDENCE_SUPPORT_RESOLUTION_CONTRACT,
      organizationId: request.organizationId,
      questionId: request.questionId,
      authorizedScope: request.requestedScope,
      replayKey: request.replayKey,
      items: [],
    };
    const bundleDigest = digest(bundleUnsigned);
    const projectionUnsigned = {
      contractVersion: "1" as const,
      authority: "non-authoritative" as const,
      organizationId: request.organizationId,
      questionId: request.questionId,
      supportDisposition: "resolved-for-server-assessment" as const,
      boundedEvidenceReferences: [],
      uncertainty: [] as [],
      withholdingReason: null,
    };
    return {
      serverOnly: {
        contract: CHIEF_EVIDENCE_SUPPORT_RESOLUTION_CONTRACT,
        organizationId: request.organizationId,
        questionId: request.questionId,
        authorizedScope: request.requestedScope,
        items: [],
        bundleDigest,
      },
      projection: { ...projectionUnsigned, projectionDigest: digest({ ...projectionUnsigned, bundleDigest }) },
    };
  }

  async resolve(request: ChiefEvidenceSupportResolutionInputV1): Promise<ChiefEvidenceSupportResolutionResultV1> {
    if (request.contractVersion !== "1" || request.organizationId !== request.requestedScope.organizationId || !exact(request.subjectId) || !exact(request.questionId) || !exact(request.purposeRef) || !exact(request.replayKey) || new Set(request.evidenceIds).size !== request.evidenceIds.length) fail();
    const access = await this.dependencies.authorizeCurrent(request);
    if (!access.authorized || !exact(access.resultDigest)) fail();
    if (request.evidenceIds.length === 0) return this.abstain(request);
    const [records, ancestry, workflow] = await Promise.all([this.dependencies.loadAdmissionOperations(request.organizationId), this.dependencies.loadCanonicalEvidenceAncestry(request.organizationId), this.dependencies.loadWorkflowStore(request.organizationId)]);
    if (workflow.organizationId !== request.organizationId) fail();
    const items: ChiefEvidenceSupportItemV1[] = [];
    for (const evidenceId of [...request.evidenceIds].sort()) {
      const matches = records.flatMap(record => record.organizationId === request.organizationId && record.questionId === request.questionId
        ? record.canonicalAdmissionBatch.admissions.filter(item => item.canonicalEvidenceId === evidenceId).map(item => ({ record, item }))
        : []);
      if (matches.length === 0) {
        try {
          const candidates = ancestry.filter(value => value.organizationId === request.organizationId && value.evidenceId === evidenceId);
          const latestVersion = Math.max(...candidates.map(value => value.attributionVersion));
          const latest = candidates.filter(value => value.attributionVersion === latestVersion);
          if (latest.length !== 1 || latest[0]!.sourceBindingIds.length !== 1) return this.abstain(request);
          const attribution = latest[0]!;
          const { digest: attributionDigest, attributionId: _attributionId, ...unsignedAttribution } = attribution;
          if (attributionDigest !== canonicalScopeLineageDigest(unsignedAttribution)
            || !attribution.assertions.some(value => value.scope.organizationId === request.requestedScope.organizationId && value.scope.type === request.requestedScope.type && value.scope.id === request.requestedScope.id)) return this.abstain(request);
          const sourceBindingId = attribution.sourceBindingIds[0]!;
          const binding = await this.dependencies.resolveCurrentSourceBinding({ request, sourceBindingId, normalizedContentDigest: "" });
          if (!binding || binding.bindingId !== sourceBindingId || binding.organizationId !== request.organizationId || binding.purposeRef !== request.purposeRef || binding.availability !== "available" || !sameScope(binding, request)) return this.abstain(request);
          const metadata = await this.dependencies.resolveExactSourceContentMetadata({ request, sourceBindingId, normalizedContentDigest: binding.source.normalizedContentDigest });
          if (!metadata?.sourceContentVersionId) return this.abstain(request);
          const content = await this.dependencies.readExactSourceContent({ request, sourceBindingId, sourceContentVersionId: metadata.sourceContentVersionId });
          if (content.sourceBindingId !== sourceBindingId || content.sourceContentVersionId !== metadata.sourceContentVersionId || content.normalizedContentDigest !== binding.source.normalizedContentDigest || !exact(content.storageIntegrityDigest)) return this.abstain(request);
          const normalizedText = content.text.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").replace(/^(?:[ \t]*\n)+|(?:\n[ \t]*)+$/g, "");
          if (!normalizedText) return this.abstain(request);
          const normalizedTextDigest = digest(normalizedText);
          const unsigned = {
            resolutionKind: "canonical-evidence-admission" as const,
            evidenceId,
            canonicalAdmissionId: attribution.evidenceAdmissionId,
            attributionId: attribution.attributionId,
            attributionVersion: attribution.attributionVersion,
            attributionDigest: attribution.digest,
            sourceBindingId,
            sourceContentVersionId: metadata.sourceContentVersionId,
            normalizedTextDigest,
            currentAccessResultDigest: access.resultDigest,
            bindingRevisionDigest: binding.digest,
            storageIntegrityDigest: content.storageIntegrityDigest,
          };
          items.push({ ...unsigned, normalizedText, resolutionDigest: digest(unsigned) });
        } catch {
          return this.abstain(request);
        }
        continue;
      }
      if (matches.length !== 1) fail();
      const { record, item } = matches[0]!;
      validateRecord(record);
      if (item.sourceBindings.length !== 1) fail();
      const instruction = record.productMaterializationInstruction!;
      const proposals = workflow.proposals.filter(proposal => proposal.organizationId === request.organizationId && proposal.questionId === request.questionId && proposal.conversationId === instruction.conversationId && proposal.proposalId === instruction.proposalId && proposal.kind === "evidence-candidate");
      if (proposals.length !== 1) fail();
      const proposal = proposals[0]!, lineageBinding = item.sourceBindings[0]!;
      const uploads = workflow.uploadReceipts.filter(upload => upload.uploadReceiptId === proposal.uploadReceiptId && upload.organizationId === request.organizationId && upload.questionId === request.questionId && upload.conversationId === proposal.conversationId);
      if (uploads.length !== 1 || proposal.sourceBindingId !== lineageBinding.sourceBindingId || uploads[0]!.sourceBindingId !== proposal.sourceBindingId || uploads[0]!.sourceContentVersionId !== proposal.sourceContentVersionId || uploads[0]!.normalizedContentDigest !== lineageBinding.normalizedContentDigest) fail();
      const binding = await this.dependencies.resolveCurrentSourceBinding({ request, sourceBindingId: proposal.sourceBindingId, normalizedContentDigest: lineageBinding.normalizedContentDigest });
      if (!binding || binding.bindingId !== proposal.sourceBindingId || binding.organizationId !== request.organizationId || binding.purposeRef !== request.purposeRef || binding.availability !== "available" || binding.source.sourceId !== lineageBinding.sourceId || binding.source.sourceVersion !== lineageBinding.sourceVersion || binding.source.normalizedContentDigest !== lineageBinding.normalizedContentDigest || !sameScope(binding, request)) fail();
      if (!binding) fail();
      const authorizedBinding = binding!;
      const content = await this.dependencies.readExactSourceContent({ request, sourceBindingId: proposal.sourceBindingId, sourceContentVersionId: proposal.sourceContentVersionId });
      if (content.sourceBindingId !== proposal.sourceBindingId || content.sourceContentVersionId !== proposal.sourceContentVersionId || content.exactContentDigest !== uploads[0]!.exactContentDigest || content.normalizedContentDigest !== uploads[0]!.normalizedContentDigest || !exact(content.storageIntegrityDigest)) fail();
      const normalizedText = content.text.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").replace(/^(?:[ \t]*\n)+|(?:\n[ \t]*)+$/g, "");
      const normalizedTextDigest = digest(normalizedText);
      const unsigned = { evidenceId, canonicalAdmissionId: item.canonicalAdmissionId, attributionId: item.attributionId, contributionOperationId: record.contributionOperationId, materializationInstructionId: instruction.instructionId, proposalId: proposal.proposalId, sourceBindingId: proposal.sourceBindingId, sourceContentVersionId: proposal.sourceContentVersionId, normalizedTextDigest, currentAccessResultDigest: access.resultDigest, recordDigest: record.recordDigest, instructionDigest: instruction.instructionDigest, proposalPayloadDigest: proposal.payloadDigest, uploadReceiptDigest: uploads[0]!.sourceContentWriteReceiptDigest, bindingRevisionDigest: authorizedBinding.digest, storageIntegrityDigest: content.storageIntegrityDigest };
      items.push({ evidenceId, canonicalAdmissionId: item.canonicalAdmissionId, attributionId: item.attributionId, contributionOperationId: record.contributionOperationId, materializationInstructionId: instruction.instructionId, proposalId: proposal.proposalId, sourceBindingId: proposal.sourceBindingId, sourceContentVersionId: proposal.sourceContentVersionId, normalizedText, normalizedTextDigest, currentAccessResultDigest: access.resultDigest, resolutionDigest: digest(unsigned) });
    }
    const resolutionKinds = new Set(items.map(item => "resolutionKind" in item ? item.resolutionKind : "leadership-conversation-contribution"));
    if (resolutionKinds.size > 1 || [...resolutionKinds].some(value => value !== "canonical-evidence-admission" && value !== "leadership-conversation-contribution")) fail();
    const bundleUnsigned = { contract: CHIEF_EVIDENCE_SUPPORT_RESOLUTION_CONTRACT, organizationId: request.organizationId, questionId: request.questionId, authorizedScope: request.requestedScope, replayKey: request.replayKey, items: items.map(({ normalizedText: _protected, ...item }) => item) };
    const bundleDigest = digest(bundleUnsigned);
    const projectionUnsigned = { contractVersion: "1" as const, authority: "non-authoritative" as const, organizationId: request.organizationId, questionId: request.questionId, supportDisposition: "resolved-for-server-assessment" as const, boundedEvidenceReferences: items.map(item => ({ evidenceId: item.evidenceId, sourceReferenceDigest: digest([item.sourceBindingId, item.sourceContentVersionId]) })), uncertainty: [] as [], withholdingReason: null };
    return { serverOnly: { contract: CHIEF_EVIDENCE_SUPPORT_RESOLUTION_CONTRACT, organizationId: request.organizationId, questionId: request.questionId, authorizedScope: request.requestedScope, items, bundleDigest }, projection: { ...projectionUnsigned, projectionDigest: digest({ ...projectionUnsigned, bundleDigest }) } };
  }
}
