import type { Metadata } from "next";
import { notFound } from "next/navigation";

import RoleAwareExperience from "../../../components/role-aware/RoleAwareExperience";
import {
  assertFrontendSafeSerialization,
  getRoleAwareFixture,
  isRoleAwareFixtureExperienceEnabled,
  ROLE_AWARE_FIXTURE_IDS,
} from "../../../product/frontend/roleAwareLivingOrganization";
import { mapRoleAwarePresentation } from "../../../product/frontend/roleAwarePresentation";

export const metadata: Metadata = { title: "Role-Aware Living Organization · Development Fixture" };

export function generateStaticParams() {
  if (!isRoleAwareFixtureExperienceEnabled({
    nodeEnvironment: process.env.NODE_ENV,
    discoveryEnvironment: process.env.NEXT_PUBLIC_DISCOVERY_ENV,
  })) return [];
  return ROLE_AWARE_FIXTURE_IDS.map((fixtureId) => ({ fixtureId }));
}

export default async function RoleAwareAlphaFixturePage({ params, searchParams }: { params: Promise<{ fixtureId: string }>; searchParams: Promise<{ view?: string | string[] }> }) {
  if (!isRoleAwareFixtureExperienceEnabled({
    nodeEnvironment: process.env.NODE_ENV,
    discoveryEnvironment: process.env.NEXT_PUBLIC_DISCOVERY_ENV,
  })) notFound();
  const { fixtureId } = await params;
  const fixture = getRoleAwareFixture(fixtureId);
  if (!fixture) notFound();
  assertFrontendSafeSerialization(fixture.projection);
  const requestedView = (await searchParams).view;
  const workspace = requestedView === "understanding" ? "understanding"
    : requestedView === "decisions" ? "decision"
    : requestedView === "investigations" ? "investigation"
    : requestedView === "history" ? "history"
    : requestedView === "home" ? "home"
    : fixture.workspace;
  const mapped = mapRoleAwarePresentation(fixture);
  const navigatedHeading = workspace === fixture.workspace ? mapped.primaryHeading
    : workspace === "home" ? "What needs your attention"
    : workspace === "understanding" ? "What Discovery understands"
    : workspace === "decision" ? "Decision in context"
    : workspace === "investigation" ? "What remains unknown"
    : "Change and authorized history";
  const view = { ...mapped, workspace, primaryHeading: navigatedHeading };
  assertFrontendSafeSerialization(view);
  return <RoleAwareExperience view={view} fixtureMode />;
}
