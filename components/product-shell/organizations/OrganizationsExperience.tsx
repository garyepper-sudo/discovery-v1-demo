import Link from "next/link";

import type { OrganizationsExperienceView } from "../data/buildOrganizationsExperienceView";
import styles from "./OrganizationsExperience.module.css";

export default function OrganizationsExperience({
  view,
}: {
  view: OrganizationsExperienceView;
}) {
  return (
    <main className={styles.page}>
      <header className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>
          <strong>Discovery</strong>
          <small>Organization intelligence</small>
        </span>
      </header>

      <section className={styles.workspace} aria-labelledby="organizations-title">
        <header className={styles.heading}>
          <div>
            <p>Operating models</p>
            <h1 id="organizations-title">Organizations</h1>
            <span>Select an organization to enter its executive workspace.</span>
          </div>
          <Link className={styles.create} href={view.createDestination}>
            Create Organization
          </Link>
        </header>

        {view.organizations.length > 0 ? (
          <ul className={styles.organizations}>
            {view.organizations.map((organization) => (
              <li key={organization.organizationId}>
                <Link href={organization.destination}>
                  <span className={styles.identity}>
                    <strong>{organization.name}</strong>
                    {organization.industry && <small>{organization.industry}</small>}
                  </span>
                  <span className={styles.metadata}>
                    <span>Updated {organization.lastUpdated}</span>
                    <span>{organization.investigationCount}</span>
                  </span>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>No organizations have been created yet.</p>
            <Link href={view.createDestination}>Create your first organization</Link>
          </div>
        )}
      </section>
    </main>
  );
}
