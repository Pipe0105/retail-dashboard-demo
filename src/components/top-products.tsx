import type { DashboardData } from "@/lib/types";
import { int, money, pct } from "@/lib/format";

export function TopProducts({ rows }: { rows: DashboardData["topProducts"] }) {
  if (rows.length === 0) return <p className="py-10 text-center text-sm text-muted">No sales in this range.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-[13px]">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="label w-10 py-2 pl-4 text-right">#</th>
            <th className="label px-3 py-2">SKU</th>
            <th className="label px-3 py-2">Product</th>
            <th className="label px-3 py-2">Category</th>
            <th className="label px-3 py-2 text-right">Units</th>
            <th className="label px-3 py-2 text-right">Revenue</th>
            <th className="label px-4 py-2 text-right">Margin</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.sku} className="border-b border-line last:border-0 hover:bg-panel-head">
              <td className="num py-2 pl-4 text-right text-muted">{String(idx + 1).padStart(2, "0")}</td>
              <td className="num whitespace-nowrap px-3 py-2 text-xs text-ink-2">{r.sku}</td>
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2 text-ink-2">{r.category}</td>
              <td className="num px-3 py-2 text-right">{int(r.units)}</td>
              <td className="num px-3 py-2 text-right text-ink">{money(r.revenue)}</td>
              <td className="num px-4 py-2 text-right text-ink-2">{pct(r.margin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
