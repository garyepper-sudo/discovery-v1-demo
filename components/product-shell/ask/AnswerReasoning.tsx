import type { AskExperienceView } from "../data/buildAskExperienceView";
import styles from "./AskExperience.module.css";

export default function AnswerReasoning({ reasoning }: { reasoning: AskExperienceView["reasoning"] }) {
  const hasReasoning = reasoning.central || reasoning.observations.length || reasoning.confidence || reasoning.couldChangeAnswer;
  if (!hasReasoning) return null;

  return (
    <details className={styles.reasoning}>
      <summary><span>Why Discovery answers this way</span><i aria-hidden="true" /></summary>
      <div className={styles.reasoningBody}>
        {reasoning.central && <section><h3>Central reasoning</h3><p>{reasoning.central}</p></section>}
        {reasoning.observations.length > 0 && <section><h3>Supporting observations</h3><ul>{reasoning.observations.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        {reasoning.confidence && <section><h3>Confidence</h3><p>{reasoning.confidence}</p></section>}
        {reasoning.couldChangeAnswer && <section className={styles.counterEvidence}><h3>What could change the answer</h3><p>{reasoning.couldChangeAnswer}</p></section>}
      </div>
    </details>
  );
}
