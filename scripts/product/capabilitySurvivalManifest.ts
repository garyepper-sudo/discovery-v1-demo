export const CAPABILITY_SURVIVAL_BOUNDARIES = [
  "runtime",
  "projection",
  "communication",
  "presentation",
] as const;

export type CapabilitySurvivalBoundary =
  (typeof CAPABILITY_SURVIVAL_BOUNDARIES)[number];

export const CAPABILITY_SURVIVAL_CLASSIFICATIONS = [
  "source-absent",
  "not-authorized",
  "intentionally-unavailable",
  "silently-lost",
  "misleading-fallback",
  "non-authoritative-recomputation",
  "healthy-intentional-compression",
] as const;

export type CapabilitySurvivalClassification =
  (typeof CAPABILITY_SURVIVAL_CLASSIFICATIONS)[number];

export type CapabilitySurvivalContract = {
  capabilityId:
    | "CAP-UND-004"
    | "CAP-UND-006"
    | "CAP-COM-001"
    | "CAP-SELF-001"
    | "CAP-SELF-002"
    | "CAP-LRN-001"
    | "CAP-LRN-002"
    | "CAP-MEM-001";
  requiredBoundaries: CapabilitySurvivalBoundary[];
  requiredSemantics: string[];
  permittedTransformations: string[];
  prohibitedTransformations: string[];
  validations: string[];
};

export type CapabilityBoundaryObservation = {
  sourcePresent: boolean;
  authorized: boolean;
  downstreamRequired: boolean;
  downstreamPresent: boolean;
  unavailableStateTruthful: boolean;
  recomputedByNonAuthoritativeLayer: boolean;
  meaningPreserved: boolean;
};

export function classifyCapabilitySurvival(
  observation: CapabilityBoundaryObservation,
): CapabilitySurvivalClassification {
  if (!observation.sourcePresent) return "source-absent";
  if (!observation.authorized) return "not-authorized";
  if (observation.recomputedByNonAuthoritativeLayer) {
    return "non-authoritative-recomputation";
  }
  if (
    observation.downstreamRequired &&
    !observation.downstreamPresent &&
    !observation.unavailableStateTruthful
  ) {
    return "misleading-fallback";
  }
  if (observation.downstreamRequired && !observation.downstreamPresent) {
    return "silently-lost";
  }
  if (!observation.downstreamRequired && !observation.downstreamPresent) {
    return "intentionally-unavailable";
  }
  if (!observation.meaningPreserved) return "silently-lost";
  return "healthy-intentional-compression";
}

const PRESENTATION_LABELS = [
  "presentation-only labels",
  "section headings",
  "formatting",
  "progressive disclosure",
];

export const CAPABILITY_SURVIVAL_CONTRACTS: CapabilitySurvivalContract[] = [
  {
    capabilityId: "CAP-UND-004",
    requiredBoundaries: ["projection", "communication", "presentation"],
    requiredSemantics: [
      "condition identity survives lead, support, uncertainty, and inquiry composition",
      "cross-condition context is explicitly classified",
      "canonical condition summaries use profile-owned readable driver labels",
    ],
    permittedTransformations: PRESENTATION_LABELS,
    prohibitedTransformations: [
      "substitute first-available condition content for lead-linked content",
      "join conditions by text similarity",
    ],
    validations: [
      "validate:lead-coherent-understanding",
      "validate:customer-readable-driver-labels",
    ],
  },
  {
    capabilityId: "CAP-UND-006",
    requiredBoundaries: [...CAPABILITY_SURVIVAL_BOUNDARIES],
    requiredSemantics: [
      "canonical understanding survives as the current understanding",
      "original user question remains distinct from the next inquiry",
    ],
    permittedTransformations: PRESENTATION_LABELS,
    prohibitedTransformations: [
      "replace the original question with an inquiry",
      "synthesize a new understanding in presentation",
    ],
    validations: [
      "validate:lead-coherent-understanding",
      "validate:canonical-product-composition",
      "validate:why-discovery-believes-this",
      "validate:minimal-reading-experience",
      "validate:question-centered-flow",
    ],
  },
  {
    capabilityId: "CAP-COM-001",
    requiredBoundaries: ["projection", "communication", "presentation"],
    requiredSemantics: [
      "Product Communication remains the product-language authority",
      "Hosted Alpha presents rather than independently synthesizes meaning",
    ],
    permittedTransformations: PRESENTATION_LABELS,
    prohibitedTransformations: [
      "recompute explanations, alternatives, uncertainty, investigation value, or change reasons",
    ],
    validations: [
      "validate:structured-product-communication-shadow",
      "validate:lead-coherent-understanding",
      "validate:customer-readable-driver-labels",
      "validate:canonical-product-composition",
      "validate:minimal-reading-experience",
      "validate:simplified-product-navigation",
    ],
  },
  {
    capabilityId: "CAP-SELF-001",
    requiredBoundaries: ["projection", "communication", "presentation"],
    requiredSemantics: [
      "authorized uncertainty survives when available",
      "current understanding, belief disclosure, and Plan remain consistent",
      "unavailable is truthful when uncertainty is absent",
    ],
    permittedTransformations: PRESENTATION_LABELS,
    prohibitedTransformations: [
      "fabricate uncertainty",
      "silently substitute another field",
    ],
    validations: [
      "validate:lead-coherent-understanding",
      "validate:canonical-product-composition",
      "validate:why-discovery-believes-this",
    ],
  },
  {
    capabilityId: "CAP-SELF-002",
    requiredBoundaries: [...CAPABILITY_SURVIVAL_BOUNDARIES],
    requiredSemantics: [
      "canonical investigation priority order survives",
      "Understanding, Plan, and Follow share one authorized opportunity",
      "inquiry, gap, rationale, affected conditions, and expected gain remain linked",
    ],
    permittedTransformations: [
      ...PRESENTATION_LABELS,
      "label canonical confidence gain as an estimate",
    ],
    prohibitedTransformations: [
      "rerank investigations",
      "recompute expected confidence gain",
    ],
    validations: [
      "validate:lead-coherent-understanding",
      "validate:why-this-evidence-matters",
      "validate:canonical-product-composition",
    ],
  },
  {
    capabilityId: "CAP-LRN-001",
    requiredBoundaries: [...CAPABILITY_SURVIVAL_BOUNDARIES],
    requiredSemantics: [
      "first understanding remains distinct from revision",
      "revision direction and exact-linked reason survive",
      "evidence arrival alone does not become a change claim",
    ],
    permittedTransformations: PRESENTATION_LABELS,
    prohibitedTransformations: [
      "fabricate a change reason",
      "treat evidence arrival as understanding revision",
    ],
    validations: [
      "validate:what-changed-and-why",
      "validate:iterative-understanding-loop",
    ],
  },
  {
    capabilityId: "CAP-LRN-002",
    requiredBoundaries: [...CAPABILITY_SURVIVAL_BOUNDARIES],
    requiredSemantics: [
      "supported learning reason survives only with exact Runtime evolution linkage",
      "unlinked learning reason remains unavailable",
    ],
    permittedTransformations: PRESENTATION_LABELS,
    prohibitedTransformations: ["infer a revision reason without exact linkage"],
    validations: [
      "validate:what-changed-and-why",
      "validate:iterative-understanding-loop",
    ],
  },
  {
    capabilityId: "CAP-MEM-001",
    requiredBoundaries: ["runtime", "projection", "presentation"],
    requiredSemantics: [
      "revision continuity and historical identity survive when used",
      "presentation creates no parallel history store",
      "rendering leaves Runtime bytes unchanged",
    ],
    permittedTransformations: PRESENTATION_LABELS,
    prohibitedTransformations: [
      "mutate Runtime while rendering",
      "persist presentation-owned history",
    ],
    validations: [
      "validate:organizational-understanding-projection-shadow",
      "validate:what-changed-and-why",
    ],
  },
];

export const EVIDENCE_BASIS_SURVIVAL_CONTRACT = {
  requiredSemantics: [
    "supporting, opposing, and shared roles remain distinct when canonical",
    "canonical unresolved alternatives remain unresolved",
    "empty roles and alternatives fail closed without inference from onboarding prose",
  ],
  validations: [
    "validate:why-discovery-believes-this",
    "validate:canonical-product-composition",
  ],
} as const;
