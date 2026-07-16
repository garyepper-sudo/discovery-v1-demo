"use client";

import styles from "../ExecutiveWorkspace.module.css";

import AskDiscovery from "../components/AskDiscovery/AskDiscovery";
import Header from "../components/Header/Header";
import LivingUnderstanding from "../components/LivingUnderstanding/LivingUnderstanding";
import OrganizationPulse from "../components/OrganizationPulse/OrganizationPulse";
import RecommendedDecision from "../components/RecommendedDecision/RecommendedDecision";
import TodaysStory from "../components/TodaysStory/TodaysStory";
import WhatChanged from "../components/WhatChanged/WhatChanged";

import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

type BriefingWorkspaceProps = {
  communication: ExecutiveCommunication;
};

function toPercentage(value: number): number {
  const percentage =
    value <= 1
      ? value * 100
      : value;

  return Math.round(
    Math.max(
      0,
      Math.min(100, percentage),
    ),
  );
}

export default function BriefingWorkspace({
  communication,
}: BriefingWorkspaceProps) {
  const confidence = toPercentage(
    communication.confidence.value,
  );

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <Header
            userName="Gary"
            meaningfulChangeCount={
              communication.meaningfulChanges.length
            }
          />

          <TodaysStory
            headline={communication.headline}
            summary={communication.executiveSummary}
            confidence={confidence}
          />

          <RecommendedDecision
            headline={
              communication.recommendation.headline
            }
            rationale={
              communication.recommendation.rationale
            }
            actionCount={
              communication.recommendation.actions.length
            }
            decisionHref={
              communication.recommendation.decisionHref
            }
          />
        </section>

        <aside className={styles.rail}>
          <OrganizationPulse
            confidence={confidence}
            meaningfulChangeCount={
              communication.meaningfulChanges.length
            }
          />

          <LivingUnderstanding />

          <AskDiscovery />
        </aside>

        <div className={styles.fullWidth}>
          <WhatChanged
            changes={
              communication.meaningfulChanges
            }
          />
        </div>
      </div>
    </main>
  );
}