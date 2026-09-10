import assert from "node:assert/strict";
import { ExistingParticipantIdentityResolutionService } from "../../lib/auth/existingParticipantIdentityResolutionCore";
import { ParticipantReferenceAccessAdministration, ParticipantReferenceMeetingCurrentAccess, type ParticipantReferenceAccessRepository, type ParticipantReferenceGrant, type ParticipantReferencePolicy } from "../../lib/alpha-activation/participantReferenceAccess";

const at="2026-09-07T12:00:00.000Z",org="synthetic-org",issuer="participant-reference-access:admin";
const locator=(user:string)=>({status:"verified" as const,identity:{consumerId:user,provider:"clerk" as const,verificationId:`session-${user}`,verifiedAt:at}});
class Memory implements ParticipantReferenceAccessRepository { policies=new Map<string,ParticipantReferencePolicy>(); grants=new Map<string,ParticipantReferenceGrant>(); bindings=new Map<string,{bindingId:string;participantRef:string;createdAt:string}>(); async activatePolicy(v:ParticipantReferencePolicy){const old=[...this.policies.values()].find(x=>x.operationId===v.operationId);if(old){assert.deepEqual(old,v);return old;}if(this.policies.has(v.organizationId))throw new Error("conflict");this.policies.set(v.organizationId,v);return v;} async findPolicy(id:string){return this.policies.get(id);} async createGrant(v:ParticipantReferenceGrant){const old=[...this.grants.values()].find(x=>x.operationId===v.operationId);if(old){assert.deepEqual(old,v);return old;}this.grants.set(v.grantId,v);return v;} async revokeGrant(v:{grantId:string;organizationId:string;issuedBy:string;operationId:string;requestFingerprint:string;revokedAt:string}){const old=this.grants.get(v.grantId);if(!old||old.organizationId!==v.organizationId)throw new Error("missing");if(old.status==="revoked")return old;const next={...old,status:"revoked" as const,revokedAt:v.revokedAt};this.grants.set(v.grantId,next);return next;} async findGrants(q:{organizationId:string;participantRef:string;scope:"organization"|"meeting-series";meetingSeriesId?:string}){return [...this.grants.values()].filter(x=>x.organizationId===q.organizationId&&x.participantRef===q.participantRef&&x.scope===q.scope&&(q.scope==="organization"||x.meetingSeriesId===q.meetingSeriesId));} async resolveOrBindExistingParticipantIdentity():Promise<never>{throw new Error("lookup must not bind");} async findExistingParticipantIdentityBinding(v:{provider:"clerk";providerSubject:string}){return this.bindings.get(v.providerSubject);} async activateLegacyParticipantIdentityNamespaceAnchor():Promise<never>{throw new Error("activation is unavailable");} }
async function main(){
  const memory=new Memory();
  for(const user of["a","b","c"])memory.bindings.set(user,{bindingId:`binding-${user}`,participantRef:`participant:00000000-0000-4000-8000-00000000000${user==="a"?1:user==="b"?2:3}`,createdAt:at});
  const identity=new ExistingParticipantIdentityResolutionService(memory),admin=new ParticipantReferenceAccessAdministration(memory),access=new ParticipantReferenceMeetingCurrentAccess(memory,identity),subject=memory.bindings.get("a")!.participantRef;
  const request={verifiedLocator:locator("a"),organizationId:org,meetingSeriesId:"m1"}; let checks=0;
  assert.equal(await access.authorize(request),"unavailable"); checks++;
  await admin.activatePolicy({organizationId:org,issuerAuthority:issuer,operationId:"policy-1",occurredAt:at});
  const organization=await admin.grant({organizationId:org,participantRef:subject,scope:"organization",issuerAuthority:issuer,operationId:"a-org",occurredAt:at});
  const meeting=await admin.grant({organizationId:org,participantRef:subject,scope:"meeting-series",meetingSeriesId:"m1",issuerAuthority:issuer,operationId:"a-m1",occurredAt:at});
  assert.equal(await access.authorize(request),"authorized"); checks++;
  memory.policies.set(org,{...memory.policies.get(org)!,issuedBy:"unrelated-issuer"}); assert.equal(await access.authorize(request),"denied"); checks++;
  memory.policies.set(org,{...memory.policies.get(org)!,issuedBy:issuer}); memory.grants.set(meeting.grantId,{...meeting,issuedBy:"other-issuer"}); assert.equal(await access.authorize(request),"denied"); checks++;
  memory.grants.set(meeting.grantId,meeting); memory.grants.set(organization.grantId,{...organization,requestFingerprint:""}); assert.equal(await access.authorize(request),"denied"); checks++;
  memory.grants.set(organization.grantId,organization); memory.grants.set("foreign",{...meeting,grantId:"foreign",participantRef:memory.bindings.get("b")!.participantRef}); assert.equal(await access.authorize(request),"authorized"); checks++;
  assert.equal(await access.authorize({...request,meetingSeriesId:""}),"denied"); checks++;
  await admin.revoke({grantId:meeting.grantId,organizationId:org,issuerAuthority:issuer,operationId:"a-m1-revoke",occurredAt:at}); assert.equal(await access.authorize(request),"denied"); checks++;
  memory.grants.set(meeting.grantId,meeting); memory.policies.set(org,{...memory.policies.get(org)!,issuedBy:""}); assert.equal(await access.authorize(request),"unavailable"); checks++;
  const unavailable=new ParticipantReferenceMeetingCurrentAccess({findPolicy:async()=>{throw new Error("offline")}} as never,identity); assert.equal(await unavailable.authorize(request),"unavailable"); checks++;
  console.log(`RESULT PASS participant-reference-meeting-access checks=${checks} protected-reads=0 protected-writes=0`)
}
main().catch(error=>{console.error(error);process.exitCode=1});
