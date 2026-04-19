import { getAuthedContext, json } from "@/app/api/_utils";
import {
  cloneTemplateForUser,
  createTemplateForUser,
  deleteTemplateForUser,
  listTemplatesForUser,
  updateTemplateForUser,
} from "@/app/pages/templates/services/templates.server";

export async function GET() {
  try {
    const { user, supabase } = await getAuthedContext();
    const result = await listTemplatesForUser(supabase, user.id);
    return json({ success: true, result });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();

    if (body.action === "clone") {
      if (!body.templateId) {
        return json({ success: false, message: "templateId is required" }, { status: 400 });
      }

      const result = await cloneTemplateForUser(supabase, user.id, body.templateId);
      return json({ success: true, result }, { status: 201 });
    }

    if (!body.name) {
      return json({ success: false, message: "name is required" }, { status: 400 });
    }

    const result = await createTemplateForUser(supabase, user.id, body);
    return json({ success: true, result }, { status: 201 });
  } catch (error) {
    const status = error.message === "Template not found" ? 404 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();

    if (!body.templateId) {
      return json({ success: false, message: "templateId is required" }, { status: 400 });
    }

    const result = await updateTemplateForUser(supabase, user.id, body.templateId, body);
    return json({ success: true, result });
  } catch (error) {
    const status = error.message === "Template not found" ? 404 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const templateId = url.searchParams.get("templateId");

    if (!templateId) {
      return json({ success: false, message: "templateId is required" }, { status: 400 });
    }

    const result = await deleteTemplateForUser(supabase, user.id, templateId);

    if (!result) {
      return json({ success: false, message: "Template not found" }, { status: 404 });
    }

    return json({ success: true, message: "Template deleted successfully" });
  } catch (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}
