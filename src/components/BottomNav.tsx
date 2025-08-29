import { NavLink, useLocation } from "react-router-dom";
import { Flag, Map, MessageCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetchMessages } from "@/lib/messages.ts";
import { notify } from "@/lib/notifications.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import { getLastReadAt, setLastReadNow } from "@/lib/unread.ts";

export function BottomNav() {
  const { teamName } = useAuth();
  const location = useLocation();

  const baseLinkClasses = "flex flex-col items-center w-full";
  const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `${baseLinkClasses} ${isActive ? "text-blue-500" : "text-gray-600 hover:text-black"}`;

  const [latestTs, setLatestTs] = useState<number>(0);
  const [lastRead, setLastRead] = useState<number>(() => getLastReadAt(teamName));
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  // Refs für Intervall-Callback
  const latestTsRef = useRef<number>(0);
  const lastReadRef = useRef<number>(lastRead);

  useEffect(() => { latestTsRef.current = latestTs; }, [latestTs]);
  useEffect(() => { lastReadRef.current = lastRead; }, [lastRead]);

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

  // Polling für neue Nachrichten
  useEffect(() => {
    let cancelled = false;
    
    const loadLatest = async () => {
      console.log("Polling Nachrichten...");
      try {
        const msgs = await fetchMessages();
        if (!Array.isArray(msgs) || msgs.length === 0) return;
        if (cancelled) return;

        // WICHTIG: Neueste Nachricht bestimmen (größter created_at)
        const newestTimestamp = msgs.reduce<number>((max, m) => {
          const t = new Date(m?.created_at ?? 0).getTime();
          return Number.isFinite(t) && t > max ? t : max;
        }, 0);

        const previousTimestamp = latestTsRef.current;
        const currentLastRead = lastReadRef.current;

        // Neue Nachricht erkannt? (neuer Timestamp ist größer als vorheriger)
        const hasNewMessage = newestTimestamp > previousTimestamp && previousTimestamp !== 0;
        console.log("Neueste Nachricht Timestamp:", {
          newestTimestamp,
          previousTimestamp,
          currentLastRead,
          hasNewMessage
        });

        // State aktualisieren
        latestTsRef.current = newestTimestamp;
        setLatestTs(newestTimestamp);

        // Badge anzeigen wenn: neueste Nachricht ist neuer als last read
        // UND wir sind nicht auf der Nachrichten-Seite
        const shouldShowBadge = newestTimestamp > currentLastRead && 
                                newestTimestamp > 0 && 
                                location.pathname !== "/nachrichten";
        
        // Push-Benachrichtigung bei neuer Nachricht
        if (shouldShowBadge && location.pathname !== "/nachrichten") {
              notify("Neue Nachricht", { body: "Du hast eine neue Nachricht erhalten.", icon: "/icon-192.png" });
        }
        setHasUnread(shouldShowBadge);

        console.log("Polling-Ergebnis:", {
          newestTimestamp,
          currentLastRead,
          hasUnread: shouldShowBadge,
          currentPath: location.pathname
        });

      } catch (error) {
        console.error("Fehler beim Laden der Nachrichten:", error);
      }
    };

    // Initial laden
    void loadLatest();
    
    // Intervall starten (alle 5 Sekunden)
    const intervalId = window.setInterval(loadLatest, 5000);
    
    // Cleanup
    return () => { 
      cancelled = true; 
      window.clearInterval(intervalId); 
    };
  }, [location.pathname, teamName]);

  // Debug-Ausgabe
  useEffect(() => {
    console.log("State-Update:", { latestTs, lastRead, hasUnread });
  }, [latestTs, lastRead, hasUnread]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50"
      style={{ 
        bottom: "env(safe-area-inset-bottom, 0)", 
        paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 15px)", 
        WebkitOverflowScrolling: "touch" 
      }}>
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