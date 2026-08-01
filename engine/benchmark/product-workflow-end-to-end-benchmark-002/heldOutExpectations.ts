import { createHash } from "node:crypto";
import type { HeldOutExpectation } from "./types";

const canonical = (value: unknown): string => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}` : JSON.stringify(value);
const freeze = (input: Omit<HeldOutExpectation, "expectationHash">): HeldOutExpectation => ({ ...input, expectationHash: createHash("sha256").update(canonical(input)).digest("hex") });
const invariance = ["evidence-order", "candidate-order", "duplicate-evidence", "irrelevant-instruction-content", "object-key-order", "equivalent-irrelevant-wording"];
const sensitivity = ["governance-prohibition", "authorization-revocation", "budget-exhaustion", "contradictory-outcome"];

export const heldOutExpectations: HeldOutExpectation[] = [
  freeze({ scenarioId: "holdout-01-aviation", expectedKind: "selected-action", expectedCandidateId: "av-compare-signoff", prohibitedKinds: ["material-tie"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-02-healthcare", expectedKind: "material-tie", expectedCandidateId: null, prohibitedKinds: ["selected-action"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-03-objective-waste", expectedKind: "selected-action", expectedCandidateId: "food-spoilage", prohibitedKinds: ["material-tie"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-04-objective-reach", expectedKind: "selected-action", expectedCandidateId: "food-demand", prohibitedKinds: ["material-tie"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-05-context-rapid", expectedKind: "selected-action", expectedCandidateId: "support-routing", prohibitedKinds: ["material-tie"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-06-context-depth", expectedKind: "abstain", expectedCandidateId: null, prohibitedKinds: ["material-tie"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-07-municipal", expectedKind: "selected-action", expectedCandidateId: "mun-aggregate-rework", prohibitedKinds: ["material-tie"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-08-university", expectedKind: "selected-action", expectedCandidateId: "uni-advising-aggregate", prohibitedKinds: ["material-tie"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-09-manufacturing", expectedKind: "abstain", expectedCandidateId: null, prohibitedKinds: ["selected-action"], invariance, sensitivity }),
  freeze({ scenarioId: "holdout-10-retail", expectedKind: "stop", expectedCandidateId: null, prohibitedKinds: ["selected-action"], invariance, sensitivity }),
];
