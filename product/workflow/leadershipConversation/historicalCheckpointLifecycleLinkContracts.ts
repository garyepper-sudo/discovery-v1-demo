import { leadershipDigest, leadershipId, leadershipStableSerialize } from "./determinism";

export const HISTORICAL_CHECKPOINT_LIFECYCLE_LINK_CONTRACT_VERSION = "1" as const;
export type HistoricalCheckpointLifecycleLinkKindV1 = "product-decision-draft"|"decision-review"|"observed-outcome"|"learning";
export type HistoricalCheckpointLifecycleOwnerTypeV1 = "product-decision-draft"|"executive-review"|"executive-learning";
export type HistoricalCheckpointLifecyclePersistenceV1 = "organization-runtime-event"|"organization-runtime-review"|"organization-runtime-learning";

export type HistoricalCheckpointUnderstandingRevisionBindingV1={
  stableUnderstandingId:string;
  revisionId:string;
  revisionReceiptDigest:string;
  confidenceDigest:string;
  uncertaintyDigest:string;
  materialLineageDigest:string;
};

export type HistoricalCheckpointLifecycleLinkV1={
  contractVersion:"1";organizationId:string;productQuestionId:string;productWorkflowId:string;
  checkpointId:string;checkpointRevision:string;checkpointHeaderDigest:string;checkpointPackageDigest:string;
  understanding:HistoricalCheckpointUnderstandingRevisionBindingV1;
  linkKind:HistoricalCheckpointLifecycleLinkKindV1;linkId:string;predecessorLinkId:string|null;
  canonicalOwnerType:HistoricalCheckpointLifecycleOwnerTypeV1;linkedRecordId:string;linkedRecordRevision:string;
  linkedOwnerEventId:string|null;linkedOwnerReceiptId:string|null;linkedOwnerIntegrityDigest:string;
  linkedOwnerPersistence:HistoricalCheckpointLifecyclePersistenceV1;linkedSubrecordId:string|null;
  actorRef:string;operation:"historical-checkpoint-lifecycle-link:publish";purpose:string;scopeDigest:string;
  sensitivity:"standard"|"restricted"|"private";occurredAt:string;
  checkpointAccessBindingRef:string;linkedAccessBindingRef:string;
  requestFingerprint:string;idempotencyKeyDigest:string;workflowEventId:string;workflowReceiptId:string;linkDigest:string;
};

export type HistoricalCheckpointLifecycleLinkReceiptV1={
  contractVersion:"1";receiptId:string;organizationId:string;productQuestionId:string;productWorkflowId:string;
  checkpointId:string;linkId:string;linkKind:HistoricalCheckpointLifecycleLinkKindV1;linkedRecordId:string;
  linkedRecordRevision:string;linkedSubrecordId:string|null;workflowEventId:string;workflowCasBaseRevision:string|null;
  requestFingerprint:string;idempotencyKeyDigest:string;occurredAt:string;receiptDigest:string;
};

export type HistoricalCheckpointLifecycleLinkProjectionV1={contractVersion:"1";linkId:string;linkKind:HistoricalCheckpointLifecycleLinkKindV1;checkpointId:string;linkedRecordId:string;linkedRecordRevision:string;linkedSubrecordId:string|null;occurredAt:string;accessResultDigests:[string,string];projectionDigest:string};
export type HistoricalCheckpointLifecyclePublicationResultV1={link:HistoricalCheckpointLifecycleLinkV1;receipt:HistoricalCheckpointLifecycleLinkReceiptV1;idempotent:boolean;repository:{disposition:"committed"|"replayed";committedWorkflowRepositoryRevision:string|null;currentWorkflowRepositoryRevision:string|null}};

export const historicalCheckpointLifecycleDigestV1=(value:unknown)=>leadershipDigest(leadershipStableSerialize(value));
export const createHistoricalCheckpointLifecycleLinkDigestV1=(value:Omit<HistoricalCheckpointLifecycleLinkV1,"linkDigest">)=>historicalCheckpointLifecycleDigestV1(value);
export const createHistoricalCheckpointLifecycleReceiptDigestV1=(value:Omit<HistoricalCheckpointLifecycleLinkReceiptV1,"receiptDigest">)=>historicalCheckpointLifecycleDigestV1(value);
export const createHistoricalCheckpointLifecycleProjectionDigestV1=(value:Omit<HistoricalCheckpointLifecycleLinkProjectionV1,"projectionDigest">)=>historicalCheckpointLifecycleDigestV1(value);
export const createHistoricalCheckpointLifecycleIdentityV1=(domain:"link"|"receipt"|"event",value:unknown)=>leadershipId(`historical-checkpoint-lifecycle-${domain}`,historicalCheckpointLifecycleDigestV1(value));

export function assertHistoricalCheckpointLifecycleLinkIntegrityV1(link:HistoricalCheckpointLifecycleLinkV1):void{
  const{linkDigest,...unsigned}=link;
  if(link.contractVersion!=="1"||linkDigest!==createHistoricalCheckpointLifecycleLinkDigestV1(unsigned))throw new Error("Historical checkpoint lifecycle link integrity failed.");
  if((link.linkKind==="observed-outcome")!==Boolean(link.linkedSubrecordId))throw new Error("Historical checkpoint lifecycle subrecord identity is invalid.");
  if(!link.understanding.stableUnderstandingId||!link.understanding.revisionId||!link.understanding.revisionReceiptDigest)throw new Error("Historical checkpoint Understanding revision binding is incomplete.");
  if(!link.checkpointAccessBindingRef||!link.linkedAccessBindingRef)throw new Error("Historical checkpoint lifecycle access binding is incomplete.");
}
export function assertHistoricalCheckpointLifecycleReceiptIntegrityV1(receipt:HistoricalCheckpointLifecycleLinkReceiptV1):void{const{receiptDigest,...unsigned}=receipt;if(receipt.contractVersion!=="1"||receiptDigest!==createHistoricalCheckpointLifecycleReceiptDigestV1(unsigned))throw new Error("Historical checkpoint lifecycle receipt integrity failed.");}
