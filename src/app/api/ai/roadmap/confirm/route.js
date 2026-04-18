import { json, getAuthedContext } from "@/app/api/_utils";
import { confirmRoadmapForUser } from "@/app/pages/ai/services/roadmaps.server";

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return json({ message: "Missing required fields", required: ["userId", "data"] }, { status: 400 });
    }

    const result = await confirmRoadmapForUser(supabase, user.id, data);
    return json({ message: "Roadmap confirmed and tasks saved successfully", result }, { status: 201 });
  } catch (error) {
    const status = error.message === "The plan field must be an array" ? 400 : 500;
    return json({ message: error.message, details: error.message }, { status });
  }
}