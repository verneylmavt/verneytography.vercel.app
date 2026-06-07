"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen camera-shutter wipe that fires whenever the theme changes. Two
 * blades close over the viewport then part again, covering the colour swap. A
 * MutationObserver on the <html> `data-theme` attribute drives it; the initial
 * load-time theme is set before this mounts, so only real toggles fire it.
 * Decorative: aria-hidden, pointer-events:none. No-op under reduced motion.
 */
export function ShutterTransition() {
  const [fireKey, setFireKey] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new MutationObserver(() => {
      setFireKey((key) => key + 1);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  if (fireKey === 0) return null;

  // Remount via key on each theme change so the CSS animation replays.
  return (
    <div key={fireKey} className="theme-shutter" aria-hidden>
      <span className="ts-blade-top" />
      <span className="ts-blade-bottom" />
    </div>
  );
}
