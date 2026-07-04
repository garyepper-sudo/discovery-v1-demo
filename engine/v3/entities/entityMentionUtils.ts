import type { EntityMention } from "./entityLifecycle";
import type { OrganizationalEntityType } from "./organizationalEntity";
import { normalizeEntityName } from "./entityUtils";

export function createEntityMention(input: {
  organizationId: string;
  text: string;
  sourceId: string;
  sourceType: EntityMention["sourceType"];
  context: string;
  candidateType?: OrganizationalEntityType;
  confidence?: number;
}): EntityMention {
  const now = new Date().toISOString();
  const normalizedText = normalizeEntityName(input.text);

  return {
    id: `${input.organizationId}:mention:${normalizedText}:${input.sourceId}`,
    organizationId: input.organizationId,

    text: input.text.trim(),
    normalizedText,

    sourceId: input.sourceId,
    sourceType: input.sourceType,
    context: input.context,

    candidateType: input.candidateType ?? "unknown",
    confidence: input.confidence ?? 0.5,

    lifecycleStage: "candidate",

    createdAt: now,
  };
}