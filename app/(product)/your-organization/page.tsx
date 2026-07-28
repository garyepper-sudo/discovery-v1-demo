import type { Metadata } from "next";
import { headers } from "next/headers";
import { SignedIn } from "@clerk/nextjs";

import AlphaExperience from "../../../components/alpha/AlphaExperience";
import ClerkSessionTerminationControl from "../../../components/product-shell/ClerkSessionTerminationControl";
import UnifiedExecutiveWorkspace from "../../../components/product-shell/unified/UnifiedExecutiveWorkspace";
import ProductWorkspace from "../../../components/product-shell/ProductWorkspace";
import DiscoveryShell from "../../../components/product-shell/DiscoveryShell";
import styles from "../../../components/product-shell/ProductWorkspace.module.css";
import { loadActivatedYourOrganization } from "../../../components/product-shell/data/loadActivatedYourOrganization";
import { buildProductHref } from "../../../components/product-shell/data/productOrganization";
import { buildDiscoveryExperienceView } from "../../../components/product-shell/data/buildDiscoveryExperienceView";
import {
  isYourOrganizationAlphaPresentationEnabled,
} from "../../../lib/alpha-activation/config";
import {
  alphaScenes,
  type AlphaScene,
} from "../../../product/alpha/viewModels";

export const metadata: Metadata = {
  title: "Your Organization",
};

const stateMessage = {
  "authentication-required": {
    title: "Sign in to access your organization.",
    explanation: "Discovery could not verify an authenticated design-partner session.",
  },
  "organization-required": {
    title: "Discovery could not resolve an organization you are authorized to access.",
    explanation: "Access is unavailable for this authenticated session.",
  },
  "access-denied": {
    title: "You do not have access to this organization.",
    explanation: "Discovery found no active Alpha access record for this identity and organization.",
  },
  "runtime-unavailable": {
    title: "Your Organization is temporarily unavailable.",
    explanation: "Discovery could not load the authorized Organization Runtime.",
  },
  "projection-unavailable": {
    title: "Organizational Understanding is not yet available.",
    explanation: "The authorized Runtime does not yet contain an authority-qualified projection.",
  },
  "communication-unavailable": {
    title: "Product communication is not yet available.",
    explanation: "Discovery withheld the view because no authorized readable communication is available.",
  },
  "activation-unavailable": {
    title: "Your Organization is temporarily unavailable.",
    explanation: "The Alpha activation boundary is not completely configured.",
  },
} as const;

export default async function YourOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{
    organizationId?: string | string[];
    scene?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  if (!isYourOrganizationAlphaPresentationEnabled()) {
    return (
      <ProductWorkspace
        organizationId={resolvedSearchParams.organizationId}
        renderUnified={(view) => <UnifiedExecutiveWorkspace view={view} />}
      />
    );
  }

  const requestHeaders = await headers();
  const activated = await loadActivatedYourOrganization(
    resolvedSearchParams.organizationId,
    requestHeaders.get("x-discovery-request-id") ?? crypto.randomUUID(),
  );
  if (activated.status === "available") {
    const requestedScene =
      typeof resolvedSearchParams.scene === "string" &&
      alphaScenes.includes(resolvedSearchParams.scene as AlphaScene)
        ? resolvedSearchParams.scene as AlphaScene
        : "home";
    return (
      <AlphaExperience
        initialScene={requestedScene}
        experience={buildDiscoveryExperienceView({
          runtime: activated.runtime,
          view: activated.view,
        })}
        hosted
        sessionControl={(
          <SignedIn>
            <ClerkSessionTerminationControl />
          </SignedIn>
        )}
      />
    );
  }

  const message = stateMessage[activated.status];
  const requestedOrganizationId =
    typeof resolvedSearchParams.organizationId === "string"
      ? resolvedSearchParams.organizationId
      : undefined;
  return (
    <DiscoveryShell
      organization={{
        organizationId: requestedOrganizationId,
        runtimeAvailable: false,
      }}
      showSessionImpact={false}
      sessionControl={(
        <SignedIn>
          <ClerkSessionTerminationControl />
        </SignedIn>
      )}
    >
      <section className={styles.state} aria-labelledby="alpha-activation-state-title">
        <p>Design-partner access</p>
        <h1 id="alpha-activation-state-title">{message.title}</h1>
        <p className={styles.explanation}>{message.explanation}</p>
        {requestedOrganizationId && (
          <a href={buildProductHref("/your-organization", requestedOrganizationId)}>
            Try again
          </a>
        )}
      </section>
    </DiscoveryShell>
  );
}
