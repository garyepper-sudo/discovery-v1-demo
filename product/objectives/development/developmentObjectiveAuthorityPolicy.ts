import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import type { ProductObjectiveAuthorityGrant, ProductObjectiveScope } from "../contracts";

export type DevelopmentObjectiveOperation =
  | "objective:create" | "objective:revise"
  | "context:create" | "context:revise" | "read";

export type DevelopmentObjectiveAuthorityPolicy = {
  policyId: string;
  policyVersion: string;
  principalId: string;
  organizationId: string;
  grants: Array<{
    authorityScopeRef: string;
    scope: ProductObjectiveScope;
    operations: DevelopmentObjectiveOperation[];
  }>;
};

const scopeKey = (scope: ProductObjectiveScope): string => JSON.stringify(scope);

export class DevelopmentObjectiveAuthorityPolicyMapper {
  private revokedOperations = new Set<DevelopmentObjectiveOperation>();

  constructor(
    private readonly environment: Readonly<Record<string, string | undefined>>,
    readonly policy: DevelopmentObjectiveAuthorityPolicy,
    private readonly now: () => string,
  ) {
    validateOnboardingTestEnvironment(environment);
    if (!policy.policyId.trim() || !policy.policyVersion.trim()) throw new Error("Development Objective policy identity and version are required.");
  }

  revoke(operation: Exclude<DevelopmentObjectiveOperation, "read">): void {
    this.revokedOperations.add(operation);
  }

  authorize(input: {
    userId: string;
    organizationId: string;
    scope: ProductObjectiveScope;
    requestedAuthorityScopeRef: string;
    operation: DevelopmentObjectiveOperation;
  }): ProductObjectiveAuthorityGrant {
    const matching = this.policy.grants.find((grant) =>
      grant.authorityScopeRef === input.requestedAuthorityScopeRef
      && scopeKey(grant.scope) === scopeKey(input.scope)
      && grant.operations.includes(input.operation)
    );
    const authorized = input.userId === this.policy.principalId
      && input.organizationId === this.policy.organizationId
      && Boolean(matching)
      && !this.revokedOperations.has(input.operation);
    return {
      actorRef: input.userId,
      authorityScopeRef: input.requestedAuthorityScopeRef,
      authorized,
      authorizedAt: this.now(),
    };
  }
}
