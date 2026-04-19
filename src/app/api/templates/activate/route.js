import { getAuthedContext, json } from "@/app/api/_utils";
import { setActiveTemplateForUser } from "@/app/pages/templates/services/templates.server";

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();

    if (!body.templateId) {
      return json({ success: false, message: "templateId is required" }, { status: 400 });
    }

    const result = await setActiveTemplateForUser(supabase, user.id, body.templateId);
    return json({ success: true, result });
  } catch (error) {
    const status = error.message === "Template not found" ? 404 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}
