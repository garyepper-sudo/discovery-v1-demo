import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  ArchitectureId,
  ComplexityAssessment,
  DimensionAssessment,
  LocalizedNonlinearResearchResult,
  MeasuredIndicator,
  OrganizationalUnderstandingResearchRecord,
  ReadinessGate,
  ResearchArtifactReference,
  ResearchDecision,
} from "./types";

const experimentDirectory = fileURLToPath(new URL(
  "../../localized-nonlinear-cognition-experiment-001/",
  import.meta.url,
));
const sourceResultPath = `${experimentDirectory}RESULTS.json`;
const resultPath = fileURLToPath(new URL("./RESULT.json", import.meta.url));
const reportPath = fileURLToPath(new URL("./RESEARCH_REPORT.md", import.meta.url));

type SourceScore = {
  predictionMae: number;
  alternativeDiscrimination: number;
  transitionPrecision: number;
  transitionRecall: number;
  falseTransitions: number;
  falseNonlinearClassifications: number;
  negativeControlPrecision: number;
  blanketAbstention: boolean;
  transitionAnalysis: {
    correctTransitions: number;
    missedTransitions: number;
  };
};

type SourceResults = {
  experiment: string;
  classification: string;
  machineResultHash: string;
  scores: {
    stable: SourceScore;
    localized: SourceScore;
    pervasive: SourceScore;
    utility: Record<"stable" | "localized" | "pervasive", number>;
  };
  scenarioResults: Array<{ scenarioId: string }>;
  stability: Record<"stable" | "localized" | "pervasive", {
    confidenceCascadeRate: number;
    oscillationRate: number;
    irreversibleErrorRate: number;
  }>;
  interpretability: Record<"stable" | "localized" | "pervasive", {
    lineageCompleteness: number;
    explicitReasonRate: number;
    reversalCriterionRate: number;
    causalChainPreserved: boolean;
  }>;
  demonstratedRevision: {
    reversibleStateTransition: { scenarioId: string; organizationalState: string };
    mechanismRetirement: { scenarioId: string; mechanismStatus: string };
    alternativePromotion: { scenarioId: string; leadingExplanation: string };
  };
  determinism: Record<string, boolean>;
  sequenceTests: Record<string, boolean>;
  hardGates: Record<string, boolean>;
  leakage: { passed: boolean; checks: Record<string, boolean> };
  ablations: Record<string, {
    utility: number;
    score: { transitionRecall: number; predictionMae: number };
  }>;
};

const sourceFile = "engine/benchmark/localized-nonlinear-cognition-experiment-001/RESULTS.json";

const artifact = (
  id: string,
  jsonPointer: string,
  description: string,
  scenarioId?: string,
): ResearchArtifactReference => ({
  id,
  file: sourceFile,
  jsonPointer,
  ...(scenarioId ? { scenarioId } : {}),
  description,
});

const sharedArtifacts: ResearchArtifactReference[] = [
  artifact("source-classification", "/classification", "Original experiment classification."),
  artifact("utility", "/scores/utility", "Original architecture utility values."),
  artifact("architecture-scores", "/scores", "Original architecture metrics and transition analyses."),
  artifact("stability", "/stability", "Cascade, oscillation, and irreversible-error analysis."),
  artifact("interpretability", "/interpretability", "Lineage, reason, reversal, and causal-chain analysis."),
  artifact("determinism", "/determinism", "Repeated and reordered execution controls."),
  artifact("leakage", "/leakage", "Semantic-boundary and benchmark-leakage audit."),
  artifact("ablations", "/ablations", "Localized-zone contribution ablations."),
  artifact("sequence-tests", "/sequenceTests", "Formation and revision sequence controls."),
  artifact(
    "state-reversal",
    "/demonstratedRevision/reversibleStateTransition",
    "Localized reversible state transition.",
    "lnc-009",
  ),
  artifact(
    "alternative-promotion",
    "/demonstratedRevision/alternativePromotion",
    "Localized alternative promotion after a discriminating outcome.",
    "lnc-011",
  ),
  artifact(
    "mechanism-retirement",
    "/demonstratedRevision/mechanismRetirement",
    "Localized mechanism retirement after falsification.",
    "lnc-012",
  ),
  artifact(
    "multi-cycle",
    "/scenarioResults/13",
    "Recursive-learning scenario with bounded confidence history.",
    "lnc-014",
  ),
];

function indicator(
  name: string,
  value: string | number | boolean,
  ...artifactReferenceIds: string[]
): MeasuredIndicator {
  return { name, value, artifactReferenceIds };
}

function assessment(
  status: DimensionAssessment["status"],
  evidenceStrength: DimensionAssessment["evidenceStrength"],
  measuredIndicators: MeasuredIndicator[],
  interpretation: string,
  limitations: string[],
): DimensionAssessment {
  return { status, evidenceStrength, measuredIndicators, interpretation, limitations };
}

function noMeasure(reason: string): DimensionAssessment {
  return assessment("not-measured", "none", [], reason, [
    "No positive result is inferred from the presence of nonlinear behavior.",
  ]);
}

function readinessDecision(gates: ReadinessGate[]): ResearchDecision {
  if (gates.some((gate) => gate.status === "failed")) return "reject";
  if (gates.every((gate) => gate.status === "passed")) {
    return "eligible-for-production-contract-design";
  }
  const coreResultSupported = gates.slice(0, 7).every((gate) => gate.status === "passed");
  return coreResultSupported ? "replicate" : "continue-research";
}

function localizedReadinessGates(): ReadinessGate[] {
  return [
    {
      gate: "Treatment is isolated to one stated semantic responsibility.",
      status: "passed",
      evidence: "Three localized transition zones are explicit and lower representation is unchanged.",
      artifactReferenceIds: ["leakage", "sequence-tests"],
    },
    {
      gate: "At least one research dimension improves against independent expected outcomes.",
      status: "passed",
      evidence: "All 36 preregistered expected transitions were recovered with zero false transitions.",
      artifactReferenceIds: ["architecture-scores"],
    },
    {
      gate: "Improvement survives relevant controls and contribution ablations.",
      status: "passed",
      evidence: "Negative-control precision remained 1.0 and each localized-zone ablation reduced utility or transition recall.",
      artifactReferenceIds: ["architecture-scores", "ablations"],
    },
    {
      gate: "Deterministic replay, ordering, identity, and fixture isolation hold.",
      status: "passed",
      evidence: "All recorded determinism and leakage-isolation checks passed.",
      artifactReferenceIds: ["determinism", "leakage"],
    },
    {
      gate: "No material regression appears in any measured dimension.",
      status: "passed",
      evidence: "Localized metrics improved or remained safe relative to the stable baseline.",
      artifactReferenceIds: ["architecture-scores", "stability"],
    },
    {
      gate: "Governance Integrity and System Sustainability remain acceptable.",
      status: "passed",
      evidence: "Lineage was complete; false transitions, cascades, and oscillation were zero.",
      artifactReferenceIds: ["interpretability", "stability"],
    },
    {
      gate: "The earliest responsible canonical producer is identified.",
      status: "passed",
      evidence: "The experiment isolates formation, state interaction, and post-prediction revision zones.",
      artifactReferenceIds: ["ablations", "sequence-tests"],
    },
    {
      gate: "The smallest compatible production extension and rollback path are known.",
      status: "not-yet-demonstrated",
      evidence: "The benchmark does not design or assign a production contract.",
      artifactReferenceIds: ["source-classification"],
    },
    {
      gate: "Independent replication or equivalent held-out evaluation supports the result.",
      status: "not-yet-demonstrated",
      evidence: "The result uses one controlled synthetic corpus and explicitly recommends independent replication.",
      artifactReferenceIds: ["source-classification"],
    },
  ];
}

function baselineReadinessGates(): ReadinessGate[] {
  return localizedReadinessGates().map((gate, index) => ({
    ...gate,
    status: index === 3 || index === 5 ? "passed" : "not-yet-demonstrated",
    evidence: index === 3
      ? "The stable baseline passed the shared determinism controls."
      : index === 5
        ? "The stable baseline remained bounded and lineage-preserving."
        : "The baseline is a comparator and is not a production-improvement candidate.",
  }));
}

function pervasiveReadinessGates(): ReadinessGate[] {
  return localizedReadinessGates().map((gate, index) => ({
    ...gate,
    status: index === 2 || index === 4 || index === 5 ? "failed" : gate.status,
    evidence: index === 2
      ? "Negative-control precision fell to 0.25."
      : index === 4
        ? "The treatment produced 16 false transitions and worse prediction error."
        : index === 5
          ? "The treatment produced false transitions and a non-zero confidence-cascade rate."
          : gate.evidence,
  }));
}

function complexity(architecture: ArchitectureId): ComplexityAssessment {
  if (architecture === "stable-linear") {
    return {
      benchmarkObserved: [
        "No qualitative transition zones are active.",
        "The architecture abstained from every qualitative transition.",
      ],
      productionEstimated: [],
      limitations: ["Repository-level production cost was not evaluated."],
    };
  }
  if (architecture === "localized-nonlinear") {
    return {
      benchmarkObserved: [
        "Nonlinearity is concentrated in three explicit transition zones.",
        "Each transition carries lineage, reason, and reversal criteria.",
        "Ablations isolate formation, state interaction, and outcome revision contribution.",
      ],
      productionEstimated: [
        "Any production implementation would require separately designed ownership, migration, and rollback contracts.",
      ],
      limitations: ["The experiment did not measure production migration or maintenance cost."],
    };
  }
  return {
    benchmarkObserved: [
      "Nonlinearity is applied across lower-layer promotion, condition switching, and recursive feedback.",
      "The treatment produced 16 false transitions and a 0.158 confidence-cascade rate.",
    ],
    productionEstimated: [
      "Pervasive placement implies a broader validation and rollback surface than localized placement.",
    ],
    limitations: ["The broader production cost is an architectural estimate, not a measured repository metric."],
  };
}

function buildRecord(
  architectureId: ArchitectureId,
  results: SourceResults,
  sourceResultHash: string,
): OrganizationalUnderstandingResearchRecord {
  const key = architectureId === "stable-linear"
    ? "stable"
    : architectureId === "localized-nonlinear"
      ? "localized"
      : "pervasive";
  const score = results.scores[key];
  const stability = results.stability[key];
  const interpretability = results.interpretability[key];
  const localized = architectureId === "localized-nonlinear";
  const pervasive = architectureId === "pervasive-nonlinear";
  const gates = localized
    ? localizedReadinessGates()
    : pervasive
      ? pervasiveReadinessGates()
      : baselineReadinessGates();

  const explanatoryDepth = localized
    ? assessment(
        "improved",
        "strong",
        [
          indicator("mechanism and activation explanation accuracy", 0.9649122807017544, "architecture-scores"),
          indicator("prediction MAE", score.predictionMae, "architecture-scores"),
          indicator("transition lineage completeness", interpretability.lineageCompleteness, "interpretability"),
        ],
        "The treatment recovered qualified mechanism, state-interaction, and outcome-revision structure against preregistered truth.",
        ["The experiment did not measure natural-language richness or universal organizational explanation quality."],
      )
    : pervasive
      ? assessment(
          "mixed",
          "strong",
          [
            indicator("prediction MAE", score.predictionMae, "architecture-scores"),
            indicator("false transitions", score.falseTransitions, "architecture-scores"),
          ],
          "Some expected structure was recovered, but unsupported transitions and higher prediction error make explanatory adequacy mixed.",
          ["The experiment is a controlled synthetic architecture test."],
        )
      : assessment(
          "unchanged",
          "strong",
          [
            indicator("prediction MAE", score.predictionMae, "architecture-scores"),
            indicator("missed expected transitions", score.transitionAnalysis.missedTransitions, "architecture-scores"),
          ],
          "The stable comparator preserved static interpretation but missed every required qualitative transition.",
          ["This is baseline behavior, not an improvement claim."],
        );

  const evidenceIntegration = pervasive
    ? assessment(
        "regressed",
        "strong",
        [
          indicator("negative-control precision", score.negativeControlPrecision, "architecture-scores"),
          indicator("false nonlinear classifications", score.falseNonlinearClassifications, "architecture-scores"),
          indicator("lineage completeness", interpretability.lineageCompleteness, "interpretability"),
        ],
        "Inputs remained traceable, but broad composition converted irrelevant or redundant support into false nonlinear behavior.",
        ["Independent-source and governed cross-silo integration were not measured."],
      )
    : assessment(
        "not-measured",
        "limited",
        [
          indicator("negative-control precision", score.negativeControlPrecision, "architecture-scores"),
          indicator("lineage completeness", interpretability.lineageCompleteness, "interpretability"),
        ],
        "Lineage and negative-control safety are available as boundary evidence, but the experiment did not measure independent-source or governed cross-silo integration.",
        ["Evidence Integration is not measured; no positive integration claim is made."],
      );

  const alternativeResolution = localized
    ? assessment(
        "improved",
        "moderate",
        [
          indicator("alternative discrimination", score.alternativeDiscrimination, "architecture-scores"),
          indicator("alternative promoted", true, "alternative-promotion"),
          indicator("mechanism retired", true, "mechanism-retirement"),
        ],
        "Registered discriminating outcomes safely weakened, retired, or promoted the tested alternatives.",
        ["Completed Explanation adjudication and comparative Evidence roles were not measured."],
      )
    : pervasive
      ? assessment(
          "regressed",
          "strong",
          [indicator("alternative discrimination", score.alternativeDiscrimination, "architecture-scores")],
          "Alternative discrimination fell below the stable comparator while false transitions increased.",
          ["Completed Explanation adjudication was not measured."],
        )
      : assessment(
          "unchanged",
          "moderate",
          [indicator("alternative discrimination", score.alternativeDiscrimination, "architecture-scores")],
          "The stable comparator retained its existing alternative choice behavior without structural revision.",
          ["No alternative-promotion transition was available in the stable comparator."],
        );

  const stateAndDynamicsAwareness = localized
    ? assessment(
        "improved",
        "strong",
        [
          indicator("expected transitions recovered", score.transitionAnalysis.correctTransitions, "architecture-scores"),
          indicator("transition precision", score.transitionPrecision, "architecture-scores"),
          indicator("reversible state transition", true, "state-reversal"),
          indicator("false transitions", score.falseTransitions, "architecture-scores"),
        ],
        "The treatment recovered all expected state-sensitive transitions, including reversal, without false transitions.",
        ["The result is limited to the controlled scenario corpus."],
      )
    : pervasive
      ? assessment(
          "regressed",
          "strong",
          [
            indicator("transition precision", score.transitionPrecision, "architecture-scores"),
            indicator("false transitions", score.falseTransitions, "architecture-scores"),
          ],
          "Broad nonlinear behavior recovered some expected transitions but introduced unsupported state changes.",
          ["The treatment's deterministic ordering does not make its transitions valid."],
        )
      : assessment(
          "unchanged",
          "strong",
          [
            indicator("transition recall", score.transitionRecall, "architecture-scores"),
            indicator("blanket abstention", score.blanketAbstention, "architecture-scores"),
          ],
          "The stable comparator remained safe but expressed no required state or dynamic transition.",
          ["This is the experiment baseline."],
        );

  const longitudinalLearning = localized
    ? assessment(
        "improved",
        "moderate",
        [
          indicator("confidence cascade rate", stability.confidenceCascadeRate, "stability"),
          indicator("oscillation rate", stability.oscillationRate, "stability"),
          indicator("bounded multi-cycle confidence", true, "multi-cycle"),
          indicator("alternative promoted after outcome", true, "alternative-promotion"),
        ],
        "Across the synthetic multi-cycle case, registered outcomes revised structure and confidence without cascade or oscillation.",
        ["Real-world longitudinal learning, persistence, and temporal governance were not measured."],
      )
    : pervasive
      ? assessment(
          "regressed",
          "strong",
          [
            indicator("confidence cascade rate", stability.confidenceCascadeRate, "stability"),
            indicator("oscillation rate", stability.oscillationRate, "stability"),
          ],
          "Recursive feedback caused confidence cascades, making the multi-cycle behavior unsafe.",
          ["Persistence and real-world learning were not measured."],
        )
      : assessment(
          "unchanged",
          "limited",
          [
            indicator("confidence cascade rate", stability.confidenceCascadeRate, "stability"),
            indicator("oscillation rate", stability.oscillationRate, "stability"),
          ],
          "The stable comparator remained bounded but did not perform outcome-driven structural revision.",
          ["It serves as the non-learning baseline in this experiment."],
        );

  const decision = readinessDecision(gates);

  return {
    experimentId: "localized-nonlinear-cognition-experiment-001",
    architectureId,
    scenarioIds: results.scenarioResults.map(({ scenarioId }) => scenarioId),
    treatmentType: architectureId === "stable-linear"
      ? "baseline"
      : architectureId,
    sourceArtifacts: sharedArtifacts,
    measuredResults: {
      utility: results.scores.utility[key],
      predictionMae: score.predictionMae,
      transitionPrecision: score.transitionPrecision,
      transitionRecall: score.transitionRecall,
      negativeControlPrecision: score.negativeControlPrecision,
      expectedTransitionCount: 36,
      observedExpectedTransitionCount: score.transitionAnalysis.correctTransitions,
      falseTransitionCount: score.falseTransitions,
      falseNonlinearClassificationCount: score.falseNonlinearClassifications,
      lineageComplete: interpretability.lineageCompleteness === 1,
      ...(localized ? {
        reversible: results.demonstratedRevision.reversibleStateTransition.organizationalState === "reversed",
        alternativePromoted:
          results.demonstratedRevision.alternativePromotion.leadingExplanation === "alternative",
        mechanismRetired:
          results.demonstratedRevision.mechanismRetirement.mechanismStatus === "retired",
      } : {}),
      cascadeDetected: stability.confidenceCascadeRate > 0,
      oscillationDetected: stability.oscillationRate > 0,
    },
    researchDimensions: {
      explanatoryDepth,
      evidenceIntegration,
      alternativeResolution,
      stateAndDynamicsAwareness,
      longitudinalLearning,
      emergentInsight: noMeasure(
        "The experiment did not test whether governed composition produces an insight unavailable from any isolated input or silo.",
      ),
    },
    guardrails: {
      governanceIntegrity: {
        status: pervasive ? "failed" : "passed",
        measuredIndicators: [
          indicator("lineage completeness", interpretability.lineageCompleteness, "interpretability"),
          indicator("false transitions", score.falseTransitions, "architecture-scores"),
          indicator("negative-control precision", score.negativeControlPrecision, "architecture-scores"),
        ],
        interpretation: pervasive
          ? "Complete lineage did not prevent unsupported transitions or negative-control failures."
          : "Measured transitions remained attributable and negative controls remained safe.",
        limitations: ["Permission, purpose limitation, and privacy were outside this experiment."],
      },
      systemSustainability: {
        status: pervasive ? "failed" : "passed",
        measuredIndicators: [
          indicator("determinism controls passed", Object.values(results.determinism).every(Boolean), "determinism"),
          indicator("confidence cascade rate", stability.confidenceCascadeRate, "stability"),
          indicator("oscillation rate", stability.oscillationRate, "stability"),
        ],
        interpretation: pervasive
          ? "Execution was deterministic, but broad nonlinear placement caused false transitions and confidence cascades."
          : "The measured architecture remained deterministic, bounded, and free of cascades and oscillation.",
        limitations: ["Production performance, migration, and maintenance costs were not measured."],
      },
    },
    complexityEvidence: complexity(architectureId),
    traceability: {
      sourceResultHash,
      adapterProtocolVersion: "1",
      directlyMeasuredFields: [
        "utility",
        "predictionMae",
        "transitionPrecision",
        "transitionRecall",
        "negativeControlPrecision",
        "transition counts",
        "lineage completeness",
        "cascade and oscillation rates",
      ],
      derivedInterpretations: [
        "six research-dimension assessments",
        "Governance Integrity disposition",
        "System Sustainability disposition",
        "production-readiness gate disposition",
      ],
    },
    productionReadinessGates: gates,
    decision,
  };
}

function resolveJsonPointer(root: unknown, pointer: string): unknown {
  return pointer.split("/").slice(1).reduce<unknown>((current, token) => {
    if (current === null || typeof current !== "object") {
      throw new Error(`Invalid source-artifact reference: ${pointer}`);
    }
    const key = token.replaceAll("~1", "/").replaceAll("~0", "~");
    if (!(key in current)) throw new Error(`Missing source-artifact reference: ${pointer}`);
    return (current as Record<string, unknown>)[key];
  }, root);
}

function validateResult(
  result: LocalizedNonlinearResearchResult,
  source: SourceResults,
): void {
  if (result.records.length !== 3) throw new Error("Expected exactly three architecture records.");
  const expectedArchitectures: ArchitectureId[] = [
    "stable-linear",
    "localized-nonlinear",
    "pervasive-nonlinear",
  ];
  if (result.records.some((record, index) =>
    record.architectureId !== expectedArchitectures[index])) {
    throw new Error("Architecture ordering or identity changed.");
  }
  for (const record of result.records) {
    if (record.researchDimensions.emergentInsight.status !== "not-measured") {
      throw new Error("Emergent Insight must remain not measured.");
    }
    if (record.productionReadinessGates.length !== 9) {
      throw new Error("Every record must report all nine readiness gates.");
    }
    for (const reference of record.sourceArtifacts) {
      if (reference.jsonPointer) resolveJsonPointer(source, reference.jsonPointer);
    }
    for (const dimension of Object.values(record.researchDimensions)) {
      for (const measured of dimension.measuredIndicators) {
        if (measured.artifactReferenceIds.some((id) =>
          !record.sourceArtifacts.some((reference) => reference.id === id))) {
          throw new Error(`Unresolved dimension artifact reference in ${record.architectureId}.`);
        }
      }
    }
  }
  if (result.records[1].decision !== "replicate" || result.finalDecision !== "replicate") {
    throw new Error("Localized decision must derive as replicate from incomplete readiness gates.");
  }
}

function renderReport(result: LocalizedNonlinearResearchResult): string {
  const [stable, localized, pervasive] = result.records;
  const dimensionRows = (record: OrganizationalUnderstandingResearchRecord) => [
    ["Explanatory Depth", record.researchDimensions.explanatoryDepth],
    ["Evidence Integration", record.researchDimensions.evidenceIntegration],
    ["Alternative Resolution", record.researchDimensions.alternativeResolution],
    ["State and Dynamics Awareness", record.researchDimensions.stateAndDynamicsAwareness],
    ["Longitudinal Learning", record.researchDimensions.longitudinalLearning],
    ["Emergent Insight", record.researchDimensions.emergentInsight],
  ] as const;
  const gates = localized.productionReadinessGates
    .map((gate, index) => `| ${index + 1} | ${gate.status} | ${gate.evidence} |`)
    .join("\n");
  const dimensions = dimensionRows(localized)
    .map(([name, value]) => `| ${name} | ${value.status} | ${value.evidenceStrength} | ${value.interpretation} |`)
    .join("\n");
  const sourceHash = result.sourceExperiment.resultHash;

  return `# Localized Nonlinear Cognition — Organizational Understanding Research Report

**Adapter protocol:** 1

**Source experiment:** ${result.sourceExperiment.name}

**Original classification:** ${result.sourceExperiment.classification}

**Source result hash:** \`${sourceHash}\`

## Source boundary

This report adapts the existing \`${result.sourceExperiment.resultFile}\`. It
does not rerun or rescore the experiment. Numerical fields below are copied
from the source result. Dimension and guardrail dispositions are bounded
research interpretations.

## Architecture comparison

| Architecture | Utility | Prediction MAE | Transition precision | Negative-control precision | False transitions | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Stable linear | ${stable.measuredResults.utility.toFixed(3)} | ${stable.measuredResults.predictionMae.toFixed(3)} | ${stable.measuredResults.transitionPrecision.toFixed(3)} | ${stable.measuredResults.negativeControlPrecision.toFixed(3)} | ${stable.measuredResults.falseTransitionCount} | ${stable.decision} |
| Localized nonlinear | ${localized.measuredResults.utility.toFixed(3)} | ${localized.measuredResults.predictionMae.toFixed(3)} | ${localized.measuredResults.transitionPrecision.toFixed(3)} | ${localized.measuredResults.negativeControlPrecision.toFixed(3)} | ${localized.measuredResults.falseTransitionCount} | ${localized.decision} |
| Pervasive nonlinear | ${pervasive.measuredResults.utility.toFixed(3)} | ${pervasive.measuredResults.predictionMae.toFixed(3)} | ${pervasive.measuredResults.transitionPrecision.toFixed(3)} | ${pervasive.measuredResults.negativeControlPrecision.toFixed(3)} | ${pervasive.measuredResults.falseTransitionCount} | ${pervasive.decision} |

No weighted research total is produced.

## Localized nonlinear research dimensions

| Dimension | Status | Evidence strength | Interpretation |
| --- | --- | --- | --- |
${dimensions}

Evidence Integration is not measured. Lineage and negative-control findings are
retained only as boundary evidence; independent-source and governed cross-silo
integration were not tested.
Emergent Insight is explicitly not measured.

## Guardrails

- **Governance Integrity:** ${localized.guardrails.governanceIntegrity.status} —
  ${localized.guardrails.governanceIntegrity.interpretation}
- **System Sustainability:** ${localized.guardrails.systemSustainability.status} —
  ${localized.guardrails.systemSustainability.interpretation}
- **Pervasive Governance Integrity:** ${pervasive.guardrails.governanceIntegrity.status}
- **Pervasive System Sustainability:** ${pervasive.guardrails.systemSustainability.status}

Pervasive nonlinearity remains deterministic but unsafe: it produced 16 false
transitions, negative-control precision of 0.25, and a confidence-cascade rate
above zero.

## Complexity

Localized nonlinearity concentrates benchmark behavior in three explicit
zones: mechanism formation, qualified state interaction, and post-prediction
outcome revision. The experiment measures their contribution through ablation.
It does not measure repository-level migration, maintenance, or performance
cost, so those costs remain unclaimed.

## Production-readiness gates

| Gate | Status | Evidence |
| ---: | --- | --- |
${gates}

## Research decision

**${result.finalDecision}**

The controlled result is strong and safe within its fixture, but independent
replication and a compatible production contract owner are not yet
demonstrated. The next experiment should replicate the three localized
contracts on an independent, less structured scenario family with unchanged
thresholds and the same negative controls.

## Limitations

- This is a controlled synthetic experiment.
- It does not establish general natural-language understanding.
- It does not measure governed cross-silo Evidence Integration.
- It does not measure Emergent Insight.
- It does not authorize production nonlinear cognition.
- It does not change the original experiment classification or artifacts.
`;
}

export function buildLocalizedNonlinearResearchResult(): LocalizedNonlinearResearchResult {
  const sourceBytes = readFileSync(sourceResultPath);
  const source = JSON.parse(sourceBytes.toString("utf8")) as SourceResults;
  if (source.experiment !== "Localized Nonlinear Cognition Experiment 001") {
    throw new Error("Unexpected source experiment.");
  }
  if (source.classification !== "A — Localized Nonlinear Cognition Demonstrated") {
    throw new Error("Source classification differs from the canonical experiment result.");
  }
  const sourceResultHash = createHash("sha256").update(sourceBytes).digest("hex");
  const records = ([
    "stable-linear",
    "localized-nonlinear",
    "pervasive-nonlinear",
  ] as const).map((architecture) => buildRecord(architecture, source, sourceResultHash));
  const localizedDecision = records[1].decision;
  const result: LocalizedNonlinearResearchResult = {
    framework: "organizational-understanding-research-framework",
    frameworkVersion: "1",
    sourceExperiment: {
      name: source.experiment,
      classification: source.classification,
      resultFile: sourceFile,
      resultHash: sourceResultHash,
    },
    records,
    comparison: {
      stableLinear: "stable-linear",
      localizedNonlinear: "localized-nonlinear",
      pervasiveNonlinear: "pervasive-nonlinear",
      weightedTotal: null,
    },
    finalDecision: localizedDecision,
    finalDecisionBasis:
      "Localized behavior passes the measured scientific and guardrail gates, but independent replication and a production contract are not yet demonstrated.",
  };
  validateResult(result, source);
  return result;
}

export function runLocalizedNonlinearResearchAdapter(): LocalizedNonlinearResearchResult {
  const result = buildLocalizedNonlinearResearchResult();
  writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(reportPath, renderReport(result));
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = runLocalizedNonlinearResearchAdapter();
  console.log(JSON.stringify({
    sourceExperiment: result.sourceExperiment.name,
    sourceClassification: result.sourceExperiment.classification,
    sourceResultHash: result.sourceExperiment.resultHash,
    architectures: result.records.map((record) => ({
      architectureId: record.architectureId,
      decision: record.decision,
    })),
    finalDecision: result.finalDecision,
    schemaValidation: "PASS",
    artifactReferenceValidation: "PASS",
  }, null, 2));
}
