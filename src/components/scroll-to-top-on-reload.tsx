"use client";

import { useEffect } from "react";

function wasReloadNavigation(): boolean {
  try {
    const entries = performance.getEntriesByType?.(
      "navigation",
    ) as PerformanceNavigationTiming[];
    const navType = entries?.[0]?.type;
    if (navType) return navType === "reload";
  } catch {
    // ignore
  }

  // Legacy fallback (deprecated in modern browsers).
  const legacyType = (performance as unknown as { navigation?: { type?: number } })
    .navigation?.type;
  return legacyType === 1;
}

export function ScrollToTopOnReload() {
  useEffect(() => {
    if (!wasReloadNavigation()) return;

    if (window.location.hash) {
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState(null, "", url.pathname + url.search);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 0);
  }, []);

  return null;
}
