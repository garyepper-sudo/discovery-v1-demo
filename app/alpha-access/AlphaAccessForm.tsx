"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

import styles from "./AlphaAccess.module.css";

export default function AlphaAccessForm({
  next,
  invalid,
}: {
  next: string;
  invalid: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action="/alpha-access/submit"
      method="post"
      className={styles.form}
      onSubmit={() => setSubmitting(true)}
    >
      <input type="hidden" name="next" value={next} />
      <label htmlFor="alpha-access-password">Password</label>
      <div className={styles.passwordField}>
        <LockKeyhole size={18} aria-hidden="true" />
        <input
          id="alpha-access-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus
          aria-describedby={invalid ? "alpha-access-error" : undefined}
          aria-invalid={invalid || undefined}
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      {invalid && (
        <p id="alpha-access-error" className={styles.error} role="alert">
          That password wasn’t recognized.
        </p>
      )}
      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? "Opening…" : "Open Discovery"}
      </button>
    </form>
  );
}
