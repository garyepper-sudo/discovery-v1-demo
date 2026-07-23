import type { Metadata } from "next";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";
import ExperimentExperience from "../../../components/product-shell/experiment/ExperimentExperience";

export const metadata: Metadata = { title: "Experiment" };
export default function ExperimentPage({ searchParams }: { searchParams: { organizationId?: string | string[] } }) {
  return <ProductWorkspace organizationId={searchParams.organizationId} renderExperiment={(view) => <ExperimentExperience view={view} />} />;
}
