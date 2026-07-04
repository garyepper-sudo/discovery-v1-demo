const BAD_TOKENS = new Set([
  "discovery",
  "treats",
  "strong",
  "belief",
  "believes",
  "organizational",
  "industrial",
  "strategic",
  "signal",
  "signals",
  "pattern",
  "patterns",
]);

function cleanText(value: string): string {
  return value
    .replace(/Discovery treats this as a strong belief:?/gi, "")
    .replace(/Discovery believes:?/gi, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTokenSoup(value: string): boolean {
  const words = value.split(/\s+/).filter(Boolean);

  if (words.length <= 2) return true;

  const badTokenCount = words.filter((word) =>
    BAD_TOKENS.has(word.toLowerCase())
  ).length;

  return badTokenCount >= Math.max(2, Math.floor(words.length * 0.5));
}

function sentenceCase(value: string): string {
  const cleaned = cleanText(value);
  if (!cleaned) return "";

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function normalizeUnderstandingStatement(raw: string): string {
  const cleaned = cleanText(raw);

  if (!cleaned || isTokenSoup(cleaned)) {
    return "Organizational behavior requires clearer evidence before forming a durable understanding.";
  }

  const trimmed = sentenceCase(cleaned).replace(/[.;:,\s]+$/g, "");

  return `${trimmed}.`;
}

export function createUnderstandingTitle(statement: string): string {
  const base = statement
    .replace(/[.]/g, "")
    .split(/\s+/)
    .filter((word) => !BAD_TOKENS.has(word.toLowerCase()))
    .slice(0, 5)
    .join(" ");

  if (!base) return "Unclear Organizational Understanding";

  return base
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function createUnderstandingMechanism(statement: string): string {
  const lower = statement.toLowerCase();

  if (lower.includes("central") || lower.includes("authority")) {
    return "Decision rights appear concentrated in a smaller group, creating dependency on centralized approval.";
  }

  if (lower.includes("execution") || lower.includes("delivery")) {
    return "Execution patterns suggest a gap between intent, coordination, and operational follow-through.";
  }

  if (lower.includes("knowledge") || lower.includes("memory")) {
    return "Organizational knowledge appears to be retained through people more than durable systems.";
  }

  if (lower.includes("cross-functional") || lower.includes("ownership")) {
    return "Ownership boundaries appear unclear across functions, increasing coordination burden.";
  }

  return "Repeated evidence suggests this behavior may be a stable feature of how the organization operates.";
}