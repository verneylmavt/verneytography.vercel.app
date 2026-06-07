import { site } from "@/content/site";
import { CornerBrackets } from "@/components/primitives/corner-brackets";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { HeadingReveal } from "@/components/primitives/heading-reveal";
import { Reveal } from "@/components/primitives/reveal";

type Row = { term: string; items: readonly string[] };

function GearChip({ index, label }: { index: number; label: string }) {
  return (
    <span className="relative inline-flex items-center gap-2.5 border border-rule px-3.5 py-2">
      <CornerBrackets />
      <span className="u-label u-tabular text-red">
        {String(index).padStart(2, "0")}
      </span>
      <span aria-hidden className="h-3.5 w-px bg-rule" />
      <span>{label}</span>
    </span>
  );
}

export function InfoSection() {
  const rows: Row[] = [
    { term: "Body", items: site.info.body },
    { term: "Lens", items: site.info.lens },
  ];

  return (
    <section id="info" className="u-rule-t scroll-mt-24">
      <div className="u-shell py-20 sm:py-28">
        <HashtagLabel index="04" label="my weapons" />

        <HeadingReveal
          as="h2"
          text="Gear"
          className="u-display text-h1 mt-6 max-w-[12ch]"
        />

        <dl className="mt-10 border-t border-rule">
          {rows.map((row, i) => (
            <Reveal
              key={row.term}
              delay={i * 0.05}
              className="u-grid items-baseline border-b border-rule py-5"
            >
              <dt className="u-label col-span-12 sm:col-span-3">{row.term}</dt>
              <dd className="col-span-12 mt-3 text-[0.875rem] leading-[1.55] text-ink sm:col-span-9 sm:mt-0 md:text-[1rem]">
                <span className="flex flex-wrap gap-2.5">
                  {row.items.map((item, j) => (
                    <GearChip key={item} index={j + 1} label={item} />
                  ))}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
