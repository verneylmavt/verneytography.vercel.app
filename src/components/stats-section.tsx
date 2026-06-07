import { site } from "@/content/site";
import { CountUp } from "@/components/effects/count-up";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { Reveal } from "@/components/primitives/reveal";

export type Stats = {
  photographs: number;
  subjects: number;
  years: number;
  bodies: number;
  lenses: number;
};

export function StatsSection({ stats }: { stats: Stats }) {
  const cells = [
    { value: stats.photographs, label: site.statsLabels.photographs },
    { value: stats.subjects, label: site.statsLabels.subjects },
    { value: stats.years, label: site.statsLabels.years },
    { value: stats.bodies, label: site.statsLabels.bodies },
    { value: stats.lenses, label: site.statsLabels.lenses },
  ];

  return (
    <section id="stats" className="u-rule-t scroll-mt-24">
      <div className="u-shell py-20 sm:py-28">
        <HashtagLabel index="02" label="my numbers" />

        <div className="mt-10 grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-5">
          {cells.map((cell, i) => (
            <div
              key={cell.label}
              className="bg-paper p-5 transition-colors hover:bg-[rgb(var(--ink)/0.03)] sm:p-7"
            >
              <Reveal delay={i * 0.06}>
                <div className="u-tabular text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.01em] text-red">
                  <CountUp value={cell.value} pad={2} />
                </div>
                <div className="u-label mt-3">{cell.label}</div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
