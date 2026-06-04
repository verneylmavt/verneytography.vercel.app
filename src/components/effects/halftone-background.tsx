"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight generative halftone / dot-matrix background (Canvas 2D).
 * - ink dots on transparent, reads theme tokens (--ink)
 * - slow wave animation; paused off-screen (IntersectionObserver) and when tab hidden
 * - single static frame under prefers-reduced-motion
 * Decorative only: aria-hidden, pointer-events:none, sits behind content.
 */
export function HalftoneBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const context = node.getContext("2d");
    if (!context) return;
    const canvas = node;
    const ctx = context;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const CELL = 26;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let running = false;
    let visible = false;
    let t = 0;

    let inkRGB = "15,15,15";

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      const ink = cs.getPropertyValue("--ink").trim();
      if (ink) inkRGB = ink.replace(/\s+/g, ",");
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1 : 1.5);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL) + 1;
      rows = Math.ceil(height / CELL) + 1;
      if (reduce) drawStatic();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(${inkRGB},0.18)`;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.beginPath();
          ctx.arc(x * CELL, y * CELL, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function frame() {
      if (!running) return;
      t += 0.012;
      ctx.clearRect(0, 0, width, height);
      const inkFill = `rgba(${inkRGB},0.16)`;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * CELL;
          const py = y * CELL;
          const wave =
            Math.sin(x * 0.35 + t) * Math.cos(y * 0.32 - t) * 0.5 + 0.5;
          const r = 0.6 + wave * 1.7;

          if (r < 0.3) continue;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = inkFill;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (visible) start();
    }

    readColors();
    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting;
          if (visible && !document.hidden) start();
          else stop();
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const mo = new MutationObserver(() => readColors());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) drawStatic();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
