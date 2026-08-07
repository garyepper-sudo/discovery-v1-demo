import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  MAX_CANONICAL_ANCESTRY_DEPTH,
  MAX_CANONICAL_ANCESTOR_REFS,
  MAX_CANONICAL_MATERIAL_SUPPORTS,
  canonicalAncestryDigest,
  createCanonicalDerivedArtifactGovernanceAncestry,
  normalizeCanonicalMaterialSupports,
  resolveCanonicalMaterialSupports,
  validateCanonicalDerivedArtifactGovernanceAncestry,
  validateCanonicalDerivedArtifactGovernanceAncestryGraph,
  type CanonicalAncestryConstructionContext,
  type CanonicalDerivedArtifactGovernanceAncestryV1,
  type CanonicalMaterialEvidenceSupportV1,
} from "../../engine/v3/governance/canonicalDerivedArtifactGovernanceAncestry";
import {
  admitCanonicalEvidenceScopeLineage,
  createCanonicalScopeLineageIndex,
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import { completeOrganizationalExplanations } from "../../engine/v3/model/judgment/completeOrganizationalExplanations";
import { consolidateOrganizationalTheories } from "../../engine/v3/model/memory/consolidateOrganizationalTheories";

const ORGANIZATION_ID = "cross-operation-ancestry-validation";
const NOW = "2026-08-07T12:00:00.000Z";
const sha256 = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

function oracleStable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(oracleStable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${oracleStable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

const oracleDigest = (value: unknown): string => sha256(oracleStable(value));
const rootScope = {
  organizationId: ORGANIZATION_ID,
  type: "organization" as const,
  id: ORGANIZATION_ID,
};
const topology = createCanonicalScopeTopology({
  organizationId: ORGANIZATION_ID,
  topologyVersion: 1,
  effectiveAt: NOW,
  nodes: [rootScope],
  relationships: [],
});

function context(
  sourceId: string,
  localEvidenceId: string,
  text: string,
): CanonicalAncestryConstructionContext {
  const contentDigest = sha256(text);
  const binding = createCanonicalSourceScopeBinding({
    organizationId: ORGANIZATION_ID,
    bindingVersion: 1,
    source: { sourceId, sourceVersion: "1", normalizedContentDigest: contentDigest },
    topology,
    assertions: [{ relationship: "origin", scope: rootScope }],
    basisRefs: [`validation:${sourceId}`],
    effectiveAt: NOW,
    sourceType: "manual-takeaway",
    purposeRef: "question:cross-operation",
    availability: "available",
  });
  const admission = admitCanonicalEvidenceScopeLineage({
    lineage: {
      organizationId: ORGANIZATION_ID,
      effectiveAt: NOW,
      topologyRevisions: [topology],
      sourceBindingRevisions: [binding],
    },
    evidence: [
      {
        evidenceId: localEvidenceId,
        evidenceText: text,
        sourceId,
        contentDigest,
      },
    ],
  });
  return {
    organizationId: ORGANIZATION_ID,
    operationBatch: admission.operationBatch,
    scopeLineageIndex: createCanonicalScopeLineageIndex({
      organizationId: ORGANIZATION_ID,
      topology: admission.topology,
      sourceBindings: admission.sourceBindings,
      evidenceAttributions: admission.evidenceAttributions,
      derivedLineages: [],
    }),
  };
}

function theorySignals(evidenceId: string) {
  return {
    beliefs: [
      {
        id: "belief:coordination",
        statement: "coordination handoff execution",
        confidence: 0.7,
        supportingMechanismIds: ["mechanism:coordination"],
      },
    ],
    mechanisms: [
      {
        id: "mechanism:coordination",
        statement: "coordination handoff execution",
        confidence: 0.7,
        supportingEvidenceIds: [evidenceId],
        supportingExplanationSeedIds: ["seed:coordination"],
        supportingReasoningPathIds: ["path:coordination"],
        scopeRef: rootScope,
        outcomeRefs: [{ type: "indirectEffect" as const, id: "outcome:delay" }],
      },
    ],
    concepts: [{ id: "concept:coordination", summary: "coordination" }],
    evidence: [{ id: evidenceId }],
  };
}

function expectFailure(action: () => unknown, pattern: RegExp): void {
  assert.throws(action, pattern);
}

let checks = 0;
const check = (condition: unknown, message: string): void => {
  assert.ok(condition, message);
  checks += 1;
};

const firstContext = context("source:first", "E1", "First governed fact.");
const firstSignals = theorySignals("E1");
const firstState = consolidateOrganizationalTheories({
  existingTheories: [],
  ...firstSignals,
  canonicalGovernanceContext: firstContext,
  contradictoryEvidenceIds: [],
  now: NOW,
});
const firstTheory = firstState.theories[0]!;
const firstAncestry = firstTheory.canonicalGovernanceAncestry!;
validateCanonicalDerivedArtifactGovernanceAncestry(firstAncestry);
check(Boolean(firstAncestry), "operation 1 creates Theory ancestry");
check(firstAncestry.contractVersion === "1", "literal ancestry version is one");
check(firstAncestry.directMaterialSupports.length === 1, "direct support complete");
check(firstAncestry.transitiveMaterialSupports.length === 1, "transitive support complete");
// Independent digest comparison excludes the digest field without importing
// the semantic digest helper as the expected oracle.
const { ancestryDigest: firstDigest, ...firstUnsigned } = firstAncestry;
check(firstDigest === oracleDigest(firstUnsigned), "independent ancestry digest");

const secondContext = context("source:second", "E1", "Opposing governed fact.");
const secondSignals = theorySignals("E1");
const secondState = consolidateOrganizationalTheories({
  existingTheories: firstState.theories,
  ...secondSignals,
  canonicalGovernanceContext: secondContext,
  contradictoryEvidenceIds: ["E1"],
  now: "2026-08-07T12:01:00.000Z",
});
const secondTheory = secondState.theories.find(
  (theory) => theory.id === firstTheory.id,
)!;
const secondAncestry = secondTheory.canonicalGovernanceAncestry!;
check(secondTheory.id === firstTheory.id, "Theory stable identity preserved");
check(
  secondAncestry.derivedArtifactRevisionId !==
    firstAncestry.derivedArtifactRevisionId,
  "governance revision advances without changing Theory identity",
);
check(
  secondAncestry.transitiveMaterialSupports.length === 2,
  "current and inherited canonical supports retained",
);
check(
  secondAncestry.transitiveMaterialSupports.some(
    (support) => support.role === "contradictory-material",
  ),
  "contradictory material support retained",
);
const completion = completeOrganizationalExplanations({
  organizationId: ORGANIZATION_ID,
  seeds: [
    {
      id: "seed:coordination",
      organizationId: ORGANIZATION_ID,
      semanticKey: "seed:coordination",
      title: "bounded",
      summary: "bounded",
      explanationType: "coordination",
      scope: rootScope,
      outcomeRefs: [{ type: "indirectEffect", id: "outcome:delay" }],
      reasoningPathIds: ["path:coordination"],
      reasoningRelationshipIds: [],
      evidenceIds: ["E1"],
      supportedPathIds: [],
      explainedEffectIds: [],
      relatedRootCauseIds: [],
      relatedLeveragePointIds: [],
      relatedExecutiveConclusionIds: [],
      assumptions: [],
      evidenceReferences: [],
      confidence: 0.7,
      generatedAt: NOW,
    },
  ],
  mechanisms: [
    {
      id: "mechanism:coordination",
      statement: "coordination",
      mechanismType: "coordination" as never,
      category: "coordination" as never,
      description: "bounded",
      confidence: 0.7,
      strength: 0.7,
      supportingEvidenceIds: ["E1"],
      supportingObservationIds: [],
      supportingPhenomenonIds: [],
      supportingExplanationIds: ["seed:coordination"],
      supportingExplanationSeedIds: ["seed:coordination"],
      supportingReasoningPathIds: ["path:coordination"],
      reasoningPathIds: ["path:coordination"],
      scopeRef: rootScope,
      outcomeRefs: [{ type: "indirectEffect", id: "outcome:delay" }],
      affectedEntityIds: [],
      affectedProcessIds: [],
      conditions: [],
      implications: [],
      firstObserved: NOW,
      lastObserved: NOW,
    } as never,
  ],
  beliefs: firstSignals.beliefs as never,
  theories: secondState.theories,
  contradictionIds: [],
  evidenceContext: {
    organizationId: ORGANIZATION_ID,
    evidence: [{ id: "E1" }],
    relationships: [],
  },
  canonicalGovernanceContext: secondContext,
  now: "2026-08-07T12:01:00.000Z",
});
const explanation = completion.explanations[0]!;
const lineage = explanation.canonicalGovernanceLineage!;
check(completion.failures.length === 0, "Explanation completes");
check(lineage.directMaterialSupports.length === 1, "direct support separated");
check(
  lineage.inheritedMaterialAncestorRefs.length > 0,
  "at least one actual Theory revision is bound",
);
check(
  lineage.materialSupports.length >= 2 &&
    lineage.materialSupports.some(
      (support) => support.role === "contradictory-material",
    ),
  "direct and inherited contradictory support are unioned",
);
check(explanation.id.startsWith("organizational-explanation:"), "Explanation identity stable");
const { lineageDigest, ...lineageUnsigned } = lineage;
check(lineageDigest === oracleDigest(lineageUnsigned), "independent Explanation digest");
check(!JSON.stringify(lineage).includes("First governed fact"), "no body leakage");

const historicalTheory = { ...secondTheory, canonicalGovernanceAncestry: undefined };
expectFailure(
  () =>
    consolidateOrganizationalTheories({
      existingTheories: [historicalTheory],
      ...secondSignals,
      canonicalGovernanceContext: secondContext,
      contradictoryEvidenceIds: [],
      now: NOW,
    }),
  /Historical pre-lineage Theory/,
);

const direct = resolveCanonicalMaterialSupports({
  context: firstContext,
  localEvidenceRoles: [{ localEvidenceId: "E1", role: "material" }],
});
expectFailure(
  () =>
    createCanonicalDerivedArtifactGovernanceAncestry({
      organizationId: "foreign",
      derivedArtifactType: "organizational-theory",
      derivedArtifactId: "theory:foreign",
      revisionBasis: {},
      directMaterialSupports: direct,
      inheritedMaterialAncestors: [firstAncestry],
    }),
  /Cross-organization/,
);
expectFailure(
  () =>
    resolveCanonicalMaterialSupports({
      context: firstContext,
      localEvidenceRoles: [{ localEvidenceId: "missing", role: "material" }],
    }),
  /incomplete/,
);

const deep: CanonicalDerivedArtifactGovernanceAncestryV1 = {
  ...firstAncestry,
  ancestryDepth: MAX_CANONICAL_ANCESTRY_DEPTH,
};
deep.ancestryDigest = oracleDigest(
  (({ ancestryDigest: _ignored, ...unsigned }) => unsigned)(deep),
);
expectFailure(
  () =>
    createCanonicalDerivedArtifactGovernanceAncestry({
      organizationId: ORGANIZATION_ID,
      derivedArtifactType: "organizational-theory",
      derivedArtifactId: "theory:depth",
      revisionBasis: {},
      directMaterialSupports: direct,
      inheritedMaterialAncestors: [deep],
    }),
  /depth exceeded/,
);

const repeated = normalizeCanonicalMaterialSupports([
  ...direct,
  ...direct,
]);
check(repeated.length === direct.length, "diamond/repeated support deduplicates");
validateCanonicalDerivedArtifactGovernanceAncestryGraph({
  root: secondAncestry,
  ancestors: [firstAncestry],
});
check(true, "valid immutable historical revision graph accepted");
expectFailure(
  () => validateCanonicalDerivedArtifactGovernanceAncestryGraph({ root: secondAncestry, ancestors: [] }),
  /stale or invalid/,
);
const unsupportedVersion = { ...firstAncestry, contractVersion: "other" } as never;
expectFailure(
  () => validateCanonicalDerivedArtifactGovernanceAncestry(unsupportedVersion),
  /incomplete/,
);
const wrongDigest = { ...firstAncestry, ancestryDigest: "wrong" };
expectFailure(
  () => validateCanonicalDerivedArtifactGovernanceAncestry(wrongDigest),
  /integrity failed/,
);
const excessiveRefs = {
  ...firstAncestry,
  inheritedMaterialAncestorRefs: Array.from(
    { length: MAX_CANONICAL_ANCESTOR_REFS + 1 },
    (_, index) => ({
      derivedArtifactType: "organizational-theory" as const,
      derivedArtifactId: `theory:${index}`,
      derivedArtifactRevisionId: `revision:${index}`,
      ancestryDigest: `digest:${index}`,
      supportRole: "material" as const,
    }),
  ),
};
expectFailure(
  () => validateCanonicalDerivedArtifactGovernanceAncestry(excessiveRefs),
  /incomplete/,
);
const excessiveSupports = {
  ...firstAncestry,
  transitiveMaterialSupports: Array.from(
    { length: MAX_CANONICAL_MATERIAL_SUPPORTS + 1 },
    (_, index) => ({ ...direct[0]!, canonicalEvidenceId: `evidence:${index}` }),
  ),
};
expectFailure(
  () => validateCanonicalDerivedArtifactGovernanceAncestry(excessiveSupports),
  /incomplete/,
);
check(
  canonicalAncestryDigest({ golden: ["a", "b"] }) ===
    "284927a6252cd3800899a2d803732365c5cd4a6ca405df8f5745a01d903befa5",
  "fixed golden digest vector",
);

console.log(
  JSON.stringify({
    result: "PASS",
    checks,
    theoryRevisions: 2,
    directSupports: lineage.directMaterialSupports.length,
    inheritedAncestors: lineage.inheritedMaterialAncestorRefs.length,
    transitiveSupports: lineage.materialSupports.length,
    historicalPreLineage: "unavailable",
    externalActivity: { network: 0, connector: 0, drive: 0, production: 0 },
  }),
);
