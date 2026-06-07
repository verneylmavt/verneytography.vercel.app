/**
 * Camera-viewfinder HUD for the hero: four corner crop brackets, faint
 * rule-of-thirds guides, a centre reticle, and a small REC tag. Purely
 * decorative — aria-hidden, pointer-events:none — and absolutely positioned to
 * fill its (relative) parent. Static; the only motion is an optional reticle
 * pulse that CSS disables under prefers-reduced-motion.
 */
export function ViewfinderOverlay({ className = "" }: { className?: string }) {
  const corner =
    "absolute h-6 w-6 border-[rgb(var(--mute)/0.55)] sm:h-8 sm:w-8";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-3 sm:inset-5 -z-10 ${className}`}
    >
      {/* Corner crop brackets */}
      <span className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />

      {/* Rule-of-thirds guides — hidden on mobile */}
      <span className="absolute inset-y-0 left-5/12 hidden w-px bg-[rgb(var(--rule)/0.45)] sm:block" />
      <span className="absolute inset-y-0 left-7/12 hidden w-px bg-[rgb(var(--rule)/0.45)] sm:block" />
      <span className="absolute inset-x-0 top-5/12 hidden h-px bg-[rgb(var(--rule)/0.45)] sm:block" />
      <span className="absolute inset-x-0 top-7/12 hidden h-px bg-[rgb(var(--rule)/0.45)] sm:block" />

      {/* Centre reticle — hidden on mobile */}
      <span className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
        <span className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-[rgb(var(--mute)/0.6)]" />
        <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-[rgb(var(--mute)/0.6)]" />
        <span className="u-reticle absolute left-1/2 top-1/2 block h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(var(--mute)/0.4)]" />
      </span>

      {/* REC tag (tucked inside the top-left bracket) */}
      <span className="u-label absolute left-4.5 top-4 flex items-center gap-1.5 text-mute">
        <span className="u-rec-dot h-2 w-2 rounded-full bg-red" />
        REC
      </span>
    </div>
  );
}
