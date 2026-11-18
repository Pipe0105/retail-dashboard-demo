import type { DashboardData } from "@/lib/types";
import { int } from "@/lib/format";

export function LowStock({ rows, showStore }: { rows: DashboardData["lowStock"]; showStore: boolean }) {
  if (rows.length === 0) {
    return <p className="px-4 py-6 text-sm text-muted">No items at or below their reorder point.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-[13px]">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="label py-2 pl-4 pr-3">Status</th>
            <th className="label px-3 py-2">SKU</th>
            <th className="label px-3 py-2">Product</th>
            {showStore && <th className="label px-3 py-2">Store</th>}
            <th className="label px-3 py-2 text-right">On hand</th>
            <th className="label px-3 py-2 text-right">Reorder pt.</th>
            <th className="label px-3 py-2 text-right">Avg. / day</th>
            <th className="label px-4 py-2 text-right">Cover</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const critical = r.daysOfCover !== null && r.daysOfCover < 1;
            return (
              <tr key={`${r.store}-${r.sku}`} className="border-b border-line last:border-0 hover:bg-panel-head">
                <td className="py-2 pl-4 pr-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      critical ? "bg-red-bg text-red" : "bg-amber-bg text-amber"
                    }`}
                  >
                    <span aria-hidden className={`size-1.5 ${critical ? "bg-red" : "bg-amber"}`} />
                    {critical ? "Critical" : "Reorder"}
                  </span>
                </td>
                <td className="num whitespace-nowrap px-3 py-2 text-xs text-ink-2">{r.sku}</td>
                <td className="px-3 py-2">{r.name}</td>
                {showStore && <td className="px-3 py-2 text-ink-2">{r.store}</td>}
                <td className="num px-3 py-2 text-right text-ink">{int(r.onHand)}</td>
                <td className="num px-3 py-2 text-right text-ink-2">{int(r.reorderPoint)}</td>
                <td className="num px-3 py-2 text-right text-ink-2">{r.avgDaily.toFixed(1)}</td>
                <td className={`num px-4 py-2 text-right font-medium ${critical ? "text-red" : "text-amber"}`}>
                  {r.daysOfCover === null ? "—" : `${r.daysOfCover.toFixed(1)} d`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
