import { json, getAuthedContext } from "@/app/api/_utils";
import { formatDate } from "@/lib/dates";
import { deriveTaskStatus, deriveDayStatusFromTasks } from "@/lib/productivity";

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

export async function GET(request) {
  const { user, supabase } = await getAuthedContext();
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return json({ success: false, message: "date is required" }, { status: 400 });
  }

  const taskDate = formatDate(date);
  const { data: tasks = [], error } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  const { data: day } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, streak, comment")
    .eq("user_id", user.id)
    .eq("day_date", taskDate)
    .maybeSingle();

  return json({
    success: true,
    result: {
      tasks,
      statusOfDay: day?.status_of_day ?? deriveTaskStatus(tasks),
    },
  });
}

export async function POST(request) {
  const { user, supabase } = await getAuthedContext();
  const body = await request.json();
  const taskDate = formatDate(body.taskDate);

  if (!body.title || !taskDate) {
    return json({ success: false, message: "title and taskDate are required" }, { status: 400 });
  }

  const insertPayload = {
    user_id: user.id,
    title: body.title,
    description: body.description || "",
    status: body.status || "pending",
    category: body.category || null,
    sub_category: body.subCategory || null,
    task_date: taskDate,
    created_by: user.id,
  };

  const { data: task, error } = await supabase
    .from("tasks")
    .insert(insertPayload)
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .single();

  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  const day = await upsertDayFromTasks(supabase, user.id, taskDate, tasks || []);
  await syncDayTaskLink(supabase, day?.id, task.id);

  return json({ success: true, task, day }, { status: 201 });
}

export async function PUT(request) {
  const { user, supabase } = await getAuthedContext();
  const body = await request.json();
  const { taskId, updateData } = body;

  if (!taskId || !updateData) {
    return json({ success: false, message: "taskId and updateData are required" }, { status: 400 });
  }

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
    .eq("user_id", user.id)
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .single();

  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  const taskDate = updatedTask.task_date;
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  await upsertDayFromTasks(supabase, user.id, taskDate, tasks || []);

  return json({ success: true, result: updatedTask });
}

export async function DELETE(request) {
  const { user, supabase } = await getAuthedContext();
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");

  if (!taskId) {
    return json({ success: false, message: "taskId is required" }, { status: 400 });
  }

  const { data: existingTask, error: taskError } = await supabase
    .from("tasks")
    .select("id, task_date")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (taskError) {
    return json({ success: false, message: taskError.message }, { status: 500 });
  }

  if (!existingTask) {
    return json({ success: false, message: "Task not found" }, { status: 404 });
  }

  await supabase.from("day_tasks").delete().eq("task_id", taskId);
  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);

  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("task_date", existingTask.task_date)
    .order("created_at", { ascending: true });

  await upsertDayFromTasks(supabase, user.id, existingTask.task_date, tasks || []);

  return json({ success: true, message: "Task deleted successfully" });
}