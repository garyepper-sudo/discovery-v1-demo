import assert from "node:assert/strict";

import { canonicalInvestigationFingerprint } from "../../engine/v3/investigation/investigationIdempotency";
import {
  canonicalScopeLineageDigest,
  createCanonicalDerivedScopeLineage,
  createCanonicalEvidenceScopeAttribution,
  createCanonicalScopeLineageIndex,
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
  lineageSupportsRequestedScope,
  resolveCurrentScopeTopology,
  resolveCurrentSourceScopeBinding,
  type CanonicalScopeNode,
  type SourceScopeAssertion,
} from "../../engine/v3/governance/canonicalScopeLineage";
import type { GovernedScopeRef } from "../../engine/v3/governance/scopedGovernanceContext";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { runDiscoveryV3 } from "../../engine/v3";
import { selectScopedProductItemsFromCanonicalLineage, type ServerResolvedScopedProductItem } from "../../product/integration/scopedOrganizationalProductProjection";

const ORG="synthetic-scope-lineage-001", AT="2026-08-05T12:00:00.000Z", LATER="2026-08-06T12:00:00.000Z";
const scope=(type:GovernedScopeRef["type"],id:string):GovernedScopeRef=>({organizationId:ORG,type,id});
const root=scope("organization",ORG), fn=scope("function","engineering"), dept=scope("department","platform"), team=scope("team","delivery"), initiative=scope("initiative","northstar");
const nodes:CanonicalScopeNode[]=[root,fn,dept,team,initiative];
let topologyChecks=0,bindingChecks=0,attributionChecks=0,runtimeChecks=0,productChecks=0;
const check=(area:"topology"|"binding"|"attribution"|"runtime"|"product",condition:unknown,message:string)=>{assert.ok(condition,message);if(area==="topology")topologyChecks++;else if(area==="binding")bindingChecks++;else if(area==="attribution")attributionChecks++;else if(area==="runtime")runtimeChecks++;else productChecks++;};
const rejects=(area:Parameters<typeof check>[0],fn:()=>unknown,message:string)=>{assert.throws(fn);check(area,true,message);};

const topology=createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes,relationships:[{kind:"contains",from:root,to:fn},{kind:"contains",from:fn,to:dept},{kind:"contains",from:dept,to:team},{kind:"initiative-relates",from:initiative,to:fn},{kind:"initiative-relates",from:initiative,to:team}]});
check("topology",topology.nodes.length===5,"five canonical nodes"); check("topology",topology.relationships.length===5,"containment and initiative distinct");
check("topology",topology.topologyId===createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes:[...nodes].reverse(),relationships:[...topology.relationships].reverse()}).topologyId,"topology input-order invariant");
rejects("topology",()=>createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes:[...nodes,team],relationships:[]}),"duplicate node rejected");
rejects("topology",()=>createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes,relationships:[{kind:"contains",from:fn,to:team},{kind:"contains",from:team,to:fn}]}),"containment cycle rejected");
rejects("topology",()=>createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes,relationships:[{kind:"contains",from:root,to:{...team,organizationId:"foreign"}}]}),"cross-organization relationship rejected");
const topology2=createCanonicalScopeTopology({organizationId:ORG,topologyVersion:2,effectiveAt:LATER,supersedesTopologyId:topology.topologyId,nodes,relationships:topology.relationships});
check("topology",resolveCurrentScopeTopology([topology2,topology],LATER)?.topologyId===topology2.topologyId,"current topology resolves deterministically");
rejects("topology",()=>resolveCurrentScopeTopology([{...topology2,topologyId:topology2.topologyId+"x"},topology2,topology],LATER),"forked topology rejected");
rejects("topology",()=>resolveCurrentScopeTopology([{...topology2,supersedesTopologyId:"missing"}],LATER),"stale topology rejected");
check("topology",!JSON.stringify(topology).match(/CEO|Director|Manager|user_/),"topology excludes roles and users");

const source={sourceId:"source:synthetic:1",sourceVersion:"1",normalizedContentDigest:"a".repeat(64)};
const assertions:SourceScopeAssertion[]=[{relationship:"origin",scope:team},{relationship:"applies-to",scope:fn},{relationship:"initiative",scope:initiative}];
const binding=createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source,topology,assertions,basisRefs:["source-owner:synthetic:v1"],effectiveAt:AT});
check("binding",binding.assertions.length===3,"multiple scopes retained"); check("binding",binding.bindingId===createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source,topology,assertions:[...assertions].reverse(),basisRefs:["source-owner:synthetic:v1"],effectiveAt:AT}).bindingId,"binding ordering deterministic");
rejects("binding",()=>createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{...source,sourceId:""},topology,assertions,basisRefs:["owner"],effectiveAt:AT}),"missing source identity rejected");
rejects("binding",()=>createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{...source,normalizedContentDigest:"wrong"},topology,assertions,basisRefs:["owner"],effectiveAt:AT}),"wrong digest rejected");
rejects("binding",()=>createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{...source,sourceVersion:""},topology,assertions,basisRefs:["owner"],effectiveAt:AT}),"wrong version rejected");
rejects("binding",()=>createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source,topology,assertions,basisRefs:["filename:foo.md"],effectiveAt:AT}),"filename-only basis rejected");
rejects("binding",()=>createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source,topology,assertions,basisRefs:["drive-file:123"],effectiveAt:AT}),"transport-only basis rejected");
rejects("binding",()=>createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source,topology,assertions:[{relationship:"subject",scope:scope("team","unknown")}],basisRefs:["owner"],effectiveAt:AT}),"unknown scope rejected");
rejects("binding",()=>createCanonicalSourceScopeBinding({organizationId:"foreign",bindingVersion:1,source,topology,assertions,basisRefs:["owner"],effectiveAt:AT}),"cross-organization binding rejected");
const corrected=createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:2,source,topology,assertions:[{relationship:"origin",scope:dept}],basisRefs:["source-owner:correction:v1"],effectiveAt:LATER,supersedesBindingId:binding.bindingId});
check("binding",resolveCurrentSourceScopeBinding([corrected,binding],LATER)?.bindingId===corrected.bindingId,"superseded binding resolves");
check("binding",resolveCurrentSourceScopeBinding([corrected,binding],AT)?.bindingId===binding.bindingId,"historical binding resolves");
rejects("binding",()=>resolveCurrentSourceScopeBinding([corrected,{...corrected,bindingId:corrected.bindingId+"fork"},binding],LATER),"binding fork rejected");
check("binding",binding.source.normalizedContentDigest===corrected.source.normalizedContentDigest,"scope correction preserves source content identity");

const evidenceId="evidence:stable:1",admissionId="evidence-admission:stable:1";
const attribution=createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:1,evidenceId,evidenceAdmissionId:admissionId,bindings:[binding],topology,effectiveAt:AT});
check("attribution",attribution.evidenceId===evidenceId&&attribution.evidenceAdmissionId===admissionId,"Evidence and admission identities retained");
check("attribution",attribution.attributionId===createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:1,evidenceId,evidenceAdmissionId:admissionId,bindings:[binding,binding],topology,effectiveAt:AT}).attributionId,"duplicate attribution input idempotent");
const attribution2=createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:2,evidenceId,evidenceAdmissionId:admissionId,bindings:[corrected],topology,effectiveAt:LATER,supersedesAttributionId:attribution.attributionId});
check("attribution",attribution2.attributionId!==attribution.attributionId&&attribution2.evidenceId===attribution.evidenceId,"scope correction appends attribution revision only");
check("attribution",attribution.assertions.some(item=>item.scope.id==="delivery"),"old attribution immutable");
rejects("attribution",()=>createCanonicalEvidenceScopeAttribution({organizationId:"foreign",attributionVersion:1,evidenceId,evidenceAdmissionId:admissionId,bindings:[binding],topology,effectiveAt:AT}),"cross-organization attribution rejected");
rejects("attribution",()=>createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:1,evidenceId,evidenceAdmissionId:admissionId,bindings:[],topology,effectiveAt:AT}),"missing binding fails closed");
const secondBinding=createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{sourceId:"source:synthetic:2",sourceVersion:"1",normalizedContentDigest:"b".repeat(64)},topology,assertions:[{relationship:"subject",scope:initiative}],basisRefs:["owner:2"],effectiveAt:AT});
const multi=createCanonicalEvidenceScopeAttribution({organizationId:ORG,attributionVersion:1,evidenceId:"evidence:multi",evidenceAdmissionId:"admission:multi",bindings:[secondBinding,binding],topology,effectiveAt:AT});
check("attribution",multi.sourceBindingIds.length===2&&multi.assertions.some(item=>item.scope.id==="northstar"),"multi-source Evidence preserves all attributions");

const fingerprintInput={company:"Synthetic",website:"https://synthetic.invalid",industry:"Testing",question:"Why?",context:"Bounded",evidenceSources:[{sourceId:"source:synthetic:1",organizationScope:"legacy-unchanged",content:"Exact content"}]};
const beforeFingerprint=canonicalInvestigationFingerprint({organizationId:ORG,input:fingerprintInput});
const afterFingerprint=canonicalInvestigationFingerprint({organizationId:ORG,input:structuredClone(fingerprintInput)});
check("attribution",beforeFingerprint===afterFingerprint,"separate attribution leaves investigation fingerprint unchanged");

const complete=createCanonicalDerivedScopeLineage({organizationId:ORG,derivedObjectRef:"understanding:1",supportingEvidenceIds:[evidenceId],attributions:[attribution],topology,effectiveAt:AT});
check("runtime",complete.completeness==="complete"&&complete.assertions.length===3,"derived lineage retains complete assertions");
const missing=createCanonicalDerivedScopeLineage({organizationId:ORG,derivedObjectRef:"understanding:missing",supportingEvidenceIds:["unknown"],attributions:[attribution],topology,effectiveAt:AT});
check("runtime",missing.completeness==="missing-structured-lineage"&&missing.assertions.length===0,"missing lineage explicit");
const legacy=createCanonicalDerivedScopeLineage({organizationId:ORG,derivedObjectRef:"understanding:legacy",supportingEvidenceIds:["legacy"],attributions:[],topology,effectiveAt:AT,legacyOrganizationCompatibility:true});
check("runtime",lineageSupportsRequestedScope(legacy,root),"explicit legacy organization compatibility works"); check("runtime",!lineageSupportsRequestedScope(legacy,team),"legacy non-root fails closed");
check("runtime",lineageSupportsRequestedScope(complete,team)&&lineageSupportsRequestedScope(complete,fn)&&lineageSupportsRequestedScope(complete,initiative),"structured lineage resolves exact supported scopes");
check("runtime",!lineageSupportsRequestedScope(complete,dept),"unattributed scope remains unavailable");
const index=createCanonicalScopeLineageIndex({organizationId:ORG,topology,sourceBindings:[binding,secondBinding],evidenceAttributions:[attribution,multi],derivedLineages:[complete,missing,legacy]});
check("runtime",index.digest===createCanonicalScopeLineageIndex({organizationId:ORG,topology,sourceBindings:[secondBinding,binding],evidenceAttributions:[multi,attribution],derivedLineages:[legacy,missing,complete]}).digest,"Runtime lineage index order invariant");
const runtime=createEmptyOrganizationRuntime({organizationId:ORG}); const cognitiveBefore=canonicalScopeLineageDigest({metadata:runtime.metadata,understanding:runtime.memory.organizationalUnderstandingState,observations:runtime.memory.observations,beliefs:runtime.memory.beliefs}); runtime.memory.canonicalScopeLineageIndex=index; const cognitiveAfter=canonicalScopeLineageDigest({metadata:runtime.metadata,understanding:runtime.memory.organizationalUnderstandingState,observations:runtime.memory.observations,beliefs:runtime.memory.beliefs});
check("runtime",cognitiveBefore===cognitiveAfter,"additive lineage index changes no cognitive content or identity");

const item=(safeRef:string,requested:GovernedScopeRef):ServerResolvedScopedProductItem=>({safeRef,canonicalObjectType:"CanonicalUnderstandingComposition",organizationId:ORG,scope:requested,sensitivity:"standard",kind:"understanding",disclosureKind:"direct-evidence",title:"Synthetic bounded understanding",summary:"Synthetic safe summary",uncertainty:null,support:[],supportLineageComplete:true,safeAbstractionAllowed:false,protectedCombination:false,auditRefs:[]});
check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:team,items:[item("understanding:1",team)],lineageIndex:index}).length===1,"team request consumes exact lineage");
check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:dept,items:[item("understanding:1",dept)],lineageIndex:index}).length===0,"unrelated scope fails closed");
check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:root,items:[item("understanding:legacy",root)],lineageIndex:index}).length===1,"legacy root compatibility selected explicitly");
check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:team,items:[item("understanding:legacy",team)],lineageIndex:index}).length===0,"legacy non-root Product input unavailable");
check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:"foreign",requestedScope:team,items:[item("understanding:1",team)],lineageIndex:index}).length===0,"cross-organization Product input denied");
check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:team,items:[item("understanding:1",team)],lineageIndex:undefined}).length===0,"missing index fails closed");
check("product",JSON.stringify(index)===JSON.stringify(structuredClone(index)),"lineage serialization deterministic");
check("product",!JSON.stringify(index).match(/CEO|Director|Manager|user_/),"role labels absent from lineage");

const productionInput={company:"Synthetic",website:"https://synthetic.invalid",industry:"Testing",question:"What is scoped?",context:"",evidenceSources:[{sourceId:source.sourceId,sourceType:"synthetic",contentDigest:source.normalizedContentDigest,content:"Platform delivery evidence."}]};
const productionResult=runDiscoveryV3(productionInput,{organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[binding]});
check("attribution",productionResult.scopeLineageAdmission?.evidenceAttributions.length===1,"actual Evidence admission produces attribution");
const admittedEvidence=productionResult.evidence.find(value=>value.sourceId===source.sourceId)!;
const producedAttribution=productionResult.scopeLineageAdmission!.evidenceAttributions[0]!;
check("attribution",producedAttribution.localEvidenceIds?.includes(admittedEvidence.id)&&producedAttribution.evidenceId.startsWith("canonical-evidence:v2:")&&producedAttribution.evidenceAdmissionId.startsWith("evidence-admission:v2:"),"actual admission qualifies local Evidence with exact canonical identities");
check("attribution",producedAttribution.sourceBindingIds[0]===binding.bindingId,"actual admission retains exact source binding");
const savedLog=console.log; console.log=()=>{};
let producedRuntime;
try{producedRuntime=evolveOrganizationRuntime({runtime:createEmptyOrganizationRuntime({organizationId:ORG}),result:productionResult,input:{company:productionInput.company,website:productionInput.website,industry:productionInput.industry,question:productionInput.question,context:productionInput.context}});}finally{console.log=savedLog;}
const producedIndex=producedRuntime.memory.canonicalScopeLineageIndex;
check("runtime",producedIndex?.evidenceAttributions[0]?.attributionId===producedAttribution.attributionId,"actual Runtime evolution retains admission attribution");
const producedLineage=producedIndex?.derivedLineages.find(value=>value.supportingEvidenceIds.includes(producedAttribution.evidenceId)&&value.completeness==="complete");
check("runtime",Boolean(producedLineage),"actual Runtime evolution produces derived lineage from support ancestry");
check("runtime",producedIndex?.derivedLineages.every(value=>!value.assertions.some(assertion=>assertion.scope.type==="organization"))===true,"structured evolution does not broaden to organization root");
check("runtime",canonicalScopeLineageDigest(producedIndex)===canonicalScopeLineageDigest(createCanonicalScopeLineageIndex({organizationId:ORG,topology,sourceBindings:productionResult.scopeLineageAdmission!.sourceBindings,evidenceAttributions:productionResult.scopeLineageAdmission!.evidenceAttributions,derivedLineages:producedIndex!.derivedLineages})),"producer Runtime index is deterministic");
if(producedLineage){
  const producedItem=item(producedLineage.derivedObjectRef,team);
  check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:team,items:[producedItem],lineageIndex:producedIndex}).length===1,"scoped Product selector consumes actual producer output");
  check("product",selectScopedProductItemsFromCanonicalLineage({organizationId:ORG,requestedScope:dept,items:[item(producedLineage.derivedObjectRef,dept)],lineageIndex:producedIndex}).length===0,"actual producer output denies unrelated scope");
}
const correctedProduction=runDiscoveryV3(productionInput,{organizationId:ORG,effectiveAt:LATER,topologyRevisions:[topology],sourceBindingRevisions:[binding,corrected],existingEvidenceAttributions:[producedAttribution]});
const correctedAttribution=correctedProduction.scopeLineageAdmission!.evidenceAttributions[0]!;
check("attribution",correctedProduction.evidence.find(value=>value.sourceId===source.sourceId)?.id===admittedEvidence.id,"binding correction preserves Evidence identity");
check("attribution",correctedAttribution.evidenceAdmissionId===producedAttribution.evidenceAdmissionId&&correctedAttribution.attributionId!==producedAttribution.attributionId,"binding correction preserves admission identity and appends attribution");
check("attribution",producedAttribution.assertions.some(value=>value.scope.id==="delivery"),"producer correction leaves old attribution immutable");

console.log(JSON.stringify({result:"PASS",checks:{topology:topologyChecks,sourceBinding:bindingChecks,evidenceAttribution:attributionChecks,runtimeLineage:runtimeChecks,scopedProductInput:productChecks,total:topologyChecks+bindingChecks+attributionChecks+runtimeChecks+productChecks},identity:{sourceContentChanged:false,evidenceIdChanged:false,admissionIdChanged:false,investigationFingerprintChanged:false,cognitiveIdentityChanged:false},externalActivity:{network:0,connectorCalls:0,driveReads:0,driveWrites:0,liveRuntimeReads:0,liveRuntimeWrites:0,clerk:0,production:0,deployment:0}}));
