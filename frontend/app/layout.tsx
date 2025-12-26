import "../styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

export const metadata: Metadata = {
  title: "Aegontech.dev",
  description: "Modern SaaS and mobile product studio",
  metadataBase: new URL(SITE_URL)
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-mist text-ink">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
