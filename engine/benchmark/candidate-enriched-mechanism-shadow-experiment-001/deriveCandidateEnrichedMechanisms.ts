import { field, safe } from "./classifyFieldDerivations";
import { recommendNextEvidence } from "./recommendNextEvidence";
import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type {
  CandidateEnrichedMechanism,
  DerivedField,
} from "./types";

const artifactText = (value: unknown) => {
  const item = value as Record<string, unknown>;
  return String(
    item.explanation ??
      item.description ??
      item.summary ??
      item.statement ??
      item.title ??
      "",
  );
};
const artifactId = (value: unknown) =>
  String((value as Record<string, unknown>).id ?? "");

export function deriveCandidateEnrichedMechanisms(
  cognition: GeneratedCognition,
): CandidateEnrichedMechanism[] {
  return cognition.mechanisms.flatMap((mechanism) =>
    (["current", "direct-lineage", "full-context", "conservative"] as const).map(
      (strategy): CandidateEnrichedMechanism => {
        const upstream = field({
          statement: mechanism.cause,
          artifactIds: [mechanism.id],
          evidenceIds: mechanism.evidenceIds,
          stage: "Mechanism",
          rule: "copy generated cause",
          status: "explicit",
          crossSilo: mechanism.silos.length >= 2,
        });
        const genericMediation = /^Discovery sees/i.test(mechanism.mechanism);
        const mediation = field({
          statement: genericMediation ? undefined : mechanism.mechanism,
          artifactIds: [mechanism.id],
          evidenceIds: mechanism.evidenceIds,
          stage: "Mechanism",
          rule: "retain non-generic generated mechanism relation",
          status: genericMediation ? "unavailable" : "explicit",
          crossSilo: mechanism.silos.length >= 2,
        });
        const outcome = field({
          statement: mechanism.effect,
          artifactIds: [mechanism.id],
          evidenceIds: mechanism.evidenceIds,
          stage: "Mechanism",
          rule: "copy generated effect",
          status: "explicit",
          crossSilo: mechanism.silos.length >= 2,
        });
        const conditional = /\b(if|when|while|unless|continues?)\b/i.test(
          `${mechanism.cause} ${mechanism.effect}`,
        );
        const activation = field({
          statement: conditional ? mechanism.cause : undefined,
          artifactIds: [mechanism.id],
          evidenceIds: mechanism.evidenceIds,
          stage: "Mechanism",
          rule: "retain explicit conditional language only",
          status: conditional ? "deterministically-derived" : "unavailable",
        });
        const contradictions =
          strategy === "full-context"
            ? cognition.contradictions
                .map((item) =>
                  field({
                    statement: artifactText(item),
                    artifactIds: [artifactId(item)],
                    evidenceIds: [
                      ...(((item as Record<string, unknown>).evidenceIds ??
                        []) as string[]),
                    ],
                    stage: "Contradiction",
                    rule: "retain generated contradiction as ambiguous alternative",
                    status: "supported-but-ambiguous",
                    competing: true,
                  }),
                )
                .filter((item): item is DerivedField => Boolean(item))
            : [];
        const matchingPrediction =
          strategy === "full-context"
            ? cognition.predictions.find((item) =>
                JSON.stringify(item)
                  .toLowerCase()
                  .includes(mechanism.effect.toLowerCase()),
              )
            : undefined;
        const implication = matchingPrediction
          ? field({
              statement: artifactText(matchingPrediction),
              artifactIds: [artifactId(matchingPrediction)],
              evidenceIds: mechanism.evidenceIds,
              stage: "Prediction",
              rule: "exact generated effect appears in generated prediction",
              status: "deterministically-derived",
            })
          : undefined;
        const allFields = {
          upstream,
          mediation,
          outcome,
          activation,
          contradictions,
          implication,
        };
        const retained =
          strategy === "conservative"
            ? {
                ...allFields,
                upstream: safe(upstream),
                mediation: safe(mediation),
                outcome: safe(outcome),
                activation: safe(activation),
                contradictions: contradictions.filter((item) => safe(item)),
                implication: safe(implication),
              }
            : allFields;
        const missing = [
          !retained.mediation ? "mediation" : null,
          !retained.activation ? "activation" : null,
          !retained.contradictions.length ? "alternatives" : null,
          !retained.implication ? "implication" : null,
          "falsification",
          !mechanism.evidenceIds.length ? "lineage" : null,
        ].filter((item): item is string => Boolean(item));
        const hypothesis =
          retained.upstream &&
          retained.outcome &&
          mechanism.silos.length >= 2 &&
          mechanism.evidenceIds.length > 0;
        const qualified =
          hypothesis &&
          retained.mediation &&
          retained.activation &&
          retained.implication &&
          retained.contradictions.length > 0 &&
          false;
        return {
          id: `candidate:${strategy}:${mechanism.id}`,
          strategy,
          sourceMechanismIds: [mechanism.id],
          upstreamDriver: retained.upstream,
          mediatingRelationships: retained.mediation ? [retained.mediation] : [],
          downstreamOutcomes: retained.outcome ? [retained.outcome] : [],
          activatingConditions: retained.activation ? [retained.activation] : [],
          persistenceConditions: [],
          competingExplanations: retained.contradictions,
          implications: retained.implication ? [retained.implication] : [],
          falsificationCriteria: [],
          supportingSiloIds: mechanism.silos,
          supportingArtifactIds: [mechanism.id],
          supportingEvidenceIds: mechanism.evidenceIds,
          opposingArtifactIds: contradictions.map((item) => item.artifactIds).flat(),
          opposingEvidenceIds: [],
          confidence: mechanism.confidence,
          completeness: qualified
            ? "qualified"
            : hypothesis
              ? "hypothesis"
              : "fragment",
          missingFields: missing,
          recommendedNextEvidence: recommendNextEvidence(missing),
        };
      },
    ),
  );
}
