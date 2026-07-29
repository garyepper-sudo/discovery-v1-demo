import type {
  Architecture,
  EvidenceGap,
  ExperimentalEvidenceDirection,
  FunctionAssignment,
  MechanismCandidate,
  OrganizationalFunction,
  Scenario,
  ScenarioResult,
} from "./types";

type Rule = {
  function: OrganizationalFunction;
  include: readonly RegExp[];
  exclude?: RegExp;
};

const DISALLOWED =
  /(?:\b(?:did not|does not|do not|never|might|may|could|hypothesis)\b|[?]|[“”"])/i;
const IRRELEVANT =
  /(?:records retention|retention policy|file conversion|approval rating|referee|speech delivery|auditorium capacity|investment returns?|software cancellation token)/i;

const RULES: readonly Rule[] = [
  {
    function: "demand-generation",
    include: [
      /(?:(?:fewer|more|new) qualified (?:inquir|pipeline)|first-time donor.*pipeline|prospect creation|campaign pipeline)/i,
    ],
    exclude: /weather|market demand/i,
  },
  {
    function: "value-conversion",
    include: [
      /(?:sales conversion|close rate|win rate|opportunit(?:y|ies).*(?:cycle|duration|signed)|qualified interest.*signed|statement of work)/i,
    ],
  },
  {
    function: "value-exchange",
    include: [/(?:discount|concession|realized price|posted rate|reimbursement)/i],
    exclude: /input price|invoice processing/i,
  },
  {
    function: "customer-retention",
    include: [
      /(?:customer retention|renewal cancellation|customer cancellation|recurring supporter|annual membership|members?.*(?:renew|continue)|churn)/i,
    ],
    exclude: /records retention|document retention|policy/i,
  },
  {
    function: "capacity-acquisition",
    include: [
      /(?:time to fill|open roles?|approved vacanc|remain unfilled|seasonal crews?|hiring funnel|candidate-stage|volunteer recruitment|credentialing)/i,
    ],
  },
  {
    function: "productive-capacity",
    include: [
      /(?:workload exceeded staffing|caseload.*clinician hours|available.*capacity|staffing capacity|machine hours.*demand)/i,
    ],
    exclude: /auditorium/i,
  },
  {
    function: "decision-formation",
    include: [/(?:reopen option analysis|option evaluation|deliberation|selecting a .* response)/i],
  },
  {
    function: "decision-authorization",
    include: [
      /(?:approval delays?|waiting for signoff|director'?s signature|senior sign-off|queue.*signature|approval dependenc)/i,
    ],
    exclude: /approval rating/i,
  },
  {
    function: "coordination",
    include: [
      /(?:unresolved dependenc|downstream placement.*unresolved|handoff.*unresolved|ownership of the handoff|cross-team|boundary.*ownership)/i,
    ],
  },
  {
    function: "execution-throughput",
    include: [
      /(?:delivery cycle time|blocked releases?|discharge-ready|remain in beds|committed (?:cases|work)|completing more slowly)/i,
    ],
    exclude: /speech delivery|file conversion/i,
  },
  {
    function: "quality-control",
    include: [/(?:inspection failures?|defect escapes?|repeat work|rework.*inspection|audit failures?)/i],
    exclude: /investment return/i,
  },
  {
    function: "knowledge-flow",
    include: [/(?:cannot retrieve.*history|institutional context|knowledge transfer|shift teams.*context)/i],
    exclude: /archived|retention policy/i,
  },
  {
    function: "learning-adaptation",
    include: [/(?:same .* recurs?|without a changed practice|lessons?.*not adopted|repeated failure)/i],
    exclude: /training course/i,
  },
  {
    function: "resource-allocation",
    include: [/(?:hours were moved from|funds shifted from|budget reallocated|portfolio trade-off)/i],
    exclude: /invoice processing/i,
  },
];

const GAP_BY_FUNCTION: Partial<Record<OrganizationalFunction, string>> = {
  "value-conversion": "Opportunity stage history and loss reasons.",
  "customer-retention": "Renewal and cancellation reasons.",
  "capacity-acquisition": "Hiring funnel by role.",
  "productive-capacity": "Capacity and demand by role and shift.",
  "decision-authorization": "Recent decision log with approval timestamps.",
  "execution-throughput": "Delivery timeline and dependency history.",
  "quality-control": "Defect and rework records by process stage.",
};

function compare(left: string, right: string): number {
  return left.localeCompare(right);
}

function directionFor(text: string): ExperimentalEvidenceDirection {
  if (/(?:declin|fell|fewer|smaller share|not to continue)/i.test(text)) {
    return "decreasing";
  }
  if (/(?:delay|longer|lengthen|more weeks|outpaced|exceeded|unresolved|blocked|waiting|queue|rework|repeat work|recurs|reopen|unfilled|cannot retrieve)/i.test(text)) {
    return "friction";
  }
  if (/(?:increas|grew|more recurring)/i.test(text)) return "increasing";
  if (/(?:stable|unchanged|steady)/i.test(text)) return "stable";
  return "unknown";
}

function assignment(
  scenario: Scenario,
  fn: OrganizationalFunction,
  rule: string,
  direction?: ExperimentalEvidenceDirection,
): FunctionAssignment {
  const evidenceIds = scenario.evidence
    .filter((item) => item.admitted)
    .map((item) => item.id)
    .sort(compare);
  const observationIds = scenario.observations
    .filter((item) => item.evidenceIds.some((id) => evidenceIds.includes(id)))
    .map((item) => item.id)
    .sort(compare);
  return {
    function: fn,
    direction: direction ?? directionFor(scenario.evidence.map((item) => item.text).join(" ")),
    evidenceIds,
    observationIds,
    sourceArtifactIds: [...evidenceIds, ...observationIds].sort(compare),
    derivationRule: rule,
  };
}

function eligibleCorpus(scenario: Scenario): string | null {
  const admitted = scenario.evidence.filter((item) => item.admitted);
  if (
    admitted.length === 0 ||
    admitted.some((item) => item.type === "question") ||
    admitted.some((item) => item.organizationId !== admitted[0].organizationId) ||
    scenario.observations.some((item) => item.organizationId !== admitted[0].organizationId)
  ) {
    return null;
  }
  const corpus = [
    ...admitted.map((item) => item.text),
    ...scenario.observations
      .filter((observation) =>
        observation.evidenceIds.every((id) =>
          admitted.some((item) => item.id === id)
        )
      )
      .map((item) => item.statement),
  ].join(" ");
  if (DISALLOWED.test(corpus) || IRRELEVANT.test(corpus)) return null;
  return corpus;
}

function architectureA(scenario: Scenario): FunctionAssignment[] {
  const corpus = eligibleCorpus(scenario);
  if (!corpus) return [];
  const exactBaseline: ReadonlyArray<[RegExp, OrganizationalFunction]> = [
    [/(?:sales conversion|close rate|win rate)/i, "value-conversion"],
    [/(?:delivery cycle time|blocked release)/i, "execution-throughput"],
    [/(?:time to fill|open roles?)/i, "capacity-acquisition"],
    [/(?:approval delays?|waiting for signoff)/i, "decision-authorization"],
    [/(?:customer retention|renewal cancellations?|churn)/i, "customer-retention"],
    [/(?:inspection failure|rework)/i, "quality-control"],
    [/(?:handoff|unresolved dependenc)/i, "coordination"],
  ];
  return exactBaseline
    .filter(([pattern]) => pattern.test(corpus))
    .map(([, fn]) => assignment(scenario, fn, "A: current literal Product Translation grammar"));
}

function architectureB(scenario: Scenario): FunctionAssignment[] {
  if (!eligibleCorpus(scenario)) return [];
  const admittedIds = new Set(
    scenario.evidence.filter((item) => item.admitted).map((item) => item.id)
  );
  const output = new Map<OrganizationalFunction, ExperimentalEvidenceDirection>();
  for (const role of scenario.evidenceRoles.filter((item) =>
    admittedIds.has(item.evidenceId) &&
    item.lineage.evidenceIds.every((id) => admittedIds.has(id))
  )) {
    const names = new Set(role.roles);
    if (names.has("retention-signal") || (
      names.has("customer-observation") && names.has("weakens")
    )) output.set("customer-retention", role.direction);
    if (names.has("demand-signal") && (
      names.has("weakens") || names.has("temporal-trend")
    )) output.set("value-conversion", role.direction);
    if (names.has("capacity-signal") && names.has("demand-signal")) {
      output.set("capacity-acquisition", role.direction);
      output.set("productive-capacity", role.direction);
    } else if (names.has("capacity-signal")) {
      output.set(
        names.has("temporal-trend") ? "capacity-acquisition" : "productive-capacity",
        role.direction,
      );
    }
    if (names.has("decision-signal")) output.set("decision-authorization", role.direction);
    if (names.has("execution-signal")) output.set("execution-throughput", role.direction);
    if (names.has("constraint-signal") && names.has("execution-signal")) {
      output.set("coordination", role.direction);
    }
  }
  return [...output.entries()]
    .sort(([left], [right]) => compare(left, right))
    .map(([fn, direction]) =>
      assignment(scenario, fn, "B: Product Evidence Role projection", direction)
    );
}

function architectureC(scenario: Scenario): FunctionAssignment[] {
  const corpus = eligibleCorpus(scenario);
  if (!corpus) return [];
  return RULES
    .filter((rule) =>
      rule.include.some((pattern) => pattern.test(corpus)) &&
      !(rule.exclude?.test(corpus) ?? false)
    )
    .map((rule) =>
      assignment(scenario, rule.function, "C: admitted Evidence and Observation projection")
    )
    .sort((left, right) => compare(left.function, right.function));
}

function downstream(
  scenario: Scenario,
  assignments: FunctionAssignment[],
): Pick<ScenarioResult, "mechanism" | "evidenceGap"> {
  const functions = new Set(assignments.map((item) => item.function));
  const corpus = scenario.evidence
    .filter((item) => item.admitted)
    .map((item) => item.text)
    .join(" ");
  let mechanism: MechanismCandidate | undefined;
  const supportedPair: readonly [OrganizationalFunction, OrganizationalFunction] | undefined =
    functions.has("coordination") && functions.has("execution-throughput")
      ? ["coordination", "execution-throughput"]
      : functions.has("capacity-acquisition") && functions.has("productive-capacity")
        ? ["capacity-acquisition", "productive-capacity"]
        : undefined;
  if (
    supportedPair &&
    /(?:\bas\b|\bwhile\b|\bbecause\b|unresolved|blocked)/i.test(corpus)
  ) {
    mechanism = {
      upstream: supportedPair[0],
      downstream: supportedPair[1],
      evidenceIds: assignments.flatMap((item) => item.evidenceIds).filter(
        (id, index, all) => all.indexOf(id) === index
      ),
      status: "supported-relationship",
    };
  }
  const gapFunction = assignments.find((item) => GAP_BY_FUNCTION[item.function]);
  const evidenceGap: EvidenceGap | undefined = gapFunction
    ? {
        function: gapFunction.function,
        recommendation: GAP_BY_FUNCTION[gapFunction.function]!,
        evidenceIds: [...gapFunction.evidenceIds],
      }
    : undefined;
  return { mechanism, evidenceGap };
}

export function runArchitecture(
  architecture: Architecture,
  scenario: Scenario,
): ScenarioResult {
  const assignments =
    architecture === "A"
      ? architectureA(scenario)
      : architecture === "B"
        ? architectureB(scenario)
        : architectureC(scenario);
  return {
    scenarioId: scenario.id,
    architecture,
    assignments,
    ...downstream(scenario, assignments),
  };
}
