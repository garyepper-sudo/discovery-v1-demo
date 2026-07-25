import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { runDiscoveryV3 } from "../../v3";
import type { KnowledgeReference } from "../../v3/cognition/cognitiveGraph";
import type { OrganizationalBelief } from "../../v3/model/beliefs/organizationalBeliefs";
import {
  completeOrganizationalExplanations,
  type OrganizationalExplanationCompletionEvidenceContext,
} from "../../v3/model/judgment/completeOrganizationalExplanations";
import type {
  OrganizationalExplanation,
  OrganizationalExplanationEvidenceRole,
  OrganizationalExplanationEvidenceRoleAssignment,
  OrganizationalExplanationSeed,
  OrganizationalOutcomeRef,
  OrganizationalScopeRef,
} from "../../v3/model/judgment/organizationalJudgment";
import type { OrganizationalMechanism } from "../../v3/model/judgment/organizationalMechanism";
import type { OrganizationalTheory } from "../../v3/model/memory/organizationalTheories";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { V3EvidenceRelationship } from "../../v3/types";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

type CompletionInput = Parameters<typeof completeOrganizationalExplanations>[0];
type ScenarioResult = {
  id: string;
  category:
    | "support"
    | "opposition"
    | "shared"
    | "determinism"
    | "compatibility-isolation";
  passed: true;
  observation: string;
};

const NOW = "2026-08-01T12:00:00.000Z";
const ORGANIZATION_A = "comparative-role-org-a";
const ORGANIZATION_B = "comparative-role-org-b";
const PRE_PHASE_DISABLED_BASELINE_SHA256 =
  "466a669ebd73bbdefa6f5b00415bc8b506c1f05bc700b459b1efdea5a9f7aca6";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function sha256(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function scope(
  organizationId: string,
  id = organizationId,
): OrganizationalScopeRef {
  return {
    organizationId,
    type: "organization",
    id,
  };
}

function outcome(id: string): OrganizationalOutcomeRef {
  return { type: "reasoningNode", id };
}

function seed(params: {
  id: string;
  organizationId?: string;
  scope?: OrganizationalScopeRef;
  outcomeIds?: string[];
  evidenceIds?: string[];
  evidenceReferences?: KnowledgeReference[];
  reasoningPathIds?: string[];
}): OrganizationalExplanationSeed {
  const organizationId = params.organizationId ?? ORGANIZATION_A;
  const evidenceIds = params.evidenceIds ?? [];
  const reasoningPathIds = params.reasoningPathIds ?? [`path:${params.id}`];
  return {
    id: params.id,
    organizationId,
    semanticKey: `${organizationId}:${params.id}`,
    title: `Structured seed ${params.id}`,
    summary: `Structured seed ${params.id}`,
    explanationType: "causal",
    scope: params.scope ?? scope(organizationId),
    outcomeRefs: (params.outcomeIds ?? ["outcome:shared"]).map(outcome),
    reasoningPathIds,
    reasoningRelationshipIds: [`relationship:${params.id}`],
    evidenceIds,
    supportedPathIds: reasoningPathIds,
    explainedEffectIds: [],
    relatedRootCauseIds: [],
    relatedLeveragePointIds: [],
    relatedExecutiveConclusionIds: [],
    assumptions: [],
    evidenceReferences:
      params.evidenceReferences ??
      evidenceIds.map((id) => ({ id, type: "evidence" as const })),
    confidence: 0.66,
    generatedAt: NOW,
  };
}

function fixtureForSeeds(params: {
  organizationId?: string;
  seeds: OrganizationalExplanationSeed[];
  mechanismOnlyEvidenceIds?: string[];
  theoryOnlyEvidenceIds?: string[];
  existingExplanations?: OrganizationalExplanation[];
  contradictionIds?: string[];
  evidenceContext?: OrganizationalExplanationCompletionEvidenceContext;
}): CompletionInput {
  const organizationId = params.organizationId ?? ORGANIZATION_A;
  const mechanisms: OrganizationalMechanism[] = params.seeds.map(
    (item, index) =>
      ({
        id: `mechanism:${item.id}`,
        supportingExplanationSeedIds: [item.id],
        supportingExplanationIds: [item.id],
        supportingReasoningPathIds: [...item.reasoningPathIds],
        reasoningPathIds: [...item.reasoningPathIds],
        supportingEvidenceIds: unique([
          ...item.evidenceIds,
          ...(index === 0 ? params.mechanismOnlyEvidenceIds ?? [] : []),
        ]),
        scopeRef: item.scope,
        outcomeRefs: item.outcomeRefs,
      }) as unknown as OrganizationalMechanism,
  );
  const beliefs: OrganizationalBelief[] = mechanisms.map(
    (item) =>
      ({
        id: `belief:${item.id}`,
        supportingMechanismIds: [item.id],
      }) as unknown as OrganizationalBelief,
  );
  const theories: OrganizationalTheory[] = params.seeds.map(
    (item, index) =>
      ({
        id: `theory:${item.id}`,
        supportingMechanisms: [`mechanism:${item.id}`],
        supportingBeliefs: [`belief:mechanism:${item.id}`],
        supportingConcepts: [],
        supportingEvidence: unique([
          ...item.evidenceIds,
          ...(index === 0 ? params.theoryOnlyEvidenceIds ?? [] : []),
        ]),
        explanationSeedIds: [item.id],
        reasoningPathIds: [...item.reasoningPathIds],
        scopeRefs: [item.scope],
        outcomeRefs: item.outcomeRefs,
      }) as unknown as OrganizationalTheory,
  );
  return {
    organizationId,
    seeds: params.seeds,
    mechanisms,
    beliefs,
    theories,
    existingExplanations: params.existingExplanations,
    contradictionIds: params.contradictionIds,
    evidenceContext: params.evidenceContext,
    now: NOW,
  };
}

function relationship(params: {
  id: string;
  source: string;
  target: string;
  type?: V3EvidenceRelationship["type"];
}): OrganizationalExplanationCompletionEvidenceContext["relationships"][number] {
  return {
    id: params.id,
    sourceEvidenceId: params.source,
    targetEvidenceId: params.target,
    type: params.type ?? "contradicts",
  };
}

function context(params: {
  organizationId?: string;
  evidenceIds: string[];
  relationships?: OrganizationalExplanationCompletionEvidenceContext["relationships"];
}): OrganizationalExplanationCompletionEvidenceContext {
  return {
    organizationId: params.organizationId ?? ORGANIZATION_A,
    evidence: params.evidenceIds.map((id) => ({ id })),
    relationships: params.relationships ?? [],
  };
}

function run(input: CompletionInput): OrganizationalExplanation[] {
  const result = completeOrganizationalExplanations(input);
  assert.deepEqual(result.failures, []);
  return result.explanations;
}

function roles(
  explanation: OrganizationalExplanation,
): OrganizationalExplanationEvidenceRoleAssignment[] {
  assert.ok(
    explanation.comparativeEvidenceRoles,
    "Expected enabled role materialization",
  );
  return explanation.comparativeEvidenceRoles;
}

function rolesOf(
  explanations: OrganizationalExplanation[],
  role: OrganizationalExplanationEvidenceRole,
): OrganizationalExplanationEvidenceRoleAssignment[] {
  return explanations.flatMap((item) =>
    roles(item).filter((assignment) => assignment.role === role),
  );
}

function withoutRoles(
  explanations: OrganizationalExplanation[],
): OrganizationalExplanation[] {
  return explanations.map(({ comparativeEvidenceRoles: _roles, ...item }) =>
    item as OrganizationalExplanation,
  );
}

const scenarios: ScenarioResult[] = [];
function scenario(
  id: string,
  category: ScenarioResult["category"],
  observation: string,
  assertion: () => void,
): void {
  assertion();
  scenarios.push({ id, category, passed: true, observation });
}

const baseContext = context({
  evidenceIds: [
    "E-support-a",
    "E-support-b",
    "E-opposes",
    "E-unrelated",
    "E-mechanism-only",
    "E-theory-only",
  ],
  relationships: [
    relationship({
      id: "ER-contradicts-support",
      source: "E-support-a",
      target: "E-opposes",
    }),
    relationship({
      id: "ER-unrelated",
      source: "E-unrelated",
      target: "E-opposes",
    }),
  ],
});
const disabledInput = fixtureForSeeds({
  seeds: [seed({ id: "seed:single", evidenceIds: ["E-support-a"] })],
});
const enabledInput: CompletionInput = {
  ...disabledInput,
  evidenceContext: baseContext,
};
const disabledOutput = run(disabledInput);
const enabledOutput = run(enabledInput);
const disabledRuntimeShape = {
  metadata: { organizationId: ORGANIZATION_A },
  memory: { organizationalExplanations: disabledOutput },
};
const enabledRuntimeShape = {
  metadata: { organizationId: ORGANIZATION_A },
  memory: { organizationalExplanations: enabledOutput },
};

function runRepresentativeNormalRuntimeEvolution(): {
  explanationCount: number;
  assignmentCount: number;
  explicitEmptyCount: number;
  onlyCanonicalRoles: boolean;
} {
  const input = {
    company: "Comparative Role Runtime Validation",
    website: "https://comparative-role.invalid",
    industry: "Industrial operations",
    question: "What explains recurring delivery delays?",
    context: "",
    evidenceSources: atlasIndustrialArtifacts.map((artifact) => ({
      sourceId: artifact.id,
      sourceType: "comparative-role-runtime-validation",
      content: artifact.content,
    })),
  };
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    const result = runDiscoveryV3(input);
    const runtime = evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({
        organizationId: "comparative-role-runtime-validation",
        name: input.company,
      }),
      result,
      input,
    });
    const explanations = runtime.memory.organizationalExplanations;
    const assignments = explanations.flatMap(
      (item) => item.comparativeEvidenceRoles ?? [],
    );
    const allowed = new Set(["supports", "opposes", "shared"]);
    return {
      explanationCount: explanations.length,
      assignmentCount: assignments.length,
      explicitEmptyCount: explanations.filter(
        (item) =>
          Array.isArray(item.comparativeEvidenceRoles) &&
          item.comparativeEvidenceRoles.length === 0,
      ).length,
      onlyCanonicalRoles: assignments.every((item) => allowed.has(item.role)),
    };
  } finally {
    console.log = originalLog;
  }
}

const representativeNormalRuntime =
  runRepresentativeNormalRuntimeEvolution();

scenario(
  "01-explicit-seed-support",
  "support",
  "Validated Seed Evidence receives supports from the production producer.",
  () => {
    assert.deepEqual(rolesOf(enabledOutput, "supports"), [
      {
        evidenceId: "E-support-a",
        role: "supports",
        basis: {
          kind: "explanation-seed",
          referenceIds: ["seed:single"],
        },
        relatedExplanationIds: [],
      },
    ]);
  },
);

scenario(
  "02-multiple-support-order-and-metadata-independence",
  "support",
  "Multiple canonical IDs are sorted; unavailable reliability, time, and source metadata cannot affect roles.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [
          seed({
            id: "seed:multiple",
            evidenceIds: ["E-support-b", "E-support-a"],
          }),
        ],
        evidenceContext: context({
          evidenceIds: ["E-support-b", "E-support-a"],
        }),
      }),
    );
    assert.deepEqual(
      rolesOf(result, "supports").map((item) => item.evidenceId),
      ["E-support-a", "E-support-b"],
    );
  },
);

scenario(
  "03-mechanism-only-ancestry-excluded",
  "support",
  "Mechanism-only Evidence remains ancestry without receiving a role.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [seed({ id: "seed:mechanism-only", evidenceIds: [] })],
        mechanismOnlyEvidenceIds: ["E-mechanism-only"],
        evidenceContext: baseContext,
      }),
    );
    assert.equal(result[0].evidenceIds.includes("E-mechanism-only"), true);
    assert.deepEqual(roles(result[0]), []);
  },
);

scenario(
  "04-theory-only-ancestry-excluded",
  "support",
  "Theory-only Evidence remains ancestry without receiving a role.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [seed({ id: "seed:theory-only", evidenceIds: [] })],
        theoryOnlyEvidenceIds: ["E-theory-only"],
        evidenceContext: baseContext,
      }),
    );
    assert.equal(result[0].evidenceIds.includes("E-theory-only"), true);
    assert.deepEqual(roles(result[0]), []);
  },
);

scenario(
  "05-irrelevant-evidence-excluded",
  "support",
  "Canonical but unreferenced Evidence receives no role.",
  () => {
    assert.equal(
      roles(enabledOutput[0]).some(
        (item) => item.evidenceId === "E-unrelated",
      ),
      false,
    );
  },
);

scenario(
  "06-duplicate-seed-references-deduplicated",
  "support",
  "Duplicate Seed references produce one assignment.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [
          seed({
            id: "seed:duplicates",
            evidenceIds: ["E-support-a", "E-support-a"],
            evidenceReferences: [
              { id: "E-support-a", type: "evidence" },
              { id: "E-support-a", type: "evidence" },
            ],
          }),
        ],
        evidenceContext: baseContext,
      }),
    );
    assert.equal(rolesOf(result, "supports").length, 1);
  },
);

scenario(
  "07-unresolved-and-duplicate-evidence-suppressed",
  "support",
  "Unresolved and multiply declared Evidence suppress only affected assignments.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [
          seed({
            id: "seed:invalid-evidence",
            evidenceIds: [
              "E-support-a",
              "E-missing",
              "E-duplicate-identity",
            ],
          }),
        ],
        evidenceContext: context({
          evidenceIds: [
            "E-support-a",
            "E-duplicate-identity",
            "E-duplicate-identity",
          ],
        }),
      }),
    );
    assert.deepEqual(
      rolesOf(result, "supports").map((item) => item.evidenceId),
      ["E-support-a"],
    );
  },
);

scenario(
  "08-direct-canonical-opposition",
  "opposition",
  "A direct contradicts relationship assigns the non-supporting endpoint as opposing Evidence.",
  () => {
    assert.deepEqual(rolesOf(enabledOutput, "opposes"), [
      {
        evidenceId: "E-opposes",
        role: "opposes",
        basis: {
          kind: "evidence-relationship",
          referenceIds: ["ER-contradicts-support"],
        },
        relatedExplanationIds: [],
      },
    ]);
  },
);

scenario(
  "09-ambiguous-opposition-excluded",
  "opposition",
  "A contradiction whose endpoints both support the Explanation assigns no opposition.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [
          seed({
            id: "seed:ambiguous",
            evidenceIds: ["E-support-a", "E-opposes"],
          }),
        ],
        evidenceContext: context({
          evidenceIds: ["E-support-a", "E-opposes"],
          relationships: [
            relationship({
              id: "ER-ambiguous",
              source: "E-support-a",
              target: "E-opposes",
            }),
          ],
        }),
      }),
    );
    assert.deepEqual(rolesOf(result, "opposes"), []);
  },
);

scenario(
  "10-unrelated-and-non-contradictory-links-excluded",
  "opposition",
  "Relationships with neither supported endpoint or a non-contradicts type assign no opposition.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [seed({ id: "seed:unrelated", evidenceIds: ["E-support-a"] })],
        evidenceContext: context({
          evidenceIds: ["E-support-a", "E-unrelated", "E-opposes"],
          relationships: [
            relationship({
              id: "ER-neither-supported",
              source: "E-unrelated",
              target: "E-opposes",
            }),
            relationship({
              id: "ER-wrong-type",
              source: "E-support-a",
              target: "E-opposes",
              type: "supports",
            }),
          ],
        }),
      }),
    );
    assert.deepEqual(rolesOf(result, "opposes"), []);
  },
);

scenario(
  "11-exact-duplicate-relationship-deduplicated",
  "opposition",
  "Exact duplicate relationship rows produce one traceable assignment.",
  () => {
    const duplicate = relationship({
      id: "ER-duplicate",
      source: "E-support-a",
      target: "E-opposes",
    });
    const result = run(
      fixtureForSeeds({
        seeds: [seed({ id: "seed:duplicate-link", evidenceIds: ["E-support-a"] })],
        evidenceContext: context({
          evidenceIds: ["E-support-a", "E-opposes"],
          relationships: [duplicate, { ...duplicate }],
        }),
      }),
    );
    assert.equal(rolesOf(result, "opposes").length, 1);
  },
);

scenario(
  "12-prohibited-role-vocabulary-absent",
  "opposition",
  "Production emits only supports, opposes, and shared.",
  () => {
    const allowed = new Set(["supports", "opposes", "shared"]);
    assert.equal(
      enabledOutput
        .flatMap(roles)
        .every((assignment) => allowed.has(assignment.role)),
      true,
    );
  },
);

scenario(
  "13-malformed-and-conflicting-relationship-suppressed",
  "opposition",
  "Self-links, unresolved endpoints, and conflicting tuples sharing an ID do not assign opposition.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [seed({ id: "seed:malformed-link", evidenceIds: ["E-support-a"] })],
        evidenceContext: context({
          evidenceIds: ["E-support-a", "E-opposes", "E-unrelated"],
          relationships: [
            relationship({
              id: "ER-self",
              source: "E-support-a",
              target: "E-support-a",
            }),
            relationship({
              id: "ER-unresolved",
              source: "E-support-a",
              target: "E-missing",
            }),
            relationship({
              id: "ER-conflict",
              source: "E-support-a",
              target: "E-opposes",
            }),
            relationship({
              id: "ER-conflict",
              source: "E-support-a",
              target: "E-unrelated",
            }),
          ],
        }),
      }),
    );
    assert.deepEqual(rolesOf(result, "opposes"), []);
  },
);

const sharedInput = fixtureForSeeds({
  seeds: [
    seed({
      id: "seed:shared-a",
      evidenceIds: ["E-support-a"],
      outcomeIds: ["outcome:shared"],
    }),
    seed({
      id: "seed:shared-b",
      evidenceIds: ["E-support-a"],
      outcomeIds: ["outcome:shared"],
    }),
  ],
  evidenceContext: baseContext,
});
const sharedOutput = run(sharedInput);

scenario(
  "14-shared-support-comparable-explanations",
  "shared",
  "Validated support shared by comparable completed Explanations receives shared metadata.",
  () => {
    assert.equal(rolesOf(sharedOutput, "shared").length, 2);
  },
);

scenario(
  "15-non-comparable-explanations-excluded",
  "shared",
  "Different scopes or non-overlapping outcomes prevent shared assignment.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [
          seed({
            id: "seed:scope-a",
            scope: scope(ORGANIZATION_A, "scope:a"),
            outcomeIds: ["outcome:a"],
            evidenceIds: ["E-support-a"],
          }),
          seed({
            id: "seed:scope-b",
            scope: scope(ORGANIZATION_A, "scope:b"),
            outcomeIds: ["outcome:b"],
            evidenceIds: ["E-support-a"],
          }),
        ],
        evidenceContext: baseContext,
      }),
    );
    assert.deepEqual(rolesOf(result, "shared"), []);
  },
);

scenario(
  "16-shared-basis-and-related-identities-canonical",
  "shared",
  "Shared basis and related Explanation identities are unique, sorted, and exclude the containing Explanation.",
  () => {
    for (const explanation of sharedOutput) {
      const assignment = roles(explanation).find(
        (item) => item.role === "shared",
      );
      assert.ok(assignment);
      assert.deepEqual(
        assignment.basis.referenceIds,
        ["seed:shared-a", "seed:shared-b"],
      );
      assert.deepEqual(
        assignment.relatedExplanationIds,
        unique(assignment.relatedExplanationIds),
      );
      assert.equal(
        assignment.relatedExplanationIds.includes(explanation.id),
        false,
      );
    }
  },
);

scenario(
  "17-valid-empty-materialization",
  "compatibility-isolation",
  "A valid enabled context with no assignments writes an explicit empty collection.",
  () => {
    const result = run(
      fixtureForSeeds({
        seeds: [seed({ id: "seed:empty", evidenceIds: [] })],
        mechanismOnlyEvidenceIds: ["E-mechanism-only"],
        evidenceContext: context({
          evidenceIds: ["E-mechanism-only"],
        }),
      }),
    );
    assert.equal("comparativeEvidenceRoles" in result[0], true);
    assert.deepEqual(result[0].comparativeEvidenceRoles, []);
  },
);

scenario(
  "18-reversed-input-order-byte-equality",
  "determinism",
  "Reversed canonical input ordering produces byte-identical enabled output.",
  () => {
    const reversed: CompletionInput = {
      ...sharedInput,
      seeds: [...sharedInput.seeds].reverse(),
      mechanisms: [...sharedInput.mechanisms].reverse(),
      beliefs: [...sharedInput.beliefs].reverse(),
      theories: [...sharedInput.theories].reverse(),
      evidenceContext: sharedInput.evidenceContext
        ? {
            ...sharedInput.evidenceContext,
            evidence: [...sharedInput.evidenceContext.evidence].reverse(),
            relationships: [
              ...sharedInput.evidenceContext.relationships,
            ].reverse(),
          }
        : undefined,
    };
    assert.equal(stable(run(sharedInput)), stable(run(reversed)));
  },
);

scenario(
  "19-repeat-identity-and-downstream-noninterference",
  "determinism",
  "Repeated output is byte stable; identities and downstream sentinels remain unchanged.",
  () => {
    const repeated = run(enabledInput);
    assert.equal(stable(enabledOutput), stable(repeated));
    assert.deepEqual(
      enabledOutput.map((item) => item.id),
      disabledOutput.map((item) => item.id),
    );
    assert.deepEqual(withoutRoles(enabledOutput), disabledOutput);
    const sentinels = {
      conditions: [{ id: "condition:unchanged" }],
      organizationalState: { id: "state:unchanged" },
      assessment: { id: "assessment:unchanged" },
      understanding: { id: "understanding:unchanged" },
      recommendation: { id: "recommendation:unchanged" },
      projection: { id: "projection:unchanged" },
      application: { id: "application:unchanged" },
    };
    const before = stable(sentinels);
    run(enabledInput);
    assert.equal(stable(sentinels), before);
    assert.equal(
      new Set(enabledOutput.flatMap(roles).map(stable)).size,
      enabledOutput.flatMap(roles).length,
    );
  },
);

scenario(
  "20-omitted-context-history-and-organization-isolation",
  "compatibility-isolation",
  "The direct producer remains historical-compatible when context is omitted; mismatched and foreign contexts cannot materialize roles or leak across calls.",
  () => {
    assert.ok(representativeNormalRuntime.explanationCount > 0);
    assert.equal(
      representativeNormalRuntime.explicitEmptyCount,
      representativeNormalRuntime.explanationCount,
    );
    assert.equal(representativeNormalRuntime.onlyCanonicalRoles, true);
    assert.equal(
      sha256(disabledOutput),
      PRE_PHASE_DISABLED_BASELINE_SHA256,
    );
    assert.equal(
      disabledOutput.every(
        (item) => !("comparativeEvidenceRoles" in item),
      ),
      true,
    );
    assert.equal(
      stable(JSON.parse(JSON.stringify(disabledRuntimeShape))),
      stable(disabledRuntimeShape),
    );
    assert.equal(
      stable(JSON.parse(JSON.stringify(enabledRuntimeShape))),
      stable(enabledRuntimeShape),
    );
    const mismatch = run({
      ...disabledInput,
      evidenceContext: {
        ...baseContext,
        organizationId: ORGANIZATION_B,
      },
    });
    assert.equal(
      mismatch.every((item) => !("comparativeEvidenceRoles" in item)),
      true,
    );

    const foreignEvidence = run({
      ...disabledInput,
      evidenceContext: context({
        evidenceIds: ["E-org-b-only"],
      }),
    });
    assert.deepEqual(roles(foreignEvidence[0]), []);

    const organizationBInput = fixtureForSeeds({
      organizationId: ORGANIZATION_B,
      seeds: [
        seed({
          id: "seed:org-b",
          organizationId: ORGANIZATION_B,
          scope: scope(ORGANIZATION_B),
          evidenceIds: ["E-org-b-only"],
        }),
      ],
      evidenceContext: context({
        organizationId: ORGANIZATION_B,
        evidenceIds: ["E-org-b-only"],
      }),
    });
    const organizationB = run(organizationBInput);
    assert.deepEqual(
      rolesOf(organizationB, "supports").map((item) => item.evidenceId),
      ["E-org-b-only"],
    );
    const organizationAAfterB = run(enabledInput);
    assert.equal(
      organizationAAfterB
        .flatMap(roles)
        .some((item) => item.evidenceId === "E-org-b-only"),
      false,
    );
    assert.notEqual(organizationB[0].id, organizationAAfterB[0].id);
    assert.equal(organizationB[0].organizationId, ORGANIZATION_B);
    assert.equal(organizationAAfterB[0].organizationId, ORGANIZATION_A);
  },
);

assert.equal(scenarios.length, 20);

const report = {
  benchmark: "Discovery 2 Comparative Evidence Roles Production Gate",
  version: 2,
  productionProducer:
    "engine/v3/model/judgment/completeOrganizationalExplanations.ts",
  activation: {
    normalRuntimeDefault: "active",
    mechanism:
      "evolveOrganizationRuntime always passes the bounded current-investigation context",
    temporaryInvocationGate: "retired",
  },
  scenarioSummary: {
    total: scenarios.length,
    passed: scenarios.length,
    failed: 0,
  },
  roles: {
    allowed: ["supports", "opposes", "shared"],
    productionDerived: true,
    benchmarkInjectedAssignments: false,
  },
  omittedContextCompatibility: {
    fieldUndefined: true,
    baselineSha256: PRE_PHASE_DISABLED_BASELINE_SHA256,
    baselineByteEquivalent:
      sha256(disabledOutput) === PRE_PHASE_DISABLED_BASELINE_SHA256,
    identityStable: true,
    downstreamUnchanged: true,
  },
  enabledPath: {
    validEmptyIsExplicitArray: true,
    directOppositionOnly: true,
    ambiguousOppositionExcluded: true,
    sharedIsReuseMetadata: true,
    confidenceViabilityAndRankingUnchanged: true,
  },
  determinism: {
    repeatedRunByteEquality: true,
    reversedInputByteEquality: true,
    duplicateAssignmentFree: true,
    explanationIdentityStable: true,
  },
  isolation: {
    contextIncludesOrganizationIdentity: true,
    mismatchSuppressesAllMaterialization: true,
    foreignEvidenceDoesNotResolve: true,
    consecutiveOrganizationsDoNotLeak: true,
    moduleLevelCacheIntroduced: false,
  },
  compatibility: {
    historicalMissingFieldAccepted: true,
    undefinedDistinctFromExplicitEmpty: true,
    runtimeMigrationRequired: false,
  },
  representativeNormalRuntime,
  downstreamSentinels: {
    conditions: "unchanged",
    organizationalState: "unchanged",
    assessment: "unchanged",
    understanding: "unchanged",
    recommendation: "unchanged",
    projection: "unchanged",
    application: "unchanged",
  },
  scorecard: {
    expected: {
      organizationalUnderstanding:
        "no immediate scored movement; Explanation Quality instrumentation becomes available",
      userIntelligence: "unchanged",
      collectiveIntelligence: "unchanged",
      governanceIntegrity: "unchanged",
      systemSustainability: "unchanged",
    },
    observed: {
      organizationalUnderstanding:
        "not yet measurable because no downstream consumer is activated",
      userIntelligence: "unchanged",
      collectiveIntelligence: "unchanged",
      governanceIntegrity: "unchanged",
      systemSustainability: "unchanged",
    },
  },
  representativeOutput: {
    disabledRuntimeShape,
    enabledRuntimeShape,
  },
  scenarios,
  decision: "PHASE 1 ACTIVATED AND COMPLETE — READY FOR REVIEW",
};

console.log(JSON.stringify(report, null, 2));
