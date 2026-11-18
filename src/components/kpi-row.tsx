import type { DashboardData } from "@/lib/types";
import { int, money, pct } from "@/lib/format";

interface Kpi {
  label: string;
  value: string;
  unit?: string;
  detail: string;
  change: number | null; // relative change vs previous period
  changeIsPoints?: boolean; // margin change shown in percentage points
}

export function KpiStrip({ data }: { data: DashboardData }) {
  const c = data.kpis.current;
  const p = data.kpis.previous;
  const marginOf = (t: { revenue: number; cost: number }) =>
    t.revenue > 0 ? (t.revenue - t.cost) / t.revenue : 0;
  const rel = (a: number, b: number | undefined) =>
    b && b > 0 ? a / b - 1 : null;
  const hasCategory = data.filters.categoryId !== null;
  const days =
    Math.round(
      (Date.parse(data.filters.to) - Date.parse(data.filters.from)) /
        86_400_000,
    ) + 1;

  const kpis: Kpi[] = [
    {
      label: "Net revenue",
      value: money(c.revenue),
      unit: "USD",
      detail: `vs. prior ${days} days`,
      change: rel(c.revenue, p?.revenue),
    },
    {
      label: "Gross margin",
      value: pct(marginOf(c)),
      detail: `${money(c.cost)} cost of goods`,
      change: p ? marginOf(c) - marginOf(p) : null,
      changeIsPoints: true,
    },
    hasCategory
      ? {
          label: "Avg. unit price",
          value: money(c.units ? c.revenue / c.units : 0, 2),
          detail: "selected category",
          change: rel(
            c.units ? c.revenue / c.units : 0,
            p?.units ? p.revenue / p.units : undefined,
          ),
        }
      : {
          label: "Avg. ticket",
          value: money(c.tickets ? c.revenue / c.tickets : 0, 2),
          detail: `${int(c.tickets)} tickets`,
          change: rel(
            c.tickets ? c.revenue / c.tickets : 0,
            p?.tickets ? p.revenue / p.tickets : undefined,
          ),
        },
    {
      label: "Units sold",
      value: int(c.units),
      detail: `${int(c.units / days)} / day`,
      change: rel(c.units, p?.units),
    },
    {
      label: "Gross profit",
      value: money(c.revenue - c.cost),
      detail: `${money((c.revenue - c.cost) / days)} / day`,
      change: rel(c.revenue - c.cost, p ? p.revenue - p.cost : undefined),
    },
  ];

  return (
    <section
      id="overview"
      className="scroll-mt-20 grid grid-cols-2 border border-line bg-panel lg:grid-cols-5"
    >
      {kpis.map((k, i) => (
        <div
          key={k.label}
          className={[
            "border-line px-4 py-3.5",
            // Mobile (2 columns): right column gets a left divider, rows after the first get a top divider.
            i % 2 === 1 ? "border-l" : "",
            i >= 2 ? "border-t lg:border-t-0" : "",
            // Desktop (one row): every card except the first gets a left divider.
            i > 0 ? "lg:border-l" : "",
            // Odd number of cards: the last one spans both columns on mobile.
            kpis.length % 2 === 1 && i === kpis.length - 1 ? "col-span-2 lg:col-span-1" : "",
          ].join(" ")}
        >
          <p className="label">{k.label}</p>
          <p className="num mt-2 text-[26px] font-medium leading-none text-ink">
            {k.value}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs">
            <Delta value={k.change} points={k.changeIsPoints} />
            <span className="text-muted">{k.detail}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function Delta({ value, points }: { value: number | null; points?: boolean }) {
  if (value === null)
    return <span className="text-muted">no prior period</span>;
  const flat = Math.abs(value) < 0.0005;
  const up = value > 0;
  const text = points
    ? `${(Math.abs(value) * 100).toFixed(1)} pt`
    : pct(Math.abs(value));
  const color = flat ? "text-muted" : up ? "text-green" : "text-red";
  return (
    <span
      className={`num font-medium ${color}`}
      title="Change vs. the previous period of the same length"
    >
      <span aria-hidden>{flat ? "■" : up ? "▲" : "▼"}</span>
      <span className="sr-only">{flat ? "Flat" : up ? "Up" : "Down"}</span>{" "}
      {text}
    </span>
  );
}
