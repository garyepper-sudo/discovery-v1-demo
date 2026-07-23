import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  LockKeyhole,
  MoreHorizontal,
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

export function ScreenActions() {
  return (
    <button className={styles.iconAction} type="button" aria-label="More actions">
      <MoreHorizontal size={20} aria-hidden="true" />
    </button>
  );
}
