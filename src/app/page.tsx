import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { GallerySection } from "@/components/gallery/gallery-section";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { InfoSection } from "@/components/info-section";
import { StatsSection } from "@/components/stats-section";
import { FilmStrip } from "@/components/primitives/film-strip";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { GALLERY_PHOTO_ID_ORDER } from "@/content/photo-order";
import { site } from "@/content/site";
import photosRaw from "@/content/photos.json";
import type { Photo } from "@/lib/types";

function orderPhotosByIdOrder(
  photos: Photo[],
  idOrder: readonly string[],
): Photo[] {
  if (idOrder.length === 0) return photos;

  const orderIndexById = new Map<string, number>();
  for (const [index, id] of idOrder.entries()) {
    if (!orderIndexById.has(id)) orderIndexById.set(id, index);
  }

  return photos
    .map((photo, originalIndex) => ({
      photo,
      originalIndex,
      orderIndex: orderIndexById.get(photo.id) ?? Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ photo }) => photo);
}

export default function Home() {
  const photos = orderPhotosByIdOrder(
    [...(photosRaw as Photo[])],
    GALLERY_PHOTO_ID_ORDER,
  );

  return (
    <>
      <ScrollProgress />

      {/* <a
        href="#work"
        className="u-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to works
      </a> */}

      <Header />

      <main>
        <HeroSection />
        <FilmStrip items={site.marquee.primary} />
        <AboutSection />
        <StatsSection />
        <GallerySection photos={photos} />
        <FilmStrip items={site.marquee.divider} reverse />
        <InfoSection />
        <ContactSection />
      </main>
    </>
  );
}
