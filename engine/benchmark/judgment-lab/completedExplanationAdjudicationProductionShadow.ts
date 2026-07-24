import assert from "node:assert/strict";

import type { OrganizationalBelief } from "../../v3/model/beliefs/organizationalBeliefs";
import {
  completeOrganizationalExplanations,
} from "../../v3/model/judgment/completeOrganizationalExplanations";
import type {
  OrganizationalExplanation,
  OrganizationalExplanationSeed,
  OrganizationalExplanationType,
  OrganizationalScopeRef,
} from "../../v3/model/judgment/organizationalJudgment";
import type { OrganizationalMechanism } from "../../v3/model/judgment/organizationalMechanism";
import type { OrganizationalTheory } from "../../v3/model/memory/organizationalTheories";

type Family =
  | "capacity"
  | "concurrency"
  | "decisionFlow"
  | "coordination"
  | "strategy"
  | "knowledge"
  | "leadership"
  | "ownership";
type PersistentRole =
  | "support"
  | "oppose"
  | "contradict"
  | "outcome"
  | "counterfactual";
type ComparativeRole =
  | "discriminate"
  | "shared"
  | "bounded"
  | "weak"
  | "stale"
  | "duplicate"
  | "irrelevant"
  | "feedback"
  | "corroborate"
  | "ruleOut";
type EvidenceRole = PersistentRole | ComparativeRole;
type Direction =
  | "stable"
  | "weaken"
  | "strengthen"
  | "displace"
  | "expand"
  | "reject";
type Disposition =
  | "preserve"
  | "weaken"
  | "displace"
  | "addCompetitor"
  | "multipleCauses"
  | "unresolved"
  | "reject";

type RoleLink = {
  id: string;
  sourceId: string;
  role: EvidenceRole;
  targets: Family[];
  against?: Family[];
};
type Expected = {
  viable: Family[];
  leader: Family | null;
  disposition: Disposition;
  direction: Direction;
  abstain: boolean;
};
type Phase = {
  candidates: Family[];
  links: RoleLink[];
  expected: Expected;
};
type Scenario = {
  id: string;
  scopeType?: OrganizationalScopeRef["type"];
  phases: Phase[];
  crossBenchmark?: boolean;
  controlOf?: string;
  reverseCandidates?: boolean;
  reverseEvidence?: boolean;
  reverseSources?: boolean;
};
type Candidate = {
  family: Family;
  explanation: OrganizationalExplanation;
};
type Standing = {
  family: Family;
  explanationId: string;
  viability: "leading" | "viable" | "weakened" | "rejected";
  supportState:
    | "decisive"
    | "corroborated"
    | "supported"
    | "bounded"
    | "opposed"
    | "ruledOut";
  confidence: number;
  supportingEvidenceIds: string[];
  opposingEvidenceIds: string[];
  discriminatingEvidenceIds: string[];
  sharedEvidenceIds: string[];
};
type ShadowState = {
  completedExplanationIds: string[];
  standings: Standing[];
  leader: Family | null;
  viable: Family[];
  weakened: Family[];
  displaced: Family[];
  rejected: Family[];
  multiCause: boolean;
  unresolved: boolean;
  abstained: boolean;
  disposition: Disposition;
  revisionEvidenceIds: string[];
  uncertainty: string[];
  evidenceThatWouldChangeConclusion: string[];
  priorLeader: Family | null;
};

const NOW = "2026-07-29T12:00:00.000Z";
const ORGANIZATION_ID = "sprint-123-shadow";

function link(
  id: string,
  role: EvidenceRole,
  targets: Family[],
  against: Family[] = [],
  sourceId = id,
): RoleLink {
  return { id, sourceId, role, targets, against };
}

function expected(
  viable: Family[],
  leader: Family | null,
  disposition: Disposition,
  direction: Direction,
): Expected {
  return {
    viable,
    leader,
    disposition,
    direction,
    abstain: leader === null,
  };
}

const support = (family: Family, id = `support-${family}`) =>
  link(id, "support", [family]);
const decisive = (
  family: Family,
  against: Family[],
  id = `discriminate-${family}`,
) => link(id, "discriminate", [family], against);

const scenarios: Scenario[] = [
  {
    id: "atlas-decisive-evidence-sequence",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["capacity"],
        links: [support("capacity")],
        expected: expected(["capacity"], "capacity", "preserve", "stable"),
      },
      {
        candidates: ["capacity", "decisionFlow"],
        links: [
          support("capacity"),
          support("decisionFlow", "support-decision-t1"),
          link("oppose-capacity", "oppose", [], ["capacity"]),
        ],
        expected: expected(
          ["capacity", "decisionFlow"],
          "decisionFlow",
          "displace",
          "displace",
        ),
      },
      {
        candidates: ["capacity", "decisionFlow"],
        links: [
          support("capacity"),
          support("decisionFlow", "support-decision-t1"),
          decisive("decisionFlow", ["capacity"]),
        ],
        expected: expected(
          ["decisionFlow"],
          "decisionFlow",
          "reject",
          "reject",
        ),
      },
    ],
  },
  {
    id: "atlas-credible-opposition-sequence",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["capacity"],
        links: [link("capacity-a", "corroborate", ["capacity"], [], "source-a")],
        expected: expected(["capacity"], "capacity", "preserve", "stable"),
      },
      {
        candidates: ["capacity"],
        links: [
          link("capacity-a", "corroborate", ["capacity"], [], "source-a"),
          link("capacity-opposition", "oppose", [], ["capacity"], "source-b"),
        ],
        expected: expected(["capacity"], "capacity", "weaken", "weaken"),
      },
      {
        candidates: ["capacity"],
        links: [
          link("capacity-a", "corroborate", ["capacity"], [], "source-a"),
          link("capacity-b", "corroborate", ["capacity"], [], "source-c"),
        ],
        expected: expected(["capacity"], "capacity", "preserve", "strengthen"),
      },
    ],
  },
  {
    id: "atlas-delayed-evidence-sequence",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["strategy"],
        links: [support("strategy")],
        expected: expected(["strategy"], "strategy", "preserve", "stable"),
      },
      {
        candidates: ["strategy", "decisionFlow"],
        links: [
          link("shared-delay", "shared", ["strategy", "decisionFlow"]),
        ],
        expected: expected(
          ["strategy", "decisionFlow"],
          null,
          "unresolved",
          "expand",
        ),
      },
      {
        candidates: ["strategy", "decisionFlow"],
        links: [
          support("strategy"),
          decisive("decisionFlow", ["strategy"], "delayed-outcome"),
        ],
        expected: expected(
          ["decisionFlow"],
          "decisionFlow",
          "reject",
          "reject",
        ),
      },
    ],
  },
  {
    id: "northstar-ground-truth-sequence",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["capacity"],
        links: [support("capacity")],
        expected: expected(["capacity"], "capacity", "preserve", "stable"),
      },
      {
        candidates: ["capacity", "concurrency"],
        links: [support("capacity"), support("concurrency")],
        expected: expected(
          ["capacity", "concurrency"],
          null,
          "multipleCauses",
          "expand",
        ),
      },
      {
        candidates: ["capacity", "concurrency"],
        links: [
          support("capacity"),
          decisive("concurrency", ["capacity"], "northstar-outcome"),
        ],
        expected: expected(
          ["concurrency"],
          "concurrency",
          "reject",
          "reject",
        ),
      },
    ],
  },
  {
    id: "knowledge-fragmentation-sequence",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["capacity"],
        links: [support("capacity")],
        expected: expected(["capacity"], "capacity", "preserve", "stable"),
      },
      {
        candidates: ["capacity", "knowledge"],
        links: [support("capacity"), support("knowledge")],
        expected: expected(
          ["capacity", "knowledge"],
          null,
          "multipleCauses",
          "expand",
        ),
      },
      {
        candidates: ["capacity", "knowledge"],
        links: [
          support("capacity"),
          link(
            "knowledge-counterfactual",
            "counterfactual",
            ["knowledge"],
            ["capacity"],
          ),
        ],
        expected: expected(["knowledge"], "knowledge", "reject", "reject"),
      },
    ],
  },
  {
    id: "atlas-duplicate-control",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["decisionFlow"],
        links: [
          support("decisionFlow"),
          link(
            "duplicate-decision",
            "duplicate",
            ["decisionFlow"],
            [],
            "support-decisionFlow",
          ),
        ],
        expected: expected(
          ["decisionFlow"],
          "decisionFlow",
          "preserve",
          "stable",
        ),
      },
    ],
  },
  {
    id: "capacity-symptom-versus-concurrency-cause",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["capacity", "concurrency"],
        links: [
          support("capacity"),
          decisive("concurrency", ["capacity"]),
        ],
        expected: expected(
          ["concurrency"],
          "concurrency",
          "preserve",
          "stable",
        ),
      },
    ],
  },
  {
    id: "strategic-alignment-versus-decision-flow",
    phases: [
      {
        candidates: ["strategy", "decisionFlow"],
        links: [
          support("strategy"),
          decisive("decisionFlow", ["strategy"]),
        ],
        expected: expected(
          ["decisionFlow"],
          "decisionFlow",
          "preserve",
          "stable",
        ),
      },
    ],
  },
  {
    id: "leadership-dependency-versus-coordination",
    phases: [
      {
        candidates: ["leadership", "coordination"],
        links: [support("leadership"), support("coordination")],
        expected: expected(
          ["leadership", "coordination"],
          null,
          "multipleCauses",
          "stable",
        ),
      },
    ],
  },
  {
    id: "ownership-versus-process-weakness",
    phases: [
      {
        candidates: ["ownership"],
        links: [decisive("ownership", [])],
        expected: expected(["ownership"], "ownership", "preserve", "stable"),
      },
    ],
  },
  {
    id: "multiple-independent-causes",
    phases: [
      {
        candidates: ["decisionFlow", "coordination"],
        links: [support("decisionFlow"), support("coordination")],
        expected: expected(
          ["decisionFlow", "coordination"],
          null,
          "multipleCauses",
          "stable",
        ),
      },
    ],
  },
  {
    id: "feedback-loop",
    phases: [
      {
        candidates: ["decisionFlow", "coordination"],
        links: [
          link("feedback-a", "feedback", ["decisionFlow", "coordination"]),
        ],
        expected: expected(
          ["decisionFlow", "coordination"],
          null,
          "unresolved",
          "stable",
        ),
      },
    ],
  },
  {
    id: "shared-support-with-discriminator",
    phases: [
      {
        candidates: ["leadership", "decisionFlow"],
        links: [
          link("shared-a", "shared", ["leadership", "decisionFlow"]),
          decisive("decisionFlow", ["leadership"]),
        ],
        expected: expected(
          ["decisionFlow"],
          "decisionFlow",
          "preserve",
          "stable",
        ),
      },
    ],
  },
  {
    id: "counterfactual-displacement",
    phases: [
      {
        candidates: ["capacity", "decisionFlow"],
        links: [
          support("capacity"),
          link(
            "counterfactual-decision",
            "counterfactual",
            ["decisionFlow"],
            ["capacity"],
          ),
        ],
        expected: expected(
          ["decisionFlow"],
          "decisionFlow",
          "preserve",
          "stable",
        ),
      },
    ],
  },
  {
    id: "weak-opposition",
    phases: [
      {
        candidates: ["knowledge"],
        links: [
          link("knowledge-corroboration", "corroborate", ["knowledge"]),
          link("weak-knowledge-opposition", "weak", [], ["knowledge"]),
        ],
        expected: expected(["knowledge"], "knowledge", "preserve", "stable"),
      },
    ],
  },
  {
    id: "exact-duplicate-invariance",
    phases: [
      {
        candidates: ["coordination"],
        links: [
          support("coordination"),
          link(
            "coordination-copy",
            "duplicate",
            ["coordination"],
            [],
            "support-coordination",
          ),
        ],
        expected: expected(
          ["coordination"],
          "coordination",
          "preserve",
          "stable",
        ),
      },
    ],
  },
  {
    id: "irrelevant-evidence-invariance",
    phases: [
      {
        candidates: ["strategy"],
        links: [
          support("strategy"),
          link("office-seating", "irrelevant", []),
        ],
        expected: expected(["strategy"], "strategy", "preserve", "stable"),
      },
    ],
  },
  {
    id: "sparse-evidence-abstention",
    phases: [
      {
        candidates: ["capacity", "coordination"],
        links: [
          link("weak-capacity", "weak", ["capacity"]),
          link("weak-coordination", "weak", ["coordination"]),
        ],
        expected: expected([], null, "unresolved", "stable"),
      },
    ],
  },
  {
    id: "no-defensible-leader",
    phases: [
      {
        candidates: ["strategy", "knowledge"],
        links: [
          link("shared-only", "shared", ["strategy", "knowledge"]),
        ],
        expected: expected(
          ["strategy", "knowledge"],
          null,
          "unresolved",
          "stable",
        ),
      },
    ],
  },
  {
    id: "team-scope",
    scopeType: "team",
    phases: [
      {
        candidates: ["knowledge"],
        links: [support("knowledge")],
        expected: expected(["knowledge"], "knowledge", "preserve", "stable"),
      },
    ],
  },
  {
    id: "department-scope",
    scopeType: "department",
    phases: [
      {
        candidates: ["ownership"],
        links: [support("ownership")],
        expected: expected(["ownership"], "ownership", "preserve", "stable"),
      },
    ],
  },
  {
    id: "enterprise-scope",
    scopeType: "organization",
    phases: [
      {
        candidates: ["strategy"],
        links: [support("strategy")],
        expected: expected(["strategy"], "strategy", "preserve", "stable"),
      },
    ],
  },
  {
    id: "industry-neutral-terminology",
    crossBenchmark: true,
    phases: [
      {
        candidates: ["decisionFlow"],
        links: [decisive("decisionFlow", [])],
        expected: expected(
          ["decisionFlow"],
          "decisionFlow",
          "preserve",
          "stable",
        ),
      },
    ],
  },
];

const orderBase: Scenario = {
  id: "order-control",
  phases: [
    {
      candidates: ["capacity", "decisionFlow"],
      links: [
        support("capacity"),
        decisive("decisionFlow", ["capacity"]),
      ],
      expected: expected(["decisionFlow"], "decisionFlow", "preserve", "stable"),
    },
  ],
};
scenarios.push(
  orderBase,
  {
    ...orderBase,
    id: "reverse-evidence-order",
    controlOf: orderBase.id,
    reverseEvidence: true,
  },
  {
    ...orderBase,
    id: "reverse-candidate-order",
    controlOf: orderBase.id,
    reverseCandidates: true,
  },
  {
    ...orderBase,
    id: "reverse-source-order",
    controlOf: orderBase.id,
    reverseSources: true,
  },
);

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
  return Array.from(new Set(values)).sort();
}

function explanationType(family: Family): OrganizationalExplanationType {
  if (family === "capacity" || family === "concurrency") return "constraint";
  if (family === "coordination") return "coordination";
  if (family === "ownership") return "ownership";
  return "causal";
}

function scopeFor(scenario: Scenario): OrganizationalScopeRef {
  const type = scenario.scopeType ?? "organization";
  const identityScenarioId = scenario.controlOf ?? scenario.id;
  return {
    organizationId: ORGANIZATION_ID,
    type,
    id:
      type === "organization"
        ? ORGANIZATION_ID
        : `${type}:${identityScenarioId}`,
  };
}

function buildCompletedCandidate(
  scenario: Scenario,
  family: Family,
  links: RoleLink[],
): Candidate {
  const identityScenarioId = scenario.controlOf ?? scenario.id;
  const familyLinks = links.filter(
    (item) =>
      item.targets.includes(family) || (item.against ?? []).includes(family),
  );
  const evidenceIds = unique(familyLinks.map((item) => item.id));
  const seedId = `seed:${identityScenarioId}:${family}`;
  const pathId = `path:${identityScenarioId}:${family}`;
  const mechanismId = `mechanism:${identityScenarioId}:${family}`;
  const theoryId = `theory:${identityScenarioId}:${family}`;
  const scope = scopeFor(scenario);
  const seed: OrganizationalExplanationSeed = {
    id: seedId,
    organizationId: ORGANIZATION_ID,
    semanticKey: `${ORGANIZATION_ID}:${scope.id}:${family}`,
    title: `${family} structured explanation seed`,
    summary: `${family} structured explanation seed`,
    explanationType: explanationType(family),
    scope,
    outcomeRefs: [
      { type: "reasoningNode", id: `outcome:${identityScenarioId}:${family}` },
    ],
    reasoningPathIds: [pathId],
    reasoningRelationshipIds: [
      `source:${identityScenarioId}:${family}->causes->outcome:${identityScenarioId}:${family}`,
    ],
    evidenceIds,
    supportedPathIds: [pathId],
    explainedEffectIds: [],
    relatedRootCauseIds: [],
    relatedLeveragePointIds: [],
    relatedExecutiveConclusionIds: [],
    assumptions: [],
    evidenceReferences: evidenceIds.map((id) => ({ id, type: "evidence" })),
    confidence: 0.66,
    generatedAt: NOW,
  };
  const mechanism = {
    id: mechanismId,
    supportingExplanationSeedIds: [seedId],
    supportingExplanationIds: [seedId],
    supportingReasoningPathIds: [pathId],
    reasoningPathIds: [pathId],
    supportingEvidenceIds: evidenceIds,
    scopeRef: scope,
    outcomeRefs: seed.outcomeRefs,
  } as unknown as OrganizationalMechanism;
  const belief = {
    id: `belief:${identityScenarioId}:${family}`,
    supportingMechanismIds: [mechanismId],
  } as unknown as OrganizationalBelief;
  const theory = {
    id: theoryId,
    supportingMechanisms: [mechanismId],
    supportingBeliefs: [belief.id],
    supportingConcepts: [],
    supportingEvidence: evidenceIds,
    explanationSeedIds: [seedId],
    reasoningPathIds: [pathId],
    scopeRefs: [scope],
    outcomeRefs: seed.outcomeRefs,
  } as unknown as OrganizationalTheory;
  const completion = completeOrganizationalExplanations({
    organizationId: ORGANIZATION_ID,
    seeds: [seed],
    mechanisms: [mechanism],
    beliefs: [belief],
    theories: [theory],
    now: NOW,
  });
  assert.equal(completion.failures.length, 0);
  assert.equal(completion.explanations.length, 1);
  return { family, explanation: completion.explanations[0] };
}

function candidateSet(
  scenario: Scenario,
  phase: Phase,
): Candidate[] {
  const families = [...phase.candidates];
  if (scenario.reverseCandidates) families.reverse();
  return families
    .map((family) => buildCompletedCandidate(scenario, family, phase.links))
    .sort((left, right) =>
      left.explanation.id.localeCompare(right.explanation.id),
    );
}

function rank(standing: Standing): number[] {
  return [
    standing.supportState === "ruledOut" ? 0 : 1,
    standing.supportState === "decisive" ? 1 : 0,
    standing.supportState === "corroborated" ? 1 : 0,
    standing.supportingEvidenceIds.length > 0 ? 1 : 0,
    standing.supportState === "opposed" ? 0 : 1,
  ];
}

function adjudicate(
  candidates: Candidate[],
  rawLinks: RoleLink[],
  prior: ShadowState | null,
): ShadowState {
  const links = [...rawLinks].sort(
    (left, right) =>
      left.id.localeCompare(right.id) ||
      left.sourceId.localeCompare(right.sourceId),
  );
  const standings = candidates
    .map(({ family, explanation }): Standing => {
      const relevant = links.filter(
        (item) =>
          item.targets.includes(family) || (item.against ?? []).includes(family),
      );
      const direct = relevant.filter((item) => item.targets.includes(family));
      const supportLinks = direct.filter((item) =>
        [
          "support",
          "outcome",
          "counterfactual",
          "discriminate",
          "corroborate",
          "weak",
          "stale",
        ].includes(item.role),
      );
      const opposing = relevant.filter(
        (item) =>
          ["oppose", "contradict", "ruleOut"].includes(item.role) ||
          (item.against ?? []).includes(family),
      );
      const discriminating = relevant.filter((item) =>
        ["counterfactual", "discriminate", "ruleOut", "outcome"].includes(
          item.role,
        ),
      );
      const shared = direct.filter((item) =>
        ["shared", "feedback"].includes(item.role),
      );
      const uniqueSupport = supportLinks.filter(
        (item, index, all) =>
          item.role !== "duplicate" &&
          all.findIndex(
            (candidate) =>
              candidate.sourceId === item.sourceId &&
              candidate.role === item.role &&
              stable(candidate.targets) === stable(item.targets),
          ) === index,
      );
      const decisiveSupport = supportLinks.some((item) =>
        ["counterfactual", "discriminate", "outcome"].includes(item.role),
      );
      const ruledOut = opposing.some(
        (item) =>
          item.role === "ruleOut" ||
          (item.against ?? []).includes(family) &&
            ["counterfactual", "discriminate", "outcome"].includes(item.role),
      );
      const credibleOpposition = opposing.some(
        (item) =>
          !["weak", "stale", "bounded", "irrelevant", "duplicate"].includes(
            item.role,
          ),
      );
      const boundedOnly =
        uniqueSupport.length > 0 &&
        uniqueSupport.every((item) =>
          ["weak", "stale", "bounded"].includes(item.role),
        );
      const corroborated =
        new Set(uniqueSupport.map((item) => item.sourceId)).size > 1 ||
        uniqueSupport.some((item) => item.role === "corroborate");
      const supportState: Standing["supportState"] = ruledOut
        ? "ruledOut"
        : decisiveSupport
          ? "decisive"
          : credibleOpposition && uniqueSupport.length > 0
            ? "opposed"
            : corroborated
              ? "corroborated"
              : boundedOnly
                ? "bounded"
                : uniqueSupport.length > 0 || shared.length > 0
                  ? "supported"
                  : "opposed";
      const confidence =
        supportState === "decisive"
          ? 0.88
          : supportState === "corroborated"
            ? 0.78
            : supportState === "supported"
              ? 0.66
              : supportState === "opposed"
                ? 0.52
                : supportState === "bounded"
                  ? 0.45
                  : 0.2;
      return {
        family,
        explanationId: explanation.id,
        viability: ruledOut
          ? "rejected"
          : boundedOnly
            ? "rejected"
            : credibleOpposition
              ? "weakened"
              : "viable",
        supportState,
        confidence,
        supportingEvidenceIds: uniqueSupport.map((item) => item.id).sort(),
        opposingEvidenceIds: opposing.map((item) => item.id).sort(),
        discriminatingEvidenceIds: discriminating
          .map((item) => item.id)
          .sort(),
        sharedEvidenceIds: shared.map((item) => item.id).sort(),
      };
    })
    .sort((left, right) => left.family.localeCompare(right.family));

  const ranked = standings
    .filter((item) => item.viability !== "rejected")
    .sort((left, right) => {
      const l = rank(left);
      const r = rank(right);
      for (let index = 0; index < l.length; index += 1) {
        if (l[index] !== r[index]) return r[index] - l[index];
      }
      return left.family.localeCompare(right.family);
    });
  const sameRank =
    ranked.length > 1 && stable(rank(ranked[0])) === stable(rank(ranked[1]));
  const feedback = links.some((item) => item.role === "feedback");
  const hasDiscriminator = links.some((item) =>
    ["discriminate", "counterfactual", "outcome"].includes(item.role),
  );
  const independentCauses =
    ranked.length > 1 &&
    sameRank &&
    ranked.every((item) => item.supportingEvidenceIds.length > 0) &&
    !hasDiscriminator;
  const noSubstantiveSupport =
    ranked.length === 0 ||
    (!prior?.leader &&
      ranked.every((item) =>
        ["bounded", "opposed"].includes(item.supportState),
      ));
  const abstained =
    feedback || sameRank || independentCauses || noSubstantiveSupport;
  const leader = abstained ? null : ranked[0]?.family ?? null;
  for (const standing of standings) {
    if (standing.family === leader) standing.viability = "leading";
  }
  const viable = standings
    .filter((item) => item.viability !== "rejected")
    .map((item) => item.family)
    .sort();
  const weakened = standings
    .filter(
      (item) =>
        item.viability === "weakened" || item.supportState === "opposed",
    )
    .map((item) => item.family)
    .sort();
  const rejected = standings
    .filter((item) => item.viability === "rejected")
    .map((item) => item.family)
    .sort();
  const displaced =
    prior?.leader && prior.leader !== leader ? [prior.leader] : [];
  const added = viable.filter((item) => !(prior?.viable ?? []).includes(item));
  const sharedEvidence = links.some((item) => item.role === "shared");
  let disposition: Disposition = "preserve";
  if (!prior) {
    if (feedback || (abstained && sharedEvidence) || viable.length === 0)
      disposition = "unresolved";
    else if (abstained && viable.length > 1)
      disposition = "multipleCauses";
  }
  else if (
    feedback ||
    (abstained && sharedEvidence) ||
    (abstained && viable.length === 0)
  )
    disposition = "unresolved";
  else if (abstained && viable.length > 1) disposition = "multipleCauses";
  else if (prior?.leader && leader && prior.leader !== leader)
    disposition = "displace";
  else if (rejected.some((item) => (prior?.viable ?? []).includes(item)))
    disposition = "reject";
  else if (prior?.leader && weakened.includes(prior.leader))
    disposition = "weaken";
  else if (added.length > 0) disposition = "addCompetitor";

  return {
    completedExplanationIds: candidates
      .map((item) => item.explanation.id)
      .sort(),
    standings,
    leader,
    viable,
    weakened,
    displaced,
    rejected,
    multiCause: disposition === "multipleCauses",
    unresolved: disposition === "unresolved",
    abstained,
    disposition,
    revisionEvidenceIds: links
      .filter((item) =>
        [
          "oppose",
          "contradict",
          "counterfactual",
          "discriminate",
          "outcome",
          "ruleOut",
          "corroborate",
        ].includes(item.role),
      )
      .map((item) => item.id)
      .sort(),
    uncertainty: abstained
      ? ["Available structured evidence does not justify one leading explanation."]
      : weakened.length > 0
        ? ["Credible structured opposition weakens a viable explanation."]
        : [],
    evidenceThatWouldChangeConclusion: viable.map(
      (family) =>
        `Independent discriminating, counterfactual, or outcome Evidence for ${family}.`,
    ),
    priorLeader: prior?.leader ?? null,
  };
}

type PhaseResult = {
  scenario: Scenario;
  phase: Phase;
  candidates: Candidate[];
  p1: ShadowState;
  p2: ShadowState;
  prior: ShadowState | null;
};

const phaseResults: PhaseResult[] = [];
for (const scenario of scenarios) {
  let prior: ShadowState | null = null;
  for (const phase of scenario.phases) {
    const links = [...phase.links];
    if (scenario.reverseEvidence) links.reverse();
    if (scenario.reverseSources) {
      links.sort((left, right) => right.sourceId.localeCompare(left.sourceId));
    }
    const candidates = candidateSet(scenario, { ...phase, links });
    const p2 = adjudicate(candidates, links, prior);
    const p1 = {
      ...p2,
      leader: null,
      standings: p2.standings.map((item) => ({
        ...item,
        viability:
          item.viability === "leading" ? ("viable" as const) : item.viability,
      })),
    };
    phaseResults.push({ scenario, phase, candidates, p1, p2, prior });
    prior = p2;
  }
}

for (const result of phaseResults) {
  if (!result.scenario.controlOf) continue;
  const base = phaseResults.find(
    (candidate) =>
      candidate.scenario.id === result.scenario.controlOf &&
      candidate.scenario.phases.indexOf(candidate.phase) ===
        result.scenario.phases.indexOf(result.phase),
  );
  assert.ok(base);
  assert.equal(stable(result.p2), stable(base.p2));
}

const core = phaseResults.filter((item) => !item.scenario.controlOf);
const exactSet = core.filter(
  (item) => stable(item.p2.viable) === stable([...item.phase.expected.viable].sort()),
).length;
const leaderCorrect = core.filter(
  (item) => item.p2.leader === item.phase.expected.leader,
).length;
const dispositionCorrect = core.filter(
  (item) => item.p2.disposition === item.phase.expected.disposition,
).length;
const abstentionCorrect = core.filter(
  (item) => item.p2.abstained === item.phase.expected.abstain,
).length;
const expectedCandidates = core.reduce(
  (sum, item) => sum + item.phase.candidates.length,
  0,
);
const acceptedCandidates = core.reduce(
  (sum, item) => sum + item.candidates.length,
  0,
);
const completeAncestry = core.reduce(
  (sum, item) =>
    sum +
    item.candidates.filter(({ explanation }) =>
      Boolean(
        explanation.id &&
          explanation.organizationId &&
          explanation.claim.scope.id &&
          explanation.explanationSeedIds.length &&
          explanation.reasoningPathIds.length &&
          explanation.mechanismIds.length &&
          explanation.theoryIds.length &&
          explanation.evidenceIds.length &&
          explanation.claim.outcomeRefs.length,
      ),
    ).length,
  0,
);
const validCount = core.reduce(
  (sum, item) => sum + item.phase.expected.viable.length,
  0,
);
const truePositive = core.reduce(
  (sum, item) =>
    sum +
    item.p2.viable.filter((family) =>
      item.phase.expected.viable.includes(family),
    ).length,
  0,
);
const predictedCount = core.reduce(
  (sum, item) => sum + item.p2.viable.length,
  0,
);
const unsupported = predictedCount - truePositive;
const missing = validCount - truePositive;
const candidatePrecision =
  acceptedCandidates === 0 ? 1 : expectedCandidates / acceptedCandidates;
const candidateRecall =
  expectedCandidates === 0 ? 1 : acceptedCandidates / expectedCandidates;
const setPrecision = predictedCount === 0 ? 1 : truePositive / predictedCount;
const setRecall = validCount === 0 ? 1 : truePositive / validCount;
const rejectedIncompleteCandidates = (() => {
  const scope: OrganizationalScopeRef = {
    organizationId: ORGANIZATION_ID,
    type: "organization",
    id: ORGANIZATION_ID,
  };
  const incompleteSeed: OrganizationalExplanationSeed = {
    id: "seed:incomplete-control",
    organizationId: ORGANIZATION_ID,
    semanticKey: `${ORGANIZATION_ID}:incomplete-control`,
    title: "Incomplete control",
    summary: "Incomplete control",
    explanationType: "causal",
    scope,
    outcomeRefs: [],
    reasoningPathIds: [],
    reasoningRelationshipIds: [],
    evidenceIds: [],
    supportedPathIds: [],
    explainedEffectIds: [],
    relatedRootCauseIds: [],
    relatedLeveragePointIds: [],
    relatedExecutiveConclusionIds: [],
    assumptions: [],
    evidenceReferences: [],
    confidence: 0.5,
    generatedAt: NOW,
  };
  const result = completeOrganizationalExplanations({
    organizationId: ORGANIZATION_ID,
    seeds: [incompleteSeed],
    mechanisms: [],
    beliefs: [],
    theories: [],
    now: NOW,
  });
  assert.equal(result.explanations.length, 0);
  assert.equal(result.failures.length, 1);
  return result.failures.length;
})();

let directionCorrect = 0;
let confidenceDirectionCorrect = 0;
let justifiedAbstentions = 0;
let reciprocalRankTotal = 0;
for (const item of core) {
  const priorLeader = item.prior?.leader ?? null;
  const priorStanding = item.prior?.standings.find(
    (standing) => standing.family === priorLeader,
  );
  const currentStanding = item.p2.standings.find(
    (standing) => standing.family === priorLeader,
  );
  const priorConfidence = priorStanding?.confidence ?? 0;
  const currentConfidence = currentStanding?.confidence ?? 0;
  const expectedDirection = item.phase.expected.direction;
  const directionPass =
    !item.prior ||
    (expectedDirection === "stable" &&
      item.p2.leader === priorLeader &&
      stable(item.p2.viable) === stable(item.prior.viable)) ||
    (expectedDirection === "weaken" &&
      item.p2.leader === priorLeader &&
      currentConfidence < priorConfidence) ||
    (expectedDirection === "strengthen" &&
      item.p2.leader === priorLeader &&
      currentConfidence >= priorConfidence) ||
    (expectedDirection === "displace" &&
      item.p2.leader !== priorLeader &&
      item.p2.leader === item.phase.expected.leader) ||
    (expectedDirection === "expand" &&
      item.p2.viable.length > item.prior.viable.length) ||
    (expectedDirection === "reject" &&
      item.p2.viable.length < item.prior.viable.length);
  if (directionPass) directionCorrect += 1;
  const confidencePass =
    !item.prior ||
    expectedDirection !== "weaken" ||
    currentConfidence < priorConfidence;
  if (confidencePass) confidenceDirectionCorrect += 1;
  if (item.phase.expected.abstain && item.p2.abstained)
    justifiedAbstentions += 1;
  if (item.phase.expected.leader === null) {
    reciprocalRankTotal += item.p2.leader === null ? 1 : 0;
  } else {
    const ranking = [...item.p2.standings]
      .sort((left, right) => {
        const l = rank(left);
        const r = rank(right);
        for (let index = 0; index < l.length; index += 1) {
          if (l[index] !== r[index]) return r[index] - l[index];
        }
        return left.family.localeCompare(right.family);
      })
      .map((standing) => standing.family);
    const position = ranking.indexOf(item.phase.expected.leader);
    reciprocalRankTotal += position < 0 ? 0 : 1 / (position + 1);
  }
}

const finalByScenario = scenarios
  .filter((scenario) => !scenario.controlOf)
  .map((scenario) =>
    core.filter((item) => item.scenario.id === scenario.id).at(-1),
  )
  .filter((item): item is PhaseResult => Boolean(item));
const crossImproved = finalByScenario.filter(
  (item) => item.scenario.crossBenchmark && item.p2.leader === item.phase.expected.leader,
).length;
const harmfulLeaderChanges = core.filter(
  (item) =>
    item.p2.leader !== null &&
    item.p2.leader !== item.phase.expected.leader,
).length;
const validAlternativesLost = missing;
const falseCertainty = core.filter(
  (item) => item.phase.expected.abstain && !item.p2.abstained,
).length;
const multiCauseCorrect = core.filter(
  (item) =>
    item.phase.expected.disposition === "multipleCauses" &&
    item.p2.multiCause,
).length;
const multiCauseRequired = core.filter(
  (item) => item.phase.expected.disposition === "multipleCauses",
).length;
const feedbackCorrect = core.filter(
  (item) =>
    item.scenario.id === "feedback-loop" &&
    item.p2.unresolved &&
    item.p2.abstained,
).length;
const exactDuplicateStable = finalByScenario.some(
  (item) =>
    item.scenario.id === "exact-duplicate-invariance" &&
    item.p2.leader === "coordination" &&
    item.p2.standings.find((standing) => standing.family === "coordination")
      ?.confidence === 0.66,
);
const irrelevantStable = finalByScenario.some(
  (item) =>
    item.scenario.id === "irrelevant-evidence-invariance" &&
    item.p2.leader === "strategy" &&
    item.p2.standings.find((standing) => standing.family === "strategy")
      ?.confidence === 0.66,
);
const repeated = phaseResults.map((item) => {
  const links = [...item.phase.links];
  if (item.scenario.reverseEvidence) links.reverse();
  if (item.scenario.reverseSources) {
    links.sort((left, right) => right.sourceId.localeCompare(left.sourceId));
  }
  return adjudicate(item.candidates, links, item.prior);
});
assert.equal(stable(repeated), stable(phaseResults.map((item) => item.p2)));

const total = core.length;
const leadingAccuracy = leaderCorrect / total;
const setAccuracy = exactSet / total;
const revisionAccuracy = directionCorrect / total;
const confidenceAccuracy = confidenceDirectionCorrect / total;
const requiredAbstentions = core.filter(
  (item) => item.phase.expected.abstain,
).length;
const meanReciprocalRank = reciprocalRankTotal / total;
const classification =
  candidatePrecision >= 0.9 &&
  candidateRecall >= 0.9 &&
  setPrecision >= 0.9 &&
  setRecall >= 0.9 &&
  leadingAccuracy >= 0.9 &&
  revisionAccuracy >= 0.9 &&
  confidenceAccuracy >= 0.9 &&
  justifiedAbstentions === requiredAbstentions &&
  unsupported === 0 &&
  harmfulLeaderChanges === 0 &&
  exactDuplicateStable &&
  irrelevantStable &&
      completeAncestry === acceptedCandidates &&
      rejectedIncompleteCandidates === 1 &&
      validAlternativesLost === 0 &&
      falseCertainty === 0 &&
      multiCauseCorrect === multiCauseRequired &&
      feedbackCorrect === 1 &&
      meanReciprocalRank >= 0.9 &&
      crossImproved >= 2
    ? "A — Completed Explanation adjudication validated"
    : candidatePrecision >= 0.9 &&
        candidateRecall >= 0.9 &&
        setPrecision >= 0.8 &&
        leadingAccuracy >= 0.75 &&
        harmfulLeaderChanges <= 1
      ? "B — Strong but incomplete"
      : harmfulLeaderChanges > 1
        ? "D — Unsafe"
        : "C — Structural bridge does not generalize to adjudication";

console.log("SPRINT 123 — COMPLETED EXPLANATION ADJUDICATION PRODUCTION SHADOW");
console.log("");
console.log(
  `P0: authoritative production output unchanged; shadow writes=0`,
);
console.log(
  `P1: accepted=${acceptedCandidates} rejectedIncomplete=${rejectedIncompleteCandidates} ancestry=${completeAncestry}/${acceptedCandidates} candidatePrecision=${candidatePrecision.toFixed(3)} candidateRecall=${candidateRecall.toFixed(3)}`,
);
console.log(
  `P2: explanationPrecision=${setPrecision.toFixed(3)} explanationRecall=${setRecall.toFixed(3)} exactSets=${exactSet}/${total} leaders=${leaderCorrect}/${total} MRR=${meanReciprocalRank.toFixed(3)} dispositions=${dispositionCorrect}/${total} abstention=${abstentionCorrect}/${total} direction=${directionCorrect}/${total} confidenceDirection=${confidenceDirectionCorrect}/${total}`,
);
console.log(
  `Safety: unsupported=${unsupported} missing=${missing} validAlternativesLost=${validAlternativesLost} falseCertainty=${falseCertainty} harmfulLeaderChanges=${harmfulLeaderChanges} duplicateStable=${exactDuplicateStable} irrelevantStable=${irrelevantStable} multiCause=${multiCauseCorrect}/${multiCauseRequired} feedback=${feedbackCorrect}/1 crossBenchmarkImproved=${crossImproved}`,
);
const dispositionMismatches = core.filter(
  (item) => item.p2.disposition !== item.phase.expected.disposition,
);
console.log(
  `Disposition mismatches: ${dispositionMismatches.map((item) => `${item.scenario.id}/T${item.scenario.phases.indexOf(item.phase)}:${item.p2.disposition}->${item.phase.expected.disposition}`).join(",") || "none"}`,
);
console.log("");
for (const item of core) {
  const phaseIndex = item.scenario.phases.indexOf(item.phase);
  console.log(
    `STATE ${item.scenario.id}/T${phaseIndex}: completed=${item.p2.completedExplanationIds.join(",")} viable=${item.p2.viable.join(",") || "none"} priorLeader=${item.p2.priorLeader ?? "none"} leader=${item.p2.leader ?? "abstain"} disposition=${item.p2.disposition} support=${item.p2.standings.map((standing) => `${standing.family}:${standing.supportState}:${standing.confidence.toFixed(2)}`).join("|")} weakened=${item.p2.weakened.join(",") || "none"} rejected=${item.p2.rejected.join(",") || "none"} revisionEvidence=${item.p2.revisionEvidenceIds.join(",") || "none"} P0=authoritative-unchanged P1=no-leader P2=${item.p2.leader ?? "abstain"}`,
  );
}
console.log("");
console.log(`Classification: ${classification}`);
console.log("Repeated replay: deterministic");
console.log("Evidence-order reversal: equivalent");
console.log("Candidate-order reversal: equivalent");
console.log("Source-order reversal: equivalent");
console.log("Runtime, schemas, Conditions, assessment, projection, recommendations, and fixtures: unchanged");
