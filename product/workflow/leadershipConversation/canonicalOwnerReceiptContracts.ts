import type { CanonicalEvidenceAdmissionOperationItemV1 } from "../../../engine/v3/governance/canonicalScopeLineage";
import type { DigestAudit } from "./contracts";

export type LeadershipConversationCanonicalChangeFactsV1 = {
  proposalRouted: true;
  productArtifactRecorded: boolean;
  evidenceAdmitted: boolean;
  runtimeRepository: "changed" | "unchanged";
  organizationalUnderstanding: "changed" | "unchanged" | "undetermined";
  answer: "changed" | "unchanged" | "undetermined";
  unknown: "changed" | "unchanged" | "undetermined";
  learning: "changed" | "unchanged" | "undetermined";
};

type Common = Omit<DigestAudit, "contentDigest"> & {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  conversationId: string;
  proposalId: string;
  dispositionReceiptId: string;
  sourceProposalContractVersion?: "1" | "2";
  governedScopeBindingDigest?: string;
  integrationReceiptId: string;
  integrationOperationId: string;
  canonicalOperation: string;
  routedAt: string;
  canonicalResultDigest: string;
  changeFacts: LeadershipConversationCanonicalChangeFactsV1;
  receiptDigest: string;
};

export type LeadershipConversationCanonicalRoutingReceiptV1 =
  | (Common & {
      ownerKind: "evidence";
      sourceBindingId: string;
      sourceContentVersionId: string;
      contributionOperationId: string;
      operationDisposition: "admitted" | "partially-admitted" | "idempotent-replay" | "not-admitted";
      admissions: CanonicalEvidenceAdmissionOperationItemV1[];
      runtimeRevisionBefore: string;
      runtimeRevisionAfter: string;
      productQuestionRevisionBefore: number;
      productQuestionRevisionAfter: number;
      canonicalOperationResultDigest: string;
      canonicalUnderstandingChange:
        | {
            status: "available";
            resultDigest: string;
            disposition: "changed" | "unchanged";
            beforeCompositionSetDigest: string;
            afterCompositionSetDigest: string;
          }
        | {
            status: "unavailable";
            reason:
              | "historical-composition-state-unavailable"
              | "historical-operation-result-unavailable";
          };
    })
  | (Common & {
      ownerKind: "product-decision-draft";
      draftId: string;
      draftRevisionId: string;
      draftRevision: number;
      ownerReceiptId: string;
      ownerReceiptDigest: string;
      runtimeRevision: string;
      idempotent: boolean;
    })
  | (Common & {
      ownerKind: "unknown";
      unknownId: string;
      ownerEventId: string;
      ownerResult: string;
      runtimeRevision: string;
    })
  | (Common & {
      ownerKind: "follow-up-product-question";
      createdQuestionId: string;
      createdQuestionRevision: number;
      runtimeRevision: string;
    })
  | (Common & {
      ownerKind: "commitment" | "assumption-change" | "correction";
      workflowRecordId: string;
      targetRef: string | null;
      nonAuthoritative: true;
    });

export const canonicalRoutingCompatibilityReferences = (
  receipt: LeadershipConversationCanonicalRoutingReceiptV1,
): string[] => {
  switch (receipt.ownerKind) {
    case "evidence":
      return receipt.admissions.flatMap((item) => [item.canonicalEvidenceId, item.canonicalAdmissionId, item.attributionId]);
    case "product-decision-draft":
      return [receipt.draftId, receipt.draftRevisionId, receipt.ownerReceiptId];
    case "unknown":
      return [receipt.unknownId, receipt.ownerEventId];
    case "follow-up-product-question":
      return [receipt.createdQuestionId];
    default:
      return [receipt.workflowRecordId];
  }
};
