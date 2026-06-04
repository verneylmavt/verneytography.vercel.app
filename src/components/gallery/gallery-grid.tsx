"use client";

import { motion } from "motion/react";

import type { Photo } from "@/lib/types";

import { PhotoTile } from "./photo-tile";

export function GalleryGrid({
  photos,
  numberById,
  onSelect,
  reduce,
}: {
  photos: Photo[];
  numberById: Map<string, string>;
  onSelect: (id: string) => void;
  reduce: boolean;
}) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo, i) => (
        <motion.li
          key={photo.id}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            delay: reduce ? 0 : Math.min(i, 8) * 0.04,
          }}
        >
          <PhotoTile
            photo={photo}
            number={numberById.get(photo.id) ?? "00"}
            onSelect={onSelect}
          />
        </motion.li>
      ))}
    </ul>
  );
}
