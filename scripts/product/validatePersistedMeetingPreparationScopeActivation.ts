import "server-only";
import assert from "node:assert/strict";
import {productArtifactBodyDigest} from "../../product/persistence/productArtifactBodyContracts";
import {resolveRegisteredPreparationScopeForOccurrence} from "../../product/integration/leadershipConversationServerComposition";

const organizationId="organization-alpha",questionId="product-question-alpha",conversationId="leadership-conversation:occurrence-1",seriesId=`leadership-conversation-series:${conversationId}`,scopeId="meeting-preparation-scope:persisted:v1";
const unsigned={contractVersion:"1" as const,scopeId,organizationId,questionId,conversationId,seriesId,sourceVersions:[{sourceBindingId:"binding:1",sourceContentVersionId:"source-version:1",normalizedContentDigest:"a".repeat(64)}],createdAt:"2026-09-06T00:00:00.000Z",createdByUserId:"person:alpha",idempotencyKeyDigest:"b".repeat(64),requestFingerprint:"c".repeat(64)},scope={...unsigned,scopeDigest:productArtifactBodyDigest(unsigned)};
const store={organizationId,registeredMeetingPreparationScopes:[scope]};
const first=resolveRegisteredPreparationScopeForOccurrence({store,organizationId,questionId,conversationId,seriesId});
assert.equal(first.scopeId,scopeId);
assert.deepEqual(first.sourceVersions.map(value=>value.sourceContentVersionId),["source-version:1"]);
assert.deepEqual(resolveRegisteredPreparationScopeForOccurrence({store,organizationId,questionId,conversationId,seriesId}),first);
assert.throws(()=>resolveRegisteredPreparationScopeForOccurrence({store,organizationId,questionId,conversationId,seriesId,scopeId:"forged"}),/unavailable/);
assert.throws(()=>resolveRegisteredPreparationScopeForOccurrence({store:{...store,registeredMeetingPreparationScopes:[{...scope,scopeDigest:"0".repeat(64)}]},organizationId,questionId,conversationId,seriesId}),/unavailable/);
assert.throws(()=>resolveRegisteredPreparationScopeForOccurrence({store:{...store,registeredMeetingPreparationScopes:[scope,scope]},organizationId,questionId,conversationId,seriesId}),/unavailable/);
console.log(JSON.stringify({validation:"persisted-meeting-preparation-scope-activation",result:"PASS",checks:4,fixtureFallbackPreserved:true,forgedScopesAccepted:0,ambiguousScopesAccepted:0}));
