import { useGeolocated } from "react-geolocated";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useLocation } from "react-router-dom";
import { Station } from "@/types/Station";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Locate } from "lucide-react";

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
  const location = useLocation();
  const mapRef = useRef<L.Map | null>(null);
  const selectedStation = location.state?.selectedStation as
    | Station
    | undefined;

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
      mapRef.current.setView([coords.latitude, coords.longitude], 15);
      setTimeout(() => setInitialCenteringDone(true), 1000);
    }
  }, [coords, initialCenteringDone, selectedStation]); // Only run once on mount

  useEffect(() => {
    if (selectedStation && mapRef.current) {
      mapRef.current.setView(
        [selectedStation.latitude, selectedStation.longitude],
        15,
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

    mapRef.current?.setView([coords.latitude, coords.longitude], 15);
  };

  return (
    <div className="h-[calc(100vh-5rem)] relative">
      <MapContainer
        center={[
          selectedStation?.latitude ||
            coords?.latitude ||
            DEFAULT_COORDINATES.latitude,
          selectedStation?.longitude ||
            coords?.longitude ||
            DEFAULT_COORDINATES.longitude,
        ]}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* User location marker */}
        {coords && (
          <Marker position={[coords.latitude, coords.longitude]}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Selected station marker */}
        {selectedStation && (
          <Marker
            position={[selectedStation.latitude, selectedStation.longitude]}
            icon={L.divIcon({
              className: "bg-primary text-white p-2 rounded-full",
              html: `<div class="station-marker"></div>`,
              iconSize: [30, 30],
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{selectedStation.name}</h3>
                <p className="text-sm">{selectedStation.description}</p>
              </div>
            </Popup>
          </Marker>
        )}
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
