import type { Metadata } from "next";

import DecisionsExperience from "../../../components/product-shell/decisions/DecisionsExperience";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";

export const metadata: Metadata = {
  title: "Decisions",
};

export default async function DecisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <ProductWorkspace
      organizationId={resolvedSearchParams.organizationId}
      renderDecisions={(view) => <DecisionsExperience view={view} />}
    />
  );
}
