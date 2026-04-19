import { formatDate } from "@/lib/dates";
import { apiRequest } from "@/app/services/http";

export interface TaskRecord {
  id: string;
  user_id?: string | null;
  title: string;
  description: string;
  status: string;
  source?: "direct" | "template";
  category: string | null;
  sub_category: string | null;
  template_rule_id?: string | null;
  template_rule_title?: string | null;
  template_star_level?: number | null;
  template_name?: string | null;
  task_date: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TaskListResult {
  tasks: TaskRecord[];
  directTasks?: TaskRecord[];
  templateTasks?: TaskRecord[];
  hasActiveTemplate?: boolean;
  starRating?: number;
  statusOfDay: number;
}

export interface TaskListResponse {
  success: boolean;
  result?: TaskListResult;
}

export interface TaskCreateInput {
  title: string;
  description: string;
  category: string;
  taskDate: string | Date;
  status?: string;
  subCategory?: string;
  source?: "direct" | "template";
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  subCategory?: string;
  taskDate?: string | Date;
}

function normalizeTaskDate(value: string | Date) {
  return formatDate(value);
}

export async function fetchTasksForDate(date: string | Date, userId: string) {
  const formattedDate = normalizeTaskDate(date);
  const response = await apiRequest<TaskListResponse>(`/tasks?date=${formattedDate}&userId=${userId}`);

  return {
    tasks: response.result?.tasks || [],
    directTasks: response.result?.directTasks || [],
    templateTasks: response.result?.templateTasks || [],
    hasActiveTemplate: response.result?.hasActiveTemplate ?? false,
    starRating: response.result?.starRating ?? 0,
    statusOfDay: response.result?.statusOfDay ?? 0,
  };
}

export async function createTask(input: TaskCreateInput) {
  const payload = {
    ...input,
    taskDate: normalizeTaskDate(input.taskDate),
  };

  return apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTask(taskId: string, updateData: TaskUpdateInput) {
  const payload = {
    taskId,
    updateData: {
      ...updateData,
      taskDate: updateData.taskDate ? normalizeTaskDate(updateData.taskDate) : undefined,
    },
  };

  return apiRequest("/tasks", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(taskId: string) {
  return apiRequest(`/tasks?taskId=${taskId}`, {
    method: "DELETE",
  });
}

export async function updateDayStatus(date: string | Date, statusOfDay: string | number) {
  return apiRequest("/day", {
    method: "PUT",
    body: JSON.stringify({
      date: normalizeTaskDate(date),
      statusOfDay,
    }),
  });
}

export async function generateTemplateTasks(date: string | Date) {
  return apiRequest("/templates/generate", {
    method: "POST",
    body: JSON.stringify({
      date: normalizeTaskDate(date),
    }),
  });
}
