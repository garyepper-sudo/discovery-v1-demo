"use client";

import Hero from "./hero/Hero";

const currentUnderstanding = {
  belief:
    "Customer onboarding delays are primarily caused by fragmented cross-functional ownership.",
  mindStatus: "Learning",
  confidence: 84,
};

export default function ExecutiveExperience() {
  return (
    <main className="executive-v2-experience">
      <div className="executive-v2-shell">
        <header className="executive-v2-header">
          <div className="executive-v2-brand">
            <span className="executive-v2-brand-dot" />
            <span>Discovery</span>
          </div>
        </header>

        <Hero
          belief={currentUnderstanding.belief}
          mindStatus={currentUnderstanding.mindStatus}
          confidence={currentUnderstanding.confidence}
        />

        <section className="executive-v2-answer-grid executive-v2-answer-grid-quiet">
          <article className="executive-v2-answer">
            <p className="executive-v2-answer-label">Why?</p>

            <p className="executive-v2-answer-copy">
              Ownership repeatedly shifts between sales, implementation, and
              customer success.
            </p>
          </article>

          <article className="executive-v2-answer">
            <p className="executive-v2-answer-label">
              What could change this?
            </p>

            <p className="executive-v2-answer-copy">
              Delays would need to persist even when one team has clear
              end-to-end responsibility.
            </p>
          </article>

          <article className="executive-v2-answer executive-v2-investigation">
            <div>
              <p className="executive-v2-answer-label">Next move</p>

              <p className="executive-v2-answer-copy">
                Compare high-performing onboarding teams with stalled accounts.
              </p>
            </div>

            <button type="button" className="executive-v2-start-button">
              Start Investigation
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}