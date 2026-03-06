import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Fuin — Programmable IAM on Solana",
  description: "Fuin implements cryptographic seals for digital assets on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} antialiased text-white bg-black h-full overflow-y-auto overflow-x-hidden`} style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>
        {children}
        <Script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" strategy="lazyOnload" />
        <Analytics />
      </body>
    </html>
  );
}
