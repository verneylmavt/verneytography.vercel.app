import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { site } from "@/content/site";
import { ScrollToTopOnReload } from "@/components/scroll-to-top-on-reload";
import { GoldenGridBackground } from "@/components/effects/golden-grid-background";
import { ShutterTransition } from "@/components/effects/shutter-transition";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  title: "verneytography",
  description: `${site.hero.name} — ${site.hero.tagline}, ${site.hero.location}.`,
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
      className={jetbrainsMono.variable}
    >
      <body className="min-h-screen bg-paper text-ink font-mono">
        <Script id="theme-init" strategy="beforeInteractive">{`
          // (function () {
          //   var storageKey = ${JSON.stringify("theme")};
          //   var root = document.documentElement;
          //   var persisted = null;
          //   try { persisted = window.localStorage.getItem(storageKey); } catch (e) {}
          //   var system = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          //   var theme = (persisted === "light" || persisted === "dark") ? persisted : system;
          //   root.setAttribute("data-theme", theme);
          //   root.style.colorScheme = theme;
          //   root.classList.add("theme-ready");
          // })();

          (function () {
            var root = document.documentElement;
            root.setAttribute("data-theme", "light");
            root.style.colorScheme = "light";
            root.classList.add("theme-ready");
          })();
        `}</Script>
        <ScrollToTopOnReload />
        <GoldenGridBackground className="u-gridbg" />
        <ShutterTransition />
        {children}
      </body>
    </html>
  );
}
