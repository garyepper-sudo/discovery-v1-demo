import type { OrganizationalCausalModel } from "./organizationalCausalModel";
import { propagateOrganizationalInfluence } from "./propagateOrganizationalInfluence";

const causalModel: OrganizationalCausalModel = {
  id: "causal-model-test",
  organizationId: "test-organization",

  organizationalEntities: [
    {
      id: "condition-decision-flow",
      type: "condition",
      label: "Decision Flow",
      status: "constrained",
      confidence: 0.9,
    },
    {
      id: "condition-coordination",
      type: "condition",
      label: "Coordination",
      status: "constrained",
      confidence: 0.85,
    },
    {
      id: "condition-execution-capacity",
      type: "condition",
      label: "Execution Capacity",
      status: "constrained",
      confidence: 0.8,
    },
  ],

  causalRelationships: [
    {
      id: "causal-decision-flow-coordination",
      sourceEntityId: "condition-decision-flow",
      targetEntityId: "condition-coordination",
      direction: "enables",
      strength: 0.8,
      confidence: 0.9,
      explanation:
        "Faster and clearer decisions improve cross-functional coordination.",
      supportingMechanismIds: [],
      supportingTheoryIds: [],
      supportingBeliefIds: [],
      supportingEvidenceIds: [],
    },
    {
      id: "causal-coordination-execution",
      sourceEntityId: "condition-coordination",
      targetEntityId: "condition-execution-capacity",
      direction: "enables",
      strength: 0.75,
      confidence: 0.8,
      explanation:
        "Improved coordination reduces rework and increases execution throughput.",
      supportingMechanismIds: [],
      supportingTheoryIds: [],
      supportingBeliefIds: [],
      supportingEvidenceIds: [],
    },
  ],

  confidence: 0.85,

  summary:
    "Test causal model for organizational influence propagation.",

  generatedAt:
    new Date().toISOString(),
};

const result =
  propagateOrganizationalInfluence({
    causalModel,

    changedEntityId:
      "condition-decision-flow",

    delta:
      0.2,

    maxDepth:
      4,

    minimumEffect:
      0.01,
  });

console.dir(result, {
  depth: null,
});