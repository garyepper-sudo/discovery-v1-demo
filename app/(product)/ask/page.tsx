import type { Metadata } from "next";

import AskExperience from "../../../components/product-shell/ask/AskExperience";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";

export const metadata: Metadata = {
  title: "Ask",
};

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string | string[]; prompt?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const prompt = Array.isArray(resolvedSearchParams.prompt) ? resolvedSearchParams.prompt[0] : resolvedSearchParams.prompt;
  return (
    <ProductWorkspace
      organizationId={resolvedSearchParams.organizationId}
      askMessage={prompt}
      renderAsk={(view) => <AskExperience view={view} initialPrompt={prompt} />}
    />
  );
}
