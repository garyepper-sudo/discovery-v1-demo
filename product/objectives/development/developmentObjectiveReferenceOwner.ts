import type {
  ProductObjectiveReferenceValidation,
  ProductOptimizationContext,
  ProductOrganizationalObjective,
} from "../contracts";

export type DevelopmentObjectiveReferenceRegistry = {
  organizationId: string;
  principalId: string;
  teamRefs: string[];
  initiativeRefs: string[];
  evidenceRefs: string[];
  sourceRefs: string[];
  resourceConstraintRefs: string[];
  governanceConstraintRefs: string[];
  riskCapacityAssessmentRefs: string[];
  policyRefs: string[];
};

export class DevelopmentObjectiveReferenceOwner {
  constructor(readonly registry: DevelopmentObjectiveReferenceRegistry) {}

  validate(input: {
    userId: string;
    organizationId: string;
    objective?: ProductOrganizationalObjective;
    optimizationContext?: ProductOptimizationContext;
  }): ProductObjectiveReferenceValidation {
    const invalid = new Set<string>();
    if (input.userId !== this.registry.principalId || input.organizationId !== this.registry.organizationId) {
      invalid.add("development-reference-owner-scope");
    }
    const objective = input.objective;
    if (objective) {
      if (objective.scope.kind === "team" && !this.registry.teamRefs.includes(objective.scope.teamRef)) invalid.add(objective.scope.teamRef);
      if (objective.scope.kind === "initiative" && !this.registry.initiativeRefs.includes(objective.scope.initiativeRef)) invalid.add(objective.scope.initiativeRef);
      for (const ref of objective.ancestry.evidenceRefs) if (!this.registry.evidenceRefs.includes(ref)) invalid.add(ref);
      for (const ref of objective.ancestry.sourceRefs) if (!this.registry.sourceRefs.includes(ref)) invalid.add(ref);
      for (const ref of objective.constraintRefs) {
        if (!this.registry.resourceConstraintRefs.includes(ref) && !this.registry.governanceConstraintRefs.includes(ref)) invalid.add(ref);
      }
    }
    const context = input.optimizationContext;
    if (context) {
      for (const ref of context.resourceConstraintRefs) if (!this.registry.resourceConstraintRefs.includes(ref)) invalid.add(ref);
      for (const ref of context.governanceConstraintRefs) if (!this.registry.governanceConstraintRefs.includes(ref)) invalid.add(ref);
      if (context.riskPreference.riskCapacityAssessmentRef
        && !this.registry.riskCapacityAssessmentRefs.includes(context.riskPreference.riskCapacityAssessmentRef)) {
        invalid.add(context.riskPreference.riskCapacityAssessmentRef);
      }
      if (context.source === "authorized-policy" && (!context.sourceRef || !this.registry.policyRefs.includes(context.sourceRef))) {
        invalid.add(context.sourceRef ?? "missing-policy-reference");
      }
    }
    return { valid: invalid.size === 0, invalidRefs: [...invalid].sort() };
  }
}
