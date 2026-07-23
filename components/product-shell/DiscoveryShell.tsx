"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Building2,
  FileText,
  MessageCircleQuestion,
  Scale,
  TestTubeDiagonal,
} from "lucide-react";

import styles from "./DiscoveryShell.module.css";
import SessionImpact from "./shared/SessionImpact";
import {
  buildProductHref,
  type ProductOrganizationSummary,
} from "./data/productOrganization";

type DiscoveryShellProps = {
  children: ReactNode;
  organization: ProductOrganizationSummary;
  showSessionImpact?: boolean;
};

const navigation = [
  {
    href: "/your-organization",
    label: "Insights",
    description: "See what matters",
    icon: Building2,
  },
  {
    href: "/ask",
    label: "Think",
    description: "Ask & brainstorm",
    icon: MessageCircleQuestion,
  },
  {
    href: "/decisions",
    label: "Decide",
    description: "Track decisions",
    icon: Scale,
  },
  {
    href: "/experiment",
    label: "Experiment",
    description: "Stress test ideas",
    icon: TestTubeDiagonal,
  },
  {
    href: "/brief",
    label: "Brief",
    description: "Communicate impact",
    icon: FileText,
  },
] as const;

export default function DiscoveryShell({
  children,
  organization,
  showSessionImpact = true,
}: DiscoveryShellProps) {
  const pathname = usePathname();
  const homeHref = buildProductHref(
    "/your-organization",
    organization.organizationId,
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link
          href={homeHref}
          className={styles.brand}
          aria-label="Discovery home"
        >
          <span
            className={styles.brandMark}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>

          <span className={styles.brandCopy}>
            <strong>Discovery</strong>
            <span>Organization intelligence</span>
          </span>
        </Link>

        <nav
          className={styles.navigation}
          aria-label="Primary navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={buildProductHref(
                  item.href,
                  organization.organizationId,
                )}
                className={
                  isActive
                    ? `${styles.navigationItem} ${styles.active}`
                    : styles.navigationItem
                }
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={styles.navigationIcon}
                  size={18}
                  strokeWidth={1.55}
                  aria-hidden="true"
                />

                <span className={styles.navigationCopy}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <section className={styles.modelHealth} aria-label="Model health">
          <strong>Model Health</strong><i aria-hidden="true" />
          <span>Understanding <b>{organization.coherence ?? "—"}{organization.coherence == null ? "" : "%"}</b></span>
          <span>Confidence <b>{organization.confidence ?? "—"}{organization.confidence == null ? "" : "%"}</b></span>
          <span>Primary Constraint <b>{organization.primaryConstraint ?? "Still emerging"}</b></span>
        </section>

        <Link className={styles.stewardship} href={buildProductHref("/your-organization", organization.organizationId) + "#teach-discovery"}>
          Teach Discovery
          <span>Add context · Correct the model · Add evidence</span>
        </Link>

        <div className={styles.sidebarFooter}>
          <span className={styles.statusMark} aria-hidden="true" />
          <span>
            {organization.runtimeAvailable
              ? `${organization.organizationName} · ${organization.coherenceLabel}${organization.coherence === null || organization.coherence === undefined ? "" : ` ${organization.coherence}%`}`
              : "Organization not selected"}
          </span>
        </div>
      </aside>

      <main className={styles.workspace}>
        <div className={styles.workspaceInner}>
          {children}
          {showSessionImpact && <SessionImpact />}
        </div>
      </main>
    </div>
  );
}
