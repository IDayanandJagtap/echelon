import { json } from "@/app/api/_utils";
import { getQuote } from "@/app/pages/tasks/services/quotes.server";

export async function GET() {
  const quote = await getQuote();
  return json({ quote });
}