import { site } from "@/content/site";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { Reveal } from "@/components/primitives/reveal";

type Row = { term: string; value: React.ReactNode };

export function InfoSection() {
  const rows: Row[] = [
    { term: "Location", value: site.info.location },
    {
      term: "Gear",
      value: (
        <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
          {site.info.gear.map((item, i) => (
            <span key={item} className="inline-flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="u-slash">
                  /
                </span>
              ) : null}
              {item}
            </span>
          ))}
        </span>
      ),
    },
    { term: "Years", value: <span className="u-tabular">{site.info.years}</span> },
    {
      term: "Built with",
      value: (
        <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
          {site.info.builtWith.map((item, i) => (
            <span key={item} className="inline-flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="u-slash">
                  /
                </span>
              ) : null}
              {item}
            </span>
          ))}
        </span>
      ),
    },
  ];

  return (
    <section id="info" className="u-rule-t scroll-mt-24">
      <div className="u-shell py-20 sm:py-28">
        <HashtagLabel index="05" label="Info" />

        <dl className="mt-10 border-t border-rule">
          {rows.map((row, i) => (
            <Reveal
              key={row.term}
              delay={i * 0.05}
              className="u-grid items-baseline border-b border-rule py-5"
            >
              <dt className="u-label col-span-12 sm:col-span-3">{row.term}</dt>
              <dd className="col-span-12 mt-1 text-[0.875rem] leading-[1.55] text-ink sm:col-span-9 sm:mt-0 md:text-[1rem]">
                {row.value}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
