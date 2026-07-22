import { redirect } from "next/navigation";

import { buildProductHref } from "../components/product-shell/data/productOrganization";

export default function Home({
  searchParams,
}: {
  searchParams: { organizationId?: string | string[] };
}) {
  const organizationId =
    typeof searchParams.organizationId === "string"
      ? searchParams.organizationId.trim()
      : undefined;

  redirect(buildProductHref("/your-organization", organizationId || undefined));
}
