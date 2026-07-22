import Link from "next/link";
import type { ReactNode } from "react";

import DiscoveryShell from "./DiscoveryShell";
import styles from "./ProductWorkspace.module.css";
import { buildAskExperienceView } from "./data/buildAskExperienceView";
import { buildDecisionsExperienceView } from "./data/buildDecisionsExperienceView";
import { buildOrganizationExperienceView } from "./data/buildOrganizationExperienceView";
import { buildResearchExperienceView } from "./data/buildResearchExperienceView";
import { loadProductOrganization } from "./data/loadProductOrganization";
import { buildProductHref } from "./data/productOrganization";

type ProductWorkspaceProps = {
  children?: ReactNode;
  organizationId?: string | string[];
  renderOrganization?: (
    view: ReturnType<typeof buildOrganizationExperienceView>,
  ) => ReactNode;
  renderDecisions?: (
    view: ReturnType<typeof buildDecisionsExperienceView>,
  ) => ReactNode;
  renderResearch?: (
    view: ReturnType<typeof buildResearchExperienceView>,
  ) => ReactNode;
  renderAsk?: (
    view: ReturnType<typeof buildAskExperienceView>,
  ) => ReactNode;
};

export default function ProductWorkspace({
  children,
  organizationId,
  renderOrganization,
  renderDecisions,
  renderResearch,
  renderAsk,
}: ProductWorkspaceProps) {
  const organization = loadProductOrganization(organizationId);
  const isAvailable = organization.state === "available";
  const view = isAvailable && organization.runtime
    ? buildOrganizationExperienceView(organization.runtime)
    : null;
  const decisionsView = renderDecisions && isAvailable && organization.runtime
    ? buildDecisionsExperienceView(organization.runtime)
    : null;
  const researchView = renderResearch && isAvailable && organization.runtime
    ? buildResearchExperienceView(organization.runtime)
    : null;
  const askView = renderAsk && isAvailable && organization.runtime
    ? buildAskExperienceView(organization.runtime)
    : null;

  return (
    <DiscoveryShell
      organization={{
        organizationId: isAvailable ? organization.organizationId : undefined,
        organizationName: isAvailable ? organization.organizationName : undefined,
        runtimeAvailable: isAvailable,
        coherence: view?.model.coherence,
        coherenceLabel: view?.model.coherenceLabel,
      }}
    >
      {isAvailable ? (
        renderOrganization && view
          ? renderOrganization(view)
          : renderDecisions && decisionsView
            ? renderDecisions(decisionsView)
            : renderResearch && researchView
              ? renderResearch(researchView)
              : renderAsk && askView
                ? renderAsk(askView)
                : children
      ) : (
        <section className={styles.state} aria-labelledby="organization-state-title">
          <p>Organization model</p>
          <h1 id="organization-state-title">
            {organization.state === "missing-identity"
              ? "Choose or create an organization to enter Discovery."
              : "Discovery could not load this organization."}
          </h1>
          <p className={styles.explanation}>
            {organization.state === "missing-identity"
              ? "Discovery needs an organization before it can present a grounded understanding."
              : "Return to the organization setup experience and try again."}
          </p>
          <Link
            href={buildProductHref(
              "/discovery-v1",
              organization.organizationId,
            )}
          >
            Create or choose an organization
          </Link>
        </section>
      )}
    </DiscoveryShell>
  );
}
