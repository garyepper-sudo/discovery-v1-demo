import { NextResponse } from "next/server";

import {
  loadOrganizationRuntimeState,
  persistOrganizationRuntimeState,
  resolveOrganizationId,
} from "../../../engine/v3/runtime";
import { runOrganizationInvestigation } from "../../../engine/v3/investigation/runOrganizationInvestigation";
import { saveExecutiveDecisionRecord } from "../../../engine/v3/decisions/saveExecutiveDecisionRecord";
import { createLeadershipDecisionRecord } from "../../../components/product-shell/data/createLeadershipDecisionRecord";
import { hasCompletedInvestigationInteraction, interactionMarker, isProductInteractionValidationError, validateProductInteractionRequest, type ProductInteractionRequest } from "../../../components/product-shell/data/productInteractionBoundary";

export async function POST(request: Request) {
  try {
    const body = await request.json() as ProductInteractionRequest;
    const validated = validateProductInteractionRequest(body);
    const { action, interactionId, content } = validated;
    const organizationId = resolveOrganizationId(validated.organizationId);
    const runtime = loadOrganizationRuntimeState(organizationId);

    if (action === "create-decision") {
      const existing = runtime.memory.executiveDecisionRecords.find((record) => record.submissionId === interactionId && record.executiveDecisionId === `leadership-decision-${interactionId}`);
      if (existing) return NextResponse.json({ persisted: true, idempotentReplay: true, record: existing }, { status: 200 });
      const now = new Date().toISOString();
      const record = createLeadershipDecisionRecord({ organizationId, interactionId, consideration: content, whyNow: validated.whyNow!, outcome: validated.outcome, targetConditionIds: validated.targetConditionIds, createdAt: now });
      const persisted = persistOrganizationRuntimeState(saveExecutiveDecisionRecord({ runtime, record }));
      const persistedRecord = persisted.memory.executiveDecisionRecords.find((item) => item.id === record.id);
      if (!persistedRecord) throw new Error("Decision persistence did not complete.");
      return NextResponse.json({ persisted: true, idempotentReplay: false, record: persistedRecord }, { status: 201 });
    }

    if (hasCompletedInvestigationInteraction(runtime, interactionId)) return NextResponse.json({ persisted: true, idempotentReplay: true, investigationCount: runtime.metadata.investigationCount }, { status: 200 });

    const question = `${interactionMarker(interactionId)} ${action === "challenge"
      ? "What changes in the Organization Model if this executive challenge is valid?"
      : "What does this executive input add to the Organization Model?"}`;
    const result = runOrganizationInvestigation({
      organizationId,
      company: runtime.metadata.name || organizationId,
      website: "",
      industry: "",
      question,
      context: `Executive ${action}: ${content}`,
    });
    if (result.runtime.metadata.investigationCount <= runtime.metadata.investigationCount) throw new Error("Investigation persistence did not complete.");
    return NextResponse.json({ persisted: true, idempotentReplay: false, investigationCount: result.runtime.metadata.investigationCount }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interaction failed." },
      { status: isProductInteractionValidationError(error) || error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
