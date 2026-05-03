"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
      // Ignore: e.g. Safari private mode can throw on setItem.
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
  const ariaLabel = useMemo(() => {
    if (!theme) return "Toggle theme";
    return isDark ? "Switch to light mode" : "Switch to dark mode";
  }, [isDark, theme]);

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
      className={[
        "liquid-glass inline-flex h-10 w-10 items-center justify-center rounded-full transition",
        "text-foreground/90 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      ].join(" ")}
    >
      <span className="sr-only">{ariaLabel}</span>
      {theme ? (
        isDark ? (
          <Sun aria-hidden className="h-5 w-5" />
        ) : (
          <Moon aria-hidden className="h-5 w-5" />
        )
      ) : (
        <Sun aria-hidden className="h-5 w-5 opacity-0" />
      )}
    </button>
  );
}
