import "server-only";

import path from "node:path";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { ScopedAuthorityGrant } from "../../engine/v3/governance/scopedGovernanceContext";
import { createProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import { founderAuthorizedMeetingDirectory } from "../../product/integration/founderAuthorizedMeetingDirectory";
import { createFounderLocalAlphaLeadershipConversationComposition } from "../../product/integration/leadershipConversationServerComposition";
import { evaluateParticipantReferenceCurrentAccess } from "./participantReferenceAccess";
import { createFounderFirstUnderstandingRequestComposition } from "./founderFirstUnderstandingRequestComposition";
import { resolveFounderLocalAlphaRuntimeRootFromEnvironment } from "./founderLocalAlphaRuntimeRoot";

const operations: ScopedAuthorityGrant["operations"] = [
  "source-binding:resolve-current", "source-content:read-for-proposal", "source-content:read-for-claim-support",
  "product-artifact:read", "product-artifact:reuse", "product-artifact:compare", "product-workspace:read",
  "product-artifact:prepare-again", "product-artifact:create-successor",
];

/** Resolves an opaque Meeting Home solely from the authenticated V2 binding.
 * It keeps the request-owned database client alive while the caller performs
 * reads/actions, so every protected operation can re-check live grants. */
export async function createFounderMeetingHomeComposition(seriesAddress: string) {
  if (process.env.NODE_ENV === "production" || !/^[A-Za-z0-9_-]{24}$/u.test(seriesAddress)) throw new Error("Meeting is unavailable.");
  const runtimeRoot = process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY;
  const workflowRoot = process.env.DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT;
  if (!runtimeRoot || !workflowRoot || !path.isAbsolute(runtimeRoot) || !path.isAbsolute(workflowRoot)) throw new Error("Founder Meeting Home storage is unavailable.");
  const protectedRoot = await resolveFounderLocalAlphaRuntimeRootFromEnvironment();
  if (protectedRoot.status !== "ready") throw new Error("Founder Meeting Home storage is unavailable.");
  const request = await createFounderFirstUnderstandingRequestComposition();
  try {
    const runtime = new FilesystemOrganizationRuntimeRepository(runtimeRoot);
    const currentAccess = async ({ userId, organizationId, seriesId }: { userId: string; organizationId: string; seriesId: string }) => {
      if (userId !== request.consumerId) return false;
      const policy = await request.accessRepository.findPolicy(organizationId);
      const [organization, meeting] = await Promise.all([
        request.accessRepository.findGrants({ organizationId, participantRef: request.participantRef, scope: "organization" }),
        request.accessRepository.findGrants({ organizationId, participantRef: request.participantRef, scope: "meeting-series", meetingSeriesId: seriesId }),
      ]);
      return evaluateParticipantReferenceCurrentAccess({policy,organizationGrants:organization,meetingGrants:meeting,organizationId,participantRef:request.participantRef,meetingSeriesId:seriesId}) === "authorized";
    };
    const matches: Array<{ organizationId: string; questionId: string; seriesId: string; occurrenceId: string }> = [];
    for (const organizationId of await request.accessRepository.findOrganizationIdsForParticipant(request.participantRef)) {
      const stored = await runtime.read(organizationId);
      const questionId = stored?.runtime.memory.initialUnderstandingBootstrap?.initialProductQuestionId;
      if (!questionId) continue;
      const directory = await founderAuthorizedMeetingDirectory({ userId: request.consumerId, organizationId, questionId, workflowRoot, currentAccess: { authorize: async input => await currentAccess(input) ? "authorized" : "denied" } });
      for (const meeting of directory) if (meeting.seriesAddress === seriesAddress) matches.push(meeting);
    }
    if (matches.length !== 1) throw new Error("Meeting is unavailable.");
    const meeting = matches[0]!;
    if (!await currentAccess({ userId: request.consumerId, organizationId: meeting.organizationId, seriesId: meeting.seriesId })) throw new Error("Meeting is unavailable.");
    const authorityGrants: ScopedAuthorityGrant[] = [{
      authorityRef: "founder-participant-current-access:v1", policyRef: "participant-reference-v1", organizationId: meeting.organizationId,
      subjectId: request.consumerId, scope: { organizationId: meeting.organizationId, type: "organization", id: meeting.organizationId },
      operations, sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z",
    }];
    const requestMeetingAccess = async (input: { userId: string; organizationId: string; seriesId: string }) =>
      input.userId === request.consumerId && input.organizationId === meeting.organizationId && input.seriesId === meeting.seriesId && await currentAccess(input);
    const server = createFounderLocalAlphaLeadershipConversationComposition({ runtimeRoot, workflowRoot, sourceContentRoot: protectedRoot.value.sourceContentRoot, bodyRepository: createProductArtifactBodyRepository({ root: protectedRoot.value.productArtifactBodyRoot }), userId: request.consumerId, organizationId: meeting.organizationId, participantRef: request.participantRef, authorityGrants, currentMeetingAccess: requestMeetingAccess });
    return { request, server, meeting, close: request.close };
  } catch (error) { await request.close(); throw error; }
}
