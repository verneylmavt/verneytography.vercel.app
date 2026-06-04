"use client";

export type GalleryView = "grid" | "index";

const OPTIONS: { value: GalleryView; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "index", label: "Index" },
];

export function GalleryViewToggle({
  view,
  onChange,
}: {
  view: GalleryView;
  onChange: (view: GalleryView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Gallery view"
      className="inline-flex border border-rule"
    >
      {OPTIONS.map((option, i) => {
        const active = view === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              "u-label px-3 py-2 transition-colors",
              i > 0 ? "border-l border-rule" : "",
              active ? "bg-ink text-paper" : "text-ink hover:text-red",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
