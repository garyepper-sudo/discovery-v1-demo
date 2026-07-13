import type {
  OrganizationalPredictionTimeHorizon,
  OrganizationalPredictionType,
} from "./organizationalPrediction";

export type PredictionRule = {
  id: string;

  type: OrganizationalPredictionType;

  name: string;

  description: string;

  defaultTimeHorizon: OrganizationalPredictionTimeHorizon;

  executiveQuestion: string;

  explanation: string;
};

export const PREDICTION_RULES: PredictionRule[] = [
  {
    id: "continuation",

    type: "continuation",

    name: "Continuation Prediction",

    description:
      "Estimate what is likely to happen if the current organizational condition continues without meaningful intervention.",

    defaultTimeHorizon: "near-term",

    executiveQuestion:
      "If nothing changes, what is most likely to happen?",

    explanation:
      "Continuation predictions assume current organizational conditions remain materially unchanged.",
  },

  {
    id: "deterioration",

    type: "deterioration",

    name: "Deterioration Prediction",

    description:
      "Estimate which organizational conditions are likely to worsen based on current evidence and system dynamics.",

    defaultTimeHorizon: "near-term",

    executiveQuestion:
      "Which organizational risks are most likely to increase?",

    explanation:
      "Deterioration predictions require evidence of persistent or strengthening organizational constraints.",
  },

  {
    id: "improvement",

    type: "improvement",

    name: "Improvement Prediction",

    description:
      "Estimate which organizational conditions are likely to improve if current positive signals continue.",

    defaultTimeHorizon: "medium-term",

    executiveQuestion:
      "What is most likely to improve if current progress continues?",

    explanation:
      "Improvement predictions require evidence that positive organizational change is already occurring.",
  },

  {
    id: "propagation",

    type: "propagation",

    name: "Propagation Prediction",

    description:
      "Estimate how changes in one organizational condition may influence connected conditions.",

    defaultTimeHorizon: "near-term",

    executiveQuestion:
      "How is this condition likely to affect the rest of the organization?",

    explanation:
      "Propagation predictions follow organizational system relationships rather than isolated conditions.",
  },
];