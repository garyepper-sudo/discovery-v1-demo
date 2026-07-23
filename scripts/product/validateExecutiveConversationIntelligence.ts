import assert from "node:assert/strict";

import { buildAskExperienceView } from "../../components/product-shell/data/buildAskExperienceView";
import {
  MockConversationInterpreter,
  OpenAIConversationInterpreter,
  ConversationProviderError,
  createConversationInterpreter,
  parseConversationInterpreterMode,
  readConversationIntelligenceFeatureFlags,
  type ExecutiveConversationRequest,
} from "../../engine/conversation";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

async function main() {
const runtime = createEmptyOrganizationRuntime({
  organizationId: "org-conversation-validation",
  name: "Conversation Validation",
});
(runtime.memory as unknown as Record<string, unknown>).executiveRecommendation = {
  id: "recommendation-stable",
  headline: "Preserve the current recommendation.",
  confidence: 0.71,
};
const runtimeBefore = JSON.stringify(runtime);
const recommendationBefore = JSON.stringify((runtime.memory as unknown as Record<string, unknown>).executiveRecommendation);
const interpreter = new MockConversationInterpreter();
const request: ExecutiveConversationRequest = {
  currentMessage: "Actually, I now prefer delegated authority in Option B.",
  recentConversation: [
    { speaker: "executive", message: "I prefer centralizing operating decisions in Option A." },
    { speaker: "discovery", message: "Option A is the current direction under discussion." },
  ],
  runtime,
};

const interpretation = await interpreter.interpret(request);
assert.deepEqual(await interpreter.interpret(request), interpretation);
assert.equal(interpretation.executiveIntent, "reflect");
assert.equal(interpretation.recommendedConversationalAction, "wait");
assert.deepEqual(interpretation.discardedHypotheses, ["I prefer centralizing operating decisions in Option A."]);
assert.ok(interpretation.executiveObjective.includes("changed direction"));
assert.equal(JSON.stringify(runtime), runtimeBefore);
assert.equal(JSON.stringify((runtime.memory as unknown as Record<string, unknown>).executiveRecommendation), recommendationBefore);

const fallback = buildAskExperienceView(runtime);
assert.equal(fallback.conversation, null);
assert.deepEqual(buildAskExperienceView(runtime, null), fallback);
const interpreted = buildAskExperienceView(runtime, interpretation);
assert.deepEqual(interpreted.conversation, interpretation);
assert.equal(interpreted.organization.id, runtime.metadata.organizationId);
assert.equal(JSON.stringify(runtime), runtimeBefore);

assert.equal(parseConversationInterpreterMode(undefined), "none");
assert.equal(parseConversationInterpreterMode("none"), "none");
assert.equal(parseConversationInterpreterMode("mock"), "mock");
assert.equal(parseConversationInterpreterMode("openai"), "openai");
assert.equal(parseConversationInterpreterMode("unsupported"), "none");
assert.equal(createConversationInterpreter("none"), null);
assert.equal(createConversationInterpreter("mock")?.provider, "mock");
assert.equal(createConversationInterpreter("openai")?.provider, "openai");
assert.deepEqual(readConversationIntelligenceFeatureFlags({ CONVERSATION_INTERPRETER: "mock" }), { conversationInterpreter: "mock" });

const missingCredentials = new OpenAIConversationInterpreter({ apiKey: "" });
await assert.rejects(() => missingCredentials.interpret(request), (error) => error instanceof ConversationProviderError && error.reason === "missing-credentials");
assert.equal(missingCredentials.lastObservation?.fallbackReason, "missing-credentials");

let transmittedBody = "";
const validProvider = new OpenAIConversationInterpreter({
  apiKey: "test-key",
  fetchImplementation: async (_input, init) => {
    transmittedBody = String(init?.body ?? "");
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify(interpretation) } }],
      usage: { prompt_tokens: 140, completion_tokens: 65 },
    }), { status: 200, headers: { "content-type": "application/json" } });
  },
});
assert.deepEqual(await validProvider.interpret(request), interpretation);
assert.equal(validProvider.lastObservation?.status, "success");
assert.equal(validProvider.lastObservation?.inputTokens, 140);
assert.equal(validProvider.lastObservation?.outputTokens, 65);
assert.equal(transmittedBody.includes("recommendation-stable"), false);
assert.equal(transmittedBody.includes("Preserve the current recommendation"), false);
assert.equal(transmittedBody.includes("test-key"), false);
assert.equal(JSON.stringify(runtime), runtimeBefore);

const malformedProvider = new OpenAIConversationInterpreter({
  apiKey: "test-key",
  fetchImplementation: async () => new Response(JSON.stringify({ choices: [{ message: { content: "not-json" } }] }), { status: 200 }),
});
await assert.rejects(() => malformedProvider.interpret(request), (error) => error instanceof ConversationProviderError && error.reason === "malformed-output");
assert.equal(malformedProvider.lastObservation?.invalidOutputCount, 1);

console.log("Executive Conversation Intelligence validation: 32 checks passed.");
}

void main();
