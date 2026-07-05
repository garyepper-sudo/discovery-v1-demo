import fs from "fs";
import path from "path";

import type { DiscoveryBenchmarkCase } from "./benchmarkTypes";

export function loadBenchmarkCases(): DiscoveryBenchmarkCase[] {
  const datasetDirectory = path.join(__dirname, "datasets");

  if (!fs.existsSync(datasetDirectory)) {
    return [];
  }

  const files = fs
    .readdirSync(datasetDirectory)
    .filter((file) => file.endsWith(".json"));

  return files.map((file) => {
    const fullPath = path.join(datasetDirectory, file);

    const contents = fs.readFileSync(fullPath, "utf8");

    return JSON.parse(contents) as DiscoveryBenchmarkCase;
  });
}