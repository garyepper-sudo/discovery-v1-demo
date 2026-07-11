import { resetOrganizationRuntimeState } from "../v3/runtime";
import type { DiscoveryBenchmarkCase } from "./benchmarkTypes";
import { runBenchmarkInvestigation } from "./runBenchmarkInvestigation";

const ATLAS_ORGANIZATION_ID = "atlas-manufacturing-simulation";

const atlasInvestigations: DiscoveryBenchmarkCase[] = [
  {
    id: "atlas-week-01",
    title: "Week 1 — Post-Sale Friction",
    company: "Atlas Manufacturing",
    industry: "Industrial technology",
    question:
      "What is currently causing customer onboarding delays, and what deserves executive attention?",

    context: `
Atlas Manufacturing is a growing industrial technology company.

Revenue is increasing, but leaders report that execution feels harder.
Customer onboarding has slowed despite stable engineering performance.

The executive team does not agree on the cause.
Sales wants more headcount.
Operations believes the problem is coordination.
Customer Success believes ownership after the sale is unclear.
`,

    evidence: [
      {
        id: "ceo-notes",
        title: "CEO weekly notes",
        content: `
Revenue is still growing, but it feels harder every month.

Several executives mentioned that decisions now take longer than they did
six months ago.

Nobody seems to agree where accountability sits once a customer signs.
`,
      },
      {
        id: "sales-report",
        title: "VP Sales weekly report",
        content: `
Pipeline remains healthy.

Win rate is unchanged.

Average deal size increased 9%.

The sales cycle increased from 42 to 58 days.

Sales representatives report increasing delays while waiting for internal
approvals.

Recommendation: increase sales headcount.
`,
      },
      {
        id: "customer-success-report",
        title: "Customer Success report",
        content: `
Average onboarding time increased from 24 days to 37 days.

Customer health scores decline during onboarding but return to normal once
customers become operational.

Most escalations concern communication rather than product quality.

A frequent customer comment is:
"I do not know who owns my implementation."
`,
      },
      {
        id: "engineering-standup",
        title: "Engineering standup",
        content: `
Sprint velocity remains stable.

Production incidents decreased.

Engineering capacity is currently available.

Implementation requests frequently arrive without required information.

Customer requirements often change after implementation has already begun.

Engineering does not believe capacity is the primary bottleneck.
`,
      },
      {
        id: "product-notes",
        title: "Product team notes",
        content: `
The roadmap is progressing normally.

Most delayed implementations involve existing features.

Product managers increasingly spend time clarifying customer commitments.

Sales and Customer Success appear to have different expectations about who
owns onboarding.
`,
      },
      {
        id: "hr-survey",
        title: "HR pulse survey",
        content: `
Customer Success burnout increased significantly.

Engineering engagement is unchanged.

Sales morale remains high.

Cross-functional collaboration received the lowest score in the company.

Comments include:

"I do not know who owns decisions."

"There are too many approvals."

"Everyone is trying to help, but nobody is accountable."
`,
      },
      {
        id: "customer-interviews",
        title: "Customer interviews",
        content: `
Customer A:
Everyone was friendly, but nobody seemed responsible.

Customer B:
We had four different contacts during onboarding.

Customer C:
The sales experience was excellent. Implementation was confusing.

Customer D:
Once onboarding ended, everything became great.
`,
      },
      {
        id: "customer-success-slack",
        title: "Customer Success Slack conversation",
        content: `
Sarah:
Another kickoff was delayed because nobody knew who owned implementation.

Mike:
Sales promised features Engineering did not know about again.

Emily:
The customer thinks we are ignoring them. We are actually waiting for Product.

James:
This is becoming normal.

Sarah:
Everyone works hard. The process just feels broken.
`,
      },
    ],

    expected: {
      primaryMechanisms: [
        "fragmented ownership",
        "coordination failure",
        "decision bottleneck",
      ],
      secondaryMechanisms: [
        "approval latency",
        "handoff failure",
        "misaligned expectations",
      ],
      affectedCapabilities: [
        "coordination",
        "execution",
        "governance",
        "customer onboarding",
      ],
      compressedConcepts: [
        "post-sale ownership fragmentation",
        "growth masking execution friction",
      ],
      avoid: [
        "engineering capacity is the primary cause",
        "weak market demand is the primary cause",
      ],
    },
  },

  {
    id: "atlas-week-02",
    title: "Week 2 — Growth Masks Operational Deterioration",
    company: "Atlas Manufacturing",
    industry: "Industrial technology",
    question:
      "What changed this week, and does the new evidence strengthen or weaken the current explanation?",

    context: `
Atlas continues to grow commercially.

Leadership is increasingly confident because average deal size and revenue
are improving.

However, customer-facing teams report more friction immediately after the
sale.

Discovery should determine whether commercial strength invalidates the
earlier concern or whether growth is masking an operational problem.
`,

    evidence: [
      {
        id: "finance-update",
        title: "Finance update",
        content: `
Quarterly revenue is 14% above the same period last year.

Gross margin remains stable.

Customer acquisition cost is nearly unchanged.

Implementation-related credits increased 31%.

Delayed revenue recognition associated with incomplete implementations also
increased.
`,
      },
      {
        id: "leadership-meeting",
        title: "Leadership meeting",
        content: `
The CEO described the quarter as evidence that the strategy is working.

The VP of Sales said larger deals prove that customer demand is strong.

The COO warned that larger deals are creating more complicated internal
handoffs.

No decision was made about who owns the complete post-sale process.
`,
      },
      {
        id: "sales-slack",
        title: "Sales Slack discussion",
        content: `
The team is celebrating the largest enterprise contract in company history.

One representative noted that Legal, Product, Engineering, and Customer
Success each believe someone else approved the implementation plan.

The account executive said the customer expects implementation to begin next
Monday.
`,
      },
      {
        id: "customer-success-capacity",
        title: "Customer Success capacity review",
        content: `
Customer Success headcount increased 8% this quarter.

Active onboarding volume increased 6%.

Average onboarding duration increased 19%.

The team does not appear numerically understaffed.

Managers report that employees spend substantial time finding decision owners
and reconciling conflicting customer commitments.
`,
      },
      {
        id: "engineering-review",
        title: "Engineering operational review",
        content: `
Engineering delivered 96% of planned sprint commitments.

Unplanned implementation work increased.

Much of the unplanned work resulted from commitments discovered after
contracts were signed.

Engineering wait time is primarily caused by missing decisions and changing
requirements rather than a shortage of engineering capacity.
`,
      },
      {
        id: "customer-escalation",
        title: "Enterprise customer escalation",
        content: `
The customer received three different implementation timelines.

Sales described the launch as standard.

Customer Success described it as highly customized.

Product believed the requested workflow was not included in the agreement.

The customer requested an executive sponsor because no one could provide a
final answer.
`,
      },
    ],

    expected: {
      primaryMechanisms: [
        "growth masking operational deterioration",
        "fragmented decision authority",
        "cross-functional coordination failure",
      ],
      secondaryMechanisms: [
        "contract-to-implementation disconnect",
        "leadership confidence",
        "unclear accountability",
      ],
      affectedCapabilities: [
        "coordination",
        "governance",
        "adaptation",
        "execution",
      ],
      compressedConcepts: [
        "commercial strength masking delivery weakness",
        "post-sale decision fragmentation",
      ],
      avoid: [
        "revenue growth proves the operating model is healthy",
        "customer success headcount is the primary constraint",
      ],
    },
  },

  {
    id: "atlas-week-03",
    title: "Week 3 — Challenge the Dominant Theory",
    company: "Atlas Manufacturing",
    industry: "Industrial technology",
    question:
      "Does the latest evidence show that onboarding problems are structural, or are they primarily caused by temporary enterprise complexity?",

    context: `
Leadership has challenged the current explanation.

Several recent customers purchased unusually complex enterprise
implementations.

The executive team argues that onboarding friction may be temporary and
limited to a small number of exceptional deals.

Discovery should test the dominant theory rather than automatically defending
it.
`,

    evidence: [
      {
        id: "coo-analysis",
        title: "COO cohort analysis",
        content: `
Three recent enterprise implementations account for a disproportionate share
of total onboarding delay.

These implementations include customization, regulatory reviews, and
third-party integrations.

Smaller standard customers continue to launch faster.
`,
      },
      {
        id: "operations-audit",
        title: "Operations audit",
        content: `
Standard implementations with a named implementation owner launch in an
average of 22 days.

Standard implementations without a clearly named owner launch in an average
of 34 days.

Complex enterprise implementations with a named owner launch in an average
of 41 days.

Complex enterprise implementations without a named owner launch in an
average of 63 days.
`,
      },
      {
        id: "sales-response",
        title: "VP Sales response",
        content: `
The VP of Sales believes the delays are an acceptable consequence of moving
upmarket.

Sales argues that enterprise complexity—not organizational design—is the
primary explanation.

The team does not support slowing enterprise sales.
`,
      },
      {
        id: "implementation-manager",
        title: "Implementation manager interview",
        content: `
Complexity matters, but complexity is manageable when one person has authority
to resolve tradeoffs.

The most delayed projects are not simply the most technically difficult.

They are the projects where decision rights move among Sales, Product,
Customer Success, and Engineering.
`,
      },
      {
        id: "successful-enterprise-customer",
        title: "Successful enterprise implementation",
        content: `
One highly complex customer launched on schedule.

Atlas assigned a single implementation leader before the contract was signed.

All requirement changes were routed through that person.

Engineering described the work as difficult but unusually clear.
`,
      },
      {
        id: "failed-standard-customer",
        title: "Delayed standard implementation",
        content: `
A relatively simple customer implementation is now 18 days late.

The customer requires no customization.

Sales believed Customer Success owned kickoff.

Customer Success believed Operations owned kickoff.

No implementation owner was assigned.
`,
      },
    ],

    expected: {
      primaryMechanisms: [
        "decision authority",
        "ownership fragmentation",
        "coordination failure",
      ],
      secondaryMechanisms: [
        "enterprise complexity",
        "implementation governance",
        "role ambiguity",
      ],
      affectedCapabilities: [
        "governance",
        "coordination",
        "execution",
        "organizational learning",
      ],
      compressedConcepts: [
        "complexity amplifies but does not create ownership failure",
        "decision authority moderates implementation performance",
      ],
      avoid: [
        "enterprise complexity fully explains onboarding delays",
        "all enterprise implementations will be delayed",
      ],
    },
  },
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function printSection(title: string, value: unknown): void {
  const text = asString(value);

  console.log(title);
  console.log("-".repeat(title.length));
  console.log(text ?? "Not available");
  console.log("");
}

function printList(title: string, values: unknown): void {
  console.log(title);
  console.log("-".repeat(title.length));

  if (!Array.isArray(values) || values.length === 0) {
    console.log("None available");
    console.log("");
    return;
  }

  values.forEach((value, index) => {
    if (typeof value === "string") {
      console.log(`${index + 1}. ${value}`);
      return;
    }

    const record = asRecord(value);

    const label =
      asString(record.label) ??
      asString(record.theory) ??
      asString(record.title) ??
      "Untitled";

    const rationale =
      asString(record.rationale) ??
      asString(record.reasonItWasConsidered) ??
      asString(record.summary);

    console.log(`${index + 1}. ${label}`);

    if (rationale) {
      console.log(`   ${rationale}`);
    }
  });

  console.log("");
}

function printAtlasInvestigation(params: {
  investigationNumber: number;
  title: string;
  investigation: ReturnType<typeof runBenchmarkInvestigation>;
}): void {
  const {
    investigationNumber,
    title,
    investigation,
  } = params;

  const result = investigation.result;
  const memory = investigation.memory;

  const executiveAssessment = asRecord(memory.executiveAssessment);
  const theoryValidation = asRecord(
    executiveAssessment.theoryValidation,
  );

  const primaryBelief = result.beliefs[0];
  const primaryUnderstanding = result.understanding[0];

  const currentUnderstanding =
    result.executiveUnderstanding?.headline ||
    primaryBelief?.headline ||
    primaryUnderstanding?.title ||
    "Discovery has not formed a leading understanding.";

  const confidence =
    asNumber(result.executiveUnderstanding?.confidence) ??
    asNumber(primaryBelief?.confidence) ??
    asNumber(primaryUnderstanding?.confidence);

  console.log("");
  console.log("============================================================");
  console.log(`ATLAS MANUFACTURING — INVESTIGATION ${investigationNumber}`);
  console.log(title.toUpperCase());
  console.log("============================================================");
  console.log("");

  printSection("CURRENT UNDERSTANDING", currentUnderstanding);

  console.log("CONFIDENCE");
  console.log("----------");
  console.log(
    confidence === undefined
      ? "Not available"
      : `${Math.round(confidence <= 1 ? confidence * 100 : confidence)}%`,
  );
  console.log("");

  printSection(
    "EXECUTIVE ASSESSMENT",
    executiveAssessment.executiveNarrative ??
      executiveAssessment.summary,
  );

  printSection(
    "WHY DISCOVERY BELIEVES THIS",
    theoryValidation.whyDiscoveryBelievesIt ??
      result.executiveUnderstanding?.explanation,
  );

  printList(
    "SUPPORTING MECHANISMS",
    theoryValidation.supportingMechanisms,
  );

  printList(
    "COMPETING THEORIES",
    theoryValidation.competingTheoriesConsidered,
  );

  printList(
    "CONTRADICTORY OR WEAKENING EVIDENCE",
    theoryValidation.contradictoryOrWeakeningEvidence,
  );

  printSection(
    "CONFIDENCE CALIBRATION",
    theoryValidation.calibratedConfidenceExplanation,
  );

  printList(
    "EVIDENCE THAT WOULD INCREASE CONFIDENCE",
    theoryValidation.additionalEvidenceThatWouldIncreaseConfidence,
  );

  printList(
    "EVIDENCE THAT WOULD FALSIFY THE THEORY",
    theoryValidation.evidenceThatWouldFalsifyTheory,
  );

  printSection(
    "RECOMMENDED NEXT INVESTIGATION",
    theoryValidation.executiveRecommendation ??
      result.executiveUnderstanding?.nextMoves?.[0],
  );

  const learningProfile = asRecord(
    investigation.organizationalLearningProfile,
  );

  console.log("ORGANIZATIONAL LEARNING");
  console.log("-----------------------");
  console.log(
    `Learning velocity: ${
      asNumber(learningProfile.learningVelocityScore) ?? "N/A"
    }`,
  );
  console.log(
    `Memory growth: ${
      asNumber(learningProfile.memoryGrowth) ?? "N/A"
    }`,
  );
  console.log(
    `Knowledge retention: ${
      asNumber(learningProfile.knowledgeRetention) ?? "N/A"
    }`,
  );
  console.log(
    `Belief stability: ${
      asNumber(learningProfile.beliefStability) ?? "N/A"
    }`,
  );
  console.log(
    `Theory stability: ${
      asNumber(learningProfile.theoryStability) ?? "N/A"
    }`,
  );
  console.log("");

  console.log("BENCHMARK HEALTH");
  console.log("----------------");
  console.log(
    `Understanding score: ${Math.round(
      investigation.benchmarkScore.score,
    )}%`,
  );
  console.log(
    `Passed: ${investigation.benchmarkScore.passed ? "Yes" : "No"}`,
  );
  console.log("");
}

export function runAtlasSimulation(): void {
  console.log("============================================================");
  console.log("ATLAS MANUFACTURING SIMULATION");
  console.log("============================================================");
  console.log("");
  console.log(
    "Resetting the Atlas runtime and beginning a three-stage simulation.",
  );

  resetOrganizationRuntimeState(ATLAS_ORGANIZATION_ID);

  atlasInvestigations.forEach((benchmark, index) => {
    const investigation = runBenchmarkInvestigation({
      benchmark,
      organizationId: ATLAS_ORGANIZATION_ID,
    });

    printAtlasInvestigation({
      investigationNumber: index + 1,
      title: benchmark.title,
      investigation,
    });
  });

  console.log("============================================================");
  console.log("ATLAS SIMULATION COMPLETE");
  console.log("============================================================");
}