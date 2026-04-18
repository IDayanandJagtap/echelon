import { json, getAuthedContext } from "@/app/api/_utils";

export async function DELETE(_request, { params }) {
  const { user, supabase } = await getAuthedContext();

  if (params.userId !== user.id) {
    return json({ message: "Unauthorized" }, { status: 403 });
  }

  const { data: roadmap } = await supabase
    .from("ai_roadmaps")
    .select("title")
    .eq("user_id", user.id)
    .eq("id", params.roadmapId)
    .maybeSingle();

  if (!roadmap) {
    return json({ message: "AI plan not found" }, { status: 404 });
  }

  const { data: tasks = [] } = await supabase
    .from("tasks")
    .select("id")
    .eq("user_id", user.id)
    .eq("category", "Ai")
    .eq("sub_category", roadmap.title);

  const taskIds = tasks.map((task) => task.id);

  if (taskIds.length) {
    await supabase.from("day_tasks").delete().in("task_id", taskIds);
    await supabase.from("tasks").delete().in("id", taskIds);
  }

  const { error } = await supabase.from("ai_roadmaps").delete().eq("user_id", user.id).eq("id", params.roadmapId);

  if (error) {
    return json({ message: "Error deleting AI", error: error.message }, { status: 500 });
  }

  return json({ message: "AI plan and associated data deleted successfully" });
}