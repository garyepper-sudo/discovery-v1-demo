import { createOrganizationModel } from "../model/createOrganizationModel";
import { extractEntityMentions } from "./extractEntities";
import { syncOrganizationEntities } from "./syncOrganizationEntities";

const organizationId = "meridian-test";
const eventId = "test-event-001";

const observations = [
  "Meridian Home Health relies on a centralized scheduling dashboard to coordinate nurse visits.",
  "The operations dashboard is also called the scheduling dashboard by the operations team.",
  "Leadership is concerned that dashboard failures are increasing employee burnout and fatigue.",
  "The CEO and executive team want better visibility into scheduling bottlenecks.",
  "Nurses report emotional exhaustion when the scheduling process changes without notice.",
];

const model = createOrganizationModel(organizationId);

const mentions = observations.flatMap((text, index) =>
  extractEntityMentions({
    organizationId,
    sourceId: `${eventId}:observation:${index}`,
    sourceType: "observation",
    text,
  })
);

const updatedModel = syncOrganizationEntities({
  organizationModel: model,
  entityMentions: mentions,
});

console.log("\n=== ENTITY LAYER TEST ===\n");
console.log("Mentions:", mentions.length);
console.log("Persistent Entities:", updatedModel.entities.length);

for (const entity of updatedModel.entities) {
  console.log({
    type: entity.type,
    name: entity.canonicalName,
    aliases: entity.aliases,
    mentions: entity.mentionCount,
    confidence: entity.confidence,
    stability: entity.stability,
  });
}