import type { ExecutivePerspective, OrganizationGroundTruth, SyntheticEvidenceArtifact, SyntheticOrganizationSpec } from "./contracts";

const organizationId = "judgment-lab-atlas-industrial-001";

function artifact(id: string, title: string, artifactType: SyntheticEvidenceArtifact["artifactType"], authorRole: string, reliability: SyntheticEvidenceArtifact["reliability"], staleness: SyntheticEvidenceArtifact["staleness"], content: string, groundTruthTags: string[] = []): SyntheticEvidenceArtifact {
  return { id, organizationId, title, artifactType, authorRole, createdAt: `2026-06-${id.slice(-2)}T12:00:00.000Z`, reliability, staleness, content, groundTruthTags };
}

export const atlasIndustrialArtifacts: SyntheticEvidenceArtifact[] = [
  artifact("A01", "2026 profitable-growth strategy", "strategy", "CEO", "moderate", "current", "Atlas plans to grow aftermarket revenue, launch the Vector line, and restore operating margin without compromising delivery reliability."),
  artifact("A02", "Board operating update", "board-deck", "CEO", "moderate", "current", "Demand remains adequate, but margin recovery and delivery reliability are behind plan. Leadership describes execution focus as the central concern."),
  artifact("A03", "Monthly financial review", "financial-review", "CFO", "high", "current", "Gross margin is 310 basis points below plan. Expedite freight, overtime, rework, and delayed invoicing explain most of the variance; broad labor rates do not."),
  artifact("A04", "Decision-cycle operating review", "operating-review", "COO", "high", "current", "Twenty-seven cross-functional operating decisions took a median of nine days. Nineteen waited for executive approval although the teams had accountable functional owners.", ["decisive", "decision-authority"]),
  artifact("A05", "Commercial pipeline review", "sales-review", "VP Sales", "high", "current", "Qualified pipeline is 1.4 times plan. Quote exceptions and delivery commitments wait for Finance, Operations, and Product approval, reducing conversion."),
  artifact("A06", "Strategic customer interviews", "customer-feedback", "Customer Success", "moderate", "current", "Customers value product performance but report changing delivery dates and inconsistent answers about configuration commitments."),
  artifact("A07", "Enterprise systems health review", "other", "CIO", "high", "current", "ERP and CRM integration is incomplete, but core transaction availability is 99.95%. Manual reconciliation adds effort; approval waiting accounts for more elapsed time than system outages."),
  artifact("A08", "Decision-rights matrix", "policy", "Chief of Staff", "moderate", "stale", "A 2023 matrix says functional leaders own routine pricing, scheduling, and product tradeoffs. Current escalation practice no longer follows this document."),
  artifact("A09", "Vector integration status", "initiative-update", "Program Office", "moderate", "current", "Workstream leads report repeated priority resets after steering meetings. The program attributes delay to system integration and resource contention."),
  artifact("A10", "Executive leadership notes", "leadership-notes", "CEO", "moderate", "current", "Leaders agree decisions should move closer to the work, yet each function requests final review when a decision affects its targets."),
  artifact("A11", "Operating decision log", "decision-log", "Internal Audit", "high", "current", "Sixty-four percent of sampled routine decisions escalated at least one level. Escalated decisions were four times slower; decision quality scores were not higher.", ["decisive", "decision-authority"]),
  artifact("A12", "Vector product roadmap", "product-roadmap", "Chief Product Officer", "moderate", "aging", "The roadmap changed priority four times in eight weeks after unresolved sales, margin, and capacity tradeoffs reached the executive team."),
  artifact("A13", "Engineering delivery retrospective", "engineering-retrospective", "VP Engineering", "high", "current", "Teams completed planned technical work, then paused release decisions while executives reconciled product scope and customer exceptions."),
  artifact("A14", "Market and campaign review", "market-analysis", "CMO", "moderate", "current", "Campaign response and branded search are above plan. Marketing believes positioning is working, while late feasibility decisions are reducing realized revenue."),
  artifact("A15", "Capacity expansion proposal", "other", "Regional General Manager", "low", "current", "The organization keeps missing commitments because it does not have enough people. Hiring twenty percent more staff will solve delivery performance."),
  artifact("A16", "Current organization chart", "org-chart", "CHRO", "high", "current", "Functional ownership is explicit on the organization chart, but no cross-functional decision owner exists for quote-to-commit or product-priority tradeoffs."),
];

const ids = atlasIndustrialArtifacts.map((item) => item.id);
const without = (...excluded: string[]) => ids.filter((id) => !excluded.includes(id));

function perspective(id: string, role: string, includedArtifactIds: string[], primaryObjectives: string[], preferredMetrics: string[], likelyBlindSpots: string[], defaultHypotheses: string[]): ExecutivePerspective {
  return {
    id, role, level: "executive", primaryObjectives, preferredMetrics,
    typicalEvidenceSources: includedArtifactIds,
    decisionHorizon: role === "CEO" ? "12–36 months" : "3–18 months",
    riskOrientation: role === "CFO" || role === "CIO" ? "risk-controlled" : "balanced",
    likelyBlindSpots, defaultHypotheses,
    communicationPreferences: ["concise", "evidence-grounded", "explicit uncertainty"],
    evidenceAccess: { includedArtifactIds, excludedArtifactIds: ids.filter((artifactId) => !includedArtifactIds.includes(artifactId)) },
    knownFacts: [], unsupportedBeliefs: [],
  };
}

export const atlasIndustrialPerspectives: ExecutivePerspective[] = [
  perspective("atlas-ceo", "CEO", without("A07", "A13", "A15"), ["profitable growth", "delivery reliability", "enterprise alignment"], ["revenue", "margin", "delivery"], ["workflow-level waiting", "technical detail"], ["execution focus is insufficient"]),
  perspective("atlas-cfo", "CFO", ["A01", "A02", "A03", "A04", "A05", "A08", "A10", "A11", "A15", "A16"], ["margin recovery", "cash conversion", "controlled commitments"], ["gross margin", "expedite cost", "forecast accuracy"], ["customer experience", "technology debt"], ["cost discipline is inadequate"]),
  perspective("atlas-coo", "COO", ["A01", "A03", "A04", "A06", "A08", "A09", "A10", "A11", "A12", "A13", "A15", "A16"], ["delivery reliability", "decision throughput", "operating consistency"], ["cycle time", "on-time delivery", "rework"], ["market positioning"], ["capacity and handoffs constrain execution"]),
  perspective("atlas-cmo", "CMO", ["A01", "A02", "A05", "A06", "A09", "A12", "A14", "A15"], ["market growth", "pipeline conversion", "customer relevance"], ["pipeline", "conversion", "campaign response"], ["internal approval mechanics", "technology architecture"], ["positioning or segmentation limits growth"]),
  perspective("atlas-cio", "CIO", ["A01", "A02", "A04", "A07", "A08", "A09", "A10", "A11", "A13", "A16"], ["reliable systems", "integration", "technology governance"], ["availability", "manual work", "delivery throughput"], ["market demand", "commercial incentives"], ["platform fragmentation causes execution delay"]),
];

export const atlasFullCorpusPerspective = perspective("atlas-full-corpus", "Evaluation observer", ids, ["organization-wide judgment"], ["all available measures"], [], []);
export const atlasNarrowPerspective = perspective("atlas-narrow-commercial", "CMO narrow view", ["A05", "A06", "A14"], ["commercial growth"], ["pipeline", "conversion"], ["decision authority", "operations", "systems"], ["market execution is the binding issue"]);

export const atlasIndustrialOrganization: SyntheticOrganizationSpec = {
  id: organizationId,
  name: "Atlas Industrial Systems",
  industry: "Industrial automation and engineered equipment",
  maturity: "mid-market",
  usage: "development",
  description: "A multi-site industrial manufacturer integrating an acquired product line while pursuing profitable aftermarket growth.",
  investigationQuestion: "What is the highest-leverage organizational constraint limiting profitable growth and reliable delivery?",
  strategy: { statedPriorities: ["profitable growth", "Vector launch", "delivery reliability"], actualTradeoffs: ["functional targets over enterprise flow", "executive control over local decision speed"] },
  structure: { functions: ["Finance", "Operations", "Sales", "Marketing", "Product", "Engineering", "Technology", "People"], executiveRoles: ["CEO", "CFO", "COO", "CMO", "CIO"], decisionRights: ["routine decisions nominally delegated", "cross-functional tradeoffs escalate"] },
  operatingReality: { currentInitiatives: ["Vector integration", "margin recovery", "aftermarket growth"], measurableSymptoms: ["approval delay", "expedite cost", "changing delivery dates"], historicalEvents: ["2023 decision-rights redesign", "recent acquisition"], organizationalTensions: ["control versus speed", "functional targets versus enterprise flow"] },
  artifactIds: ids,
  perspectiveIds: atlasIndustrialPerspectives.map((item) => item.id),
  groundTruthId: "atlas-industrial-ground-truth-001",
};

export const atlasIndustrialGroundTruth: OrganizationGroundTruth = {
  id: "atlas-industrial-ground-truth-001",
  organizationId,
  dominantConstraint: { id: "decision-authority-ambiguity", label: "Decision authority ambiguity", rationale: "Nominal delegation is overridden by cross-functional escalation, creating approval queues and priority churn." },
  contributingConditions: ["Strategic Alignment", "Decision Flow", "Coordination System", "Execution Capacity"],
  causalMechanisms: ["approval dependency", "unclear cross-functional decision ownership", "priority conflict", "executive escalation"],
  misleadingExplanations: [
    { claim: "insufficient headcount", whyPlausible: "overtime and missed commitments are visible", whyIncompleteOrWrong: "waiting and rework consume capacity before staffing becomes binding" },
    { claim: "platform fragmentation", whyPlausible: "manual reconciliation exists", whyIncompleteOrWrong: "system availability is high and approval waiting dominates elapsed time" },
    { claim: "weak market positioning", whyPlausible: "conversion is below plan", whyIncompleteOrWrong: "demand indicators are healthy and commitment delays reduce conversion" },
  ],
  highestLeverageIntervention: { label: "Clarify decision rights and escalation boundaries", rationale: "Assign one cross-functional owner and reserve executive escalation for explicit exceptions." },
  acceptableAlternativeInterventions: ["delegate routine decision authority", "establish cross-functional decision ownership", "reduce approval dependency"],
  harmfulInterventions: ["increase headcount without changing decision flow", "centralize every operating decision", "replace core systems before resolving ownership"],
  criticalMissingEvidence: ["decision cycle time by decision type", "quality outcomes for delegated versus escalated decisions", "where cross-functional ownership is unresolved"],
  expectedUncertainty: ["whether delegation preserves decision quality", "whether the pattern persists after explicit ownership"],
  expectedRecommendationDisposition: "proceed",
  evidenceSensitivity: [{ evidenceChange: "remove the high-reliability decision-cycle review and decision log", expectedJudgmentEffect: "confidence should decline, uncertainty should rise, or the dominant judgment should change" }],
};

export const atlasDecisiveEvidenceIds = ["A04", "A11"];
