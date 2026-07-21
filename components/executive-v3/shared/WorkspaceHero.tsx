"use client";

import styles from "../ExecutiveWorkspace.module.css";

type WorkspaceHeroProps = {
  /**
   * Small contextual label shown above the hero.
   *
   * Examples:
   * - Executive Brief
   * - Operating Model
   * - Evaluate Decision
   * - Decision Lab
   */
  context?: string;

  /**
   * Primary workspace title.
   */
  title: string;

  /**
   * Optional supporting explanation.
   */
  description?: string;

  /**
   * Optional content rendered below the hero.
   */
  children?: React.ReactNode;
};

export default function WorkspaceHero({
  context,
  title,
  description,
  children,
}: WorkspaceHeroProps) {
  return (
    <header className={styles.workspaceHero}>
      {context ? (
        <p
          className={
            styles.placeholderEyebrow
          }
        >
          {context}
        </p>
      ) : null}

      <h1>{title}</h1>

      {description ? (
        <p
          className={
            styles.workspaceHeroDescription
          }
        >
          {description}
        </p>
      ) : null}

      {children ? (
        <div
          className={
            styles.workspaceHeroContent
          }
        >
          {children}
        </div>
      ) : null}
    </header>
  );
}