import { runDiscoveryV3 } from "../../v3";
import {
  createEmptyOrganizationRuntime,
  evolveOrganizationRuntime,
} from "../../v3/runtime";

import type { InferenceScenario } from "./types";

function withFixedClock<T>(timestamp: string, operation: () => T): T {
  const NativeDate = Date;
  const fixed = NativeDate.parse(timestamp);
  class FixedDate extends NativeDate {
    constructor(value?: string | number | Date) {
      super(value === undefined ? fixed : value);
    }
    static now() {
      return fixed;
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  try {
    return operation();
  } finally {
    globalThis.Date = NativeDate;
  }
}

export function runProductionShadowCognition(scenario: InferenceScenario) {
  return withFixedClock("2026-07-24T20:00:00.000Z", () => {
    const input = {
      company: scenario.company,
      website: "",
      industry: scenario.industry,
      question: scenario.question,
      context: "",
      evidenceSources: [...scenario.evidence]
        .sort((a, b) => a.sourceId.localeCompare(b.sourceId))
        .map(({ silo: _silo, ...source }) => source),
    };
    const result = runDiscoveryV3(input);
    const runtime = evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({
        organizationId: scenario.organizationId,
        name: scenario.company,
        industry: scenario.industry,
      }),
      result,
      input,
    });
    return { input, result, runtime };
  });
}
