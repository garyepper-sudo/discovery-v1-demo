import type { Metadata } from "next";

import DecisionsExperience from "../../../components/product-shell/decisions/DecisionsExperience";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";

export const metadata: Metadata = {
  title: "Decisions",
};

export default function DecisionsPage({
  searchParams,
}: {
  searchParams: { organizationId?: string | string[] };
}) {
  return (
    <ProductWorkspace
      organizationId={searchParams.organizationId}
      renderDecisions={(view) => <DecisionsExperience view={view} />}
    />
  );
}
