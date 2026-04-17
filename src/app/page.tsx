import { ContactSection } from "@/components/contact-section";
import { GallerySection } from "@/components/gallery/gallery-section";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import photosRaw from "@/content/photos.json";
import { site } from "@/content/site";
import type { Photo } from "@/lib/types";

export default function Home() {
  const photos = photosRaw as Photo[];
  const featured =
    photos.find((photo) => photo.id === site.featuredPhotoId) ?? photos[0];

  if (!featured) return null;

  return (
    <div className="relative z-10 min-h-screen text-foreground">
      <Header />

      <main className="relative">
        <HeroSection featuredPhoto={featured} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <GallerySection photos={photos} />
          <ContactSection />
        </div>
      </main>
    </div>
  );
}
