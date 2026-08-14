"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CATEGORY_COLORS,
  formatCategoryLabel,
  formatNaira,
  type CategorySummary,
} from "@/lib/dashboard/format";

type ChartRow = CategorySummary & {
  label: string;
  value: number;
  color: string;
};

function toChartRows(rows: CategorySummary[]): ChartRow[] {
  return rows.map((row) => ({
    ...row,
    label: formatCategoryLabel(row.category),
    value: Number(row.total),
    color: CATEGORY_COLORS[row.category],
  }));
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-zinc-900">{row.label}</p>
      <p className="text-zinc-600">{formatNaira(row.total)}</p>
      <p className="text-zinc-500">{row.count} expenses</p>
    </div>
  );
}

export function SpendingCharts({ data }: { data: CategorySummary[] }) {
  const rows = toChartRows(data);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center text-sm text-zinc-600">
        No spending data for this period yet. Add expenses to see your chart.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-zinc-900">Spending by category</h3>
        <p className="mt-1 text-sm text-zinc-600">Share of total spend</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {rows.map((row) => (
                  <Cell key={row.category} fill={row.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-zinc-900">Category totals</h3>
        <p className="mt-1 text-sm text-zinc-600">Amount spent per category</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={row.category} fill={row.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
