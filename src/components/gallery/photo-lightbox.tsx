"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRef } from "react";

import type { Photo } from "@/lib/types";

import { exifSummary, formatTag, pad3 } from "./format";

function formatTakenAt(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

type ExifRow = { label: string; value: string | number | null | undefined };

export function PhotoLightbox({
  photo,
  open,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: {
  photo: Photo | null;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
}) {
  const pointerStartX = useRef<number | null>(null);
  const canNavigate = total > 1;

  const takenAt = photo?.exif?.takenAt
    ? formatTakenAt(photo.exif.takenAt)
    : null;

  const rows: ExifRow[] = [
    { label: "Camera", value: photo?.exif?.camera },
    { label: "Lens", value: photo?.exif?.lens },
    { label: "Focal", value: photo?.exif?.focalLength },
    { label: "Aperture", value: photo?.exif?.aperture },
    { label: "Shutter", value: photo?.exif?.shutterSpeed },
    { label: "ISO", value: photo?.exif?.iso },
    { label: "Date", value: takenAt },
  ];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgb(var(--ink)/0.85)] backdrop-blur-sm data-[state=open]:animate-[fadeIn_200ms_ease-out] data-[state=closed]:animate-[fadeOut_160ms_ease-in]" />
        <Dialog.Content
          onKeyDown={(event) => {
            if (!canNavigate) return;
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              onPrev();
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              onNext();
            }
          }}
          className="fixed left-1/2 top-1/2 z-50 w-[min(1100px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border border-rule bg-paper focus:outline-none data-[state=open]:animate-[lbIn_200ms_ease-out] data-[state=closed]:animate-[lbOut_160ms_ease-in]"
        >
          {photo ? (
            <div className="flex max-h-[86svh] flex-col lg:flex-row">
              <div
                className="relative flex max-h-[55svh] flex-1 items-center justify-center bg-[rgb(var(--ink)/0.04)] p-3 sm:p-4 lg:max-h-none lg:border-r lg:border-rule"
                onPointerDown={(event) => {
                  pointerStartX.current = event.clientX;
                }}
                onPointerUp={(event) => {
                  if (pointerStartX.current === null || !canNavigate) return;
                  const dx = event.clientX - pointerStartX.current;
                  pointerStartX.current = null;
                  if (dx > 50) onPrev();
                  else if (dx < -50) onNext();
                }}
              >
                <Image
                  src={photo.fullUrl}
                  alt={photo.description}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="h-auto max-h-full w-auto max-w-full select-none object-contain"
                />
              </div>

              <div className="min-h-0 w-full overflow-y-auto p-6 sm:p-8 lg:w-[22rem] lg:shrink-0">
                <div className="u-label">
                  <span className="u-tabular text-red">
                    {pad3(index)} / {pad3(total)}
                  </span>
                </div>

                <Dialog.Title className="mt-4 text-lg leading-snug text-ink">
                  {photo.description}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Photo details and EXIF metadata.
                </Dialog.Description>

                {photo.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {photo.tags.map((tag) => (
                      <span key={tag} className="u-tag cursor-default">
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                ) : null}

                <dl className="mt-6 border-t border-rule">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5"
                    >
                      <dt className="u-label">{row.label}</dt>
                      <dd className="min-w-0 break-words text-right text-sm text-ink">
                        {row.value ?? "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                {canNavigate ? (
                  <div className="mt-4 flex gap-1">
                    <button
                      type="button"
                      onClick={onPrev}
                      aria-label="Previous photo"
                      className="flex-1 border border-rule py-2 text-center text-ink transition-colors hover:border-ink hover:text-red"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={onNext}
                      aria-label="Next photo"
                      className="flex-1 border border-rule py-2 text-center text-ink transition-colors hover:border-ink hover:text-red"
                    >
                      →
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <Dialog.Close
            aria-label="Close"
            className="u-label absolute right-3 top-3 border border-rule bg-paper px-3 py-2 text-ink transition-colors hover:border-ink hover:text-red"
          >
            <span aria-hidden>✕</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
