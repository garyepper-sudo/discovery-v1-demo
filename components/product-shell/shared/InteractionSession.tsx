"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type SessionEntry = {
  id: string;
  kind: "discussion" | "observation" | "insight" | "decision";
  label: string;
  status: "provisional" | "saved" | "committed";
  action: "brainstorm" | "stress-test" | "add-context" | "challenge" | "save-insight" | "create-decision";
};

type SessionContextValue = {
  entries: SessionEntry[];
  addEntry: (entry: Omit<SessionEntry, "id">) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function InteractionSessionProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SessionEntry[]>([]);
  const value = useMemo(() => ({
    entries,
    addEntry: (entry: Omit<SessionEntry, "id">) => setEntries((current) => {
      const key = `${entry.action}:${entry.kind}:${entry.status}:${entry.label.trim().toLowerCase()}`;
      if (current.some((item) => `${item.action}:${item.kind}:${item.status}:${item.label.trim().toLowerCase()}` === key)) return current;
      return [...current, { ...entry, id: key }];
    }),
  }), [entries]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useInteractionSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Interaction session is unavailable.");
  return value;
}
