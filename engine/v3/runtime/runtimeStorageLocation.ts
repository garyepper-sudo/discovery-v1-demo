import path from "path";

export function getRuntimeOrganizationsDirectory(): string {
  const configuredDirectory = process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY;
  if (configuredDirectory) {
    if (!path.isAbsolute(configuredDirectory)) {
      throw new Error(
        "DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY must be an absolute path",
      );
    }
    return path.normalize(configuredDirectory);
  }

  return process.env.VERCEL === "1"
    ? path.join(
        "/tmp",
        ".discovery-runtime",
        "organizations",
      )
    : path.join(
        process.cwd(),
        ".discovery-runtime",
        "organizations",
      );
}
