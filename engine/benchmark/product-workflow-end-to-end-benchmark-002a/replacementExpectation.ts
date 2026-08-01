import { createHash } from "node:crypto";
import type { ReplacementExpectation } from "./types";

const unsigned: Omit<ReplacementExpectation, "expectationHash"> = { scenarioId: "holdout-11-outcome-discrimination", baseline: { kind: "selected-action", candidateId: "coldchain-door-dwell" }, materialOutcome: { kind: "selected-action", candidateId: "coldchain-refrigeration" }, unrelatedOutcome: { substantiveChange: false }, prohibitedCandidates: [] };
export const replacementExpectation: ReplacementExpectation = { ...unsigned, expectationHash: createHash("sha256").update(JSON.stringify(unsigned)).digest("hex") };
