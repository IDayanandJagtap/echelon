import { json, getAuthedContext } from "@/app/api/_utils";
import { generateAiResponse } from "@/lib/gemini";

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export async function POST(request) {
  await getAuthedContext();
  const body = await request.json();
  const { title, monthsAllocated, hoursPerDay, startDate, skillLevel } = body;

  if (!title || monthsAllocated == null || hoursPerDay == null || !startDate || skillLevel == null) {
    return json(
      {
        message: "Missing required fields",
        required: ["title", "monthsAllocated", "hoursPerDay", "startDate", "skillLevel"],
      },
      { status: 400 }
    );
  }

  const response = await generateAiResponse({
    skill: title,
    months: Number(monthsAllocated),
    hours: Number(hoursPerDay),
    startDate,
    skillLevel: skillLevels[Number(skillLevel)] || skillLevels[0],
  });

  response.monthsAllocated = Number(monthsAllocated);
  response.hoursPerDay = Number(hoursPerDay);
  response.skillLevel = Number(skillLevel);

  return json({ message: "AI response generated successfully", result: response });
}