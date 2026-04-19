import { getAuthedContext, json } from "@/app/api/_utils";
import {
  createRuleForTemplate,
  deleteRuleForTemplate,
  listRulesForTemplate,
  updateRuleForTemplate,
} from "@/app/pages/templates/services/templates.server";

export async function GET(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const templateId = url.searchParams.get("templateId");

    if (!templateId) {
      return json({ success: false, message: "templateId is required" }, { status: 400 });
    }

    const result = await listRulesForTemplate(supabase, user.id, templateId);
    return json({ success: true, result });
  } catch (error) {
    const status = error.message === "Template not found" ? 404 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();

    if (!body.templateId || !body.title || !body.starLevel) {
      return json({ success: false, message: "templateId, title and starLevel are required" }, { status: 400 });
    }

    const result = await createRuleForTemplate(supabase, user.id, {
      ...body,
      starLevel: Number(body.starLevel),
    });

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

    if (!body.ruleId) {
      return json({ success: false, message: "ruleId is required" }, { status: 400 });
    }

    const result = await updateRuleForTemplate(supabase, user.id, {
      ...body,
      starLevel: body.starLevel !== undefined ? Number(body.starLevel) : undefined,
    });

    return json({ success: true, result });
  } catch (error) {
    const status = error.message === "Rule not found" ? 404 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const url = new URL(request.url);
    const ruleId = url.searchParams.get("ruleId");

    if (!ruleId) {
      return json({ success: false, message: "ruleId is required" }, { status: 400 });
    }

    const result = await deleteRuleForTemplate(supabase, user.id, ruleId);

    if (!result) {
      return json({ success: false, message: "Rule not found" }, { status: 404 });
    }

    return json({ success: true, message: "Rule deleted successfully" });
  } catch (error) {
    const status = error.message === "Rule not found" ? 404 : 500;
    return json({ success: false, message: error.message }, { status });
  }
}
