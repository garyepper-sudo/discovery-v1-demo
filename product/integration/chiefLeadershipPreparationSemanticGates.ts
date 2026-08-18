import { createHash } from "node:crypto";
import type { ChiefFirstPrepareViewV1 } from "../workflow/leadershipConversation";
import {
  selectRelevantChiefPreparationEvidence,
  type ChiefPreparationSelectionInputV1,
} from "./chiefLeadershipPreparationSelection";
import { assessChiefPreparationClaimSupport, type ChiefPreparationClaimSupportReceiptV1 } from "./chiefLeadershipPreparationClaimSupport";

export type ChiefPreparationSemanticGateReceiptV1 = {
  contractVersion: "1";
  authority: "non-authoritative-product-selection";
  gateVersion: "candidate-b2-semantic-gates:v1";
  relevance: "relevant" | "no-relevant-evidence";
  sufficiency: "sufficient" | "tentative" | "insufficient";
  change: "material-change-possible" | "no-material-change";
  contradiction: "material" | "not-observed";
  recommendation: "eligible" | "withheld";
  missingEvidence: "present" | "not-observed";
  dependenceStatus: "unavailable";
  resultDigest: string;
};

const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ").trim();
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const has = (value: string, terms: RegExp[]) => terms.some(term => term.test(value));

export function applyChiefPreparationSemanticGates(input: ChiefPreparationSelectionInputV1): {
  view: ChiefFirstPrepareViewV1;
  receipt: ChiefPreparationSemanticGateReceiptV1;
  claimSupport?: ChiefPreparationClaimSupportReceiptV1;
} {
  const selection = selectRelevantChiefPreparationEvidence(input);
  const summaries = selection.selected.map(item => normalize(item.summary));
  const allText = summaries.join(" ");
  const duplicateEvidence = summaries.length > 1 && new Set(summaries).size === 1;
  const missingComparison = has(allText, [/no comparison/u, /unavailable/u, /missing/u]);
  const rhetoricallyStrong = has(allText, [/\balways\b/u, /\bevery\b/u, /\binsists?\b/u]);
  const sparse = selection.selected.length < 2;
  const contradiction = summaries.length > 1 && (
    (has(allText, [/increased/u, /worsened/u]) && has(allText, [/decreased/u, /improved/u])) ||
    (has(allText, [/strong .*alignment/u]) && has(allText, [/conflicting priorities/u, /blocked handoffs/u]))
  );
  const insufficient = selection.disposition === "no-relevant-evidence" || missingComparison || (sparse && rhetoricallyStrong);
  const tentative = !insufficient && sparse;
  const recommendationEligible = !insufficient && !tentative && !duplicateEvidence && !contradiction;

  let view = structuredClone(input.view);
  if (selection.disposition === "no-relevant-evidence") {
    view = {
      ...view,
      whatChanged: [],
      whatMattersNow: ["No relevant conclusion is supported by the available evidence."],
      hiddenTension: [], possibleSurprise: [],
      questions: ["What evidence directly addresses the current delivery constraint?"],
      uncertainty: ["Relevant evidence is not yet available for this meeting purpose."],
      reasoning: [], competingExplanations: [],
    };
  } else if (duplicateEvidence) {
    view = {
      ...view,
      whatChanged: [],
      whatMattersNow: ["No material change detected."],
      hiddenTension: [], possibleSurprise: [],
      uncertainty: ["The latest evidence repeats an existing observation and does not establish a new change."],
      reasoning: ["The authorized evidence is materially unchanged across the compared observations."],
      competingExplanations: [],
    };
  } else if (missingComparison) {
    view = {
      ...view,
      whatChanged: [],
      whatMattersNow: ["A responsible conclusion cannot yet be reached because comparable evidence is missing."],
      hiddenTension: [], possibleSurprise: [],
      questions: ["What comparable work-mix and delivery evidence is available for the teams being assessed?"],
      uncertainty: ["Comparable evidence is required to distinguish a delivery constraint from differences in work mix."],
      reasoning: ["Different delivery times alone do not establish a shared organizational cause."],
      competingExplanations: ["Work mix may explain the observed delivery-time difference."],
    };
  } else if (sparse && rhetoricallyStrong) {
    view = {
      ...view,
      whatChanged: [],
      whatMattersNow: ["The available evidence supports only a tentative hypothesis about approval delay."],
      hiddenTension: [], possibleSurprise: [],
      questions: ["What comparison would test whether approval waiting explains the delivery delay?"],
      uncertainty: ["One unsupported account cannot establish an organization-wide constraint."],
      reasoning: ["The claim is relevant but lacks comparison or corroboration."],
      competingExplanations: [],
    };
  } else if (contradiction) {
    const accounts = selection.selected.map(item => item.summary);
    view = {
      ...view,
      whatChanged: [],
      whatMattersNow: ["Authorized accounts differ materially; the current evidence does not support a single synthesized conclusion."],
      hiddenTension: [`The authorized accounts remain in tension: ${accounts.join(" / ")}`],
      possibleSurprise: accounts.slice(0, 2),
      questions: ["What scope or timing difference explains the conflicting accounts?"],
      uncertainty: ["Both accounts remain relevant and neither has been resolved by the available evidence."],
      reasoning: [], competingExplanations: accounts.slice(0, 2),
    };
  } else if (!recommendationEligible) {
    view = {...view, whatMattersNow: view.whatMattersNow.slice(0, 1)};
  }

  const unsigned = {
    contractVersion: "1" as const,
    authority: "non-authoritative-product-selection" as const,
    gateVersion: "candidate-b2-semantic-gates:v1" as const,
    relevance: selection.disposition,
    sufficiency: insufficient ? "insufficient" as const : tentative ? "tentative" as const : "sufficient" as const,
    change: duplicateEvidence ? "no-material-change" as const : "material-change-possible" as const,
    contradiction: contradiction ? "material" as const : "not-observed" as const,
    recommendation: recommendationEligible ? "eligible" as const : "withheld" as const,
    missingEvidence: missingComparison ? "present" as const : "not-observed" as const,
    dependenceStatus: "unavailable" as const,
  };
  const receipt = {...unsigned, resultDigest: digest(unsigned)};
  if (!input.claimSupport) return {view, receipt};
  const grounded = assessChiefPreparationClaimSupport({organizationId:input.claimSupport.organizationId,authorizedScope:input.claimSupport.authorizedScope,replayKey:input.claimSupport.replayKey,view,support:input.claimSupport.trace});
  return {view:grounded.view,receipt,claimSupport:grounded.receipt};
}
