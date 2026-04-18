import { json, getAuthedContext } from "@/app/api/_utils";
import { getTodayStreakForUser } from "@/app/pages/tasks/services/day.server";

export async function GET() {
  try {
    const { user, supabase } = await getAuthedContext();
    const streak = await getTodayStreakForUser(supabase, user.id);
    return json({ success: true, result: { streak } });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}