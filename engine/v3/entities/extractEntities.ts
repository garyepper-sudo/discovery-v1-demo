import type { EntityMention } from "./entityLifecycle";
import type { OrganizationalEntityType } from "./organizationalEntity";
import { createEntityMention } from "./entityMentionUtils";

type EntityRule = {
  type: OrganizationalEntityType;
  patterns: RegExp[];
};

const ENTITY_RULES: EntityRule[] = [
  {
    type: "actor",
    patterns: [
      /\bCEO\b/g,
      /\bCFO\b/g,
      /\bCOO\b/g,
      /\bCTO\b/g,
      /\bchief executive officer\b/gi,
      /\bleadership\b/gi,
      /\bexecutive team\b/gi,
      /\bexecutives\b/gi,
      /\bmanager(s)?\b/gi,
      /\bdirector(s)?\b/gi,
      /\bnurses\b/gi,
    ],
  },
  {
    type: "team",
    patterns: [
      /\boperations team\b/gi,
      /\boperations\b/gi,
      /\bsales team\b/gi,
      /\bfinance team\b/gi,
      /\bHR team\b/g,
      /\bengineering team\b/gi,
      /\bsupport team\b/gi,
    ],
  },
  {
    type: "system",
    patterns: [
      /\b(?:centralized\s+)?(?:operations\s+)?(?:scheduling\s+)?dashboard\b/gi,
      /\boperations dashboard\b/gi,
      /\bscheduling dashboard\b/gi,
      /\bpatient portal\b/gi,
      /\bCRM\b/g,
      /\bplatform\b/gi,
      /\bsystem\b/gi,
    ],
  },
  {
    type: "process",
    patterns: [
      /\bscheduling process\b/gi,
      /\bscheduling\b/gi,
      /\bpatient intake\b/gi,
      /\bescalation\b/gi,
      /\breporting\b/gi,
      /\bapproval process\b/gi,
      /\bhandoff\b/gi,
      /\breview process\b/gi,
    ],
  },
  {
    type: "technology",
    patterns: [
      /\bAPI\b/g,
      /\bdatabase\b/gi,
      /\bautomation\b/gi,
      /\bspreadsheet\b/gi,
      /\bSlack\b/g,
      /\bSalesforce\b/g,
    ],
  },
  {
    type: "risk",
    patterns: [
      /\bburnout\b/gi,
      /\bemotional exhaustion\b/gi,
      /\bfatigue\b/gi,
      /\bturnover\b/gi,
      /\bcompliance risk\b/gi,
      /\bknowledge loss\b/gi,

      // Contextual risks only.
      // Avoid creating generic standalone entities like "failures" or "bottlenecks".
      /\b(?:dashboard|system|process|scheduling|operations)\s+failure(s)?\b/gi,
      /\b(?:dashboard|system|process|scheduling|operations)\s+bottleneck(s)?\b/gi,
      /\b(?:dashboard|system|process|scheduling|operations)\s+delay(s)?\b/gi,
    ],
  },
  {
    type: "opportunity",
    patterns: [
      /\bautomation opportunity\b/gi,
      /\bexpansion opportunity\b/gi,
      /\btraining opportunity\b/gi,
      /\bstandardization\b/gi,
      /\bimprovement opportunity\b/gi,
    ],
  },
  {
    type: "unknown",
    patterns: [/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}\b/g],
  },
];

function cleanEntityText(value: string): string {
  return value
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeKey(text: string, type: OrganizationalEntityType): string {
  return `${type}:${text.toLowerCase()}`;
}

export function extractEntityMentions(input: {
  organizationId: string;
  sourceId: string;
  sourceType: EntityMention["sourceType"];
  text: string;
}): EntityMention[] {
  const mentions: EntityMention[] = [];
  const seen = new Set<string>();

  for (const rule of ENTITY_RULES) {
    for (const pattern of rule.patterns) {
      const matches = input.text.matchAll(pattern);

      for (const match of matches) {
        const rawText = match[0];
        const text = cleanEntityText(rawText);

        if (!text || text.length < 3) continue;

        const key = makeKey(text, rule.type);
        if (seen.has(key)) continue;

        seen.add(key);

        mentions.push(
          createEntityMention({
            organizationId: input.organizationId,
            text,
            sourceId: input.sourceId,
            sourceType: input.sourceType,
            context: input.text,
            candidateType: rule.type,
            confidence: rule.type === "unknown" ? 0.5 : 0.7,
          })
        );
      }
    }
  }

  return mentions;
}