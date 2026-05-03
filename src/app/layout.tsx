import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { site } from "@/content/site";
import { HeroTopographicBackground } from "@/components/hero-topographic-background";
import { ScrollToTopOnReload } from "@/components/scroll-to-top-on-reload";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `verneytography`,
  description: `${site.hero.tagline}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans selection:bg-foreground/10 selection:text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function () {
            var storageKey = ${JSON.stringify("theme")};
            var root = document.documentElement;
            var persisted = null;
            try { persisted = window.localStorage.getItem(storageKey); } catch (e) {}
            var system = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            var theme = (persisted === "light" || persisted === "dark") ? persisted : system;
            root.setAttribute("data-theme", theme);
            root.style.colorScheme = theme;
            root.classList.add("theme-ready");
          })();
        `}</Script>
        <HeroTopographicBackground />
        <ScrollToTopOnReload />
        {children}
      </body>
    </html>
  );
}
