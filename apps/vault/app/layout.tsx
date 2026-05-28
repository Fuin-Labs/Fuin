import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Vollkorn, Schibsted_Grotesk, Fragment_Mono, Archivo } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import Script from "next/script";
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

// Archivo — Swiss-grotesk display for the obsidian-monochrome landing
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
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
        className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} ${vollkorn.variable} ${schibsted.variable} ${fragmentMono.variable} ${archivo.variable} antialiased v1`}
      >
        {children}
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="lazyOnload"
        />
        <Script
          id="unicorn-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: `!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();` }}
        />
        <Analytics />
      </body>
    </html>
  );
}
