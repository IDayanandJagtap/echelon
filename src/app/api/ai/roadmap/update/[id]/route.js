import { json, getAuthedContext } from "@/app/api/_utils";

export async function PUT(request, { params }) {
  const { user, supabase } = await getAuthedContext();
  const body = await request.json();

  const { data, error } = await supabase
    .from("ai_roadmaps")
    .update({
      title: body.title,
      user_id: body.userId || user.id,
      created_by: body.createdBy || user.id,
      updated_by: body.updatedBy || user.id,
      skill_level: body.skillLevel,
      months_allocated: body.monthsAllocated,
      hours_per_day: body.hoursPerDay,
      ai_response: body.aiResponse,
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id, user_id, title, created_by, updated_by, skill_level, months_allocated, hours_per_day, ai_response, created_at, updated_at")
    .maybeSingle();

  if (error) {
    return json({ message: "Error updating AI", error: error.message }, { status: 500 });
  }

  if (!data) {
    return json({ message: "AI not found" }, { status: 404 });
  }

  return json({ message: "AI updated successfully", data });
}