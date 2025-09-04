import { NavLink, useLocation } from "react-router-dom";
import { Flag, Map, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchMessages } from "@/lib/messages.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import { getLastReadAt, setLastReadNow } from "@/lib/unread.ts";

export function BottomNav() {
  const { teamName } = useAuth();
  const location = useLocation();

  const baseLinkClasses = "flex flex-col items-center w-full";
  const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `${baseLinkClasses} ${isActive ? "text-blue-500" : "text-gray-600 hover:text-black"}`;

  const [latestTs, setLatestTs] = useState<number>(0);
  const [lastRead, setLastRead] = useState<number>(() =>
    getLastReadAt(teamName),
  );
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  // Refs für Intervall-Callback
  const latestTsRef = useRef<number>(0);
  const lastReadRef = useRef<number>(lastRead);

  useEffect(() => {
    latestTsRef.current = latestTs;
  }, [latestTs]);
  useEffect(() => {
    lastReadRef.current = lastRead;
  }, [lastRead]);

  // lastRead neu laden bei Teamwechsel
  useEffect(() => {
    const newLastRead = getLastReadAt(teamName);
    setLastRead(newLastRead);
    lastReadRef.current = newLastRead;
  }, [teamName]);

  // Auf Nachrichten-Seite → als gelesen markieren
  useEffect(() => {
    if (location.pathname === "/nachrichten" && latestTs > 0) {
      // Persistieren des aktuellen Zeitstempels als "gelesen"
      setLastReadNow(teamName);
      setLastRead(latestTs);
      setHasUnread(false);
    }
  }, [location.pathname, latestTs, teamName]);

  // Event-driven refresh for unread badge (no polling):
  // - initial fetch on mount or team change
  // - refresh once when app/tab becomes visible again
  useEffect(() => {
    let cancelled = false;

    const loadLatest = async () => {
      try {
        const msgs = await fetchMessages();
        if (!Array.isArray(msgs) || msgs.length === 0) return;
        if (cancelled) return;

        const newest = msgs.reduce<(typeof msgs)[0] | undefined>((acc, m) => {
          const t = new Date(m?.created_at ?? 0).getTime();
          if (!acc) return m;
          const accT = new Date(acc.created_at ?? 0).getTime();
          return t > accT ? m : acc;
        }, undefined);

        const newestTimestamp = newest?.created_at
          ? new Date(newest.created_at).getTime()
          : 0;

        const currentLastRead = lastReadRef.current;

        // Update state
        latestTsRef.current = newestTimestamp;
        setLatestTs(newestTimestamp);

        // Show badge if there is something newer than last read and we're not on the messages page
        const shouldShowBadge =
          newestTimestamp > currentLastRead &&
          newestTimestamp > 0 &&
          location.pathname !== "/nachrichten";
        setHasUnread(shouldShowBadge);
      } catch (error) {
        console.error("Fehler beim Laden der Nachrichten:", error);
      }
    };

    // Initial load
    void loadLatest();

    // Refresh when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadLatest();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [location.pathname, teamName]);

  // Debug-Ausgabe
  useEffect(() => {
    console.log("State-Update:", { latestTs, lastRead, hasUnread });
  }, [latestTs, lastRead, hasUnread]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t z-50"
      style={{
        bottom: "env(safe-area-inset-bottom, 0)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 15px)", // extra touch target space
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="flex justify-between items-center h-16">
        <NavLink to="/" className={getLinkClasses}>
          <Map className="w-6 h-6" />
          <span className="text-xs mt-1">Karte</span>
        </NavLink>
        <NavLink to="/stationen" className={getLinkClasses}>
          <Flag className="w-6 h-6" />
          <span className="text-xs mt-1">Stationen</span>
        </NavLink>
        <NavLink to="/nachrichten" className={getLinkClasses}>
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {hasUnread && (
              <span
                aria-label="Neue Nachrichten vorhanden"
                className="absolute -top-1 -right-1 inline-block w-2 h-2 bg-red-500 rounded-full shadow animate-pulse"
              />
            )}
          </div>
          <span className="text-xs mt-1">Nachrichten</span>
        </NavLink>
      </div>
    </nav>
  );
}
