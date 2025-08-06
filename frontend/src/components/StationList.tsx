import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Station } from "@/types/Station";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

// Example stations data - you should replace this with your actual data source
const stations: Station[] = [
  {
    id: 1,
    name: "Hauptbahnhof",
    description: "Central station with major connections",
    latitude: 52.525,
    longitude: 13.369,
  },
  {
    id: 2,
    name: "Brandenburg Gate",
    description: "Historic landmark in the city center",
    latitude: 52.5163,
    longitude: 13.3777,
  },
  // Add more stations as needed
];

const StationList = () => {
  const navigate = useNavigate();

  const handleStationClick = (station: Station) => {
    // Navigate to map view with coordinates as state
    navigate("/", {
      state: {
        selectedStation: station,
      },
    });
  };

  return (
    <div className="space-y-2 p-4">
      {stations.map((station) => (
        <Card
          key={station.id}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleStationClick(station)}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {station.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-gray-600">{station.description}</p>
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-500">
                {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StationList;
