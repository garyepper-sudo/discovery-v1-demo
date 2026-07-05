export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function average(values: number[]): number {
  const valid = values.filter(Number.isFinite);

  if (valid.length === 0) {
    return 0;
  }

  return (
    valid.reduce((sum, value) => sum + value, 0) /
    valid.length
  );
}

export function normalizeText(
  ...values: Array<string | undefined>
): string {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function countMatches(
  text: string,
  terms: string[],
): number {
  return terms.reduce((count, term) => {
    return text.includes(term.toLowerCase())
      ? count + 1
      : count;
  }, 0);
}

export function extractSharedTerms(
  texts: string[],
  vocabulary: string[],
): string[] {
  return vocabulary.filter((term) => {
    const appearances = texts.filter((text) =>
      text.includes(term.toLowerCase()),
    ).length;

    return (
      appearances >=
      Math.max(1, Math.ceil(texts.length * 0.35))
    );
  });
}