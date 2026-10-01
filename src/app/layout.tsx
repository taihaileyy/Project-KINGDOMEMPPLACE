import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import { IntroCurtain, introScript } from "@/components/intro-curtain";
import "./globals.css";

// Placeholder pairing until KEP's brand fonts are confirmed from the intake.
const display = Archivo({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Public_Sans({ variable: "--font-body", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Kingdom Empowerment Place", template: "%s · Kingdom Empowerment Place" },
  description:
    "Kingdom Empowerment Place: church, housing, programs, events and a media studio for our community.",
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
