import type { ContractId, RegisteredAudit } from "./types";

const contracts: ContractId[] = [
  "current-production",
  "minimal-completeness",
  "full-causal-implication",
  "adversarially-strict",
];

export function scoreAudit(audits: RegisteredAudit[]) {
  return Object.fromEntries(
    contracts.map((contract) => {
      const tp = audits.filter(
        (item) => item.scenario.kind === "positive" && item.eligibility[contract],
      ).length;
      const fp = audits.filter(
        (item) => item.scenario.kind === "negative" && item.eligibility[contract],
      ).length;
      const fn = audits.filter(
        (item) => item.scenario.kind === "positive" && !item.eligibility[contract],
      ).length;
      const tn = audits.filter(
        (item) => item.scenario.kind === "negative" && !item.eligibility[contract],
      ).length;
      return [
        contract,
        {
          positivePrecision: tp / Math.max(1, tp + fp),
          positiveRecall: tp / Math.max(1, tp + fn),
          negativeFalsePositives: fp,
          abstentionQuality: tn / Math.max(1, tn + fp),
          eligibleCount: tp + fp,
        },
      ];
    }),
  );
}
