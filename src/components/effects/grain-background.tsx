"use client";

import { useEffect, useRef } from "react";

/**
 * Global film-grain overlay (Canvas 2D). A fixed, full-viewport layer of
 * monochrome luminance noise that "boils" at a low frame rate for an analog /
 * darkroom feel. Decorative only: aria-hidden, pointer-events:none, behind
 * content (-z-10), opacity set in CSS (.u-grain).
 *
 * - One precomputed 128px noise tile → drawn each frame via createPattern with a
 *   random integer offset (the shimmer). Tile is theme-aware (dark grains on
 *   light, light grains on dark) and regenerated when [data-theme] changes.
 * - Throttled to ~15fps, DPR fixed at 1 (noise has no detail to preserve).
 * - Paused when the tab is hidden. Under prefers-reduced-motion: a single static
 *   frame, no loop.
 */
export function GrainBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const context = node.getContext("2d");
    if (!context) return;
    const canvas = node;
    const ctx = context;

    const TILE = 128;
    const FRAME_MS = 66; // ~15fps
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    let pattern: CanvasPattern | null = null;

    // Offscreen noise tile.
    const tile = document.createElement("canvas");
    tile.width = TILE;
    tile.height = TILE;
    const tileCtx = tile.getContext("2d");

    function isDark(): boolean {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }

    function buildTile() {
      if (!tileCtx) return;
      const dark = isDark();
      const image = tileCtx.createImageData(TILE, TILE);
      const data = image.data;
      // Light theme: dark grains (low rgb). Dark theme: light grains (high rgb).
      const base = dark ? 235 : 20;
      for (let i = 0; i < data.length; i += 4) {
        const v = base + (Math.random() * 40 - 20);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        // Per-grain alpha jitter; final layer opacity comes from CSS.
        data[i + 3] = Math.random() * 255;
      }
      tileCtx.putImageData(image, 0, 0);
      pattern = ctx.createPattern(tile, "repeat");
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (!running) drawFrame(); // keep a frame painted while paused
    }

    function drawFrame() {
      if (!pattern) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const ox = -Math.floor(Math.random() * TILE);
      const oy = -Math.floor(Math.random() * TILE);
      ctx.translate(ox, oy);
      ctx.fillStyle = pattern;
      ctx.fillRect(-ox, -oy, width, height);
    }

    function loop(now: number) {
      if (!running) return;
      if (now - last >= FRAME_MS) {
        last = now;
        drawFrame();
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || motionQuery.matches) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onMotionChange() {
      stop();
      buildTile();
      if (motionQuery.matches) drawFrame();
      else start();
    }

    buildTile();
    resize();

    if (motionQuery.matches) {
      drawFrame(); // single static frame, no loop
    } else {
      start();
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    const mo = new MutationObserver(() => {
      buildTile();
      drawFrame();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      mo.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
