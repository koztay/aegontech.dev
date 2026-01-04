import "../styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebsiteSchema, buildLocalBusinessSchema } from "@/lib/seo/meta";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

export const metadata: Metadata = {
  title: "Aegontech.dev",
  description: "Modern SaaS and mobile product studio",
  metadataBase: new URL(SITE_URL)
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const websiteSchema = buildWebsiteSchema({
    name: "Aegontech.dev",
    description: "Modern SaaS and mobile product studio",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/aegontech-logo.png`
  });

  const localBusinessSchema = buildLocalBusinessSchema({
    name: "Aegontech.dev",
    description: "Modern SaaS and mobile product studio",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/aegontech-logo.png`,
    type: "SoftwareCompany"
  });

  return (
    <html lang="en" className={`${inter.variable} bg-mist text-ink`}>
      <head>
        <JsonLd schema={websiteSchema} />
        <JsonLd schema={localBusinessSchema} />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
