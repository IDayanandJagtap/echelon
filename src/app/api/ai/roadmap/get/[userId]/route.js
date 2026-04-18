import { json, getAuthedContext } from "@/app/api/_utils";

export async function GET(_request, { params }) {
  const { user, supabase } = await getAuthedContext();

  if (params.userId !== user.id) {
    return json({ message: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("ai_roadmaps")
    .select("id, user_id, title, created_by, updated_by, skill_level, months_allocated, hours_per_day, ai_response, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return json({ message: error.message }, { status: 500 });
  }

  return json({ message: data.length ? "Roadmap(s) retrieved successfully" : "No roadmaps found for this user", result: data });
}