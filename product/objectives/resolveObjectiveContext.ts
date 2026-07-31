import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  type ProductObjectiveContextResolution,
  type ProductObjectiveScope,
  type ProductOrganizationalObjective,
} from "./contracts";
import {
  listOptimizationContextVersions,
  objectiveVersionRef,
  listOrganizationalObjectiveVersions,
  optimizationContextVersionRef,
  scopeKey,
} from "./objectiveLifecycle";

const question: Record<Exclude<ProductObjectiveContextResolution["status"], "resolved">, string> = {
  "missing-objective": "What authorized organizational change should this work advance?",
  "ambiguous-objectives": "Which of the applicable Objectives should govern this work?",
  "missing-authority": "Who is authorized to establish this Objective for the requested scope?",
  "objective-inactive": "Should this confirmed Objective become active for current action selection?",
  "insufficient-success-criteria": "What bounded, reviewable result would show that this Objective was achieved?",
  "missing-context": "Which material tradeoff or risk preference should govern action for this Objective?",
  "stale-context": "Should the prior preferences be explicitly reaffirmed for this revised Objective?",
  "ambiguous-contexts": "Which Optimization Context should govern this Objective version?",
  "missing-material-preference": "What material preference would change eligibility, ranking, disclosure, or governance?",
  "governance-prohibited": "What authorized alternative remains permissible under the governing constraint?",
  "unsupported-scope": "Which supported organization, team, initiative, or Question scope applies?",
};

function applies(objective: ProductOrganizationalObjective, scope: ProductObjectiveScope): boolean {
  return scopeKey(objective.scope) === scopeKey(scope)
    || (objective.scope.kind === "organization" && scope.kind !== "organization");
}

export function resolveProductObjectiveContext(input: {
  runtime: OrganizationRuntime;
  scope: ProductObjectiveScope;
  evaluationAt: string;
  governanceProhibition?: string | null;
}): ProductObjectiveContextResolution {
  const fail = (
    status: Exclude<ProductObjectiveContextResolution["status"], "resolved">,
    objective: ProductOrganizationalObjective | null = null,
    limitations: string[] = [],
  ): ProductObjectiveContextResolution => ({
    status, objective,
    objectiveVersionRef: objective ? objectiveVersionRef(objective.organizationId, objective.objectiveId, objective.version) : null,
    optimizationContext: null, optimizationContextVersionRef: null,
    eligibleForObjectiveRecommendation: false, clarificationQuestion: question[status], limitations,
  });
  try { scopeKey(input.scope); } catch { return fail("unsupported-scope"); }
  if (!Number.isFinite(Date.parse(input.evaluationAt))) return fail("unsupported-scope");
  const all = listOrganizationalObjectiveVersions(input.runtime);
  const latestByRoot = new Map<string, ProductOrganizationalObjective>();
  for (const item of all) latestByRoot.set(item.objectiveId, item);
  const applicable = [...latestByRoot.values()].filter((item) => applies(item, input.scope));
  if (applicable.length === 0) return fail("missing-objective");
  const exact = applicable.filter((item) => scopeKey(item.scope) === scopeKey(input.scope));
  const candidates = exact.length > 0 ? exact : applicable;
  const authoritative = candidates.filter((item) => item.authority.authorizedToEstablish);
  if (authoritative.length === 0) return fail("missing-authority", candidates[0] ?? null);
  const active = authoritative.filter((item) => item.status === "active");
  if (active.length > 1) return fail("ambiguous-objectives", null, active.map((item) => item.objectiveId).sort());
  const objective = active[0] ?? authoritative[0]!;
  if (objective.successCriteria.length === 0) return fail("insufficient-success-criteria", objective);
  if (objective.status !== "active") return fail("objective-inactive", objective);
  if (input.governanceProhibition) return fail("governance-prohibited", objective, [input.governanceProhibition]);
  const versionRef = objectiveVersionRef(objective.organizationId, objective.objectiveId, objective.version);
  const allContexts = listOptimizationContextVersions(input.runtime);
  const latestContexts = new Map<string, (typeof allContexts)[number]>();
  for (const context of allContexts) latestContexts.set(context.optimizationContextId, context);
  const contexts = [...latestContexts.values()].filter((context) => context.objectiveVersionRef === versionRef);
  if (contexts.length === 0) {
    const stale = [...latestContexts.values()].some((context) => all.some((item) =>
      item.objectiveId === objective.objectiveId
      && context.objectiveVersionRef === objectiveVersionRef(item.organizationId, item.objectiveId, item.version)
    ));
    return fail(stale ? "stale-context" : "missing-context", objective);
  }
  if (contexts.length > 1) return fail("ambiguous-contexts", objective, contexts.map((item) => item.optimizationContextId).sort());
  const context = contexts[0]!;
  if (context.source === "derived-conditional" && context.assumptions.length === 0) return fail("missing-material-preference", objective);
  return {
    status: "resolved", objective, objectiveVersionRef: versionRef,
    optimizationContext: context,
    optimizationContextVersionRef: optimizationContextVersionRef(context.organizationId, context.optimizationContextId, context.version),
    eligibleForObjectiveRecommendation: true, clarificationQuestion: null, limitations: [],
  };
}
