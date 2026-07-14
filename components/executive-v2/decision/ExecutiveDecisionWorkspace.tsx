"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  ExecutiveScenarioProjection,
} from "../projection/ExecutiveScenarioProjection";

type ExecutiveDecisionWorkspaceProps = {
  organizationId: string;

  /**
   * Use a canonical condition ID from the current Executive Projection.
   */
  defaultConditionId?: string;
};

type ScenarioFormState = {
  title: string;
  description: string;
  rationale: string;
  conditionId: string;
  interventionDelta: number;
};

function formatPercentage(
  value: number | undefined,
): string {
  if (typeof value !== "number") {
    return "—";
  }

  const normalizedValue =
    value <= 1
      ? value * 100
      : value;

  return `${Math.round(normalizedValue)}%`;
}

export default function ExecutiveDecisionWorkspace({
  organizationId,
  defaultConditionId = "",
}: ExecutiveDecisionWorkspaceProps) {
  const [form, setForm] =
    useState<ScenarioFormState>({
      title:
        "Clarify Decision Rights",

      description:
        "Reduce approval bottlenecks by clarifying decision authority.",

      rationale:
        "Evaluate whether reducing governance friction improves organizational execution.",

      conditionId:
        defaultConditionId,

      interventionDelta:
        0.25,
    });

  const [projection, setProjection] =
    useState<ExecutiveScenarioProjection | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(null);

  const [isRunning, setIsRunning] =
    useState(false);

  const topUnderstanding =
    useMemo(
      () =>
        projection?.projectedFuture
          .understandingCandidates?.[0],
      [projection],
    );

  async function runScenario() {
    setIsRunning(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/executive-scenario",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              organizationId,

              changedEntityId:
                form.conditionId,

              interventionDelta:
                form.interventionDelta,

              intervention: {
                type:
                  "governance",

                title:
                  form.title,

                description:
                  form.description,

                rationale:
                  form.rationale,

                scope:
                  "organization",

                timeHorizon:
                  "near-term",

                affectedConditionIds: [
                  form.conditionId,
                ],

                expectedMechanismIds:
                  [],

                assumptions:
                  [],

                confidence:
                  0.7,
              },
            }),
          },
        );

      const payload =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Scenario evaluation failed.",
        );
      }

      setProjection(
        payload.executiveScenarioProjection,
      );
    } catch (caughtError) {
      setProjection(null);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Scenario evaluation failed.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="executive-decision-workspace">
      <header className="executive-decision-workspace__header">
        <div>
          <p className="executive-decision-workspace__eyebrow">
            Decision Intelligence
          </p>

          <h2>
            Evaluate an organizational intervention
          </h2>

          <p>
            Compare the current organization
            with a causally simulated future.
            Scenarios do not modify the live
            organization runtime.
          </p>
        </div>
      </header>

      <div className="executive-decision-workspace__form">
        <label>
          Intervention title

          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title:
                  event.target.value,
              }))
            }
          />
        </label>

        <label>
          Description

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description:
                  event.target.value,
              }))
            }
          />
        </label>

        <label>
          Why evaluate this?

          <textarea
            value={form.rationale}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                rationale:
                  event.target.value,
              }))
            }
          />
        </label>

        <label>
          Affected condition ID

          <input
            value={form.conditionId}
            placeholder="condition-decisionflow"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                conditionId:
                  event.target.value,
              }))
            }
          />
        </label>

        <label>
          Intervention strength

          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={
              form.interventionDelta
            }
            onChange={(event) =>
              setForm((current) => ({
                ...current,

                interventionDelta:
                  Number(
                    event.target.value,
                  ),
              }))
            }
          />

          <span>
            {form.interventionDelta.toFixed(
              2,
            )}
          </span>
        </label>

        <button
          type="button"
          disabled={
            isRunning ||
            !form.conditionId.trim()
          }
          onClick={runScenario}
        >
          {isRunning
            ? "Evaluating…"
            : "Run scenario"}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="executive-decision-workspace__error"
        >
          {error}
        </p>
      ) : null}

      {projection ? (
        <div className="executive-decision-workspace__results">
          <article>
            <p>
              Intervention
            </p>

            <h3>
              {projection.summary.title}
            </h3>

            <p>
              {
                projection.summary
                  .description
              }
            </p>

            <dl>
              <div>
                <dt>
                  Confidence
                </dt>

                <dd>
                  {formatPercentage(
                    projection.summary
                      .confidence,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Horizon
                </dt>

                <dd>
                  {
                    projection.summary
                      .timeHorizon
                  }
                </dd>
              </div>
            </dl>
          </article>

          <article>
            <p>
              Projected executive understanding
            </p>

            <h3>
              {topUnderstanding
                ?.statement ??
                "Projected understanding generated"}
            </h3>

            <p>
              Confidence:{" "}
              {formatPercentage(
                topUnderstanding
                  ?.confidence,
              )}
            </p>
          </article>

          <article>
            <p>
              Current versus projected
            </p>

            <pre>
              {JSON.stringify(
                projection.comparison,
                null,
                2,
              )}
            </pre>
          </article>
        </div>
      ) : null}
    </section>
  );
}