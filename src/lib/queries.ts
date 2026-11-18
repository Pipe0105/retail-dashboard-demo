import "server-only";
import { db } from "./db";
import type { Session } from "./auth";
import type { DashboardData, Filters, Option } from "./types";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}
const num = (v: unknown) => (v == null ? 0 : Number(v));

/**
 * Turns raw URL params into safe filters.
 * Security: a store manager is always locked to their own store,
 * whatever the URL says — the browser is never trusted with permissions.
 */
export async function resolveFilters(
  params: Record<string, string | string[] | undefined>,
  session: Session,
): Promise<{ filters: Filters; bounds: { min: string; max: string } }> {
  const [b] = await db().sql<{ min: string; max: string }>`
    SELECT MIN(sale_date)::text AS min, MAX(sale_date)::text AS max FROM daily_sales`;
  const bounds = { min: b.min, max: b.max };

  const pick = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  let to = pick("to") && ISO.test(pick("to")!) ? pick("to")! : bounds.max;
  let from = pick("from") && ISO.test(pick("from")!) ? pick("from")! : addDays(to, -29);
  if (to > bounds.max) to = bounds.max;
  if (from < bounds.min) from = bounds.min;
  if (from > to) from = to;

  const storeParam = Number(pick("store"));
  const categoryParam = Number(pick("category"));

  const storeId =
    session.role === "store_manager"
      ? session.storeId
      : Number.isInteger(storeParam) && storeParam > 0
        ? storeParam
        : null;
  const categoryId = Number.isInteger(categoryParam) && categoryParam > 0 ? categoryParam : null;

  return { filters: { from, to, storeId, categoryId }, bounds };
}

export async function getOptions(session: Session) {
  const sql = db().sql;
  const stores = await sql<Option>`
    SELECT id, name FROM stores
    WHERE ${session.role === "admin"} OR id = ${session.storeId}
    ORDER BY name`;
  const categories = await sql<Option>`SELECT id, name FROM categories ORDER BY name`;
  return { stores, categories };
}

export async function getDashboardData(f: Filters, minDate: string): Promise<DashboardData> {
  const sql = db().sql;
  const store = f.storeId;
  const cat = f.categoryId;

  const length = daysBetween(f.from, f.to) + 1;
  const prevTo = addDays(f.from, -1);
  const prevFrom = addDays(prevTo, -(length - 1));

  // Reusable WHERE fragment values: NULL means "no filter".
  const totals = async (from: string, to: string) => {
    const [r] = await sql<{ revenue: string; cost: string; units: string }>`
      SELECT COALESCE(SUM(d.revenue),0) AS revenue, COALESCE(SUM(d.cost),0) AS cost,
             COALESCE(SUM(d.units),0) AS units
      FROM daily_sales d JOIN products p ON p.id = d.product_id
      WHERE d.sale_date BETWEEN ${from}::date AND ${to}::date
        AND (${store}::int IS NULL OR d.store_id = ${store}::int)
        AND (${cat}::int IS NULL OR p.category_id = ${cat}::int)`;
    const [t] = await sql<{ tickets: string }>`
      SELECT COALESCE(SUM(tickets),0) AS tickets FROM store_daily_tickets
      WHERE sale_date BETWEEN ${from}::date AND ${to}::date
        AND (${store}::int IS NULL OR store_id = ${store}::int)`;
    return { revenue: num(r.revenue), cost: num(r.cost), units: num(r.units), tickets: num(t.tickets) };
  };

  // Long ranges are grouped by week so the chart stays readable.
  const bucket = length > 92 ? "week" : "day";

  const [current, previous, trend, byCategory, byStore, topProducts, lowStock, lowStockCount] = await Promise.all([
    totals(f.from, f.to),
    prevFrom >= minDate ? totals(prevFrom, prevTo) : Promise.resolve(null),
    sql<{ period: string; revenue: string; cost: string }>`
      SELECT date_trunc(${bucket}, d.sale_date)::date::text AS period,
             SUM(d.revenue) AS revenue, SUM(d.cost) AS cost
      FROM daily_sales d JOIN products p ON p.id = d.product_id
      WHERE d.sale_date BETWEEN ${f.from}::date AND ${f.to}::date
        AND (${store}::int IS NULL OR d.store_id = ${store}::int)
        AND (${cat}::int IS NULL OR p.category_id = ${cat}::int)
      GROUP BY 1 ORDER BY 1`,
    sql<{ id: number; name: string; revenue: string; cost: string; units: string }>`
      SELECT c.id, c.name, SUM(d.revenue) AS revenue, SUM(d.cost) AS cost, SUM(d.units) AS units
      FROM daily_sales d
      JOIN products p ON p.id = d.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE d.sale_date BETWEEN ${f.from}::date AND ${f.to}::date
        AND (${store}::int IS NULL OR d.store_id = ${store}::int)
        AND (${cat}::int IS NULL OR p.category_id = ${cat}::int)
      GROUP BY c.id, c.name ORDER BY revenue DESC`,
    sql<{ id: number; name: string; city: string; revenue: string; cost: string; units: string }>`
      SELECT s.id, s.name, s.city, SUM(d.revenue) AS revenue, SUM(d.cost) AS cost, SUM(d.units) AS units
      FROM daily_sales d
      JOIN stores s ON s.id = d.store_id
      JOIN products p ON p.id = d.product_id
      WHERE d.sale_date BETWEEN ${f.from}::date AND ${f.to}::date
        AND (${store}::int IS NULL OR d.store_id = ${store}::int)
        AND (${cat}::int IS NULL OR p.category_id = ${cat}::int)
      GROUP BY s.id, s.name, s.city ORDER BY revenue DESC`,
    sql<{ sku: string; name: string; category: string; units: string; revenue: string; cost: string }>`
      SELECT p.sku, p.name, c.name AS category,
             SUM(d.units) AS units, SUM(d.revenue) AS revenue, SUM(d.cost) AS cost
      FROM daily_sales d
      JOIN products p ON p.id = d.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE d.sale_date BETWEEN ${f.from}::date AND ${f.to}::date
        AND (${store}::int IS NULL OR d.store_id = ${store}::int)
        AND (${cat}::int IS NULL OR p.category_id = ${cat}::int)
      GROUP BY p.sku, p.name, c.name ORDER BY revenue DESC LIMIT 10`,
    // Days of cover = stock on hand / average daily units over the last 28 days of data.
    sql<{ store: string; sku: string; name: string; on_hand: number; reorder_point: number; avg_daily: string }>`
      WITH recent AS (
        SELECT store_id, product_id, SUM(units) / 28.0 AS avg_daily
        FROM daily_sales
        WHERE sale_date > (SELECT MAX(sale_date) FROM daily_sales) - 28
        GROUP BY store_id, product_id
      )
      SELECT s.name AS store, p.sku, p.name, i.on_hand, i.reorder_point,
             ROUND(COALESCE(r.avg_daily, 0), 1) AS avg_daily
      FROM inventory i
      JOIN stores s ON s.id = i.store_id
      JOIN products p ON p.id = i.product_id
      LEFT JOIN recent r ON r.store_id = i.store_id AND r.product_id = i.product_id
      WHERE i.on_hand <= i.reorder_point
        AND (${store}::int IS NULL OR i.store_id = ${store}::int)
        AND (${cat}::int IS NULL OR p.category_id = ${cat}::int)
      ORDER BY i.on_hand / NULLIF(r.avg_daily, 0) ASC NULLS LAST
      LIMIT 12`,
    sql<{ n: string }>`
      SELECT COUNT(*) AS n FROM inventory i JOIN products p ON p.id = i.product_id
      WHERE i.on_hand <= i.reorder_point
        AND (${store}::int IS NULL OR i.store_id = ${store}::int)
        AND (${cat}::int IS NULL OR p.category_id = ${cat}::int)`,
  ]);

  const margin = (rev: number, cost: number) => (rev > 0 ? (rev - cost) / rev : 0);

  return {
    filters: f,
    previousRange: { from: prevFrom, to: prevTo },
    bucket,
    lowStockTotal: num(lowStockCount[0]?.n),
    kpis: { current, previous },
    trend: trend.map((r) => ({ period: r.period, revenue: num(r.revenue), margin: margin(num(r.revenue), num(r.cost)) })),
    byCategory: byCategory.map((r) => ({
      id: r.id, name: r.name, revenue: num(r.revenue), units: num(r.units), margin: margin(num(r.revenue), num(r.cost)),
    })),
    byStore: byStore.map((r) => ({
      id: r.id, name: r.name, city: r.city, revenue: num(r.revenue), units: num(r.units), margin: margin(num(r.revenue), num(r.cost)),
    })),
    topProducts: topProducts.map((r) => ({
      sku: r.sku, name: r.name, category: r.category, units: num(r.units), revenue: num(r.revenue),
      margin: margin(num(r.revenue), num(r.cost)),
    })),
    lowStock: lowStock.map((r) => {
      const avg = num(r.avg_daily);
      return {
        store: r.store, sku: r.sku, name: r.name, onHand: num(r.on_hand), reorderPoint: num(r.reorder_point),
        avgDaily: avg, daysOfCover: avg > 0 ? num(r.on_hand) / avg : null,
      };
    }),
  };
}
