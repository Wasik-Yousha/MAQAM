import { apiGet, apiPost } from './client';

export interface ApiStreak {
  current_streak: number;
  longest_streak: number;
  last_read_date: string;
}

interface StreakResponse {
  streak: ApiStreak;
}

export async function fetchStreaks(): Promise<ApiStreak> {
  const data = await apiGet<StreakResponse>('/streaks');
  return data.streak;
}

export async function updateStreak(): Promise<ApiStreak> {
  const data = await apiPost<StreakResponse>('/streaks/update');
  return data.streak;
}
