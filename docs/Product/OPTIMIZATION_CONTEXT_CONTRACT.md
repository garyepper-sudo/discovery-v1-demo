# Discovery Optimization Context Contract

**Status:** Designed; benchmark-supported; not implemented
**Phase:** 2D
**Governed by:** [PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md)

## Purpose

Optimization Context records governed preferences and reusable decision
criteria that can materially change Objective Recommendation eligibility or
ranking without changing Organizational Understanding.

```ts
type ProductOptimizationContext = {
  contractVersion: "1";
  optimizationContextId: string;
  organizationId: string;
  objectiveVersionRef: string;
  priorityMode:
    | "maximize-progress" | "minimize-downside" | "maximize-learning"
    | "preserve-optionality" | "balance";
  timePreference: {
    horizon: "immediate" | "near-term" | "medium-term" | "long-term";
    urgency: "low" | "moderate" | "high" | "critical";
    delayTolerance: "low" | "moderate" | "high";
  };
  riskPreference: {
    downsideTolerance: "low" | "moderate" | "high";
    uncertaintyTolerance: "low" | "moderate" | "high";
    irreversibleActionTolerance: "low" | "moderate" | "high";
    riskCapacityAssessmentRef: string | null;
  };
  resourceConstraintRefs: string[];
  governanceConstraintRefs: string[];
  tradeoffPreferences: Array<{
    preferenceId: string;
    criterion: string;
    direction: "increase" | "decrease" | "preserve";
    precedence: "primary" | "secondary" | "tie-breaker";
  }>;
  minimumEvidenceStandard: "exploratory" | "directional" | "substantial" | "high-confidence";
  alternativesRequirement: {
    minimumMeaningfulAlternatives: number;
    includeStatusQuo: boolean;
  };
  source: "explicit" | "authorized-policy" | "derived-conditional";
  sourceRef: string | null;
  authorityScopeRef: string;
  assumptions: string[];
  version: number;
  supersedesOptimizationContextVersionRef: string | null;
};
```

## Minimum semantics

- Context is Objective-version-specific. Changing context changes eligibility or
  ranking, never Evidence, Organizational Understanding, or Objective meaning.
- A stable ID and version are required when the context becomes durable; the
  design benchmark may use a deterministic fingerprint before persistence.
- Explicit context is preferred. An authorized organizational policy may supply
  defaults when its source, scope, version, and assumptions are disclosed.
- Derived context is conditional only. It cannot authorize high-stakes or
  irreversible action and must be confirmed when material.
- Risk appetite is a governed preference. Risk capacity is an evidence-grounded
  organizational fact and remains in Organizational Understanding; the context
  references its assessment rather than copying it.
- Urgency is a preference only when an authorized actor chooses speed. Evidence
  that a crisis or deadline exists belongs to Organizational Understanding.
- Execution capacity, maturity, operating condition, volatility, and path
  dependence are facts in Organizational Understanding. Their implications may
  become action-specific Recommendation constraints.
- Governance rules remain independently authoritative. This contract references
  them and cannot weaken them.
- At least two meaningful alternatives are required, including status quo,
  delay, abstention, or further learning where relevant.

## Defaults and elicitation

There is no universal silent default. A missing material preference triggers
adaptive elicitation. A governed policy default is permitted only when exact
scope and authority resolve. Discovery asks only the next question whose answer
could change eligibility, ranking, disclosure, or governance.

## Ownership and persistence

The proposed owner is Product Workflow alongside the Objective version it
qualifies. No Runtime schema, repository, event version, migration, or write API
is implemented. Benchmark results support designing both contracts together,
but persistence must be implemented only after the versioned Objective owner is
approved.
