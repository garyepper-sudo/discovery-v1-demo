import type { FormEvent } from "react";

import styles from "./AskExperience.module.css";

type AskComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AskComposer({ value, onChange, onSubmit }: AskComposerProps) {
  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <label htmlFor="organization-question">What are you thinking about?</label>
      <div>
        <textarea
          id="organization-question"
          name="question"
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Explore an idea, assumption, or possible decision"
        />
        <button type="submit" aria-disabled={!value.trim()}>
          Think with Discovery
        </button>
      </div>
      <p>Your message remains provisional until you explicitly save it or create a decision.</p>
    </form>
  );
}
