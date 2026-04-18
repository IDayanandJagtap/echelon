import { json, getAuthedContext } from "@/app/api/_utils";
import { getLineChartProductivityForUser } from "@/app/pages/charts/services/productivity.server";

export async function GET(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return json({ success: false, message: "startDate and endDate are required" }, { status: 400 });
    }

    const result = await getLineChartProductivityForUser(supabase, user.id, startDate, endDate);
    return json({ success: true, result });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}