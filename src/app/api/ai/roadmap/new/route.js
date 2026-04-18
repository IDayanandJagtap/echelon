import { json } from "@/app/api/_utils";
import { generateRoadmapPreview } from "@/app/pages/ai/services/roadmaps.server";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await generateRoadmapPreview(body);
    return json({ message: "AI response generated successfully", result });
  } catch (error) {
    return json(
      {
        message: error.message,
        required: ["title", "monthsAllocated", "hoursPerDay", "startDate", "skillLevel"],
      },
      { status: error.message === "Missing required fields" ? 400 : 500 }
    );
  }
}