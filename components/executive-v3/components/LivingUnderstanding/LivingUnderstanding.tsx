import styles from "./LivingUnderstanding.module.css";

export default function LivingUnderstanding() {
  return (
    <section className={styles.organism}>
      <div className={styles.header}>
        <p>Living Understanding</p>
        <span>Active</span>
      </div>

      <div
        className={styles.visual}
        aria-hidden="true"
      >
        <span className={styles.orbitOne} />
        <span className={styles.orbitTwo} />
        <span className={styles.core} />
        <i className={styles.nodeOne} />
        <i className={styles.nodeTwo} />
        <i className={styles.nodeThree} />
      </div>

      <p className={styles.caption}>
        Discovery&apos;s understanding continues to evolve as new evidence arrives.
      </p>
    </section>
  );
}