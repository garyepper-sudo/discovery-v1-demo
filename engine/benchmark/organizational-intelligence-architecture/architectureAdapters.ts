import { createHash } from "node:crypto";
import type {
  AccessLevel,
  AdmissionDisposition,
  ArchitectureId,
  ArchitectureTrace,
  ArchitectureWorld,
  BenchmarkContribution,
  DurableObject,
  PermissionRule,
  PrincipalId,
  Projection,
  Purpose,
  ScopeId,
} from "./architectureBenchmarkTypes";

const stableId = (...parts: string[]) => createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
const unique = <T>(values: T[]) => [...new Set(values)];
const byId = <T extends { id: string }>(a: T, b: T) => a.id.localeCompare(b.id);

function accessLevel(rules: PermissionRule[], principalId: PrincipalId, purpose: Purpose, scopeId: ScopeId, at: string): AccessLevel {
  const levels: AccessLevel[] = rules
    .filter((rule) => rule.principalId === principalId && rule.purpose === purpose && rule.scopeId === scopeId)
    .filter((rule) => !rule.activeUntil || at < rule.activeUntil)
    .map((rule) => rule.level);
  if (levels.includes("raw")) return "raw";
  if (levels.includes("aggregate")) return "aggregate";
  return "none";
}

function disposition(contribution: BenchmarkContribution, seenRoots: Set<string>, validateIndependence: boolean): AdmissionDisposition {
  if (contribution.private) return "private";
  if (contribution.rootSourceIds.some((id) => !id.trim())) return "invalid-ancestry";
  if (contribution.sourceId && contribution.rootSourceIds.length === 0) return "invalid-ancestry";
  if (contribution.kind === "evidence" && contribution.rootSourceIds.length === 0) return "invalid-ancestry";
  if (contribution.aiGenerated && contribution.rootSourceIds.length === 0) return "deferred";
  if (contribution.provisional && contribution.rootSourceIds.length === 0) return "deferred";
  if (validateIndependence && contribution.rootSourceIds.length && contribution.rootSourceIds.every((id) => seenRoots.has(`${contribution.semanticId}|${id}`))) return "invalid-duplicate";
  if (contribution.restricted) return "restricted";
  if (contribution.localOnly) return "accepted-limited";
  if (contribution.kind === "assertion" || contribution.kind === "hypothesis") return "accepted-assertion";
  return "accepted";
}

function toDurable(contribution: BenchmarkContribution, status: DurableObject["status"]): DurableObject {
  return {
    id: `record:${stableId(contribution.id, status)}`,
    semanticId: contribution.semanticId,
    status,
    scopeId: contribution.scopeId,
    contributorIds: [contribution.contributorId],
    rootSourceIds: [...contribution.rootSourceIds].sort(),
    confidence: contribution.confidence,
    purpose: contribution.purpose,
    restricted: contribution.restricted,
    localOnly: contribution.localOnly,
    ancestryIds: [contribution.id],
    validFrom: contribution.validFrom,
  };
}

function mergeAuthoritative(objects: DurableObject[], useIndependence: boolean): DurableObject[] {
  const grouped = new Map<string, DurableObject[]>();
  for (const object of objects.filter((item) => item.status === "authoritative")) {
    const key = `${object.semanticId}|${object.scopeId}|${object.purpose}`;
    grouped.set(key, [...(grouped.get(key) ?? []), object]);
  }
  return [...grouped.values()].map((group) => {
    const first = [...group].sort(byId)[0];
    const rootSourceIds = unique(group.flatMap((item) => item.rootSourceIds)).sort();
    const supportCount = useIndependence ? Math.max(rootSourceIds.length, group.length && rootSourceIds.length === 0 ? 1 : 0) : group.length;
    return {
      ...first,
      id: `object:${stableId(first.semanticId, first.scopeId, first.purpose)}`,
      contributorIds: unique(group.flatMap((item) => item.contributorIds)).sort() as PrincipalId[],
      rootSourceIds,
      ancestryIds: unique(group.flatMap((item) => item.ancestryIds)).sort(),
      confidence: Math.min(1, Math.round((Math.min(...group.map((item) => item.confidence)) + Math.max(0, supportCount - 1) * 0.08) * 1_000_000) / 1_000_000),
    };
  }).sort(byId);
}

function addEmergentObjects(world: ArchitectureWorld, objects: DurableObject[]): DurableObject[] {
  const relationships = world.contributions
    .filter((item) => item.relationship && objects.some((object) => object.ancestryIds.includes(item.id)))
    .map((item) => ({ ...item.relationship!, contribution: item }));
  const additions: DurableObject[] = [];
  for (const left of relationships) {
    for (const right of relationships) {
      if (left.to !== right.from || left.contribution.scopeId === right.contribution.scopeId) continue;
      const semanticId = `emergent-${right.to}`;
      additions.push({
        id: `object:${stableId(semanticId, "organization", "delivery-learning")}`,
        semanticId,
        status: "authoritative",
        scopeId: "organization",
        contributorIds: unique([left.contribution.contributorId, right.contribution.contributorId]).sort() as PrincipalId[],
        rootSourceIds: unique([...left.contribution.rootSourceIds, ...right.contribution.rootSourceIds]).sort(),
        confidence: Math.min(left.contribution.confidence, right.contribution.confidence),
        purpose: "delivery-learning",
        restricted: left.contribution.restricted || right.contribution.restricted,
        localOnly: false,
        ancestryIds: [left.contribution.id, right.contribution.id].sort(),
        validFrom: world.fixedNow,
      });
    }
  }
  return mergeAuthoritative([...objects, ...additions], true);
}

function buildProjections(world: ArchitectureWorld, authoritativeObjects: DurableObject[]): { projections: Projection[]; evaluations: number } {
  const requests: Array<{ principalId: PrincipalId; purpose: Purpose }> = [
    { principalId: "specialist", purpose: "workforce-planning" },
    { principalId: "manager", purpose: "workforce-planning" },
    { principalId: "employee", purpose: "workforce-planning" },
    { principalId: "manager", purpose: "delivery-learning" },
    { principalId: "executive", purpose: "delivery-learning" },
  ];
  let evaluations = 0;
  const projections = requests.map(({ principalId, purpose }) => {
    const visibleObjectIds: string[] = [];
    const aggregateObjectIds: string[] = [];
    const confidenceBySemanticId: Record<string, number> = {};
    for (const object of authoritativeObjects) {
      evaluations += 1;
      if (object.purpose !== purpose) continue;
      const level = accessLevel(world.permissions, principalId, purpose, object.scopeId, world.fixedNow);
      if (level === "raw" && (!object.localOnly || object.scopeId !== "team-exception" || principalId === "manager")) {
        visibleObjectIds.push(object.id);
        confidenceBySemanticId[object.semanticId] = object.confidence;
      } else if (level === "aggregate" && !object.restricted && object.scopeId === "organization") {
        aggregateObjectIds.push(object.id);
        confidenceBySemanticId[object.semanticId] = object.confidence;
      }
    }
    return {
      principalId,
      purpose,
      visibleObjectIds: visibleObjectIds.sort(),
      aggregateObjectIds: aggregateObjectIds.sort(),
      confidenceBySemanticId,
      contradictionIds: world.expected.contradictionPairs
        .filter(([left, right]) => left in confidenceBySemanticId || right in confidenceBySemanticId)
        .map(([left, right]) => `${left}|${right}`)
        .sort(),
    };
  });
  return { projections, evaluations };
}

function findCyclicContributionIds(contributions: BenchmarkContribution[]): string[] {
  const relationships = contributions.filter((item) => item.relationship);
  const adjacency = new Map<string, Array<{ to: string; id: string }>>();
  for (const item of relationships) {
    adjacency.set(item.relationship!.from, [...(adjacency.get(item.relationship!.from) ?? []), { to: item.relationship!.to, id: item.id }]);
  }
  const cyclicIds = new Set<string>();
  const visit = (node: string, pathNodes: string[], pathIds: string[]) => {
    for (const edge of adjacency.get(node) ?? []) {
      const cycleAt = pathNodes.indexOf(edge.to);
      if (cycleAt >= 0) {
        for (const id of [...pathIds.slice(cycleAt), edge.id]) cyclicIds.add(id);
        continue;
      }
      visit(edge.to, [...pathNodes, edge.to], [...pathIds, edge.id]);
    }
  };
  for (const node of adjacency.keys()) visit(node, [node], []);
  return [...cyclicIds].sort();
}

function runTopology(world: ArchitectureWorld, architectureId: ArchitectureId): ArchitectureTrace {
  const bypass = architectureId === "hybrid-bypass";
  const useIndependence = architectureId !== "hybrid-no-independence" && !bypass;
  const central = architectureId === "central";
  const independent = architectureId === "independent";
  const seenRoots = new Set<string>();
  const admissions: ArchitectureTrace["admissions"] = [];
  const durableObjects: DurableObject[] = [];
  const rejectedCycles = findCyclicContributionIds(world.contributions);
  let steps = 0;

  for (const contribution of [...world.contributions].sort(byId)) {
    steps += 1;
    const contributorAuthorized = accessLevel(world.permissions, contribution.contributorId, contribution.purpose, contribution.scopeId, world.fixedNow) !== "none";
    const decision = rejectedCycles.includes(contribution.id)
      ? "rejected"
      : bypass ? "accepted" : !contributorAuthorized ? "invalid-purpose" : disposition(contribution, seenRoots, useIndependence);
    admissions.push({ contributionId: contribution.id, disposition: decision });

    if (central) {
      durableObjects.push(toDurable(contribution, "provisional"));
    }
    if (decision === "accepted" || decision === "accepted-limited" || decision === "accepted-assertion" || decision === "restricted") {
      durableObjects.push(toDurable(contribution, "authoritative"));
      for (const root of contribution.rootSourceIds) seenRoots.add(`${contribution.semanticId}|${root}`);
    } else if (architectureId === "hybrid" || architectureId === "hybrid-no-independence") {
      // Rejected and private workspace cognition remains outside durable shared state.
    } else if (!central) {
      durableObjects.push(toDurable(contribution, decision === "private" ? "private" : "rejected"));
    }
  }

  // Independent retains one durable copy per local model before deterministic
  // export reconciliation. The common reconciliation cognition is identical.
  if (independent) {
    for (const object of [...durableObjects]) {
      if (object.status === "authoritative") durableObjects.push({ ...object, id: `${object.id}:export:${object.scopeId}` });
    }
  }

  let authoritativeObjects = mergeAuthoritative(durableObjects, useIndependence);
  authoritativeObjects = addEmergentObjects(world, authoritativeObjects);
  const { projections, evaluations } = buildProjections(world, authoritativeObjects);
  return {
    architectureId,
    worldId: world.id,
    admissions: admissions.sort((a, b) => a.contributionId.localeCompare(b.contributionId)),
    durableObjects: durableObjects.sort(byId),
    authoritativeObjects,
    projections,
    rejectedCycles,
    processingSteps: steps + authoritativeObjects.length,
    policyEvaluations: evaluations,
    recomputationFanOut: authoritativeObjects.length,
  };
}

export interface ArchitectureAdapter {
  id: ArchitectureId;
  run(world: ArchitectureWorld): ArchitectureTrace;
}

export function createArchitectureAdapters(includeAblations = false): ArchitectureAdapter[] {
  const ids: ArchitectureId[] = includeAblations
    ? ["independent", "central", "hybrid", "hybrid-bypass", "hybrid-no-independence"]
    : ["independent", "central", "hybrid"];
  return ids.map((id) => ({ id, run: (world) => runTopology(world, id) }));
}
