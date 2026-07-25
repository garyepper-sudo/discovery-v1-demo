import { createHash } from "node:crypto";
import type {
  CandidateDefinition,
  CandidateEvent,
  CandidatePolicyId,
  CandidatePolicyTrace,
  CandidateProjection,
  CandidateSnapshot,
  CandidateState,
  CandidateWorld,
  TimeStep,
} from "./candidateEcologyTypes";

const steps: TimeStep[] = ["T1", "T2", "T3", "T4", "T5", "T6"];
const stableId = (...parts: string[]) => createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
const unique = <T>(values: T[]) => [...new Set(values)];

type MutableCandidate = {
  definition: CandidateDefinition;
  state: CandidateState;
  authoritative: boolean;
  supportRootIds: string[];
  supportEvents: string[];
  contradictionRootIds: string[];
  ancestryEventIds: string[];
  contributorIds: string[];
  derivedFromCandidateIds: string[];
  confidence: number;
};

function snapshot(candidate: MutableCandidate, at: TimeStep): CandidateSnapshot {
  return {
    candidateId: candidate.definition.id,
    semanticId: candidate.definition.semanticId,
    at,
    state: candidate.state,
    authoritative: candidate.authoritative,
    supportRootIds: [...candidate.supportRootIds].sort(),
    contradictionRootIds: [...candidate.contradictionRootIds].sort(),
    ancestryEventIds: [...candidate.ancestryEventIds].sort(),
    contributorIds: [...candidate.contributorIds].sort(),
    derivedFromCandidateIds: [...candidate.derivedFromCandidateIds].sort(),
    confidence: candidate.confidence,
    restricted: candidate.definition.restricted,
    localOnly: candidate.definition.localOnly,
  };
}

function changeState(
  candidate: MutableCandidate,
  to: CandidateState,
  event: CandidateEvent,
  transitions: CandidatePolicyTrace["transitions"],
) {
  if (candidate.state === to) return;
  transitions.push({ candidateId: candidate.definition.id, at: event.at, from: candidate.state, to, eventId: event.id });
  candidate.state = to;
}

function updateConfidence(candidate: MutableCandidate, disciplined: boolean) {
  const support = disciplined ? candidate.supportRootIds.length : candidate.supportEvents.length;
  candidate.confidence = Math.max(0, Math.min(1, Math.round((0.35 + support * 0.25 - candidate.contradictionRootIds.length * 0.2) * 1_000_000) / 1_000_000));
}

function projectionLevel(world: CandidateWorld, principalId: string, candidate: CandidateDefinition, at: TimeStep) {
  const rules = world.permissions.filter((rule) =>
    rule.principalId === principalId
    && rule.scopeId === candidate.scopeId
    && rule.purpose === candidate.purpose
    && (!rule.activeUntil || steps.indexOf(at) < steps.indexOf(rule.activeUntil)),
  );
  if (rules.some((rule) => rule.level === "raw")) return "raw";
  if (rules.some((rule) => rule.level === "aggregate")) return "aggregate";
  return "none";
}

function buildProjections(world: CandidateWorld, snapshots: CandidateSnapshot[]): CandidateProjection[] {
  const principals = unique(world.permissions.map((rule) => rule.principalId)).sort();
  return steps.flatMap((at) => principals.map((principalId) => {
    const current = snapshots.filter((item) => item.at === at && item.authoritative);
    const visibleCandidateIds: string[] = [];
    const aggregateCandidateIds: string[] = [];
    const confidenceByCandidateId: Record<string, number> = {};
    for (const candidate of current) {
      const definition = world.candidates.find((item) => item.id === candidate.candidateId)!;
      const level = projectionLevel(world, principalId, definition, at);
      if (level === "raw") {
        visibleCandidateIds.push(candidate.candidateId);
        confidenceByCandidateId[candidate.candidateId] = candidate.confidence;
      } else if (level === "aggregate") {
        aggregateCandidateIds.push(candidate.candidateId);
        confidenceByCandidateId[candidate.candidateId] = Math.min(candidate.confidence, 0.6);
      }
    }
    return { principalId, at, visibleCandidateIds: visibleCandidateIds.sort(), aggregateCandidateIds: aggregateCandidateIds.sort(), confidenceByCandidateId };
  }));
}

export interface CandidatePolicyAdapter {
  id: CandidatePolicyId;
  run(world: CandidateWorld): CandidatePolicyTrace;
}

function runPolicy(world: CandidateWorld, policyId: CandidatePolicyId): CandidatePolicyTrace {
  const ecology = policyId === "ecology" || policyId === "ecology-undisciplined";
  const disciplined = policyId !== "ecology-undisciplined" && policyId !== "direct";
  const direct = policyId === "direct";
  const strict = policyId === "strict";
  const candidates = new Map<string, MutableCandidate>();
  const transitions: CandidatePolicyTrace["transitions"] = [];
  const snapshots: CandidateSnapshot[] = [];
  const rejectedCycles = new Set<string>();
  let policyEvaluations = 0;

  const ensure = (id: string) => {
    const existing = candidates.get(id);
    if (existing) return existing;
    const definition = world.candidates.find((item) => item.id === id);
    if (!definition) return undefined;
    const created: MutableCandidate = {
      definition,
      state: definition.localOnly ? "scope-limited" : "provisional",
      authoritative: false,
      supportRootIds: [],
      supportEvents: [],
      contradictionRootIds: [],
      ancestryEventIds: [],
      contributorIds: [definition.contributorId],
      derivedFromCandidateIds: [],
      confidence: 0.35,
    };
    candidates.set(id, created);
    return created;
  };

  for (const at of steps) {
    const currentEvents = world.events.filter((item) => item.at === at).sort((a, b) => a.id.localeCompare(b.id));
    for (const event of currentEvents) {
      policyEvaluations += 1;
      const candidate = ensure(event.candidateId);
      if (!candidate) continue;
      candidate.ancestryEventIds = unique([...candidate.ancestryEventIds, event.id]);

      if (candidate.state === "rejected" && event.kind !== "propose") continue;
      if (event.malformed || event.rootSourceIds.some((id) => !id.trim())) {
        changeState(candidate, "rejected", event, transitions);
        candidate.authoritative = false;
        continue;
      }
      if (event.kind === "propose") {
        if (direct) {
          changeState(candidate, "promoted", event, transitions);
          candidate.authoritative = true;
        } else if (strict) {
          changeState(candidate, "rejected", event, transitions);
        } else {
          changeState(candidate, candidate.definition.localOnly ? "scope-limited" : "requires-corroboration", event, transitions);
        }
        continue;
      }
      if (strict && candidate.state === "rejected") continue;

      if (event.kind === "support") {
        candidate.supportEvents = unique([...candidate.supportEvents, event.id]);
        candidate.supportRootIds = unique([...candidate.supportRootIds, ...event.rootSourceIds]);
      } else if (event.kind === "contradict") {
        candidate.contradictionRootIds = unique([...candidate.contradictionRootIds, ...event.rootSourceIds]);
      } else if (event.kind === "combine") {
        const related = (event.relatedCandidateIds ?? []).map((id) => candidates.get(id)).filter(Boolean) as MutableCandidate[];
        const cycle = related.some((item) => item.definition.id === candidate.definition.id || item.derivedFromCandidateIds.includes(candidate.definition.id));
        if (cycle) {
          rejectedCycles.add(event.id);
          changeState(candidate, "rejected", event, transitions);
          continue;
        }
        if (related.length !== (event.relatedCandidateIds ?? []).length || related.some((item) => item.state === "rejected")) {
          if (strict) changeState(candidate, "rejected", event, transitions);
          else changeState(candidate, "requires-corroboration", event, transitions);
          continue;
        }
        candidate.supportRootIds = unique(related.flatMap((item) => item.supportRootIds));
        candidate.supportEvents = unique(related.flatMap((item) => item.supportEvents));
        candidate.ancestryEventIds = unique([...candidate.ancestryEventIds, ...related.flatMap((item) => item.ancestryEventIds)]);
        candidate.contributorIds = unique([...candidate.contributorIds, ...related.flatMap((item) => item.contributorIds)]);
        candidate.derivedFromCandidateIds = unique(related.map((item) => item.definition.id));
        if (direct) {
          changeState(candidate, "promoted", event, transitions);
          candidate.authoritative = true;
        }
      } else if (event.kind === "expire") {
        if (policyId === "ecology-undisciplined") continue;
        changeState(candidate, candidate.authoritative ? "historically-retained" : "expired", event, transitions);
        candidate.authoritative = false;
        continue;
      } else if (event.kind === "revoke") {
        changeState(candidate, candidate.authoritative ? "historically-retained" : "rejected", event, transitions);
        candidate.authoritative = false;
        continue;
      }

      updateConfidence(candidate, disciplined);
      const support = disciplined ? candidate.supportRootIds.length : candidate.supportEvents.length;
      const opposition = policyId === "ecology-undisciplined" ? 0 : candidate.contradictionRootIds.length;

      if (direct) {
        if (opposition >= support && opposition > 0) {
          changeState(candidate, "displaced", event, transitions);
          candidate.authoritative = false;
        }
      } else if (ecology) {
        if (opposition >= support && opposition > 0) {
          changeState(candidate, candidate.authoritative ? "displaced" : "contested", event, transitions);
          candidate.authoritative = false;
        } else if (opposition > 0 && support >= 2) {
          changeState(candidate, "weakened", event, transitions);
          candidate.authoritative = true;
        } else if (support >= 2) {
          changeState(candidate, candidate.definition.localOnly ? "scope-limited" : "promoted", event, transitions);
          candidate.authoritative = true;
        } else if (opposition > 0) {
          changeState(candidate, "contested", event, transitions);
        } else {
          changeState(candidate, candidate.definition.localOnly ? "scope-limited" : "requires-corroboration", event, transitions);
        }
      }
    }
    for (const candidate of [...candidates.values()].sort((a, b) => a.definition.id.localeCompare(b.definition.id))) {
      snapshots.push(snapshot(candidate, at));
    }
  }

  const finalCandidates = [...candidates.values()].sort((a, b) => a.definition.id.localeCompare(b.definition.id)).map((item) => snapshot(item, "T6"));
  return {
    policyId,
    worldId: world.id,
    transitions,
    snapshots,
    finalCandidates,
    projections: buildProjections(world, snapshots),
    rejectedCycles: [...rejectedCycles].sort(),
    policyEvaluations,
    recomputationFanOut: transitions.length,
  };
}

export function createCandidatePolicies(): CandidatePolicyAdapter[] {
  return (["direct", "strict", "ecology", "ecology-undisciplined"] as CandidatePolicyId[])
    .map((id) => ({ id, run: (world) => runPolicy(world, id) }));
}

export function candidateIdentity(candidateId: string, semanticId: string) {
  return `candidate:${stableId(candidateId, semanticId)}`;
}
