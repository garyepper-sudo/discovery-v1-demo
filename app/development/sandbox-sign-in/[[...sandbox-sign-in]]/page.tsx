import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { resolvePersonaForSignedInUser } from "../../../../lib/access/sandboxMultiUserAccess";
import { validateOnboardingTestEnvironment } from "../../../../lib/environment/discoveryEnvironment";
import { isHostedDiscoveryEnvironment } from "../../../../lib/production-route-policy";
import { SandboxSignInClient, SandboxSignOutClient } from "../SandboxSignInClient";

export const dynamic = "force-dynamic";

export default async function SandboxSignInPage() {
  try {
    if (
      isHostedDiscoveryEnvironment() ||
      validateOnboardingTestEnvironment().environment !== "development"
    ) notFound();
  } catch {
    notFound();
  }

  const { userId } = await auth();
  if (userId && resolvePersonaForSignedInUser(userId)) {
    redirect("/product-alpha/leadership-conversation");
  }

  return (
    <main>
      <h1>Development sandbox sign-in</h1>
      <p>This local-only entry uses the existing Clerk development boundary.</p>
      {userId ? (
        <>
          <p role="status">The current Clerk session is not assigned to this development sandbox.</p>
          <SandboxSignOutClient />
        </>
      ) : (
        <SandboxSignInClient />
      )}
    </main>
  );
}
