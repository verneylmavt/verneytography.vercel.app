import { CountUp } from "@/components/effects/count-up";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { Reveal } from "@/components/primitives/reveal";

type Cell = {
  label: string;
  value?: number;
  pad?: number;
  decimals?: number;
  suffix?: string;
  display?: string; // static (non-counted) value, e.g. "∞"
};

export function StatsSection() {
  // Years active, counted from the first frame in 2017.
  const years = new Date().getFullYear() - 2017;

  const cells: Cell[] = [
    { label: "Bodies", value: 2, pad: 2 },
    { label: "Lenses", value: 3, pad: 2 },
    { label: "Years", value: years, pad: 2 },
    { label: "Photographs", value: 10.5, decimals: 1, suffix: "k" },
    { label: "Memories", display: "∞" },
  ];

  return (
    <section id="stats" className="u-rule-t scroll-mt-24">
      <div className="u-shell py-20 sm:py-28">
        <HashtagLabel index="02" label="my numbers" />

        <div className="mt-10 border border-rule bg-rule">
          {/* Row 1: Bodies · Lenses · Years */}
          <div className="grid grid-cols-3 gap-px">
            {cells.slice(0, 3).map((cell, i) => (
              <div
                key={cell.label}
                className="bg-paper p-5 transition-colors hover:bg-[rgb(var(--ink)/0.03)] sm:p-7"
              >
                <Reveal delay={i * 0.06}>
                  <div className="u-tabular text-[clamp(2rem,5vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.01em] text-red">
                    <CountUp
                      value={cell.value ?? 0}
                      pad={cell.pad ?? 0}
                      decimals={cell.decimals ?? 0}
                      suffix={cell.suffix ?? ""}
                    />
                  </div>
                  <div className="u-label mt-3">{cell.label}</div>
                </Reveal>
              </div>
            ))}
          </div>
          {/* Row 2: Photographs · Memories */}
          <div className="grid grid-cols-2 gap-px mt-px">
            {cells.slice(3).map((cell, i) => (
              <div
                key={cell.label}
                className="bg-paper p-5 transition-colors hover:bg-[rgb(var(--ink)/0.03)] sm:p-7"
              >
                <Reveal delay={(i + 3) * 0.06}>
                  <div className="u-tabular text-[clamp(2rem,5vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.01em] text-red">
                    {cell.display !== undefined ? (
                      <span>{cell.display}</span>
                    ) : (
                      <CountUp
                        value={cell.value ?? 0}
                        pad={cell.pad ?? 0}
                        decimals={cell.decimals ?? 0}
                        suffix={cell.suffix ?? ""}
                      />
                    )}
                  </div>
                  <div className="u-label mt-3">{cell.label}</div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
