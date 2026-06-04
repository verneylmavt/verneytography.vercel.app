"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function readThemeFromRoot(): Theme | null {
  if (typeof document === "undefined") return null;
  const value = document.documentElement.getAttribute("data-theme");
  return isTheme(value) ? value : null;
}

function readSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme, persist: boolean) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  root.classList.add("theme-ready");

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore: Safari private mode can throw on setItem.
    }
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setTheme(readThemeFromRoot());
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const isDark = theme === "dark";
  const ariaLabel = !theme
    ? "Toggle theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isDark}
      onClick={() => {
        const current = readThemeFromRoot() ?? readSystemTheme();
        const next: Theme = current === "dark" ? "light" : "dark";
        applyTheme(next, true);
        setTheme(next);
      }}
      className="u-label inline-flex items-center gap-2 border border-rule px-3 py-2 text-ink transition-colors hover:border-ink"
    >
      <span
        aria-hidden
        className={[
          "inline-block h-2 w-2 rounded-full border border-ink transition-colors",
          theme ? (isDark ? "bg-transparent" : "bg-ink") : "bg-transparent",
        ].join(" ")}
      />
      <span aria-hidden className="min-w-[2.5em] text-left">
        {theme ? (isDark ? "Dark" : "Light") : "···"}
      </span>
    </button>
  );
}
