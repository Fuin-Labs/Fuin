import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistPixelSquare } from "geist/font/pixel";
import Script from "next/script";
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
}>) {
  return (
    <html lang="en">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} antialiased text-white bg-black h-full overflow-y-auto overflow-x-hidden`} style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>
        {children}
        <Script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" strategy="lazyOnload" />
        <Script
          id="unicorn-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: `!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();` }}
        />
      </body>
    </html>
  );
}
