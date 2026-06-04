"use client";

import Image from "next/image";

import type { Photo } from "@/lib/types";

import { formatTag } from "./format";

export function PhotoTile({
  photo,
  number,
  onSelect,
}: {
  photo: Photo;
  number: string;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(photo.id)}
      aria-label={`Open photo ${number}: ${photo.description}`}
      className="group relative block w-full text-left focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden border border-rule">
        <Image
          src={photo.thumbUrl}
          alt={photo.description}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        <span className="u-label u-tabular absolute left-0 top-0 inline-flex items-center border-b border-r border-rule bg-paper px-2 py-1 text-red">
          {number}
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full border-t border-rule bg-paper p-3 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none">
          <p className="line-clamp-2 text-sm leading-snug text-ink">
            {photo.description}
          </p>
          {photo.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {photo.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="u-tag cursor-default">
                  {formatTag(tag)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
