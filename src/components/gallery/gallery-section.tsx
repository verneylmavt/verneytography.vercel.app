import { Suspense } from "react";

import type { Photo } from "@/lib/types";

import { GallerySectionClient } from "./gallery-section-client";

function GalleryBodyFallback() {
  return (
    <>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-7 w-20 rounded-full border border-[rgb(var(--border)/0.12)] bg-[rgb(var(--surface)/0.40)]"
          />
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/3] rounded-3xl border border-[rgb(var(--border)/0.10)] bg-[rgb(var(--background)/0.35)] backdrop-blur-md"
          />
        ))}
      </div>
    </>
  );
}

export function GallerySection({ photos }: { photos: Photo[] }) {
  return (
    <section id="gallery" className="scroll-mt-28 py-24">
      <div className="flex flex-col items-start justify-between gap-6 border-t border-[rgb(var(--border)/0.10)] pt-10 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl font-[family:var(--font-serif)]">
            Gallery
          </h2>
        </div>
      </div>

      <Suspense fallback={<GalleryBodyFallback />}>
        <GallerySectionClient photos={photos} />
      </Suspense>
    </section>
  );
}
