"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

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

function buildUrl(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  if (!query) return pathname;
  return `${pathname}?${query}`;
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
            <div className="relative overflow-hidden rounded-3xl border border-[rgb(var(--border)/0.10)] bg-[rgb(var(--background)/0.35)] shadow-[0_25px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur-md transition hover:border-[rgb(var(--border)/0.18)] hover:bg-[rgb(var(--background)/0.45)]">
              <Image
                src={photo.thumbUrl}
                alt={photo.description}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full select-none object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 opacity-0 transition duration-300 group-hover:opacity-100">
                <p className="text-sm font-medium text-foreground">
                  {photo.description}
                </p>
                {photo.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-[rgb(var(--border)/0.12)] bg-[rgb(var(--surface)/0.40)] px-2.5 py-1 text-xs font-medium text-foreground/85"
                      >
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                ) : null}
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
              "inline-flex items-center justify-center rounded-full border border-[rgb(var(--border)/0.14)] px-5 py-2.5 text-sm",
              "bg-[rgb(var(--background)/0.40)] text-foreground/90 backdrop-blur-md transition",
              "hover:border-[rgb(var(--border)/0.22)] hover:bg-[rgb(var(--background)/0.55)] hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTag = searchParams.get("tag");
  const selectedPhotoId = searchParams.get("photo");

  const openedViaClickRef = useRef(false);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const photo of photos) {
      for (const tag of photo.tags) set.add(tag);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [photos]);

  const filtered = useMemo(() => {
    if (!selectedTag) return photos;
    return photos.filter((photo) => photo.tags.includes(selectedTag));
  }, [photos, selectedTag]);

  const selectedPhoto = useMemo(() => {
    if (!selectedPhotoId) return null;
    return photos.find((photo) => photo.id === selectedPhotoId) ?? null;
  }, [photos, selectedPhotoId]);

  function setTag(tag: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (!tag) next.delete("tag");
    else next.set("tag", tag);
    next.delete("photo");
    openedViaClickRef.current = false;
    router.replace(buildUrl(pathname, next), { scroll: false });
  }

  function openPhoto(id: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("photo", id);
    openedViaClickRef.current = true;
    router.push(buildUrl(pathname, next), { scroll: false });
  }

  function closePhoto() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("photo");

    if (openedViaClickRef.current && window.history.length > 1) {
      openedViaClickRef.current = false;
      router.back();
      return;
    }

    openedViaClickRef.current = false;
    router.replace(buildUrl(pathname, next), { scroll: false });
  }

  return (
    <>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
        <button
          type="button"
          onClick={() => setTag(null)}
          aria-pressed={!selectedTag}
          className={[
            "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition",
            !selectedTag
              ? "border-[rgb(var(--border)/0.20)] bg-[rgb(var(--foreground)/0.08)] text-foreground"
              : "border-[rgb(var(--border)/0.12)] bg-[rgb(var(--surface)/0.40)] text-foreground/85 hover:border-[rgb(var(--border)/0.18)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition",
                active
                  ? "border-[rgb(var(--border)/0.20)] bg-[rgb(var(--foreground)/0.08)] text-foreground"
                  : "border-[rgb(var(--border)/0.12)] bg-[rgb(var(--surface)/0.40)] text-foreground/85 hover:border-[rgb(var(--border)/0.18)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
              "mt-5 inline-flex items-center justify-center rounded-full border border-[rgb(var(--border)/0.14)] px-4 py-2 text-xs",
              "bg-[rgb(var(--background)/0.40)] text-foreground/90 backdrop-blur-md transition",
              "hover:border-[rgb(var(--border)/0.22)] hover:bg-[rgb(var(--background)/0.55)] hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
        open={Boolean(selectedPhotoId)}
        onClose={closePhoto}
      />
    </>
  );
}

