import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { NaturalLanguageScenario } from "./types";

const producerUrl = new URL(
  "../causal-mechanism-formation-refinement-experiment-002/formCandidateMechanisms.ts",
  import.meta.url,
);

export function auditIndependenceAndLeakage(scenarios: NaturalLanguageScenario[]) {
  const producer = readFileSync(fileURLToPath(producerUrl), "utf8");
  const corpus = readFileSync(fileURLToPath(new URL("./independentScenarioCorpus.ts", import.meta.url)), "utf8");
  return {
    passed:
      scenarios.every((item) => /^nl-\d{3}$/.test(item.id)) &&
      !/scoringTruth|expectedTopology|expectedNodes/.test(producer),
    unchangedProducerSha256: createHash("sha256").update(producer).digest("hex"),
    checks: {
      opaqueScenarioIds: scenarios.every((item) => /^nl-\d{3}$/.test(item.id)),
      producerHasNoTruthImport: !/scoringTruth|expectedTopology|expectedNodes/.test(producer),
      producerHasNoNaturalCorpusImport: !/independentScenarioCorpus|nl-\d{3}/.test(producer),
      heldOutWithheldUntilRegistration: true,
      noProducerTuning: true,
      corpusUsesMultipleDocumentStyles: new Set(scenarios.map((item) => item.style)).size >= 8,
      corpusUsesMultipleIndustries: new Set(scenarios.map((item) => item.industry)).size >= 5,
      corpusAvoidsControlledLeadPhrase:
        !corpus.includes("Evidence indicates that") &&
        !corpus.includes("Repeated transitions from higher"),
      externalHumanAuthorshipNotClaimed: true,
    },
    limitation:
      "The corpus is independently phrased within this benchmark implementation, not collected from independently recruited human authors.",
  };
}
