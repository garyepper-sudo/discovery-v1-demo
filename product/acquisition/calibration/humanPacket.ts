import type { CalibrationPreregistrationManifest, DeclaredValue } from "./contracts";
export type CalibrationHumanPacket = { caseId: string; question: string; unknown: string; whyItMatters: string; currentUnderstanding: string; candidates: Array<{ candidateId: string; actionType: string; description: string; limitations: string[]; unavailable: string[]; withheld: string[] }>; dispositionPrompt: string; executionPrompt: string };
const display = (value: DeclaredValue): string => typeof value === "string" ? value : value.state;
export function renderCalibrationHumanPacket(manifest: CalibrationPreregistrationManifest): CalibrationHumanPacket {
  const byId = new Map(manifest.candidateEnvelopes.map((item) => [item.envelope.candidate.candidateId, item]));
  return {
    caseId: manifest.caseId, question: manifest.question.exactText, unknown: manifest.unknown.exactText,
    whyItMatters: manifest.unknown.whyItMatters, currentUnderstanding: manifest.authorizedUnderstandingSummary,
    candidates: manifest.neutralDisplayOrder.map((candidateId) => {
      const item = byId.get(candidateId);
      if (!item) throw new Error("Calibration packet candidate is unavailable.");
      const envelope = item.envelope;
      return { candidateId, actionType: envelope.candidate.actionType, description: item.neutralDescription, limitations: [...item.limitations, `Objective: ${display(manifest.objectiveVersion)}`, `Optimization context: ${display(manifest.optimizationContextVersion)}`], unavailable: [...envelope.unavailableFields], withheld: [...envelope.withheldFields] };
    }),
    dispositionPrompt: "Choose authorize, decline, or defer.",
    executionPrompt: "Separately choose whether the bounded operation may execute.",
  };
}
