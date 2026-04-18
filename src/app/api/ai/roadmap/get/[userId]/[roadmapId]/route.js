import { json, getAuthedContext } from "@/app/api/_utils";
import { getRoadmapForUser } from "@/app/pages/ai/services/roadmaps.server";

export async function GET(_request, { params }) {
  try {
    const { user, supabase } = await getAuthedContext();

    if (params.userId !== user.id) {
      return json({ message: "Unauthorized" }, { status: 403 });
    }

    const result = await getRoadmapForUser(supabase, user.id, params.roadmapId);

    if (!result) {
      return json({ message: "Roadmap not found" }, { status: 404 });
    }

    return json({ message: "Roadmap(s) retrieved successfully", result: [result] });
  } catch (error) {
    return json({ message: error.message }, { status: 500 });
  }
}