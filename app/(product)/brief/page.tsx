import type { Metadata } from "next";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";
import BriefExperience from "../../../components/product-shell/brief/BriefExperience";

export const metadata: Metadata = { title: "Brief" };
export default function BriefPage({ searchParams }: { searchParams: { organizationId?: string | string[]; template?: string | string[] } }) {
  const template = Array.isArray(searchParams.template) ? searchParams.template[0] : searchParams.template;
  return <ProductWorkspace organizationId={searchParams.organizationId} renderBrief={(view) => <BriefExperience view={view} initialTemplate={template} />} />;
}
