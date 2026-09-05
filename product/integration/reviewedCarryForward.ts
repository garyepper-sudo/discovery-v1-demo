import "server-only";
import {sourceScopedDigest,type SourceScopedCandidateV1,type SourceScopedItemV1,type SourceScopedSectionsV1,type SourceScopedTransportV1} from "../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import {analyzeDeterministicDevelopmentCandidate,type SourceScopedExecutiveAnalysisOwner} from "./sourceScopedExecutiveAnalysis";
import type {GovernedConsequenceScopeBindingV1,ProposalKind,ReviewedCarryForwardProposalProvenanceV1} from "../workflow/leadershipConversation/contracts";
import type {LeadershipConversationProductOperations} from "../workflow/leadershipConversation/operations";

const empty:never[]=[];
export const reviewedCarryForwardDevelopmentTransport:SourceScopedTransportV1=async({request})=>{
  const cite=(index:number)=>{const source=request.packet.sources[index%request.packet.sources.length]!;return{sourceId:source.sourceId,sourceVersion:source.sourceVersion,bodyDigest:source.bodyDigest,sourcePacketDigest:request.packet.packetDigest};};
  const item=(statement:string,index:number,factCheck:SourceScopedItemV1["factCheck"]="HUMAN REVIEW REQUIRED"):SourceScopedItemV1=>({statement,citations:[cite(index)],factCheck});
  const bodies=request.packet.sources.map(source=>source.body.toLowerCase()),contains=(...phrases:string[])=>phrases.some(phrase=>bodies.some(body=>body.includes(phrase)));
  const product=contains("product roadmap sequencing","governed interface contract","stable review boundary"),pipeline=!product&&contains("implementation portfolio status","delivery capacity summary"),profile=product?"product":pipeline?"pipeline":"northstar";
  const sections:SourceScopedSectionsV1=profile==="product"?{
    whatMattersNow:[item("Interface sequencing remains the most material product delivery constraint.",1,"PASS"),item("Product leadership must choose whether to delay the milestone or narrow its scope.",2)],
    whyItMatters:[item("Customer commitments depend on a stable review boundary, explicit ownership, and the governed interface contract.",1,"PASS")],
    competingExplanations:[item("Migration sequencing and owner acceptance may each account for the current delivery risk.",1)],whatChanged:empty,
    decisions:[item("Choose whether to delay the product milestone or narrow its scope.",2)],notDecided:[item("The roadmap sequence and resource trade-off remain unresolved.",1)],
    commitments:[item("Complete the governed interface contract before confirming the customer commitment.",1)],openQuestions:[item("Which scope reduction preserves the customer commitment without bypassing the review boundary?",2)],contradictions:empty,
    evidenceUncertainty:[item("The current sources do not establish whether schedule or scope is the safer trade-off.",2)],modelUncertainty:[item("This working interpretation is limited to the authorized product source packet.",0)],organizationalDisagreement:empty,
    attention:[item("Resolve product and engineering sequencing before the next customer milestone.",1)],whatWouldChangeAssessment:[item("A validated migration plan and owner acceptance would change the delivery-risk assessment.",1)]
  }:profile==="pipeline"?{
    whatMattersNow:[item("Pipeline reliability is at risk where commitments precede feasibility and dependency review.",1,"PASS"),item("Conversion and delivery-capacity evidence must be separated before revising the forecast.",2)],
    whyItMatters:[item("Date changes and unresolved dependencies can make current coverage look more reliable than delivery evidence supports.",1,"PASS")],
    competingExplanations:[item("Lead mix, conversion lag, premature commitments, and delivery capacity remain competing explanations.",2)],whatChanged:empty,
    decisions:[item("Hold forecast changes until segment movement and delivery capacity are compared.",1)],notDecided:[item("No source establishes which segment accounts for the largest current gap.",2)],
    commitments:[item("Review enterprise conversion and delivery capacity at the next commercial checkpoint.",1)],openQuestions:[item("Which segment accounts for the largest share of the coverage and conversion gap?",2)],contradictions:empty,
    evidenceUncertainty:[item("The current packet does not isolate segment conversion from delivery feasibility.",2)],modelUncertainty:[item("This working interpretation is limited to the authorized commercial source packet.",0)],organizationalDisagreement:empty,
    attention:[item("Compare segment movement, conversion, and delivery dependencies before changing the forecast.",1)],whatWouldChangeAssessment:[item("A controlled segment comparison with current delivery capacity would change the forecast-risk assessment.",2)]
  }:{
    whatMattersNow:[item("Cross-functional sequencing and unclear decision ownership remain the primary organization-wide delivery constraint.",1,"PASS"),item("Leadership needs to resolve dependencies before adding or reaffirming commitments.",2)],
    whyItMatters:[item("Unresolved ownership and overloaded specialist capacity can propagate delay across product, sales, and delivery.",1,"PASS")],
    competingExplanations:[item("Capacity, governance, sequencing, and premature commitments remain plausible competing explanations.",2)],whatChanged:empty,
    decisions:[item("Set one cross-functional sequence and name the tie-breaker for feasibility exceptions.",1)],notDecided:[item("The current sources do not establish one primary cause of delay.",2)],
    commitments:[item("Leadership will assign owners to the highest-risk dependencies before the next staff conversation.",1)],openQuestions:[item("Which unresolved dependency requires the next leadership decision?",2)],contradictions:empty,
    evidenceUncertainty:[item("Similar utilization produced different outcomes, so staffing alone is not established as the cause.",2)],modelUncertainty:[item("This working interpretation is limited to the authorized leadership source packet.",0)],organizationalDisagreement:empty,
    attention:[item("Resolve the cross-functional dependency with the widest delivery impact.",1)],whatWouldChangeAssessment:[item("A dependency-level comparison of sequencing, ownership, and capacity would change the assessment.",2)]
  };
  return{model:request.configuration.model,sections,usage:{inputTokens:0,outputTokens:0,totalTokens:0},latencyMs:0};
};

type Definition={kind:Extract<ProposalKind,"decision-draft"|"commitment"|"unknown"|"follow-up-question"|"assumption-change">;summary:string;targetRef:string|null;item:SourceScopedItemV1;evidentiaryStatus:ReviewedCarryForwardProposalProvenanceV1["evidentiaryStatus"]};
function definitions(candidate:SourceScopedCandidateV1):Definition[]{const first=(items:SourceScopedItemV1[])=>{if(items.length!==1)throw new Error("Reviewed carry-forward development candidate is unavailable.");return items[0]!;};return[
  {kind:"decision-draft",summary:first(candidate.sections.decisions).statement,targetRef:null,item:first(candidate.sections.decisions),evidentiaryStatus:"inference"},
  {kind:"commitment",summary:first(candidate.sections.commitments).statement,targetRef:null,item:first(candidate.sections.commitments),evidentiaryStatus:"inference"},
  {kind:"unknown",summary:first(candidate.sections.openQuestions).statement,targetRef:null,item:first(candidate.sections.openQuestions),evidentiaryStatus:"uncertainty"},
  {kind:"assumption-change",summary:first(candidate.sections.competingExplanations).statement,targetRef:null,item:first(candidate.sections.competingExplanations),evidentiaryStatus:"inference"},
  {kind:"follow-up-question",summary:first(candidate.sections.attention).statement,targetRef:null,item:first(candidate.sections.attention),evidentiaryStatus:"inference"},
];}

export async function admitDeterministicReviewedCarryForward(input:{analysisOwner:SourceScopedExecutiveAnalysisOwner;operations:LeadershipConversationProductOperations;userId:string;organizationId:string;questionId:string;conversationId:string;uploadReceiptId:string;preparedWorkPublicationDigest:string;materialLineageDigest:string;governedScopeBinding:GovernedConsequenceScopeBindingV1;idempotencyKey:string}){
  const seriesId=`leadership-conversation-series:${input.conversationId}`,result=await analyzeDeterministicDevelopmentCandidate(input.analysisOwner,{subjectId:input.userId,organizationId:input.organizationId,questionId:input.questionId,seriesId,occurrenceId:input.conversationId,question:"What should this Leadership Conversation carry forward?"},reviewedCarryForwardDevelopmentTransport);
  if(result.status!=="eligible"||result.dispatchCount!==1)throw new Error("Reviewed carry-forward development candidate is unavailable.");
  const candidate=result.candidate,items=definitions(candidate),mapped=items.map((definition,index)=>{const claimId=sourceScopedDigest({candidateDigest:candidate.candidateDigest,ordinal:index+1,kind:definition.kind,summary:definition.summary}),base={contractVersion:"1" as const,generationCategory:"deterministic-development" as const,candidateDigest:candidate.candidateDigest,claimId,sourcePacketDigest:candidate.sourcePacketDigest,requestDigest:candidate.requestDigest,configurationDigest:candidate.configurationDigest,preparedWorkPublicationDigest:input.preparedWorkPublicationDigest,materialLineageDigest:input.materialLineageDigest,evidentiaryStatus:definition.evidentiaryStatus,citations:definition.item.citations},provenanceBase=base;return{kind:definition.kind,summary:definition.summary,targetRef:definition.targetRef,provenanceBase};});
  await input.operations.admitReviewedCarryForwardProposals({userId:input.userId,organizationId:input.organizationId,questionId:input.questionId,conversationId:input.conversationId,uploadReceiptId:input.uploadReceiptId,governedScopeBinding:input.governedScopeBinding,candidate:{organizationId:candidate.organizationId,subjectId:candidate.subjectId,questionId:candidate.questionId,seriesId:candidate.seriesId,occurrenceId:candidate.occurrenceId,candidateDigest:candidate.candidateDigest,sourcePacketDigest:candidate.sourcePacketDigest,requestDigest:candidate.requestDigest,configurationDigest:candidate.configurationDigest},preparedWorkPublicationDigest:input.preparedWorkPublicationDigest,materialLineageDigest:input.materialLineageDigest,definitions:mapped,idempotencyKey:input.idempotencyKey});
  return{candidate,proposalCount:mapped.length};
}
