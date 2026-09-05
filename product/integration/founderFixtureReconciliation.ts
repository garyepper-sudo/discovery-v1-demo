import "server-only";

import path from "node:path";
import {realpath} from "node:fs/promises";
import {createProductWorkflowArtifactRepository} from "../workflow/leadershipConversation/productWorkflowArtifactRepository";
import {leadershipDigest} from "../workflow/leadershipConversation/determinism";
import {reconcileNorthstarPreparationLineageFixture,registeredMeetingPreparationScopes} from "../simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import {SANDBOX_ORGANIZATION_ID} from "../simulations/living-organization-sandbox/manifest";
import {NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE} from "../workflow/leadershipConversation";
import {createLeadershipConversationServerCompositionForValidation,registeredMeetingPreparationOccurrences} from "./leadershipConversationServerComposition";

export type FounderFixtureReconciliationRootsV1={fixtureRoot:string;runtimeRoot:string;workflowRoot:string;sourceContentRoot:string;protectedBodyRoot:string};
const inside=(candidate:string,root:string)=>candidate===root||candidate.startsWith(`${root}${path.sep}`);
export async function assertFounderFixtureReconciliationRoots(input:{roots:FounderFixtureReconciliationRootsV1;forbiddenRoots:readonly string[]}){
  const resolved=await Promise.all(Object.values(input.roots).map(value=>realpath(value))),forbidden=await Promise.all(input.forbiddenRoots.map(value=>realpath(value)));
  if(new Set(resolved).size!==resolved.length||resolved.some(value=>forbidden.some(root=>inside(value,root)||inside(root,value))))throw new Error("Founder fixture reconciliation roots are unsafe.");
  if(path.dirname(resolved[2]!)!==path.dirname(resolved[4]!)||path.basename(resolved[4]!)!=="product-artifact-bodies")throw new Error("Founder fixture protected-body root is incompatible.");
  return{rootDigests:resolved.map(value=>path.basename(value))};
}

export async function reconcileFounderMeetingPreparationFixture(input:{roots:FounderFixtureReconciliationRootsV1;forbiddenRoots:readonly string[];userId:string;injectedStopAfterPreparedWorkPublications?:1|2}){
  await assertFounderFixtureReconciliationRoots(input);
  const repository=createProductWorkflowArtifactRepository({root:input.roots.workflowRoot,environment:"test"}),before=await repository.read(SANDBOX_ORGANIZATION_ID),beforePublications=before.store.preparedWorkPublications??[],oldPublications=beforePublications.slice(0,4);
  if(![4,5,6,7].includes(beforePublications.length)||oldPublications.length!==4||![7,10].includes((before.store.meetingPackPublications??[]).length)||(before.store.meetingPackPrivateNotePublications??[]).length!==1)throw new Error("Founder fixture reconciliation baseline is unavailable.");
  const source=await reconcileNorthstarPreparationLineageFixture({environment:"test",fixtureRoot:input.roots.fixtureRoot}),scopes=registeredMeetingPreparationScopes(source.seed);
  if(source.seed.sourceContentVersions.length!==7||scopes.length!==3||scopes.some(value=>value.sourceContentVersions.length!==3))throw new Error("Founder fixture preparation corpus is unavailable.");
  const server=createLeadershipConversationServerCompositionForValidation({runtimeRoot:input.roots.runtimeRoot,workflowRoot:input.roots.workflowRoot,sourceContentRoot:input.roots.sourceContentRoot,lineageFixtureRoot:input.roots.fixtureRoot,userId:input.userId,organizationId:SANDBOX_ORGANIZATION_ID}),occurrences=registeredMeetingPreparationOccurrences(SANDBOX_ORGANIZATION_ID,source.seed.productQuestionId);occurrences.delete([...occurrences.entries()].find(([,reference])=>reference.endsWith("northstar-staff:v1"))?.[0]??"");occurrences.set(NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE.conversationId,"meeting-preparation-scope:northstar-staff:v1");const links=before.store.futurePreparationLinks,created:string[]=[],target=[...occurrences].map(([initialOccurrenceId,referenceId])=>{const conversationId=links.find(value=>value.conversationId===initialOccurrenceId)?.nextConversationId??initialOccurrenceId,idempotencyKey=`founder-fixture-source-reconciliation:v1:${referenceId}`,keyDigest=leadershipDigest(idempotencyKey),registered=scopes.find(value=>value.referenceId===referenceId),expected=(registered?.sourceContentVersions??[]).map(value=>`${value.sourceBindingId}\u0000${value.sourceContentVersionId}\u0000${value.normalizedContentDigest}`).sort();return{conversationId,referenceId,idempotencyKey,keyDigest,expected};}),authenticate=(publication:typeof beforePublications[number],entry:typeof target[number])=>{const prior=before.store.idempotency.find(value=>value.keyDigest===entry.keyDigest),actual=(publication.materialLineage?.sourceContentVersions??[]).map(value=>`${value.sourceBindingId}\u0000${value.sourceContentVersionId}\u0000${value.normalizedContentDigest}`).sort();return Boolean(prior&&publication.artifactRevision===prior.recordRef&&publication.productWorkflowId===`leadership-conversation:${entry.conversationId}`&&publication.idempotencyKeyDigest===entry.keyDigest&&publication.requestFingerprint===prior.requestFingerprint&&actual.length===3&&JSON.stringify(actual)===JSON.stringify(entry.expected));};
  if(beforePublications.slice(4).some(publication=>!target.some(entry=>authenticate(publication,entry)))||new Set(beforePublications.slice(4).map(value=>value.idempotencyKeyDigest)).size!==beforePublications.length-4)throw new Error("Founder fixture reconciliation partial state is unavailable.");
  let newlyPublished=0;for(const {conversationId,referenceId,idempotencyKey,keyDigest,...entry} of target){
    const prior=before.store.idempotency.find(value=>value.keyDigest===keyDigest),existing=prior&&beforePublications.find(value=>value.artifactRevision===prior.recordRef);
    if(existing){if(!authenticate(existing,{conversationId,referenceId,idempotencyKey,keyDigest,...entry}))throw new Error("Founder fixture reconciliation replay is incomplete.");created.push(existing.artifactRevision);continue;}
    const workspace=await server.workspace({userId:input.userId,organizationId:SANDBOX_ORGANIZATION_ID,questionId:source.seed.productQuestionId,conversationId});
    if(!workspace.context||!workspace.currentPreparedWorkProduct)throw new Error("Founder fixture selected meeting is unavailable.");
    const result=await server.recordPreparation({userId:input.userId,organizationId:SANDBOX_ORGANIZATION_ID,questionId:source.seed.productQuestionId,conversationId,contextVersionId:workspace.context.contextVersionId,content:{...workspace.currentPreparedWorkProduct.content,evidenceReferences:[referenceId]},lineage:{...workspace.currentPreparedWorkProduct.lineage,sourceRevisionReferences:[referenceId]},changeSummary:"Reconciled to the registered meeting preparation scope.",idempotencyKey}),publication=(result.preparedWorkPublications??[]).filter(value=>value.productWorkflowId===`leadership-conversation:${conversationId}`).at(-1);
    if(!publication?.materialLineage||publication.materialLineage.sourceContentVersions.length!==3)throw new Error("Founder fixture Prepared Work reconciliation failed.");
    created.push(publication.artifactRevision);
    newlyPublished++;if(input.injectedStopAfterPreparedWorkPublications===newlyPublished)throw new Error("Injected founder fixture reconciliation interruption.");
  }
  const after=await repository.read(SANDBOX_ORGANIZATION_ID),all=after.store.preparedWorkPublications??[];
  if(all.length!==7||oldPublications.some((value,index)=>JSON.stringify(value)!==JSON.stringify(all[index])))throw new Error("Founder fixture Prepared Work history changed.");
  return{contractVersion:"1" as const,manifestSources:8,seedSources:source.seed.sourceContentVersions.length,registeredScopes:scopes.length,oldPreparedWorkPublications:oldPublications.length,newPreparedWorkPublications:all.length-beforePublications.length,totalPreparedWorkPublications:all.length,createdPublicationRevisions:created};
}
