import { extractGeneratedCognition as extract } from "../emergent-organizational-intelligence-production-shadow-experiment-002/extractGeneratedCognition";
import { runProductionShadowCognition as run } from "../emergent-organizational-intelligence-production-shadow-experiment-002/runProductionShadowCognition";

export const extractGeneratedCognition = extract;
export function runProductionShadowCognition(...args: Parameters<typeof run>) {
  const log = console.log;
  const dir = console.dir;
  console.log = () => undefined;
  console.dir = () => undefined;
  try {
    return run(...args);
  } finally {
    console.log = log;
    console.dir = dir;
  }
}
