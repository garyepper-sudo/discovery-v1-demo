import {
  V3ConfidenceBand,
  V3Evidence,
  V3EvidenceType,
  V3Polarity,
  V3SignalStrength,
} from "./types";

function detectType(text: string): V3EvidenceType {
  const t = text.toLowerCase();

  if (t.includes("?")) return "question";

  if (
    t.includes("risk") ||
    t.includes("decline") ||
    t.includes("slow") ||
    t.includes("loss") ||
    t.includes("problem") ||
    t.includes("concern") ||
    t.includes("churn") ||
    t.includes("confusing") ||
    t.includes("complaint")
  ) {
    return "risk";
  }

  if (
    t.includes("opportunity") ||
    t.includes("growth") ||
    t.includes("expand") ||
    t.includes("increase") ||
    t.includes("upside")
  ) {
    return "opportunity";
  }

  if (t.includes("revenue") || t.includes("%") || /\d/.test(t)) {
    return "metric";
  }

  if (
    t.includes("should") ||
    t.includes("plan") ||
    t.includes("decision") ||
    t.includes("prioritize") ||
    t.includes("recommend")
  ) {
    return "decision";
  }

  if (
    t.includes("believes") ||
    t.includes("claims") ||
    t.includes("says") ||
    t.includes("reports")
  ) {
    return "claim";
  }

  return "fact";
}

function detectPolarity(text: string): V3Polarity {
  const t = text.toLowerCase();

  const negativeWords = [
    "risk",
    "decline",
    "slow",
    "loss",
    "problem",
    "concern",
    "churn",
    "confusing",
    "complaint",
    "pressure",
    "weak",
    "miss",
    "delay",
  ];

  const positiveWords = [
    "growth",
    "opportunity",
    "increase",
    "expand",
    "strong",
    "improve",
    "upside",
    "positive",
    "momentum",
    "demand",
  ];

  const negative = negativeWords.some((word) => t.includes(word));
  const positive = positiveWords.some((word) => t.includes(word));

  if (positive && negative) return "mixed";
  if (positive) return "positive";
  if (negative) return "negative";
  return "neutral";
}

function detectStrength(text: string): V3SignalStrength {
  const t = text.toLowerCase();

  if (
    t.includes("%") ||
    /\d/.test(t) ||
    t.includes("major") ||
    t.includes("critical") ||
    t.includes("significant") ||
    t.includes("repeated")
  ) {
    return "strong";
  }

  if (
    t.includes("some") ||
    t.includes("may") ||
    t.includes("could") ||
    t.includes("early") ||
    t.includes("possible")
  ) {
    return "weak";
  }

  return "moderate";
}

function confidenceFrom(text: string, type: V3EvidenceType): number {
  let confidence = 0.72;

  if (type === "metric") confidence += 0.12;
  if (type === "fact") confidence += 0.06;
  if (type === "claim") confidence -= 0.08;
  if (type === "question") confidence -= 0.12;
  if (text.length > 80) confidence += 0.04;
  if (text.toLowerCase().includes("may") || text.toLowerCase().includes("could")) {
    confidence -= 0.06;
  }

  return Math.max(0.35, Math.min(0.95, Number(confidence.toFixed(2))));
}

function confidenceBand(confidence: number): V3ConfidenceBand {
  if (confidence >= 0.78) return "high";
  if (confidence >= 0.58) return "medium";
  return "low";
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "company",
    "website",
    "industry",
    "question",
    "context",
    "about",
    "their",
    "there",
    "would",
    "could",
    "should",
    "because",
    "current",
    "using",
    "from",
    "with",
    "that",
    "this",
  ]);

  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s%]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .filter((word) => !stopWords.has(word))
    )
  ).slice(0, 12);
}

function extractEntities(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/\s+/)
        .filter((word) => /^[A-Z][a-zA-Z0-9&.-]+/.test(word))
        .map((word) => word.replace(/[^\w&.-]/g, ""))
        .filter(Boolean)
    )
  );
}

export function buildEvidence(context: string): V3Evidence[] {
  return context
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => {
      const type = detectType(text);
      const confidence = confidenceFrom(text, type);

      return {
        id: `E${index + 1}`,
        text,
        type,
        confidence,
        confidenceBand: confidenceBand(confidence),
        polarity: detectPolarity(text),
        strength: detectStrength(text),
        keywords: extractKeywords(text),
        entities: extractEntities(text),
        source: "user",
        relatedEvidenceIds: [],
        inferredFrom: [],
      };
    });
}