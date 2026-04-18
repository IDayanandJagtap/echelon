import { json } from "@/app/api/_utils";
import { getRandomQuote } from "@/lib/quotes";

export async function GET() {
  const quote = await getRandomQuote();
  return json({ quote });
}