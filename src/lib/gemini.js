import { GoogleGenerativeAI } from "@google/generative-ai";

function cleanJson(text) {
  return text.replace(/```json\n?|```/g, "").trim();
}

export async function generateAiResponse({ skill, months, hours, startDate, skillLevel }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `I want to learn ${skillLevel} ${skill} in ${months} months. I can dedicate ${hours} hours per day. Starting from ${startDate}, is this goal achievable? Provide a precise plan, with deterministic tasks.
Tasks should be based on number of hours provided per day.
Respond with:
  - A key "isFeasible" with a value of true or false.
  - A "reason" explaining why it is or isn't feasible.
  - If not feasible, provide "estimatedMonths" – the minimum number of months required.
  - If feasible, generate a daily learning plan (excluding weekends) starting from ${startDate} under key "plan", showing what tasks I need to complete each day.
  - Response format should be a JSON object like:
  {
    "isFeasible": boolean,
    "reason": string,
    "title": string,
    "plan": [
      {
        "date": string,
        "topic": string,
        "tasks": string[]
      }
    ]
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const textContent = response.text() || "";
  const parsedResponse = JSON.parse(cleanJson(textContent));

  if (Array.isArray(parsedResponse.plan)) {
    parsedResponse.plan = parsedResponse.plan.map((entry) => ({
      ...entry,
      date: new Date(entry.date).toISOString().split("T")[0],
    }));
  }

  return parsedResponse;
}