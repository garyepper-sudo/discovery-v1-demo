import styles from "./AskDiscovery.module.css";

export default function AskDiscovery() {
  return (
    <section className={styles.ask}>
      <p className={styles.eyebrow}>
        Ask Discovery
      </p>

      <h2>
        Explore what matters next.
      </h2>

      <div className={styles.input}>
        <input
          type="text"
          placeholder="Ask about the organization..."
        />

        <button type="button">
          Ask
        </button>
      </div>

      <div className={styles.suggestions}>
        <button type="button">
          What is driving execution risk?
        </button>

        <button type="button">
          What should leadership investigate?
        </button>
      </div>
    </section>
  );
}