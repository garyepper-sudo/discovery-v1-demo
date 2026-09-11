import type { WorldFixture } from "./contracts";

/* Public synthetic source bodies transcribed from Luna's frozen public corpus.
 * Scenario identifiers and source IDs are harness-internal and never exported to
 * the candidate. No expected conclusion, utility value, or private answer is here. */
export const GATE_2_WORLDS: WorldFixture[] = [
  {
    worldId: "world-01",
    sources: [
      { sourceId: "operations", recordedAt: "2026-01-10", knownAt: "2026-01-10", lines: [
        "2026-01-05 | Northstar Plastics | Line A scrap rate rose from 3.1% to 7.8% after a resin supplier change.",
        "2026-01-06 | Northstar Plastics | The supplier certificate lists the resin grade as R-17, matching the prior grade.",
        "2026-01-07 | Northstar Plastics | Line B uses the same operator roster and resin lot family but remains at 3.4% scrap.",
        "2026-01-08 | Northstar Plastics | A controlled trial with the prior resin reduced Line A scrap to 3.6% for one shift.",
        "2026-01-09 | Northstar Plastics | A maintenance inspection found intermittent heater overshoot on Line A.",
        "2026-01-10 | Northstar Plastics | The overshoot was corrected; three subsequent shifts measured 3.5%, 3.2%, and 3.3% scrap.",
      ] },
      { sourceId: "customer-notes", recordedAt: "2026-01-10", knownAt: "2026-01-10", lines: [
        "Customer complaint counts increased only for Line A batches.",
        "Complaints describe brittle edges, not contamination or color variance.",
        "No complaint identifies a supplier name or operator by name.",
      ] },
    ],
    scenarios: [
      { scenarioId: "m-01", question: "What should leadership understand and do about the current Line A scrap increase?", timeHorizon: { from: "2026-01-05", asOf: "2026-01-07" }, governedContext: { objectives: ["Reduce current scrap without unsupported causal attribution."], decisionRights: "Operations may authorize reversible diagnostic work.", escalationRequirements: "Escalate an irreversible supplier change for review.", reversibilityConstraint: "Prefer reversible tests while mechanisms remain distinguishable only by new evidence.", institutionalContext: "No additional policy or protected evidence is authorized." }, sourceSelections: [{ sourceId: "operations", lineNumbers: [1, 2, 3] }, { sourceId: "customer-notes" }] },
      { scenarioId: "m-02", question: "What should leadership understand and do about the current Line A scrap increase?", timeHorizon: { from: "2026-01-05", asOf: "2026-01-08" }, governedContext: { objectives: ["Choose the next reversible inquiry with decision relevance."], decisionRights: "Operations may authorize reversible diagnostic work.", escalationRequirements: "Escalate an irreversible supplier change for review.", reversibilityConstraint: "Do not treat a short controlled result as final causal identification.", institutionalContext: "No additional policy or protected evidence is authorized." }, sourceSelections: [{ sourceId: "operations", lineNumbers: [1, 2, 3, 4] }, { sourceId: "customer-notes" }] },
      { scenarioId: "m-03", question: "What is the current consequential state of the Line A scrap issue, including explanations that may no longer dominate?", timeHorizon: { from: "2026-01-05", asOf: "2026-01-10" }, governedContext: { objectives: ["Separate historical support from the current operating state."], decisionRights: "Operations may authorize reversible diagnostic work.", escalationRequirements: "Escalate an irreversible supplier change for review.", reversibilityConstraint: "Preserve viable alternatives and the applicability time of every mechanism.", institutionalContext: "No additional policy or protected evidence is authorized." }, sourceSelections: [{ sourceId: "operations" }, { sourceId: "customer-notes" }] },
    ],
  },
  {
    worldId: "world-02",
    sources: [
      { sourceId: "decision-brief", recordedAt: "2026-02-05", knownAt: "2026-02-05", lines: [
        "2026-02-01 | Meridian Foods | The board must choose between a $90k sensor retrofit and a $20k inspection cadence for the filling room.",
        "2026-02-02 | Meridian Foods | The retrofit can be installed during the next planned shutdown; the next shutdown is in 18 days.",
        "2026-02-03 | Meridian Foods | A missed temperature excursion costs an estimated $140k in rework and delay.",
        "2026-02-04 | Meridian Foods | Current logs record end-of-shift temperature, not continuous temperature.",
        "2026-02-05 | Meridian Foods | A two-day loaner sensor is available for $1,200 and can sample continuously.",
      ] },
      { sourceId: "supplier-email", recordedAt: "2026-02-06", knownAt: "2026-02-06", lines: [
        "2026-02-06 | Supplier | The retrofit's calibration certificate covers the target range but not the packaging line's vibration profile.",
        "2026-02-06 | Supplier | Loaner data can distinguish steady drift from short excursions if sampling is continuous.",
        "2026-02-06 | Supplier | No claim is made about whether an excursion will occur during the loan period.",
      ] },
    ],
    scenarios: [
      { scenarioId: "v-01", question: "Should the board acquire more information before choosing retrofit, inspection cadence, or deferring a change?", timeHorizon: { from: "2026-02-01", asOf: "2026-02-06" }, governedContext: { objectives: ["Choose an action by its expected decision value, including acquisition cost and delay."], decisionRights: "The board may choose retrofit, inspection cadence, or defer a change.", escalationRequirements: "Document the decision before the planned shutdown window closes.", reversibilityConstraint: "Inspection cadence and information acquisition are reversible; retrofit is not readily reversible after installation.", institutionalContext: "No additional policy or protected evidence is authorized." }, sourceSelections: [{ sourceId: "decision-brief" }, { sourceId: "supplier-email" }] },
      { scenarioId: "v-02", question: "Should the board acquire more information before choosing retrofit, inspection cadence, or deferring a change?", timeHorizon: { from: "2026-02-01", asOf: "2026-02-06" }, governedContext: { objectives: ["Choose an action by expected decision value under the stated deadline."], decisionRights: "The board may choose retrofit, inspection cadence, or defer a change.", escalationRequirements: "A decision is required before a two-day acquisition can complete.", reversibilityConstraint: "Inspection cadence is reversible; retrofit is not readily reversible after installation.", institutionalContext: "The factual evidence ledger is unchanged; only the decision deadline differs." }, sourceSelections: [{ sourceId: "decision-brief" }, { sourceId: "supplier-email" }] },
      { scenarioId: "v-03", question: "Should the board acquire more information before choosing retrofit, inspection cadence, or deferring a change?", timeHorizon: { from: "2026-02-01", asOf: "2026-02-06" }, governedContext: { objectives: ["Do not acquire information whose cost and delay cannot improve this decision."], decisionRights: "The board may choose retrofit, inspection cadence, or defer a change.", escalationRequirements: "Decide now; the decision cannot wait for a two-day acquisition.", reversibilityConstraint: "Inspection cadence is reversible; retrofit is not readily reversible after installation.", institutionalContext: "The factual evidence ledger is unchanged; only the available decision time differs." }, sourceSelections: [{ sourceId: "decision-brief" }, { sourceId: "supplier-email" }] },
    ],
  },
  {
    worldId: "world-03",
    sources: [
      { sourceId: "policy-practice", recordedAt: "2026-03-20", knownAt: "2026-03-20", lines: [
        "2026-03-01 | Cedar Transit | The published dispatch policy requires a second-person review for route changes.",
        "2026-03-02 | Cedar Transit | The dispatch manager declared that the review is mandatory on every route change.",
        "2026-03-03 | Cedar Transit | Audit records show 14 of 20 sampled route changes had a second-person review.",
        "2026-03-04 | Cedar Transit | The six unreviewed changes occurred during the overnight shift.",
        "2026-03-05 | Cedar Transit | A new overnight checklist adds a named review field and an escalation contact.",
        "2026-03-20 | Cedar Transit | A follow-up sample shows 19 of 20 route changes had a second-person review.",
      ] },
      { sourceId: "staff-interviews", recordedAt: "2026-03-20", knownAt: "2026-03-20", lines: [
        "Interview A | Overnight dispatcher | The old checklist had no place to record who reviewed the change.",
        "Interview B | Day dispatcher | We usually ask a colleague, but we did not always document it.",
        "Interview C | Auditor | The follow-up sample tests recorded review, not whether the review improved route quality.",
      ] },
    ],
    scenarios: [
      { scenarioId: "i-01", question: "What is required, declared, observed, inferred, permitted, likely, and unknown about route-change review?", timeHorizon: { from: "2026-03-01", asOf: "2026-03-04" }, governedContext: { objectives: ["Preserve institutional categories without promoting practice into permission."], decisionRights: "The dispatch manager may require corrective process follow-up but may not amend published policy.", escalationRequirements: "Escalate policy interpretation conflicts to the policy owner.", reversibilityConstraint: "Use reversible documentation/process changes while authority remains unchanged.", institutionalContext: "The published policy is binding during this horizon." }, sourceSelections: [{ sourceId: "policy-practice", lineNumbers: [1, 2, 3, 4] }, { sourceId: "staff-interviews", lineNumbers: [1, 2] }] },
      { scenarioId: "i-02", question: "What is required, declared, observed, inferred, permitted, likely, and unknown about route-change review?", timeHorizon: { from: "2026-03-01", asOf: "2026-03-04" }, governedContext: { objectives: ["Assess repeated noncompliance without converting it into authority."], decisionRights: "The dispatch manager may require corrective process follow-up but may not amend published policy.", escalationRequirements: "Escalate policy interpretation conflicts to the policy owner.", reversibilityConstraint: "Use reversible documentation/process changes while authority remains unchanged.", institutionalContext: "The factual evidence ledger is unchanged; repeated practice is not a policy amendment." }, sourceSelections: [{ sourceId: "policy-practice", lineNumbers: [1, 2, 3, 4] }, { sourceId: "staff-interviews", lineNumbers: [1, 2] }] },
      { scenarioId: "i-03", question: "What is required, declared, observed, inferred, permitted, likely, and unknown about route-change review?", timeHorizon: { from: "2026-03-01", asOf: "2026-03-20" }, governedContext: { objectives: ["Separate a later changed process and observed record from formal policy authority."], decisionRights: "The dispatch manager may require corrective process follow-up but may not amend published policy.", escalationRequirements: "Escalate policy interpretation conflicts to the policy owner.", reversibilityConstraint: "A checklist change is reversible and does not itself amend a binding policy.", institutionalContext: "The later checklist and follow-up observation are authorized context; policy authority remains governed by the published policy." }, sourceSelections: [{ sourceId: "policy-practice" }, { sourceId: "staff-interviews" }] },
      { scenarioId: "i-04", question: "What should change in the process for route-change review, while the factual ledger remains unchanged?", timeHorizon: { from: "2026-03-01", asOf: "2026-03-20" }, governedContext: { objectives: ["Choose a process response that respects the existing evidence threshold."], decisionRights: "The dispatch manager may require corrective process follow-up but may not amend published policy.", escalationRequirements: "Overnight exceptions require escalation through the named contact.", reversibilityConstraint: "Process changes remain reversible; binding-policy changes require the policy owner.", institutionalContext: "The factual evidence ledger is fixed. Only decision rights, escalation requirements, and reversibility constraints are stated differently." }, sourceSelections: [{ sourceId: "policy-practice" }, { sourceId: "staff-interviews" }] },
    ],
  },
  {
    worldId: "world-04",
    sources: [
      { sourceId: "open-index", recordedAt: "2026-04-03", knownAt: "2026-04-03", lines: [
        "2026-04-01 | Harbor Mutual | The claims team is evaluating a new triage queue for storm-related claims.",
        "2026-04-02 | Harbor Mutual | Publicly visible metrics report queue age, staffing, and total claims.",
        "2026-04-03 | Harbor Mutual | The team may compare two staffing schedules after authorization.",
      ] },
      { sourceId: "access-controlled-experiment", recordedAt: "2026-04-03", knownAt: "2026-04-03", lines: [
        "Packet R contains the same synthetic staffing experiment for P0 and P1.",
        "Trial A: four agents on the first shift; median queue age 42 minutes.",
        "Trial B: three agents on the first shift and one on the second; median queue age 31 minutes.",
        "Packet R does not identify a person, customer, or real organization.",
      ] },
    ],
    scenarios: [
      { scenarioId: "p-00", question: "What can the recipient conclude now about staffing schedules for the triage queue?", timeHorizon: { from: "2026-04-01", asOf: "2026-04-03" }, governedContext: { objectives: ["Provide an assessment only within the recipient's authorized evidence scope."], decisionRights: "The recipient may request authorized comparison evidence.", escalationRequirements: "Do not disclose or act on evidence outside the current grant.", reversibilityConstraint: "Do not commit to a schedule without authorized support.", institutionalContext: "Current access grant includes only the supplied open evidence." }, sourceSelections: [{ sourceId: "open-index" }] },
      { scenarioId: "p-01", question: "What can the recipient conclude now about staffing schedules for the triage queue?", timeHorizon: { from: "2026-04-01", asOf: "2026-04-03" }, governedContext: { objectives: ["Provide an assessment only within the recipient's authorized evidence scope."], decisionRights: "The recipient may request authorized comparison evidence.", escalationRequirements: "Do not disclose or act on evidence outside the current grant.", reversibilityConstraint: "Do not commit to a schedule without authorized support.", institutionalContext: "Current access grant includes only the supplied open evidence." }, sourceSelections: [{ sourceId: "open-index" }] },
      { scenarioId: "p-02", question: "What can the recipient conclude now about staffing schedules for the triage queue?", timeHorizon: { from: "2026-04-01", asOf: "2026-04-03" }, governedContext: { objectives: ["Provide an assessment only within the recipient's authorized evidence scope."], decisionRights: "The recipient may assess the authorized staffing comparison.", escalationRequirements: "Cite only the evidence currently authorized.", reversibilityConstraint: "Do not commit to a schedule without authorized support.", institutionalContext: "A legitimate access grant includes the supplied access-controlled comparison evidence." }, sourceSelections: [{ sourceId: "open-index" }, { sourceId: "access-controlled-experiment" }] },
      { scenarioId: "p-03", question: "What can the recipient conclude now about staffing schedules for the triage queue?", timeHorizon: { from: "2026-04-01", asOf: "2026-04-03" }, governedContext: { objectives: ["Provide an assessment only within the recipient's authorized evidence scope."], decisionRights: "The recipient may request authorized comparison evidence.", escalationRequirements: "Do not disclose or act on evidence outside the current grant.", reversibilityConstraint: "Do not commit to a schedule without authorized support.", institutionalContext: "Current access grant includes only the supplied open evidence." }, sourceSelections: [{ sourceId: "open-index" }] },
    ],
  },
];
