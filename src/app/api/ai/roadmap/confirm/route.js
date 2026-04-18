import { json, getAuthedContext } from "@/app/api/_utils";
import { formatDate } from "@/lib/dates";

async function upsertDayTasks(supabase, userId, roadmapTitle, roadmapSteps) {
  for (const step of roadmapSteps) {
    const taskIds = [];

    for (const taskTitle of step.tasks || []) {
      const { data: task, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: taskTitle,
          description: step.topic || "",
          status: "pending",
          category: "Ai",
          sub_category: roadmapTitle,
          task_date: formatDate(step.date),
          created_by: userId,
        })
        .select("id")
        .single();

      if (!error && task?.id) {
        taskIds.push(task.id);
      }
    }

    const { data: day } = await supabase
      .from("days")
      .select("id")
      .eq("user_id", userId)
      .eq("day_date", formatDate(step.date))
      .maybeSingle();

    const dayRecord = day
      ? day
      : (
          await supabase
            .from("days")
            .insert({ user_id: userId, day_date: formatDate(step.date), status_of_day: 0 })
            .select("id")
            .single()
        ).data;

    if (dayRecord?.id && taskIds.length) {
      await supabase.from("day_tasks").upsert(
        taskIds.map((taskId) => ({ day_id: dayRecord.id, task_id: taskId })),
        { onConflict: "day_id,task_id" }
      );
    }
  }
}

export async function POST(request) {
  const { user, supabase } = await getAuthedContext();
  const body = await request.json();
  const { data } = body;

  if (!data) {
    return json({ message: "Missing required fields", required: ["userId", "data"] }, { status: 400 });
  }

  const roadmap = data.aiResponse || data.plan;

  if (!Array.isArray(roadmap)) {
    return json({ message: "Invalid AI response format", details: "The plan field must be an array" }, { status: 400 });
  }

  const { data: savedAiModel, error } = await supabase
    .from("ai_roadmaps")
    .insert({
      user_id: user.id,
      title: data.title,
      created_by: user.id,
      updated_by: user.id,
      skill_level: Number(data.skillLevel) || 0,
      months_allocated: Number(data.monthsAllocated),
      hours_per_day: Number(data.hoursPerDay),
      ai_response: roadmap,
    })
    .select("id, user_id, title, created_by, updated_by, skill_level, months_allocated, hours_per_day, ai_response, created_at, updated_at")
    .single();

  if (error) {
    return json({ message: "Error confirming roadmap", error: error.message }, { status: 500 });
  }

  await upsertDayTasks(supabase, user.id, data.title, roadmap);

  return json({ message: "Roadmap confirmed and tasks saved successfully", result: savedAiModel }, { status: 201 });
}