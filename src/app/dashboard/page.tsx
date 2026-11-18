import { requireSession } from "@/lib/auth";
import { getDashboardData, getOptions, resolveFilters } from "@/lib/queries";
import { longDate } from "@/lib/format";
import { Sidebar } from "@/components/sidebar";
import { Panel } from "@/components/panel";
import { FilterBar } from "@/components/filter-bar";
import { KpiStrip } from "@/components/kpi-row";
import { TrendChart } from "@/components/trend-chart";
import { BarTable } from "@/components/bar-list";
import { TopProducts } from "@/components/top-products";
import { LowStock } from "@/components/low-stock";
import { ExportButtons } from "@/components/export-buttons";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const [{ filters, bounds }, options] = await Promise.all([resolveFilters(params, session), getOptions(session)]);
  const data = await getDashboardData(filters, bounds.min);

  const storeName = options.stores.find((s) => s.id === filters.storeId)?.name ?? "All stores";
  const categoryName = options.categories.find((c) => c.id === filters.categoryId)?.name ?? "All categories";
  const showStores = session.role === "admin" && filters.storeId === null;
  const avgPerBucket = data.trend.length ? data.trend.reduce((s, t) => s + t.revenue, 0) / data.trend.length : 0;

  return (
    <div className="min-h-dvh">
      <Sidebar session={session} dataThrough={bounds.max} lowStockCount={data.lowStockTotal} showStores={showStores} />

      <div className="lg:pl-56">
        <div className="border-b border-line bg-panel">
          <div className="flex flex-wrap items-end justify-between gap-4 px-4 pb-4 pt-5 sm:px-6">
            <div>
              <p className="label">Sales · {session.role === "admin" ? "Chain view" : "Store view"}</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">Sales overview</h1>
              <p className="mt-0.5 text-[13px] text-ink-2">
                <span className="num">{longDate(filters.from)} – {longDate(filters.to)}</span> · {storeName} · {categoryName}
              </p>
            </div>
            <ExportButtons data={data} context={{ storeName, categoryName, user: session.name }} />
          </div>
          <FilterBar
            filters={filters}
            bounds={bounds}
            stores={options.stores}
            categories={options.categories}
            canChooseStore={session.role === "admin"}
          />
        </div>

        <main className="space-y-4 px-4 py-4 sm:px-6 pb-16">
          <KpiStrip data={data} />

          <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <Panel
              title="Revenue"
              meta={data.bucket === "week" ? "Weekly totals" : "Daily totals"}
              actions={<Legend />}
            >
              <TrendChart data={data.trend} bucket={data.bucket} average={avgPerBucket} />
            </Panel>
            <Panel id="categories" title="By category" meta="Revenue · share · margin" flush>
              <BarTable
                firstColumn="Category"
                rows={data.byCategory.map((c) => ({ key: String(c.id), label: c.name, value: c.revenue, margin: c.margin }))}
              />
            </Panel>
          </div>

          <div className={`grid gap-4 ${showStores ? "xl:grid-cols-[1fr_1.4fr]" : ""}`}>
            {showStores && (
              <Panel id="stores" title="By store" meta="Admin only" flush>
                <BarTable
                  firstColumn="Store"
                  rows={data.byStore.map((s) => ({ key: String(s.id), label: s.name, sub: s.city, value: s.revenue, margin: s.margin }))}
                />
              </Panel>
            )}
            <Panel id="products" title="Top products" meta="Top 10 by revenue" flush>
              <TopProducts rows={data.topProducts} />
            </Panel>
          </div>

          <Panel
            id="inventory"
            title="Stock alerts"
            meta={`${data.lowStockTotal} items at or below reorder point${data.lowStockTotal > data.lowStock.length ? ` · showing ${data.lowStock.length} most urgent` : ""}`}
            flush
          >
            <LowStock rows={data.lowStock} showStore={filters.storeId === null} />
          </Panel>
        </main>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="hidden items-center gap-4 text-xs text-ink-2 sm:flex">
      <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-data" />Revenue</span>
      <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-amber" />Period average</span>
    </div>
  );
}
