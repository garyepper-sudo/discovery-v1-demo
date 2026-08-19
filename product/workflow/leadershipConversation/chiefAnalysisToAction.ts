import { createHash } from "node:crypto";
import type { ChiefFirstPrepareViewV1 } from "./contracts";
import type { ChiefPreparationSemanticGateReceiptV1 } from "../../integration/chiefLeadershipPreparationSemanticGates";
import type { ChiefPreparationClaimSupportReceiptV1 } from "../../integration/chiefLeadershipPreparationClaimSupport";

export type ChiefNextMoveDispositionV1="act"|"decide"|"ask"|"learn"|"watch"|"owned-elsewhere"|"defer"|"no-action"|"abstain";
export type ChiefAnalysisToActionInputV1={organizationId:string;questionId:string;conversationId:string;meetingPurpose:string;intendedMeetingOutcome:string|null;view:ChiefFirstPrepareViewV1;semantic:ChiefPreparationSemanticGateReceiptV1;claimSupport:ChiefPreparationClaimSupportReceiptV1;supportProjectionDigest:string;permissionScope:"organization"|"team";exactOwnerRef?:string;exactDecisionRef?:string;exactEvidenceAcquisitionRef?:string;reviewCondition?:string;explicitDeferral?:{reason:string;revisitCondition:string};independentlyJustifiedNoAction?:{reason:string};idempotencyKey:string};
export type ChiefAnalysisToActionV1={contractVersion:"1";authority:"non-authoritative-product-assessment";organizationId:string;questionId:string;conversationId:string;meetingPurpose:string;strongestSupportedConclusion:string|null;whyItMatters:string|null;nextMoveDisposition:ChiefNextMoveDispositionV1;userFacingNextMove:string|null;whatWouldChangeTheView:string|null;exactOwnerRef:string|null;exactDecisionRef:string|null;exactEvidenceAcquisitionRef:string|null;watchOrReviewCondition:string|null;supportProjectionDigest:string;sourceViewDigest:string;reasonCode:string;omittedReasons:string[];lineage:string[];assessmentDigest:string};
const stable=(value:unknown):string=>Array.isArray(value)?`[${value.map(stable).join(",")}]`:value&&typeof value==="object"?`{${Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${stable(item)}`).join(",")}}`:JSON.stringify(value);
const digest=(value:unknown)=>createHash("sha256").update(stable(value)).digest("hex");
const replay=new Map<string,string>();
export function composeChiefAnalysisToActionV1(input:ChiefAnalysisToActionInputV1):ChiefAnalysisToActionV1{
  if(input.organizationId!==input.view.organizationId||input.questionId!==input.view.questionId||input.permissionScope!==input.claimSupport.authorizedScope||input.claimSupport.organizationId!==input.organizationId)throw new Error("Chief Analysis-to-Action scope is unavailable.");
  const inputDigest=digest(input),prior=replay.get(input.idempotencyKey);if(prior&&prior!==inputDigest)throw Object.assign(new Error("Chief Analysis-to-Action replay input changed."),{code:"ANALYSIS_TO_ACTION_IDEMPOTENCY_CONFLICT"});replay.set(input.idempotencyKey,inputDigest);
  const conclusion=input.view.whatMattersNow[0]??null,question=input.view.questions[0]??null,uncertainty=input.view.uncertainty[0]??input.view.competingExplanations[0]??null;
  let disposition:ChiefNextMoveDispositionV1="abstain",next:string|null=null,reason="INSUFFICIENT_CONTEXT";
  const supportedAction=input.claimSupport.assessments.find(item=>item.claimKind==="recommendation"&&item.finalDisposition!=="withheld"&&item.visibleText!==conclusion&&/^(?:identify|compare|review|change|assign|delegate|reserve|establish|remove|reduce|investigate|collect)\b/iu.test(item.visibleText??"")&&item.recommendationChain&&Object.values(item.recommendationChain).every(Boolean));
  if(input.explicitDeferral){disposition="defer";next=`Revisit this when ${input.explicitDeferral.revisitCondition}`;reason="EXPLICIT_DEFERRAL"}
  else if(input.exactDecisionRef&&input.semantic.sufficiency==="sufficient"){disposition="decide";next="Use the meeting to make the supported decision.";reason="EXACT_DECISION_CONTEXT"}
  else if(supportedAction){disposition="act";next=supportedAction.visibleText;reason="SUPPORTED_ACTION_CHAIN"}
  else if(input.semantic.contradiction==="material"&&question){disposition="ask";next=question;reason="DISCRIMINATING_QUESTION"}
  else if((input.semantic.sufficiency==="insufficient"||input.semantic.missingEvidence==="present")&&input.exactEvidenceAcquisitionRef&&question){disposition="learn";next=question;reason="SUPPORTED_EVIDENCE_NEED"}
  else if(input.exactOwnerRef&&input.reviewCondition){disposition="owned-elsewhere";next=`No intervention is needed before ${input.reviewCondition}`;reason="EXACT_OWNER_AND_REVIEW_PATH"}
  else if(input.reviewCondition&&conclusion){disposition="watch";next=`Review this when ${input.reviewCondition}`;reason="EXACT_REVIEW_CONDITION"}
  else if(input.independentlyJustifiedNoAction){disposition="no-action";reason="INDEPENDENT_NO_ACTION_JUSTIFICATION"}
  else if(input.semantic.change==="no-material-change"){reason="NO_MATERIAL_CHANGE_WITHOUT_INDEPENDENT_NEXT_MOVE"}
  else if(question){disposition="ask";next=question;reason="TRACEABLE_QUESTION"}
  const purpose=input.meetingPurpose.trim(),why=conclusion&&purpose&&!conclusion.toLowerCase().includes(purpose.toLowerCase())?`This bears directly on the meeting purpose: ${purpose}`:null;
  const change=uncertainty?`The view should change if resolving this uncertainty changes the supported interpretation: ${uncertainty}`:null,omitted=[!why&&"why-it-matters-unsupported",!change&&"change-condition-unsupported",!next&&"next-move-unsupported"].filter(Boolean) as string[];
  const unsigned={contractVersion:"1" as const,authority:"non-authoritative-product-assessment" as const,organizationId:input.organizationId,questionId:input.questionId,conversationId:input.conversationId,meetingPurpose:purpose,strongestSupportedConclusion:conclusion,whyItMatters:why,nextMoveDisposition:disposition,userFacingNextMove:next,whatWouldChangeTheView:change,exactOwnerRef:input.exactOwnerRef??null,exactDecisionRef:input.exactDecisionRef??null,exactEvidenceAcquisitionRef:input.exactEvidenceAcquisitionRef??null,watchOrReviewCondition:input.reviewCondition??input.explicitDeferral?.revisitCondition??null,supportProjectionDigest:input.supportProjectionDigest,sourceViewDigest:digest(input.view),reasonCode:reason,omittedReasons:omitted,lineage:[input.semantic.resultDigest,input.claimSupport.receiptDigest,input.supportProjectionDigest]};return{...unsigned,assessmentDigest:digest(unsigned)};
}
export function resetChiefAnalysisToActionReplayForValidation(){replay.clear()}
