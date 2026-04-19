import { formatDate } from "@/lib/dates";
import { deriveDayStatusFromTasks, deriveTaskStatus } from "@/lib/productivity";

async function getDayRecord(supabase, userId, taskDate) {
  const { data } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, star_rating, template_id, streak, comment")
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
      .select("id, user_id, day_date, status_of_day, star_rating, template_id, streak, comment")
      .single();

    return data;
  }

  const { data } = await supabase
    .from("days")
    .insert(payload)
    .select("id, user_id, day_date, status_of_day, star_rating, template_id, streak, comment")
    .single();

  return data;
}

async function enrichTemplateTaskMeta(supabase, dayId, tasks) {
  if (!dayId || !tasks?.length) {
    return tasks || [];
  }

  const templateTaskIds = tasks.filter((task) => task.source === "template").map((task) => task.id);

  if (!templateTaskIds.length) {
    return tasks;
  }

  const { data: ruleProgressRows = [] } = await supabase
    .from("day_template_rule_progress")
    .select("task_id, template_rule_id, template_rules(title, star_level, template_id, templates(name))")
    .eq("day_id", dayId)
    .in("task_id", templateTaskIds);

  const progressMap = new Map();
  (ruleProgressRows || []).forEach((row) => {
    if (!row.task_id || progressMap.has(row.task_id)) {
      return;
    }

    progressMap.set(row.task_id, {
      template_rule_id: row.template_rule_id,
      template_rule_title: row.template_rules?.title || null,
      template_star_level: row.template_rules?.star_level ?? null,
      template_name: row.template_rules?.templates?.name || null,
    });
  });

  return tasks.map((task) => ({
    ...task,
    ...(progressMap.get(task.id) || {
      template_rule_id: null,
      template_rule_title: null,
      template_star_level: null,
      template_name: null,
    }),
  }));
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

async function recalculateStarRatingForDay(supabase, dayId) {
  if (!dayId) {
    return 0;
  }

  const { data: progressRows = [], error } = await supabase
    .from("day_template_rule_progress")
    .select("status, template_rules(star_level)")
    .eq("day_id", dayId);

  if (error) {
    throw error;
  }

  const progressByStar = new Map();

  for (const row of progressRows || []) {
    const starLevel = row.template_rules?.star_level;
    if (!starLevel) {
      continue;
    }

    const entry = progressByStar.get(starLevel) || { total: 0, done: 0 };
    entry.total += 1;
    if (row.status === "done") {
      entry.done += 1;
    }
    progressByStar.set(starLevel, entry);
  }

  let starRating = 0;
  for (let starLevel = 1; starLevel <= 5; starLevel += 1) {
    const starProgress = progressByStar.get(starLevel);
    if (!starProgress || starProgress.total === 0 || starProgress.done !== starProgress.total) {
      break;
    }

    starRating = starLevel;
  }

  return starRating;
}

async function updateDayStarRating(supabase, dayId, userId, dayDate) {
  const starRating = await recalculateStarRatingForDay(supabase, dayId);

  const { data, error } = await supabase
    .from("days")
    .update({ star_rating: starRating })
    .eq("id", dayId)
    .eq("user_id", userId)
    .select("id, user_id, day_date, status_of_day, star_rating, template_id, streak, comment")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listTasksForUserDate(supabase, userId, date) {
  const taskDate = formatDate(date);
  const { data: tasks = [], error } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const { data: day } = await supabase
    .from("days")
    .select("id, user_id, day_date, status_of_day, star_rating, template_id, streak, comment")
    .eq("user_id", userId)
    .eq("day_date", taskDate)
    .maybeSingle();

  const { data: activeTemplate } = await supabase
    .from("templates")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "customized")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const enrichedTasks = await enrichTemplateTaskMeta(supabase, day?.id, tasks || []);
  const directTasks = enrichedTasks.filter((task) => task.source !== "template");
  const templateTasks = enrichedTasks.filter((task) => task.source === "template");

  return {
    tasks: enrichedTasks,
    directTasks,
    templateTasks,
    hasActiveTemplate: Boolean(activeTemplate?.id),
    starRating: day?.star_rating ?? 0,
    statusOfDay: day?.status_of_day ?? deriveTaskStatus(enrichedTasks),
  };
}

export async function createTaskForUser(supabase, userId, body) {
  const taskDate = formatDate(body.taskDate);
  const insertPayload = {
    user_id: userId,
    title: body.title,
    description: body.description || "",
    status: body.status || "pending",
    source: body.source || "direct",
    category: body.category || null,
    sub_category: body.subCategory || null,
    task_date: taskDate,
    created_by: userId,
  };

  const { data: task, error } = await supabase
    .from("tasks")
    .insert(insertPayload)
    .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  const day = await upsertDayFromTasks(supabase, userId, taskDate, tasks || []);
  await syncDayTaskLink(supabase, day?.id, task.id);

  return { task, day };
}

export async function updateTaskForUser(supabase, userId, taskId, updateData) {
  const { data: existingTask, error: existingTaskError } = await supabase
    .from("tasks")
    .select("id, user_id, source, task_date")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingTaskError) {
    throw existingTaskError;
  }

  if (!existingTask) {
    throw new Error("Task not found");
  }

  const isTemplateTask = existingTask.source === "template";

  const patch = {
    title: isTemplateTask ? undefined : updateData.title,
    description: isTemplateTask ? undefined : updateData.description,
    status: updateData.status,
    category: isTemplateTask ? undefined : updateData.category,
    sub_category: isTemplateTask ? undefined : updateData.subCategory,
    task_date: isTemplateTask ? undefined : (updateData.taskDate ? formatDate(updateData.taskDate) : undefined),
  };

  Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);

  const { data: updatedTask, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  if (isTemplateTask) {
    const { data: dayRecord, error: dayError } = await supabase
      .from("days")
      .select("id")
      .eq("user_id", userId)
      .eq("day_date", updatedTask.task_date)
      .maybeSingle();

    if (dayError) {
      throw dayError;
    }

    if (dayRecord?.id) {
      const { data: linkedProgress, error: progressLookupError } = await supabase
        .from("day_template_rule_progress")
        .select("day_id, template_rule_id")
        .eq("day_id", dayRecord.id)
        .eq("task_id", taskId)
        .maybeSingle();

      if (progressLookupError) {
        throw progressLookupError;
      }

      if (linkedProgress?.template_rule_id) {
        const { error: progressUpdateError } = await supabase
          .from("day_template_rule_progress")
          .update({
            status: updatedTask.status,
            updated_at: new Date().toISOString(),
          })
          .eq("day_id", dayRecord.id)
          .eq("template_rule_id", linkedProgress.template_rule_id);

        if (progressUpdateError) {
          throw progressUpdateError;
        }
      }
    }
  }

  const taskDate = updatedTask.task_date;
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: true });

  await upsertDayFromTasks(supabase, userId, taskDate, tasks || []);

  if (isTemplateTask) {
    const { data: dayRecord, error: dayError } = await supabase
      .from("days")
      .select("id")
      .eq("user_id", userId)
      .eq("day_date", taskDate)
      .maybeSingle();

    if (dayError) {
      throw dayError;
    }

    if (dayRecord?.id) {
      await updateDayStarRating(supabase, dayRecord.id, userId, taskDate);
    }
  }

  return updatedTask;
}

export async function deleteTaskForUser(supabase, userId, taskId) {
  const { data: existingTask, error: taskError } = await supabase
    .from("tasks")
    .select("id, task_date, source")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (taskError) {
    throw taskError;
  }

  if (!existingTask) {
    return null;
  }

  if (existingTask.source === "template") {
    throw new Error("Template tasks cannot be deleted");
  }

  await supabase.from("day_tasks").delete().eq("task_id", taskId);
  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId);

  if (error) {
    throw error;
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
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
