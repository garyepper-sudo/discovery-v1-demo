import assert from "node:assert/strict";

import { resolveLeadershipConversationEvaluationTime } from "../../product/integration/leadershipConversationServerComposition";

const prior = process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED;
try {
  delete process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED;
  assert.equal(resolveLeadershipConversationEvaluationTime(() => "2099-01-01T00:00:00.000Z"), "2026-08-07T16:00:00.000Z");
  process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED = "true";
  assert.equal(resolveLeadershipConversationEvaluationTime(() => "2026-09-10T19:46:08.346Z"), "2026-09-10T19:46:08.346Z");
  process.stdout.write(JSON.stringify({ validation: "founder-meeting-pack-analysis-availability-001", result: "PASS", founderEvaluationTime: "current", fixtureEvaluationTime: "fixed" }));
} finally {
  prior === undefined ? delete process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED : process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED = prior;
}
