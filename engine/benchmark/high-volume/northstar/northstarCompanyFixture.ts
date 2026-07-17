/**
 * Northstar Industrial Systems
 *
 * Canonical high-volume organizational stress-test company.
 *
 * This fixture defines organizational reality before evidence is generated.
 * Individual documents may contain incomplete, stale, biased, or conflicting
 * representations of this reality.
 */

export const NORTHSTAR_ORGANIZATION_ID =
  "northstar-industrial-systems";

export type NorthstarExecutive = {
  id: string;
  name: string;
  title: string;
  function: string;
  priorities: string[];
  concerns: string[];
};

export type NorthstarBusinessUnit = {
  id: string;
  name: string;
  leaderId: string;
  headcount: number;
  locations: string[];
  objectives: string[];
  operatingIssues: string[];
};

export type NorthstarStrategicObjective = {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  successMeasures: string[];
  constraints: string[];
};

export type NorthstarKnownTension = {
  id: string;
  title: string;
  description: string;
  involvedFunctions: string[];
  trueUnderlyingMechanism: string;
  visibility:
    | "widely-recognized"
    | "partially-recognized"
    | "hidden";
};

export type NorthstarCompanyFixture = {
  organization: {
    id: string;
    name: string;
    industry: string;
    headquarters: string;
    foundedYear: number;
    employeeCount: number;
    annualRevenueUsd: number;
    businessModel: string;
    description: string;
  };

  executives: NorthstarExecutive[];
  businessUnits: NorthstarBusinessUnit[];
  strategicObjectives: NorthstarStrategicObjective[];
  knownTensions: NorthstarKnownTension[];

  executiveDecision: {
    id: string;
    title: string;
    objective: string;
    rationale: string;
    targetConditionIds: string[];
    successMetrics: Array<{
      name: string;
      baseline: number;
      target: number;
      unit: string;
      rationale: string;
    }>;
    constraints: Array<{
      type:
        | "risk"
        | "people"
        | "budget"
        | "time";

      description: string;
      required: boolean;
    }>;
    allowedInterventionTypes: Array<
      "governance" | "policy" | "strategy"
    >;
  };

  groundTruth: {
    primaryProblem: string;
    secondaryProblems: string[];
    misleadingNarratives: string[];
    criticalContradictions: string[];
    decisionMostLikelyToCreateValue: string;
    decisionMostLikelyToFail: string;
  };
};

export const northstarCompanyFixture:
  NorthstarCompanyFixture = {
    organization: {
      id:
        NORTHSTAR_ORGANIZATION_ID,

      name:
        "Northstar Industrial Systems",

      industry:
        "Industrial technology and advanced manufacturing",

      headquarters:
        "Columbus, Ohio",

      foundedYear:
        1998,

      employeeCount:
        1240,

      annualRevenueUsd:
        418_000_000,

      businessModel:
        "Northstar designs, manufactures, installs, and services industrial automation systems for large enterprise customers.",

      description:
        "Northstar is a mid-market industrial technology company operating across manufacturing, product engineering, enterprise sales, implementation, customer success, and field service. It recently acquired Vector Controls, a smaller automation software business, and is under pressure to improve execution reliability without adding headcount.",
    },

    executives: [
      {
        id:
          "executive-elena-morris",

        name:
          "Elena Morris",

        title:
          "Chief Executive Officer",

        function:
          "Executive Leadership",

        priorities: [
          "Protect enterprise growth",
          "Improve execution reliability",
          "Deliver acquisition synergies",
          "Maintain board confidence",
        ],

        concerns: [
          "Leadership team is operating from conflicting versions of reality",
          "Execution problems may damage strategic accounts",
          "The acquisition may not achieve planned synergies",
        ],
      },

      {
        id:
          "executive-marcus-lee",

        name:
          "Marcus Lee",

        title:
          "Chief Financial Officer",

        function:
          "Finance",

        priorities: [
          "Restore gross margin",
          "Reduce forecast variance",
          "Control operating expense",
          "Avoid additional headcount",
        ],

        concerns: [
          "Revenue forecasts are repeatedly revised late",
          "Expedite costs are obscuring underlying margin performance",
          "Business-unit reporting definitions are inconsistent",
        ],
      },

      {
        id:
          "executive-priya-shah",

        name:
          "Priya Shah",

        title:
          "Chief Operating Officer",

        function:
          "Operations",

        priorities: [
          "Improve on-time delivery",
          "Reduce work in progress",
          "Clarify delivery ownership",
          "Standardize operating cadence",
        ],

        concerns: [
          "Too many projects are active simultaneously",
          "Escalations substitute for clear decision rights",
          "Regional teams use incompatible delivery processes",
        ],
      },

      {
        id:
          "executive-daniel-kim",

        name:
          "Daniel Kim",

        title:
          "Chief Product and Technology Officer",

        function:
          "Product and Engineering",

        priorities: [
          "Deliver the unified product platform",
          "Reduce technical debt",
          "Protect product quality",
          "Retain senior engineers",
        ],

        concerns: [
          "Commercial commitments exceed engineering capacity",
          "Acquisition integration is fragmenting architecture",
          "Product teams are interrupted by customer escalations",
        ],
      },

      {
        id:
          "executive-sophia-alvarez",

        name:
          "Sophia Alvarez",

        title:
          "Chief Revenue Officer",

        function:
          "Sales",

        priorities: [
          "Reach annual bookings target",
          "Protect strategic accounts",
          "Accelerate cross-selling",
          "Preserve regional autonomy",
        ],

        concerns: [
          "Central governance may slow customer responsiveness",
          "Operations frequently rejects commercially important exceptions",
          "Product delivery dates are difficult to sell with confidence",
        ],
      },

      {
        id:
          "executive-jordan-brooks",

        name:
          "Jordan Brooks",

        title:
          "Chief People Officer",

        function:
          "People",

        priorities: [
          "Reduce regrettable attrition",
          "Improve leadership effectiveness",
          "Clarify accountability",
          "Integrate Vector Controls employees",
        ],

        concerns: [
          "Middle managers report decision fatigue",
          "High performers are compensating for broken processes",
          "Acquired employees do not understand Northstar's operating model",
        ],
      },
    ],

    businessUnits: [
      {
        id:
          "business-unit-manufacturing",

        name:
          "Manufacturing and Supply Chain",

        leaderId:
          "executive-priya-shah",

        headcount:
          430,

        locations: [
          "Columbus, Ohio",
          "Fort Wayne, Indiana",
          "Monterrey, Mexico",
        ],

        objectives: [
          "Improve schedule attainment",
          "Reduce expedite expense",
          "Increase first-pass yield",
        ],

        operatingIssues: [
          "Schedules are frequently reprioritized",
          "Engineering changes arrive after production release",
          "Capacity is consumed by urgent customer exceptions",
        ],
      },

      {
        id:
          "business-unit-product-engineering",

        name:
          "Product and Engineering",

        leaderId:
          "executive-daniel-kim",

        headcount:
          285,

        locations: [
          "Columbus, Ohio",
          "Austin, Texas",
          "Toronto, Canada",
        ],

        objectives: [
          "Launch the unified controls platform",
          "Reduce defect escape",
          "Consolidate acquired architecture",
        ],

        operatingIssues: [
          "Teams support too many concurrent priorities",
          "Customer escalations repeatedly interrupt roadmap work",
          "Decision ownership between product and delivery is unclear",
        ],
      },

      {
        id:
          "business-unit-sales",

        name:
          "Enterprise Sales",

        leaderId:
          "executive-sophia-alvarez",

        headcount:
          165,

        locations: [
          "United States",
          "Canada",
          "Germany",
          "United Kingdom",
        ],

        objectives: [
          "Achieve annual bookings plan",
          "Grow strategic accounts",
          "Cross-sell Vector Controls software",
        ],

        operatingIssues: [
          "Regional forecasts use inconsistent confidence definitions",
          "Sales commitments are made before delivery validation",
          "Discounting is used to offset execution concerns",
        ],
      },

      {
        id:
          "business-unit-delivery",

        name:
          "Implementation and Customer Delivery",

        leaderId:
          "executive-priya-shah",

        headcount:
          210,

        locations: [
          "North America",
          "Europe",
        ],

        objectives: [
          "Improve implementation cycle time",
          "Reduce late projects",
          "Standardize customer handoffs",
        ],

        operatingIssues: [
          "Project ownership changes during delivery",
          "Escalation paths differ by region",
          "Teams begin work before requirements are stable",
        ],
      },

      {
        id:
          "business-unit-customer-success",

        name:
          "Customer Success and Field Service",

        leaderId:
          "executive-sophia-alvarez",

        headcount:
          95,

        locations: [
          "North America",
          "Europe",
          "Mexico",
        ],

        objectives: [
          "Reduce strategic-account churn risk",
          "Improve service response",
          "Increase renewal visibility",
        ],

        operatingIssues: [
          "Support themes are not consistently fed into product planning",
          "Strategic accounts receive informal priority",
          "Customer issue classifications are inconsistent",
        ],
      },

      {
        id:
          "business-unit-corporate",

        name:
          "Corporate Functions",

        leaderId:
          "executive-marcus-lee",

        headcount:
          55,

        locations: [
          "Columbus, Ohio",
        ],

        objectives: [
          "Improve planning accuracy",
          "Complete acquisition integration",
          "Strengthen governance",
        ],

        operatingIssues: [
          "Functions maintain separate metric definitions",
          "Management reporting is manually reconciled",
          "Acquisition synergy tracking is incomplete",
        ],
      },
    ],

    strategicObjectives: [
      {
        id:
          "objective-growth",

        name:
          "Protect enterprise growth",

        description:
          "Grow strategic-account revenue while maintaining delivery credibility.",

        targetDate:
          "2027-12-31",

        successMeasures: [
          "Annual bookings growth",
          "Strategic-account retention",
          "Cross-sell revenue",
        ],

        constraints: [
          "No material deterioration in gross margin",
          "No increase in enterprise churn",
        ],
      },

      {
        id:
          "objective-margin",

        name:
          "Restore operating margin",

        description:
          "Reduce delivery inefficiency, expedite costs, and margin leakage.",

        targetDate:
          "2027-06-30",

        successMeasures: [
          "Gross margin",
          "Expedite expense",
          "Project contribution margin",
        ],

        constraints: [
          "No broad workforce reduction",
          "No material reduction in product quality",
        ],
      },

      {
        id:
          "objective-integration",

        name:
          "Integrate Vector Controls",

        description:
          "Capture commercial and product synergies from the acquisition without losing key talent or customers.",

        targetDate:
          "2027-09-30",

        successMeasures: [
          "Cross-sell revenue",
          "Platform integration milestones",
          "Retention of critical acquired employees",
        ],

        constraints: [
          "Maintain service continuity",
          "Protect acquired customer relationships",
        ],
      },

      {
        id:
          "objective-reliability",

        name:
          "Improve execution reliability",

        description:
          "Increase the organization's ability to make, coordinate, and execute decisions consistently.",

        targetDate:
          "2027-03-31",

        successMeasures: [
          "On-time delivery",
          "Project cycle time",
          "Forecast accuracy",
          "Decision latency",
        ],

        constraints: [
          "No net new headcount",
          "Remain within approved operating budget",
        ],
      },
    ],

    knownTensions: [
      {
        id:
          "tension-sales-operations",

        title:
          "Commercial flexibility versus delivery discipline",

        description:
          "Sales believes operational governance prevents customer responsiveness, while operations believes unvalidated sales commitments create avoidable execution failure.",

        involvedFunctions: [
          "Sales",
          "Operations",
          "Delivery",
          "Finance",
        ],

        trueUnderlyingMechanism:
          "Customer commitments are made before shared feasibility validation, forcing downstream reprioritization and margin leakage.",

        visibility:
          "widely-recognized",
      },

      {
        id:
          "tension-product-delivery",

        title:
          "Roadmap progress versus customer escalation",

        description:
          "Engineering attributes roadmap delays to customer escalations, while customer-facing teams attribute escalations to product quality and missed commitments.",

        involvedFunctions: [
          "Product",
          "Engineering",
          "Delivery",
          "Customer Success",
        ],

        trueUnderlyingMechanism:
          "Unclear ownership between product, implementation, and support causes unresolved work to migrate across teams and repeatedly interrupt planned capacity.",

        visibility:
          "partially-recognized",
      },

      {
        id:
          "tension-autonomy-standardization",

        title:
          "Regional autonomy versus operating standardization",

        description:
          "Regional leaders argue that local autonomy drives growth, while corporate leaders believe local variation prevents reliable execution and measurement.",

        involvedFunctions: [
          "Sales",
          "Delivery",
          "Finance",
          "Executive Leadership",
        ],

        trueUnderlyingMechanism:
          "Regional incentives reward bookings but do not fully account for delivery complexity, margin, or downstream capacity consumption.",

        visibility:
          "partially-recognized",
      },

      {
        id:
          "tension-acquisition-integration",

        title:
          "Acquisition synergy versus organizational fragmentation",

        description:
          "Leadership publicly describes the acquisition as on track, but the acquired company still uses separate systems, processes, product architecture, and customer commitments.",

        involvedFunctions: [
          "Product",
          "Engineering",
          "Sales",
          "Finance",
          "People",
        ],

        trueUnderlyingMechanism:
          "Northstar attempted commercial integration before establishing shared operating ownership and technical integration sequencing.",

        visibility:
          "hidden",
      },

      {
        id:
          "tension-workload-capacity",

        title:
          "High utilization versus low throughput",

        description:
          "Most teams report being fully utilized, yet major initiatives continue to miss deadlines.",

        involvedFunctions: [
          "Engineering",
          "Operations",
          "Delivery",
          "Executive Leadership",
        ],

        trueUnderlyingMechanism:
          "Excessive concurrent work, frequent reprioritization, and unclear decision rights create high activity but low completed throughput.",

        visibility:
          "partially-recognized",
      },
    ],

    executiveDecision: {
      id:
        "executive-decision-northstar-execution-reliability",

      title:
        "Improve Northstar's Execution Reliability",

      objective:
        "Increase cross-functional execution throughput and delivery reliability without adding headcount or undermining enterprise growth.",

      rationale:
        "Northstar is experiencing missed delivery commitments, declining margin, forecast instability, and acquisition-integration delays. Leadership must select the highest-leverage structural intervention.",

      targetConditionIds: [
        "condition-executioncapacity",
        "condition-decisionlatency",
        "condition-crossfunctionalcoordination",
        "condition-deliveryreliability",
      ],

      successMetrics: [
        {
          name:
            "On-Time Delivery",

          baseline:
            0.61,

          target:
            0.8,

          unit:
            "ratio",

          rationale:
            "Execution improvement must materially increase customer delivery reliability.",
        },

        {
          name:
            "Forecast Accuracy",

          baseline:
            0.58,

          target:
            0.75,

          unit:
            "ratio",

          rationale:
            "Improved organizational coordination should produce more reliable forecasting.",
        },

        {
          name:
            "Concurrent Strategic Initiatives",

          baseline:
            27,

          target:
            16,

          unit:
            "initiatives",

          rationale:
            "Northstar must reduce organizational work in progress to improve completed throughput.",
        },
      ],

      constraints: [
        {
          type:
            "people",

          description:
            "Do not add net new headcount.",

          required:
            true,
        },

        {
          type:
            "budget",

          description:
            "Remain within the approved operating budget.",

          required:
            true,
        },

        {
          type:
            "risk",

          description:
            "Do not materially increase strategic-account delivery risk.",

          required:
            true,
        },

        {
          type:
            "time",

          description:
            "Produce measurable operating improvement within two quarters.",

          required:
            true,
        },
      ],

      allowedInterventionTypes: [
        "governance",
        "policy",
        "strategy",
      ],
    },

    groundTruth: {
      primaryProblem:
        "Northstar's low execution reliability is primarily caused by excessive concurrent work combined with unclear cross-functional decision rights.",

      secondaryProblems: [
        "Commercial commitments are made before operational feasibility is validated.",
        "Regional incentives reward bookings without fully incorporating delivery complexity or margin.",
        "The Vector Controls acquisition introduced technical and operating fragmentation.",
        "Metric definitions differ across finance, sales, operations, and delivery.",
        "High-performing employees compensate for weak operating systems, creating burnout and hidden dependency.",
      ],

      misleadingNarratives: [
        "The principal issue is insufficient staffing.",
        "The acquisition integration is broadly on track.",
        "Regional autonomy is the primary source of revenue growth.",
        "Engineering capacity alone is responsible for missed commitments.",
        "Customer exceptions are isolated rather than systemic.",
      ],

      criticalContradictions: [
        "Board materials report improving delivery performance while operational reports show deteriorating schedule attainment.",
        "Sales forecasts show strong confidence while finance repeatedly applies manual forecast reductions.",
        "Leadership reports acquisition synergy progress while platform and process integration remain materially incomplete.",
        "Functions report full utilization while completed strategic throughput declines.",
        "Customer-success reports identify recurring product issues that product planning documents classify as isolated incidents.",
      ],

      decisionMostLikelyToCreateValue:
        "Reduce concurrent work and establish explicit cross-functional decision rights for customer commitments, priority changes, and escalation ownership.",

      decisionMostLikelyToFail:
        "Add another centralized approval layer without reducing active work or clarifying ownership.",
    },
  };
