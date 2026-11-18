"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { BarChart3, Download, Table2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export interface Series {
  key: string;
  label: string;
}

type Row = Record<string, string | number>;

/** --chart-1..3 hold colour-vision-safe colours for light and dark (see globals.css). Fixed order: a series keeps its colour. */
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

/** ₦12.3m style for axes. Values are kobo. */
export const compactNaira = (kobo: number) => {
  const n = kobo / 100;
  const abs = Math.abs(n);
  const short = (v: number, unit: string) => `₦${v.toFixed(1).replace(/\.0$/, "")}${unit}`;
  if (abs >= 1e9) return short(n / 1e9, "bn");
  if (abs >= 1e6) return short(n / 1e6, "m");
  if (abs >= 1e3) return short(n / 1e3, "k");
  return `₦${Math.round(n)}`;
};

const downloadCsv = (filename: string, xLabel: string, rows: Row[], xKey: string, series: Series[], format: (v: number) => string) => {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [[xLabel, ...series.map((s) => s.label)].map(esc).join(",")];
  for (const r of rows) lines.push([String(r[xKey]), ...series.map((s) => format(Number(r[s.key] ?? 0)))].map(esc).join(","));
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * A shadcn chart card (ChartContainer + ChartTooltip + ChartLegend over
 * Recharts): stacked bars or lines, at most three series, with a table view
 * and CSV download.
 */
export function ReportChart({
  title,
  description,
  data,
  xKey = "bucket",
  xLabel = "Period",
  formatX = (v) => v,
  series,
  kind = "bar",
  format,
  axisFormat,
  csvFormat = (v) => String(v),
  filename,
}: {
  title: string;
  description?: string;
  data: Row[];
  xKey?: string;
  xLabel?: string;
  formatX?: (v: string) => string;
  series: Series[];
  kind?: "bar" | "line";
  format: (v: number) => string;
  axisFormat: (v: number) => string;
  csvFormat?: (v: number) => string;
  filename: string;
}) {
  const [asTable, setAsTable] = useState(false);
  const chartConfig = Object.fromEntries(series.map((s, i) => [s.key, { label: s.label, color: COLORS[i] }])) satisfies ChartConfig;
  const empty = data.every((r) => series.every((s) => !Number(r[s.key])));
  const multi = series.length > 1;
  const tooltip = <ChartTooltipContent indicator={kind === "line" ? "line" : "dot"} labelFormatter={(_, p) => formatX(String(p?.[0]?.payload?.[xKey] ?? ""))} valueFormatter={format} />;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" title={asTable ? "Show chart" : "Show table"} aria-label={asTable ? "Show chart" : "Show table"} onClick={() => setAsTable((t) => !t)}>
            {asTable ? <BarChart3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" title="Download CSV" aria-label="Download CSV" onClick={() => downloadCsv(filename, xLabel, data, xKey, series, csvFormat)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {asTable ? (
          <div className="max-h-[280px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{xLabel}</TableHead>
                  {series.map((s) => (
                    <TableHead key={s.key} className="text-right">
                      {s.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => (
                  <TableRow key={String(r[xKey])}>
                    <TableCell>{formatX(String(r[xKey]))}</TableCell>
                    {series.map((s) => (
                      <TableCell key={s.key} className="text-right tabular-nums">
                        {format(Number(r[s.key] ?? 0))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : empty ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No activity in this period.</div>
        ) : kind === "bar" ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 8, top: 8 }} maxBarSize={28}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} tickFormatter={formatX} />
              <YAxis tickLine={false} axisLine={false} width={56} allowDecimals={false} tickFormatter={axisFormat} />
              <ChartTooltip cursor={false} content={tooltip} />
              {multi && <ChartLegend content={<ChartLegendContent />} />}
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  stackId="a"
                  fill={`var(--color-${s.key})`}
                  // 2px gap between stacked segments; rounded ends on the top segment only.
                  stroke="hsl(var(--card))"
                  strokeWidth={multi ? 2 : 0}
                  radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <LineChart accessibilityLayer data={data} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} tickFormatter={formatX} />
              <YAxis tickLine={false} axisLine={false} width={56} allowDecimals={false} tickFormatter={axisFormat} />
              <ChartTooltip cursor content={tooltip} />
              {multi && <ChartLegend content={<ChartLegendContent />} />}
              {series.map((s) => (
                <Line key={s.key} dataKey={s.key} type="monotone" stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
