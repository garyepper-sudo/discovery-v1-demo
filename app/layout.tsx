import type { Metadata } from "next";
import "./globals.css";
import "../styles/sprint19.css";

export const metadata: Metadata = {
  title: "Discovery Alpha",
  description:
    "A living investigation workspace for organizational understanding.",
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