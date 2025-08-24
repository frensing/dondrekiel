import { useEffect, useRef } from "react";
import { useGeolocated } from "react-geolocated";
import { useAuth } from "@/context/AuthContext.tsx";
import { updateTeamLocation } from "@/lib/teams.ts";

/**
 * Background location reporter for team_user accounts.
 * Sends current location to the server every 2 minutes when coords are available.
 */
export default function LocationReporter() {
  const { isAuthenticated, role } = useAuth();

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: { enableHighAccuracy: true },
      watchPosition: true,
      watchLocationPermissionChange: true,
      userDecisionTimeout: 25000,
    });

  const lastSentRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Only for logged-in team users
    const isTeamUser = role === "team_user";

    function clear() {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    if (!isAuthenticated || !isTeamUser) {
      clear();
      return;
    }

    // Tick function: send if possible
    const tick = async () => {
      try {
        if (!isGeolocationAvailable || !isGeolocationEnabled || !coords) return;
        const now = Date.now();
        // Avoid spamming if interval ticks too frequently somehow
        if (now - lastSentRef.current < 110000) return; // >= 110s
        lastSentRef.current = now;
        await updateTeamLocation(coords.latitude, coords.longitude);
      } catch (e) {
        // Silently ignore to avoid spamming toasts
        console.debug("location update failed", e);
      }
    };

    // Send one immediately when coords available
    void tick();

    // Then set interval every 2 minutes
    intervalRef.current = window.setInterval(tick, 120000);

    return () => {
      clear();
    };
  }, [
    isAuthenticated,
    role,
    isGeolocationAvailable,
    isGeolocationEnabled,
    coords,
  ]);

  return null;
}
