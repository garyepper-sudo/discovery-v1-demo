import path from "path";

export function getRuntimeOrganizationsDirectory(): string {
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
