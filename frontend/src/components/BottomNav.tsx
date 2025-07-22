import { NavLink } from "react-router-dom";
import { Flag, Map, MessageCircle } from "lucide-react";

export function BottomNav() {
  const baseLinkClasses =
    "flex flex-col items-center text-gray-600 hover:text-black w-full";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200"
      style={{
        bottom: "env(safe-area-inset-bottom, 0)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 15px)", // extra touch target space
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="flex justify-between items-center h-16">
        <NavLink to="/" className={baseLinkClasses}>
          <Map className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        <NavLink to="/stationen" className={baseLinkClasses}>
          <Flag className="w-6 h-6" />
          <span className="text-xs mt-1">Stationen</span>
        </NavLink>
        <NavLink to="/nachrichten" className={baseLinkClasses}>
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Nachrichten</span>
        </NavLink>
      </div>
    </nav>
  );
}
