import type { CSSProperties } from "react";

type FilmStripProps = {
  items: readonly string[];
  /** seconds per loop */
  duration?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Film-strip ticker: a scrolling band framed by two rows of sprocket
 * perforations. Reuses the pure-CSS marquee engine (hover-pauses, freezes under
 * prefers-reduced-motion — see globals.css). Decorative (aria-hidden).
 */
export function FilmStrip({
  items,
  duration = 32,
  reverse = false,
  className = "",
}: FilmStripProps) {
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
      className={`u-filmstrip u-rule-t u-rule-b ${className}`}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className="u-sprockets" />
      <div className="u-marquee py-2.5">
        <div
          className="u-marquee-track"
          style={reverse ? { animationDirection: "reverse" } : undefined}
        >
          {Track}
          {Track}
        </div>
      </div>
      <div className="u-sprockets" />
    </div>
  );
}
