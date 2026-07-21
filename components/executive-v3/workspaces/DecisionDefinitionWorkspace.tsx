"use client";

import {
  useState,
} from "react";

import styles from "../ExecutiveWorkspace.module.css";

import DecisionHeader from "./decision-definition/DecisionHeader";
import DecisionSuccessSection from "./decision-definition/DecisionSuccessSection";
import DiscoveryContextSection from "./decision-definition/DiscoveryContextSection";
import EvaluationPreferences from "./decision-definition/EvaluationPreferences";
import DecisionContextRail from "./decision-definition/DecisionContextRail";
import DecisionFooter from "./decision-definition/DecisionFooter";

import type {
  ExecutiveDecision,
} from "../../../engine/v3/model/simulate/executiveDecision";

export type DecisionDefinitionSource =
  | "discovery-recommendation"
  | "executive-created";

export type DecisionDefinitionDraft = {
  title: string;

  objective: string;

  rationale: string;

  type: ExecutiveDecision["type"];

  timeHorizon:
    ExecutiveDecision["timeHorizon"];

  allowedInterventionTypes:
    ExecutiveDecision["allowedInterventionTypes"];
};

type DecisionDefinitionWorkspaceProps = {
  source: DecisionDefinitionSource;

  initialDecision?: Partial<
    DecisionDefinitionDraft
  >;

  isEvaluating?: boolean;

  error?: string | null;

  onCancel: () => void;

  onEvaluate: (
    decision: DecisionDefinitionDraft,
  ) => void;
};

const defaultInterventionTypes:
  ExecutiveDecision["allowedInterventionTypes"] = [
    "governance",
    "policy",
    "strategy",
  ];

export default function DecisionDefinitionWorkspace({
  source,
  initialDecision,
  isEvaluating = false,
  error = null,
  onCancel,
  onEvaluate,
}: DecisionDefinitionWorkspaceProps) {
  const [
    title,
    setTitle,
  ] = useState(
    initialDecision?.title ?? "",
  );

  const [
    objective,
    setObjective,
  ] = useState(
    initialDecision?.objective ?? "",
  );

  const [
    rationale,
    setRationale,
  ] = useState(
    initialDecision?.rationale ?? "",
  );

  const [
    type,
    setType,
  ] = useState<
    ExecutiveDecision["type"]
  >(
    initialDecision?.type ??
      "execution",
  );

  const [
    timeHorizon,
    setTimeHorizon,
  ] = useState<
    ExecutiveDecision["timeHorizon"]
  >(
    initialDecision?.timeHorizon ??
      "near-term",
  );

  const [
    allowedInterventionTypes,
    setAllowedInterventionTypes,
  ] = useState<
    ExecutiveDecision["allowedInterventionTypes"]
  >(
    initialDecision
      ?.allowedInterventionTypes ??
      defaultInterventionTypes,
  );

  const isValid =
    title.trim().length > 0 &&
    objective.trim().length > 0 &&
    allowedInterventionTypes.length > 0;

  function toggleInterventionType(
    interventionType:
      ExecutiveDecision["allowedInterventionTypes"][number],
  ) {
    setAllowedInterventionTypes(
      (current) =>
        current.includes(
          interventionType,
        )
          ? current.filter(
              (item) =>
                item !==
                interventionType,
            )
          : [
              ...current,
              interventionType,
            ],
    );
  }

  function handleSubmit() {
    if (!isValid || isEvaluating) {
      return;
    }

    onEvaluate({
      title: title.trim(),
      objective: objective.trim(),
      rationale: rationale.trim(),
      type,
      timeHorizon,
      allowedInterventionTypes,
    });
  }

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section
          className={styles.main}
          aria-label="Executive intent confirmation"
        >
          <DecisionHeader
            title={title}
            source={source}
            disabled={isEvaluating}
            onTitleChange={setTitle}
          />

          <DecisionSuccessSection
            objective={objective}
            disabled={isEvaluating}
            onObjectiveChange={
              setObjective
            }
          />

          <DiscoveryContextSection
            rationale={rationale}
            disabled={isEvaluating}
            onRationaleChange={
              setRationale
            }
          />

          <EvaluationPreferences
            type={type}
            timeHorizon={
              timeHorizon
            }
            allowedInterventionTypes={
              allowedInterventionTypes
            }
            disabled={isEvaluating}
            onTypeChange={setType}
            onTimeHorizonChange={
              setTimeHorizon
            }
            onToggleInterventionType={
              toggleInterventionType
            }
          />

          <DecisionFooter
            isValid={isValid}
            isEvaluating={
              isEvaluating
            }
            error={error}
            onCancel={onCancel}
            onEvaluate={
              handleSubmit
            }
          />
        </section>

        <DecisionContextRail
          source={source}
        />
      </div>
    </main>
  );
}