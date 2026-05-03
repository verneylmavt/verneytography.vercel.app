"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Photo } from "@/lib/types";

import { PhotoLightbox } from "./photo-lightbox";

const PAGE_SIZE = 10;

function formatTag(tag: string): string {
  return tag
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildUrl(
  pathname: string,
  searchParams: URLSearchParams,
  hash = "",
): string {
  const query = searchParams.toString();
  const url = query ? `${pathname}?${query}` : pathname;
  return `${url}${hash}`;
}

function getCurrentSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function replaceGalleryUrl(pathname: string, searchParams: URLSearchParams) {
  window.history.replaceState(
    null,
    "",
    buildUrl(pathname, searchParams, window.location.hash),
  );
}

function pushGalleryUrl(pathname: string, searchParams: URLSearchParams) {
  window.history.pushState(
    null,
    "",
    buildUrl(pathname, searchParams, window.location.hash),
  );
}

function GalleryMasonry({
  photos,
  onSelectPhoto,
}: {
  photos: Photo[];
  onSelectPhoto: (id: string) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMore = visibleCount < photos.length;

  return (
    <div className="mt-10">
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {visiblePhotos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelectPhoto(photo.id)}
            className="group mb-5 block w-full break-inside-avoid text-left focus-visible:outline-none"
          >
            <div className="liquid-glass relative overflow-hidden rounded-3xl shadow-[0_25px_80px_-50px_rgba(0,0,0,0.9)] transition">
              <Image
                src={photo.thumbUrl}
                alt={photo.description}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full select-none object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/95 via-background/35 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 transition duration-300 group-hover:opacity-100 sm:p-5">
                <div className="liquid-glass rounded-2xl px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {photo.description}
                  </p>
                  {photo.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {photo.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="liquid-glass inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-foreground/85"
                        >
                          {formatTag(tag)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + PAGE_SIZE, photos.length),
              )
            }
            className={[
              "liquid-glass inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm transition",
              "text-foreground/90 hover:text-foreground",
            ].join(" ")}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function GallerySectionClient({ photos }: { photos: Photo[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTag = searchParams.get("tag");
  const selectedPhotoId = searchParams.get("photo");

  const openedViaClickRef = useRef(false);

  const tags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    for (const photo of photos) {
      for (const tag of new Set(photo.tags)) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => {
        const countDiff = b[1] - a[1];
        if (countDiff !== 0) return countDiff;
        return a[0].localeCompare(b[0]);
      })
      .map(([tag]) => tag);
  }, [photos]);

  const filtered = useMemo(() => {
    if (!selectedTag) return photos;
    return photos.filter((photo) => photo.tags.includes(selectedTag));
  }, [photos, selectedTag]);

  const selectedPhoto = useMemo(() => {
    if (!selectedPhotoId) return null;
    return photos.find((photo) => photo.id === selectedPhotoId) ?? null;
  }, [photos, selectedPhotoId]);

  useEffect(() => {
    if (!selectedPhotoId) return;
    if (selectedPhoto) return;

    const next = new URLSearchParams(searchParams.toString());
    next.delete("photo");
    openedViaClickRef.current = false;
    replaceGalleryUrl(pathname, next);
  }, [pathname, searchParams, selectedPhoto, selectedPhotoId]);

  useEffect(() => {
    if (!selectedPhotoId) openedViaClickRef.current = false;
  }, [selectedPhotoId]);

  function setTag(tag: string | null) {
    const next = getCurrentSearchParams();
    if (!tag) next.delete("tag");
    else next.set("tag", tag);
    next.delete("photo");
    openedViaClickRef.current = false;
    replaceGalleryUrl(pathname, next);
  }

  function openPhoto(id: string) {
    const next = getCurrentSearchParams();
    next.set("photo", id);
    openedViaClickRef.current = true;
    pushGalleryUrl(pathname, next);
  }

  function closePhoto() {
    const next = getCurrentSearchParams();
    next.delete("photo");

    if (openedViaClickRef.current && window.history.length > 1) {
      openedViaClickRef.current = false;
      window.history.back();
      return;
    }

    openedViaClickRef.current = false;
    replaceGalleryUrl(pathname, next);
  }

  return (
    <>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
        <button
          type="button"
          onClick={() => setTag(null)}
          aria-pressed={!selectedTag}
          className={[
            "liquid-glass shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition",
            !selectedTag ? "liquid-glass--active text-foreground" : "text-foreground/85 hover:text-foreground",
          ].join(" ")}
        >
          All
        </button>
        {tags.map((tag) => {
          const active = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setTag(tag)}
              aria-pressed={active}
              className={[
                "liquid-glass shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition",
                active ? "liquid-glass--active text-foreground" : "text-foreground/85 hover:text-foreground",
              ].join(" ")}
            >
              {formatTag(tag)}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-[rgb(var(--border)/0.10)] bg-[rgb(var(--background)/0.35)] px-5 py-6 text-sm text-muted backdrop-blur-md">
          No photos found. Try choosing a different tag.
          <button
            type="button"
            onClick={() => setTag(null)}
            className={[
              "liquid-glass mt-5 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs transition",
              "text-foreground/90 hover:text-foreground",
            ].join(" ")}
          >
            Clear filter
          </button>
        </div>
      ) : (
        <GalleryMasonry
          key={selectedTag ?? "all"}
          photos={filtered}
          onSelectPhoto={openPhoto}
        />
      )}

      <PhotoLightbox
        photo={selectedPhoto}
        open={Boolean(selectedPhoto)}
        onClose={closePhoto}
      />
    </>
  );
}

