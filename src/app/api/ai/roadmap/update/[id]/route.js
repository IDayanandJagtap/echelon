import { json, getAuthedContext } from "@/app/api/_utils";
import { updateRoadmapForUser } from "@/app/pages/ai/services/roadmaps.server";

export async function PUT(request, { params }) {
  try {
    const { user, supabase } = await getAuthedContext();
    const body = await request.json();
    const data = await updateRoadmapForUser(supabase, user.id, params.id, body);

    if (!data) {
      return json({ message: "AI not found" }, { status: 404 });
    }

    return json({ message: "AI updated successfully", data });
  } catch (error) {
    return json({ message: "Error updating AI", error: error.message }, { status: 500 });
  }
}