import type { Metadata } from "next";

import ResearchExperience from "../../../components/product-shell/research/ResearchExperience";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchPage({
  searchParams,
}: {
  searchParams: { organizationId?: string | string[] };
}) {
  return (
    <ProductWorkspace
      organizationId={searchParams.organizationId}
      renderResearch={(view) => <ResearchExperience view={view} />}
    />
  );
}
