import { Marker, Popup } from "react-leaflet";
import { Station } from "@/types/Station.ts";
import L from "leaflet";

function normalizeColor(input?: string): string {
  if (!input) return "#EF4444"; // default red-500
  const s = input.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(s)) {
    return s.startsWith("#") ? s : `#${s}`;
  }
  // allow rgb()/named colors as-is
  return s;
}

function createPinIcon(color: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z"></path>
    <circle cx="12" cy="11" r="2.5" fill="white"></circle>
  </svg>`;
  return L.divIcon({
    className: "station-pin",
    html: svg,
    iconSize: [34, 34],
    iconAnchor: [17, 32], // bottom center near tip (scaled from 28px)
    popupAnchor: [0, -30],
  });
}

export const createStationMarker = (station: Station) => {
  const color = normalizeColor(station.marker);
  const icon = createPinIcon(color);
  return (
    <Marker
      key={station.id}
      position={[station.latitude, station.longitude]}
      icon={icon}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold">{station.title}</h3>
          {station.description && (
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {station.description}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
