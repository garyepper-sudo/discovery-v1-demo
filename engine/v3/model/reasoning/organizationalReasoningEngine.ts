import { discoverReasoningPaths } from "./discoverReasoningPaths";
import { classifyReasoningPath } from "./classifyReasoningPath";
import { inferIndirectEffects } from "./inferIndirectEffects";
import { identifyLeveragePoints } from "./identifyLeveragePoints";
import { analyzeRootCauses } from "./analyzeRootCauses";
import { explainReasoningChains } from "./explainReasoningChain";
import type { OrganizationalReasoningResult } from "./reasoningTypes";

export function runOrganizationalReasoningEngine(input: {
  reasoningGraph: any;
  maxDepth?: number;
  maxPaths?: number;
}): OrganizationalReasoningResult {
  const discoveredPaths = discoverReasoningPaths(input.reasoningGraph, {
    maxDepth: input.maxDepth ?? 5,
    maxPaths: input.maxPaths ?? 50,
  });

  const classifiedPaths = discoveredPaths.map(classifyReasoningPath);

  const indirectEffects = inferIndirectEffects(classifiedPaths);

  const leveragePoints = identifyLeveragePoints(classifiedPaths);

  const rootCauses = analyzeRootCauses(classifiedPaths);

  const conclusions = explainReasoningChains({
    paths: classifiedPaths,
    leveragePoints,
  });

  const executiveSummary = [
    ...rootCauses.slice(0, 3).map((rootCause) => rootCause.reason),
    ...conclusions.slice(0, 3).map((conclusion) => conclusion.claim),
  ].slice(0, 5);

  return {
    paths: classifiedPaths,
    indirectEffects,
    leveragePoints,
    rootCauses,
    conclusions,
    executiveSummary,
  };
}