import { getAuthedContext, json } from "@/app/api/_utils";
import { generateTemplateTasksForDate } from "@/app/pages/templates/services/templates.server";

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();

    if (!body.date) {
      return json({ success: false, message: "date is required" }, { status: 400 });
    }

    const result = await generateTemplateTasksForDate(supabase, user.id, body.date);
    return json({ success: true, result });
  } catch (error) {
    const status = error.message.includes("No active template") ? 400 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}
