import { NavLink, useLocation } from "react-router-dom";
import { Flag, Map, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchMessages } from "@/lib/messages.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import { getLastReadAt } from "@/lib/unread.ts";

export function BottomNav() {
  const { teamName } = useAuth();
  const location = useLocation();
  const baseLinkClasses = "flex flex-col items-center w-full";

  const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `${baseLinkClasses} ${isActive ? "text-blue-500" : "text-gray-600 hover:text-black"}`;

  const [latestTs, setLatestTs] = useState<number>(0);
  const lastRead = useMemo(() => getLastReadAt(teamName), [teamName]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Whenever route is Nachrichten, consider it read (MessageList also sets it, but this makes badge snappier)
    if (location.pathname === "/nachrichten") {
      setHasUnread(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      try {
        const msgs = await fetchMessages();
        const last = msgs.length ? msgs[msgs.length - 1] : undefined;
        const ts = last ? new Date(last.created_at).getTime() : 0;
        if (!cancelled) setLatestTs(ts);
      } catch {
        // ignore
      }
    }

    // initial fetch
    void loadLatest();
    // periodic refresh every 45s
    const id = window.setInterval(loadLatest, 45000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    setHasUnread(latestTs > 0 && latestTs > lastRead);
  }, [latestTs, lastRead]);

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
                aria-hidden
                className="absolute -top-1 -right-1 inline-block w-2 h-2 bg-red-500 rounded-full shadow"
              />
            )}
          </div>
          <span className="text-xs mt-1">Nachrichten</span>
        </NavLink>
      </div>
    </nav>
  );
}
