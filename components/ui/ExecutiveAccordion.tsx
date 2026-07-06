"use client";

import { ReactNode, useState } from "react";

type ExecutiveAccordionProps = {
  title: string;
  subtitle?: string;
  badge?: string | number;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function ExecutiveAccordion({
  title,
  subtitle,
  badge,
  icon,
  defaultOpen = false,
  children,
}: ExecutiveAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`executive-accordion ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="executive-accordion-header"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <div className="executive-accordion-title-group">
          {icon && <span className="executive-accordion-icon">{icon}</span>}

          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>

        <div className="executive-accordion-meta">
          {badge !== undefined && badge !== null && (
            <span className="executive-accordion-badge">{badge}</span>
          )}
          <span className="executive-accordion-chevron">⌄</span>
        </div>
      </button>

      {open && <div className="executive-accordion-body">{children}</div>}
    </section>
  );
}