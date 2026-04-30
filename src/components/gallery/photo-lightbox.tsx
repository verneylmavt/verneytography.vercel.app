"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";

import type { Photo } from "@/lib/types";

function formatTag(tag: string): string {
  return tag
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTakenAt(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function PhotoLightbox({
  photo,
  open,
  onClose,
}: {
  photo: Photo | null;
  open: boolean;
  onClose: () => void;
}) {
  const takenAt = photo?.exif?.takenAt ? formatTakenAt(photo.exif.takenAt) : null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-[fadeIn_220ms_ease-out] data-[state=closed]:animate-[fadeOut_180ms_ease-in]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(1100px,calc(100vw-2.25rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-black/55 shadow-2xl backdrop-blur-xl focus:outline-none data-[state=open]:animate-[zoomIn_220ms_ease-out] data-[state=closed]:animate-[zoomOut_180ms_ease-in]">
          {photo ? (
            <div className="flex max-h-[85svh] flex-col lg:flex-row">
              <div className="relative flex max-h-[45svh] items-center justify-center bg-black p-4 sm:p-5 lg:max-h-none lg:flex-[1.2] lg:p-0">
                <Image
                  src={photo.fullUrl}
                  alt={photo.description}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  className="h-auto max-h-full w-auto max-w-full select-none object-contain"
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/10 p-6 sm:p-8 lg:flex-[0.8] lg:border-l lg:border-t-0">
                <div>
                  <Dialog.Title className="text-lg font-semibold tracking-tight text-white">
                    {photo.description}
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Photo details and EXIF metadata.
                  </Dialog.Description>
                  {photo.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {photo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/75"
                        >
                          {formatTag(tag)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3">
                  <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[130px_1fr] sm:gap-3">
                    <span className="text-white/55">Camera</span>
                    <span className="min-w-0 break-words text-white/85">
                      {photo.exif?.camera ?? "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[130px_1fr] sm:gap-3">
                    <span className="text-white/55">Lens</span>
                    <span className="min-w-0 break-words text-white/85">
                      {photo.exif?.lens ?? "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[130px_1fr] sm:gap-3">
                    <span className="text-white/55">Focal length</span>
                    <span className="min-w-0 break-words text-white/85">
                      {photo.exif?.focalLength ?? "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[130px_1fr] sm:gap-3">
                    <span className="text-white/55">Aperture</span>
                    <span className="min-w-0 break-words text-white/85">
                      {photo.exif?.aperture ?? "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[130px_1fr] sm:gap-3">
                    <span className="text-white/55">Shutter</span>
                    <span className="min-w-0 break-words text-white/85">
                      {photo.exif?.shutterSpeed ?? "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[130px_1fr] sm:gap-3">
                    <span className="text-white/55">ISO</span>
                    <span className="min-w-0 break-words text-white/85">
                      {photo.exif?.iso ?? "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[130px_1fr] sm:gap-3">
                    <span className="text-white/55">Taken</span>
                    <span className="min-w-0 break-words text-white/85">
                      {takenAt ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <Dialog.Close className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            <span className="sr-only">Close</span>
            <span aria-hidden>✕</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

