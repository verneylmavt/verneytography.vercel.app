import type { Photo } from "@/lib/types";

export function formatTag(tag: string): string {
  return tag
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

/** Compact EXIF line, e.g. "50mm · F/1.8 · ISO 500". */
export function exifSummary(photo: Photo): string {
  const exif = photo.exif;
  if (!exif) return "";
  return [
    exif.focalLength,
    exif.aperture,
    exif.iso != null ? `ISO ${exif.iso}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
