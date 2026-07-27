import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { createOrganizationRuntimeRepository } from "../../engine/v3/runtime";

async function main(): Promise<void> {
  const [operation, organizationId, backupId] = process.argv.slice(2);
  assert.match(organizationId ?? "", /^[a-zA-Z0-9_-]+$/, "Exact organization id required");
  assert.match(backupId ?? "", /^[a-zA-Z0-9_-]+$/, "Exact backup id required");

  const repository = createOrganizationRuntimeRepository();
  const metadata = {
    requestId: process.env.DISCOVERY_OPERATION_REQUEST_ID ?? crypto.randomUUID(),
    operatorId: process.env.DISCOVERY_OPERATION_OPERATOR_ID ?? "runtime-recovery-cli",
  };

  if (operation === "backup") {
    const current = await repository.backup(organizationId!, backupId!, metadata);
    console.log(JSON.stringify({
      operation,
      organizationId,
      backupId,
      backend: repository.backend,
      sha256: createHash("sha256").update(current.bytes).digest("hex"),
    }));
    return;
  }

  if (operation === "restore") {
    const current = await repository.read(organizationId!);
    assert.ok(current, "Active Runtime is unavailable");
    const restored = await repository.restore(
      organizationId!,
      backupId!,
      current.revision,
      metadata,
    );
    assert.equal(restored.runtime.metadata.organizationId, organizationId);
    console.log(JSON.stringify({
      operation,
      organizationId,
      backupId,
      backend: repository.backend,
      sha256: createHash("sha256").update(restored.bytes).digest("hex"),
    }));
    return;
  }

  throw new Error("Operation must be backup or restore");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
