import { json, getAuthedContext } from "@/app/api/_utils";
import { formatDate } from "@/lib/dates";

export async function GET(request) {
  const { user, supabase } = await getAuthedContext();
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return json({ success: false, message: "date is required" }, { status: 400 });
  }

  const formattedDate = formatDate(date);

  const { data: day, error } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("day_date", formattedDate)
    .maybeSingle();

  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  if (!day) {
    return json({ success: false, message: "Day not found" }, { status: 404 });
  }

  const { data: tasks = [] } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("task_date", formattedDate)
    .order("created_at", { ascending: true });

  return json({ success: true, result: { ...day, tasks } });
}

export async function PUT(request) {
  const { user, supabase } = await getAuthedContext();
  const body = await request.json();
  const date = formatDate(body.date);
  const statusOfDay = Number(body.statusOfDay);

  if (!date || Number.isNaN(statusOfDay)) {
    return json({ success: false, message: "date and statusOfDay are required" }, { status: 400 });
  }

  const payload = {
    user_id: user.id,
    day_date: date,
    status_of_day: statusOfDay,
  };

  const { data: existingDay } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", user.id)
    .eq("day_date", date)
    .maybeSingle();

  const query = existingDay?.id
    ? supabase.from("days").update(payload).eq("id", existingDay.id)
    : supabase.from("days").insert(payload);

  const { data: updatedDay, error } = await query
    .select("id, user_id, day_date, status_of_day, streak, comment, created_at, updated_at")
    .single();

  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  return json({ success: true, result: updatedDay });
}