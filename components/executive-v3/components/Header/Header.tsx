"use client";

import styles from "./Header.module.css";

type HeaderProps = {
  userName?: string;
  meaningfulChangeCount: number;
};

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function Header({
  userName = "Gary",
  meaningfulChangeCount,
}: HeaderProps) {
  const changeLabel =
    meaningfulChangeCount === 1
      ? "important thing"
      : "important things";

  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          Discovery
        </p>

        <h1>
          {getGreeting()}, {userName}.
        </h1>

        <p className={styles.summary}>
          Discovery learned{" "}
          <strong>{meaningfulChangeCount}</strong>{" "}
          {changeLabel} since your last visit.
        </p>
      </div>
    </header>
  );
}