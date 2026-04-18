import { json, getAuthedContext } from "@/app/api/_utils";
import { buildLineChartSeries } from "@/lib/productivity";

export async function GET(request) {
  const { user, supabase } = await getAuthedContext();
  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  if (!startDate || !endDate) {
    return json({ success: false, message: "startDate and endDate are required" }, { status: 400 });
  }

  const { data: days = [], error } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", user.id)
    .gte("day_date", startDate)
    .lte("day_date", endDate)
    .order("day_date", { ascending: true });

  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  return json({ success: true, result: buildLineChartSeries(days, startDate, endDate) });
}