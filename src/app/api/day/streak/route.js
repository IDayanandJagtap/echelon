import { json, getAuthedContext } from "@/app/api/_utils";

export async function GET() {
  const { user, supabase } = await getAuthedContext();
  const today = new Date().toISOString().split("T")[0];

  const { data: day } = await supabase
    .from("days")
    .select("streak")
    .eq("user_id", user.id)
    .eq("day_date", today)
    .maybeSingle();

  return json({ success: true, result: { streak: day?.streak || 0 } });
}