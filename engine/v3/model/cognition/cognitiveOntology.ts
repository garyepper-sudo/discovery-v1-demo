export type CognitiveLayer =
  | "evidence"
  | "belief"
  | "pattern"
  | "mechanism"
  | "organizationalTheory"
  | "capability"
  | "executiveUnderstanding";

export type CognitiveObjectId = string;

export type CognitiveObjectLifecycle =
  | "detected"
  | "forming"
  | "stable"
  | "weakening"
  | "retired";

export type CognitiveObjectBase<Layer extends CognitiveLayer> = {
  /**
   * Stable identifier for the cognitive object.
   */
  id: CognitiveObjectId;

  /**
   * Canonical ontology layer this object belongs to.
   * This should never change during the object's lifetime.
   */
  cognitiveLayer: Layer;

  /**
   * Ontology specification version that produced this object.
   */
  ontologyVersion: "1.0";
};

export type CognitiveTransformation =
  | "observation"
  | "generalization"
  | "explanation"
  | "systemModeling"
  | "capabilityAssessment"
  | "executiveCompression";

export type CognitiveLayerDefinition = {
  layer: CognitiveLayer;
  questionAnswered: string;
  responsibility: string;
  transformationFromPrevious?: CognitiveTransformation;
  shouldBeUserFacing: boolean;
  organismRepresentation: string;
};

export const COGNITIVE_ONTOLOGY: CognitiveLayerDefinition[] = [
  {
    layer: "evidence",
    questionAnswered: "What happened?",
    responsibility: "Raw organizational input with source traceability.",
    shouldBeUserFacing: false,
    organismRepresentation: "Incoming signals",
  },
  {
    layer: "belief",
    questionAnswered: "What appears to be true?",
    responsibility:
      "Localized organizational observations inferred from evidence.",
    transformationFromPrevious: "observation",
    shouldBeUserFacing: false,
    organismRepresentation: "Small internal signals or nodes",
  },
  {
    layer: "pattern",
    questionAnswered: "What repeats?",
    responsibility:
      "Recurring organizational behavior across multiple beliefs.",
    transformationFromPrevious: "generalization",
    shouldBeUserFacing: false,
    organismRepresentation:
      "Clusters, constellations, or recurring formations",
  },
  {
    layer: "mechanism",
    questionAnswered: "Why does this repeat?",
    responsibility: "Canonical explanations for why patterns exist.",
    transformationFromPrevious: "explanation",
    shouldBeUserFacing: false,
    organismRepresentation: "Forces, pressures, distortions, or fields",
  },
  {
    layer: "organizationalTheory",
    questionAnswered: "How do mechanisms interact?",
    responsibility:
      "Causal organizational models describing how mechanisms interact.",
    transformationFromPrevious: "systemModeling",
    shouldBeUserFacing: false,
    organismRepresentation: "Flows between organism regions",
  },
  {
    layer: "capability",
    questionAnswered: "How healthy is this organizational ability?",
    responsibility:
      "Evaluates organizational health based on mechanisms and organizational theory.",
    transformationFromPrevious: "capabilityAssessment",
    shouldBeUserFacing: true,
    organismRepresentation:
      "Major organism regions, organs, or vital signs",
  },
  {
    layer: "executiveUnderstanding",
    questionAnswered: "What should leadership understand?",
    responsibility: "Distilled leadership-relevant understanding.",
    transformationFromPrevious: "executiveCompression",
    shouldBeUserFacing: true,
    organismRepresentation: "Overall organism posture or state",
  },
];

export const DEPRECATED_COGNITIVE_CONCEPTS = [
  {
    concept: "OrganizationalPhenomenon",
    replacement: "Pattern or Mechanism",
    reason:
      "Phenomena overlap with patterns when describing recurrence and mechanisms when describing explanation.",
  },
  {
    concept: "UnderstandingCluster",
    replacement: "Implementation detail for pattern formation",
    reason:
      "Clusters are computational grouping artifacts, not top-level cognitive objects.",
  },
  {
    concept: "SemanticConcept",
    replacement: "Metadata or labeling aid",
    reason:
      "Semantic concepts should support compression and labeling without competing with the ontology.",
  },
] as const;