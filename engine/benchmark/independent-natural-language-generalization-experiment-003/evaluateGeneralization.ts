import type { TopologyCandidate } from "../causal-mechanism-formation-refinement-experiment-002/types";
import type { GeneralizationTruth, NaturalLanguageScenario } from "./types";

export type Registered = {
  scenario: NaturalLanguageScenario;
  candidate: TopologyCandidate;
  productionMechanismCount: number;
};

export function evaluateGeneralization(
  registered: Registered[],
  truth: GeneralizationTruth[],
) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  const cases = truth.map((expected) => {
    const item = registered.find((entry) => entry.scenario.id === expected.scenarioId)!;
    const qualified = item.candidate.classification === "qualified-causal-mechanism";
    if (expected.shouldQualify && qualified) tp += 1;
    else if (expected.shouldQualify) fn += 1;
    else if (qualified) fp += 1;
    else tn += 1;
    return {
      scenarioId: expected.scenarioId,
      family: item.scenario.family,
      industry: item.scenario.industry,
      style: item.scenario.style,
      terminologySet: item.scenario.terminologySet,
      expectedQualification: expected.shouldQualify,
      qualified,
      expectedTopology: expected.expectedTopology,
      recoveredTopology: item.candidate.topology,
      topologyRecovered: qualified &&
        item.candidate.topology === expected.expectedTopology,
      mediatorRecovered: item.candidate.nodes.some((node) => node.role === "mediator"),
      alternativeRecovered: item.candidate.competingExplanations.length > 0,
      implicationRecovered: item.candidate.implications.length > 0,
      falsificationRecovered: item.candidate.falsificationCriteria.length > 0,
      expectedNodesRecovered: expected.expectedNodes.filter((node) =>
        item.candidate.nodes.some((actual) =>
          actual.statement.toLowerCase().includes(node.toLowerCase()))).length,
      expectedNodeCount: expected.expectedNodes.length,
      phenomena: expected.linguisticPhenomena,
    };
  });
  return {
    precision: tp + fp ? tp / (tp + fp) : 0,
    recall: tp + fn ? tp / (tp + fn) : 0,
    truePositives: tp, falsePositives: fp, falseNegatives: fn, trueNegatives: tn,
    cases,
  };
}
