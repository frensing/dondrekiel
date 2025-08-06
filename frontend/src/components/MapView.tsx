import { useGeolocated } from "react-geolocated";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Card, CardContent } from "@/components/ui/card";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      watchPosition: true,
      watchLocationPermissionChange: true,
      userDecisionTimeout: 25000,
    });

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
        center={[coords.latitude, coords.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-[calc(100vh-6rem)]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coords.latitude, coords.longitude]}>
          <Popup className="rounded-md">
            <div className="p-1">
              <h3 className="font-semibold">Your Location</h3>
              <p className="text-sm text-muted-foreground">
                Lat: {coords.latitude.toFixed(4)}, Lng:{" "}
                {coords.longitude.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </Card>
  );
};

export default MapView;
