import { json, getAuthedContext } from "@/app/api/_utils";
import { getDayWithTasksForUser } from "@/app/pages/tasks/services/day.server";
import { updateDayStatusForUser } from "@/app/pages/tasks/services/tasks.server";

export async function GET(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    if (!date) {
      return json({ success: false, message: "date is required" }, { status: 400 });
    }

    const result = await getDayWithTasksForUser(supabase, user.id, date);

    if (!result) {
      return json({ success: false, message: "Day not found" }, { status: 404 });
    }

    return json({ success: true, result });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();
    const result = await updateDayStatusForUser(supabase, user.id, body.date, body.statusOfDay);
    return json({ success: true, result });
  } catch (error) {
    const status = error.message === "date and statusOfDay are required" ? 400 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}