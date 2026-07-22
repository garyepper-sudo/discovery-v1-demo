import type {
  DecisionCandidateInput,
  ExecutiveDecisionGroundTruth,
  InterventionCorrespondence,
  InterventionCorrespondenceResult,
  InterventionSemanticSignature,
} from "./contracts";

const rules = {
  actionDirections: {
    add: ["add", "create", "expand", "increase", "establish", "hire"],
    remove: ["remove", "eliminate", "reduce", "decrease", "retire", "stop"],
    centralize: ["centralize", "committee", "executive approval"],
    delegate: ["delegate", "decentralize", "decision ownership", "decision rights"],
    replace: ["replace", "migrate", "substitute"],
    narrow: ["narrow", "limit", "localized", "one business unit"],
    reorganize: ["reorganize", "restructure", "realign teams"],
  },
  structuralActions: {
    "remove-layer": ["remove one approval layer", "remove approval layer", "eliminate approval layer"],
    "clarify-rights": ["clarify decision", "decision ownership", "decision rights", "escalation boundaries"],
    "delegate-authority": ["delegate authority", "delegate routine decision", "decentralize authority"],
    "add-role": ["add program", "add manager", "hire manager", "management capacity"],
    "add-committee": ["add committee", "create committee", "approval committee", "executive forum"],
    "replace-platform": ["replace platform", "replace planning", "new planning system"],
    "reduce-work": ["reduce concurrent work", "reduce work in progress", "limit active work"],
    "reorganize-teams": ["reorganize", "customer segment", "restructure teams"],
  },
  targetedMechanisms: {
    "approval-dependency": ["approval dependency", "approval layer", "approval queue", "executive approval", "escalation"],
    "decision-rights": ["decision rights", "decision ownership", "decision authority", "escalation boundaries"],
    "governance-friction": ["governance friction", "approval layer", "approval queue", "decision delay"],
    "execution-capacity": ["management capacity", "execution capacity", "program management", "concurrent work", "work in progress"],
    "systems-fragmentation": ["planning platform", "planning system", "systems fragmentation"],
    "coordination-overhead": ["coordination overhead", "program management", "approval committee", "executive forum"],
    "structural-coordination": ["customer segment", "functional ownership", "reorganize"],
  },
  intendedEffects: {
    "reduce-escalation": ["reduce escalation", "remove approval", "delegate", "escalation boundaries"],
    "improve-throughput": ["decision throughput", "accelerate decisions", "decision delay", "delivery reliability"],
    "add-capacity": ["add capacity", "management capacity", "program managers"],
    "increase-governance": ["approval committee", "executive review", "centralize"],
    "replace-technology": ["replace platform", "replace planning", "new planning system"],
    "reduce-load": ["reduce concurrent work", "reduce work in progress", "execution focus"],
    "change-structure": ["reorganize", "customer segment", "structural boundaries"],
  },
} as const;

const opposites = new Set(["add:remove", "remove:add", "centralize:delegate", "delegate:centralize", "increase:remove", "replace:add"]);
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
const stable = (values: string[]) => [...new Set(values)].sort();
const detect = (text: string, group: Record<string, readonly string[]>) => stable(Object.entries(group).filter(([, aliases]) => aliases.some((alias) => text.includes(alias))).map(([key]) => key));
const overlap = (left: string[], right: string[]) => left.filter((value) => right.includes(value)).length;

export function buildInterventionSemanticSignature(input: { label: string; description?: string; intendedObjective?: string; interventionType?: string }): InterventionSemanticSignature {
  const text = normalize([input.label, input.description, input.intendedObjective].filter(Boolean).join(" "));
  return {
    actionDirections: detect(text, rules.actionDirections),
    structuralActions: detect(text, rules.structuralActions),
    targetedMechanisms: detect(text, rules.targetedMechanisms),
    intendedEffects: detect(text, rules.intendedEffects),
    interventionType: input.interventionType,
  };
}

function candidateSignature(candidate: DecisionCandidateInput): InterventionSemanticSignature {
  const inferred = buildInterventionSemanticSignature({
    ...candidate,
    label: [candidate.label, ...candidate.evaluationMetadata.semanticAliases].join(" "),
  });
  return {
    actionDirections: stable([...inferred.actionDirections, ...candidate.evaluationMetadata.actionDirections]),
    structuralActions: stable([...inferred.structuralActions, ...candidate.evaluationMetadata.structuralActions]),
    targetedMechanisms: stable([...inferred.targetedMechanisms, ...candidate.evaluationMetadata.targetedMechanisms]),
    intendedEffects: stable([...inferred.intendedEffects, ...candidate.evaluationMetadata.intendedEffects]),
    interventionType: candidate.interventionType,
  };
}

function isDirectionalInverse(left: InterventionSemanticSignature, right: InterventionSemanticSignature): boolean {
  return left.actionDirections.some((a) => right.actionDirections.some((b) => opposites.has(`${a}:${b}`)));
}

function semanticScore(generated: InterventionSemanticSignature, candidate: InterventionSemanticSignature): number {
  const direction = overlap(generated.actionDirections, candidate.actionDirections);
  const action = overlap(generated.structuralActions, candidate.structuralActions);
  const mechanism = overlap(generated.targetedMechanisms, candidate.targetedMechanisms);
  const effect = overlap(generated.intendedEffects, candidate.intendedEffects);
  const type = generated.interventionType && generated.interventionType === candidate.interventionType ? 1 : 0;
  return direction * 4 + action * 5 + mechanism * 3 + effect * 3 + type;
}

function classifyCandidate(candidateId: string, semanticRelation: "equivalent" | "closely-aligned", groundTruth: ExecutiveDecisionGroundTruth): InterventionCorrespondence {
  if (candidateId === groundTruth.preferredInterventionId) return semanticRelation;
  if (groundTruth.acceptableAlternativeIds.includes(candidateId)) return "acceptable-alternative";
  if (groundTruth.harmfulInterventionIds.includes(candidateId)) return "harmful-inverse";
  if (groundTruth.dominatedInterventionIds.includes(candidateId)) {
    return groundTruth.interventionAssessments.find((item) => item.interventionId === candidateId)?.expectedImpact === "low" ? "dominated" : "symptom-oriented";
  }
  return semanticRelation;
}

export function resolveInterventionCorrespondence(params: {
  generated: { label: string; description?: string; interventionType?: string };
  candidates: DecisionCandidateInput[];
  groundTruth: ExecutiveDecisionGroundTruth;
}): InterventionCorrespondenceResult {
  const generatedSignature = buildInterventionSemanticSignature(params.generated);
  const ranked = params.candidates.map((candidate) => {
    const signature = candidateSignature(candidate);
    const inverse = isDirectionalInverse(generatedSignature, signature);
    return { candidate, signature, inverse, score: semanticScore(generatedSignature, signature) - (inverse ? 12 : 0) };
  }).sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
  const best = ranked[0];
  if (!best || best.score <= 0) return { classification: "unrelated", confidence: "low", rationale: "No candidate shares a supported action, mechanism, or intended effect.", generatedSignature };
  const tied = ranked.filter((item) => item.score === best.score && item.inverse === best.inverse);
  if (tied.length > 1) return { classification: "ambiguous", confidence: "low", rationale: `Candidates ${tied.map((item) => item.candidate.id).sort().join(", ")} are semantically inseparable.`, generatedSignature };
  if (best.inverse) return { candidateId: best.candidate.id, classification: "harmful-inverse", confidence: "high", rationale: "The candidate targets related language in the opposite intervention direction.", generatedSignature };
  const sharedAction = overlap(generatedSignature.structuralActions, best.signature.structuralActions) > 0;
  const sharedMechanism = overlap(generatedSignature.targetedMechanisms, best.signature.targetedMechanisms) > 0;
  const sharedEffect = overlap(generatedSignature.intendedEffects, best.signature.intendedEffects) > 0;
  const relation = sharedAction && sharedMechanism ? "equivalent" : sharedMechanism && sharedEffect ? "closely-aligned" : "closely-aligned";
  return {
    candidateId: best.candidate.id,
    classification: classifyCandidate(best.candidate.id, relation, params.groundTruth),
    confidence: sharedAction && sharedMechanism ? "high" : "moderate",
    rationale: `Matched by ${[sharedAction && "structural action", sharedMechanism && "organizational mechanism", sharedEffect && "intended effect"].filter(Boolean).join(", ")}.`,
    generatedSignature,
  };
}
