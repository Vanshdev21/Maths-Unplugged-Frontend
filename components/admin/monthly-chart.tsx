"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthCount } from "@/lib/types";

interface Props {
  title: string;
  total?: number;
  data?: MonthCount[];
  unit: string;
  loading?: boolean;
}

/** Single-series monthly bar chart. Ink-coloured bars read well in both themes. */
export function MonthlyChart({ title, total, data = [], unit, loading }: Props) {
  const last = data.at(-1)?.count ?? 0;
  const rows = data.map((d) => ({ ...d, label: d.month.split(" ")[0] }));

  return (
    <section className="rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        {typeof total === "number" && (
          <p className="text-sm text-muted">
            <span className="font-semibold text-fg tabular">{last}</span> this month
          </p>
        )}
      </div>
      <div className="mt-6 h-56">
        {loading ? (
          <div className="h-full animate-pulse rounded-xl bg-surface" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} width={48} />
              <Tooltip
                cursor={{ fill: "var(--surface)" }}
                contentStyle={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 13,
                  color: "var(--fg)",
                }}
                labelStyle={{ color: "var(--muted)" }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.month ?? ""}
                formatter={(value) => [`${value} ${unit}`, ""]}
                separator=""
              />
              <Bar dataKey="count" fill="var(--fg)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {!loading && (
        <table className="sr-only">
          <caption>{title}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.month}>
                <th scope="row">{d.month}</th>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
