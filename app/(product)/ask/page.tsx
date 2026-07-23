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
  const prompt = Array.isArray(searchParams.prompt) ? searchParams.prompt[0] : searchParams.prompt;
  return (
    <ProductWorkspace
      organizationId={searchParams.organizationId}
      askMessage={prompt}
      renderAsk={(view) => <AskExperience view={view} initialPrompt={prompt} />}
    />
  );
}
