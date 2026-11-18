export interface Option {
  id: number;
  name: string;
}

export interface Filters {
  from: string; // YYYY-MM-DD
  to: string;
  storeId: number | null;
  categoryId: number | null;
}

export interface Totals {
  revenue: number;
  cost: number;
  units: number;
  tickets: number;
}

export interface DashboardData {
  filters: Filters;
  previousRange: { from: string; to: string };
  bucket: "day" | "week";
  lowStockTotal: number;
  kpis: { current: Totals; previous: Totals | null };
  trend: { period: string; revenue: number; margin: number }[];
  byCategory: { id: number; name: string; revenue: number; units: number; margin: number }[];
  byStore: { id: number; name: string; city: string; revenue: number; units: number; margin: number }[];
  topProducts: { sku: string; name: string; category: string; units: number; revenue: number; margin: number }[];
  lowStock: {
    store: string;
    sku: string;
    name: string;
    onHand: number;
    reorderPoint: number;
    avgDaily: number;
    daysOfCover: number | null;
  }[];
}
