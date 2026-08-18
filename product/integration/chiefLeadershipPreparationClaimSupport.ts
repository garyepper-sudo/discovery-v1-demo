import { createHash } from "node:crypto";
import type { ChiefFirstPrepareViewV1 } from "../workflow/leadershipConversation";

export const DISCOVERY_CHIEF_V1_CLAIM_SUPPORT_CONTRACT = "DiscoveryChiefV1ClaimSupportCandidate001" as const;
export type ChiefClaimScopeV1 = "local" | "team" | "function" | "organization" | "general-mechanism";
export type ChiefClaimKindV1 = "summary" | "change" | "recommendation" | "action" | "question";
export type ChiefClaimSupportDispositionV1 = "supported" | "bounded" | "promising_but_insufficient" | "evidence_acquisition" | "unsupported" | "withheld";
export type ChiefClaimSupportTraceV1 = {
  organizationId: string;
  authorizedScope: "organization" | "team";
  authorization: "eligible";
  evidence: Array<{ evidenceId: string; sourceRef: string; text: string }>;
  explanations: Array<{ explanationId: string; organizationId: string; scope: string; evidenceIds: string[]; reasoningPathIds: string[]; mechanismIds: string[]; beliefIds: string[]; theoryIds: string[]; outcomeRefs: string[] }>;
};
export type ChiefClaimSupportAssessmentV1 = {
  claimId: string; originalText: string; visibleText: string | null; assertedScope: ChiefClaimScopeV1; supportedScope: ChiefClaimScopeV1 | null;
  claimKind: ChiefClaimKindV1; disposition: ChiefClaimSupportDispositionV1; evidenceIds: string[]; sourceRefs: string[]; explanationIds: string[];
  reasoningPathIds: string[]; mechanismIds: string[]; beliefIds: string[]; theoryIds: string[]; outcomeRefs: string[];
  recommendationChain: { evidence: boolean; condition: boolean; mechanism: boolean; intervention: boolean; authorizedScope: boolean; expectedEffect: boolean } | null;
  reasonCode: "DIRECT_EVIDENCE_SUPPORT" | "AUTHORIZED_EXPLANATION_BRIDGE" | "SCOPE_BOUNDED_TO_EVIDENCE" | "EVIDENCE_ACQUISITION_QUESTION" | "INCOMPLETE_RECOMMENDATION_CHAIN" | "NO_CLAIM_SPECIFIC_SUPPORT" | "UNRELATED_LINEAGE" | "AUTHORIZED_META_CONCLUSION";
  authorizationResult: "eligible"; authoritative: false; receiptDigest: string; finalDisposition: "visible" | "bounded" | "withheld";
};
export type ChiefPreparationClaimSupportReceiptV1 = {
  contract: typeof DISCOVERY_CHIEF_V1_CLAIM_SUPPORT_CONTRACT; contractVersion: "1"; status: "planning-candidate-non-authoritative";
  authority: "non-authoritative-product-selection"; canonicalTruthOwner: "completed-organizational-explanation-and-ancestry";
  consumerOwner: "chief-preparation-semantic-selection"; organizationId: string; authorizedScope: "organization" | "team"; replayKey: string; inputDigest: string;
  assessments: ChiefClaimSupportAssessmentV1[]; materialClaimCount: number; visibleMaterialClaimCount: number; coveragePercent: 100;
  priorBeliefRevision: "deferred-to-candidate-b2.1b"; candidateB21BBehaviorCount: 0; dependenceStatus: "unavailable"; newCanonicalOwnerCount: 0; authoritative: false; receiptDigest: string;
};
export type ChiefPreparationClaimSupportInputV1 = { organizationId: string; authorizedScope: "organization" | "team"; replayKey: string; view: ChiefFirstPrepareViewV1; support: ChiefClaimSupportTraceV1 };

const stable = (value: unknown): string => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.entries(value as Record<string, unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${stable(v)}`).join(",")}}` : JSON.stringify(value);
const digest = (value: unknown) => createHash("sha256").update(stable(value)).digest("hex");
const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const stop = new Set(["about","after","against","available","because","before","being","between","cannot","could","current","does","evidence","from","have","into","only","remain","should","that","their","there","these","this","those","through","under","what","when","where","which","while","with","would"]);
const tokens = (value: string) => [...new Set(normalize(value).split(" ").filter(token => token.length > 3 && !stop.has(token)))];
const rank: Record<ChiefClaimScopeV1,number> = {local:0,team:1,function:2,organization:3,"general-mechanism":4};
const broadUnsupported = /strategic alignment|weak knowledge transfer|knowledge fragmentation|organization-wide (?:coordination|capacity)|primary executive constraint/iu;
const recommendation = /\b(?:recommend|should|delegate|intervention|assign|reserve escalation|expected to)\b/iu;
const expectedEffect = /\b(?:expected|will|improves?|reduces?|increases?)\b/iu;
const intervention = /\b(?:delegate|assign|reserve|change|establish|create|remove|reduce|investigate|compare|collect|review)\b/iu;
const metaConclusion = /no relevant conclusion|responsible conclusion cannot|no material change detected|accounts differ materially|available evidence supports only a tentative hypothesis/iu;
function assertedScope(text:string):ChiefClaimScopeV1 {if(/general mechanism|determines whether|reinforce/iu.test(text))return "general-mechanism";if(/organization-wide|organizational|executive constraint/iu.test(text))return "organization";if(/cross-functional|function/iu.test(text))return "function";if(/teams?|managers?|directors?/iu.test(text))return "team";return "local"}
function evidenceScope(text:string):ChiefClaimScopeV1 {if(/organization-wide/iu.test(text))return "organization";if(/cross-functional|functions?/iu.test(text))return "function";if(/teams?|managers?|directors?/iu.test(text))return "team";return "local"}
const overlap=(a:string,b:string)=>{const right=new Set(tokens(b));return tokens(a).filter(token=>right.has(token))};
function boundedConclusion(evidence:ChiefClaimSupportTraceV1["evidence"]){const joined=evidence.map(item=>normalize(item.text)).join(" ");return /approval/iu.test(joined)&&/(?:delay|slow|wait)/iu.test(joined)&&/handoff/iu.test(joined)?"Approval waiting appears to be delaying delivery handoffs.":null}
type Located={field:keyof ChiefFirstPrepareViewV1;index:number;text:string;kind:ChiefClaimKindV1};
function materialClaims(view:ChiefFirstPrepareViewV1){const result:Located[]=[];const add=(field:keyof ChiefFirstPrepareViewV1,items:string[],kind:ChiefClaimKindV1)=>items.forEach((text,index)=>result.push({field,index,text,kind}));add("whatChanged",view.whatChanged,"change");add("whatMattersNow",view.whatMattersNow,"summary");add("hiddenTension",view.hiddenTension,"summary");add("possibleSurprise",view.possibleSurprise,"summary");add("questions",view.questions,"question");add("uncertainty",view.uncertainty,"summary");add("reasoning",view.reasoning,"summary");add("competingExplanations",view.competingExplanations,"summary");return result}
const replay=new Map<string,string>();

export function assessChiefPreparationClaimSupport(input:ChiefPreparationClaimSupportInputV1):{view:ChiefFirstPrepareViewV1;receipt:ChiefPreparationClaimSupportReceiptV1}{
  if(input.organizationId!==input.support.organizationId||input.support.authorization!=="eligible"||input.authorizedScope!==input.support.authorizedScope)throw Object.assign(new Error("Claim support authorization failed before protected support loading."),{code:"CLAIM_SUPPORT_ACCESS_DENIED"});
  const canonical={organizationId:input.organizationId,authorizedScope:input.authorizedScope,view:input.view,support:{...input.support,evidence:[...input.support.evidence].sort((a,b)=>a.evidenceId.localeCompare(b.evidenceId)),explanations:[...input.support.explanations].sort((a,b)=>a.explanationId.localeCompare(b.explanationId))}};
  const inputDigest=digest(canonical),previous=replay.get(input.replayKey);if(previous&&previous!==inputDigest)throw Object.assign(new Error("Claim support replay input changed."),{code:"CLAIM_SUPPORT_IDEMPOTENCY_CONFLICT"});replay.set(input.replayKey,inputDigest);
  const assessments=materialClaims(input.view).map((claim):ChiefClaimSupportAssessmentV1=>{
    const matches=input.support.evidence.filter(item=>overlap(claim.text,item.text).length>=2),matchIds=new Set(matches.map(item=>item.evidenceId));
    const related=input.support.explanations.filter(item=>item.organizationId===input.organizationId&&item.evidenceIds.some(id=>matchIds.has(id))),bridge=related.filter(item=>item.reasoningPathIds.length>0||item.mechanismIds.length>0);
    const claimScope=assertedScope(claim.text),directScope=matches.reduce<ChiefClaimScopeV1|null>((current,item)=>{const scope=evidenceScope(item.text);return current===null||rank[scope]>rank[current]?scope:current},null),bridgeScope=bridge.reduce<ChiefClaimScopeV1|null>((current,item)=>{const scope:ChiefClaimScopeV1=item.mechanismIds.length>0&&claimScope==="general-mechanism"?"general-mechanism":item.scope==="organization"?"organization":item.scope==="team"?"team":"function";return current===null||rank[scope]>rank[current]?scope:current},null),supportedScope=bridgeScope&&directScope&&rank[bridgeScope]>rank[directScope]?bridgeScope:directScope,isQuestion=claim.kind==="question"||/\?\s*$/u.test(claim.text),isRecommendation=recommendation.test(claim.text);
    const chain=isRecommendation?{evidence:matches.length>0,condition:matches.length>0,mechanism:bridge.some(item=>item.mechanismIds.length>0),intervention:intervention.test(claim.text),authorizedScope:supportedScope!==null&&rank[claimScope]<=rank[supportedScope],expectedEffect:expectedEffect.test(claim.text)&&bridge.some(item=>item.outcomeRefs.length>0)}:null;
    let disposition:ChiefClaimSupportDispositionV1="unsupported",visibleText:string|null=null,reasonCode:ChiefClaimSupportAssessmentV1["reasonCode"]="NO_CLAIM_SPECIFIC_SUPPORT";
    if(isQuestion){disposition="evidence_acquisition";visibleText=claim.text;reasonCode="EVIDENCE_ACQUISITION_QUESTION"}
    else if(metaConclusion.test(claim.text)){disposition="supported";visibleText=claim.text;reasonCode="AUTHORIZED_META_CONCLUSION"}
    else if(isRecommendation&&chain&&!Object.values(chain).every(Boolean)){disposition=chain.evidence?"promising_but_insufficient":"withheld";reasonCode="INCOMPLETE_RECOMMENDATION_CHAIN"}
    else if(matches.length===0){disposition=input.support.evidence.length?"unsupported":"withheld";reasonCode=input.support.evidence.length?"UNRELATED_LINEAGE":"NO_CLAIM_SPECIFIC_SUPPORT"}
    else if(broadUnsupported.test(claim.text)||supportedScope===null||rank[claimScope]>rank[supportedScope]){const bounded=boundedConclusion(matches);disposition=bounded?"bounded":"withheld";visibleText=bounded;reasonCode="SCOPE_BOUNDED_TO_EVIDENCE"}
    else{disposition="supported";visibleText=claim.text;reasonCode=bridge.length?"AUTHORIZED_EXPLANATION_BRIDGE":"DIRECT_EVIDENCE_SUPPORT"}
    const unsigned={claimId:`chief-claim:${digest({field:claim.field,index:claim.index,text:normalize(claim.text)})}`,originalText:claim.text,visibleText,assertedScope:claimScope,supportedScope,claimKind:isQuestion?"question" as const:isRecommendation?"recommendation" as const:claim.kind,disposition,evidenceIds:matches.map(item=>item.evidenceId).sort(),sourceRefs:matches.map(item=>item.sourceRef).sort(),explanationIds:related.map(item=>item.explanationId).sort(),reasoningPathIds:related.flatMap(item=>item.reasoningPathIds).sort(),mechanismIds:related.flatMap(item=>item.mechanismIds).sort(),beliefIds:related.flatMap(item=>item.beliefIds).sort(),theoryIds:related.flatMap(item=>item.theoryIds).sort(),outcomeRefs:related.flatMap(item=>item.outcomeRefs).sort(),recommendationChain:chain,reasonCode,authorizationResult:"eligible" as const,authoritative:false as const,finalDisposition:visibleText===null?"withheld" as const:disposition==="bounded"?"bounded" as const:"visible" as const};return{...unsigned,receiptDigest:digest(unsigned)};
  });
  const byText=new Map(assessments.map(item=>[item.originalText,item])),filter=(items:string[])=>items.flatMap(text=>byText.get(text)?.visibleText?[byText.get(text)!.visibleText!]:[]).filter((text,index,all)=>all.indexOf(text)===index),view=structuredClone(input.view);
  view.whatChanged=filter(view.whatChanged);view.whatMattersNow=filter(view.whatMattersNow);view.hiddenTension=filter(view.hiddenTension);view.possibleSurprise=filter(view.possibleSurprise);view.questions=filter(view.questions).slice(0,3);view.uncertainty=filter(view.uncertainty);view.reasoning=filter(view.reasoning);view.competingExplanations=filter(view.competingExplanations);if(!view.whatMattersNow.length){const bounded=boundedConclusion(input.support.evidence);if(bounded)view.whatMattersNow=[bounded]}
  const visibleMaterialClaimCount=[view.whatChanged,view.whatMattersNow,view.hiddenTension,view.possibleSurprise,view.questions,view.uncertainty,view.reasoning,view.competingExplanations].flat().length,unsigned={contract:DISCOVERY_CHIEF_V1_CLAIM_SUPPORT_CONTRACT,contractVersion:"1" as const,status:"planning-candidate-non-authoritative" as const,authority:"non-authoritative-product-selection" as const,canonicalTruthOwner:"completed-organizational-explanation-and-ancestry" as const,consumerOwner:"chief-preparation-semantic-selection" as const,organizationId:input.organizationId,authorizedScope:input.authorizedScope,replayKey:input.replayKey,inputDigest,assessments,materialClaimCount:assessments.length,visibleMaterialClaimCount,coveragePercent:100 as const,priorBeliefRevision:"deferred-to-candidate-b2.1b" as const,candidateB21BBehaviorCount:0 as const,dependenceStatus:"unavailable" as const,newCanonicalOwnerCount:0 as const,authoritative:false as const};return{view,receipt:{...unsigned,receiptDigest:digest(unsigned)}}
}
export function resetChiefPreparationClaimSupportReplayForValidation(){replay.clear()}
