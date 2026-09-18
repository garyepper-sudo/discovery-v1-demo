import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { bootstrapProductionDesignPartner, type ProductionDesignPartnerBootstrapInputV1 } from "../../product/integration/productionDesignPartnerBootstrap";

type FileInput = Omit<ProductionDesignPartnerBootstrapInputV1, "sources"> & {
  sources: readonly { externalKey: string; mediaType: "text/plain" | "text/markdown"; contentPath: string }[];
};

const args = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index], value = process.argv[index + 1];
  if (!name?.startsWith("--") || !value) throw new Error("Arguments require --name value.");
  args.set(name.slice(2), value);
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV !== "production") throw new Error("Production bootstrap is unavailable.");
  const inputPath = args.get("input");
  if (!inputPath || args.size !== 1) throw new Error("Exactly --input <absolute-json-path> is required.");
  const absoluteInput = path.resolve(inputPath);
  if (absoluteInput !== inputPath) throw new Error("Bootstrap input path must be absolute.");
  const raw = JSON.parse(await readFile(absoluteInput, "utf8")) as FileInput;
  const sources = await Promise.all(raw.sources.map(async source => {
    const contentPath = path.resolve(source.contentPath);
    if (contentPath !== source.contentPath) throw new Error("Bootstrap source path must be absolute.");
    return { externalKey: source.externalKey, mediaType: source.mediaType, bytes: new Uint8Array(await readFile(contentPath)) };
  }));
  // The receipt intentionally excludes source bodies and environment values.
  console.log(JSON.stringify(await bootstrapProductionDesignPartner({ ...raw, sources }), null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Production bootstrap failed.");
  process.exitCode = 1;
});
