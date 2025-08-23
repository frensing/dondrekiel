import { api } from "@/lib/api.ts";

export type Team = {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  locationdate?: string | null;
};

// Simple caching: teams change occasionally; cache for 30s in memory
let cache: { data: Team[]; expiresAt: number } | null = null;
const TTL = 30 * 1000;

function now() {
  return Date.now();
}

export async function fetchTeams(force = false): Promise<Team[]> {
  if (!force && cache && cache.expiresAt > now()) return cache.data;
  const { data } = await api.get<Team[]>("/teams");
  cache = { data, expiresAt: now() + TTL };
  return data;
}
