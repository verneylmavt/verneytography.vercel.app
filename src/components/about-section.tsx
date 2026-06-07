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
          <Reveal className="col-span-12 lg:col-span-5" y={0}>
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
              redWords={[1, 2, 3]}
              className="u-display text-h1 max-w-[14ch]"
            />

            <blockquote className="relative mt-12.5 border-l-2 border-red pl-6 sm:pl-7">
              <span
                aria-hidden
                className="block select-none leading-[0.6] text-red text-[3.25rem] sm:text-[4rem]"
              >
                “
              </span>
              <div className="space-y-4 text-[0.875rem] italic leading-[1.65] text-ink md:text-[1rem] md:leading-[1.55]">
                {site.about.body.map((paragraph, index) => {
                  let text: string = paragraph;
                  if (index === 0) text = text.replace(/^"/, "");
                  if (index === site.about.body.length - 1)
                    text = text.replace(/"$/, "");
                  return (
                    <Reveal key={index} delay={0.05 + index * 0.06}>
                      <p>{text}</p>
                    </Reveal>
                  );
                })}
              </div>

              <Reveal delay={0.1}>
                <cite className="u-label mt-5 block not-italic">
                  <span className="text-red">—</span> {site.hero.name}
                </cite>
              </Reveal>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
