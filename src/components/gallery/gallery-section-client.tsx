"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { Photo } from "@/lib/types";

import { PhotoLightbox } from "./photo-lightbox";
import { GalleryGrid } from "./gallery-grid";
import { GalleryIndexList } from "./gallery-index-list";
import { GalleryViewToggle, type GalleryView } from "./gallery-view-toggle";
import { formatTag, pad2 } from "./format";

const PAGE_SIZE = 10;

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

function GalleryBody({
  photos,
  numberById,
  view,
  onSelect,
}: {
  photos: Photo[];
  numberById: Map<string, string>;
  view: GalleryView;
  onSelect: (id: string) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = photos.slice(0, visibleCount);
  const hasMore = visibleCount < photos.length;
  const nextChunk = Math.min(PAGE_SIZE, photos.length - visibleCount);

  return (
    <div className="mt-10">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view === "index" ? (
            <GalleryIndexList
              photos={visible}
              numberById={numberById}
              onSelect={onSelect}
            />
          ) : (
            <GalleryGrid
              photos={visible}
              numberById={numberById}
              onSelect={onSelect}
              reduce={reduce}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <motion.button
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + PAGE_SIZE, photos.length),
              )
            }
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { y: 0 }}
            className="u-label border border-rule px-5 py-3 text-ink transition-colors hover:border-ink hover:text-red"
          >
            [ Load {nextChunk} more ]
          </motion.button>
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
  const view: GalleryView =
    searchParams.get("view") === "index" ? "index" : "grid";

  const openedViaClickRef = useRef(false);

  // Stable catalog numbers (01–NN) keyed by id, from the full ordered set.
  const numberById = useMemo(() => {
    const map = new Map<string, string>();
    photos.forEach((photo, i) => map.set(photo.id, pad2(i + 1)));
    return map;
  }, [photos]);

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

  const navIndex = useMemo(() => {
    if (!selectedPhoto) return -1;
    return filtered.findIndex((photo) => photo.id === selectedPhoto.id);
  }, [filtered, selectedPhoto]);

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

  function setView(nextView: GalleryView) {
    const next = getCurrentSearchParams();
    if (nextView === "grid") next.delete("view");
    else next.set("view", nextView);
    replaceGalleryUrl(pathname, next);
  }

  function openPhoto(id: string) {
    const next = getCurrentSearchParams();
    next.set("photo", id);
    openedViaClickRef.current = true;
    pushGalleryUrl(pathname, next);
  }

  function navigatePhoto(id: string) {
    const next = getCurrentSearchParams();
    next.set("photo", id);
    replaceGalleryUrl(pathname, next);
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

  function goPrev() {
    if (navIndex < 0 || filtered.length === 0) return;
    const n = (navIndex - 1 + filtered.length) % filtered.length;
    navigatePhoto(filtered[n].id);
  }

  function goNext() {
    if (navIndex < 0 || filtered.length === 0) return;
    const n = (navIndex + 1) % filtered.length;
    navigatePhoto(filtered[n].id);
  }

  return (
    <>
      <div className="mt-10 flex flex-col gap-5 border-t border-rule pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag(null)}
            aria-pressed={!selectedTag}
            data-active={!selectedTag}
            data-all="true"
            className="u-tag"
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
                data-active={active}
                className="u-tag"
              >
                {formatTag(tag)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span aria-live="polite" className="u-label u-tabular">
            {pad2(filtered.length)} / {pad2(photos.length)}
          </span>
          <GalleryViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-wrap items-center gap-4 border border-rule p-6">
          <span className="u-label text-mute">
            No photographs match this tag.
          </span>
          <button
            type="button"
            onClick={() => setTag(null)}
            className="u-link u-label text-ink"
          >
            Clear filter ↗
          </button>
        </div>
      ) : (
        <GalleryBody
          key={selectedTag ?? "all"}
          photos={filtered}
          numberById={numberById}
          view={view}
          onSelect={openPhoto}
        />
      )}

      <PhotoLightbox
        photo={selectedPhoto}
        open={Boolean(selectedPhoto)}
        onClose={closePhoto}
        onPrev={goPrev}
        onNext={goNext}
        index={navIndex >= 0 ? navIndex + 1 : 0}
        total={filtered.length}
      />
    </>
  );
}
