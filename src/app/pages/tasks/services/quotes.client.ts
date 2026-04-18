import { apiRequest } from "@/app/services/http";

interface QuoteResponse {
  quote?: string | null;
}

export async function fetchRandomQuote() {
  const response = await apiRequest<QuoteResponse>("/quote");
  return response.quote || "";
}
