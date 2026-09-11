import "server-only";

import path from "node:path";

import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { founderAuthorizedMeetingDirectory } from "../../product/integration/founderAuthorizedMeetingDirectory";
import type { AuthorizedMeetingResolutionV1 } from "../../product/integration/authorizedMeetingDirectory";
import { createFounderFirstUnderstandingRequestComposition } from "./founderFirstUnderstandingRequestComposition";
import { evaluateParticipantReferenceCurrentAccess } from "./participantReferenceAccess";

export type FounderAuthorizedMeetingContinuation = Readonly<{
  href: string;
  title: string;
}>;

export function selectSingleFounderMeetingContinuation(
  meetings: readonly AuthorizedMeetingResolutionV1[],
): FounderAuthorizedMeetingContinuation | null {
  if (meetings.length !== 1) return null;
  const meeting = meetings[0]!;
  return {
    href: `/product-alpha/meetings/${meeting.seriesAddress}`,
    title: meeting.title,
  };
}

/** Projects one current authorized Meeting Home for an already bound founder.
 * It creates no participant, grant, Product, or Runtime state. */
export async function resolveFounderAuthorizedMeetingContinuation(): Promise<FounderAuthorizedMeetingContinuation | null> {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED !== "true"
  ) return null;

  const runtimeRoot = process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY;
  const workflowRoot = process.env.DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT;
  if (!runtimeRoot || !workflowRoot || !path.isAbsolute(runtimeRoot) || !path.isAbsolute(workflowRoot)) return null;

  let request: Awaited<ReturnType<typeof createFounderFirstUnderstandingRequestComposition>>;
  try {
    request = await createFounderFirstUnderstandingRequestComposition();
  } catch {
    return null;
  }

  try {
    const runtime = new FilesystemOrganizationRuntimeRepository(runtimeRoot);
    const matches: AuthorizedMeetingResolutionV1[] = [];
    for (const organizationId of await request.accessRepository.findOrganizationIdsForParticipant(request.participantRef)) {
      const [policy, organizationGrants, stored] = await Promise.all([
        request.accessRepository.findPolicy(organizationId),
        request.accessRepository.findGrants({ organizationId, participantRef: request.participantRef, scope: "organization" }),
        runtime.read(organizationId),
      ]);
      const questionId = stored?.runtime.memory.initialUnderstandingBootstrap?.initialProductQuestionId;
      if (!policy || !questionId) continue;

      const directory = await founderAuthorizedMeetingDirectory({
        userId: request.consumerId,
        organizationId,
        questionId,
        workflowRoot,
        currentAccess: {
          authorize: async ({ userId, organizationId: targetOrganizationId, seriesId }) => {
            if (userId !== request.consumerId || targetOrganizationId !== organizationId) return "denied";
            const meetingGrants = await request.accessRepository.findGrants({
              organizationId,
              participantRef: request.participantRef,
              scope: "meeting-series",
              meetingSeriesId: seriesId,
            });
            return evaluateParticipantReferenceCurrentAccess({
              policy,
              organizationGrants,
              meetingGrants,
              organizationId,
              participantRef: request.participantRef,
              meetingSeriesId: seriesId,
            }) === "authorized" ? "authorized" : "denied";
          },
        },
      });
      matches.push(...directory);
    }
    return selectSingleFounderMeetingContinuation(matches);
  } catch {
    return null;
  } finally {
    await request.close();
  }
}
