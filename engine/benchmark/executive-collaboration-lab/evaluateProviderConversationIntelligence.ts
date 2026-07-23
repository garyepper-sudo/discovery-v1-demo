import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MockConversationInterpreter, OpenAIConversationInterpreter } from "../../conversation";
import { executiveConversationScenarios } from "./executiveConversationScenarios";
import { heldOutConversationScenarios } from "./heldOutConversationScenarios";
import { runExecutiveCollaborationLab } from "./runExecutiveCollaborationLab";
import type { CollaborationDimension } from "./executiveConversationTypes";

async function main() {
const runtimeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../.discovery-runtime/organizations");
const snapshot = () => fs.existsSync(runtimeDirectory)
  ? Object.fromEntries(fs.readdirSync(runtimeDirectory).sort().map((name) => [name, fs.readFileSync(path.join(runtimeDirectory, name), "utf8")]))
  : {};
const before = snapshot();

const none = await runExecutiveCollaborationLab(executiveConversationScenarios);
const mock = await runExecutiveCollaborationLab(executiveConversationScenarios, new MockConversationInterpreter());
const provider = new OpenAIConversationInterpreter();
const providerDevelopment = await runExecutiveCollaborationLab(executiveConversationScenarios, provider);
const providerHeldOut = await runExecutiveCollaborationLab(heldOutConversationScenarios, provider);
const providerResults = [...providerDevelopment.results, ...providerHeldOut.results];
const observations = providerResults.flatMap((item) => item.run.trace.map((turn) => turn.providerObservation).filter((item) => item !== null));
const fallbackCount = observations.filter((item) => item.status === "fallback").length;
const validObservations = observations.filter((item) => item.status === "success");
const totals = validObservations.reduce((acc, item) => ({
  latencyMs: acc.latencyMs + item.latencyMs,
  inputTokens: acc.inputTokens + (item.inputTokens ?? 0),
  outputTokens: acc.outputTokens + (item.outputTokens ?? 0),
  schemaRepairCount: acc.schemaRepairCount + item.schemaRepairCount,
  invalidOutputCount: acc.invalidOutputCount + item.invalidOutputCount,
}), { latencyMs: 0, inputTokens: 0, outputTokens: 0, schemaRepairCount: 0, invalidOutputCount: 0 });
const combinedDimensions = Object.keys(providerDevelopment.dimensions).reduce((result, key) => {
  const dimension = key as CollaborationDimension;
  result[dimension] = Math.round(providerResults.reduce((sum, item) => sum + item.score.dimensions[dimension], 0) / providerResults.length * 100) / 100;
  return result;
}, {} as Record<CollaborationDimension, number>);
const combinedScore = Math.round(providerResults.reduce((sum, item) => sum + item.score.score, 0) / providerResults.length * 100) / 100;
const liveProviderComplete = fallbackCount === 0 && validObservations.length === observations.length;
const averageInputTokens = validObservations.length ? totals.inputTokens / validObservations.length : null;
const averageOutputTokens = validObservations.length ? totals.outputTokens / validObservations.length : null;
const tokenProjection = (turns: number) => ({
  inputTokens: averageInputTokens === null ? null : Math.round(averageInputTokens * turns),
  outputTokens: averageOutputTokens === null ? null : Math.round(averageOutputTokens * turns),
});

if (JSON.stringify(snapshot()) !== JSON.stringify(before)) throw new Error("Provider evaluation changed persisted Runtime artifacts.");

const report = {
  baselines: {
    none: { development: none.overallScore },
    mock: { development: mock.overallScore },
    provider: {
      status: liveProviderComplete ? "complete" : "incomplete-fallback",
      development: liveProviderComplete ? providerDevelopment.overallScore : null,
      heldOut: liveProviderComplete ? providerHeldOut.overallScore : null,
      combined: liveProviderComplete ? combinedScore : null,
      fallbackObservedScores: liveProviderComplete ? null : {
        development: providerDevelopment.overallScore,
        heldOut: providerHeldOut.overallScore,
        combined: combinedScore,
      },
      dimensions: liveProviderComplete ? combinedDimensions : null,
    },
  },
  provider: {
    name: provider.provider,
    model: provider.model,
    calls: observations.length,
    successfulCalls: validObservations.length,
    fallbackCount,
    fallbackReasons: [...new Set(observations.map((item) => item.fallbackReason).filter(Boolean))],
    schemaRepairCount: totals.schemaRepairCount,
    invalidOutputCount: totals.invalidOutputCount,
    averageLatencyMs: validObservations.length ? Math.round(totals.latencyMs / validObservations.length) : null,
    estimatedTokens: {
      perTurn: tokenProjection(1),
      fifteenTurns: tokenProjection(15),
      thirtyTurns: tokenProjection(30),
      oneHundredMonthlyUsersAtThirtyTurns: tokenProjection(3_000),
      oneThousandMonthlyUsersAtThirtyTurns: tokenProjection(30_000),
    },
    costFormula: "(input_tokens / 1,000,000 × configured model input price) + (output_tokens / 1,000,000 × configured model output price); add retry usage when present",
  },
  integrity: {
    runtimeArtifactsRestored: true,
    organizationIsolation: providerResults.every((item) => item.run.organizationId === item.scenario.organizationId),
    criticalFailures: providerResults.flatMap((item) => item.score.criticalFailures),
    warnings: providerResults.flatMap((item) => item.score.warnings),
  },
};

console.log(JSON.stringify(report, null, 2));
}

void main();
