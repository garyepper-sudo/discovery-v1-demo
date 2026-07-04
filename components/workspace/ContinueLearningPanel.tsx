"use client";

import { useState } from "react";

type Props = {
  loading: boolean;
  onContinue: (nextInput: string) => void;
};

export default function ContinueLearningPanel({ loading, onContinue }: Props) {
  const [nextInput, setNextInput] = useState("");

  return (
    <section className="input-panel">
      <p className="overview-label">Continue learning</p>

      <h2>Add more information</h2>

      <p className="briefing-muted">
        Paste another meeting, memo, customer signal, board note, or strategic
        update. Discovery will evolve the same organization.
      </p>

      <textarea
        placeholder="Paste new information for this organization..."
        value={nextInput}
        onChange={(event) => setNextInput(event.target.value)}
      />

      <button
        className="primary-button full"
        disabled={loading || !nextInput.trim()}
        onClick={() => {
          onContinue(nextInput);
          setNextInput("");
        }}
      >
        {loading ? "Evolving understanding..." : "Continue learning"}
      </button>
    </section>
  );
}