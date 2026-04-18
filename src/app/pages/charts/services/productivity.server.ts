import { buildLineChartSeries, groupDaysByWeekday } from "@/lib/productivity";

export async function getLineChartProductivityForUser(supabase, userId, startDate, endDate) {
  const { data: days = [], error } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", userId)
    .gte("day_date", startDate)
    .lte("day_date", endDate)
    .order("day_date", { ascending: true });

  if (error) {
    throw error;
  }

  return buildLineChartSeries(days, startDate, endDate);
}

export async function getPieChartProductivityForUser(supabase, userId, startDate, endDate, statusOfDay) {
  let query = supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", userId)
    .gte("day_date", startDate)
    .lte("day_date", endDate)
    .order("day_date", { ascending: true });

  if (statusOfDay !== null && statusOfDay !== undefined && statusOfDay !== "") {
    query = query.eq("status_of_day", Number(statusOfDay));
  }

  const { data: days = [], error } = await query;

  if (error) {
    throw error;
  }

  return groupDaysByWeekday(days, statusOfDay);
}
