import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "../styles/sprint19.css";
import {
  isYourOrganizationAlphaPresentationEnabled,
} from "../lib/alpha-activation/config";

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
  const content = isYourOrganizationAlphaPresentationEnabled()
    ? <ClerkProvider>{children}</ClerkProvider>
    : children;

  return (
    <html lang="en">
      <body>{content}</body>
    </html>
  );
}
