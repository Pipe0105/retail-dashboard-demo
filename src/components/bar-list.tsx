import { money, pct } from "@/lib/format";

interface Row {
  key: string;
  label: string;
  sub?: string;
  value: number;
  margin: number;
}

/** Ranked table with an inline bar: one hue for magnitude, figures in mono so they line up. */
export function BarTable({ rows, firstColumn }: { rows: Row[]; firstColumn: string }) {
  if (rows.length === 0) return <p className="py-10 text-center text-sm text-muted">No data.</p>;
  const total = rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const avgMargin = rows.reduce((s, r) => s + r.margin * r.value, 0) / (total || 1);

  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b border-line">
          <th className="label px-4 py-2 text-left">{firstColumn}</th>
          <th className="label px-2 py-2 text-right">Revenue</th>
          <th className="label px-2 py-2 text-right">Share</th>
          <th className="label px-4 py-2 text-right">Margin</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className="border-b border-line last:border-0 hover:bg-panel-head">
            <td className="px-4 py-2">
              <div className="flex items-baseline gap-1.5">
                <span className="truncate">{r.label}</span>
                {r.sub && <span className="truncate text-[11px] text-muted">{r.sub}</span>}
              </div>
              <div className="mt-1 h-1 bg-grid" style={{ background: "var(--grid)" }}>
                <div className="h-1 bg-data" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </td>
            <td className="num px-2 py-2 text-right text-ink">{money(r.value)}</td>
            <td className="num px-2 py-2 text-right text-ink-2">{pct(r.value / total)}</td>
            <td
              className={`num px-4 py-2 text-right ${r.margin < avgMargin - 0.03 ? "text-red" : "text-ink-2"}`}
              title={r.margin < avgMargin - 0.03 ? "More than 3 pts below the weighted average" : undefined}
            >
              {pct(r.margin)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-line-strong bg-panel-head">
          <td className="label px-4 py-2 !text-ink">Total</td>
          <td className="num px-2 py-2 text-right font-medium">{money(total)}</td>
          <td className="num px-2 py-2 text-right text-ink-2">100.0%</td>
          <td className="num px-4 py-2 text-right font-medium">{pct(avgMargin)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
