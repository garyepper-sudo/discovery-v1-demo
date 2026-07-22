import type { ReactNode } from "react";
import { InteractionSessionProvider } from "../../components/product-shell/shared/InteractionSession";

export default function ProductLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <InteractionSessionProvider>{children}</InteractionSessionProvider>;
}
