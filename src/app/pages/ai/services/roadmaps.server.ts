import { formatDate } from "@/lib/dates";
import { generateAiResponse } from "@/lib/gemini";

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

function normalizeRoadmap(record) {
  return {
    id: record.id,
    userId: record.user_id,
    title: record.title,
    createdBy: record.created_by,
    updatedBy: record.updated_by,
    skillLevel: record.skill_level,
    monthsAllocated: record.months_allocated,
    hoursPerDay: record.hours_per_day,
    plan: record.ai_response || [],
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

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

export async function listRoadmapsForUser(supabase, userId) {
  const { data, error } = await supabase
    .from("ai_roadmaps")
    .select("id, user_id, title, created_by, updated_by, skill_level, months_allocated, hours_per_day, ai_response, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(normalizeRoadmap);
}

export async function getRoadmapForUser(supabase, userId, roadmapId) {
  const { data, error } = await supabase
    .from("ai_roadmaps")
    .select("id, user_id, title, created_by, updated_by, skill_level, months_allocated, hours_per_day, ai_response, created_at, updated_at")
    .eq("user_id", userId)
    .eq("id", roadmapId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeRoadmap(data) : null;
}

export async function confirmRoadmapForUser(supabase, userId, data) {
  const roadmap = data.aiResponse || data.plan;

  if (!Array.isArray(roadmap)) {
    throw new Error("The plan field must be an array");
  }

  const { data: savedAiModel, error } = await supabase
    .from("ai_roadmaps")
    .insert({
      user_id: userId,
      title: data.title,
      created_by: userId,
      updated_by: userId,
      skill_level: Number(data.skillLevel) || 0,
      months_allocated: Number(data.monthsAllocated),
      hours_per_day: Number(data.hoursPerDay),
      ai_response: roadmap,
    })
    .select("id, user_id, title, created_by, updated_by, skill_level, months_allocated, hours_per_day, ai_response, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  await upsertDayTasks(supabase, userId, data.title, roadmap);

  return normalizeRoadmap(savedAiModel);
}

export async function deleteRoadmapForUser(supabase, userId, roadmapId) {
  const { data: roadmap } = await supabase
    .from("ai_roadmaps")
    .select("title")
    .eq("user_id", userId)
    .eq("id", roadmapId)
    .maybeSingle();

  if (!roadmap) {
    return null;
  }

  const { data: tasks = [] } = await supabase
    .from("tasks")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "Ai")
    .eq("sub_category", roadmap.title);

  const taskIds = tasks.map((task) => task.id);

  if (taskIds.length) {
    await supabase.from("day_tasks").delete().in("task_id", taskIds);
    await supabase.from("tasks").delete().in("id", taskIds);
  }

  const { error } = await supabase.from("ai_roadmaps").delete().eq("user_id", userId).eq("id", roadmapId);

  if (error) {
    throw error;
  }

  return roadmap;
}

export async function generateRoadmapPreview(input) {
  const { title, monthsAllocated, hoursPerDay, startDate, skillLevel } = input;

  if (!title || monthsAllocated == null || hoursPerDay == null || !startDate || skillLevel == null) {
    throw new Error("Missing required fields");
  }

  const response = await generateAiResponse({
    skill: title,
    months: Number(monthsAllocated),
    hours: Number(hoursPerDay),
    startDate,
    skillLevel: skillLevels[Number(skillLevel)] || skillLevels[0],
  });

  response.monthsAllocated = Number(monthsAllocated);
  response.hoursPerDay = Number(hoursPerDay);
  response.skillLevel = Number(skillLevel);

  return response;
}

export async function updateRoadmapForUser(supabase, userId, roadmapId, body) {
  const { data, error } = await supabase
    .from("ai_roadmaps")
    .update({
      title: body.title,
      user_id: body.userId || userId,
      created_by: body.createdBy || userId,
      updated_by: body.updatedBy || userId,
      skill_level: body.skillLevel,
      months_allocated: body.monthsAllocated,
      hours_per_day: body.hoursPerDay,
      ai_response: body.aiResponse,
    })
    .eq("id", roadmapId)
    .eq("user_id", userId)
    .select("id, user_id, title, created_by, updated_by, skill_level, months_allocated, hours_per_day, ai_response, created_at, updated_at")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return normalizeRoadmap(data);
}
