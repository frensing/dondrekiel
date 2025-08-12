import { Marker, Popup } from "react-leaflet";
import { Station } from "@/types/Station.ts";

export const createStationMarker = (station: Station) => {
  return (
    <Marker key={station.id} position={[station.latitude, station.longitude]}>
      <Popup>
        <div className="p-2">
          <h3 className="font-bold">{station.title}</h3>
          <p className="text-sm">{station.description}</p>
        </div>
      </Popup>
    </Marker>
  );
};
