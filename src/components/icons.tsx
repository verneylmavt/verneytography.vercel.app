/**
 * Small inline SVG icons (16px default), coloured via `currentColor`. Inlined
 * rather than pulled from a dependency to keep full control and match the
 * project's existing hand-rolled icon approach (see ApertureIcon).
 */

type IconProps = { size?: number; className?: string };

function base(size: number, className: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    className,
  };
}

export function GlobeIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      {...base(size, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5a14 14 0 0 1 0 19 14 14 0 0 1 0-19" />
    </svg>
  );
}

export function MailIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      {...base(size, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3 6 9 6 9-6" />
    </svg>
  );
}

export function LinkedInIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg {...base(size, className)} fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.06c.53-1 1.82-2.06 3.75-2.06 4.01 0 4.75 2.64 4.75 6.07V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.41-2.08 2.86V21h-4z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      {...base(size, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
