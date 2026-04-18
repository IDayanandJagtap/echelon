import { json, getAuthedContext } from "@/app/api/_utils";
import { getPieChartProductivityForUser } from "@/app/pages/charts/services/productivity.server";

export async function GET(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const statusOfDay = url.searchParams.get("statusOfDay");

    if (!startDate || !endDate) {
      return json({ success: false, message: "startDate and endDate are required" }, { status: 400 });
    }

    const data = await getPieChartProductivityForUser(supabase, user.id, startDate, endDate, statusOfDay);
    return json({ success: true, result: { data } });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}