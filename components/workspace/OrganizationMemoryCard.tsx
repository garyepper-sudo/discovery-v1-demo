"use client";

type Props = {
  organizationRuntime?: any;
};

export default function OrganizationMemoryCard({ organizationRuntime }: Props) {
  const metadata = organizationRuntime?.metadata;
  const memory = organizationRuntime?.memory;

  const investigations = metadata?.investigationCount ?? 0;
  const observations = memory?.observations?.length ?? 0;
  const beliefs = memory?.beliefs?.length ?? 0;
  const patterns = memory?.patterns?.length ?? 0;

  return (
    <section className="briefing-organism-card">
      <p className="overview-label">Organization memory</p>

      <h2>{metadata?.name || "Organization"}</h2>

      <p>
        {investigations} investigation{investigations === 1 ? "" : "s"} ·{" "}
        {beliefs} belief{beliefs === 1 ? "" : "s"} · {patterns} pattern
        {patterns === 1 ? "" : "s"}
      </p>

      <p className="briefing-muted">
        {observations} remembered signal{observations === 1 ? "" : "s"}
      </p>
    </section>
  );
}