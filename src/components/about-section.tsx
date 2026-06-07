import Image from "next/image";

import { site } from "@/content/site";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { HeadingReveal } from "@/components/primitives/heading-reveal";
import { Reveal } from "@/components/primitives/reveal";

export function AboutSection() {
  return (
    <section id="about" className="u-rule-t scroll-mt-24">
      <div className="u-shell py-20 sm:py-28">
        <HashtagLabel index="01" label="myself" />

        <div className="u-grid mt-10 items-start gap-y-12">
          <Reveal className="col-span-12 lg:col-span-5">
            <figure className="border border-rule">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={site.about.portraitSrc}
                  alt={site.about.portraitAlt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover grayscale transition duration-500 hover:grayscale-0 motion-reduce:transition-none"
                />
              </div>
              <figcaption className="u-label flex items-center justify-between border-t border-rule px-3 py-2">
                <span>{site.hero.name}</span>
                <span className="text-mute">Portrait</span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <HeadingReveal
              as="h2"
              text={site.about.heading}
              className="u-display text-h1 max-w-[14ch]"
            />

            <div className="mt-7 space-y-4 text-[0.875rem] leading-[1.65] text-ink md:text-[1rem] md:leading-[1.55]">
              {site.about.body.map((paragraph, index) => (
                <Reveal key={index} delay={0.05 + index * 0.06}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <p className="u-label mt-8">— {site.hero.name}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
