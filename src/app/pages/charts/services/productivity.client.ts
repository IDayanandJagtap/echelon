import { apiRequest } from "@/app/services/http";

export interface LineChartPoint {
  date: string;
  day: string;
  status: number;
}

export interface PieChartBreakdown {
  sun: { count: number };
  mon: { count: number };
  tue: { count: number };
  wed: { count: number };
  thu: { count: number };
  fri: { count: number };
  sat: { count: number };
}

export async function fetchLineChartProductivity(startDate: string, endDate: string) {
  const response = await apiRequest<{ result?: LineChartPoint[] }>(
    `/day/productivity/status/line-chart?startDate=${startDate}&endDate=${endDate}`
  );

  return response.result || [];
}

export async function fetchPieChartProductivity(startDate: string, endDate: string, statusOfDay?: string | number) {
  const statusQuery = statusOfDay !== undefined && statusOfDay !== null && statusOfDay !== ""
    ? `&statusOfDay=${statusOfDay}`
    : "";

  const response = await apiRequest<{ result?: { data?: PieChartBreakdown } }>(
    `/day/productivity/status/pie-chart?startDate=${startDate}&endDate=${endDate}${statusQuery}`
  );

  return response.result?.data || {
    sun: { count: 0 },
    mon: { count: 0 },
    tue: { count: 0 },
    wed: { count: 0 },
    thu: { count: 0 },
    fri: { count: 0 },
    sat: { count: 0 },
  };
}
