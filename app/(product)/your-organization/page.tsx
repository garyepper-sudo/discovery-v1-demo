import type { Metadata } from "next";

import UnifiedExecutiveWorkspace from "../../../components/product-shell/unified/UnifiedExecutiveWorkspace";
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
      renderUnified={(view) => <UnifiedExecutiveWorkspace view={view} />}
    />
  );
}
