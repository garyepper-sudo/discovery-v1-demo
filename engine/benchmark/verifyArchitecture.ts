import fs from "node:fs";
import path from "node:path";

type VerificationStatus = "pass" | "fail";

type ProducerRule = {
  capability: string;
  file: string;
  producer: string;
  expectedOccurrences?: number;
};

type ProducerVerification = {
  capability: string;
  file: string;
  producer: string;
  status: VerificationStatus;
  message: string;
};

const PROJECT_ROOT = process.cwd();

const CANONICAL_PRODUCERS: ProducerRule[] = [
  {
    capability: "Organizational Understanding",
    file: "engine/v3/understanding/synthesizeUnderstanding.ts",
    producer: "synthesizeUnderstanding",
    expectedOccurrences: 1,
  },
  {
    capability: "Organizational Reasoning",
    file: "engine/v3/model/reasoning/organizationalReasoningEngine.ts",
    producer: "runOrganizationalReasoningEngine",
    expectedOccurrences: 1,
  },
  {
    capability: "Organizational Mechanisms",
    file: "engine/v3/model/judgment/mechanismInterpreter.ts",
    producer: "interpretMechanismCandidates",
    expectedOccurrences: 1,
  },
  {
    capability: "Executive Assessment",
    file: "engine/v3/model/judgment/buildExecutiveAssessment.ts",
    producer: "buildExecutiveAssessment",
    expectedOccurrences: 1,
  },
];

function printDivider(character = "=", width = 57): void {
  console.log(character.repeat(width));
}

function resolveProjectPath(relativePath: string): string {
  return path.resolve(PROJECT_ROOT, relativePath);
}

function readSourceFile(relativePath: string): string | undefined {
  const absolutePath = resolveProjectPath(relativePath);

  if (!fs.existsSync(absolutePath)) {
    return undefined;
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countExportedProducerDefinitions(
  source: string,
  producer: string,
): number {
  const escapedProducer = escapeRegExp(producer);

  const patterns = [
    new RegExp(
      `export\\s+function\\s+${escapedProducer}\\s*\\(`,
      "g",
    ),
    new RegExp(
      `export\\s+async\\s+function\\s+${escapedProducer}\\s*\\(`,
      "g",
    ),
    new RegExp(
      `export\\s+const\\s+${escapedProducer}\\s*=`,
      "g",
    ),
  ];

  return patterns.reduce((total, pattern) => {
    return total + (source.match(pattern)?.length ?? 0);
  }, 0);
}

function verifyProducer(rule: ProducerRule): ProducerVerification {
  const source = readSourceFile(rule.file);

  if (source === undefined) {
    return {
      capability: rule.capability,
      file: rule.file,
      producer: rule.producer,
      status: "fail",
      message: `Source file not found: ${rule.file}`,
    };
  }

  const expectedOccurrences = rule.expectedOccurrences ?? 1;
  const actualOccurrences = countExportedProducerDefinitions(
    source,
    rule.producer,
  );

  if (actualOccurrences === 0) {
    return {
      capability: rule.capability,
      file: rule.file,
      producer: rule.producer,
      status: "fail",
      message: `Canonical producer export not found: ${rule.producer}()`,
    };
  }

  if (actualOccurrences !== expectedOccurrences) {
    return {
      capability: rule.capability,
      file: rule.file,
      producer: rule.producer,
      status: "fail",
      message:
        `Expected ${expectedOccurrences} exported definition(s), ` +
        `but found ${actualOccurrences}.`,
    };
  }

  return {
    capability: rule.capability,
    file: rule.file,
    producer: rule.producer,
    status: "pass",
    message: `Canonical producer verified: ${rule.producer}()`,
  };
}

function calculateIntegrityScore(
  results: ProducerVerification[],
): number {
  if (results.length === 0) return 0;

  const passed = results.filter(
    (result) => result.status === "pass",
  ).length;

  return Math.round((passed / results.length) * 100);
}

function printVerificationResult(
  result: ProducerVerification,
): void {
  console.log(result.capability);
  printDivider("-", 57);

  if (result.status === "pass") {
    console.log(`✓ ${result.message}`);
    console.log(`  File: ${result.file}`);
  } else {
    console.log(`✗ ${result.message}`);
    console.log(`  Expected file: ${result.file}`);
  }

  console.log("");
}

function runArchitectureVerification(): void {
  printDivider();
  console.log("DISCOVERY ARCHITECTURE VERIFICATION");
  printDivider();
  console.log("");

  const results = CANONICAL_PRODUCERS.map(verifyProducer);

  for (const result of results) {
    printVerificationResult(result);
  }

  const verifiedProducers = results.filter(
    (result) => result.status === "pass",
  ).length;

  const failedProducers = results.filter(
    (result) => result.status === "fail",
  ).length;

  const integrityScore = calculateIntegrityScore(results);

  printDivider();
  console.log("ARCHITECTURE INTEGRITY");
  printDivider();
  console.log("");
  console.log(
    `Verified Producers ............ ${verifiedProducers}`,
  );
  console.log(
    `Failed Producer Checks ........ ${failedProducers}`,
  );
  console.log(
    `Total Producer Checks ......... ${results.length}`,
  );
  console.log(
    `Integrity Score ............... ${integrityScore}%`,
  );
  console.log("");

  if (failedProducers > 0) {
    console.log("Architecture Verification ..... FAIL");
    printDivider();
    process.exitCode = 1;
    return;
  }

  console.log("Architecture Verification ..... PASS");
  printDivider();
}

runArchitectureVerification();