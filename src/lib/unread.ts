import { useAuth } from "@/context/AuthContext.tsx";

// Utilities to track last-read timestamp for messages per team in localStorage
const KEY_PREFIX = "messages_last_read_at";

function keyForTeam(teamName: string | null): string {
  return teamName ? `${KEY_PREFIX}:${teamName}` : KEY_PREFIX;
}

export function getLastReadAt(teamName: string | null): number {
  try {
    const raw = localStorage.getItem(keyForTeam(teamName));
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function setLastReadNow(teamName: string | null): void {
  try {
    localStorage.setItem(keyForTeam(teamName), String(Date.now()));
  } catch {
    // ignore
  }
}

// React hook to access teamName and expose helpers easily (optional convenience)
export function useMessageReadState() {
  const { teamName } = useAuth();
  return {
    teamName,
    getLastRead: () => getLastReadAt(teamName),
    setLastReadNow: () => setLastReadNow(teamName),
  };
}
