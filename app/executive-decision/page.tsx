"use client";

import {
  useState,
} from "react";

import DecisionAnalysisWorkspace from "../../components/executive-v3/workspaces/DecisionAnalysisWorkspace";

import type {
  ExecutiveDecisionProjection,
} from "../../components/executive-v3/projection/buildExecutiveDecisionProjection";

type ExecutiveDecisionResponse = {
  executiveDecisionProjection:
    ExecutiveDecisionProjection;
};

const DEFAULT_ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

export default function ExecutiveDecisionPage() {
  const [
    organizationId,
    setOrganizationId,
  ] = useState(
    DEFAULT_ORGANIZATION_ID,
  );

  const [
    title,
    setTitle,
  ] = useState(
    "Improve Organizational Execution",
  );

  const [
    objective,
    setObjective,
  ] = useState(
    "Increase execution throughput without increasing organizational risk.",
  );

  const [
    rationale,
    setRationale,
  ] = useState(
    "Leadership wants to improve execution quality using structural rather than staffing interventions.",
  );

  const [
    targetConditionId,
    setTargetConditionId,
  ] = useState(
    "condition-executioncapacity",
  );

  const [
    projection,
    setProjection,
  ] = useState<
    ExecutiveDecisionProjection | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function runDecisionCycle() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/executive-decision",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                organizationId,

                decision: {
                  type:
                    "execution",

                  title,

                  objective,

                  rationale,

                  status:
                    "ready",

                  timeHorizon:
                    "near-term",

                  targetConditionIds: [
                    targetConditionId,
                  ],

                  successMetrics: [
                    {
                      name:
                        "Execution Capacity",
                    },
                  ],

                  constraints: [
                    {
                      type:
                        "risk",

                      description:
                        "Avoid increasing organizational risk.",

                      required:
                        true,
                    },
                  ],

                  allowedInterventionTypes: [
                    "governance",
                    "policy",
                    "strategy",
                  ],

                  assumptions: [
                    "The current organizational understanding is sufficiently accurate.",
                  ],

                  openQuestions: [],

                  confidence:
                    0.8,
                },
              }),
          },
        );

      const data =
        (await response.json()) as
          | ExecutiveDecisionResponse
          | {
              error?: string;
            };

      if (!response.ok) {
        throw new Error(
          "error" in data &&
          typeof data.error ===
            "string"
            ? data.error
            : `API returned ${response.status}.`,
        );
      }

      if (
        !(
          "executiveDecisionProjection" in
          data
        )
      ) {
        throw new Error(
          "The API did not return an Executive Decision Projection.",
        );
      }

      setProjection(
        data.executiveDecisionProjection,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Executive decision evaluation failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (projection) {
    return (
      <DecisionAnalysisWorkspace
        projection={projection}
      />
    );
  }

  return (
    <main className="discovery-page discovery-v2">
      <header className="top-nav">
        <div className="brand-mark">
          <span className="brand-dot" />

          <strong>
            Discovery
          </strong>
        </div>

        <span className="nav-pill">
          Executive Decision
        </span>
      </header>

      <section className="hero-section">
        <p className="eyebrow">
          Decision Intelligence
        </p>

        <h1>
          What should leadership do?
        </h1>

        <p>
          Define the executive objective.
          Discovery will generate viable
          interventions, simulate each
          organizational future, compare
          the trade-offs, rank the options,
          and recommend the strongest
          action.
        </p>

        <section className="input-panel">
          <div className="input-grid">
            <input
              placeholder="Organization ID"
              value={
                organizationId
              }
              onChange={(
                event,
              ) =>
                setOrganizationId(
                  event.target.value,
                )
              }
            />

            <input
              placeholder="Decision title"
              value={
                title
              }
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target.value,
                )
              }
            />

            <input
              placeholder="Target condition ID"
              value={
                targetConditionId
              }
              onChange={(
                event,
              ) =>
                setTargetConditionId(
                  event.target.value,
                )
              }
            />
          </div>

          <label>
            Executive objective

            <textarea
              placeholder="What outcome does leadership want to achieve?"
              value={
                objective
              }
              onChange={(
                event,
              ) =>
                setObjective(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            Why this matters now

            <textarea
              placeholder="Why is this decision important?"
              value={
                rationale
              }
              onChange={(
                event,
              ) =>
                setRationale(
                  event.target.value,
                )
              }
            />
          </label>

          <button
            type="button"
            className="primary-button full"
            onClick={
              runDecisionCycle
            }
            disabled={
              loading
            }
          >
            {loading
              ? "Evaluating options..."
              : "Evaluate executive decision"}
          </button>

          {error ? (
            <p className="error-message">
              {error}
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}
