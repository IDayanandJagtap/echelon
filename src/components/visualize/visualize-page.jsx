"use client";

import { useEffect, useMemo, useState } from "react";
import { CHART_CONSTANTS } from "@/lib/chart-constants";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getStartAndEndDate } from "@/lib/dates";

function LineChart({ labels, values }) {
  const width = 900;
  const height = 280;
  const max = Math.max(4, ...values);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const points = values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / max) * (height - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] w-full">
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" points={`0,${height - 20} ${width},${height - 20}`} />
        <polyline fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
        {values.map((value, index) => {
          const x = index * stepX;
          const y = height - (value / max) * (height - 40) - 20;
          return <circle key={`${labels[index]}-${index}`} cx={x} cy={y} r="5" fill="#fff" />;
        })}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-400 md:grid-cols-4 xl:grid-cols-7">
        {labels.map((label, index) => (
          <div key={label} className="truncate rounded-2xl bg-black/20 px-3 py-2">
            {label}: {values[index]}
          </div>
        ))}
      </div>
    </div>
  );
}

function donutPath(cx, cy, radius, thickness, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const innerStart = polarToCartesian(cx, cy, radius - thickness, endAngle);
  const innerEnd = polarToCartesian(cx, cy, radius - thickness, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${radius - thickness} ${radius - thickness} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function PieChart({ labels, values }) {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  let startAngle = 0;
  const colors = ["#8b5cf6", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444", "#22c55e", "#f97316"];

  return (
    <div className="grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-5 lg:grid-cols-[320px_1fr]">
      <svg viewBox="0 0 260 260" className="mx-auto h-[260px] w-[260px]">
        {values.map((value, index) => {
          const slice = (value / total) * 360;
          const endAngle = startAngle + slice;
          const path = donutPath(130, 130, 110, 48, startAngle, endAngle);
          const color = colors[index % colors.length];
          startAngle = endAngle;
          return <path key={labels[index]} d={path} fill={color} opacity="0.92" />;
        })}
        <circle cx="130" cy="130" r="58" fill="#050816" />
      </svg>

      <div className="grid gap-3 self-center">
        {labels.map((label, index) => (
          <div key={label} className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 text-sm text-zinc-300">
            <span className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              {label}
            </span>
            <span>{values[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisualizePage() {
  const [lineValues, setLineValues] = useState([]);
  const [lineLabels, setLineLabels] = useState([]);
  const [pieValues, setPieValues] = useState([]);
  const [statusFilter, setStatusFilter] = useState(0);
  const [range, setRange] = useState(CHART_CONSTANTS.dataRanges.weekly);
  const [delta, setDelta] = useState(0);
  const [loading, setLoading] = useState(false);

  const pieLabels = CHART_CONSTANTS.weekdaysInShort;
  const lineRangeOptions = CHART_CONSTANTS.lineChartSelectDataRanges;
  const pieRangeOptions = CHART_CONSTANTS.pieChartSelectDataRanges;

  async function loadLineChart(nextRange = range, nextDelta = delta) {
    const { startDate, endDate } = getStartAndEndDate(new Date(), nextRange, nextDelta);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/day/productivity/status/line-chart?startDate=${startDate}&endDate=${endDate}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      const result = data?.result || [];
      setLineLabels(result.map((item) => (String(nextRange).toLowerCase() === "monthly" ? item.date : item.day)));
      setLineValues(result.map((item) => item.status));
    } finally {
      setLoading(false);
    }
  }

  async function loadPieChart(nextRange = range, nextDelta = delta, nextStatus = statusFilter) {
    const { startDate, endDate } = getStartAndEndDate(new Date(), nextRange, nextDelta);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/day/productivity/status/pie-chart?startDate=${startDate}&endDate=${endDate}&statusOfDay=${nextStatus}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      const result = data?.result?.data || {};
      setPieValues(pieLabels.map((label) => result[label.toLowerCase()]?.count || 0));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLineChart();
    loadPieChart();
  }, []);

  return (
    <div className="relative space-y-6">
      {loading ? <LoadingSpinner overlay /> : null}

      <section className="rounded-3xl border border-white/10 bg-[#0b1020]/85 p-5 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Visualize</p>
            <h1 className="mt-2 font-serif text-3xl text-white">Productivity overview</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const next = delta - 1;
                setDelta(next);
                loadLineChart(range, next);
                loadPieChart(range, next, statusFilter);
              }}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <select
              value={range}
              onChange={(event) => {
                const next = event.target.value;
                setRange(next);
                loadLineChart(next, delta);
                loadPieChart(next, delta, statusFilter);
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            >
              {lineRangeOptions.map((item) => (
                <option value={item.value} key={item.value} className="bg-[#0b1020]">
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const next = delta + 1;
                setDelta(next);
                loadLineChart(range, next);
                loadPieChart(range, next, statusFilter);
              }}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1020]/85 p-5 shadow-glow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-white">Productivity status</h2>
          <select
            value={statusFilter}
            onChange={(event) => {
              const next = event.target.value;
              setStatusFilter(next);
              loadPieChart(range, delta, next);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          >
            {CHART_CONSTANTS.productivityLevels.map((label, index) => (
              <option value={index} key={label} className="bg-[#0b1020]">
                {label}
              </option>
            ))}
          </select>
        </div>

        {lineValues.length ? <LineChart labels={lineLabels} values={lineValues} /> : <p className="py-8 text-center text-sm text-zinc-400">No data to display.</p>}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1020]/85 p-5 shadow-glow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-white">Productivity by days</h2>
          <select
            value={range}
            onChange={(event) => {
              const next = event.target.value;
              setRange(next);
              loadPieChart(next, delta, statusFilter);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          >
            {pieRangeOptions.map((item) => (
              <option value={item.value} key={item.value} className="bg-[#0b1020]">
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {pieValues.some((value) => value > 0) ? <PieChart labels={pieLabels} values={pieValues} /> : <p className="py-8 text-center text-sm text-zinc-400">No data to display.</p>}
      </section>
    </div>
  );
}