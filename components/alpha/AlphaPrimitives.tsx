import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  LockKeyhole,
} from "lucide-react";

import styles from "./AlphaExperience.module.css";

export function DiscoveryMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.brand} aria-label="Discovery">
      <span className={styles.brandMark} aria-hidden="true">
        ✦
      </span>
      {!compact && <span className={styles.brandName}>Discovery</span>}
    </span>
  );
}
export function QuietHeader({
  helpLabel,
  back,
}: {
  helpLabel?: string;
  back?: () => void;
}) {
  return (
    <header className={styles.quietHeader}>
      {back ? (
        <button className={styles.textAction} type="button" onClick={back}>
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Back</span>
        </button>
      ) : (
        <DiscoveryMark />
      )}
      {back && <DiscoveryMark />}
      <button
        className={styles.helpAction}
        type="button"
        aria-label={helpLabel ?? "About this scene"}
        title={helpLabel ?? "About this scene"}
      >
        <CircleHelp size={18} aria-hidden="true" />
        {helpLabel && <span>{helpLabel}</span>}
      </button>
    </header>
  );
}

type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "primary" | "secondary" | "text";
  arrow?: boolean;
};

export function Action({
  children,
  tone = "primary",
  arrow = false,
  className = "",
  ...props
}: ActionProps) {
  return (
    <button
      className={`${styles.action} ${styles[`action_${tone}`]} ${className}`}
      type="button"
      {...props}
    >
      <span>{children}</span>
      {arrow && <ArrowRight size={19} aria-hidden="true" />}
    </button>
  );
}

export function PrivacyNote() {
  return (
    <p className={styles.privacyNote}>
      <LockKeyhole size={15} aria-hidden="true" />
      Prototype input stays in this browser session and is not sent to external
      services.
    </p>
  );
}

export function Eyebrow({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "green" | "orange" | "violet";
}) {
  return (
    <p className={`${styles.eyebrow} ${styles[`eyebrow_${tone}`]}`}>
      {children}
    </p>
  );
}

export function Panel({
  children,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "soft" | "blue" | "green" | "orange" | "violet";
}) {
  return (
    <section
      className={`${styles.panel} ${styles[`panel_${tone}`]} ${className}`}
    >
      {children}
    </section>
  );
}

export function LockPrototypeAction({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <form action="/alpha/lock" method="post" className={styles.lockForm}>
      <button
        className={compact ? styles.iconAction : styles.lockAction}
        type="submit"
        aria-label={compact ? "Lock prototype" : undefined}
        title="Lock prototype"
      >
        <LockKeyhole size={compact ? 18 : 14} aria-hidden="true" />
        {!compact && <span>Lock prototype</span>}
      </button>
    </form>
  );
}
