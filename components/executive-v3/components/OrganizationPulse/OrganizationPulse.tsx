import styles from "./OrganizationPulse.module.css";

type OrganizationPulseProps = {
  confidence: number;
  meaningfulChangeCount: number;
};

export default function OrganizationPulse({
  confidence,
  meaningfulChangeCount,
}: OrganizationPulseProps) {
  return (
    <section className={styles.pulse}>
      <p className={styles.eyebrow}>
        Organization Pulse
      </p>

      <div className={styles.score}>
        <strong>{confidence}%</strong>
        <span>Understanding confidence</span>
      </div>

      <p className={styles.summary}>
        Discovery detected {meaningfulChangeCount} meaningful{" "}
        {meaningfulChangeCount === 1 ? "change" : "changes"}.
      </p>
    </section>
  );
}