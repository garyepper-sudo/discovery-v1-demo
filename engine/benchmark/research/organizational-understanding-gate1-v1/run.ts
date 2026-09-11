import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildPackets, extractiveBaseline, packetManifest } from "./harness";
const output = process.env.DISCOVERY_GATE1_PACKET_OUTPUT_DIR ?? "/private/tmp/discovery-gate1-research-packets";
async function main() {
  await mkdir(output, { recursive: true, mode: 0o700 });
  const packets = buildPackets();
  await writeFile(path.join(output, "candidate-requests.json"), `${JSON.stringify(packets.map((packet) => packet.modelRequest), null, 2)}\n`, { mode: 0o600 });
  await writeFile(path.join(output, "internal-packets.json"), `${JSON.stringify(packets, null, 2)}\n`, { mode: 0o600 });
  await writeFile(path.join(output, "extractive-baselines.json"), `${JSON.stringify(packets.map(extractiveBaseline), null, 2)}\n`, { mode: 0o600 });
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify(packetManifest(), null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ output, candidateRequestPath: path.join(output, "candidate-requests.json"), ...packetManifest() })}\n`);
}
void main();
