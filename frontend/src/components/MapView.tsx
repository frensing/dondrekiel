import { useGeolocated } from "react-geolocated";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Card, CardContent } from "@/components/ui/card";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { useLocation } from "react-router-dom";
import { Station } from "@/types/Station";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Loader2 } from "lucide-react";

// Fix for default marker icons in React Leaflet
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

  // Handle selected station
  useEffect(() => {
    if (selectedStation && mapRef.current) {
      mapRef.current.setView(
        [selectedStation.latitude, selectedStation.longitude],
        15,
      );
    }
  }, [selectedStation]);

  // Make sure the map container is properly sized
  useEffect(() => {
    const map = document.querySelector(".leaflet-container");
    if (map) {
      (map as HTMLElement).style.height = "calc(100vh - 5rem)";
    }
  }, []);

  if (!isGeolocationAvailable) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Geolocation Not Supported</AlertTitle>
        <AlertDescription>
          Your browser does not support geolocation features.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isGeolocationEnabled) {
    return (
      <Alert className="m-4">
        <AlertTitle>Location Access Required</AlertTitle>
        <AlertDescription>
          Please enable location services to use the map features.
        </AlertDescription>
      </Alert>
    );
  }

  if (!coords) {
    return (
      <Card className="m-4">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Getting your location...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4 overflow-hidden border rounded-lg shadow-lg">
      <MapContainer
        center={[
          selectedStation?.latitude || coords?.latitude || 0,
          selectedStation?.longitude || coords?.longitude || 0,
        ]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-[calc(100vh-6rem)]"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
    </Card>
  );
};

export default MapView;
