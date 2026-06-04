"use client";

import Image from "next/image";

import type { Photo } from "@/lib/types";

import { exifSummary, formatTag } from "./format";

export function GalleryIndexList({
  photos,
  numberById,
  onSelect,
}: {
  photos: Photo[];
  numberById: Map<string, string>;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="border-t border-rule">
      {photos.map((photo) => {
        const exif = exifSummary(photo);
        return (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => onSelect(photo.id)}
              aria-label={`Open photo ${numberById.get(photo.id) ?? ""}: ${photo.description}`}
              className="group grid w-full grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-rule py-3 text-left transition-colors hover:bg-[rgb(var(--ink)/0.03)] focus-visible:bg-[rgb(var(--ink)/0.03)] sm:grid-cols-[3rem_4rem_1fr_auto] sm:gap-4"
            >
              <span className="u-label u-tabular text-red">
                {numberById.get(photo.id) ?? "00"}
              </span>

              <span className="relative hidden aspect-[4/3] w-16 overflow-hidden border border-rule sm:block">
                <Image
                  src={photo.thumbUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover grayscale transition group-hover:grayscale-0 motion-reduce:transition-none"
                />
              </span>

              <span className="min-w-0">
                <span className="block truncate text-[0.875rem] leading-[1.4] text-ink transition-colors group-hover:text-red">
                  {photo.description}
                </span>
                {photo.tags.length > 0 ? (
                  <span className="mt-1.5 hidden flex-wrap gap-1.5 sm:flex">
                    {photo.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="u-tag cursor-default">
                        {formatTag(tag)}
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>

              <span className="u-label u-tabular hidden whitespace-nowrap text-right text-mute sm:block">
                {exif}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
