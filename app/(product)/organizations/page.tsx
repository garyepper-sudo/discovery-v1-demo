import type { Metadata } from "next";

import OrganizationsExperience from "../../../components/product-shell/organizations/OrganizationsExperience";
import { buildOrganizationsExperienceView } from "../../../components/product-shell/data/buildOrganizationsExperienceView";
import { listOrganizations } from "../../../engine/v3/runtime";

export const metadata: Metadata = {
  title: "Organizations",
};

export const dynamic = "force-dynamic";

export default function OrganizationsPage() {
  const view = buildOrganizationsExperienceView(listOrganizations());

  return <OrganizationsExperience view={view} />;
}
