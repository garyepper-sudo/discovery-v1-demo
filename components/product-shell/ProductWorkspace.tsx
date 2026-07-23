import Link from "next/link";
import type { ReactNode } from "react";

import DiscoveryShell from "./DiscoveryShell";
import styles from "./ProductWorkspace.module.css";
import { buildAskExperienceView } from "./data/buildAskExperienceView";
import { buildDecisionsExperienceView } from "./data/buildDecisionsExperienceView";
import { buildOrganizationExperienceView } from "./data/buildOrganizationExperienceView";
import { buildResearchExperienceView } from "./data/buildResearchExperienceView";
import { buildExperimentExperienceView } from "./data/buildExperimentExperienceView";
import { buildBriefExperienceView } from "./data/buildBriefExperienceView";
import { buildUnifiedExecutiveWorkspaceView } from "./data/buildUnifiedExecutiveWorkspaceView";
import { loadProductOrganization } from "./data/loadProductOrganization";
import { buildProductHref } from "./data/productOrganization";
import { createConversationInterpreter, readConversationIntelligenceFeatureFlags } from "../../engine/conversation";

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
  askMessage?: string;
  renderExperiment?: (view: ReturnType<typeof buildExperimentExperienceView>) => ReactNode;
  renderBrief?: (view: ReturnType<typeof buildBriefExperienceView>) => ReactNode;
  renderUnified?: (view: ReturnType<typeof buildUnifiedExecutiveWorkspaceView>) => ReactNode;
};

export default function ProductWorkspace({
  children,
  organizationId,
  renderOrganization,
  renderDecisions,
  renderResearch,
  renderAsk,
  askMessage,
  renderExperiment,
  renderBrief,
  renderUnified,
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
  const conversationFlags = readConversationIntelligenceFeatureFlags();
  const conversationInterpreter = createConversationInterpreter(conversationFlags.conversationInterpreter);
  const conversationInterpretation = conversationInterpreter && organization.runtime && askMessage?.trim()
    ? conversationInterpreter.interpret({
      currentMessage: askMessage,
      recentConversation: [],
      runtime: organization.runtime,
    })
    : null;
  const askView = renderAsk && isAvailable && organization.runtime
    ? buildAskExperienceView(organization.runtime, conversationInterpretation)
    : null;
  const experimentView = renderExperiment && isAvailable && organization.runtime ? buildExperimentExperienceView(organization.runtime) : null;
  const briefView = renderBrief && isAvailable && organization.runtime ? buildBriefExperienceView(organization.runtime) : null;
  const unifiedView = renderUnified && isAvailable && organization.runtime ? buildUnifiedExecutiveWorkspaceView(organization.runtime) : null;

  return (
    <DiscoveryShell
      organization={{
        organizationId: isAvailable ? organization.organizationId : undefined,
        organizationName: isAvailable ? organization.organizationName : undefined,
        runtimeAvailable: isAvailable,
        coherence: view?.model.coherence,
        coherenceLabel: view?.model.coherenceLabel,
        confidence: view?.currentUnderstanding.confidence,
        primaryConstraint: view?.model.areas[0]?.label,
      }}
      showSessionImpact={!renderUnified}
    >
      {isAvailable ? (
        renderUnified && unifiedView
          ? renderUnified(unifiedView)
          : renderOrganization && view
          ? renderOrganization(view)
          : renderDecisions && decisionsView
            ? renderDecisions(decisionsView)
            : renderResearch && researchView
              ? renderResearch(researchView)
              : renderAsk && askView
                ? renderAsk(askView)
                : renderExperiment && experimentView
                  ? renderExperiment(experimentView)
                  : renderBrief && briefView
                    ? renderBrief(briefView)
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
