"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { Filters, Option } from "@/lib/types";

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const control =
  "h-8 border border-line-strong bg-panel px-2.5 text-[13px] text-ink outline-none focus:border-data focus:ring-1 focus:ring-data";

export function FilterBar({
  filters, bounds, stores, categories, canChooseStore,
}: {
  filters: Filters;
  bounds: { min: string; max: string };
  stores: Option[];
  categories: Option[];
  canChooseStore: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function update(patch: Partial<Record<"from" | "to" | "store" | "category", string | null>>) {
    const next = {
      from: filters.from,
      to: filters.to,
      store: filters.storeId ? String(filters.storeId) : null,
      category: filters.categoryId ? String(filters.categoryId) : null,
      ...patch,
    };
    const qs = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && qs.set(k, v));
    startTransition(() => router.replace(`${pathname}?${qs.toString()}`, { scroll: false }));
  }

  const presets = [
    { label: "7D", title: "Last 7 days", from: addDays(bounds.max, -6) },
    { label: "30D", title: "Last 30 days", from: addDays(bounds.max, -29) },
    { label: "90D", title: "Last 90 days", from: addDays(bounds.max, -89) },
    { label: "ALL", title: "All available data", from: bounds.min },
  ];
  const isReset = filters.storeId === null || !canChooseStore;

  return (
    <div
      className="flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-line bg-panel-head px-4 py-3 sm:px-6"
      aria-busy={pending}
    >
      <Field label="Period">
        <div className="flex" role="group" aria-label="Date range presets">
          {presets.map((p, i) => {
            const active = filters.from === p.from && filters.to === bounds.max;
            return (
              <button
                key={p.label}
                title={p.title}
                onClick={() => update({ from: p.from, to: bounds.max })}
                aria-pressed={active}
                className={`num h-8 border px-3 text-xs font-medium ${i > 0 ? "-ml-px" : ""} ${
                  active ? "relative z-10 border-rail bg-rail text-white" : "border-line-strong bg-panel text-ink-2 hover:bg-page"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Range">
        <div className="flex items-center">
          <input
            aria-label="From" type="date" className={`${control} num`} value={filters.from} min={bounds.min} max={filters.to}
            onChange={(e) => e.target.value && update({ from: e.target.value })}
          />
          <span className="px-1.5 text-muted" aria-hidden>→</span>
          <input
            aria-label="To" type="date" className={`${control} num`} value={filters.to} min={filters.from} max={bounds.max}
            onChange={(e) => e.target.value && update({ to: e.target.value })}
          />
        </div>
      </Field>

      <Field label="Store">
        {canChooseStore ? (
          <select aria-label="Store" className={`${control} min-w-36`} value={filters.storeId ?? ""} onChange={(e) => update({ store: e.target.value || null })}>
            <option value="">All stores</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        ) : (
          <span className={`${control} flex items-center gap-2 bg-page text-ink-2`} title="Your role is limited to this store">
            <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><rect x="1" y="5" width="8" height="6" fill="currentColor" /><path d="M3 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
            {stores[0]?.name}
          </span>
        )}
      </Field>

      <Field label="Category">
        <select aria-label="Category" className={`${control} min-w-40`} value={filters.categoryId ?? ""} onChange={(e) => update({ category: e.target.value || null })}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      {(!isReset || filters.categoryId !== null) && (
        <button
          onClick={() => update({ store: null, category: null })}
          className="h-8 text-xs text-data underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      )}

      <span className={`ml-auto h-8 text-xs leading-8 text-muted ${pending ? "visible" : "invisible"}`}>Updating…</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-1 !text-[10px]">{label}</p>
      {children}
    </div>
  );
}
