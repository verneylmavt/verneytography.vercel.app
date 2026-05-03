import { ContactSection } from "@/components/contact-section";
import { GallerySection } from "@/components/gallery/gallery-section";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { GALLERY_PHOTO_ID_ORDER } from "@/content/photo-order";
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
    <div className="relative z-10 min-h-screen text-foreground">
      <Header />

      <main className="relative">
        <HeroSection />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <GallerySection photos={photos} />
          <ContactSection />
        </div>
      </main>
    </div>
  );
}
