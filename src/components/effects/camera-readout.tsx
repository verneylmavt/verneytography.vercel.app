/**
 * Decorative camera "instrument cluster" for the hero's right column — a tonal
 * histogram and an exposure (EV) meter rendered in the site's monospace / red
 * accent language. Purely cosmetic (aria-hidden); static, token-driven so it
 * inverts with the theme. Server component (no client JS).
 */

// A believable tonal distribution (rising → peak → falling), 0–100.
const HISTOGRAM = [
  8, 11, 10, 15, 21, 27, 34, 42, 50, 58, 66, 73, 80, 86, 91, 95, 93, 88, 82, 75,
  68, 60, 53, 46, 39, 33, 28, 23, 18, 14, 11, 8,
];

const EV_TICKS = [-3, -2, -1, 0, 1, 2, 3];

export function CameraReadout({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      {/* Histogram */}
      <div className="border border-rule p-4">
        <div className="u-label mb-3 flex items-center justify-between">
          <span>Histogram</span>
          <span className="u-tabular text-mute">RGB · 256</span>
        </div>
        <div className="flex h-16 items-end gap-px">
          {HISTOGRAM.map((h, i) => (
            <span
              key={i}
              className="flex-1 bg-[rgb(var(--ink)/0.28)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="u-label mt-2 flex justify-between text-mute">
          <span className="u-tabular">0</span>
          <span className="u-tabular">128</span>
          <span className="u-tabular">255</span>
        </div>
      </div>

      {/* Exposure meter */}
      <div className="mt-5 border border-rule p-4">
        <div className="u-label mb-4 flex items-center justify-between">
          <span>Exposure</span>
          <span className="u-tabular text-red">0.0 EV</span>
        </div>
        <div className="relative h-4">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
          {EV_TICKS.map((t) => (
            <span
              key={t}
              className={`absolute top-1/2 w-px -translate-x-1/2 -translate-y-1/2 ${
                t === 0 ? "h-3 bg-mute" : "h-2 bg-[rgb(var(--mute)/0.6)]"
              }`}
              style={{ left: `${((t + 3) / 6) * 100}%` }}
            />
          ))}
          {/* Centre marker */}
          <span
            className="absolute top-1/2 -translate-x-1/2 -translate-y-[calc(50%+0.55rem)]"
            style={{ left: "50%" }}
          >
            <span className="block h-0 w-0 border-x-4 border-t-[6px] border-x-transparent border-t-red" />
          </span>
        </div>
        <div className="u-label mt-2 flex justify-between text-mute">
          <span className="u-tabular">−3</span>
          <span className="u-tabular">0</span>
          <span className="u-tabular">+3</span>
        </div>
      </div>
    </div>
  );
}
