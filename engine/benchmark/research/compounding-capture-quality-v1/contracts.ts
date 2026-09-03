import { createHash } from "node:crypto";

export const OBSERVATION_SCHEMA = "meeting-understanding-cycle-observation/v1" as const;
export const METRIC_DICTIONARY_VERSION = "compounding-capture-quality-metrics/v1" as const;
export const SYNTHETIC_LABEL = "SYNTHETIC BENCHMARK — NOT CUSTOMER OR PRODUCTION EVIDENCE";

export type ObservedNumber = number | "not-observed";

export interface MeetingUnderstandingCycleObservationV1 {
  schemaVersion: typeof OBSERVATION_SCHEMA;
  observationId: string;
  semanticDigest: string;
  organizationPseudonym: string;
  meetingSeriesPseudonym: string;
  occurrencePseudonym: string;
  cycleIndex: number;
  predecessorOccurrenceDigest: string | "not-observed";
  publicationDigest: string;
  sourceSnapshotDigest: string;
  priorReviewedStateDigest: string;
  workingAnalysisDigest: string | "not-observed";
  meetingPackInputDigest: string;
  measurementCreationTime: string;
  transitionTimes: Record<string, string | "not-observed">;
  inputCoverage: {
    sourceCount: number; sourceVersionCount: number; governedBodyCount: number;
    missingBodyCount: number; priorOwnerIssuedResultCounts: Record<string, number>;
    priorWhatChangedItemCount: number; openCommitmentCount: number;
    unresolvedQuestionCount: number; unresolvedUnknownCount: number;
    privateContextCountsByIntent: Record<string, number>;
    estimatedContextTokens: number; exactTokenCount: "not-observed";
  };
  meetingPackBehavior: {
    agendaGeneratedItemCount: number; agendaRetainedItemCount: ObservedNumber;
    agendaUserEditedCount: ObservedNumber; agendaUserAddedCount: ObservedNumber;
    agendaRemovedCount: ObservedNumber; talkingPointGeneratedItemCount: number;
    talkingPointUserEditedCount: ObservedNumber; talkingPointUserAddedCount: ObservedNumber;
    staleInput: boolean; buildCount: number; replayCount: ObservedNumber;
    buildLatencyMs: ObservedNumber;
  };
  reviewOutcomes: {
    proposalCount: number; acceptCount: number; correctCount: number; rejectCount: number;
    needsInformationCount: number; canonicalResultCounts: Record<string, number>;
    nonauthoritativeResultCount: number; nonpromotionCount: number; unresolvedCount: number;
    closureCount: number; whatChangedCount: number; successorCount: number; duplicateCount: number;
  };
  personaContributionCounts: Record<"chief" | "counsel" | "operator" | "scout", ObservedNumber>;
  outcomeQuality: Record<string, "not-observed">;
}

export function digest(domain: string, value: unknown): string {
  return createHash("sha256").update(`${domain}\0${stable(value)}`).digest("hex");
}

export function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  return JSON.stringify(value);
}

export const metricDictionary = {
  schemaVersion: METRIC_DICTIONARY_VERSION,
  zeroDenominator: "not-observed",
  contextUnit: "estimated tokens = ceil(UTF-8 bytes / 4); not provider-billed tokens",
  metrics: {
    agendaRetentionRate: "retained generated agenda items / generated agenda items",
    agendaModifiedRate: "modified generated agenda items / generated agenda items",
    agendaRemovedRate: "removed generated agenda items / generated agenda items",
    agendaAddedRate: "user-added agenda items / generated agenda items",
    reviewedCorrectionRate: "Correct dispositions / all explicit dispositions",
    unresolvedRate: "unreviewed or route-pending proposals / admitted proposals",
    continuityRecall: "relevant prior durable items correctly available / all relevant prior durable items in hidden truth",
    continuityPrecision: "relevant prior durable items correctly available / all prior-state items presented as relevant",
    activeContextEfficiency: "correct relevant current-state items available per 10,000 estimated context tokens",
    cycleLift: "treatment outcome at cycle t - paired baseline outcome at cycle t",
    compoundingSlope: "centered-cycle OLS slope of paired lift; equivalent to condition-by-cycle interaction",
  },
  claimBoundary: { modelMediatedQuality: "NOT TESTED", authenticCustomerCompounding: "NOT TESTED", organizationalOutcomes: "NOT TESTED" },
} as const;
