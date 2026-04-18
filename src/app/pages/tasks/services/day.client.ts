import { apiRequest } from "@/app/services/http";

interface StreakResponse {
  result?: {
    streak?: number;
  };
}

export async function fetchTodayStreak() {
  const response = await apiRequest<StreakResponse>("/day/streak");
  return response.result?.streak || 0;
}
