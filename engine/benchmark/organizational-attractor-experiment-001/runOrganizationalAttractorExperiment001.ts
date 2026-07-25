import assert from "node:assert/strict";

import {
  attractorOrganization,
  negativeControls,
  phase,
} from "./fixtures";
import { inferCandidateAttractor } from "./inferCandidateAttractor";
import {
  predictFromAttractor,
  predictFromMechanisms,
  predictFromState,
} from "./predictionModels";
import { scoreExperiment } from "./scoreExperiment";
import type {
  AttractorPhase,
  InferenceResult,
  ModelPrediction,
} from "./types";

const serialize = (value: unknown) => JSON.stringify(value);

function clonePhase(
  input: AttractorPhase,
  reverseEvidence = false,
): AttractorPhase {
  return {
    ...input,
    evidence: reverseEvidence ? [...input.evidence].reverse() : [...input.evidence],
  };
}

function infer(phases: AttractorPhase[]): InferenceResult {
  return inferCandidateAttractor(phases.map((item) => clonePhase(item)));
}

export function runOrganizationalAttractorExperiment001() {
  const historical = phase("historical-and-baseline");
  const perturbationPhase = phase("delegation-perturbation");
  const restorationAPhase = phase(
    "restoration-a-underlying-mechanisms-remain",
  );
  const restorationBPhase = phase(
    "restoration-b-underlying-mechanisms-change",
  );

  const baseline = infer([historical]);
  const perturbation = infer([historical, perturbationPhase]);
  const restorationA = infer([
    historical,
    perturbationPhase,
    restorationAPhase,
  ]);
  const restorationB = infer([
    historical,
    perturbationPhase,
    restorationBPhase,
  ]);

  const predictions: ModelPrediction[] = [
    predictFromState(
      "restoration-a",
      perturbationPhase.observedState,
      perturbationPhase.evidence,
    ),
    predictFromState(
      "restoration-b",
      perturbationPhase.observedState,
      perturbationPhase.evidence,
    ),
    predictFromMechanisms("restoration-a", [
      ...historical.evidence,
      ...perturbationPhase.evidence,
      ...restorationAPhase.evidence,
    ]),
    predictFromMechanisms("restoration-b", [
      ...historical.evidence,
      ...perturbationPhase.evidence,
      ...restorationBPhase.evidence,
    ]),
    predictFromAttractor(
      "restoration-a",
      baseline.candidate,
      restorationAPhase.evidence,
    ),
    predictFromAttractor(
      "restoration-b",
      baseline.candidate,
      restorationBPhase.evidence,
    ),
  ];

  const controlResults = negativeControls.map((organization) => ({
    organizationId: organization.id,
    inference: infer(organization.phases),
  }));

  const authoritative = {
    baseline,
    perturbation,
    restorationA,
    restorationB,
    predictions,
    controlResults,
  };
  const repeated = {
    baseline: infer([historical]),
    perturbation: infer([historical, perturbationPhase]),
    restorationA: infer([
      historical,
      perturbationPhase,
      restorationAPhase,
    ]),
    restorationB: infer([
      historical,
      perturbationPhase,
      restorationBPhase,
    ]),
    predictions,
    controlResults: negativeControls.map((organization) => ({
      organizationId: organization.id,
      inference: infer(organization.phases),
    })),
  };
  const reversed = {
    baseline: infer([clonePhase(historical, true)]),
    perturbation: infer(
      [historical, perturbationPhase]
        .reverse()
        .map((item) => clonePhase(item, true)),
    ),
    restorationA: infer(
      [historical, perturbationPhase, restorationAPhase]
        .reverse()
        .map((item) => clonePhase(item, true)),
    ),
    restorationB: infer(
      [historical, perturbationPhase, restorationBPhase]
        .reverse()
        .map((item) => clonePhase(item, true)),
    ),
    predictions,
    controlResults: [...negativeControls]
      .reverse()
      .map((organization) => ({
        organizationId: organization.id,
        inference: infer(
          [...organization.phases]
            .reverse()
            .map((item) => clonePhase(item, true)),
        ),
      }))
      .sort((a, b) => a.organizationId.localeCompare(b.organizationId)),
  };

  const normalizedAuthoritative = {
    ...authoritative,
    controlResults: [...authoritative.controlResults].sort((a, b) =>
      a.organizationId.localeCompare(b.organizationId),
    ),
  };
  const normalizedRepeated = {
    ...repeated,
    controlResults: [...repeated.controlResults].sort((a, b) =>
      a.organizationId.localeCompare(b.organizationId),
    ),
  };
  const deterministic =
    serialize(normalizedAuthoritative) === serialize(normalizedRepeated) &&
    serialize(normalizedAuthoritative) === serialize(reversed);

  const score = scoreExperiment({
    organization: attractorOrganization,
    baseline,
    perturbation,
    restorationA,
    restorationB,
    predictions,
    negativeControls: controlResults,
    deterministic,
  });

  const result = {
    experiment: "Organizational Attractor Experiment 001",
    posture: "benchmark-only",
    productionBehaviorChanged: false,
    observations: historical.evidence.map((item) => ({
      id: item.id,
      sourceId: item.sourceId,
      observation: item.observation,
    })),
    inferredAttractor: baseline.candidate,
    competingExplanations: [
      {
        id: "current-state-persistence",
        meaning: "The currently observed decentralized state will persist.",
        representedBy: "organizational-state",
      },
      {
        id: "active-mechanism-dominance",
        meaning: "The mechanisms active in the latest period determine every horizon.",
        representedBy: "mechanisms",
      },
      {
        id: "latent-restoring-tendency",
        meaning: "Persistent structural mechanisms restore a directional tendency over time.",
        representedBy: "candidate-attractor",
      },
    ],
    phaseResults: { baseline, perturbation, restorationA, restorationB },
    predictions,
    negativeControls: controlResults,
    score,
    architecturePromotionAuthorized: false,
    conclusion: score.passed
      ? "Candidate Attractor demonstrates incremental value inside the controlled experimental representation; production adoption is not authorized."
      : "Candidate Attractor does not earn a production architecture role.",
  };

  assert.equal(
    score.negativeControlFalsePositives.length,
    0,
    "Negative controls must not produce candidate attractors.",
  );
  assert.equal(
    score.hardGates.deterministic,
    true,
    "Repeated and reversed-order runs must be byte-equal.",
  );
  assert.equal(
    score.hardGates.incrementalPredictionValue,
    true,
    "Candidate Attractor must outperform both comparison models.",
  );
  assert.equal(
    score.passed,
    true,
    "Every experimental success gate must pass.",
  );

  return result;
}

if (require.main === module) {
  const result = runOrganizationalAttractorExperiment001();
  console.log(JSON.stringify(result, null, 2));
  console.log(
    `\nOrganizational Attractor Experiment 001 — ${result.score.overallScore}/100 PASS`,
  );
}
