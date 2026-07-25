import fs from "node:fs";
import path from "node:path";

export const projectRoot = process.cwd();

const currentReportConfigPath = path.join(
  projectRoot,
  "engineering",
  "performance",
  "current-report.json",
);

const currentReportConfig = JSON.parse(
  fs.readFileSync(currentReportConfigPath, "utf8"),
);

export const depsPaths = {
  currentReportConfig: currentReportConfigPath,
  catalog: path.join(
    projectRoot,
    "engineering",
    "performance",
    "measurement-source-catalog.v1.json",
  ),
  manifest: path.join(projectRoot, currentReportConfig.manifest),
  markdownReport: path.join(projectRoot, currentReportConfig.markdownOutput),
};
