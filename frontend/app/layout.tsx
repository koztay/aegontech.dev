import "../styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebsiteSchema, buildLocalBusinessSchema } from "@/lib/seo/meta";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";

// Display — characterful humanist grotesque with real personality
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
});

// Body — warm, slightly editorial sans
const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Utility — instrument metadata, indices, coordinates
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-mono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

// GTM only loads when the container ID is present — set it in production (and
// preview if wanted) so local dev traffic stays out of analytics.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

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
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} dark`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/* No-flash theme init: applies stored/system theme before first paint. Dark is the studio default. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':true;var c=document.documentElement.classList;if(d){c.add('dark')}else{c.remove('dark')}}catch(e){}})();`,
          }}
        />
        <JsonLd schema={websiteSchema} />
        <JsonLd schema={localBusinessSchema} />
      </head>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body className={`${sans.className} min-h-screen antialiased`}>
        {/* GTM noscript fallback — captures the rare JS-disabled visitor. The
            @next/third-parties component only injects the <head> script. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
