import { api } from "@/lib/api.ts";
import type { Station } from "@/types/Station.ts";

// Simple caching strategy: in-memory + localStorage with TTL
// Since stations rarely change, default TTL is 1 hour.
const CACHE_KEY = "stations_cache_v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let memoryCache: { data: Station[]; expiresAt: number } | null = null;

function now() {
  return Date.now();
}

function readLocalCache(): Station[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: Station[]; expiresAt: number };
    if (parsed && parsed.expiresAt > now() && Array.isArray(parsed.data)) {
      return parsed.data;
    }
  } catch {
    // ignore cache errors
  }
  return null;
}

function writeLocalCache(data: Station[]) {
  try {
    const payload = JSON.stringify({ data, expiresAt: now() + CACHE_TTL_MS });
    localStorage.setItem(CACHE_KEY, payload);
  } catch {
    // ignore quota or serialization errors
  }
}

export async function fetchStations(forceRefresh = false): Promise<Station[]> {
  // Check in-memory cache
  if (!forceRefresh && memoryCache && memoryCache.expiresAt > now()) {
    return memoryCache.data;
  }

  // Check localStorage cache
  if (!forceRefresh) {
    const cached = readLocalCache();
    if (cached) {
      // hydrate memory cache for quick future access
      memoryCache = { data: cached, expiresAt: now() + 5 * 60 * 1000 };
      return cached;
    }
  }

  // Fetch from API
  const { data } = await api.get<Station[]>("/stations");

  // Update caches
  memoryCache = { data, expiresAt: now() + CACHE_TTL_MS };
  writeLocalCache(data);

  return data;
}
