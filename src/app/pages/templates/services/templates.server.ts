import { formatDate } from "@/lib/dates";

const TEMPLATE_SELECT = "id, user_id, name, description, type, is_active, created_by, updated_by, created_at, updated_at";
const TEMPLATE_RULE_SELECT =
  "id, template_id, star_level, title, description, sort_order, is_active, created_by, updated_by, created_at, updated_at";

type TemplateProgressRow = {
  template_rule_id: string;
  task_id: string | null;
};

type TemplateTaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  source: string;
  category: string | null;
  sub_category: string | null;
  task_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function listTemplatesForUser(supabase, userId) {
  const { data, error } = await supabase
    .from("templates")
    .select(TEMPLATE_SELECT)
    .or(`type.eq.predefined,user_id.eq.${userId}`)
    .order("type", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createTemplateForUser(supabase, userId, payload) {
  const insertPayload = {
    user_id: userId,
    name: payload.name,
    description: payload.description || "",
    type: "customized",
    is_active: Boolean(payload.isActive),
    created_by: userId,
    updated_by: userId,
  };

  if (insertPayload.is_active) {
    await supabase.from("templates").update({ is_active: false, updated_by: userId }).eq("user_id", userId).eq("type", "customized");
  }

  const { data, error } = await supabase.from("templates").insert(insertPayload).select(TEMPLATE_SELECT).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTemplateForUser(supabase, userId, templateId, payload) {
  const { data: existing, error: existingError } = await supabase
    .from("templates")
    .select("id, user_id, type")
    .eq("id", templateId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing || existing.type !== "customized" || existing.user_id !== userId) {
    throw new Error("Template not found");
  }

  if (payload.isActive === true) {
    await supabase.from("templates").update({ is_active: false, updated_by: userId }).eq("user_id", userId).eq("type", "customized");
  }

  const patch = {
    name: payload.name,
    description: payload.description,
    is_active: typeof payload.isActive === "boolean" ? payload.isActive : undefined,
    updated_by: userId,
  };

  Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);

  const { data, error } = await supabase
    .from("templates")
    .update(patch)
    .eq("id", templateId)
    .eq("user_id", userId)
    .eq("type", "customized")
    .select(TEMPLATE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTemplateForUser(supabase, userId, templateId) {
  const { data: existing, error: existingError } = await supabase
    .from("templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", userId)
    .eq("type", "customized")
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing) {
    return null;
  }

  const { error } = await supabase.from("templates").delete().eq("id", templateId).eq("user_id", userId).eq("type", "customized");

  if (error) {
    throw error;
  }

  return existing;
}

export async function setActiveTemplateForUser(supabase, userId, templateId) {
  const { data: existing, error: existingError } = await supabase
    .from("templates")
    .select("id, user_id, type")
    .eq("id", templateId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing || existing.type !== "customized" || existing.user_id !== userId) {
    throw new Error("Template not found");
  }

  await supabase.from("templates").update({ is_active: false, updated_by: userId }).eq("user_id", userId).eq("type", "customized");

  const { data, error } = await supabase
    .from("templates")
    .update({ is_active: true, updated_by: userId })
    .eq("id", templateId)
    .eq("user_id", userId)
    .eq("type", "customized")
    .select(TEMPLATE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function cloneTemplateForUser(supabase, userId, templateId) {
  const { data: existingTemplate, error: templateError } = await supabase
    .from("templates")
    .select(TEMPLATE_SELECT)
    .eq("id", templateId)
    .maybeSingle();

  if (templateError) {
    throw templateError;
  }

  if (!existingTemplate) {
    throw new Error("Template not found");
  }

  const isTemplateAccessible =
    existingTemplate.type === "predefined" || (existingTemplate.type === "customized" && existingTemplate.user_id === userId);

  if (!isTemplateAccessible) {
    throw new Error("Template not found");
  }

  const { data: rules = [], error: rulesError } = await supabase
    .from("template_rules")
    .select(TEMPLATE_RULE_SELECT)
    .eq("template_id", templateId)
    .order("star_level", { ascending: true })
    .order("sort_order", { ascending: true });

  if (rulesError) {
    throw rulesError;
  }

  await supabase.from("templates").update({ is_active: false, updated_by: userId }).eq("user_id", userId).eq("type", "customized");

  const { data: clonedTemplate, error: cloneError } = await supabase
    .from("templates")
    .insert({
      user_id: userId,
      name: `${existingTemplate.name} (Copy)`,
      description: existingTemplate.description || "",
      type: "customized",
      is_active: true,
      created_by: userId,
      updated_by: userId,
    })
    .select(TEMPLATE_SELECT)
    .single();

  if (cloneError) {
    throw cloneError;
  }

  if (rules.length) {
    const insertRules = rules.map((rule) => ({
      template_id: clonedTemplate.id,
      star_level: rule.star_level,
      title: rule.title,
      description: rule.description || "",
      sort_order: rule.sort_order,
      is_active: rule.is_active,
      created_by: userId,
      updated_by: userId,
    }));

    const { error: insertRuleError } = await supabase.from("template_rules").insert(insertRules);

    if (insertRuleError) {
      throw insertRuleError;
    }
  }

  return clonedTemplate;
}

export async function listRulesForTemplate(supabase, userId, templateId) {
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, user_id, type")
    .eq("id", templateId)
    .maybeSingle();

  if (templateError) {
    throw templateError;
  }

  if (!template) {
    throw new Error("Template not found");
  }

  const isTemplateAccessible = template.type === "predefined" || (template.type === "customized" && template.user_id === userId);

  if (!isTemplateAccessible) {
    throw new Error("Template not found");
  }

  const { data, error } = await supabase
    .from("template_rules")
    .select(TEMPLATE_RULE_SELECT)
    .eq("template_id", templateId)
    .order("star_level", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createRuleForTemplate(supabase, userId, payload) {
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, user_id, type")
    .eq("id", payload.templateId)
    .maybeSingle();

  if (templateError) {
    throw templateError;
  }

  if (!template || template.type !== "customized" || template.user_id !== userId) {
    throw new Error("Template not found");
  }

  const { data: maxSortRule } = await supabase
    .from("template_rules")
    .select("sort_order")
    .eq("template_id", payload.templateId)
    .eq("star_level", payload.starLevel)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("template_rules")
    .insert({
      template_id: payload.templateId,
      star_level: payload.starLevel,
      title: payload.title,
      description: payload.description || "",
      sort_order: Number.isFinite(payload.sortOrder) ? payload.sortOrder : (maxSortRule?.sort_order ?? -1) + 1,
      is_active: payload.isActive ?? true,
      created_by: userId,
      updated_by: userId,
    })
    .select(TEMPLATE_RULE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRuleForTemplate(supabase, userId, payload) {
  const { data: rule, error: ruleError } = await supabase
    .from("template_rules")
    .select("id, template_id")
    .eq("id", payload.ruleId)
    .maybeSingle();

  if (ruleError) {
    throw ruleError;
  }

  if (!rule) {
    throw new Error("Rule not found");
  }

  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, user_id, type")
    .eq("id", rule.template_id)
    .maybeSingle();

  if (templateError) {
    throw templateError;
  }

  if (!template || template.type !== "customized" || template.user_id !== userId) {
    throw new Error("Rule not found");
  }

  const patch = {
    star_level: payload.starLevel,
    title: payload.title,
    description: payload.description,
    sort_order: payload.sortOrder,
    is_active: payload.isActive,
    updated_by: userId,
  };

  Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);

  const { data, error } = await supabase
    .from("template_rules")
    .update(patch)
    .eq("id", payload.ruleId)
    .select(TEMPLATE_RULE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteRuleForTemplate(supabase, userId, ruleId) {
  const { data: rule, error: ruleError } = await supabase
    .from("template_rules")
    .select("id, template_id")
    .eq("id", ruleId)
    .maybeSingle();

  if (ruleError) {
    throw ruleError;
  }

  if (!rule) {
    return null;
  }

  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, user_id, type")
    .eq("id", rule.template_id)
    .maybeSingle();

  if (templateError) {
    throw templateError;
  }

  if (!template || template.type !== "customized" || template.user_id !== userId) {
    throw new Error("Rule not found");
  }

  const { error } = await supabase.from("template_rules").delete().eq("id", ruleId);

  if (error) {
    throw error;
  }

  return rule;
}

export async function generateTemplateTasksForDate(supabase, userId, date) {
  const taskDate = formatDate(date);

  const { data: activeTemplate, error: templateError } = await supabase
    .from("templates")
    .select(TEMPLATE_SELECT)
    .eq("user_id", userId)
    .eq("type", "customized")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (templateError) {
    throw templateError;
  }

  if (!activeTemplate) {
    throw new Error("No active template found. Activate a template first.");
  }

  const { data: existingDay, error: dayError } = await supabase
    .from("days")
    .select("id, user_id, day_date, template_id")
    .eq("user_id", userId)
    .eq("day_date", taskDate)
    .maybeSingle();

  if (dayError) {
    throw dayError;
  }

  let day = existingDay;

  if (!existingDay) {
    const { data: insertedDay, error: insertDayError } = await supabase
      .from("days")
      .insert({
        user_id: userId,
        day_date: taskDate,
        status_of_day: 0,
        template_id: activeTemplate.id,
      })
      .select("id, user_id, day_date, template_id")
      .single();

    if (insertDayError) {
      throw insertDayError;
    }

    day = insertedDay;
  } else if (!existingDay.template_id || existingDay.template_id !== activeTemplate.id) {
    const { data: updatedDay, error: updateDayError } = await supabase
      .from("days")
      .update({ template_id: activeTemplate.id })
      .eq("id", existingDay.id)
      .select("id, user_id, day_date, template_id")
      .single();

    if (updateDayError) {
      throw updateDayError;
    }

    day = updatedDay;
  }

  const { data: rules = [], error: ruleError } = await supabase
    .from("template_rules")
    .select(TEMPLATE_RULE_SELECT)
    .eq("template_id", activeTemplate.id)
    .eq("is_active", true)
    .order("star_level", { ascending: true })
    .order("sort_order", { ascending: true });

  if (ruleError) {
    throw ruleError;
  }

  if (!rules.length) {
    return { day, createdTasks: [], createdProgress: [] };
  }

  const { data: progressRows = [], error: progressError } = await supabase
    .from("day_template_rule_progress")
    .select("day_id, template_rule_id, status, task_id")
    .eq("day_id", day.id);

  if (progressError) {
    throw progressError;
  }

  const { data: existingTemplateTasks = [], error: existingTasksError } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .eq("source", "template");

  if (existingTasksError) {
    throw existingTasksError;
  }

  const progressByRule = new Map<string, TemplateProgressRow>((progressRows as TemplateProgressRow[]).map((item) => [item.template_rule_id, item]));
  const tasksById = new Map<string, TemplateTaskRow>((existingTemplateTasks as TemplateTaskRow[]).map((task) => [task.id, task]));

  const createdTasks = [];
  const updatedTasks = [];
  const createdProgress = [];
  const updatedProgress = [];

  for (const rule of rules) {
    const existingProgress = progressByRule.get(rule.id);
    let task = null;

    if (existingProgress?.task_id && tasksById.has(existingProgress.task_id)) {
      const { data: updatedTask, error: updateTaskError } = await supabase
        .from("tasks")
        .update({
          title: rule.title,
          description: rule.description || "",
          status: "pending",
          category: "Template",
          sub_category: `Star ${rule.star_level}`,
          task_date: taskDate,
        })
        .eq("id", existingProgress.task_id)
        .eq("user_id", userId)
        .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
        .single();

      if (updateTaskError) {
        throw updateTaskError;
      }

      task = updatedTask;
      updatedTasks.push(updatedTask);
    } else {
      const { data: insertedTask, error: taskError } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: rule.title,
          description: rule.description || "",
          status: "pending",
          source: "template",
          category: "Template",
          sub_category: `Star ${rule.star_level}`,
          task_date: taskDate,
          created_by: userId,
        })
        .select("id, user_id, title, description, status, source, category, sub_category, task_date, created_by, created_at, updated_at")
        .single();

      if (taskError) {
        throw taskError;
      }

      task = insertedTask;
      createdTasks.push(insertedTask);
    }

    const progressPayload = {
      day_id: day.id,
      template_rule_id: rule.id,
      status: "pending",
      task_id: task.id,
      updated_at: new Date().toISOString(),
    };

    const { data: progress, error: upsertProgressError } = await supabase
      .from("day_template_rule_progress")
      .upsert(progressPayload, { onConflict: "day_id,template_rule_id" })
      .select("day_id, template_rule_id, status, task_id")
      .single();

    if (upsertProgressError) {
      throw upsertProgressError;
    }

    if (existingProgress) {
      updatedProgress.push(progress);
    } else {
      createdProgress.push(progress);
    }

    await supabase.from("day_tasks").upsert({ day_id: day.id, task_id: task.id }, { onConflict: "day_id,task_id" });
  }

  return {
    day,
    createdTasks,
    updatedTasks,
    createdProgress,
    updatedProgress,
  };
}
