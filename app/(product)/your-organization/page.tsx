import type { Metadata } from "next";

import CurrentUnderstanding from "../../../components/product-shell/CurrentUnderstanding";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";

export const metadata: Metadata = {
  title: "Your Organization",
};

export default function YourOrganizationPage({
  searchParams,
}: {
  searchParams: { organizationId?: string | string[] };
}) {
  return (
    <ProductWorkspace
      organizationId={searchParams.organizationId}
      renderOrganization={(view) => <CurrentUnderstanding view={view} />}
    />
  );
}
