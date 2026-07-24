import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONVERSATION_PROMPT_VERSION_V1,
  CONVERSATION_PROMPT_VERSION_V2,
  MockConversationInterpreter,
  OpenAIConversationInterpreter,
  type ExecutiveConversationInterpreter,
} from "../../conversation";
import { executiveConversationScenarios } from "./executiveConversationScenarios";
import { heldOutConversationScenarios } from "./heldOutConversationScenarios";
import { reasoningHeldOutConversationScenarios } from "./reasoningHeldOutConversationScenarios";
import { runExecutiveCollaborationLab } from "./runExecutiveCollaborationLab";
import type { CollaborationDimension } from "./executiveConversationTypes";

const heldOut = [...heldOutConversationScenarios, ...reasoningHeldOutConversationScenarios];
const runtimeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../.discovery-runtime/organizations");
const snapshotRuntimeArtifacts = () => fs.existsSync(runtimeDirectory)
  ? Object.fromEntries(
    fs.readdirSync(runtimeDirectory)
      .sort()
      .map((name) => [name, fs.readFileSync(path.join(runtimeDirectory, name), "utf8")]),
  )
  : {};

async function evaluate(
  interpreter: ExecutiveConversationInterpreter | null,
  requireProviderSuccess = false,
) {
  const development = await runExecutiveCollaborationLab(executiveConversationScenarios, interpreter);
  const heldOutReport = await runExecutiveCollaborationLab(heldOut, interpreter);
  const results = [...development.results, ...heldOutReport.results];
  const dimensions = Object.keys(development.dimensions).reduce((output, key) => {
    const dimension = key as CollaborationDimension;
    output[dimension] = Math.round(results.reduce((sum, item) => sum + item.score.dimensions[dimension], 0) / results.length * 100) / 100;
    return output;
  }, {} as Record<CollaborationDimension, number>);
  const observations = results.flatMap((item) => item.run.trace.map((turn) => turn.providerObservation).filter((item) => item !== null));
  const successfulCalls = observations.filter((item) => item.status === "success").length;
  const fallbacks = observations.filter((item) => item.status === "fallback").length;
  const providerComplete = !requireProviderSuccess ||
    (observations.length > 0 && successfulCalls === observations.length && fallbacks === 0);
  return {
    status: requireProviderSuccess
      ? providerComplete ? "complete" : "incomplete-fallback"
      : "not-applicable",
    development: providerComplete ? development.overallScore : null,
    heldOut: providerComplete ? heldOutReport.overallScore : null,
    combined: providerComplete
      ? Math.round(results.reduce((sum, item) => sum + item.score.score, 0) / results.length * 100) / 100
      : null,
    dimensions: providerComplete ? dimensions : null,
    criticalFailures: results.flatMap((item) => item.score.criticalFailures),
    warnings: results.flatMap((item) => item.score.warnings),
    provider: {
      calls: observations.length,
      successfulCalls,
      fallbacks,
      averageLatencyMs: observations.length ? Math.round(observations.reduce((sum, item) => sum + item.latencyMs, 0) / observations.length) : null,
      averageInputTokens: observations.length ? Math.round(observations.reduce((sum, item) => sum + (item.inputTokens ?? 0), 0) / observations.length) : null,
      averageOutputTokens: observations.length ? Math.round(observations.reduce((sum, item) => sum + (item.outputTokens ?? 0), 0) / observations.length) : null,
    },
  };
}

async function main() {
  const runtimeBefore = snapshotRuntimeArtifacts();
  const report = {
    none: await evaluate(null),
    mock: await evaluate(new MockConversationInterpreter()),
    providerV1: await evaluate(
      new OpenAIConversationInterpreter({ promptVersion: CONVERSATION_PROMPT_VERSION_V1 }),
      true,
    ),
    providerV2: await evaluate(
      new OpenAIConversationInterpreter({ promptVersion: CONVERSATION_PROMPT_VERSION_V2 }),
      true,
    ),
  };
  assert.deepEqual(
    snapshotRuntimeArtifacts(),
    runtimeBefore,
    "Reasoning interpretation evaluation changed persisted Runtime artifacts.",
  );
  console.log(JSON.stringify(report, null, 2));
}

void main();
