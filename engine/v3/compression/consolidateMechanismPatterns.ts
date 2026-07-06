import type { OrganizationalMechanism } from "../model/judgment/organizationalMechanism";

export type MechanismPattern = {
  id: string;
  name: string;
  mechanismType: string;

  frequency: number;
  averageConfidence: number;

  totalSeverity: number;

  supportingMechanismIds: string[];

  dominantScope: string;

  // structural enrichment (reinforcement-aware)
  dominantCapabilities: string[];
  patternSignature: string;

  // 🔥 NEW: reinforcement signal (this is what fixes score collapse)
  reinforcementWeight: number;
};

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function severityBand(severity: number | string | undefined): string {
  const s = typeof severity === "number" ? severity : 0;

  if (s >= 0.8) return "high";
  if (s >= 0.5) return "medium";
  return "low";
}

function normalizeCapabilities(m: OrganizationalMechanism): string[] {
  return (m.affectedCapabilities ?? []).slice(0, 3).sort();
}

/**
 * Pattern identity is now reinforcement-sensitive
 */
function derivePatternKey(m: OrganizationalMechanism): string {
  const type = m.type ?? "unknown";
  const scope = m.organizationalScope ?? "unknown";
  const severity = severityBand(m.severity);
  const capSig = normalizeCapabilities(m).join("|");

  return `${type}::${scope}::${severity}::${capSig}`;
}

function deriveDominantScope(scopes: (string | undefined)[]): string {
  const counts: Record<string, number> = {};

  for (const s of scopes) {
    if (!s) continue;
    counts[s] = (counts[s] ?? 0) + 1;
  }

  let best = "unknown";
  let bestCount = 0;

  for (const [k, v] of Object.entries(counts)) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }

  return best;
}

function mergeCapabilities(all: string[][]): string[] {
  const set = new Set<string>();
  for (const arr of all) {
    for (const v of arr) set.add(v);
  }
  return Array.from(set).slice(0, 6);
}

/**
 * 🔥 MAIN FIX: reinforcement-aware consolidation
 */
export function consolidateMechanismPatterns(
  mechanisms: OrganizationalMechanism[],
): MechanismPattern[] {
  const map = new Map<string, MechanismPattern>();

  for (const m of mechanisms) {
    const key = derivePatternKey(m);
    const caps = m.affectedCapabilities ?? [];

    const confidence = m.confidence ?? 0;

    // 🔥 NEW SIGNAL: reinforcement proxy (prevents score collapse)
    const reinforcementSignal =
      confidence *
      (1 + (m.supportingCompressedThemeIds?.length ?? 0) * 0.15);

    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        id: `pattern:${key}`,
        name: m.title,
        mechanismType: m.type,

        frequency: 1,
        averageConfidence: confidence,

        totalSeverity: typeof m.severity === "number" ? m.severity : 0,

        supportingMechanismIds: [m.id],

        dominantScope: m.organizationalScope ?? "unknown",

        dominantCapabilities: caps,
        patternSignature: key,

        reinforcementWeight: clamp01(reinforcementSignal),
      });

      continue;
    }

    existing.frequency += 1;
    existing.supportingMechanismIds.push(m.id);

    // stabilize confidence (less volatility, more signal persistence)
    existing.averageConfidence = clamp01(
      average([existing.averageConfidence, confidence]),
    );

    existing.totalSeverity +=
      typeof m.severity === "number" ? m.severity : 0;

    existing.dominantScope = deriveDominantScope([
      existing.dominantScope,
      m.organizationalScope,
    ]);

    existing.dominantCapabilities = mergeCapabilities([
      existing.dominantCapabilities,
      caps,
    ]);

    // 🔥 reinforcement accumulates (this is the key fix)
    existing.reinforcementWeight = clamp01(
      average([existing.reinforcementWeight, reinforcementSignal]),
    );
  }

  return Array.from(map.values()).map((p) => ({
    ...p,
    averageConfidence: clamp01(p.averageConfidence),
  }));
}