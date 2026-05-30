import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Vollkorn, Schibsted_Grotesk, Fragment_Mono, Bricolage_Grotesque } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const vollkorn = Vollkorn({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  variable: "--font-mono-v2",
  weight: ["400"],
  display: "swap",
});

// Bricolage Grotesque — quirky editorial-grotesque display, paired with Geist body.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fuin — the proof layer for autonomous capital",
  description:
    "Hierarchical proof-of-intent for AI agent swarms. One signature anchors a tree of cryptographically-derived scopes — every child strictly narrower than its parent. Live on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} ${vollkorn.variable} ${schibsted.variable} ${fragmentMono.variable} ${bricolage.variable} antialiased v1`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
