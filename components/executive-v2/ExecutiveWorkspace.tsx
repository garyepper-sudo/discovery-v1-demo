"use client";

import {
  useState,
} from "react";

import ExecutiveExperience from "./ExecutiveExperience";
import ExecutiveSidebar from "../executive-v3/components/Sidebar/ExecutiveSidebar";

import type {
  ExecutiveProjection,
} from "./projection/ExecutiveProjection";

import type {
  ExecutiveWorkspaceMode,
} from "../executive-v3/ExecutiveWorkspaceMode";

import type {
  ExecutiveDecisionProjection,
} from "../executive-v3/projection/buildExecutiveDecisionProjection";

import type {
  DecisionDefinitionDraft,
} from "../executive-v3/workspaces/DecisionDefinitionWorkspace";

type ExecutiveWorkspaceProps = {
  projection: ExecutiveProjection;
};

export type ExecutiveDecisionCommitSelection = {
  selectedOptionId?: string;

  disposition:
    | "accepted-recommendation"
    | "modified-recommendation"
    | "selected-alternative"
    | "deferred"
    | "rejected";

  decision: string;

  rationale: string;

  acceptedAssumptions?: string[];

  acceptedRisks?: string[];

  executiveConfidenceAtDecision?: number;

  owner?: string;

  decisionMaker?: string;

  reviewAt?: string;
};

type ExecutiveDecisionResponse = {
  executiveDecisionProjection?:
    ExecutiveDecisionProjection;

  error?: string;
};

type ExecutiveDecisionRecordResponse = {
  executiveDecisionRecord?: unknown;

  persisted?: boolean;

  idempotentReplay?: boolean;

  error?: string;
};

function buildInitialDecisionDraft(
  projection: ExecutiveProjection,
): Partial<DecisionDefinitionDraft> {
  const recommendation =
    projection.executiveCommunication
      ?.recommendation;

  const primaryConstraint =
    projection.primaryExecutiveConstraint;

  return {
    title:
      recommendation?.headline ??
      "",

    objective:
      primaryConstraint
        ?.expectedExecutiveImpact ??
      "",

    rationale:
      recommendation?.rationale ??
      primaryConstraint?.whyNow ??
      "",

    type: "execution",

    timeHorizon: "near-term",

    allowedInterventionTypes: [
      "governance",
      "policy",
      "strategy",
    ],
  };
}

function createSubmissionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    "executive-decision",
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}

export default function ExecutiveWorkspace({
  projection,
}: ExecutiveWorkspaceProps) {
  const organizationId =
    "default-organization";

  const [
    mode,
    setMode,
  ] = useState<ExecutiveWorkspaceMode>(
    "briefing",
  );

  const [
    decisionProjection,
    setDecisionProjection,
  ] = useState<ExecutiveDecisionProjection | null>(
    null,
  );

  const [
    decisionDefinitionDraft,
    setDecisionDefinitionDraft,
  ] = useState<
    Partial<DecisionDefinitionDraft>
  >(() =>
    buildInitialDecisionDraft(
      projection,
    ),
  );

  const [
    decisionSubmissionId,
    setDecisionSubmissionId,
  ] = useState<string | null>(
    null,
  );

  const [
    isOpeningDecisionLab,
    setIsOpeningDecisionLab,
  ] = useState(false);

  const [
    decisionLabError,
    setDecisionLabError,
  ] = useState<string | null>(
    null,
  );

  const [
    isCommittingDecision,
    setIsCommittingDecision,
  ] = useState(false);

  const [
    decisionCommitError,
    setDecisionCommitError,
  ] = useState<string | null>(
    null,
  );

  const [
    committedDecisionRecord,
    setCommittedDecisionRecord,
  ] = useState<unknown | null>(
    null,
  );

  function resetDecisionCommitState() {
    setDecisionCommitError(null);
    setCommittedDecisionRecord(null);
    setDecisionSubmissionId(null);
  }

  function handleOpenDecisionDefinition() {
    setDecisionDefinitionDraft(
      buildInitialDecisionDraft(
        projection,
      ),
    );

    setDecisionLabError(null);
    resetDecisionCommitState();
    setMode("define-decision");
  }

  function handleCancelDecisionDefinition() {
    setDecisionLabError(null);
    setMode("recommend");
  }

  async function handleEvaluateDecision(
    decision: DecisionDefinitionDraft,
  ): Promise<void> {
    setDecisionDefinitionDraft(
      decision,
    );

    setDecisionLabError(null);
    resetDecisionCommitState();
    setIsOpeningDecisionLab(true);

    try {
      const response =
        await fetch(
          "/api/executive-decision",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              organizationId,

              decision,
            }),
          },
        );

      const result =
        (await response.json()) as
          ExecutiveDecisionResponse;

      if (!response.ok) {
        throw new Error(
          result.error ??
            "The decision could not be evaluated.",
        );
      }

      if (
        !result
          .executiveDecisionProjection
      ) {
        throw new Error(
          "The decision cycle completed without returning an Executive Decision Projection.",
        );
      }

      setDecisionProjection(
        result
          .executiveDecisionProjection,
      );

      setDecisionSubmissionId(
        createSubmissionId(),
      );

      setMode("decision");
    } catch (caughtError) {
      setDecisionLabError(
        caughtError instanceof Error
          ? caughtError.message
          : "The decision could not be evaluated.",
      );
    } finally {
      setIsOpeningDecisionLab(false);
    }
  }

  async function handleCommitDecision(
    selection:
      ExecutiveDecisionCommitSelection,
  ): Promise<void> {
    if (!decisionProjection) {
      setDecisionCommitError(
        "The decision must be evaluated before it can be committed.",
      );

      return;
    }

    const submissionId =
      decisionSubmissionId ??
      createSubmissionId();

    if (!decisionSubmissionId) {
      setDecisionSubmissionId(
        submissionId,
      );
    }

    setDecisionCommitError(null);
    setIsCommittingDecision(true);

    try {
      const response =
        await fetch(
          "/api/executive-decision-record",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              organizationId,

              submissionId,

              decisionCycleCompletedAt:
                decisionProjection.completedAt,

              decisionCycleIntegrityKey:
                decisionProjection.integrityKey,

              decision:
                decisionProjection.decision,

              selection,
            }),
          },
        );

      const result =
        (await response.json()) as
          ExecutiveDecisionRecordResponse;

      if (!response.ok) {
        throw new Error(
          result.error ??
            "The executive decision could not be recorded.",
        );
      }

      if (
        !result.executiveDecisionRecord ||
        !result.persisted
      ) {
        throw new Error(
          "The decision recording request completed without confirming persistence.",
        );
      }

      setCommittedDecisionRecord(
        result.executiveDecisionRecord,
      );
    } catch (caughtError) {
      setDecisionCommitError(
        caughtError instanceof Error
          ? caughtError.message
          : "The executive decision could not be recorded.",
      );
    } finally {
      setIsCommittingDecision(false);
    }
  }

  function handleNavigate(
    nextMode: ExecutiveWorkspaceMode,
  ) {
    setDecisionLabError(null);
    setDecisionCommitError(null);

    if (
      nextMode === "decision" &&
      !decisionProjection
    ) {
      setMode("recommend");

      return;
    }

    setMode(nextMode);
  }

  return (
    <main className="executive-workspace-v2">
      <ExecutiveSidebar
        mode={mode}
        onNavigate={handleNavigate}
      />

      <section className="executive-workspace-main">
        <header className="executive-workspace-topbar">
          <div className="executive-workspace-investigation-title">
            <span>Investigation:</span>

            <strong>
              {projection.workspace.title}
            </strong>

            <i aria-hidden="true">
              ⌄
            </i>
          </div>

          <div className="executive-workspace-live-status">
            {projection.workspace.updatedLabel ? (
              <span>
                {
                  projection.workspace
                    .updatedLabel
                }
              </span>
            ) : null}

            <strong>
              <i aria-hidden="true" />

              {projection.workspace.status}
            </strong>
          </div>
        </header>

        <div className="executive-workspace-content">
          <ExecutiveExperience
            projection={projection}
            organizationId={
              organizationId
            }
            mode={mode}
            decisionProjection={
              decisionProjection ??
              undefined
            }
            decisionDefinitionSource="discovery-recommendation"
            decisionDefinitionDraft={
              decisionDefinitionDraft
            }
            onOpenDecisionLab={
              handleOpenDecisionDefinition
            }
            onCancelDecisionDefinition={
              handleCancelDecisionDefinition
            }
            onEvaluateDecision={
              handleEvaluateDecision
            }
            onCommitDecision={
              handleCommitDecision
            }
            isOpeningDecisionLab={
              isOpeningDecisionLab
            }
            decisionLabError={
              decisionLabError
            }
            isCommittingDecision={
              isCommittingDecision
            }
            decisionCommitError={
              decisionCommitError
            }
            committedDecisionRecord={
              committedDecisionRecord
            }
          />
        </div>
      </section>
    </main>
  );
}
