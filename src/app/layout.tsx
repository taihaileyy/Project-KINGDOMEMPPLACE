import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { IntroCurtain, introScript } from "@/components/intro-curtain";
import "./globals.css";

// Editorial pairing: a high-contrast serif for headings (the public site) and
// a clean sans for navigation, body copy, forms and the dashboards.
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
const body = Manrope({ variable: "--font-body", subsets: ["latin"], display: "swap" });

// The address used to build the link-preview picture's full web address. Set
// NEXT_PUBLIC_SITE_URL when the site moves to its own domain. (It is fixed here,
// not read per request, so the public pages can stay static and fast.)
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://project-kingdomempplace.kingdomempplace.workers.dev").replace(/\/$/, "");

// What shows when the site is shared in a text, WhatsApp, Facebook and so on:
// the KEP logo (src/app/opengraph-image.jpg), not whichever photo is first on the page.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Kingdom Empowerment Place", template: "%s · Kingdom Empowerment Place" },
  description:
    "Kingdom Empowerment Place: church, housing, programs, events and a media studio for our community.",
  openGraph: {
    type: "website",
    siteName: "Kingdom Empowerment Place",
    title: "Kingdom Empowerment Place",
    description: "Engage the community. Equip the people. Empower the nation.",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: "Kingdom Empowerment Place", description: "Engage the community. Equip the people. Empower the nation." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The intro script adds a class to <html> before React hydrates.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <IntroCurtain />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
