import type { RawSiloEvidence } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import { dynamicFamilies, negativeControls } from "./dynamicScenarioCorpus";
import type { DynamicScenario } from "./types";

const evidence = (
  sourceId: string, silo: string, content: string, period: number,
): RawSiloEvidence => ({
  sourceId, sourceType: silo, silo, content, reliability: 0.8,
  observedAt: `2026-${String(period + 1).padStart(2, "0")}-01T00:00:00.000Z`,
});

const observationText = (
  source: string, target: string, stateVariable: string,
  state: number, upstream: number, outcome: number, period: number,
  condition: boolean, history: number,
) => `Dynamic observation: source="${source}"; target="${target}"; state-variable="${stateVariable}"; state=${state.toFixed(2)}; upstream=${upstream.toFixed(2)}; outcome=${outcome.toFixed(2)}; period=${period}; condition=${condition}; historical-exposure=${history.toFixed(2)}.`;

export function generateDynamicScenarios(): DynamicScenario[] {
  const scenarios: DynamicScenario[] = [];
  for (const family of dynamicFamilies) {
    family.variants.forEach((variant, index) => {
      const id = `${family.opaqueId}-variant-${index}`;
      const text = observationText(
        family.sourceNode, family.targetNode, family.stateVariable,
        variant.stateLevel, variant.upstreamLevel, variant.outcomeLevel,
        index, variant.conditionPresent, variant.historicalExposure ?? 0,
      );
      scenarios.push({
        familyOpaqueId: family.opaqueId,
        variantIndex: index,
        scenario: {
          id, organizationId: `organization-${family.opaqueId}`,
          company: "Dynamic Test Organization", industry: "Cross-industry",
          question: "How does the existing relationship behave in this state?",
          evidence: [
            evidence(`${id}-a`, "Operations", text, index),
            evidence(`${id}-b`, "Finance", `Independent measurement confirms the recorded outcome=${variant.outcomeLevel.toFixed(2)} for period=${index}.`, index),
          ],
        },
      });
    });
  }
  for (const control of negativeControls) {
    control.values.forEach((outcome, index) => {
      const id = `${control.opaqueId}-variant-${index}`;
      const stateMissing = control.kind === "missing-state";
      const main = stateMissing
        ? `Observation lacks state information; source="control input"; target="control outcome"; outcome=${outcome.toFixed(2)}.`
        : observationText("control input", "control outcome", "control state",
          index / 4, index / 4, outcome, index, index >= 2, 0);
      const warning =
        control.kind === "common-cause" ? "Audit warning: a common cause explains both state and outcome."
          : control.kind === "reverse-causality" ? "Audit warning: the outcome precedes and may cause the state."
            : control.kind === "correlation" ? "Audit warning: correlation has no supported direction."
              : "";
      scenarios.push({
        familyOpaqueId: control.opaqueId,
        variantIndex: index,
        scenario: {
          id, organizationId: `organization-${control.opaqueId}`,
          company: "Dynamic Control Organization", industry: "Cross-industry",
          question: "How does the existing relationship behave in this state?",
          evidence: [
            evidence(`${id}-a`, "Operations", main, index),
            ...(warning ? [evidence(`${id}-b`, "Audit", warning, index)] : []),
          ],
        },
      });
    });
  }
  return scenarios;
}
