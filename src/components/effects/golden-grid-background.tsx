"use client";

import { useEffect, useRef } from "react";

/**
 * Global golden-ratio diagram overlay (Canvas 2D). A fixed, full-viewport layer
 * that draws the classic golden-ratio template — the nested Fibonacci square
 * subdivision, an inscribed circle per square, the two main diagonals, and the
 * bold golden spiral — fit and centred within the viewport like a faint
 * watermark. Decorative only: aria-hidden, pointer-events:none, behind content
 * (-z-10), opacity set in CSS (.u-gridbg).
 *
 * - Geometry is computed once per resize in a unit space, then *fit* (contain)
 *   to the viewport with a margin so the whole diagram reads.
 * - On mount the construction "draws in" over ~1.6s; afterwards it sways almost
 *   imperceptibly (±~2°) and breathes — never enough to clip the fit diagram.
 *   Throttled to ~30fps, DPR capped at 2.
 * - Squares/circles/diagonals stroke in `--rule`, the spiral in `--red`; colours
 *   re-read on [data-theme] change. Paused when the tab is hidden. Under
 *   prefers-reduced-motion: a single fully-drawn static frame, no loop.
 */

// 10 squares → bounding box 89×55 (landscape golden rectangle, φ ≈ 1.618).
// An 11th square would flip it to 89×144 (portrait), so stop at 10.
const FIBS = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const FRAME_MS = 33; // ~30fps
const DRAW_MS = 1600;
const ARC_SAMPLES = 24;
const FIT_MARGIN = 0.86;

type Square = { x: number; y: number; s: number };
type Arc = { cx: number; cy: number; a0: number; a1: number; r: number };

function buildGeometry() {
  // Place Fibonacci squares spiralling counter-clockwise (unit space, y-up).
  const squares: Square[] = [];
  const dirs = ["right", "top", "left", "bottom"] as const;

  let x0 = 0;
  let y0 = 0;
  let x1 = FIBS[0];
  let y1 = FIBS[0];
  squares.push({ x: 0, y: 0, s: FIBS[0] });

  for (let i = 1; i < FIBS.length; i++) {
    const s = FIBS[i];
    const d = dirs[(i - 1) % 4];
    if (d === "right") {
      squares.push({ x: x1, y: y0, s });
      x1 += s;
    } else if (d === "top") {
      squares.push({ x: x0, y: y1, s });
      y1 += s;
    } else if (d === "left") {
      squares.push({ x: x0 - s, y: y0, s });
      x0 -= s;
    } else {
      squares.push({ x: x0, y: y0 - s, s });
      y0 -= s;
    }
  }

  // Quarter-circle arc per square (pivot corner cycles BL, TL, TR, BR).
  const arcs: Arc[] = squares.map((sq, i) => {
    const corner = i % 4; // 0 BL, 1 TL, 2 TR, 3 BR
    let cx = sq.x;
    let cy = sq.y;
    let hx = 1;
    let vy = 1;
    if (corner === 1) {
      cy = sq.y + sq.s;
      vy = -1;
    } else if (corner === 2) {
      cx = sq.x + sq.s;
      cy = sq.y + sq.s;
      hx = -1;
      vy = -1;
    } else if (corner === 3) {
      cx = sq.x + sq.s;
      hx = -1;
    }
    const a0 = vy > 0 ? Math.PI / 2 : -Math.PI / 2; // vertical neighbour
    const a1 = hx > 0 ? 0 : Math.PI; // horizontal neighbour
    return { cx, cy, a0, a1, r: sq.s };
  });

  const minX = Math.min(...squares.map((s) => s.x));
  const minY = Math.min(...squares.map((s) => s.y));
  const maxX = Math.max(...squares.map((s) => s.x + s.s));
  const maxY = Math.max(...squares.map((s) => s.y + s.s));

  return {
    squares,
    arcs,
    bbox: { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY },
  };
}

function shortDelta(a0: number, a1: number): number {
  let d = a1 - a0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function GoldenGridBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const context = node.getContext("2d");
    if (!context) return;
    const canvas = node;
    const ctx = context;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const { squares, arcs, bbox } = buildGeometry();
    const bboxCx = (bbox.minX + bbox.maxX) / 2;
    const bboxCy = (bbox.minY + bbox.maxY) / 2;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let scale = 1;
    let raf = 0;
    let running = false;
    let last = 0;
    let progress = 0;
    let elapsed = 0; // ms since draw-in completed (drives the idle sway)
    let ruleColor = "200 200 200";
    let redColor = "212 0 0";

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      ruleColor = (cs.getPropertyValue("--rule").trim() || ruleColor)
        .split(/\s+/)
        .join(",");
      redColor = (cs.getPropertyValue("--red").trim() || redColor)
        .split(/\s+/)
        .join(",");
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      // Fit (contain) the whole diagram within the viewport with a margin.
      scale = Math.min(
        (width * FIT_MARGIN) / bbox.w,
        (height * FIT_MARGIN) / bbox.h,
      );
      if (!running) drawFrame();
    }

    function strokeArcPath(
      arc: Arc,
      seg: number,
      moveStart: boolean,
    ): void {
      const d = shortDelta(arc.a0, arc.a1) * seg;
      const steps = Math.max(2, Math.round(ARC_SAMPLES * seg));
      for (let k = 0; k <= steps; k++) {
        const ang = arc.a0 + d * (k / steps);
        const px = arc.cx + arc.r * Math.cos(ang);
        const py = arc.cy + arc.r * Math.sin(ang);
        if (moveStart && k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    }

    function drawFrame() {
      const theta = (Math.PI / 90) * Math.sin(elapsed * 0.00016); // ±2°
      const breath = 1 + 0.012 * Math.sin(elapsed * 0.0004);
      const S = scale * breath;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(theta);
      ctx.scale(S, -S); // flip y so the unit space is y-up
      ctx.translate(-bboxCx, -bboxCy);
      ctx.lineJoin = "round";

      // Construction layers fade in over the first 65% of the draw-in.
      const constructAlpha = Math.min(1, progress / 0.65) * 0.8;
      if (constructAlpha > 0.001) {
        ctx.lineWidth = 1 / S;
        ctx.strokeStyle = `rgba(${ruleColor},${constructAlpha})`;

        // Subdivision squares
        for (const sq of squares) ctx.strokeRect(sq.x, sq.y, sq.s, sq.s);

        // Inscribed circle per square
        ctx.beginPath();
        for (const sq of squares) {
          const r = sq.s / 2;
          ctx.moveTo(sq.x + sq.s, sq.y + r);
          ctx.arc(sq.x + r, sq.y + r, r, 0, Math.PI * 2);
        }
        ctx.stroke();

        // Two main diagonals of the full golden rectangle
        ctx.beginPath();
        ctx.moveTo(bbox.minX, bbox.minY);
        ctx.lineTo(bbox.maxX, bbox.maxY);
        ctx.moveTo(bbox.minX, bbox.maxY);
        ctx.lineTo(bbox.maxX, bbox.minY);
        ctx.stroke();
      }

      // Bold golden spiral (red) draws sequentially across all arcs.
      const total = arcs.length;
      const drawn = progress * total;
      ctx.lineWidth = 2.4 / S;
      ctx.strokeStyle = `rgba(${redColor},0.92)`;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < total; i++) {
        const seg = Math.min(1, Math.max(0, drawn - i));
        if (seg <= 0) break;
        strokeArcPath(arcs[i], seg, !started);
        started = true;
      }
      ctx.stroke();

      ctx.restore();
    }

    function loop(now: number) {
      if (!running) return;
      if (!last) last = now;
      const dt = now - last;
      if (dt >= FRAME_MS) {
        last = now;
        if (progress < 1) progress = Math.min(1, progress + dt / DRAW_MS);
        else elapsed += dt;
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
      if (motionQuery.matches) {
        progress = 1;
        elapsed = 0;
        drawFrame();
      } else {
        start();
      }
    }

    readColors();
    resize();

    if (motionQuery.matches) {
      progress = 1;
      drawFrame(); // single static frame, no loop
    } else {
      start();
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    const mo = new MutationObserver(() => {
      readColors();
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
