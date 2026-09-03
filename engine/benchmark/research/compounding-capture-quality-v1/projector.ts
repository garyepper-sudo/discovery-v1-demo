import { OBSERVATION_SCHEMA, digest, type MeetingUnderstandingCycleObservationV1, type ObservedNumber } from "./contracts";

export interface CycleProjectionInput {
  currentAccess: { status:"authorized"|"revoked"; organizationScope:string; userScope:string; meetingSeriesScope:string; occurrenceScope:string; resolvedAt:string };
  organizationScope: string; requestedOrganizationScope: string;
  userScope: string; requestedUserScope: string; meetingSeriesScope: string;
  requestedMeetingSeriesScope: string; occurrenceScope: string; requestedOccurrenceScope: string;
  cycleIndex: number; predecessorOccurrence?: string; publication: unknown; sourceSnapshot: unknown;
  priorReviewedState: unknown; meetingPackInput: unknown; sourceCount: number; sourceVersionCount: number;
  governedBodyCount: number; missingBodyCount: number; priorOwnerIssuedResultCounts: Record<string, number>;
  priorWhatChangedItemCount: number; openCommitmentCount: number; unresolvedQuestionCount: number;
  unresolvedUnknownCount: number; privateContextCountsByIntent: Record<string, number>;
  estimatedContextUtf8Bytes: number; agendaGeneratedItemCount: number; talkingPointGeneratedItemCount: number;
  staleInput: boolean; buildCount: number; proposalCount: number; dispositions: Array<"accept"|"correct"|"reject"|"needs-information">;
  canonicalResultCounts: Record<string, number>; nonauthoritativeResultCount: number; nonpromotionCount: number;
  unresolvedCount: number; closureCount: number; whatChangedCount: number; successorCount: number; duplicateCount: number;
  personaTrace?: Array<"chief"|"counsel"|"operator"|"scout">; transitionTimes?: Record<string,string>;
}

const NO = "not-observed" as const;
export function projectCycleObservation(input: CycleProjectionInput): MeetingUnderstandingCycleObservationV1 {
  const access=input.currentAccess;
  if (access.status!=="authorized"||access.organizationScope!==input.organizationScope||access.userScope!==input.userScope||access.meetingSeriesScope!==input.meetingSeriesScope||access.occurrenceScope!==input.occurrenceScope||input.organizationScope !== input.requestedOrganizationScope || input.userScope !== input.requestedUserScope || input.meetingSeriesScope !== input.requestedMeetingSeriesScope || input.occurrenceScope !== input.requestedOccurrenceScope) throw new Error("measurement-unavailable");
  const ids = { organization: digest("organization-pseudonym/v1", input.organizationScope), series: digest("meeting-series-pseudonym/v1", [input.organizationScope,input.meetingSeriesScope]), occurrence: digest("occurrence-pseudonym/v1", [input.organizationScope,input.meetingSeriesScope,input.occurrenceScope]) };
  const persona = (name: "chief"|"counsel"|"operator"|"scout"): ObservedNumber => input.personaTrace ? input.personaTrace.filter(v => v === name).length : NO;
  const core = {
    ids, cycleIndex: input.cycleIndex, predecessor: input.predecessorOccurrence ? digest("predecessor/v1", input.predecessorOccurrence) : NO,
    publicationDigest: digest("publication/v1", input.publication), sourceSnapshotDigest: digest("source-snapshot/v1", input.sourceSnapshot),
    priorReviewedStateDigest: digest("prior-reviewed/v1", input.priorReviewedState), meetingPackInputDigest: digest("meeting-pack-input/v1", input.meetingPackInput),
    counts: { sourceCount: input.sourceCount, sourceVersionCount: input.sourceVersionCount, governedBodyCount: input.governedBodyCount, missingBodyCount: input.missingBodyCount, priorOwnerIssuedResultCounts: input.priorOwnerIssuedResultCounts, priorWhatChangedItemCount: input.priorWhatChangedItemCount, openCommitmentCount: input.openCommitmentCount, unresolvedQuestionCount: input.unresolvedQuestionCount, unresolvedUnknownCount: input.unresolvedUnknownCount, privateContextCountsByIntent: input.privateContextCountsByIntent, agendaGeneratedItemCount: input.agendaGeneratedItemCount, talkingPointGeneratedItemCount: input.talkingPointGeneratedItemCount, staleInput: input.staleInput, buildCount: input.buildCount, proposalCount: input.proposalCount, dispositions: input.dispositions, canonicalResultCounts: input.canonicalResultCounts, nonauthoritativeResultCount: input.nonauthoritativeResultCount, nonpromotionCount: input.nonpromotionCount, unresolvedCount: input.unresolvedCount, closureCount: input.closureCount, whatChangedCount: input.whatChangedCount, successorCount: input.successorCount, duplicateCount: input.duplicateCount, personaTrace: input.personaTrace },
  };
  const semanticDigest = digest("cycle-observation-semantic/v1", core);
  const dispositionCount = (v: string) => input.dispositions.filter(d => d === v).length;
  return {
    schemaVersion: OBSERVATION_SCHEMA, observationId: digest("cycle-observation-id/v1", semanticDigest), semanticDigest,
    organizationPseudonym: ids.organization, meetingSeriesPseudonym: ids.series, occurrencePseudonym: ids.occurrence,
    cycleIndex: input.cycleIndex, predecessorOccurrenceDigest: core.predecessor, publicationDigest: core.publicationDigest,
    sourceSnapshotDigest: core.sourceSnapshotDigest, priorReviewedStateDigest: core.priorReviewedStateDigest,
    workingAnalysisDigest: NO, meetingPackInputDigest: core.meetingPackInputDigest,
    measurementCreationTime: "derived-not-persisted", transitionTimes: input.transitionTimes ?? {},
    inputCoverage: { sourceCount: input.sourceCount, sourceVersionCount: input.sourceVersionCount, governedBodyCount: input.governedBodyCount, missingBodyCount: input.missingBodyCount, priorOwnerIssuedResultCounts: input.priorOwnerIssuedResultCounts, priorWhatChangedItemCount: input.priorWhatChangedItemCount, openCommitmentCount: input.openCommitmentCount, unresolvedQuestionCount: input.unresolvedQuestionCount, unresolvedUnknownCount: input.unresolvedUnknownCount, privateContextCountsByIntent: input.privateContextCountsByIntent, estimatedContextTokens: Math.ceil(input.estimatedContextUtf8Bytes/4), exactTokenCount: NO },
    meetingPackBehavior: { agendaGeneratedItemCount: input.agendaGeneratedItemCount, agendaRetainedItemCount: NO, agendaUserEditedCount: NO, agendaUserAddedCount: NO, agendaRemovedCount: NO, talkingPointGeneratedItemCount: input.talkingPointGeneratedItemCount, talkingPointUserEditedCount: NO, talkingPointUserAddedCount: NO, staleInput: input.staleInput, buildCount: input.buildCount, replayCount: NO, buildLatencyMs: NO },
    reviewOutcomes: { proposalCount: input.proposalCount, acceptCount: dispositionCount("accept"), correctCount: dispositionCount("correct"), rejectCount: dispositionCount("reject"), needsInformationCount: dispositionCount("needs-information"), canonicalResultCounts: input.canonicalResultCounts, nonauthoritativeResultCount: input.nonauthoritativeResultCount, nonpromotionCount: input.nonpromotionCount, unresolvedCount: input.unresolvedCount, closureCount: input.closureCount, whatChangedCount: input.whatChangedCount, successorCount: input.successorCount, duplicateCount: input.duplicateCount },
    personaContributionCounts: { chief: persona("chief"), counsel: persona("counsel"), operator: persona("operator"), scout: persona("scout") },
    outcomeQuality: Object.fromEntries(["continuityRecall","continuityPrecision","materialOmissionCount","chronologyErrorCount","unsupportedAssertionCount","citationFailureCount","meetingReadinessRating","blindedPreferenceResult","substantiveCorrectionCount"].map(k => [k,NO])),
  };
}
