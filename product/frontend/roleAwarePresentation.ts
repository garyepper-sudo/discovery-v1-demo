import type { AuthorizedMetricResult } from "../../engine/v3/governance/authorizedMetricLineage";
import type { ScopedDecisionCalibrationProjection } from "../integration/scopedDecisionCalibrationProjection";
import type { ScopedProductProjectionItem } from "../integration/scopedOrganizationalProductProjection";
import type { RoleAwareFixture, SemanticDisposition } from "./roleAwareLivingOrganization";

export const ROLE_AWARE_NAVIGATION = [
  "Home", "Understanding", "Questions", "Decisions", "Investigations", "History",
] as const;

export const HOME_SECTIONS = [
  { id: "attention", title: "What needs attention", question: "What needs my attention now?", kinds: ["risk", "contradiction", "uncertainty", "investigation-opportunity"] },
  { id: "change", title: "What changed", question: "What changed?", kinds: ["material-change"] },
  { id: "understanding", title: "What Discovery understands", question: "What does Discovery currently understand about my scope?", kinds: ["understanding", "objective-context", "dependency"] },
  { id: "decisions", title: "Decisions in context", question: "What decisions need review or have changed meaning?", kinds: [] },
  { id: "unknowns", title: "Unknowns to resolve", question: "What remains unknown or insufficiently supported?", kinds: ["evidence-gap", "open-question", "investigation-opportunity", "uncertainty"] },
  { id: "learning", title: "Outcomes and Learning", question: "What happened, and what did Discovery learn?", kinds: [] },
  { id: "measures", title: "Supported measures", question: "Which supported measures are available?", kinds: [] },
] as const;

export type PresentationItem = {
  id: string;
  kind: ScopedProductProjectionItem["kind"];
  disposition: "disclosed" | "safely-abstracted";
  title?: string;
  summary?: string;
  uncertainty?: string | null;
  safeLineage: string[];
  auditRefs: string[];
};

export type RoleAwarePresentation = {
  fixtureId?: RoleAwareFixture["fixtureId"];
  routePath?: string;
  liveDiagnostic?: {
    organizationId: string;
    requestedScope: string;
    sourceRevisionDigest: string | null;
  };
  description: string;
  roleDescription: string;
  scopeLabel: string;
  scopeType: string;
  temporalMode: "current" | "historical";
  evaluatedAt: string;
  projectionDisposition: RoleAwareFixture["projection"]["disposition"];
  workspace: RoleAwareFixture["workspace"];
  primaryHeading: string;
  primaryAction?: string;
  expectedDisposition: SemanticDisposition;
  items: PresentationItem[];
  metrics: AuthorizedMetricResult[];
  decisionCalibration: ScopedDecisionCalibrationProjection | null;
  unavailableKinds: string[];
  withheldItemCount: number | null;
  contractVersion: string;
  projectionId: string;
  auditRefs: string[];
};

type RoleAwarePresentationSource = Omit<RoleAwareFixture, "fixtureId"> & {
  fixtureId?: RoleAwareFixture["fixtureId"];
  routePath?: string;
  liveDiagnostic?: RoleAwarePresentation["liveDiagnostic"];
};

export function mapRoleAwarePresentation(fixture: RoleAwarePresentationSource): RoleAwarePresentation {
  const { projection } = fixture;
  const decisionCalibration = projection.decisionCalibration && "classification" in projection.decisionCalibration
    ? projection.decisionCalibration
    : null;
  return {
    ...(fixture.fixtureId ? { fixtureId: fixture.fixtureId } : {}),
    ...(fixture.routePath ? { routePath: fixture.routePath } : {}),
    ...(fixture.liveDiagnostic ? { liveDiagnostic: structuredClone(fixture.liveDiagnostic) } : {}),
    description: fixture.description,
    roleDescription: fixture.roleDescription,
    scopeLabel: fixture.scopeLabel,
    scopeType: projection.requestedScope.type,
    temporalMode: projection.temporalMode,
    evaluatedAt: projection.evaluatedAt,
    projectionDisposition: projection.disposition,
    workspace: fixture.workspace,
    primaryHeading: fixture.primaryHeading,
    ...(fixture.primaryAction ? { primaryAction: fixture.primaryAction } : {}),
    expectedDisposition: fixture.expectedDisposition,
    items: projection.items.map((item) => ({
      id: item.safeRef,
      kind: item.kind,
      disposition: item.disposition,
      ...(item.title ? { title: item.title } : {}),
      ...(item.summary ? { summary: item.summary } : {}),
      ...(item.uncertainty !== undefined ? { uncertainty: item.uncertainty } : {}),
      safeLineage: [...item.safeSupportingLineage],
      auditRefs: [...item.auditRefs],
    })),
    metrics: projection.metrics.map((metric) => structuredClone(metric)),
    decisionCalibration,
    unavailableKinds: [...projection.unavailableKinds],
    withheldItemCount: projection.withheldItemCount,
    contractVersion: projection.contractVersion,
    projectionId: projection.projectionId,
    auditRefs: [...projection.auditRefs],
  };
}
