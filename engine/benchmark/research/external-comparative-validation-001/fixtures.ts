import type { ComparativeCase, EvidenceRecord, GroundTruth } from "./types";

const at = (day: number) => `2026-01-${String(day).padStart(2, "0")}T12:00:00.000Z`;
const evidence = (id: string, day: number, content: string, permissionScope: EvidenceRecord["permissionScope"] = "all-benchmark-treatments"): EvidenceRecord => ({ id, observedAt: at(day), permissionScope, content });
const truth = (input: Partial<GroundTruth> & Pick<GroundTruth, "materialFacts">): GroundTruth => ({
  contradictions: [], supportedMechanisms: [], unsupportedMechanisms: [], uncertainties: [], conditions: [],
  primaryConstraint: null, highValueMissingEvidence: [], decisionImplications: [], expectedAbstention: false, ...input,
});

export const comparativeCases: ComparativeCase[] = [
  {
    caseId: "linear-fulfillment", organizationId: "benchmark-org-linear-fulfillment", title: "Linear fulfillment bottleneck", industry: "Distribution", size: "medium", structure: "single-site functional", question: "Why are customer shipments late?", scenarioTypes: ["linear", "complete-evidence"], holdout: false,
    evidence: [
      evidence("lf-1", 2, "Packing capacity fell below daily order volume after one packing line failed."),
      evidence("lf-2", 3, "Orders wait in a packing queue; carrier pickup and inventory availability remain on schedule."),
      evidence("lf-3", 12, "The packing line was restored and the packing queue returned to normal within three days."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["lf-1", "lf-2"], groundTruth: truth({ materialFacts: ["packing-capacity-low", "packing-queue-high", "carrier-on-time", "inventory-available"], supportedMechanisms: ["packing-capacity-causes-delay"], unsupportedMechanisms: ["carrier-causes-delay", "inventory-causes-delay"], conditions: ["fulfillment-constrained"], primaryConstraint: "packing-capacity", highValueMissingEvidence: ["packing-restoration-outcome"], decisionImplications: ["restore-packing-capacity"] }) },
      { phaseId: "update", evidenceIds: ["lf-1", "lf-2", "lf-3"], groundTruth: truth({ materialFacts: ["packing-capacity-restored", "packing-queue-normal"], supportedMechanisms: ["packing-capacity-causes-delay"], unsupportedMechanisms: ["carrier-causes-delay", "inventory-causes-delay"], conditions: ["fulfillment-recovering"], primaryConstraint: null, decisionImplications: ["monitor-packing-capacity"] }) },
    ],
  },
  {
    caseId: "department-conflict", organizationId: "benchmark-org-department-conflict", title: "Conflicting departmental explanations", industry: "SaaS", size: "large", structure: "matrix", question: "Why are enterprise implementations delayed?", scenarioTypes: ["contradiction", "departmental-conflict"], holdout: false,
    evidence: [
      evidence("dc-1", 2, "Sales reports that implementation delays are caused by slow engineering integration work."),
      evidence("dc-2", 3, "Engineering reports integration work begins on time but customer requirements arrive incomplete from Sales."),
      evidence("dc-3", 4, "Audit logs show 68 percent of delayed implementations lacked approved requirements at engineering kickoff."),
      evidence("dc-4", 11, "A requirements gate pilot reduced delayed kickoffs while engineering cycle time remained unchanged."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["dc-1", "dc-2", "dc-3"], groundTruth: truth({ materialFacts: ["sales-blames-engineering", "engineering-blames-requirements", "requirements-incomplete"], contradictions: [{ id: "dc-conflict", left: "engineering-slow", right: "requirements-incomplete" }], supportedMechanisms: ["requirements-quality-causes-delay"], unsupportedMechanisms: ["engineering-speed-causes-delay"], uncertainties: ["requirements-gate-effect"], conditions: ["handoff-friction"], primaryConstraint: "requirements-quality", highValueMissingEvidence: ["requirements-gate-outcome"], decisionImplications: ["test-requirements-gate"] }) },
      { phaseId: "update", evidenceIds: ["dc-1", "dc-2", "dc-3", "dc-4"], groundTruth: truth({ materialFacts: ["requirements-gate-reduced-delay", "engineering-cycle-unchanged"], contradictions: [{ id: "dc-conflict", left: "engineering-slow", right: "requirements-incomplete" }], supportedMechanisms: ["requirements-quality-causes-delay"], unsupportedMechanisms: ["engineering-speed-causes-delay"], conditions: ["handoff-friction-improving"], primaryConstraint: "requirements-quality", decisionImplications: ["adopt-requirements-gate"] }) },
    ],
  },
  {
    caseId: "incomplete-retention", organizationId: "benchmark-org-incomplete-retention", title: "Incomplete retention evidence", industry: "Subscription media", size: "small", structure: "functional", question: "Why is subscriber retention falling?", scenarioTypes: ["incomplete-evidence", "abstention"], holdout: false,
    evidence: [
      evidence("ir-1", 2, "Subscriber retention declined during the quarter."),
      evidence("ir-2", 3, "The pricing team changed annual plan pricing, but no cohort or cancellation-reason data is available."),
      evidence("ir-3", 12, "Cohort data shows the decline is concentrated among users experiencing repeated playback failures, not among repriced annual plans."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["ir-1", "ir-2"], groundTruth: truth({ materialFacts: ["retention-declined", "pricing-changed", "cohort-data-missing"], uncertainties: ["retention-cause-unknown"], highValueMissingEvidence: ["retention-cohort-analysis", "cancellation-reasons"], expectedAbstention: true }) },
      { phaseId: "update", evidenceIds: ["ir-1", "ir-2", "ir-3"], groundTruth: truth({ materialFacts: ["retention-declined", "playback-failures-concentrated", "repricing-not-concentrated"], supportedMechanisms: ["playback-failure-causes-churn"], unsupportedMechanisms: ["pricing-causes-churn"], conditions: ["product-reliability-constrained"], primaryConstraint: "playback-reliability", decisionImplications: ["prioritize-playback-reliability"] }) },
    ],
  },
  {
    caseId: "misleading-utilization", organizationId: "benchmark-org-misleading-utilization", title: "Plausible misleading utilization signal", industry: "Healthcare", size: "large", structure: "regional network", question: "Why are appointment waits increasing?", scenarioTypes: ["misleading-evidence", "negative-control"], holdout: false,
    evidence: [
      evidence("mu-1", 2, "A regional memo attributes longer waits to clinician utilization reaching 94 percent."),
      evidence("mu-2", 3, "The utilization metric includes protected administrative time as available clinical capacity."),
      evidence("mu-3", 4, "Scheduling records show 27 percent of appointment slots are released fewer than two days before service."),
      evidence("mu-4", 12, "Earlier slot release reduced waits without changing clinician staffing or measured utilization."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["mu-1", "mu-2", "mu-3"], groundTruth: truth({ materialFacts: ["utilization-metric-misleading", "slots-released-late"], contradictions: [{ id: "mu-conflict", left: "clinician-capacity-low", right: "capacity-metric-invalid" }], supportedMechanisms: ["late-slot-release-causes-wait"], unsupportedMechanisms: ["clinician-utilization-causes-wait"], conditions: ["scheduling-constrained"], primaryConstraint: "slot-release-timing", highValueMissingEvidence: ["early-release-outcome"], decisionImplications: ["test-earlier-slot-release"] }) },
      { phaseId: "update", evidenceIds: ["mu-1", "mu-2", "mu-3", "mu-4"], groundTruth: truth({ materialFacts: ["early-release-reduced-wait", "staffing-unchanged", "utilization-unchanged"], supportedMechanisms: ["late-slot-release-causes-wait"], unsupportedMechanisms: ["clinician-utilization-causes-wait"], conditions: ["scheduling-improving"], primaryConstraint: "slot-release-timing", decisionImplications: ["adopt-earlier-slot-release"] }) },
    ],
  },
  {
    caseId: "branching-quality", organizationId: "benchmark-org-branching-quality", title: "Branching quality mechanism", industry: "Manufacturing", size: "large", structure: "multi-plant", question: "Why are customer returns increasing?", scenarioTypes: ["branching-causality"], holdout: false,
    evidence: [
      evidence("bq-1", 2, "A supplier material change increased dimensional variation."),
      evidence("bq-2", 3, "Dimensional variation increases both assembly rework and calibration drift."),
      evidence("bq-3", 4, "Assembly rework and calibration drift independently increase customer returns."),
      evidence("bq-4", 12, "Restoring the prior material specification reduced both rework and calibration drift before returns fell."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["bq-1", "bq-2", "bq-3"], groundTruth: truth({ materialFacts: ["material-variation-increased", "rework-increased", "calibration-drift-increased", "returns-increased"], supportedMechanisms: ["material-variation-branches-to-returns"], conditions: ["quality-system-constrained"], primaryConstraint: "material-variation", highValueMissingEvidence: ["material-restoration-outcome"], decisionImplications: ["restore-material-specification"] }) },
      { phaseId: "update", evidenceIds: ["bq-1", "bq-2", "bq-3", "bq-4"], groundTruth: truth({ materialFacts: ["material-spec-restored", "rework-reduced", "calibration-drift-reduced", "returns-fell"], supportedMechanisms: ["material-variation-branches-to-returns"], conditions: ["quality-system-recovering"], primaryConstraint: null, decisionImplications: ["monitor-material-variation"] }) },
    ],
  },
  {
    caseId: "converging-delivery", organizationId: "benchmark-org-converging-delivery", title: "Converging delivery causes", industry: "Professional services", size: "medium", structure: "project matrix", question: "Why are projects missing delivery dates?", scenarioTypes: ["converging-causes"], holdout: false,
    evidence: [
      evidence("cd-1", 2, "Late client approvals reduce the time available for delivery."),
      evidence("cd-2", 3, "Specialist staffing gaps also reduce delivery capacity."),
      evidence("cd-3", 4, "Projects with both late approvals and staffing gaps miss dates at a much higher rate than projects with either alone."),
      evidence("cd-4", 12, "Approval timing improved, but projects with specialist gaps continued to miss dates."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["cd-1", "cd-2", "cd-3"], groundTruth: truth({ materialFacts: ["approvals-late", "specialist-staffing-low", "combined-risk-high"], supportedMechanisms: ["approval-and-staffing-converge-on-delay"], conditions: ["delivery-capacity-constrained"], primaryConstraint: "combined-approval-staffing", highValueMissingEvidence: ["separate-cause-outcomes"], decisionImplications: ["address-approval-and-staffing"] }) },
      { phaseId: "update", evidenceIds: ["cd-1", "cd-2", "cd-3", "cd-4"], groundTruth: truth({ materialFacts: ["approvals-improved", "specialist-staffing-low", "delays-persist"], supportedMechanisms: ["specialist-staffing-causes-delay"], unsupportedMechanisms: ["approval-alone-causes-current-delay"], conditions: ["delivery-capacity-constrained"], primaryConstraint: "specialist-staffing", decisionImplications: ["address-specialist-staffing"] }) },
    ],
  },
  {
    caseId: "changing-mechanism", organizationId: "benchmark-org-changing-mechanism", title: "Mechanism changes over time", industry: "Financial services", size: "large", structure: "centralized operations", question: "Why is account opening slow?", scenarioTypes: ["longitudinal-change", "volatility"], holdout: false,
    evidence: [
      evidence("cm-1", 2, "Manual compliance review creates most account-opening delay."),
      evidence("cm-2", 3, "Operations queue time is otherwise stable."),
      evidence("cm-3", 12, "Compliance review was automated, but a new identity-provider outage now creates most account-opening delay."),
      evidence("cm-4", 13, "Manual review time is now normal while identity verification retries have tripled."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["cm-1", "cm-2"], groundTruth: truth({ materialFacts: ["manual-review-slow", "operations-queue-stable"], supportedMechanisms: ["manual-review-causes-delay"], conditions: ["compliance-review-constrained"], primaryConstraint: "manual-compliance-review", highValueMissingEvidence: ["automation-outcome"], decisionImplications: ["automate-compliance-review"] }) },
      { phaseId: "update", evidenceIds: ["cm-1", "cm-2", "cm-3", "cm-4"], groundTruth: truth({ materialFacts: ["manual-review-normal", "identity-retries-tripled", "identity-outage-active"], supportedMechanisms: ["identity-provider-causes-delay"], unsupportedMechanisms: ["manual-review-causes-current-delay"], conditions: ["identity-integration-constrained"], primaryConstraint: "identity-provider", decisionImplications: ["stabilize-identity-provider"] }) },
    ],
  },
  {
    caseId: "irrelevant-noise", organizationId: "benchmark-org-irrelevant-noise", title: "Irrelevant evidence resistance", industry: "Retail", size: "medium", structure: "regional", question: "Why is store replenishment late?", scenarioTypes: ["irrelevant-noise", "holdout"], holdout: true,
    evidence: [
      evidence("in-1", 2, "Warehouse pick-list batching delays replenishment dispatch by one day."),
      evidence("in-2", 3, "Store receiving teams process dispatched replenishment on time."),
      evidence("in-noise-1", 4, "The holiday marketing campaign exceeded social engagement targets."),
      evidence("in-noise-2", 5, "The office cafeteria introduced a new menu."),
      evidence("in-3", 12, "Hourly pick-list release removed the dispatch delay while store receiving time was unchanged."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["in-1", "in-2", "in-noise-1", "in-noise-2"], groundTruth: truth({ materialFacts: ["pick-batching-delays-dispatch", "store-receiving-on-time"], supportedMechanisms: ["pick-batching-causes-replenishment-delay"], unsupportedMechanisms: ["marketing-causes-replenishment-delay"], conditions: ["warehouse-flow-constrained"], primaryConstraint: "pick-list-batching", highValueMissingEvidence: ["hourly-release-outcome"], decisionImplications: ["test-hourly-pick-release"] }) },
      { phaseId: "update", evidenceIds: ["in-1", "in-2", "in-noise-1", "in-noise-2", "in-3"], groundTruth: truth({ materialFacts: ["hourly-release-removed-delay", "store-receiving-unchanged"], supportedMechanisms: ["pick-batching-causes-replenishment-delay"], conditions: ["warehouse-flow-recovering"], primaryConstraint: null, decisionImplications: ["retain-hourly-pick-release"] }) },
    ],
  },
  {
    caseId: "stale-pipeline", organizationId: "benchmark-org-stale-pipeline", title: "Stale evidence", industry: "Business services", size: "small", structure: "sales-led", question: "Why is pipeline conversion weak?", scenarioTypes: ["stale-evidence"], holdout: false,
    evidence: [
      evidence("sp-1", 1, "A year-old review found slow proposal turnaround reduced conversion."),
      evidence("sp-2", 2, "Proposal turnaround was improved six months ago."),
      evidence("sp-3", 12, "Current losses are concentrated in deals without executive sponsorship; proposal turnaround is now on target."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["sp-1", "sp-2"], groundTruth: truth({ materialFacts: ["proposal-evidence-stale", "proposal-turnaround-improved"], uncertainties: ["current-conversion-cause-unknown"], highValueMissingEvidence: ["current-win-loss-analysis"], expectedAbstention: true }) },
      { phaseId: "update", evidenceIds: ["sp-1", "sp-2", "sp-3"], groundTruth: truth({ materialFacts: ["executive-sponsorship-missing", "proposal-turnaround-on-target"], supportedMechanisms: ["missing-sponsorship-causes-loss"], unsupportedMechanisms: ["proposal-turnaround-causes-current-loss"], conditions: ["deal-sponsorship-constrained"], primaryConstraint: "executive-sponsorship", decisionImplications: ["improve-executive-sponsorship"] }) },
    ],
  },
  {
    caseId: "strict-abstention", organizationId: "benchmark-org-strict-abstention", title: "Strict abstention under permission limits", industry: "Biotechnology", size: "medium", structure: "research portfolio", question: "Why did the trial miss its efficacy target?", scenarioTypes: ["strict-abstention", "permission-boundary", "holdout"], holdout: true,
    evidence: [
      evidence("sa-1", 2, "The trial missed its efficacy target."),
      evidence("sa-2", 3, "Blinded subgroup and protocol-deviation data are restricted and unavailable to this benchmark scope."),
      evidence("sa-3", 12, "No additional authorized evidence became available."),
    ],
    phases: [
      { phaseId: "initial", evidenceIds: ["sa-1", "sa-2"], groundTruth: truth({ materialFacts: ["efficacy-target-missed", "causal-data-restricted"], uncertainties: ["efficacy-cause-unknown"], highValueMissingEvidence: ["authorized-subgroup-analysis", "authorized-protocol-deviation-analysis"], expectedAbstention: true }) },
      { phaseId: "update", evidenceIds: ["sa-1", "sa-2", "sa-3"], groundTruth: truth({ materialFacts: ["efficacy-target-missed", "causal-data-restricted", "no-new-authorized-evidence"], uncertainties: ["efficacy-cause-unknown"], highValueMissingEvidence: ["authorized-subgroup-analysis", "authorized-protocol-deviation-analysis"], expectedAbstention: true }) },
    ],
  },
];
