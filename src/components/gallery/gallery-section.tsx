import { Suspense } from "react";

import type { Photo } from "@/lib/types";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { HeadingReveal } from "@/components/primitives/heading-reveal";

import { pad2 } from "./format";
import { GallerySectionClient } from "./gallery-section-client";

function GalleryFallback() {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-2 border-t border-rule pt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-20 border border-rule" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] border border-rule bg-[rgb(var(--ink)/0.03)]"
          />
        ))}
      </div>
    </div>
  );
}

export function GallerySection({ photos }: { photos: Photo[] }) {
  return (
    <section id="work" className="u-rule-t scroll-mt-24">
      <div className="u-shell py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <HashtagLabel index="03" label="Works" />
            <HeadingReveal
              as="h2"
              text="Works"
              className="u-display text-h1 mt-4 leading-[1.0] tracking-[-0.01em]"
            />
          </div>
          <span className="u-label u-tabular">
            [ {pad2(photos.length)} Frames ]
          </span>
        </div>

        <Suspense fallback={<GalleryFallback />}>
          <GallerySectionClient photos={photos} />
        </Suspense>
      </div>
    </section>
  );
}
