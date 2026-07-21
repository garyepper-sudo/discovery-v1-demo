import type {
ExecutiveDecisionCycle,
} from "../../../engine/v3/decisions/runExecutiveDecisionCycle";

import type {
ExecutiveDecision,
} from "../../../engine/v3/model/simulate/executiveDecision";

import {
buildExecutiveDecisionCycleIntegrityKey,
} from "../../../engine/v3/decisions/buildExecutiveDecisionCycleIntegrityKey";

export type ExecutiveDecisionProjection = {
decision: ExecutiveDecision;

objective: {
id: string;
headline: string;
summary: string;
rationale: string;
status: string;
timeHorizon: string;
confidence: number;
assumptions: string[];
openQuestions: string[];
};

optimization: {
id: string;
objective: string;
explanation: string;
timeHorizon: string;
tradeoffStrategy: string;
confidence: number;
confidenceLimiters: string[];


variables: {
  conditionId: string;
  name: string;
  role: string;
  objective: string;
  weight: number;
  executivePriorityScore: number;
  conditionPriorityScore: number;
  networkInfluenceScore: number;
  selectionConfidence: number;
  rationale: string;
  upstreamConditionIds: string[];
  downstreamConditionIds: string[];
}[];

successCriteria: {
  name: string;
  conditionId: string;
  baseline?: number;
  target?: number;
  unit?: string;
  rationale?: string;
}[];

constraints: {
  description: string;
  type: string;
  required: boolean;
  translationStatus: string;
}[];

preferences: {
  type: string;
  direction: string;
  weight: number;
  rationale: string;
}[];


};

candidateStrategies: {
id: string;
title: string;
description: string;
rationale: string;
type: string;
scope: string;
timeHorizon: string;
targetConditionIds: string[];
expectedMechanismIds: string[];
assumptions: string[];
risks: string[];
missingEvidence: string[];
confidence: number;
viable: boolean;
}[];

viabilityEvaluations: {
optionId: string;
title: string;
status:
| "viable"
| "conditionally-viable"
| "disqualified";
explanation: string;

requiredViolations: {
  constraintIndex: number;
  constraintType: string;
  description: string;
  explanation: string;
}[];

unresolvedRequiredConstraints: {
  constraintIndex: number;
  constraintType: string;
  description: string;
  explanation: string;
}[];

optionalIssues: {
  constraintIndex: number;
  constraintType: string;
  description: string;
  explanation: string;
}[];

}[];

simulatedFutures: {
scenarioId: string;
optionId: string;
title: string;
interventionType: string;
timeHorizon: string;
summary: string;
recommendation:
| "proceed"
| "do-not-proceed"
| "investigate-further";
confidence: number;

conditionChanges: {
  conditionId: string;
  name: string;
  change:
    | "improved"
    | "worsened"
    | "unchanged";
  previousStrength: number;
  projectedStrength: number;
  strengthDelta: number;
  previousStatus: string;
  projectedStatus: string;
  previousTrend: string;
  projectedTrend: string;
}[];

predictionChanges: {
  predictionId: string;
  statement: string;
  change:
    | "added"
    | "removed"
    | "strengthened"
    | "weakened"
    | "unchanged";
  previousConfidence?: number;
  projectedConfidence?: number;
  previousLikelihood?: number;
  projectedLikelihood?: number;
}[];

understandingChange: {
  previous: string;
  projected: string;
  changed: boolean;
};

risks: string[];

}[];

comparison: {
summary: string;
differentiators: string[];
};

rankedStrategies: {
scenarioId: string;
optionId: string;
rank: number;
title: string;
score: number;
explanation: string;
}[];

decisionJustification: {
recommendedOptionId: string;
recommendedInterventionId: string;
recommendedTitle: string;
summary: string;
whyRecommended: string[];
decisiveAdvantages: string[];

objectiveAlignment: {
  score: number;
  explanation: string;
};

organizationalImpact: {
  benefitScore: number;
  riskScore: number;
  improvedConditionIds: string[];
  worsenedConditionIds: string[];
  explanation: string;
};

constraintPosition: {
  status:
    | "viable"
    | "conditionally-viable"
    | "disqualified";
  explanation: string;
  unresolvedRequiredConstraints: string[];
  optionalIssues: string[];
};

confidence: {
  score: number;
  explanation: string;
};

alternatives: {
  optionId: string;
  interventionId: string;
  title: string;
  rank: number;
  score: number;
  scoreDifference: number;
  summary: string;
  reasonsRankedLower: string[];
  strengths: string[];
  weaknesses: string[];
  improvedConditionIds: string[];
  worsenedConditionIds: string[];
  viabilityStatus:
    | "viable"
    | "conditionally-viable"
    | "disqualified";
}[];

differentiatingConditionIds: string[];
evidenceThatCouldChangePreference: string[];
generatedAt: string;
};

confidence: {
value: number;
explanation: string;
limiters: string[];
};

recommendation: {
  status:
    | "proceed"
    | "do-not-proceed"
    | "investigate-further";

  headline: string;
  rationale: string;
  nextStep: string;

  strategy?: {
    optionId: string;
    interventionId: string;
    title: string;
    description: string;
    rationale: string;
    type: string;
    scope: string;
    timeHorizon: string;
    targetConditionIds: string[];
    expectedMechanismIds: string[];
  };

  confidence: number;
  expectedBenefits: string[];
  tradeOffs: string[];
  risks: string[];
  assumptions: string[];
  evidenceThatCouldChangeRecommendation: string[];
};

integrityKey: string;

completedAt: string;
};

function pluralize(
count: number,
singular: string,
plural = `${singular}s`,
): string {
return count === 1
? singular
: plural;
}

function findOptionByInterventionId(
decisionCycle: ExecutiveDecisionCycle,
interventionId: string,
) {
return decisionCycle
.evaluatedOptions
.find(
(evaluation) =>
evaluation.intervention.id ===
interventionId,
)
?.option;
}


function buildObjective(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["objective"] {
const decision =
decisionCycle.executiveDecision;

return {
id:
decision.id,

headline:
  decision.title,

summary:
  decision.objective,

rationale:
  decision.rationale,

status:
  decision.status,

timeHorizon:
  decision.timeHorizon,

confidence:
  decision.confidence,

assumptions:
  decision.assumptions,

openQuestions:
  decision.openQuestions,

};
}

function buildOptimization(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["optimization"] {
const optimization =
decisionCycle.optimizationObjective;

return {
id:
optimization.id,

objective:
  optimization.objective,

explanation:
  optimization.explanation,

timeHorizon:
  optimization.timeHorizon,

tradeoffStrategy:
  optimization.tradeoffStrategy,

confidence:
  optimization.confidence,

confidenceLimiters:
  optimization.confidenceLimiters,

variables:
  optimization.variables.map(
    (variable) => ({
      conditionId:
        variable.conditionId,

      name:
        variable.name,

      role:
        variable.role,

      objective:
        variable.objective,

      weight:
        variable.weight,

      executivePriorityScore:
        variable.executivePriorityScore,

      conditionPriorityScore:
        variable.conditionPriorityScore,

      networkInfluenceScore:
        variable.networkInfluenceScore,

      selectionConfidence:
        variable.selectionConfidence,

      rationale:
        variable.rationale,

      upstreamConditionIds:
        variable.upstreamConditionIds,

      downstreamConditionIds:
        variable.downstreamConditionIds,
    }),
  ),

successCriteria:
  optimization.successTargets.map(
    (target) => ({
      name:
        target.name,

      conditionId:
        target.conditionId,

      baseline:
        target.baseline,

      target:
        target.target,

      unit:
        target.unit,

      rationale:
        target.rationale,
    }),
  ),

constraints:
  optimization.constraints.map(
    (constraint) => ({
      description:
        constraint.description,

      type:
        constraint.type,

      required:
        constraint.required,

      translationStatus:
        constraint.translationStatus,
    }),
  ),

preferences:
  optimization.preferences.map(
    (preference) => ({
      type:
        preference.type,

      direction:
        preference.direction,

      weight:
        preference.weight,

      rationale:
        preference.rationale,
    }),
  ),

};
}

function buildCandidateStrategies(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["candidateStrategies"] {
return decisionCycle.generatedOptions.map(
(option) => {
const viability =
decisionCycle.viabilityEvaluations.find(
(evaluation) =>
evaluation.optionId ===
option.id,
);

  return {
    id:
      option.id,

    title:
      option.title,

    description:
      option.description,

    rationale:
      option.rationale,

    type:
      option.type,

    scope:
      option.scope,

    timeHorizon:
      option.timeHorizon,

    targetConditionIds:
      option.targetConditionIds,

    expectedMechanismIds:
      option.expectedMechanismIds,

    assumptions:
      option.assumptions,

    risks:
      option.risks,

    missingEvidence:
      option.missingEvidence,

    confidence:
      option.confidence,

    viable:
      viability?.status ===
        "viable" ||
      viability?.status ===
        "conditionally-viable",
  };
},

);
}

function buildViabilityEvaluations(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["viabilityEvaluations"] {
return decisionCycle.viabilityEvaluations.map(
(evaluation) => {
const option =
decisionCycle.generatedOptions.find(
(candidate) =>
candidate.id ===
evaluation.optionId,
);

  return {
    optionId:
      evaluation.optionId,

    title:
      option?.title ??
      "Unnamed strategy",

    status:
      evaluation.status,

    explanation:
      evaluation.summary,

    requiredViolations:
      evaluation.requiredViolations.map(
        (issue) => ({
          constraintIndex:
            issue.constraintIndex,

          constraintType:
            issue.constraintType,

          description:
            issue.description,

          explanation:
            issue.explanation,
        }),
      ),

    unresolvedRequiredConstraints:
      evaluation
        .unresolvedRequiredConstraints
        .map((issue) => ({
          constraintIndex:
            issue.constraintIndex,

          constraintType:
            issue.constraintType,

          description:
            issue.description,

          explanation:
            issue.explanation,
        })),

    optionalIssues:
      evaluation.optionalIssues.map(
        (issue) => ({
          constraintIndex:
            issue.constraintIndex,

          constraintType:
            issue.constraintType,

          description:
            issue.description,

          explanation:
            issue.explanation,
        }),
      ),
  };
},

);
}

function buildSimulatedFutures(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["simulatedFutures"] {
return decisionCycle.scenarios.map(
(scenarioResult) => {
const option =
findOptionByInterventionId(
decisionCycle,
scenarioResult.intervention.id,
);

  const comparison =
    scenarioResult.comparison;

  return {
    scenarioId:
      scenarioResult
        .simulatedOrganizationState
        .id,

    optionId:
      option?.id ??
      scenarioResult.intervention.id,

    title:
      option?.title ??
      scenarioResult.intervention.title,

    interventionType:
      scenarioResult.intervention.type,

    timeHorizon:
      scenarioResult.intervention
        .timeHorizon,

    summary:
      comparison.executiveSummary,

    recommendation:
      comparison.recommendation,

    confidence:
      comparison.confidence,

    conditionChanges:
      comparison.conditionChanges.map(
        (change) => ({
          conditionId:
            change.conditionId,

          name:
            change.name,

          change:
            change.change,

          previousStrength:
            change.previousStrength,

          projectedStrength:
            change.projectedStrength,

          strengthDelta:
            change.strengthDelta,

          previousStatus:
            change.previousStatus,

          projectedStatus:
            change.projectedStatus,

          previousTrend:
            change.previousTrend,

          projectedTrend:
            change.projectedTrend,
        }),
      ),

    predictionChanges:
      comparison.predictionChanges.map(
        (change) => ({
          predictionId:
            change.predictionId,

          statement:
            change.statement,

          change:
            change.change,

          previousConfidence:
            change.previousConfidence,

          projectedConfidence:
            change.projectedConfidence,

          previousLikelihood:
            change.previousLikelihood,

          projectedLikelihood:
            change.projectedLikelihood,
        }),
      ),

    understandingChange: {
      previous:
        comparison
          .understandingChange
          .previous,

      projected:
        comparison
          .understandingChange
          .projected,

      changed:
        comparison
          .understandingChange
          .changed,
    },

    risks:
      option?.risks ?? [],
  };
},

);
}

function buildComparison(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["comparison"] {
const comparisonSet =
decisionCycle.comparisonSet;

const strategyCount =
comparisonSet
.scenarioComparisons
.length;

const summaries =
comparisonSet.scenarioComparisons.map(
(comparison) =>
`${comparison.interventionTitle}: ${comparison.executiveSummary}`,
);

const differentiators: string[] = [];

if (
comparisonSet
.differentiatingConditionIds
.length > 0
) {
const count =
comparisonSet
.differentiatingConditionIds
.length;

differentiators.push(
  `${count} organizational ${pluralize(
    count,
    "condition",
  )} differ materially across the simulated strategies.`,
);

}

if (
comparisonSet
.differentiatingRecommendations
) {
differentiators.push(
"The simulated strategies do not produce the same executive recommendation.",
);
}

if (
comparisonSet
.sharedImprovedConditionIds
.length > 0
) {
const count =
comparisonSet
.sharedImprovedConditionIds
.length;

differentiators.push(
  `${count} ${pluralize(
    count,
    "condition",
  )} improve under every viable strategy.`,
);

}

if (
comparisonSet
.sharedWorsenedConditionIds
.length > 0
) {
const count =
comparisonSet
.sharedWorsenedConditionIds
.length;

differentiators.push(
  `${count} ${pluralize(
    count,
    "condition",
  )} worsen under every viable strategy.`,
);

}

if (
comparisonSet
.sharedAssumptions
.length > 0
) {
const count =
comparisonSet
.sharedAssumptions
.length;

differentiators.push(
  `${count} ${pluralize(
    count,
    "assumption",
  )} ${
    count === 1
      ? "is"
      : "are"
  } shared across all scenarios.`,
);

}

return {
summary:
summaries.join(" ") ||
`Discovery compared ${strategyCount} viable ${pluralize(
        strategyCount,
        "strategy",
        "strategies",
      )} against the same organizational baseline.`,

differentiators,

};
}

function buildRankedStrategies(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["rankedStrategies"] {
return decisionCycle.rankedScenarios.map(
(rankedScenario) => {
const option =
findOptionByInterventionId(
decisionCycle,
rankedScenario.interventionId,
);

  return {
    scenarioId:
      rankedScenario.scenarioId,

    optionId:
      option?.id ??
      rankedScenario.interventionId,

    rank:
      rankedScenario.rank,

    title:
      option?.title ??
      "Unnamed strategy",

    score:
      rankedScenario.score,

    explanation:
      rankedScenario.reasonsForRank.join(
        " ",
      ),
  };
},

);
}

function buildDecisionJustification(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["decisionJustification"] {
const justification =
decisionCycle.decisionJustification;

return {
recommendedOptionId:
justification.recommendedOptionId,

recommendedInterventionId:
  justification.recommendedInterventionId,

recommendedTitle:
  justification.recommendedTitle,

summary:
  justification.summary,

whyRecommended:
  justification.whyRecommended,

decisiveAdvantages:
  justification.decisiveAdvantages,

objectiveAlignment: {
  score:
    justification
      .objectiveAlignment
      .score,

  explanation:
    justification
      .objectiveAlignment
      .explanation,
},

organizationalImpact: {
  benefitScore:
    justification
      .organizationalImpact
      .benefitScore,

  riskScore:
    justification
      .organizationalImpact
      .riskScore,

  improvedConditionIds:
    justification
      .organizationalImpact
      .improvedConditionIds,

  worsenedConditionIds:
    justification
      .organizationalImpact
      .worsenedConditionIds,

  explanation:
    justification
      .organizationalImpact
      .explanation,
},

constraintPosition: {
  status:
    justification
      .constraintPosition
      .status,

  explanation:
    justification
      .constraintPosition
      .explanation,

  unresolvedRequiredConstraints:
    justification
      .constraintPosition
      .unresolvedRequiredConstraints,

  optionalIssues:
    justification
      .constraintPosition
      .optionalIssues,
},

confidence: {
  score:
    justification.confidence.score,

  explanation:
    justification
      .confidence
      .explanation,
},

alternatives:
  justification.alternatives.map(
    (alternative) => ({
      optionId:
        alternative.optionId,

      interventionId:
        alternative.interventionId,

      title:
        alternative.title,

      rank:
        alternative.rank,

      score:
        alternative.score,

      scoreDifference:
        alternative.scoreDifference,

      summary:
        alternative.summary,

      reasonsRankedLower:
        alternative.reasonsRankedLower,

      strengths:
        alternative.strengths,

      weaknesses:
        alternative.weaknesses,

      improvedConditionIds:
        alternative.improvedConditionIds,

      worsenedConditionIds:
        alternative.worsenedConditionIds,

      viabilityStatus:
        alternative.viabilityStatus,
    }),
  ),

differentiatingConditionIds:
  justification
    .differentiatingConditionIds,

evidenceThatCouldChangePreference:
  justification
    .evidenceThatCouldChangePreference,

generatedAt:
  justification.generatedAt,

};
}

function buildConfidence(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["confidence"] {
const calibration =
decisionCycle.confidenceCalibration;

const explanation = [
`Recommendation quality is ${Math.round(
      calibration
        .recommendationQualityScore *
        100,
    )}%.`,

`Evidence completeness is ${Math.round(
  calibration
    .evidenceConfidenceScore *
    100,
)}%.`,

`Evidence agreement is ${Math.round(
  calibration
    .agreementAnalysis
    .evidenceAgreement *
    100,
)}%.`,

`Learning certainty is ${Math.round(
  calibration
    .learningConfidenceScore *
    100,
)}%.`,

`Constraint confidence is ${Math.round(
  calibration
    .constraintConfidenceScore *
    100,
)}%.`,

].join(" ");

return {
value:
calibration.calibratedConfidence,

explanation,

limiters:
  calibration.confidenceLimiters,

};
}

function buildRecommendation(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection["recommendation"] {
const recommendation =
decisionCycle.recommendation;

const recommendedOption =
recommendation
.recommendedInterventionId
? findOptionByInterventionId(
    decisionCycle,
    recommendation
      .recommendedInterventionId,
  )
: undefined;

const headline =
recommendation.status ===
"proceed"
? recommendedOption
? `Proceed with ${recommendedOption.title}`
: "Proceed with the highest-ranked strategy"
: recommendation.status ===
"do-not-proceed"
? "Do not proceed with the evaluated strategies"
: "Investigate further before making the decision";

const rationaleParts = [
recommendation.summary,
...recommendation.whyRecommended,
].filter(
(value) =>
value.trim().length > 0,
);

let nextStep: string;

switch (recommendation.status) {
case "proceed":
nextStep =
recommendedOption
? `Prepare an implementation plan for ${recommendedOption.title}, confirm accountable owners, and define the decision review date.`
: "Prepare an implementation plan for the highest-ranked strategy and define the decision review date.";
break;

case "do-not-proceed":
  nextStep =
    "Reframe the executive objective, revise the available intervention options, or resolve the constraints preventing a viable decision.";
  break;

case "investigate-further":
  nextStep =
    recommendation
      .evidenceThatCouldChangeRecommendation[0] ??
    "Gather the highest-value missing evidence before committing to an intervention.";
  break;


}

return {
status:
  recommendation.status,

headline,

rationale:
  rationaleParts.join(" "),

nextStep,

strategy:
  recommendation.recommendedStrategy,

confidence:
  recommendation.confidence,

expectedBenefits:
  recommendation.expectedBenefits,

tradeOffs:
  recommendation.tradeOffs,

risks:
  recommendation.risks,

assumptions:
  recommendation.assumptions,

evidenceThatCouldChangeRecommendation:
  recommendation
    .evidenceThatCouldChangeRecommendation,

};
}

export function buildExecutiveDecisionProjection(
decisionCycle: ExecutiveDecisionCycle,
): ExecutiveDecisionProjection {
return {
decision:
decisionCycle.executiveDecision,

objective:
buildObjective(
decisionCycle,
),

optimization:
  buildOptimization(
    decisionCycle,
  ),

candidateStrategies:
  buildCandidateStrategies(
    decisionCycle,
  ),

viabilityEvaluations:
  buildViabilityEvaluations(
    decisionCycle,
  ),

simulatedFutures:
  buildSimulatedFutures(
    decisionCycle,
  ),

comparison:
  buildComparison(
    decisionCycle,
  ),

rankedStrategies:
  buildRankedStrategies(
    decisionCycle,
  ),

decisionJustification:
  buildDecisionJustification(
    decisionCycle,
  ),

confidence:
  buildConfidence(
    decisionCycle,
  ),

recommendation:
  buildRecommendation(
    decisionCycle,
  ),

integrityKey:
  buildExecutiveDecisionCycleIntegrityKey(
    decisionCycle,
  ),

completedAt:
  decisionCycle.completedAt,

};
}
