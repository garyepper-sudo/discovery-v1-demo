import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AlphaExperience from "../../../components/alpha/AlphaExperience";
import { alphaScenes, type AlphaScene } from "../../../product/alpha/viewModels";

export const metadata: Metadata = {
  title: "Experience Alpha",
  description: "Deterministic prototype of the Discovery Experience Alpha.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const dynamic = "force-dynamic";

export default function AlphaScenePage({
  params,
}: {
  params: { scene: string };
}) {
  if (!alphaScenes.includes(params.scene as AlphaScene)) {
    notFound();
  }

  return <AlphaExperience initialScene={params.scene as AlphaScene} />;
}
