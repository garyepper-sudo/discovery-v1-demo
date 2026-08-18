import type { ChiefFirstPrepareViewV1 } from "../workflow/leadershipConversation";
import type { ChiefClaimSupportTraceV1 } from "./chiefLeadershipPreparationClaimSupport";

export type ChiefPreparationEvidenceSummaryV1 = {
  sourceRef: string;
  observedAt: string;
  summary: string;
};

export type ChiefPreparationSelectionInputV1 = {
  view: ChiefFirstPrepareViewV1;
  productQuestion: string;
  meetingPurpose: string;
  evidence: ChiefPreparationEvidenceSummaryV1[];
  claimSupport?: { organizationId: string; authorizedScope: "organization" | "team"; replayKey: string; trace: ChiefClaimSupportTraceV1 };
};

const normalize = (value: string) =>
  value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

const deliveryTerms = new Set([
  "approval", "approvals", "capacity", "constraint", "coordination", "decision",
  "decisions", "delivery", "handoff", "handoffs", "ownership", "priorities", "work",
]);

export function selectRelevantChiefPreparationEvidence(input: ChiefPreparationSelectionInputV1) {
  const purpose = normalize(`${input.productQuestion} ${input.meetingPurpose}`);
  const purposeTerms = new Set(purpose.split(" ").filter(term => term.length > 4));
  const selected = input.evidence.filter(item => {
    const terms = normalize(item.summary).split(" ");
    return terms.some(term => purposeTerms.has(term) || deliveryTerms.has(term));
  });
  return {
    selected,
    rejected: input.evidence.filter(item => !selected.includes(item)),
    disposition: selected.length ? "relevant" as const : "no-relevant-evidence" as const,
  };
}
