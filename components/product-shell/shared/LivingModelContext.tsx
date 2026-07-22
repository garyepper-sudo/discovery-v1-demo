import type { OrganizationModelContext } from "../data/buildOrganizationModelContext";
import styles from "./LivingModelContext.module.css";

export default function LivingModelContext({ model, activeIds = [] }: { model: OrganizationModelContext; activeIds?: string[] }) {
  return (
    <section className={styles.model} aria-label="Organization Model context">
      <div><p>Living Organization Model</p><strong>{model.coherence === null ? "—" : `${model.coherence}%`}</strong><span>{model.coherenceLabel}</span></div>
      <ul>{model.areas.map((area) => <li key={area.id} className={activeIds.includes(area.id) ? styles.active : undefined}><i aria-hidden="true" /><span>{area.label}</span><small>{area.status.replace(/-/g, " ")}</small></li>)}</ul>
    </section>
  );
}
