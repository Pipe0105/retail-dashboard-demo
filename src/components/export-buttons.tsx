"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/types";
import { longDate, money, pct } from "@/lib/format";

interface Context {
  storeName: string;
  categoryName: string;
  user: string;
}

function fileBase(d: DashboardData) {
  return `lumen-market_${d.filters.from}_${d.filters.to}`;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(d: DashboardData, ctx: Context) {
  // Loaded on demand so the libraries don't weigh down the first page load.
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Lumen Market Dashboard (demo)";

  const header = (ws: import("exceljs").Worksheet) => {
    ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B1A2E" } };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };
  const c = d.kpis.current;

  const summary = wb.addWorksheet("Summary");
  summary.columns = [{ header: "Metric", key: "k", width: 28 }, { header: "Value", key: "v", width: 32 }];
  summary.addRows([
    { k: "Period", v: `${d.filters.from} to ${d.filters.to}` },
    { k: "Store", v: ctx.storeName },
    { k: "Category", v: ctx.categoryName },
    { k: "Revenue", v: c.revenue },
    { k: "Cost", v: c.cost },
    { k: "Gross profit", v: c.revenue - c.cost },
    { k: "Gross margin", v: c.revenue ? (c.revenue - c.cost) / c.revenue : 0 },
    { k: "Units sold", v: c.units },
    { k: "Exported by", v: ctx.user },
  ]);
  [5, 6, 7].forEach((r) => (summary.getCell(`B${r}`).numFmt = '"$"#,##0.00'));
  summary.getCell("B8").numFmt = "0.0%";
  header(summary);

  const trend = wb.addWorksheet(d.bucket === "week" ? "Weekly revenue" : "Daily revenue");
  trend.columns = [
    { header: d.bucket === "week" ? "Week starting" : "Date", key: "period", width: 16 },
    { header: "Revenue", key: "revenue", width: 16, style: { numFmt: '"$"#,##0.00' } },
    { header: "Gross margin", key: "margin", width: 14, style: { numFmt: "0.0%" } },
  ];
  trend.addRows(d.trend);
  header(trend);

  const cats = wb.addWorksheet("By category");
  cats.columns = [
    { header: "Category", key: "name", width: 20 },
    { header: "Units", key: "units", width: 12, style: { numFmt: "#,##0" } },
    { header: "Revenue", key: "revenue", width: 16, style: { numFmt: '"$"#,##0.00' } },
    { header: "Gross margin", key: "margin", width: 14, style: { numFmt: "0.0%" } },
  ];
  cats.addRows(d.byCategory);
  header(cats);

  if (d.byStore.length > 1) {
    const stores = wb.addWorksheet("By store");
    stores.columns = [
      { header: "Store", key: "name", width: 16 },
      { header: "City", key: "city", width: 18 },
      { header: "Units", key: "units", width: 12, style: { numFmt: "#,##0" } },
      { header: "Revenue", key: "revenue", width: 16, style: { numFmt: '"$"#,##0.00' } },
      { header: "Gross margin", key: "margin", width: 14, style: { numFmt: "0.0%" } },
    ];
    stores.addRows(d.byStore);
    header(stores);
  }

  const top = wb.addWorksheet("Top products");
  top.columns = [
    { header: "SKU", key: "sku", width: 10 },
    { header: "Product", key: "name", width: 30 },
    { header: "Category", key: "category", width: 18 },
    { header: "Units", key: "units", width: 10, style: { numFmt: "#,##0" } },
    { header: "Revenue", key: "revenue", width: 14, style: { numFmt: '"$"#,##0.00' } },
    { header: "Gross margin", key: "margin", width: 14, style: { numFmt: "0.0%" } },
  ];
  top.addRows(d.topProducts);
  header(top);

  const low = wb.addWorksheet("Low stock");
  low.columns = [
    { header: "Store", key: "store", width: 14 },
    { header: "SKU", key: "sku", width: 10 },
    { header: "Product", key: "name", width: 30 },
    { header: "On hand", key: "onHand", width: 10 },
    { header: "Reorder point", key: "reorderPoint", width: 14 },
    { header: "Avg. daily sales", key: "avgDaily", width: 16 },
    { header: "Days of cover", key: "daysOfCover", width: 14, style: { numFmt: "0.0" } },
  ];
  low.addRows(d.lowStock);
  header(low);

  const buf = await wb.xlsx.writeBuffer();
  download(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${fileBase(d)}.xlsx`,
  );
}

async function exportPdf(d: DashboardData, ctx: Context) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const c = d.kpis.current;
  const blue: [number, number, number] = [11, 26, 46];

  doc.setFontSize(18).setFont("helvetica", "bold").text("Lumen Market · Sales report", 40, 50);
  doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(90);
  doc.text(`${longDate(d.filters.from)} – ${longDate(d.filters.to)}  ·  ${ctx.storeName}  ·  ${ctx.categoryName}`, 40, 68);
  doc.text(`Generated ${new Date().toLocaleString("en-US")} by ${ctx.user} · demo with synthetic data`, 40, 82);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 100,
    head: [["Revenue", "Gross profit", "Gross margin", "Units sold"]],
    body: [[money(c.revenue), money(c.revenue - c.cost), pct(c.revenue ? (c.revenue - c.cost) / c.revenue : 0), c.units.toLocaleString("en-US")]],
    headStyles: { fillColor: blue },
    styles: { fontSize: 11, halign: "center" },
  });

  const section = (title: string, head: string[], body: (string | number)[][]) => {
    const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
    doc.setFontSize(12).setFont("helvetica", "bold").text(title, 40, y);
    autoTable(doc, { startY: y + 8, head: [head], body, headStyles: { fillColor: blue }, styles: { fontSize: 9 } });
  };

  section("Revenue by category", ["Category", "Units", "Revenue", "Margin"],
    d.byCategory.map((r) => [r.name, r.units.toLocaleString("en-US"), money(r.revenue), pct(r.margin)]));
  if (d.byStore.length > 1) {
    section("Revenue by store", ["Store", "City", "Revenue", "Margin"],
      d.byStore.map((r) => [r.name, r.city, money(r.revenue), pct(r.margin)]));
  }
  section("Top 10 products", ["Product", "Category", "Units", "Revenue", "Margin"],
    d.topProducts.map((r) => [r.name, r.category, r.units.toLocaleString("en-US"), money(r.revenue), pct(r.margin)]));
  section("Low stock alerts", ["Store", "Product", "On hand", "Reorder pt.", "Days left"],
    d.lowStock.map((r) => [r.store, r.name, r.onHand, r.reorderPoint, r.daysOfCover === null ? "—" : r.daysOfCover.toFixed(1)]));

  doc.save(`${fileBase(d)}.pdf`);
}

export function ExportButtons({ data, context }: { data: DashboardData; context: Context }) {
  const [busy, setBusy] = useState<null | "xlsx" | "pdf">(null);

  async function run(kind: "xlsx" | "pdf") {
    setBusy(kind);
    try {
      await (kind === "xlsx" ? exportExcel(data, context) : exportPdf(data, context));
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "h-8 border px-3 text-[13px] font-medium disabled:opacity-60 inline-flex items-center gap-2";
  return (
    <div className="flex">
      <button className={`${btn} border-rail bg-rail text-white hover:bg-rail-2`} disabled={busy !== null} onClick={() => run("xlsx")}>
        <FileIcon /> {busy === "xlsx" ? "Preparing…" : "Export .xlsx"}
      </button>
      <button className={`${btn} -ml-px border-line-strong bg-panel text-ink hover:bg-page`} disabled={busy !== null} onClick={() => run("pdf")}>
        <FileIcon /> {busy === "pdf" ? "Preparing…" : "Export .pdf"}
      </button>
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden>
      <path d="M1 .5h6l3.5 3.5v8.5H1z" fill="none" stroke="currentColor" />
      <path d="M3 7.5h5M3 9.5h5" stroke="currentColor" />
    </svg>
  );
}
