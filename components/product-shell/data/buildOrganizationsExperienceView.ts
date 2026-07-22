import type { OrganizationSummary } from "../../../engine/v3/runtime";

import { buildProductHref } from "./productOrganization";

export type OrganizationsExperienceView = {
  organizations: Array<{
    organizationId: string;
    name: string;
    industry?: string;
    lastUpdated: string;
    investigationCount: string;
    destination: string;
  }>;
  createDestination: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function buildOrganizationsExperienceView(
  organizations: OrganizationSummary[],
): OrganizationsExperienceView {
  return {
    organizations: organizations.map((organization) => ({
      organizationId: organization.organizationId,
      name: organization.name,
      industry: organization.industry,
      lastUpdated: dateFormatter.format(new Date(organization.updatedAt)),
      investigationCount: `${organization.investigationCount} investigation${
        organization.investigationCount === 1 ? "" : "s"
      }`,
      destination: buildProductHref(
        "/your-organization",
        organization.organizationId,
      ),
    })),
    createDestination: "/discovery-v1",
  };
}
