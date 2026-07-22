"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Building2,
  FlaskConical,
  MessageCircleQuestion,
  Scale,
} from "lucide-react";

import styles from "./DiscoveryShell.module.css";
import {
  buildProductHref,
  type ProductOrganizationSummary,
} from "./data/productOrganization";

type DiscoveryShellProps = {
  children: ReactNode;
  organization: ProductOrganizationSummary;
};

const navigation = [
  {
    href: "/your-organization",
    label: "Your Organization",
    description: "Observe and improve",
    icon: Building2,
  },
  {
    href: "/decisions",
    label: "Decisions",
    description: "Act with the model",
    icon: Scale,
  },
  {
    href: "/research",
    label: "Research",
    description: "Explore and test",
    icon: FlaskConical,
  },
  {
    href: "/ask",
    label: "Ask",
    description: "Query and challenge",
    icon: MessageCircleQuestion,
  },
] as const;

export default function DiscoveryShell({
  children,
  organization,
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
        </div>
      </main>
    </div>
  );
}
