"use client";

import { useEffect, type ReactNode } from "react";

export const PROTECTED_PAGE_REVALIDATION_MESSAGE = "Rechecking access…";

type ProtectedPageRestorationState = {
  persisted: boolean;
  navigationType: string | null;
  veiled: boolean;
};

export function requiresProtectedPageRevalidation(
  state: ProtectedPageRestorationState,
): boolean {
  return state.persisted || state.navigationType === "back_forward" || state.veiled;
}

function navigationType(): string | null {
  const navigation = window.performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return navigation?.type ?? null;
}

function ensurePrivacyVeil(): void {
  if (document.querySelector("[data-discovery-protected-page-veil]")) return;
  const veil = document.createElement("div");
  veil.dataset.discoveryProtectedPageVeil = "true";
  veil.setAttribute("role", "status");
  veil.setAttribute("aria-live", "polite");
  veil.textContent = PROTECTED_PAGE_REVALIDATION_MESSAGE;
  Object.assign(veil.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    display: "grid",
    placeItems: "center",
    background: "#101114",
    color: "#f4f4f5",
    font: "600 1rem/1.5 system-ui, sans-serif",
  });
  document.body.append(veil);
}

export function veilProtectedPage(): void {
  document.documentElement.dataset.discoveryProtectedPageVeiled = "true";
  for (const protectedRoot of document.querySelectorAll<HTMLElement>(
    "[data-discovery-protected-content]",
  )) {
    protectedRoot.inert = true;
    protectedRoot.setAttribute("aria-hidden", "true");
    protectedRoot.replaceChildren();
  }
  ensurePrivacyVeil();
}

function hardRevalidateProtectedPage(): void {
  veilProtectedPage();
  window.location.replace(window.location.href);
}

export default function ProtectedPageLifecycleGuard({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const onPageHide = () => veilProtectedPage();
    const onFreeze = () => veilProtectedPage();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        veilProtectedPage();
      } else if (document.documentElement.dataset.discoveryProtectedPageVeiled === "true") {
        hardRevalidateProtectedPage();
      }
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (requiresProtectedPageRevalidation({
        persisted: event.persisted,
        navigationType: navigationType(),
        veiled: document.documentElement.dataset.discoveryProtectedPageVeiled === "true",
      })) {
        hardRevalidateProtectedPage();
      }
    };

    window.addEventListener("pagehide", onPageHide, { capture: true });
    window.addEventListener("freeze", onFreeze, { capture: true });
    window.addEventListener("pageshow", onPageShow, { capture: true });
    document.addEventListener("visibilitychange", onVisibilityChange, { capture: true });

    if (document.documentElement.dataset.discoveryProtectedPageVeiled === "true") {
      hardRevalidateProtectedPage();
    }

    return () => {
      window.removeEventListener("pagehide", onPageHide, { capture: true });
      window.removeEventListener("freeze", onFreeze, { capture: true });
      window.removeEventListener("pageshow", onPageShow, { capture: true });
      document.removeEventListener("visibilitychange", onVisibilityChange, { capture: true });
    };
  }, []);

  return <div data-discovery-protected-content>{children}</div>;
}
