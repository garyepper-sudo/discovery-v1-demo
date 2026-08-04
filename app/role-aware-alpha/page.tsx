import { notFound, redirect } from "next/navigation";

import { isRoleAwareFixtureExperienceEnabled } from "../../product/frontend/roleAwareLivingOrganization";

export default function RoleAwareAlphaIndex() {
  if (!isRoleAwareFixtureExperienceEnabled({
    nodeEnvironment: process.env.NODE_ENV,
    discoveryEnvironment: process.env.NEXT_PUBLIC_DISCOVERY_ENV,
  })) notFound();
  redirect("/role-aware-alpha/RA-01");
}
