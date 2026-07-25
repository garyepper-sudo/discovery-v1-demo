import type { NaturalLanguageScenario, WritingStyle } from "./types";

type CorpusEntry = {
  family: string;
  topology: "linear" | "branching" | "converging";
  expectedNodes: string[];
  variants: Array<{
    industry: string;
    style: WritingStyle;
    terminologySet: string;
    documents: Array<{ silo: string; text: string }>;
    phenomena: string[];
  }>;
};

export const independentPositiveCorpus: CorpusEntry[] = [
  {
    family: "commercial-complexity", topology: "linear",
    expectedNodes: ["enterprise exceptions", "bespoke work", "delivery variance", "services margin"],
    variants: [
      { industry: "Software", style: "executive-email", terminologySet: "enterprise-special-handling", phenomena: ["synonym-drift", "political-language"], documents: [
        { silo: "Sales", text: "Enterprise asks now routinely get special handling. Product calls them exceptions; I call them deals we chose to win." },
        { silo: "Product", text: "Bespoke work filled the next planning cycle after those approvals became normal." },
        { silo: "Delivery", text: "The non-standard builds are where schedules spread and specialists get pulled in." },
        { silo: "Finance", text: "Services gross margin has compressed in the same accounts, despite ordinary implementations holding steady." },
      ]},
      { industry: "Healthcare", style: "meeting-notes", terminologySet: "clinical-variants", phenomena: ["implicit-mediation", "fragmented-structure"], documents: [
        { silo: "Contracting", text: "Notes: hospital-specific clauses up; no change to base package." },
        { silo: "Clinical Product", text: "Each local protocol creates another configuration branch." },
        { silo: "Implementation", text: "More branches, wider go-live range, scarce clinical architects on every late deployment." },
        { silo: "Finance", text: "Implementation contribution fell only in the tailored cohort." },
      ]},
      { industry: "Manufacturing", style: "operations-report", terminologySet: "engineered-orders", phenomena: ["passive-voice", "terminology-drift"], documents: [
        { silo: "Commercial", text: "Engineered-to-order requests were accepted at twice last year's rate." },
        { silo: "Engineering", text: "Additional drawings and routings were created for these orders." },
        { silo: "Plant", text: "Schedule dispersion and expert intervention were concentrated in those routings." },
        { silo: "Controlling", text: "Job margin deteriorated where engineering hours were not recovered." },
      ]},
      { industry: "Government", style: "board-summary", terminologySet: "agency-variants", phenomena: ["hedging", "political-language"], documents: [
        { silo: "Programs", text: "It may not be coincidence that agency-specific commitments expanded before delivery predictability weakened." },
        { silo: "Technology", text: "Those commitments became separate solution variants." },
        { silo: "Delivery", text: "Variant-heavy programs consume the few cleared specialists." },
        { silo: "Oversight", text: "Cost recovery is weakest on the same programs; Operations disputes that execution is the primary cause." },
      ]},
    ],
  },
  {
    family: "decision-escalation", topology: "linear",
    expectedNodes: ["failure penalties", "personal decision risk", "manager escalation", "executive bottleneck"],
    variants: [
      { industry: "Professional Services", style: "slack", terminologySet: "career-risk", phenomena: ["shorthand", "pronoun-reference"], documents: [
        { silo: "People", text: "We say 'use judgment' but promotions still punish the visible miss." },
        { silo: "Management", text: "So they kick the grey calls upstairs. Nobody wants their name on the wrong one." },
        { silo: "Executive", text: "My queue is now the operating constraint. It's not manager tenure; the longest-serving group escalates too." },
      ]},
      { industry: "Banking", style: "hr-observation", terminologySet: "control-exposure", phenomena: ["indirect", "hidden-activation"], documents: [
        { silo: "HR", text: "Under uncertainty, leaders with spotless control records advance faster than peers who made reversible mistakes." },
        { silo: "Risk", text: "Decision owners seek committee cover when interpretation is not obvious." },
        { silo: "Leadership", text: "Routine exceptions wait in executive committee even though formal authorities have not changed." },
      ]},
      { industry: "Government", style: "meeting-notes", terminologySet: "ministerial-clearance", phenomena: ["passive-voice", "political-language"], documents: [
        { silo: "Policy", text: "Independent calls are remembered; safe referrals are not." },
        { silo: "Programs", text: "Items with any visibility are being sent for ministerial clearance." },
        { silo: "Secretariat", text: "The clearance calendar, rather than program capacity, now sets pace." },
      ]},
      { industry: "Healthcare", style: "fragmented-bullets", terminologySet: "clinical-escalation", phenomena: ["fragmented-structure", "missing-chronology"], documents: [
        { silo: "People", text: "• adverse-event scrutiny\n• local discretion on paper\n• personal exposure in practice" },
        { silo: "Clinical", text: "• borderline cases: refer\n• senior sign-off requested" },
        { silo: "Leadership", text: "• review queue doubled\n• experience mix unchanged" },
      ]},
    ],
  },
  {
    family: "local-optimization", topology: "linear",
    expectedNodes: ["unit price", "lead-time variability", "missed commitments", "expedite cost"],
    variants: [
      { industry: "Manufacturing", style: "finance-commentary", terminologySet: "purchase-price-variance", phenomena: ["mixed-terminology"], documents: [
        { silo: "Finance", text: "Purchase-price variance looks excellent; total landed cost does not." },
        { silo: "Procurement", text: "Awards shifted toward the cheapest quotes, whose promised dates vary most." },
        { silo: "Plant", text: "That spread is showing up as shortages against fixed production slots." },
        { silo: "Logistics", text: "Premium freight and buffer stock erased the sourcing gain." },
      ]},
      { industry: "Healthcare", style: "operations-report", terminologySet: "lowest-rate-vendors", phenomena: ["indirect"], documents: [
        { silo: "Supply", text: "Lowest-rate vendors now hold most awards." },
        { silo: "Clinical Ops", text: "Their replenishment windows are both longer and less predictable." },
        { silo: "Care Delivery", text: "Procedure schedules are missed when kits arrive outside that window." },
        { silo: "Finance", text: "Emergency substitutions and excess stock have risen." },
      ]},
      { industry: "Government", style: "board-summary", terminologySet: "lowest-bid", phenomena: ["political-language"], documents: [
        { silo: "Procurement", text: "The lowest-bid mandate is being met." },
        { silo: "Programs", text: "Supplier lead-time spread widened afterward; milestones did not move." },
        { silo: "Finance", text: "Recovery purchases and contingency inventory are above plan." },
      ]},
      { industry: "Professional Services", style: "executive-email", terminologySet: "rate-card", phenomena: ["hedging"], documents: [
        { silo: "Commercial", text: "We optimized external rates and may have bought ourselves less predictable availability." },
        { silo: "Delivery", text: "Specialists now arrive after committed start dates." },
        { silo: "Finance", text: "Rush premiums and bench coverage exceed the rate savings." },
      ]},
    ],
  },
  {
    family: "workflow-adoption", topology: "linear",
    expectedNodes: ["workflow confusion", "weak adoption", "training demand", "retention risk"],
    variants: [
      { industry: "Software", style: "customer-interview", terminologySet: "jobs-to-be-done", phenomena: ["pronoun-reference", "vague-language"], documents: [
        { silo: "Research", text: "\"I know the feature exists. I just can't tell which path applies to my case.\"" },
        { silo: "Product", text: "Advanced usage stalls at the same step customers describe." },
        { silo: "Enablement", text: "Requests are for walkthroughs, not awareness material." },
        { silo: "Success", text: "Accounts repeating those requests are least likely to expand." },
      ]},
      { industry: "Healthcare", style: "meeting-notes", terminologySet: "clinical-workflow", phenomena: ["fragmented-structure"], documents: [
        { silo: "Clinical", text: "Users can find the module; completing the order path is the issue." },
        { silo: "Analytics", text: "Activation healthy. Completion weak. Drop-off at branching workflow." },
        { silo: "Training", text: "Repeat classes concentrated among low-completion sites." },
        { silo: "Success", text: "Those sites account for most renewal concern." },
      ]},
      { industry: "Government", style: "operations-report", terminologySet: "case-processing", phenomena: ["passive-voice"], documents: [
        { silo: "Service", text: "Caseworkers reported uncertainty about which route should be selected." },
        { silo: "Digital", text: "Optional functions were rarely completed after login." },
        { silo: "Learning", text: "Additional procedural sessions were requested." },
        { silo: "Programs", text: "Continued use weakened in offices requesting repeated sessions." },
      ]},
      { industry: "Manufacturing", style: "slack", terminologySet: "operator-flow", phenomena: ["sarcasm", "shorthand"], documents: [
        { silo: "Plant", text: "\"Sure, everyone knows the screen—nobody knows which sequence closes the exception.\"" },
        { silo: "Systems", text: "Use falls off exactly at exception handling." },
        { silo: "Training", text: "Same teams keep asking for another demo." },
        { silo: "Operations", text: "Plants in that group are abandoning the tool." },
      ]},
    ],
  },
  {
    family: "shared-driver-branches", topology: "branching",
    expectedNodes: ["priority churn", "work switching", "delivery delay", "employee fatigue"],
    variants: [
      { industry: "Software", style: "engineering-standup", terminologySet: "priority-reset", phenomena: ["shorthand"], documents: [
        { silo: "Product", text: "Third priority reset this month." },
        { silo: "Engineering", text: "Every reset leaves half-finished work and another context switch." },
        { silo: "Delivery", text: "Commit dates slip in the teams carrying the most switches." },
        { silo: "People", text: "The same teams report the sharpest exhaustion increase." },
      ]},
      { industry: "Healthcare", style: "operations-report", terminologySet: "service-reprioritization", phenomena: ["passive-voice"], documents: [
        { silo: "Leadership", text: "Service priorities were revised repeatedly." },
        { silo: "Care Ops", text: "Work was stopped and restarted after each revision." },
        { silo: "Performance", text: "Throughput fell in affected units." },
        { silo: "People", text: "Absence and fatigue rose in those units." },
      ]},
      { industry: "Government", style: "board-summary", terminologySet: "ministerial-pivots", phenomena: ["political-language"], documents: [
        { silo: "Policy", text: "Ministerial direction changed several times; each was reasonable in isolation." },
        { silo: "Programs", text: "Teams repeatedly abandoned active packages." },
        { silo: "Oversight", text: "Both milestone performance and workforce sustainability deteriorated where switching was greatest." },
      ]},
      { industry: "Professional Services", style: "slack", terminologySet: "client-pivots", phenomena: ["pronoun-reference"], documents: [
        { silo: "Partners", text: "We keep moving the must-win work." },
        { silo: "Delivery", text: "It strands drafts and sends people into new contexts." },
        { silo: "PMO", text: "That cohort is late." },
        { silo: "People", text: "It's also the cohort burning out." },
      ]},
    ],
  },
  {
    family: "shared-mediator-convergence", topology: "converging",
    expectedNodes: ["forecast volatility", "hiring delay", "capacity mismatch", "service backlog"],
    variants: [
      { industry: "Professional Services", style: "board-summary", terminologySet: "demand-capacity-gap", phenomena: ["mixed-terminology"], documents: [
        { silo: "Sales", text: "Demand signals swing materially between reviews." },
        { silo: "People", text: "Specialist hiring completes well after the planning window." },
        { silo: "Operations", text: "Together those patterns leave the wrong capacity in place when work arrives." },
        { silo: "Service", text: "Backlog grows where the mismatch is largest." },
      ]},
      { industry: "Healthcare", style: "operations-report", terminologySet: "care-capacity", phenomena: ["indirect"], documents: [
        { silo: "Demand", text: "Referral volume is revised sharply each month." },
        { silo: "Workforce", text: "Credentialing prevents rapid specialist deployment." },
        { silo: "Care Ops", text: "Available skill mix therefore misses the incoming case mix." },
        { silo: "Access", text: "Waitlists expand in the specialties with that gap." },
      ]},
      { industry: "Manufacturing", style: "meeting-notes", terminologySet: "load-skill-gap", phenomena: ["fragmented-structure"], documents: [
        { silo: "Commercial", text: "Order mix: unstable." },
        { silo: "People", text: "Certified technician ramp: two quarters." },
        { silo: "Plant", text: "Resulting load/skill gap visible by line." },
        { silo: "Service", text: "Queues accumulate on gap lines." },
      ]},
      { industry: "Government", style: "executive-email", terminologySet: "casework-resourcing", phenomena: ["hedging", "political-language"], documents: [
        { silo: "Demand", text: "Case arrivals remain hard to forecast." },
        { silo: "HR", text: "Security clearance means we cannot move trained people quickly." },
        { silo: "Leadership", text: "Neither is sufficient alone, but together they appear to put capacity in the wrong place." },
        { silo: "Service", text: "Unresolved cases accumulate wherever that mismatch persists." },
      ]},
    ],
  },
];

export const independentNegativeCorpus = [
  ["correlation", "Software", "finance-commentary", ["Traffic and defects rose together; nobody established direction."]],
  ["common-cause", "Healthcare", "meeting-notes", ["Winter demand plausibly increased both overtime and patient waits."]],
  ["reverse-causality", "Manufacturing", "operations-report", ["Late orders may be causing extra inspections rather than inspections causing lateness."]],
  ["political-blame", "Government", "executive-email", ["Leadership says Operations is the problem. No intermediate process was documented."]],
  ["incomplete", "Professional Services", "slack", ["Teams seem busier. Delivery feels slower."]],
  ["misleading-summary", "Software", "board-summary", ["The summary attributes churn to pricing, while interviews provide no supporting path."]],
  ["redundant", "Healthcare", "fragmented-bullets", ["Approval seems slow.", "Approval feels slow.", "Approval appears slow."]],
  ["one-silo", "Government", "meeting-notes", ["Legal documented the entire regulatory block within one memo."]],
  ["dense-unrelated", "Manufacturing", "operations-report", ["Absence rose; freight fell; temperature varied; benefits enrollment closed."]],
] as const;

export type PositiveCorpusEntry = typeof independentPositiveCorpus[number];
export type NegativeCorpusEntry = typeof independentNegativeCorpus[number];
