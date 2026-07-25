import { composePairwiseRelationships } from "./composePairwiseRelationships";
import { deriveFalsificationCriteria } from "./deriveFalsificationCriteria";
import { identifyCompetingExplanations } from "./identifyCompetingExplanations";
import { recommendNextEvidence } from "./recommendNextEvidence";
import { registerCausalImplications } from "./registerCausalImplications";
import type {
  CandidateCausalMechanism,
  FormationInput,
  MediatingRelationship,
} from "./types";

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

function productionCandidates(input: FormationInput): CandidateCausalMechanism[] {
  return input.productionMechanisms.map((mechanism): CandidateCausalMechanism => ({
    id: `production:${mechanism.id}`,
    strategy: "production",
    upstreamDrivers: [{
      statement: mechanism.cause,
      artifactIds: [mechanism.id],
      evidenceIds: mechanism.evidenceIds,
      supportStatus: "explicit",
    }],
    mediatingRelationships: [],
    downstreamOutcomes: [{
      statement: mechanism.effect,
      artifactIds: [mechanism.id],
      evidenceIds: mechanism.evidenceIds,
      supportStatus: "explicit",
    }],
    activatingConditions: [],
    persistenceConditions: [],
    competingExplanations: [],
    implications: [],
    falsificationCriteria: [],
    supportingSiloIds: mechanism.silos,
    supportingArtifactIds: [mechanism.id],
    supportingEvidenceIds: mechanism.evidenceIds,
    opposingArtifactIds: [],
    opposingEvidenceIds: [],
    confidence: mechanism.confidence,
    classification: "fragment",
    missingStructure: ["mediation", "activation-or-persistence", "alternative", "implication", "falsification"],
    recommendedNextEvidence: [],
  })).map((candidate): CandidateCausalMechanism => ({
    ...candidate,
    recommendedNextEvidence: recommendNextEvidence(candidate),
  }));
}

function maximalChains(relationships: ReturnType<typeof composePairwiseRelationships>) {
  const incoming = new Set(relationships.map((edge) => edge.to));
  const roots = relationships.filter((edge) => !incoming.has(edge.from));
  const walk = (path: typeof relationships): Array<typeof relationships> => {
    const next = relationships.filter((edge) =>
      edge.from === path[path.length - 1].to &&
      !path.some((prior) => prior.from === edge.to));
    return next.length ? next.flatMap((edge) => walk([...path, edge])) : [path];
  };
  return (roots.length ? roots : relationships).flatMap((edge) => walk([edge]))
    .filter((chain) => chain.length > 0);
}

function build(
  input: FormationInput,
  strategy: "pairwise" | "alternative-aware" | "conservative",
): CandidateCausalMechanism[] {
  const edges = composePairwiseRelationships(input);
  const alternatives = identifyCompetingExplanations(input);
  const temporalInvalid = input.rawEvidence.some((item) =>
    /observed before|formerly|now broadly available/i.test(item.text));
  const chains = maximalChains(edges);
  return chains.map((chain, index) => {
    const evidenceIds = unique(chain.flatMap((edge) => edge.evidenceIds));
    const artifactIds = unique(chain.flatMap((edge) => edge.artifactIds));
    const silos = unique(chain.map((edge) => edge.silo));
    const conditions = unique(chain.map((edge) => edge.condition));
    const mediated = chain.length >= 2;
    const hasAlternative = alternatives.length > 0;
    const multiSilo = silos.length >= 2;
    const candidate: CandidateCausalMechanism = {
      id: `${strategy}:${input.scenarioId}:${index}`,
      strategy,
      upstreamDrivers: [{
        statement: chain[0].from,
        artifactIds: chain[0].artifactIds,
        evidenceIds: chain[0].evidenceIds,
        supportStatus: "explicit",
      }],
      mediatingRelationships: chain.slice(0, -1) as MediatingRelationship[],
      downstreamOutcomes: [{
        statement: chain[chain.length - 1].to,
        artifactIds: chain[chain.length - 1].artifactIds,
        evidenceIds: chain[chain.length - 1].evidenceIds,
        supportStatus: "explicit",
      }],
      activatingConditions: conditions.map((condition) => ({
        statement: condition,
        artifactIds,
        evidenceIds,
        supportStatus: "explicit" as const,
      })),
      persistenceConditions: [],
      competingExplanations: strategy === "pairwise" ? [] : alternatives,
      implications: [],
      falsificationCriteria: [],
      supportingSiloIds: silos,
      supportingArtifactIds: artifactIds,
      supportingEvidenceIds: evidenceIds,
      opposingArtifactIds: [],
      opposingEvidenceIds: [],
      confidence: Math.min(0.9, 0.35 + chain.length * 0.12 + (multiSilo ? 0.08 : 0)),
      classification: temporalInvalid ? "rejected" : mediated ? "causal-hypothesis" : "fragment",
      missingStructure: [],
      recommendedNextEvidence: [],
    };
    candidate.implications = registerCausalImplications(candidate);
    candidate.falsificationCriteria = deriveFalsificationCriteria(candidate);
    const complete =
      mediated && multiSilo && candidate.activatingConditions.length > 0 &&
      hasAlternative && candidate.implications.length > 0 &&
      candidate.falsificationCriteria.length > 0 && artifactIds.length > 0;
    if (strategy === "conservative" && complete && !temporalInvalid) {
      candidate.classification = "qualified-causal-mechanism";
    }
    candidate.missingStructure = [
      !mediated && "mediation",
      candidate.activatingConditions.length === 0 && "activation-or-persistence",
      !hasAlternative && "alternative",
      candidate.implications.length === 0 && "implication",
      candidate.falsificationCriteria.length === 0 && "falsification",
      !multiSilo && "multi-silo-nonredundant-support",
      artifactIds.length === 0 && "artifact-lineage",
    ].filter(Boolean) as string[];
    candidate.recommendedNextEvidence = recommendNextEvidence(candidate);
    return candidate;
  });
}

export function formCandidateCausalMechanisms(input: FormationInput) {
  return [
    ...productionCandidates(input),
    ...build(input, "pairwise"),
    ...build(input, "alternative-aware"),
    ...build(input, "conservative"),
  ].sort((a, b) => a.id.localeCompare(b.id));
}
