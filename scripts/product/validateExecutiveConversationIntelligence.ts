import assert from "node:assert/strict";

import { buildAskExperienceView } from "../../components/product-shell/data/buildAskExperienceView";
import {
  MockConversationInterpreter,
  createConversationInterpreter,
  parseConversationInterpreterMode,
  readConversationIntelligenceFeatureFlags,
  type ExecutiveConversationRequest,
} from "../../engine/conversation";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

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

const interpretation = interpreter.interpret(request);
assert.deepEqual(interpreter.interpret(request), interpretation);
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
assert.equal(parseConversationInterpreterMode("unsupported"), "none");
assert.equal(createConversationInterpreter("none"), null);
assert.equal(createConversationInterpreter("mock")?.provider, "mock");
assert.deepEqual(readConversationIntelligenceFeatureFlags({ CONVERSATION_INTERPRETER: "mock" }), { conversationInterpreter: "mock" });

console.log("Executive Conversation Intelligence validation: 18 checks passed.");
