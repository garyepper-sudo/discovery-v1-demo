import styles from "./WorkspacePlaceholder.module.css";

type WorkspacePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
};

export default function WorkspacePlaceholder({
  eyebrow,
  title,
  description,
  note,
}: WorkspacePlaceholderProps) {
  return (
    <section className={styles.placeholder}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.stage} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.orbitInner} />
        <div className={styles.core} />
      </div>

      <p className={styles.note}>{note}</p>
    </section>
  );
}
