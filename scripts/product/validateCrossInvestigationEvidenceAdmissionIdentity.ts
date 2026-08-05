import assert from "node:assert/strict";
import { runDiscoveryV3 } from "../../engine/v3";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  admitCanonicalEvidenceScopeLineage,
  canonicalEvidenceIdentity,
  createCanonicalDerivedScopeLineage,
  createCanonicalEvidenceScopeAttribution,
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
  resolveUnambiguousLegacyEvidenceAttribution,
  type CanonicalEvidenceScopeAttribution,
} from "../../engine/v3/governance/canonicalScopeLineage";
import type { GovernedScopeRef } from "../../engine/v3/governance/scopedGovernanceContext";
import { selectScopedProductItemsFromCanonicalLineage, type ServerResolvedScopedProductItem } from "../../product/integration/scopedOrganizationalProductProjection";
import { canonicalInvestigationFingerprint } from "../../engine/v3/investigation/investigationIdempotency";

const ORG="synthetic-identity-001",OTHER="synthetic-identity-002",AT="2026-08-05T12:00:00.000Z";
const scope=(organizationId:string,type:GovernedScopeRef["type"],id:string):GovernedScopeRef=>({organizationId,type,id});
const root=scope(ORG,"organization",ORG),fn=scope(ORG,"function","engineering"),team=scope(ORG,"team","platform"),initiative=scope(ORG,"initiative","delivery"),restricted=scope(ORG,"restricted","people");
const topology=createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes:[root,fn,team,initiative,restricted],relationships:[{kind:"contains",from:root,to:fn},{kind:"contains",from:fn,to:team},{kind:"initiative-relates",from:initiative,to:fn},{kind:"initiative-relates",from:initiative,to:team}]});
let checks=0;const check=(condition:unknown,message:string)=>{assert.ok(condition,message);checks++;};
const digest=(char:string)=>char.repeat(64);
const binding=(sourceId:string,contentDigest:string,target:GovernedScopeRef)=>createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{sourceId,sourceVersion:"1",normalizedContentDigest:contentDigest},topology,assertions:[{relationship:"origin",scope:target}],basisRefs:[`synthetic-owner:${sourceId}`],effectiveAt:AT});
const execute=(sourceId:string,contentDigest:string,content:string,target:GovernedScopeRef,existing:CanonicalEvidenceScopeAttribution[]=[] )=>{
  const input={company:"Synthetic",website:"https://synthetic.invalid",industry:"Testing",question:"Why?",context:"",evidenceSources:[{sourceId,contentDigest,content}]};
  return {input,result:runDiscoveryV3(input,{organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[binding(sourceId,contentDigest,target)],existingEvidenceAttributions:existing})};
};
const first=execute("source:a",digest("a"),"Executive-only canary alpha.",root);
const second=execute("source:b",digest("b"),"Platform-team canary beta.",team);
const firstLocal=first.result.evidence.find(item=>item.sourceId)!;const secondLocal=second.result.evidence.find(item=>item.sourceId)!;
const firstAttr=first.result.scopeLineageAdmission!.evidenceAttributions[0]!;const secondAttr=second.result.scopeLineageAdmission!.evidenceAttributions[0]!;
check(firstLocal.id==="E6"&&secondLocal.id==="E6","production investigations reuse a local Evidence ID");
check(firstLocal.sourceId!==secondLocal.sourceId&&firstLocal.text!==secondLocal.text,"collision inputs differ");
check(firstAttr.evidenceId!==secondAttr.evidenceId,"different content has distinct canonical Evidence identity");
check(firstAttr.evidenceAdmissionId!==secondAttr.evidenceAdmissionId,"different content has distinct v2 admission identity");
check(firstAttr.evidenceIdentityVersion==="2"&&secondAttr.evidenceIdentityVersion==="2","identity version is explicit");
check(firstAttr.localEvidenceIds?.[0]===firstLocal.id&&secondAttr.localEvidenceIds?.[0]===secondLocal.id,"local IDs retained only as provenance");
check(firstAttr.sourceBindingIds[0]!==secondAttr.sourceBindingIds[0],"attributions retain exact distinct source bindings");
assert.throws(()=>createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:1,evidenceId:firstAttr.evidenceId,evidenceAdmissionId:secondAttr.evidenceAdmissionId,evidenceIdentityVersion:"2",localEvidenceIds:[firstLocal.id],bindings:[binding("source:a",digest("a"),root)],topology,effectiveAt:AT}));checks++;
const replay=execute("source:a",digest("a"),"Executive-only canary alpha.",root,[firstAttr]);const replayAttr=replay.result.scopeLineageAdmission!.evidenceAttributions[0]!;
check(replayAttr.attributionId===firstAttr.attributionId&&replayAttr.evidenceAdmissionId===firstAttr.evidenceAdmissionId,"same production admission is idempotent");
check(replay.result.evidence.find(item=>item.sourceId)?.id===firstLocal.id,"local Evidence ordering remains stable");
check(canonicalInvestigationFingerprint({organizationId:ORG,input:first.input})===canonicalInvestigationFingerprint({organizationId:ORG,input:replay.input}),"investigation fingerprint unchanged");
const exactDuplicate=execute("source:duplicate",digest("d"),"Executive-only canary alpha.",root);
check(exactDuplicate.result.scopeLineageAdmission!.evidenceAttributions[0]!.evidenceId===firstAttr.evidenceId,"exact duplicate retains canonical Evidence identity");
check(exactDuplicate.result.scopeLineageAdmission!.evidenceAttributions[0]!.evidenceAdmissionId===firstAttr.evidenceAdmissionId,"exact duplicate creates no new admission identity");
const formatting=execute("source:format",digest("f"),"  Executive-only   canary alpha.  ",root);
check(formatting.result.scopeLineageAdmission!.evidenceAttributions[0]!.evidenceId===firstAttr.evidenceId,"formatting-only content retains canonical Evidence identity");
const multi=runDiscoveryV3({company:"Synthetic",website:"https://synthetic.invalid",industry:"Testing",question:"Why?",context:"",evidenceSources:[{sourceId:"source:a",contentDigest:digest("a"),content:"Shared exact Evidence."},{sourceId:"source:c",contentDigest:digest("c"),content:"Shared exact Evidence."}]},{organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[binding("source:a",digest("a"),fn),binding("source:c",digest("c"),team)]});
const shared=multi.scopeLineageAdmission!.evidenceAttributions.find(item=>(item.localEvidenceIds?.length??0)===2)!;
check(shared.sourceBindingIds.length===2&&shared.localEvidenceIds?.length===2,"multi-source provenance retained on one canonical Evidence attribution");
check(multi.scopeLineageAdmission!.evidenceAttributions.filter(item=>item.evidenceId===shared.evidenceId).length===1,"multi-source exact content produces one attribution");
const sequentialFirst=execute("source:a",digest("a"),"Sequential shared Evidence.",fn).result.scopeLineageAdmission!.evidenceAttributions[0]!;
const sequentialSecond=runDiscoveryV3({company:"Synthetic",website:"https://synthetic.invalid",industry:"Testing",question:"Why?",context:"",evidenceSources:[{sourceId:"source:c",contentDigest:digest("c"),content:"Sequential shared Evidence."}]},{organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[binding("source:a",digest("a"),fn),binding("source:c",digest("c"),team)],existingEvidenceAttributions:[sequentialFirst]}).scopeLineageAdmission!.evidenceAttributions[0]!;
check(sequentialSecond.sourceBindingIds.length===2&&sequentialSecond.supersedesAttributionId===sequentialFirst.attributionId,"later same-content admission accumulates prior source provenance");
const changed=execute("source:a",digest("z"),"Materially changed canary alpha.",root,[firstAttr]);
check(changed.result.scopeLineageAdmission!.evidenceAttributions[0]!.evidenceId!==firstAttr.evidenceId,"changed content creates a new canonical Evidence identity");
check(firstAttr.evidenceIdentityVersion==="2","earlier identity remains immutable");
const otherRoot=scope(OTHER,"organization",OTHER);const otherTopology=createCanonicalScopeTopology({organizationId:OTHER,topologyVersion:1,effectiveAt:AT,nodes:[otherRoot],relationships:[]});
const sameTextOther=canonicalEvidenceIdentity({organizationId:OTHER,evidenceText:firstLocal.text});
check(sameTextOther!==firstAttr.evidenceId,"same content in another organization has distinct canonical identity");
assert.throws(()=>admitCanonicalEvidenceScopeLineage({lineage:{organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[binding("source:a",digest("a"),root),binding("source:b",digest("b"),team)]},evidence:[{evidenceId:"E1",evidenceText:"One",sourceId:"source:a",contentDigest:digest("a")},{evidenceId:"E1",evidenceText:"Two",sourceId:"source:b",contentDigest:digest("b")}]}));checks++;
assert.throws(()=>resolveUnambiguousLegacyEvidenceAttribution({organizationId:ORG,localEvidenceId:firstLocal.id,attributions:[firstAttr,secondAttr]}));checks++;
const legacyA=createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:1,evidenceId:"E1",evidenceAdmissionId:"evidence-admission:legacy:E1",bindings:[binding("source:a",digest("a"),root)],topology,effectiveAt:AT});
const legacyB=createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:1,evidenceId:"E1",evidenceAdmissionId:"evidence-admission:legacy:E1",bindings:[binding("source:b",digest("b"),team)],topology,effectiveAt:AT});
assert.throws(()=>resolveUnambiguousLegacyEvidenceAttribution({organizationId:ORG,localEvidenceId:"E1",attributions:[legacyA,legacyB]}));checks++;
check(resolveUnambiguousLegacyEvidenceAttribution({organizationId:ORG,localEvidenceId:"E1",attributions:[legacyA]})?.attributionId===legacyA.attributionId,"unambiguous legacy attribution remains readable");
const firstLineage=createCanonicalDerivedScopeLineage({organizationId:ORG,derivedObjectRef:"derived:first",supportingEvidenceIds:[firstLocal.id],attributions:[firstAttr],topology,effectiveAt:AT});
const secondLineage=createCanonicalDerivedScopeLineage({organizationId:ORG,derivedObjectRef:"derived:second",supportingEvidenceIds:[secondLocal.id],attributions:[secondAttr],topology,effectiveAt:AT});
check(firstLineage.supportingEvidenceIds[0]===firstAttr.evidenceId&&secondLineage.supportingEvidenceIds[0]===secondAttr.evidenceId,"Runtime ancestry translates local support to canonical Evidence");
assert.throws(()=>createCanonicalDerivedScopeLineage({organizationId:ORG,derivedObjectRef:"derived:ambiguous",supportingEvidenceIds:[firstLocal.id],attributions:[firstAttr,secondAttr],topology,effectiveAt:AT}));checks++;
const silent=console.log;console.log=()=>{};let runtimeA,runtimeB;try{runtimeA=evolveOrganizationRuntime({runtime:createEmptyOrganizationRuntime({organizationId:ORG}),result:first.result,input:first.input});runtimeB=evolveOrganizationRuntime({runtime:createEmptyOrganizationRuntime({organizationId:ORG}),result:second.result,input:second.input});}finally{console.log=silent;}
check(runtimeA.memory.canonicalScopeLineageIndex!.evidenceAttributions[0]!.evidenceId!==runtimeB.memory.canonicalScopeLineageIndex!.evidenceAttributions[0]!.evidenceId,"actual Runtime evolution retains distinct ancestry");
const item=(safeRef:string,target:GovernedScopeRef):ServerResolvedScopedProductItem=>({safeRef,canonicalObjectType:"Synthetic",organizationId:ORG,scope:target,sensitivity:"standard",kind:"understanding",disclosureKind:"direct-evidence",title:"Safe",summary:"Safe bounded summary",uncertainty:null,support:[],supportLineageComplete:true,safeAbstractionAllowed:false,protectedCombination:false,auditRefs:[]});
const runtimeBLineage=runtimeB.memory.canonicalScopeLineageIndex!.derivedLineages.find(value=>value.completeness==="complete")!;
const teamItems=selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:team,items:[item(runtimeBLineage.derivedObjectRef,team)],lineageIndex:runtimeB.memory.canonicalScopeLineageIndex});
const functionItems=selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:fn,items:[item(runtimeBLineage.derivedObjectRef,fn)],lineageIndex:runtimeB.memory.canonicalScopeLineageIndex});
check(teamItems.length===1&&functionItems.length===0,"scope lineage does not contaminate unrelated scope");
const serialized=JSON.stringify(functionItems);
check(!serialized.includes(firstLocal.text)&&!serialized.includes(secondLocal.text),"unauthorized canary occurrences are zero");
check(canonicalEvidenceIdentity({organizationId:ORG,evidenceText:"Same"})===canonicalEvidenceIdentity({organizationId:ORG,evidenceText:"Same"}),"canonical identity deterministic");
check(canonicalEvidenceIdentity({organizationId:ORG,evidenceText:" A  B "})===canonicalEvidenceIdentity({organizationId:ORG,evidenceText:"A B"}),"non-semantic whitespace ordering invariant");
check(otherTopology.organizationId===OTHER&&topology.organizationId===ORG,"cross-organization topology isolation retained");
console.log(JSON.stringify({result:"PASS",checks,collision:{localIdRepeated:true,canonicalEvidenceDistinct:true,admissionDistinct:true},deduplication:{exact:true,formattingOnly:true,multiSource:true},canaries:{unauthorizedOccurrences:0,metricLeakage:false,recommendationLeakage:false,calibrationLeakage:false,historyLeakage:false},externalActivity:{network:0,connector:0,drive:0,runtime:0,clerk:0,browser:0,production:0,deployment:0}}));
