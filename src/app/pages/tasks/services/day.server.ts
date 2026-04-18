import { formatDate } from "@/lib/dates";

export async function getDayWithTasksForUser(supabase, userId, date) {
  const formattedDate = formatDate(date);

  const { data: day, error } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment, created_at, updated_at")
    .eq("user_id", userId)
    .eq("day_date", formattedDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!day) {
    return null;
  }

  const { data: tasks = [] } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", formattedDate)
    .order("created_at", { ascending: true });

  return { ...day, tasks };
}

export async function getTodayStreakForUser(supabase, userId) {
  const today = new Date().toISOString().split("T")[0];

  const { data: day } = await supabase
    .from("days")
    .select("streak")
    .eq("user_id", userId)
    .eq("day_date", today)
    .maybeSingle();

  return day?.streak || 0;
}
