import type { Metadata } from "next";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";
import ExperimentExperience from "../../../components/product-shell/experiment/ExperimentExperience";

export const metadata: Metadata = { title: "Experiment" };
export default async function ExperimentPage({ searchParams }: { searchParams: Promise<{ organizationId?: string | string[] }> }) {
  const resolvedSearchParams = await searchParams;
  return <ProductWorkspace organizationId={resolvedSearchParams.organizationId} renderExperiment={(view) => <ExperimentExperience view={view} />} />;
}
