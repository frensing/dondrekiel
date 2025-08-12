import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Station } from "@/types/Station.ts";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

// Example stations data - you should replace this with your actual data source
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
              {station.title}
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
