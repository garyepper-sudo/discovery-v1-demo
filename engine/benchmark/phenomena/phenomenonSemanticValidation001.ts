
import {
  basename,
} from "node:path";

import {
  inferOrganizationalPhenomena,
} from "../../v3/phenomena/inferOrganizationalPhenomena";

import type {
  OrganizationalPattern,
} from "../../v3/model/observations/organizationalObservations";

type ValidationCheck = {
  id: string;
  label: string;
  passed: boolean;
  message: string;
};

type PhenomenonSemanticValidationReport = {
  benchmarkId: string;
  evaluatedAt: string;
  checks: ValidationCheck[];
  failures: string[];
  passed: boolean;
};

const NOW =
  "2026-07-17T12:00:00.000Z";

function buildDistinctKnowledgeFragmentationPatterns():
  OrganizationalPattern[] {
  return [
    {
      id:
        "pattern-engineering-documentation-fragmentation",

      type:
        "documentation_distributed_across_systems",

      label:
        "Engineering documentation is distributed across systems",

      description:
        "Engineering specifications are split across local files, project drives, and individual team member notes.",

      observationIds: [
        "observation-engineering-docs-local",
        "observation-engineering-specs-inconsistent",
      ],

      sourceEvidenceIds: [
        "evidence-engineering-interview",
        "evidence-engineering-document-audit",
      ],

      relatedEntityIds: [
        "entity-engineering",
      ],

      supportingConceptIds: [],

      supportingMeaningIds: [],

      conceptReinforcement:
        0,

      confidence:
        0.82,

      strength:
        0.78,

      possiblePhenomenonTypes: [
        "knowledge_fragmentation",
      ],
    },

    {
      id:
        "pattern-commercial-documentation-fragmentation",

      type:
        "documentation_distributed_across_systems",

      label:
        "Commercial knowledge is fragmented across account owners",

      description:
        "Customer commitments and account history are distributed across private notes, inboxes, and individual account owner memory.",

      observationIds: [
        "observation-commercial-context-private",
        "observation-customer-history-inaccessible",
      ],

      sourceEvidenceIds: [
        "evidence-sales-interview",
        "evidence-customer-handoff-review",
      ],

      relatedEntityIds: [
        "entity-commercial",
      ],

      supportingConceptIds: [],

      supportingMeaningIds: [],

      conceptReinforcement:
        0,

      confidence:
        0.76,

      strength:
        0.73,

      possiblePhenomenonTypes: [
        "knowledge_fragmentation",
      ],
    },
  ];
}

function printCheck(
  check:
    ValidationCheck,
): void {
  console.log(
    `${check.passed ? "PASS" : "FAIL"}  ${check.label}`,
  );

  console.log(
    `  ${check.message}`,
  );
}

export function runPhenomenonSemanticValidation001():
  PhenomenonSemanticValidationReport {
  const patterns =
    buildDistinctKnowledgeFragmentationPatterns();

  const state =
    inferOrganizationalPhenomena({
      patterns,
      clusters: [],
      now:
        NOW,
    });

  const knowledgeFragmentationPhenomena =
    state.phenomena.filter(
      (phenomenon) =>
        phenomenon.type ===
        "knowledge_fragmentation",
    );

  const representedPatternIds =
    new Set(
      knowledgeFragmentationPhenomena.flatMap(
        (phenomenon) =>
          phenomenon.patternIds ??
          [],
      ),
    );

  const representedEntityIds =
    new Set(
      knowledgeFragmentationPhenomena.flatMap(
        (phenomenon) =>
          phenomenon.relatedEntityIds ??
          [],
      ),
    );

  const checks:
    ValidationCheck[] = [
      {
        id:
          "distinct-realities-preserved",

        label:
          "Distinct realities remain distinct",

        passed:
          knowledgeFragmentationPhenomena.length ===
          2,

        message:
          knowledgeFragmentationPhenomena.length ===
          2
            ? "Two organizational realities sharing the same classification were preserved as distinct phenomena."
            : `Expected 2 distinct knowledge-fragmentation phenomena, but received ${knowledgeFragmentationPhenomena.length}.`,
      },

      {
        id:
          "pattern-ancestry-preserved",

        label:
          "Pattern ancestry is preserved",

        passed:
          representedPatternIds.has(
            "pattern-engineering-documentation-fragmentation",
          ) &&
          representedPatternIds.has(
            "pattern-commercial-documentation-fragmentation",
          ),

        message:
          representedPatternIds.size ===
          2
            ? "Both source patterns remain represented in the phenomenon state."
            : `Expected both source pattern IDs to remain represented, but found ${representedPatternIds.size}.`,
      },

      {
        id:
          "entity-scope-preserved",

        label:
          "Entity scope is preserved",

        passed:
          representedEntityIds.has(
            "entity-engineering",
          ) &&
          representedEntityIds.has(
            "entity-commercial",
          ),

        message:
          representedEntityIds.size ===
          2
            ? "Both distinct organizational entity scopes remain represented."
            : `Expected both entity scopes to remain represented, but found ${representedEntityIds.size}.`,
      },
    ];

  const failures =
    checks
      .filter(
        (check) =>
          !check.passed,
      )
      .map(
        (check) =>
          `${check.label}: ${check.message}`,
      );

  const passed =
    failures.length ===
    0;

  console.log("");
  console.log("==========================================");
  console.log("PHENOMENON SEMANTIC VALIDATION 001");
  console.log("==========================================");
  console.log("");

  console.log(
    `Input patterns: ${patterns.length}`,
  );

  console.log(
    `Produced phenomena: ${state.phenomena.length}`,
  );

  console.log(
    `Knowledge-fragmentation phenomena: ${knowledgeFragmentationPhenomena.length}`,
  );

  console.log("");

  for (const phenomenon of state.phenomena) {
    console.log(
      `Phenomenon: ${phenomenon.label}`,
    );

    console.log(
      `  ID: ${phenomenon.id}`,
    );

    console.log(
      `  Type: ${phenomenon.type}`,
    );

    console.log(
      `  Pattern IDs: ${(phenomenon.patternIds ?? []).join(", ") || "none"}`,
    );

    console.log(
      `  Entity IDs: ${(phenomenon.relatedEntityIds ?? []).join(", ") || "none"}`,
    );

    console.log("");
  }

  console.log("Semantic checks");
  console.log("------------------------------------------");

  for (const check of checks) {
    printCheck(
      check,
    );
  }

  console.log("");
  console.log("==========================================");
  console.log("VALIDATION RESULT");
  console.log("==========================================");
  console.log("");

  if (passed) {
    console.log("PASS");
  } else {
    console.log("FAIL");
    console.log("");

    for (const failure of failures) {
      console.log(
        `- ${failure}`,
      );
    }
  }

  console.log("");

  return {
    benchmarkId:
      "phenomenon-semantic-validation-001",

    evaluatedAt:
      new Date()
        .toISOString(),

    checks,

    failures,

    passed,
  };
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "phenomenonSemanticValidation001.ts"
) {
  const report =
    runPhenomenonSemanticValidation001();

  if (
    !report.passed
  ) {
    process.exitCode =
      1;
  }
}

export type {
  PhenomenonSemanticValidationReport,
  ValidationCheck,
};
