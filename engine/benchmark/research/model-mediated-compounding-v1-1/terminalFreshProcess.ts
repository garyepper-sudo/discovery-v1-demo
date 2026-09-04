import assert from "node:assert/strict";
import { claimPilot, readPilot, type Entry } from "./pilotController";
import { verifyTerminalArchive } from "./terminalStop";

async function main() {
  const root = process.argv[2];
  if (!root) throw new Error("terminal archive root required");
  const state = await readPilot(root);
  const requestTwo = { ...state.schedule[1], request: {} } as Entry;
  await assert.rejects(() => claimPilot(root, requestTwo), /execution version terminal/);
  const verified = await verifyTerminalArchive(root);
  assert.equal(verified.requestTwoClaims, 0);
  console.log(JSON.stringify({ result: "PASS", providerCalls: 0, requestTwoClaims: 0 }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
