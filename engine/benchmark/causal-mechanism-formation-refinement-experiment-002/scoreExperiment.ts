import type { RefinementTruth, TopologyCandidate } from "./types";

type Registered = { scenarioId: string; category: string; candidates: TopologyCandidate[] };
const edgeKey = (from: string, to: string) => `${from}\u0000${to}`;

export function scoreExperiment(registered: Registered[], truth: RefinementTruth[]) {
  let tp = 0, fp = 0, fn = 0, tn = 0, edgeTp = 0, edgeFp = 0, edgeFn = 0;
  const cases = truth.map((expected) => {
    const item = registered.find((value) => value.scenarioId === expected.scenarioId)!;
    const candidate = item.candidates.find((value) => value.strategy === "conservative-unified")!;
    const qualified = candidate.classification === "qualified-causal-mechanism";
    if (expected.shouldQualify && qualified) tp += 1;
    else if (expected.shouldQualify) fn += 1;
    else if (qualified) fp += 1;
    else tn += 1;
    const actual = new Set(candidate.edges
      .filter((edge) => edge.supportStatus === "explicit" ||
        edge.supportStatus === "deterministically-derived")
      .map((edge) => edgeKey(edge.fromNodeId, edge.toNodeId)));
    const wanted = new Set(expected.expectedEdges.map(([from, to]) => edgeKey(from, to)));
    edgeTp += [...actual].filter((key) => wanted.has(key)).length;
    edgeFp += [...actual].filter((key) => !wanted.has(key)).length;
    edgeFn += [...wanted].filter((key) => !actual.has(key)).length;
    return {
      scenarioId: expected.scenarioId, category: item.category,
      expectedTopology: expected.expectedTopology, actualTopology: candidate.topology,
      qualified, expectedQualification: expected.shouldQualify,
      topologyCorrect: candidate.topology === expected.expectedTopology,
    };
  });
  const byCategory = Object.fromEntries([...new Set(registered.map((item) => item.category))].map((category) => {
    const subset = cases.filter((item) => item.category === category);
    return [category, {
      qualified: subset.filter((item) => item.qualified).length,
      expected: subset.filter((item) => item.expectedQualification).length,
      topologyCorrect: subset.filter((item) => item.topologyCorrect).length,
      count: subset.length,
    }];
  }));
  return {
    mechanism: {
      precision: tp + fp ? tp / (tp + fp) : 0,
      recall: tp + fn ? tp / (tp + fn) : 0,
      truePositives: tp, falsePositives: fp, falseNegatives: fn, trueNegatives: tn,
    },
    edges: {
      precision: edgeTp + edgeFp ? edgeTp / (edgeTp + edgeFp) : 0,
      recall: edgeTp + edgeFn ? edgeTp / (edgeTp + edgeFn) : 0,
      truePositives: edgeTp, falsePositives: edgeFp, falseNegatives: edgeFn,
    },
    byCategory,
    cases,
  };
}
