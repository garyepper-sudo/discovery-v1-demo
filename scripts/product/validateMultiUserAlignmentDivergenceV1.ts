import { strict as assert } from "node:assert";
import { projectMeetingAlignmentV1 } from "../../product/integration/meetingExecutiveContentProjection";

const perspective=(actor:string,stance:"agree"|"challenge"|"need-information"|"propose-alternative",digest="analysis:a")=>({contractVersion:"1" as const,perspectiveId:`perspective:${actor}:${stance}`,organizationId:"org",questionId:"question",conversationId:"occurrence",seriesId:"series",actorUserId:actor,participantLabel:actor,preparedWorkPublicationDigest:"prepared:current",workingAnalysisDigest:digest,stance,rationale:"Explicit rationale",createdAt:`2026-01-0${actor === "A" ? 1 : 2}T00:00:00Z`,visibility:"meeting-participants" as const,idempotencyKeyDigest:"idempotency",requestFingerprint:"request",perspectiveDigest:"digest"});

assert.equal(projectMeetingAlignmentV1([]).category,"no-signal");
assert.equal(projectMeetingAlignmentV1([perspective("A","agree")]).category,"no-signal","silence is never alignment");
assert.equal(projectMeetingAlignmentV1([perspective("A","agree"),perspective("B","agree")]).category,"shared-support");
assert.equal(projectMeetingAlignmentV1([perspective("A","challenge"),perspective("B","challenge")]).category,"shared-challenge");
assert.equal(projectMeetingAlignmentV1([perspective("A","need-information"),perspective("B","need-information")]).category,"shared-uncertainty");
assert.equal(projectMeetingAlignmentV1([perspective("A","agree"),perspective("B","challenge")]).category,"different-perspectives");
assert.equal(projectMeetingAlignmentV1([perspective("A","propose-alternative"),perspective("B","propose-alternative")]).category,"different-perspectives");
assert.equal(projectMeetingAlignmentV1([perspective("A","agree","analysis:old")].filter(item=>item.workingAnalysisDigest==="analysis:a")).category,"no-signal","stale analysis is excluded before projection");
console.log("RESULT multi-user-alignment-divergence-v1 PASS");
