/**
 * Four small viewfinder-style corner brackets that frame a `relative` parent —
 * the same motif used inline in the hero tagline box. Purely decorative
 * (aria-hidden, pointer-events:none). Brackets are `border-red` by default;
 * pass `className` to override colour or add group-hover variants
 * (e.g. "group-hover:border-paper").
 */
export function CornerBrackets({ className = "" }: { className?: string }) {
  const base = `pointer-events-none absolute h-3 w-3 border-red ${className}`;
  return (
    <>
      <span aria-hidden className={`${base} -left-px -top-px border-l-2 border-t-2`} />
      <span aria-hidden className={`${base} -right-px -top-px border-r-2 border-t-2`} />
      <span aria-hidden className={`${base} -bottom-px -left-px border-b-2 border-l-2`} />
      <span aria-hidden className={`${base} -bottom-px -right-px border-b-2 border-r-2`} />
    </>
  );
}
