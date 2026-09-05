import "server-only";
import assert from "node:assert/strict";
import {mkdtemp,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {FilesystemOrganizationRuntimeRepository} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {MEETING_PREPARATION_SCOPE_REFS,provisionNorthstarPreparationLineageFixture,registeredMeetingPreparationScopes,resolveRegisteredMeetingPreparationScope} from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import {SANDBOX_ORGANIZATION_ID} from "../../lib/access/sandboxMultiUserAccess";

async function main(){
  const root=await mkdtemp(path.join(tmpdir(),"discovery-northstar-preparation-lineage-meeting-scopes-"));let checks=0;const ok=(value:unknown,message:string)=>{assert.ok(value,message);checks++};
  try{
    const provisioned=await provisionNorthstarPreparationLineageFixture({environment:"test",fixtureRoot:root}),seed=provisioned.seed,scopes=registeredMeetingPreparationScopes(seed),stored=await new FilesystemOrganizationRuntimeRepository(path.join(root,"runtime")).read(SANDBOX_ORGANIZATION_ID);assert.ok(stored);const attributions=stored.runtime.memory.canonicalScopeLineageIndex!.evidenceAttributions;
    ok(provisioned.counts.sources>=7,"at least seven sources admitted through governed owner");
    ok(scopes.length===3&&new Set(scopes.map(item=>item.referenceId)).size===3,"three registered references");
    ok(new Set(scopes.map(item=>item.semanticDigest)).size===3,"three deterministic registry digests");
    const resolved=scopes.map(scope=>{const selected=new Set(scope.sourceBindings.map(item=>item.sourceBindingId)),evidence=new Map(attributions.filter(item=>item.sourceBindingIds.some(id=>selected.has(id))).map(item=>[item.evidenceId,item.evidenceAdmissionId])),canonicalMaterial=seed.canonicalMaterial.filter(item=>evidence.get(item.canonicalObjectId)===item.revisionRef);return resolveRegisteredMeetingPreparationScope({seed,organizationId:SANDBOX_ORGANIZATION_ID,referenceId:scope.referenceId,canonicalMaterial});});
    for(const [index,scope] of scopes.entries()){ok(scope.organizationId===SANDBOX_ORGANIZATION_ID&&scope.admissibility==="admitted","organization-confined admitted scope");ok(scope.sourceContentVersions.length===3,"one shared plus two exclusive sources");ok(resolved[index]!.sourceContentVersions.length===3,"registered reference resolves exact finite lineage");ok(resolved[index]!.canonicalMaterial.length>0&&resolved[index]!.canonicalMaterial.length<seed.canonicalMaterial.length,"publication material is exact finite source-backed subset");ok(resolved[index]!.canonicalMaterial.every(item=>attributions.some(attribution=>attribution.evidenceId===item.canonicalObjectId&&attribution.evidenceAdmissionId===item.revisionRef&&attribution.sourceBindingIds.some(id=>scope.sourceBindings.some(binding=>binding.sourceBindingId===id)))),"every material item is connected to a selected source");}
    ok(new Set(resolved.map(item=>item.seedDigest)).size===3,"three occurrence lineage digests include exact material subsets");
    for(let index=0;index<resolved.length;index++)for(let other=0;other<resolved.length;other++)if(index!==other){const exclusiveBindings=new Set(scopes[index]!.sourceBindings.filter(binding=>!scopes[other]!.sourceBindings.some(candidate=>candidate.sourceBindingId===binding.sourceBindingId)).map(binding=>binding.sourceBindingId));ok(!resolved[other]!.canonicalMaterial.some(item=>attributions.some(attribution=>attribution.evidenceId===item.canonicalObjectId&&attribution.sourceBindingIds.some(id=>exclusiveBindings.has(id)))),"excluded meeting material is absent");}
    const versionSets=scopes.map(item=>new Set(item.sourceContentVersions.map(version=>version.sourceContentVersionId))),shared=[...versionSets[0]!].filter(id=>versionSets.every(set=>set.has(id)));
    ok(shared.length===1,"one exact shared source identity");
    for(let index=0;index<3;index++){const others=versionSets.filter((_,candidate)=>candidate!==index);ok([...versionSets[index]!].filter(id=>!others.some(set=>set.has(id))).length===2,"two exclusive sources per meeting");}
    assert.throws(()=>resolveRegisteredMeetingPreparationScope({seed,organizationId:"foreign-organization",referenceId:MEETING_PREPARATION_SCOPE_REFS.northstar}),/unavailable/);checks++;
    assert.throws(()=>resolveRegisteredMeetingPreparationScope({seed,organizationId:SANDBOX_ORGANIZATION_ID,referenceId:"caller-created"}),/unavailable/);checks++;
    const tampered=structuredClone(seed);tampered.sourceContentVersions[0]!.normalizedContentDigest="0".repeat(64);
    assert.throws(()=>registeredMeetingPreparationScopes(tampered),/integrity/);checks++;
    const replay=await provisionNorthstarPreparationLineageFixture({environment:"test",fixtureRoot:root});ok(replay.disposition==="idempotent-replay"&&replay.seed.seedDigest===seed.seedDigest,"fresh read and replay preserve exact registry seed");
    console.log(JSON.stringify({validation:"meeting-scoped-governed-source-lineage-v1",result:"PASS",checks,registeredReferences:scopes.length,admittedSources:provisioned.counts.sources,exclusiveSourcesPerMeeting:2,sharedSources:1,distinctLineageDigests:new Set(resolved.map(item=>item.seedDigest)).size,canonicalMaterialCounts:resolved.map(item=>item.canonicalMaterial.length),forgedReferencesAccepted:0,foreignReferencesAccepted:0,staleDigestsAccepted:0,duplicateReferences:0,crossMeetingExclusiveLeaks:0,providerRequests:0}));
  }finally{await rm(root,{recursive:true,force:true});}
}
void main();
