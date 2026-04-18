import { json, getAuthedContext } from "@/app/api/_utils";
import { listRoadmapsForUser } from "@/app/pages/ai/services/roadmaps.server";

export async function GET(_request, { params }) {
  try {
    const { user, supabase } = await getAuthedContext();

    if (params.userId !== user.id) {
      return json({ message: "Unauthorized" }, { status: 403 });
    }

    const result = await listRoadmapsForUser(supabase, user.id);
    return json({ message: result.length ? "Roadmap(s) retrieved successfully" : "No roadmaps found for this user", result });
  } catch (error) {
    return json({ message: error.message }, { status: 500 });
  }
}