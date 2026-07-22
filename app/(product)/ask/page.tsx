import type { Metadata } from "next";

import AskExperience from "../../../components/product-shell/ask/AskExperience";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";

export const metadata: Metadata = {
  title: "Ask",
};

export default function AskPage({
  searchParams,
}: {
  searchParams: { organizationId?: string | string[] };
}) {
  return (
    <ProductWorkspace
      organizationId={searchParams.organizationId}
      renderAsk={(view) => <AskExperience view={view} />}
    />
  );
}
