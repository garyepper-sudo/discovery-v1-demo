import type { Metadata } from "next";

import AskExperience from "../../../components/product-shell/ask/AskExperience";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";

export const metadata: Metadata = {
  title: "Ask",
};

export default function AskPage({
  searchParams,
}: {
  searchParams: { organizationId?: string | string[]; prompt?: string | string[] };
}) {
  return (
    <ProductWorkspace
      organizationId={searchParams.organizationId}
      renderAsk={(view) => <AskExperience view={view} initialPrompt={Array.isArray(searchParams.prompt) ? searchParams.prompt[0] : searchParams.prompt} />}
    />
  );
}
