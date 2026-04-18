import { json, getAuthedContext } from "@/app/api/_utils";
import { deleteRoadmapForUser } from "@/app/pages/ai/services/roadmaps.server";

export async function DELETE(_request, { params }) {
  try {
    const { user, supabase } = await getAuthedContext();

    if (params.userId !== user.id) {
      return json({ message: "Unauthorized" }, { status: 403 });
    }

    const result = await deleteRoadmapForUser(supabase, user.id, params.roadmapId);

    if (!result) {
      return json({ message: "AI plan not found" }, { status: 404 });
    }

    return json({ message: "AI plan and associated data deleted successfully" });
  } catch (error) {
    return json({ message: error.message, error: error.message }, { status: 500 });
  }
}