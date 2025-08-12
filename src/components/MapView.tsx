import { useGeolocated } from "react-geolocated";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useLocation } from "react-router-dom";
import { Station } from "@/types/Station.ts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Locate } from "lucide-react";
import { createStationMarker } from "@/components/StationMarker.tsx";

const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stations: Station[] = [
  {
    id: 1,
    title: "Das verflixte Rad",
    description: "Fahrräder",
    latitude: 51.8456555569042,
    longitude: 7.83885361939789,
  },
  {
    id: 2,
    title: "Pfadis",
    description: "Bla",
    latitude: 51.8423219532426,
    longitude: 7.82743595630178,
  },
  {
    id: 3,
    title: "Aucom",
    description: "Blub",
    latitude: 51.8468066699671,
    longitude: 7.84459694916815,
  },
  {
    id: 4,
    title: "Beweggründe",
    description: "Sport",
    latitude: 51.8429646849363,
    longitude: 7.8254691891795,
  },
];

console.log(stations);

L.Marker.prototype.options.icon = defaultIcon;

// Default coordinates (can be set to your city's coordinates)
const DEFAULT_COORDINATES = { latitude: 51.844, longitude: 7.827 }; // Example: Berlin

const MapView = () => {
  const location = useLocation();
  const mapRef = useRef<L.Map | null>(null);
  const selectedStation = location.state?.selectedStation as
    | Station
    | undefined;

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
  // Handle selected station and initial user location
  useEffect(() => {
    if (!initialCenteringDone && !selectedStation && coords && mapRef.current) {
      mapRef.current.setView([coords.latitude, coords.longitude], defaultZoom);
      setTimeout(() => setInitialCenteringDone(true), 1000);
    }
  }, [coords, initialCenteringDone, selectedStation]); // Only run once on mount

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
    <div className="h-full relative">
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
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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

        {stations.map((s) => createStationMarker(s))}
      </MapContainer>

      {/* Location centering button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-6 right-6 rounded-full shadow-lg z-[1000]"
        onClick={handleCenterLocation}
      >
        <Locate className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MapView;
