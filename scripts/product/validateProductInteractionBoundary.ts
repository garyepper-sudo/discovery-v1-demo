import assert from "node:assert/strict";

import { buildProductHref } from "../../components/product-shell/data/productOrganization";
import { createLeadershipDecisionRecord } from "../../components/product-shell/data/createLeadershipDecisionRecord";
import {
  hasCompletedInvestigationInteraction,
  interactionMarker,
  validateProductInteractionRequest,
} from "../../components/product-shell/data/productInteractionBoundary";
import { saveExecutiveDecisionRecord } from "../../engine/v3/decisions/saveExecutiveDecisionRecord";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

const organizationId = "org_interaction_boundary";

assert.throws(
  () => validateProductInteractionRequest({ organizationId, interactionId: "unsupported-1", action: "investigate", content: "Unexpected action" }),
  /action is unsupported/,
);
assert.throws(() => validateProductInteractionRequest(null), /request body is invalid/);
assert.throws(
  () => validateProductInteractionRequest({ organizationId: "../another-org", interactionId: "invalid-org", action: "add-context", content: "Context" }),
  /organizationId is invalid/,
);
assert.throws(
  () => validateProductInteractionRequest({ organizationId, interactionId: "decision-1", action: "create-decision", content: "Delegate routine decisions" }),
  /whyNow is required/,
);

const validated = validateProductInteractionRequest({
  organizationId,
  interactionId: "decision:1",
  action: "create-decision",
  content: "Delegate routine decisions",
  whyNow: "Escalations are slowing delivery",
  targetConditionIds: ["condition-authority", "condition-authority"],
});
assert.equal(validated.organizationId, organizationId);
assert.equal(validated.interactionId, "decision-1");

const record = createLeadershipDecisionRecord({
  organizationId: validated.organizationId,
  interactionId: validated.interactionId,
  consideration: validated.content,
  whyNow: validated.whyNow!,
  targetConditionIds: validated.targetConditionIds,
  createdAt: "2026-07-22T00:00:00.000Z",
});
assert.equal(record.organizationId, organizationId);
assert.equal(record.executiveDecisionId, "leadership-decision-decision-1");

const runtime = createEmptyOrganizationRuntime({ organizationId, name: "Boundary Validation" });
const savedOnce = saveExecutiveDecisionRecord({ runtime, record });
const savedTwice = saveExecutiveDecisionRecord({ runtime: savedOnce, record });
assert.equal(savedTwice.memory.executiveDecisionRecords.length, 1);
assert.deepEqual(savedTwice.memory.executiveDecisionRecords[0], record);

assert.equal(hasCompletedInvestigationInteraction(runtime, "context-1"), false);
runtime.memory.events.push({ question: `${interactionMarker("context-1")} What does this add?` } as never);
assert.equal(hasCompletedInvestigationInteraction(runtime, "context-1"), true);

assert.equal(buildProductHref("/your-organization", organizationId), `/your-organization?organizationId=${organizationId}`);
assert.equal(buildProductHref("/ask", organizationId), `/ask?organizationId=${organizationId}`);
assert.equal(buildProductHref("/decisions", organizationId), `/decisions?organizationId=${organizationId}`);

console.log("Product interaction boundary validation: 14 checks passed.");
