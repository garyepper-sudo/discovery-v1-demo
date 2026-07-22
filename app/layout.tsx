import type { Metadata } from "next";
import "./globals.css";
import "../styles/sprint19.css";

export const metadata: Metadata = {
  title: {
    default: "Discovery",
    template: "%s · Discovery",
  },
  description:
    "A continuously evolving model of your organization.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
