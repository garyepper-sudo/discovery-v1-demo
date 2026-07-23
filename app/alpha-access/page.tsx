import type { Metadata } from "next";

import { safeAlphaPath } from "../../lib/alpha-access/session";
import AlphaAccessForm from "./AlphaAccessForm";
import styles from "./AlphaAccess.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advisor prototype access",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AlphaAccessPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const next = safeAlphaPath(searchParams.next);
  const invalid = searchParams.error === "invalid";

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="alpha-access-title">
        <div className={styles.brand} aria-label="Discovery">
          <span aria-hidden="true">✦</span>
          <strong>Discovery</strong>
        </div>
        <div className={styles.intro}>
          <span className={styles.mark} aria-hidden="true">✦</span>
          <p>Advisor access</p>
          <h1 id="alpha-access-title">Enter the advisor prototype</h1>
          <p>
            This private prototype is available to invited Discovery advisors.
          </p>
        </div>
        <AlphaAccessForm next={next} invalid={invalid} />
      </section>
    </main>
  );
}
