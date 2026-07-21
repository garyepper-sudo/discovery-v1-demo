"use client";

import { useState } from "react";

import ExecutiveWorkspace from "../../components/executive-v2/ExecutiveWorkspace";

import type {
  ExecutiveProjection,
} from "../../components/executive-v2/projection/ExecutiveProjection";

import styles from "./DiscoveryOnboarding.module.css";

type DiscoveryLabResponse = {
  executiveProjection: ExecutiveProjection;
};

type EvidenceOption = {
  id: string;
  title: string;
  description: string;
  status: "Recommended" | "Optional";
};

const evidenceOptions: EvidenceOption[] = [
  {
    id: "board-deck",
    title: "Board deck",
    description:
      "Strategic priorities, executive commitments, risks, and unresolved board concerns.",
    status: "Recommended",
  },
  {
    id: "strategic-plan",
    title: "Strategic plan",
    description:
      "Objectives, planned initiatives, operating assumptions, and organizational priorities.",
    status: "Recommended",
  },
  {
    id: "organization-chart",
    title: "Organization chart",
    description:
      "Leadership structure, ownership boundaries, and organizational dependencies.",
    status: "Recommended",
  },
  {
    id: "quarterly-review",
    title: "Quarterly review",
    description:
      "Recent performance, operating changes, execution risks, and emerging constraints.",
    status: "Optional",
  },
];

const loadingSteps = [
  "Reading organizational evidence",
  "Building organizational understanding",
  "Forming the executive assessment",
  "Identifying the primary constraint",
  "Generating initial insights",
];

export default function DiscoveryV1Page() {
  const [organizationId, setOrganizationId] =
    useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [question, setQuestion] = useState("");
  const [messyInput, setMessyInput] = useState("");

  const [selectedEvidenceIds, setSelectedEvidenceIds] =
    useState<string[]>([
      "board-deck",
      "strategic-plan",
    ]);

  const [projection, setProjection] =
    useState<ExecutiveProjection | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  function toggleEvidence(
    evidenceId: string,
  ) {
    setSelectedEvidenceIds(
      (currentEvidenceIds) =>
        currentEvidenceIds.includes(evidenceId)
          ? currentEvidenceIds.filter(
              (currentId) =>
                currentId !== evidenceId,
            )
          : [
              ...currentEvidenceIds,
              evidenceId,
            ],
    );
  }

  async function runInvestigation(
    inputOverride?: string,
  ) {
    setLoading(true);
    setError(null);

    try {
      const activeOrganizationId =
        organizationId ??
        `org_${crypto.randomUUID()}`;

      if (!organizationId) {
        setOrganizationId(
          activeOrganizationId,
        );
      }

      const response = await fetch(
        "/api/discovery-lab",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            organizationId:
              activeOrganizationId,
            company,
            website,
            industry,
            question,
            messyInput:
              inputOverride ?? messyInput,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}`,
        );
      }

      const data: DiscoveryLabResponse =
        await response.json();

      if (!data.executiveProjection) {
        throw new Error(
          "The API did not return an executive projection.",
        );
      }

      setProjection(
        data.executiveProjection,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Discovery could not create the Operating Model.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (projection && organizationId) {
    return (
      <ExecutiveWorkspace
        projection={projection}
        organizationId={
          organizationId
        }
      />
    );
  }

  const canBuildOperatingModel =
    company.trim().length > 0 &&
    messyInput.trim().length > 0;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span
            className={styles.brandMark}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>

          <div>
            <strong>Discovery</strong>
            <span>
              Executive Operating System
            </span>
          </div>
        </div>

        <span className={styles.productLabel}>
          Create Your Operating Model
        </span>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            Organization onboarding
          </p>

          <h1>
            Build your
            <br />
            Operating Model.
          </h1>

          <p className={styles.heroLead}>
            Give Discovery enough context
            to form its first honest
            understanding of your
            organization. Start with the
            information you already use to
            run the business.
          </p>
        </div>

        <aside className={styles.promise}>
          <p className={styles.promiseLabel}>
            Your first result
          </p>

          <strong>
            A living organizational model
          </strong>

          <p>
            Discovery will identify the
            current organizational state,
            primary constraint, initial
            insights, and decisions worth
            evaluating.
          </p>
        </aside>
      </section>

      <section className={styles.onboarding}>
        <article className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.stepNumber}>
              1
            </span>

            <div>
              <h2>
                Tell us about your
                organization
              </h2>

              <p>
                This gives Discovery the
                basic frame for interpreting
                your evidence.
              </p>
            </div>
          </header>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Company name</span>

              <input
                type="text"
                placeholder="Acme Manufacturing"
                value={company}
                onChange={(event) =>
                  setCompany(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>Website</span>

              <input
                type="url"
                placeholder="https://acme.com"
                value={website}
                onChange={(event) =>
                  setWebsite(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>Industry</span>

              <input
                type="text"
                placeholder="Manufacturing"
                value={industry}
                onChange={(event) =>
                  setIndustry(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>
                Current strategic priority
              </span>

              <input
                type="text"
                placeholder="Improve execution across strategic initiatives"
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </article>

        <article className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.stepNumber}>
              2
            </span>

            <div>
              <h2>
                Add initial organizational
                evidence
              </h2>

              <p>
                Two or three current sources
                are usually enough for
                Discovery to form a useful
                first understanding.
              </p>
            </div>
          </header>

          <div className={styles.evidenceGrid}>
            {evidenceOptions.map(
              (evidence) => {
                const isSelected =
                  selectedEvidenceIds.includes(
                    evidence.id,
                  );

                return (
                  <button
                    key={evidence.id}
                    type="button"
                    className={
                      isSelected
                        ? `${styles.evidenceCard} ${styles.evidenceCardSelected}`
                        : styles.evidenceCard
                    }
                    aria-pressed={
                      isSelected
                    }
                    onClick={() =>
                      toggleEvidence(
                        evidence.id,
                      )
                    }
                  >
                    <span
                      className={
                        styles.evidenceCardTopline
                      }
                    >
                      <strong>
                        {evidence.title}
                      </strong>

                      <span
                        className={
                          styles.evidenceStatus
                        }
                      >
                        {evidence.status}
                      </span>
                    </span>

                    <span
                      className={
                        styles.evidenceDescription
                      }
                    >
                      {
                        evidence.description
                      }
                    </span>

                    <span
                      className={
                        styles.evidenceSelection
                      }
                    >
                      {isSelected
                        ? "Included"
                        : "Add source"}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          <div className={styles.uploadArea}>
            <div>
              <strong>
                Upload files
              </strong>

              <p>
                File upload will be connected
                to organizational evidence
                storage in the authenticated
                MVP.
              </p>
            </div>

            <button
              type="button"
              disabled
              title="File upload will be connected in the persistence sprint."
            >
              Choose files
            </button>
          </div>
        </article>

        <article className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.stepNumber}>
              3
            </span>

            <div>
              <h2>
                Add leadership context
              </h2>

              <p>
                Paste the notes, observations,
                concerns, or open questions
                that matter most right now.
              </p>
            </div>
          </header>

          <label className={styles.notesField}>
            <span>
              Leadership notes or
              organizational context
            </span>

            <textarea
              placeholder="Paste recent leadership notes, customer feedback, operating concerns, market signals, strategic assumptions, risks, opportunities, or unresolved questions..."
              value={messyInput}
              onChange={(event) =>
                setMessyInput(
                  event.target.value,
                )
              }
            />
          </label>
        </article>

        <article className={styles.buildSection}>
          <div className={styles.buildCopy}>
            <p className={styles.eyebrow}>
              Ready to begin
            </p>

            <h2>
              Create the organization&apos;s
              first Operating Model.
            </h2>

            <p>
              Discovery will analyze the
              information above and open your
              Executive Work experience with
              an initial assessment.
            </p>
          </div>

          <button
            type="button"
            className={styles.buildButton}
            onClick={() =>
              runInvestigation()
            }
            disabled={
              loading ||
              !canBuildOperatingModel
            }
          >
            {loading
              ? "Creating Operating Model..."
              : "Build Operating Model →"}
          </button>

          {!canBuildOperatingModel &&
          !loading ? (
            <p
              className={
                styles.requirementMessage
              }
            >
              Add a company name and some
              leadership context to begin.
            </p>
          ) : null}

          {error ? (
            <p className={styles.error}>
              {error}
            </p>
          ) : null}
        </article>

        {loading ? (
          <section
            className={styles.loadingPanel}
            aria-live="polite"
          >
            <header>
              <span
                className={styles.loadingMark}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Creating Operating Model
                </strong>

                <p>
                  Discovery is converting
                  organizational evidence into
                  executive understanding.
                </p>
              </div>
            </header>

            <ol className={styles.loadingSteps}>
              {loadingSteps.map(
                (step, index) => (
                  <li key={step}>
                    <span aria-hidden="true">
                      {index === 0
                        ? "●"
                        : "○"}
                    </span>

                    {step}
                  </li>
                ),
              )}
            </ol>
          </section>
        ) : null}
      </section>

      <footer className={styles.footer}>
        <span>
          Discovery builds one shared
          Operating Model for your
          organization.
        </span>

        <span>
          Organizational evidence remains
          isolated to your organization.
        </span>
      </footer>
    </main>
  );
}
