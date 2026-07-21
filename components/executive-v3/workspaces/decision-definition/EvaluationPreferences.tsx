"use client";

import styles from "../../ExecutiveWorkspace.module.css";

import type {
  ExecutiveDecision,
} from "../../../../engine/v3/model/simulate/executiveDecision";

type EvaluationPreferencesProps = {
  type: ExecutiveDecision["type"];

  timeHorizon:
    ExecutiveDecision["timeHorizon"];

  allowedInterventionTypes:
    ExecutiveDecision["allowedInterventionTypes"];

  disabled?: boolean;

  onTypeChange: (
    value: ExecutiveDecision["type"],
  ) => void;

  onTimeHorizonChange: (
    value:
      ExecutiveDecision["timeHorizon"],
  ) => void;

  onToggleInterventionType: (
    value:
      ExecutiveDecision["allowedInterventionTypes"][number],
  ) => void;
};

const decisionTypes: Array<{
  value: ExecutiveDecision["type"];
  label: string;
}> = [
  {
    value: "execution",
    label: "Execution",
  },
  {
    value: "growth",
    label: "Growth",
  },
  {
    value: "cost",
    label: "Cost",
  },
  {
    value: "organization-design",
    label: "Organization design",
  },
  {
    value: "governance",
    label: "Governance",
  },
  {
    value: "risk",
    label: "Risk",
  },
  {
    value: "market",
    label: "Market",
  },
  {
    value: "product",
    label: "Product",
  },
  {
    value: "technology",
    label: "Technology",
  },
  {
    value: "people",
    label: "People",
  },
  {
    value: "custom",
    label: "Custom",
  },
];

const timeHorizons: Array<{
  value:
    ExecutiveDecision["timeHorizon"];
  label: string;
}> = [
  {
    value: "immediate",
    label: "Immediate",
  },
  {
    value: "near-term",
    label: "Near term",
  },
  {
    value: "medium-term",
    label: "Medium term",
  },
  {
    value: "long-term",
    label: "Long term",
  },
];

const interventionTypes: Array<{
  value:
    ExecutiveDecision["allowedInterventionTypes"][number];
  label: string;
}> = [
  {
    value: "strategy",
    label: "Strategy",
  },
  {
    value: "governance",
    label: "Governance",
  },
  {
    value: "policy",
    label: "Policy",
  },
  {
    value: "technology",
    label: "Technology",
  },
  {
    value: "reorganization",
    label: "Organization design",
  },
  {
    value: "hiring",
    label: "Hiring",
  },
  {
    value: "layoff",
    label: "Workforce reduction",
  },
  {
    value: "budget",
    label: "Budget",
  },
  {
    value: "market",
    label: "Market",
  },
  {
    value: "customer",
    label: "Customer",
  },
  {
    value: "custom",
    label: "Other",
  },
];

function getDecisionTypeLabel(
  value: ExecutiveDecision["type"],
) {
  return (
    decisionTypes.find(
      (option) =>
        option.value === value,
    )?.label ?? "Custom"
  );
}

function getTimeHorizonLabel(
  value:
    ExecutiveDecision["timeHorizon"],
) {
  return (
    timeHorizons.find(
      (option) =>
        option.value === value,
    )?.label ?? "Not specified"
  );
}

export default function EvaluationPreferences({
  type,
  timeHorizon,
  allowedInterventionTypes,
  disabled = false,
  onTypeChange,
  onTimeHorizonChange,
  onToggleInterventionType,
}: EvaluationPreferencesProps) {
  const decisionTypeLabel =
    getDecisionTypeLabel(type);

  const timeHorizonLabel =
    getTimeHorizonLabel(timeHorizon);

  const interventionCount =
    allowedInterventionTypes.length;

  return (
    <details
      className={
        styles.decisionDefinitionPreferences
      }
    >
      <summary>
        <span>
          Review evaluation scope
        </span>

        <span>
          {decisionTypeLabel}
          {" · "}
          {timeHorizonLabel}
          {" · "}
          {interventionCount}{" "}
          {interventionCount === 1
            ? "action category"
            : "action categories"}
        </span>
      </summary>

      <div
        className={
          styles.decisionDefinitionPreferencesBody
        }
      >
        <div>
          <p
            className={
              styles.placeholderEyebrow
            }
          >
            Evaluation Scope
          </p>

          <h2>
            How should Discovery evaluate
            this decision?
          </h2>

          <p>
            Discovery has inferred a starting
            scope. Adjust it only when the
            decision requires narrower or
            broader evaluation.
          </p>
        </div>

        <section>
          <label htmlFor="decision-type">
            <h3>Decision focus</h3>
          </label>

          <p>
            The primary organizational domain
            affected by this decision.
          </p>

          <select
            id="decision-type"
            value={type}
            onChange={(event) =>
              onTypeChange(
                event.target
                  .value as ExecutiveDecision["type"],
              )
            }
            disabled={disabled}
          >
            {decisionTypes.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </section>

        <fieldset>
          <legend>
            <h3>Evaluation horizon</h3>
          </legend>

          <p>
            The period over which Discovery
            should compare likely outcomes.
          </p>

          <div
            className={
              styles.decisionDefinitionOptions
            }
          >
            {timeHorizons.map(
              (option) => (
                <label
                  key={option.value}
                >
                  <input
                    type="radio"
                    name="decision-time-horizon"
                    value={option.value}
                    checked={
                      timeHorizon ===
                      option.value
                    }
                    onChange={() =>
                      onTimeHorizonChange(
                        option.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <span>
                    {option.label}
                  </span>
                </label>
              ),
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h3>
              Strategies Discovery may
              consider
            </h3>
          </legend>

          <p>
            Discovery will compare only the
            selected categories of action.
          </p>

          <div
            className={
              styles.decisionDefinitionOptions
            }
          >
            {interventionTypes.map(
              (option) => (
                <label
                  key={option.value}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={allowedInterventionTypes.includes(
                      option.value,
                    )}
                    onChange={() =>
                      onToggleInterventionType(
                        option.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <span>
                    {option.label}
                  </span>
                </label>
              ),
            )}
          </div>
        </fieldset>
      </div>
    </details>
  );
}