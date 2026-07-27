import type { Metadata } from "next";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";
import BriefExperience from "../../../components/product-shell/brief/BriefExperience";

export const metadata: Metadata = { title: "Brief" };
export default async function BriefPage({ searchParams }: { searchParams: Promise<{ organizationId?: string | string[]; template?: string | string[] }> }) {
  const resolvedSearchParams = await searchParams;
  const template = Array.isArray(resolvedSearchParams.template) ? resolvedSearchParams.template[0] : resolvedSearchParams.template;
  return <ProductWorkspace organizationId={resolvedSearchParams.organizationId} renderBrief={(view) => <BriefExperience view={view} initialTemplate={template} />} />;
}
