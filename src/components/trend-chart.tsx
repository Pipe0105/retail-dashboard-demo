"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactMoney, money, pct, shortDate } from "@/lib/format";

interface Point {
  period: string;
  revenue: number;
  margin: number;
}

const tick = { fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" };

export function TrendChart({ data, bucket, average }: { data: Point[]; bucket: "day" | "week"; average: number }) {
  if (data.length === 0) return <p className="py-16 text-center text-sm text-muted">No sales in this range.</p>;

  return (
    <div className="h-72 xl:h-[24rem]" role="img" aria-label={`Revenue ${bucket === "week" ? "per week" : "per day"} for the selected range`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="period" tickFormatter={shortDate} tick={tick} tickLine={false} axisLine={{ stroke: "var(--line-strong)" }} minTickGap={32} />
          <YAxis tickFormatter={compactMoney} tick={tick} tickLine={false} axisLine={false} width={54} />
          <ReferenceLine y={average} stroke="var(--amber)" strokeDasharray="4 4" strokeWidth={1} />
          <Tooltip
            cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;
              const vsAvg = average ? p.revenue / average - 1 : 0;
              return (
                <div className="border border-line-strong bg-panel px-3 py-2 text-xs shadow-md">
                  <p className="label !text-ink">{bucket === "week" ? `Week of ${shortDate(p.period)}` : shortDate(p.period)}</p>
                  <dl className="num mt-1.5 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
                    <dt className="text-muted">Revenue</dt><dd className="text-right text-ink">{money(p.revenue)}</dd>
                    <dt className="text-muted">vs. avg</dt>
                    <dd className={`text-right ${vsAvg >= 0 ? "text-green" : "text-red"}`}>{vsAvg >= 0 ? "+" : "−"}{pct(Math.abs(vsAvg))}</dd>
                    <dt className="text-muted">Margin</dt><dd className="text-right text-ink">{pct(p.margin)}</dd>
                  </dl>
                </div>
              );
            }}
          />
          <Area
            type="linear"
            dataKey="revenue"
            stroke="var(--data)"
            strokeWidth={1.75}
            fill="var(--data-soft)"
            fillOpacity={0.55}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--panel)", fill: "var(--data)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
