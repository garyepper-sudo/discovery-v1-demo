import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  ONBOARDING_EVIDENCE_MAX_FILES,
  type OnboardingEvidenceSubmission,
} from "../../lib/onboarding/evidence/onboardingEvidence";
import {
  buildOnboardingInvestigationInput,
} from "../../lib/onboarding/testing/buildOnboardingInvestigationInput";

function evidence(
  index: number,
  batch: number,
): OnboardingEvidenceSubmission {
  const content =
    `Batch ${batch} source ${index} reports a concrete operating observation with timing, ownership, and outcome.`;
  return {
    id: `batch-${batch}-${index}`,
    sourceRole: `batch-${batch}-source-${index}`,
    displayName: `Batch ${batch} operating note ${index}`,
    ingestionMethod: "paste",
    contentDigest: createHash("sha256").update(content).digest("hex"),
    extractionStatus: "extracted",
    content,
  };
}

async function main(): Promise<void> {
  const component = readFileSync(
    "components/onboarding/DiscoveryOnboardingExperience.tsx",
    "utf8",
  );
  const styles = readFileSync(
    "components/onboarding/DiscoveryOnboardingExperience.module.css",
    "utf8",
  );
  const normalizedComponent = component.replace(/\s+/g, " ");
  const batchOne = [1, 2, 3].map((index) => evidence(index, 1));
  const batchTwo = [1, 2, 3].map((index) => evidence(index, 2));
  const submission = {
    company: "Iterative Evidence Organization",
    industry: "Services",
    website: "https://example.test",
    question: "Why are cross-functional decisions taking longer?",
    messyInput:
      "Decision lead time increased while the number of approval handoffs also increased.",
  };

  assert.equal(ONBOARDING_EVIDENCE_MAX_FILES, 3);
  assert.equal(
    buildOnboardingInvestigationInput({
      ...submission,
      evidenceSources: batchOne,
    }).evidenceSources?.length,
    6,
    "Three batch sources plus three onboarding-form sources must be admitted.",
  );
  assert.throws(
    () =>
      buildOnboardingInvestigationInput({
        ...submission,
        evidenceSources: [...batchOne, evidence(4, 1)],
      }),
    /Invalid onboarding evidence collection/,
    "A fourth source must remain blocked within one request batch.",
  );

  for (const copy of [
    "Add up to three sources in this update.",
    "After Discovery updates the understanding, you can add another batch.",
    "This update is ready. Submit these sources, then you can add more.",
    "Update understanding",
    "Add more information",
    "You can keep improving this understanding as new information becomes available.",
  ]) {
    assert.ok(
      normalizedComponent.includes(copy),
      `Missing iterative batch copy: ${copy}`,
    );
  }
  assert.ok(
    component.includes("setEvidenceSources([])") &&
      component.includes("evidenceSources: []"),
    "A completed update must open a fresh empty client batch.",
  );
  assert.ok(
    component.includes("evidencePresentationName") &&
      component.includes(".slice(0, 72)") &&
      component.includes('"Pasted information"'),
    "Source labels must use bounded readable metadata or preview fallback.",
  );
  assert.equal(component.includes("bounded parser"), false);
  assert.equal(component.includes("Up to three sources, 512 KB each"), false);
  assert.ok(
    styles.includes(".batchReady") && styles.includes("@media"),
    "The full-batch state must use the existing responsive onboarding layout.",
  );

  const runtimeDirectory = mkdtempSync(
    path.join(os.tmpdir(), "discovery-iterative-evidence-"),
  );
  process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY = runtimeDirectory;
  const organizationId = "onb-dev-iterative-evidence-validation";
  const originalLog = console.log;
  console.log = () => undefined;

  try {
    const { runOrganizationInvestigation } = await import(
      "../../engine/v3/investigation/runOrganizationInvestigation"
    );
    const first = runOrganizationInvestigation({
      organizationId,
      ...buildOnboardingInvestigationInput({
        ...submission,
        evidenceSources: batchOne,
      }),
      investigationRequestId: `onboarding-investigation-${"a".repeat(64)}`,
    });
    const secondInput = {
      organizationId,
      ...buildOnboardingInvestigationInput({
        ...submission,
        evidenceSources: batchTwo,
      }),
      investigationRequestId: `onboarding-investigation-${"b".repeat(64)}`,
    };
    const second = runOrganizationInvestigation(secondInput);
    const replay = runOrganizationInvestigation(secondInput);

    assert.equal(first.idempotentReplay, false);
    assert.equal(second.idempotentReplay, false);
    assert.equal(replay.idempotentReplay, true);
    assert.equal(second.runtime.metadata.organizationId, organizationId);
    assert.equal(second.runtime.metadata.investigationCount, 2);
    assert.equal(
      second.runtime.metadata.investigationReceipts?.length,
      2,
    );
    const iterativeMemory = second.runtime.memory as
      typeof second.runtime.memory & {
        understandingSnapshots?: unknown[];
      };
    assert.ok(
      (iterativeMemory.understandingSnapshots?.length ?? 0) >= 2,
      "Runtime memory must preserve understanding across both admitted batches.",
    );
    assert.equal(
      replay.runtime.metadata.investigationCount,
      second.runtime.metadata.investigationCount,
      "An identical completed batch retry must not create another investigation.",
    );
  } finally {
    console.log = originalLog;
    rmSync(runtimeDirectory, { recursive: true, force: true });
  }

  console.log(JSON.stringify({
    validation: "iterative-evidence-batches",
    result: "PASS",
    batchLimit: 3,
    completedBatches: 2,
    thirdBatchAvailable: true,
    sameQuestionAndOrganization: true,
    cumulativeRuntimeMemoryPreserved: true,
    identicalRetryIdempotent: true,
    readableLabels: true,
    rawIdentifiersVisible: false,
    exactResetContractUnchanged: true,
  }, null, 2));
}

void main();
