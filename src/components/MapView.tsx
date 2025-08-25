import { useGeolocated } from "react-geolocated";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useLocation } from "react-router-dom";
import { Station } from "@/types/Station.ts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Locate } from "lucide-react";
import { createStationMarker } from "@/components/StationMarker.tsx";
import { fetchStations } from "@/lib/stations.ts";
import { fetchTeams } from "@/lib/teams.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import { Team } from "@/types/Team";

const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Default coordinates (can be set to your city's coordinates)
const DEFAULT_COORDINATES = { latitude: 51.844, longitude: 7.827 }; // Example: Berlin

const MapView = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { userId } = useAuth();
  const location = useLocation();
  const mapRef = useRef<L.Map | null>(null);
  const selectedStation = location.state?.selectedStation as
    | Station
    | undefined;

  const [stations, setStations] = useState<Station[]>([]);
  const [stationsError, setStationsError] = useState<string | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const defaultZoom = 16;

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      watchPosition: true,
      watchLocationPermissionChange: true,
      userDecisionTimeout: 25000,
    });

  const [initialCenteringDone, setInitialCenteringDone] = useState(false);

  // Keep Leaflet map sized correctly when container size or orientation changes
  useEffect(() => {
    const map = mapRef.current;
    const el = containerRef.current;
    if (!map || !el) return;

    const invalidate = () => {
      try {
        map.invalidateSize();
      } catch {
        // ignore
      }
    };

    const ro = new ResizeObserver(() => invalidate());
    ro.observe(el);
    window.addEventListener("orientationchange", invalidate);
    window.addEventListener("resize", invalidate);

    // initial invalidation after first paint
    const id = window.setTimeout(invalidate, 50);

    return () => {
      window.clearTimeout(id);
      ro.disconnect();
      window.removeEventListener("orientationchange", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  // Load stations list
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchStations();
        if (isMounted) setStations(data);
      } catch {
        if (isMounted) setStationsError("Failed to load stations");
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle selected station and initial user location
  useEffect(() => {
    if (!initialCenteringDone && !selectedStation && coords && mapRef.current) {
      mapRef.current.setView([coords.latitude, coords.longitude], defaultZoom);
      setTimeout(() => setInitialCenteringDone(true), 1000);
    }
  }, [coords, initialCenteringDone, selectedStation]); // Only run once on mount

  // Notify if stations failed to load
  useEffect(() => {
    if (stationsError) {
      toast(stationsError);
    }
  }, [stationsError]);

  // Load teams list
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchTeams();
        if (isMounted) setTeams(data);
      } catch {
        if (isMounted) setTeamsError("Failed to load teams");
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Notify if teams failed to load
  useEffect(() => {
    if (teamsError) {
      toast(teamsError);
    }
  }, [teamsError]);

  useEffect(() => {
    if (selectedStation && mapRef.current) {
      mapRef.current.setView(
        [selectedStation.latitude, selectedStation.longitude],
        defaultZoom,
      );
    }
  }, [selectedStation]);

  const handleCenterLocation = () => {
    if (!isGeolocationAvailable) {
      toast("Geolocation Not Supported");
      return;
    }

    if (!isGeolocationEnabled) {
      toast("Location Access Required");
      return;
    }

    if (!coords) {
      toast("Location Unavailable");
      return;
    }

    mapRef.current?.setView([coords.latitude, coords.longitude], defaultZoom);
  };

  return (
    <div ref={containerRef} className="h-full relative">
      <MapContainer
        center={[
          selectedStation?.latitude ||
            coords?.latitude ||
            DEFAULT_COORDINATES.latitude,
          selectedStation?.longitude ||
            coords?.longitude ||
            DEFAULT_COORDINATES.longitude,
        ]}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef}
        attributionControl={false}
      >
        {/* OSM France "Forte" Layer */}
        <TileLayer
          url="https://a.forte.tiles.quaidorsay.fr/fr/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* User location marker */}
        {coords && (
          <Marker
        position={[coords.latitude, coords.longitude]}
        icon={L.divIcon({
          className: "relative",
          html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })}
          ></Marker>
        )}

        {/* Team markers (other teams only) */}
        {teams
          .filter((t) => t.latitude != null && t.longitude != null)
          .filter((t) => (userId ? t.id !== parseInt(userId) : true))
          .map((t) => (
        <Marker
          key={`team-${t.id}`}
          position={[t.latitude as number, t.longitude as number]}
          icon={L.divIcon({
            className: "relative",
            html: `<div class="w-4 h-4 bg-green-700 rounded-full border-2 border-white shadow-md"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          })}
        >
          <Popup>
            <div className="p-2">
          <h3 className="font-bold">{t.name}</h3>
          <p className="text-sm text-gray-600">
            Position: 
            {t.latitude != null ? t.latitude.toFixed(4) : "?"}, 
            {t.longitude != null ? t.longitude.toFixed(4) : "?"}
          </p>
            </div>
          </Popup>
        </Marker>
          ))}

        {stations.map((s) => createStationMarker(s))}
      </MapContainer>

      {/* Location centering button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-6 rounded-full shadow-lg z-[1000]"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0) + 88px)" }}
        onClick={handleCenterLocation}
      >
        <Locate className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MapView;
