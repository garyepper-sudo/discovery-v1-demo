"use client";

import { ReactNode, useState } from "react";

type DisclosureRowProps = {
  title: string;
  count?: number;
  subtitle?: string;
  defaultOpen?: boolean;
  children?: ReactNode;
};

export default function DisclosureRow({
  title,
  count,
  subtitle,
  defaultOpen = false,
  children,
}: DisclosureRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`disclosure-row ${open ? "open" : ""}`}>
      <button
        className="disclosure-header"
        onClick={() => setOpen(!open)}
      >
        <div className="disclosure-left">
          <span className="disclosure-arrow">
            {open ? "▼" : "▶"}
          </span>

          <div>
            <div className="disclosure-title">
              {title}
            </div>

            {subtitle && (
              <div className="disclosure-subtitle">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {count !== undefined && (
          <div className="disclosure-count">
            {count}
          </div>
        )}
      </button>

      {open && (
        <div className="disclosure-body">
          {children}
        </div>
      )}

      <style jsx>{`

        .disclosure-row{

          border-top:
            1px solid rgba(255,255,255,.07);

          padding-top:18px;
          margin-top:18px;
        }

        .disclosure-header{

          width:100%;

          display:flex;

          justify-content:space-between;

          align-items:center;

          gap:20px;

          background:none;

          border:none;

          cursor:pointer;

          color:white;

          padding:0;

          text-align:left;
        }

        .disclosure-left{

          display:flex;

          gap:14px;

          align-items:flex-start;
        }

        .disclosure-arrow{

          color:#d6b870;

          font-size:12px;

          margin-top:2px;

          width:14px;

          transition:.2s;
        }

        .open .disclosure-arrow{

          transform:rotate(0deg);
        }

        .disclosure-title{

          font-size:15px;

          font-weight:500;

          color:white;
        }

        .disclosure-subtitle{

          margin-top:4px;

          font-size:13px;

          color:
            rgba(255,255,255,.48);
        }

        .disclosure-count{

          min-width:34px;

          height:34px;

          border-radius:999px;

          display:flex;

          align-items:center;

          justify-content:center;

          font-size:13px;

          color:#d6b870;

          background:
            rgba(214,184,112,.08);

          border:
            1px solid rgba(214,184,112,.22);
        }

        .disclosure-body{

          margin-left:30px;

          margin-top:18px;

          display:flex;

          flex-direction:column;

          gap:14px;

          animation:fadeIn .18s ease;
        }

        @keyframes fadeIn{

          from{

            opacity:0;

            transform:
              translateY(-4px);

          }

          to{

            opacity:1;

            transform:none;

          }

        }

      `}</style>
    </section>
  );
}