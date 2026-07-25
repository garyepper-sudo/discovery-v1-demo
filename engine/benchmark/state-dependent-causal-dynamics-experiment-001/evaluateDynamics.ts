import type { DynamicEdge, DynamicFamily, DynamicTruth } from "./types";

export function evaluateDynamics(
  edges: DynamicEdge[],
  truth: DynamicTruth[],
  families: DynamicFamily[],
) {
  let classTp = 0, classFp = 0, classFn = 0;
  const familyResults = truth.map((expected) => {
    const edge = edges.find((item) => item.id === `dynamic-edge:${expected.familyOpaqueId}`)!;
    const actual = new Set(edge.dynamicClasses);
    const wanted = new Set(expected.expectedClasses);
    classTp += [...actual].filter((item) => wanted.has(item)).length;
    classFp += [...actual].filter((item) => !wanted.has(item)).length;
    classFn += [...wanted].filter((item) => !actual.has(item)).length;
    const family = families.find((item) => item.opaqueId === expected.familyOpaqueId)!;
    const staticPrediction = edge.observations.reduce((sum, item) =>
      sum + item.outcomeLevel, 0) / edge.observations.length;
    const nearest = [...edge.observations].sort((a, b) =>
      Math.abs(a.stateLevel - family.heldOut.stateLevel) -
      Math.abs(b.stateLevel - family.heldOut.stateLevel))[0];
    const dynamicPrediction = nearest?.outcomeLevel ?? staticPrediction;
    return {
      familyOpaqueId: expected.familyOpaqueId,
      expectedClasses: expected.expectedClasses,
      actualClasses: edge.dynamicClasses,
      classesCorrect: expected.expectedClasses.every((item) => actual.has(item)),
      staticPrediction,
      dynamicPrediction,
      heldOutOutcome: family.heldOut.outcomeLevel,
      staticAbsoluteError: Math.abs(staticPrediction - family.heldOut.outcomeLevel),
      dynamicAbsoluteError: Math.abs(dynamicPrediction - family.heldOut.outcomeLevel),
      interventionVariableRecovered: edge.supportedState === expected.relevantVariable,
    };
  });
  const staticError = familyResults.reduce((sum, item) => sum + item.staticAbsoluteError, 0) /
    familyResults.length;
  const dynamicError = familyResults.reduce((sum, item) => sum + item.dynamicAbsoluteError, 0) /
    familyResults.length;
  return {
    dynamicClassPrecision: classTp + classFp ? classTp / (classTp + classFp) : 0,
    dynamicClassRecall: classTp + classFn ? classTp / (classTp + classFn) : 0,
    classTruePositives: classTp, classFalsePositives: classFp, classFalseNegatives: classFn,
    staticMeanAbsoluteError: staticError,
    dynamicMeanAbsoluteError: dynamicError,
    predictionImprovement: staticError - dynamicError,
    interventionTargetAccuracy: familyResults.filter((item) =>
      item.interventionVariableRecovered).length / familyResults.length,
    familyResults,
  };
}
