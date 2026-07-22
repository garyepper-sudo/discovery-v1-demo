import type { OrganizationRuntime } from "../../../engine/v3/runtime";

export const PRODUCT_INTERACTION_ACTIONS = ["add-context", "challenge", "save-insight", "create-decision"] as const;
export type ProductInteractionAction = typeof PRODUCT_INTERACTION_ACTIONS[number];

export type ProductInteractionRequest = {
  organizationId?: string;
  interactionId?: string;
  action?: string;
  content?: string;
  whyNow?: string;
  outcome?: string;
  targetConditionIds?: string[];
};

function required(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required.`);
  return value.trim();
}

export function validateProductInteractionRequest(input: ProductInteractionRequest | null | undefined) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("request body is invalid.");
  const body = input;
  const organizationId = required(body.organizationId, "organizationId");
  if (!/^[a-zA-Z0-9_-]+$/.test(organizationId)) throw new Error("organizationId is invalid.");
  const actionText = required(body.action, "action");
  if (!PRODUCT_INTERACTION_ACTIONS.includes(actionText as ProductInteractionAction)) throw new Error("action is unsupported.");
  const action = actionText as ProductInteractionAction;
  const interactionId = required(body.interactionId, "interactionId").replace(/[^a-zA-Z0-9_-]/g, "-");
  const content = required(body.content, "content");
  const whyNow = action === "create-decision" ? required(body.whyNow, "whyNow") : body.whyNow?.trim();
  return { organizationId, action, interactionId, content, whyNow, outcome: body.outcome?.trim(), targetConditionIds: Array.isArray(body.targetConditionIds) ? body.targetConditionIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())).map((id) => id.trim()) : [] };
}

export function isProductInteractionValidationError(error: unknown): boolean {
  return error instanceof Error && /(?: is required\.| is invalid\.| is unsupported\.)$/.test(error.message);
}

export function interactionMarker(interactionId: string): string {
  return `[product-interaction:${interactionId}]`;
}

export function hasCompletedInvestigationInteraction(runtime: OrganizationRuntime, interactionId: string): boolean {
  const marker = interactionMarker(interactionId);
  return runtime.memory.events.some((event) => typeof event === "object" && event !== null && "question" in event && typeof event.question === "string" && event.question.includes(marker));
}
