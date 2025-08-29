import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Route: /logout
 * Veranlasst Server‑Logout (wenn vorhanden), löscht lokale Tokens und leitet auf /login weiter.
 */
export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Versuche Server‑Logout (falls Server Session/Cookie invalidiert)
        await fetch("/logout", {
          method: "GET", // oder "GET" je nach Server-Implementierung
          credentials: "include",
          headers: {  },
        });
      } catch (e) {
        console.warn("Server logout failed:", e);
      }

      // Clientseitig Tokens / Session löschen (anpassen auf eure Speicherung)
      try {
        localStorage.removeItem("auth_token");
      } catch (e) {
        void e; // no-op
      }

      try {
        sessionStorage.removeItem("auth_token");
      } catch (e) {
        void e; // no-op
      }
      // optional: weitere Aufräumarbeiten, z.B. Push unsubscribe, SW messages, Zustand resetten

      // Weiterleitung zum Login (ersetzt aktuellen Eintrag)
      window.location.href = "/";
    })();
  }, [navigate]);

  return null;
}