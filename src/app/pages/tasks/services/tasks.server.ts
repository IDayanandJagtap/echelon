import { formatDate } from "@/lib/dates";
import { deriveDayStatusFromTasks, deriveTaskStatus } from "@/lib/productivity";

async function getDayRecord(supabase, userId, taskDate) {
  const { data } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", userId)
    .eq("day_date", taskDate)
    .maybeSingle();

  return data;
}

async function upsertDayFromTasks(supabase, userId, taskDate, tasks) {
  const statusOfDay = deriveDayStatusFromTasks(tasks);
  const existingDay = await getDayRecord(supabase, userId, taskDate);
  const payload = {
    user_id: userId,
    day_date: taskDate,
    status_of_day: statusOfDay,
  };

  if (existingDay?.id) {
    const { data } = await supabase
      .from("days")
      .update(payload)
      .eq("id", existingDay.id)
      .select("id, user_id, day_date, status_of_day, streak, comment")
      .single();

    return data;
  }

  const { data } = await supabase
    .from("days")
    .insert(payload)
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .single();

  return data;
}

async function syncDayTaskLink(supabase, dayId, taskId) {
  if (!dayId || !taskId) {
    return;
  }

  await supabase.from("day_tasks").upsert(
    {
      day_id: dayId,
      task_id: taskId,
    },
    { onConflict: "day_id,task_id" }
  );
}

export async function listTasksForUserDate(supabase, userId, date) {
  const taskDate = formatDate(date);
  const { data: tasks = [], error } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const { data: day } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", userId)
    .eq("day_date", taskDate)
    .maybeSingle();

  return {
    tasks,
    statusOfDay: day?.status_of_day ?? deriveTaskStatus(tasks),
  };
}

export async function createTaskForUser(supabase, userId, body) {
  const taskDate = formatDate(body.taskDate);
  const insertPayload = {
    user_id: userId,
    title: body.title,
    description: body.description || "",
    status: body.status || "pending",
    category: body.category || null,
    sub_category: body.subCategory || null,
    task_date: taskDate,
    created_by: userId,
  };

  const { data: task, error } = await supabase
    .from("tasks")
    .insert(insertPayload)
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  const day = await upsertDayFromTasks(supabase, userId, taskDate, tasks || []);
  await syncDayTaskLink(supabase, day?.id, task.id);

  return { task, day };
}

export async function updateTaskForUser(supabase, userId, taskId, updateData) {
  const patch = {
    title: updateData.title,
    description: updateData.description,
    status: updateData.status,
    category: updateData.category,
    sub_category: updateData.subCategory,
    task_date: updateData.taskDate ? formatDate(updateData.taskDate) : undefined,
  };

  Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);

  const { data: updatedTask, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  const taskDate = updatedTask.task_date;
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  await upsertDayFromTasks(supabase, userId, taskDate, tasks || []);

  return updatedTask;
}

export async function deleteTaskForUser(supabase, userId, taskId) {
  const { data: existingTask, error: taskError } = await supabase
    .from("tasks")
    .select("id, task_date")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (taskError) {
    throw taskError;
  }

  if (!existingTask) {
    return null;
  }

  await supabase.from("day_tasks").delete().eq("task_id", taskId);
  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId);

  if (error) {
    throw error;
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", existingTask.task_date)
    .order("created_at", { ascending: true });

  await upsertDayFromTasks(supabase, userId, existingTask.task_date, tasks || []);

  return existingTask;
}

export async function updateDayStatusForUser(supabase, userId, date, statusOfDay) {
  const formattedDate = formatDate(date);
  const numericStatus = Number(statusOfDay);

  if (!formattedDate || Number.isNaN(numericStatus)) {
    throw new Error("date and statusOfDay are required");
  }

  const payload = {
    user_id: userId,
    day_date: formattedDate,
    status_of_day: numericStatus,
  };

  const { data: existingDay } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", userId)
    .eq("day_date", formattedDate)
    .maybeSingle();

  const query = existingDay?.id
    ? supabase.from("days").update(payload).eq("id", existingDay.id)
    : supabase.from("days").insert(payload);

  const { data: updatedDay, error } = await query
    .select("id, user_id, day_date, status_of_day, streak, comment, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return updatedDay;
}
