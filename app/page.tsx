import { redirect } from "next/navigation";

import { onboardingTestEnvironmentEnabled } from "../lib/environment/discoveryEnvironment";

export const dynamic = "force-dynamic";

export default function Home() {
  if (onboardingTestEnvironmentEnabled()) {
    redirect("/onboarding");
  }
  redirect("/organizations");
}
