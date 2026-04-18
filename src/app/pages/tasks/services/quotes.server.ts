import { getRandomQuote } from "@/lib/quotes";

export async function getQuote() {
  return getRandomQuote();
}
