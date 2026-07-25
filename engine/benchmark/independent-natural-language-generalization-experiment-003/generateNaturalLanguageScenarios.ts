import type { RawSiloEvidence } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import { independentNegativeCorpus, independentPositiveCorpus } from "./independentScenarioCorpus";
import type {
  GeneralizationTruth, NaturalLanguageScenario, WritingStyle,
} from "./types";

const evidence = (
  sourceId: string,
  silo: string,
  content: string,
  index: number,
): RawSiloEvidence => ({
  sourceId, sourceType: silo, silo, content,
  observedAt: `2026-${String((index % 9) + 1).padStart(2, "0")}-01T00:00:00.000Z`,
  reliability: 0.8,
});

export function generateNaturalLanguageCorpus() {
  const scenarios: NaturalLanguageScenario[] = [];
  const truth: GeneralizationTruth[] = [];
  let ordinal = 0;
  for (const family of independentPositiveCorpus) {
    for (const variant of family.variants) {
      ordinal += 1;
      const id = `nl-${String(ordinal).padStart(3, "0")}`;
      scenarios.push({
        id, family: family.family, industry: variant.industry,
        style: variant.style, terminologySet: variant.terminologySet, kind: "positive",
        scenario: {
          id, organizationId: `organization-${id}`,
          company: "Independent Language Organization",
          industry: variant.industry,
          question: "What organizational causal structure is supported?",
          evidence: variant.documents.map((document, index) =>
            evidence(`${id}-source-${index}`, document.silo, document.text, index)),
        },
      });
      truth.push({
        scenarioId: id, shouldQualify: true,
        expectedTopology: family.topology,
        expectedNodes: family.expectedNodes,
        linguisticPhenomena: variant.phenomena,
      });
    }
  }
  for (const [family, industry, style, texts] of independentNegativeCorpus) {
    ordinal += 1;
    const id = `nl-${String(ordinal).padStart(3, "0")}`;
    scenarios.push({
      id, family, industry, style: style as WritingStyle,
      terminologySet: family, kind: "negative",
      scenario: {
        id, organizationId: `organization-${id}`,
        company: "Independent Language Organization",
        industry, question: "What organizational causal structure is supported?",
        evidence: texts.map((text, index) =>
          evidence(`${id}-source-${index}`, `Silo-${index}`, text, index)),
      },
    });
    truth.push({
      scenarioId: id, shouldQualify: false, expectedTopology: "unresolved",
      expectedNodes: [], linguisticPhenomena: [family],
    });
  }
  return { scenarios, truth };
}
