import styles from "./TodaysStory.module.css";

type TodaysStoryProps = {
  headline: string;
  summary: string;
  confidence: number;
};

export default function TodaysStory({
  headline,
  summary,
  confidence,
}: TodaysStoryProps) {
  return (
    <section className={styles.story}>
      <p className={styles.eyebrow}>
        Today&apos;s Story
      </p>

      <h2>{headline}</h2>

      <p className={styles.summary}>
        {summary}
      </p>

      <div className={styles.meta}>
        <strong>{confidence}%</strong>
        <span>Confidence</span>
      </div>
    </section>
  );
}