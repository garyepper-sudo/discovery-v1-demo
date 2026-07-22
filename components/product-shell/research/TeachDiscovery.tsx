import type { ResearchExperienceView } from "../data/buildResearchExperienceView";
import styles from "./ResearchExperience.module.css";

export default function TeachDiscovery({ requests }: { requests: ResearchExperienceView["evidenceRequests"] }) {
  return (
    <section className={styles.teach} aria-labelledby="teach-discovery-title">
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>Help Discovery learn</p>
        <h2 id="teach-discovery-title">Evidence that would improve the model.</h2>
        <p>{requests.length ? "Discovery has identified the following evidence gaps in the current Organization Model." : "Discovery has not yet recorded a specific evidence request."}</p>
      </div>
      {requests.length > 0 && (
        <ol>
          {requests.map((request, index) => (
            <li key={request.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{request.title}</h3><p>{request.explanation}</p></div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
