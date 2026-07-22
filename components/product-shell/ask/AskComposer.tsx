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
      <label htmlFor="organization-question">What are you trying to understand?</label>
      <div>
        <textarea
          id="organization-question"
          name="question"
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask a focused question about your organization"
        />
        <button type="submit" disabled={!value.trim()}>
          Ask the organization
        </button>
      </div>
      <p>For this first pass, Discovery uses a clearly labeled static response.</p>
    </form>
  );
}
