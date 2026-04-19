import { json, getAuthedContext } from "@/app/api/_utils";
import {
  createTaskForUser,
  deleteTaskForUser,
  listTasksForUserDate,
  updateTaskForUser,
} from "@/app/pages/tasks/services/tasks.server";

export async function GET(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    if (!date) {
      return json({ success: false, message: "date is required" }, { status: 400 });
    }

    const result = await listTasksForUserDate(supabase, user.id, date);
    return json({ success: true, result });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();

    if (!body.title || !body.taskDate) {
      return json({ success: false, message: "title and taskDate are required" }, { status: 400 });
    }

    const result = await createTaskForUser(supabase, user.id, body);
    return json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();
    const { taskId, updateData } = body;

    if (!taskId || !updateData) {
      return json({ success: false, message: "taskId and updateData are required" }, { status: 400 });
    }

    const result = await updateTaskForUser(supabase, user.id, taskId, updateData);
    return json({ success: true, result });
  } catch (error) {
    const status = error.message === "Task not found" ? 404 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return json({ success: false, message: "taskId is required" }, { status: 400 });
    }

    const result = await deleteTaskForUser(supabase, user.id, taskId);

    if (!result) {
      return json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    const status =
      error.message === "Template tasks cannot be deleted"
        ? 400
        : error.message === "Task not found"
        ? 404
        : 500;
    return json({ success: false, message: error.message }, { status });
  }
}