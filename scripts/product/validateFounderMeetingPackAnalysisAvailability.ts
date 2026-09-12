import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { resolveLeadershipConversationEvaluationTime } from "../../product/integration/leadershipConversationServerComposition";

async function main() {
const prior = process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED;
try {
  delete process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED;
  assert.equal(resolveLeadershipConversationEvaluationTime(() => "2099-01-01T00:00:00.000Z"), "2026-08-07T16:00:00.000Z");
  process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED = "true";
  assert.equal(resolveLeadershipConversationEvaluationTime(() => "2026-09-10T19:46:08.346Z"), "2026-09-10T19:46:08.346Z");
  const [composition, page, startup] = await Promise.all([
    readFile("product/integration/leadershipConversationServerComposition.ts", "utf8"),
    readFile("app/product-alpha/meetings/[seriesAddress]/page.tsx", "utf8"),
    readFile("scripts/development/startRedactedDevelopmentServer.ts", "utf8"),
  ]);
  assert.match(composition, /createFounderLocalAlphaLeadershipConversationComposition[\s\S]*analysisTransport:analysisLifecycleRoot&&analysisTimeoutMs!==null\?createOpenAIExecutiveAnalysisTransport\(\):undefined/);
  assert.match(composition, /analysisLifecycleRoot=root&&path\.isAbsolute\(root\)\?path\.join\(root,"source-scoped-lifecycle"\):undefined/);
  assert.match(composition, /refreshMeetingPackAvailable[\s\S]*lifecycleRootReady/);
  assert.match(page, /server\.refreshMeetingPack\.available/);
  assert.doesNotMatch(page, /analyzeSourceScopedForDevelopment/);
  assert.match(startup, /founderRoot = process\.env\.DISCOVERY_FOUNDER_LOCAL_ALPHA_RUNTIME_ROOT/);
  assert.match(startup, /!founderRoot \|\| !path\.isAbsolute\(founderRoot\)/);
  assert.match(startup, /state\.isSymbolicLink\(\) \|\| \(state\.mode & 0o777\) !== 0o700/);
  assert.match(startup, /ensureDirectory\(lifecycleRoot\)/);
  assert.match(startup, /for \(const child of \["attempts", "active"\]\) await ensureDirectory/);
  assert.doesNotMatch(startup, /server-only/);
  process.stdout.write(JSON.stringify({ validation: "founder-meeting-pack-analysis-availability-001", result: "PASS", founderEvaluationTime: "current", fixtureEvaluationTime: "fixed", liveTransport: "configured", lifecycle: "startup-provisioned", pageLoadAnalysis: 0, providerRequests: 0, productWrites: 0 }));
} finally {
  prior === undefined ? delete process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED : process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED = prior;
}
}
void main();
