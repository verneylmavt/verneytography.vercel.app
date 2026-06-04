import type { CSSProperties } from "react";

type MarqueeProps = {
  items: readonly string[];
  /** seconds per loop */
  duration?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Pure-CSS infinite ticker. Decorative (aria-hidden), hover-pauses,
 * and freezes under prefers-reduced-motion (see globals.css).
 */
export function Marquee({
  items,
  duration = 32,
  reverse = false,
  className = "",
}: MarqueeProps) {
  const Track = (
    <span className="inline-flex items-center">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="px-6 text-sm uppercase tracking-[0.14em]">
            {item}
          </span>
          <span aria-hidden className="u-slash text-base">
            /
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      aria-hidden
      className={`u-marquee u-rule-t u-rule-b py-3 ${className}`}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div
        className="u-marquee-track"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {Track}
        {Track}
      </div>
    </div>
  );
}
