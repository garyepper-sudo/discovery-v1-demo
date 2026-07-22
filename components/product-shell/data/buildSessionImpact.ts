import type { SessionEntry } from "../shared/InteractionSession";

export function buildSessionImpact(entries: SessionEntry[]) {
  const unique = entries.filter((entry, index, items) => items.findIndex((candidate) => candidate.action === entry.action && candidate.kind === entry.kind && candidate.status === entry.status && candidate.label.trim().toLowerCase() === entry.label.trim().toLowerCase()) === index);
  const durable = unique.filter((entry) => entry.status !== "provisional");
  const provisional = unique.filter((entry) => entry.status === "provisional");
  return {
    headline: durable.length ? "You made Discovery better." : "Discovery is considering this.",
    durable,
    provisional,
    changedModel: durable.length > 0,
  };
}

export function completedSessionEntry<T extends Omit<SessionEntry, "id">>(succeeded: boolean, entry: T): T | null {
  return succeeded ? entry : null;
}
