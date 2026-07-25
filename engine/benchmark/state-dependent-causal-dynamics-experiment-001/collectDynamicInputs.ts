import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { DynamicObservation } from "./types";

const pattern = /^Dynamic observation: source="(.+?)"; target="(.+?)"; state-variable="(.+?)"; state=([\d.]+); upstream=([\d.]+); outcome=([\d.]+); period=(\d+); condition=(true|false); historical-exposure=([\d.]+)\.$/;

export function collectDynamicObservation(cognition: GeneratedCognition): {
  observation?: DynamicObservation;
  warningFlags: string[];
} {
  const item = cognition.rawEvidence.find((evidence) => pattern.test(evidence.text));
  const match = item?.text.match(pattern);
  const warningFlags = cognition.rawEvidence
    .filter((evidence) => evidence.text.startsWith("Audit warning:"))
    .map((evidence) => evidence.text);
  if (!item || !match) return { warningFlags };
  return {
    observation: {
      observationId: `${cognition.scenarioId}:dynamic`,
      sourceNode: match[1], targetNode: match[2], stateVariable: match[3],
      stateLevel: Number(match[4]), upstreamLevel: Number(match[5]),
      outcomeLevel: Number(match[6]), period: Number(match[7]),
      conditionPresent: match[8] === "true", historicalExposure: Number(match[9]),
      evidenceIds: [item.id],
      artifactIds: [`raw-${item.id}`],
      siloIds: item.silo ? [item.silo] : [],
    },
    warningFlags,
  };
}
