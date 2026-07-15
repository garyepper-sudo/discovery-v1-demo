"use client";

import styles from "./ExecutiveWorkspace.module.css";

import AskDiscovery from "./components/AskDiscovery/AskDiscovery";
import Header from "./components/Header/Header";
import LivingUnderstanding from "./components/LivingUnderstanding/LivingUnderstanding";
import OrganizationPulse from "./components/OrganizationPulse/OrganizationPulse";
import RecommendedDecision from "./components/RecommendedDecision/RecommendedDecision";
import TodaysStory from "./components/TodaysStory/TodaysStory";
import WhatChanged from "./components/WhatChanged/WhatChanged";

import type {
  ExecutiveCommunication,
} from "../../engine/v3/communication/executiveCommunication";

import type {
  ExecutiveWorkspaceMode,
} from "./ExecutiveWorkspaceMode";

type ExecutiveWorkspaceProps = {
  communication: ExecutiveCommunication;
  mode: ExecutiveWorkspaceMode;
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

function getModeTitle(
  mode: Exclude<
    ExecutiveWorkspaceMode,
    "briefing"
  >,
): string {
  switch (mode) {
    case "understand":
      return "Understand";

    case "recommend":
      return "Recommend";

    case "simulate":
      return "Simulate";

    case "timeline":
      return "Timeline";

    case "ask":
      return "Ask Discovery";
  }
}

export default function ExecutiveWorkspace({
  communication,
  mode,
}: ExecutiveWorkspaceProps) {
  const confidence = toPercentage(
    communication.confidence.value,
  );

  if (mode !== "briefing") {
    return (
      <main className={styles.workspace}>
        <section className={styles.placeholder}>
          <p className={styles.placeholderEyebrow}>
            Discovery
          </p>

          <h1>{getModeTitle(mode)}</h1>

          <p>
            This workspace mode is ready for its engine-backed experience.
          </p>
        </section>
      </main>
    );
  }

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