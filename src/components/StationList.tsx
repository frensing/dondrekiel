import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Station } from "@/types/Station.ts";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchStations } from "@/lib/stations.ts";

const StationList = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchStations();
        if (isMounted) setStations(data);
      } catch {
        if (isMounted) setError("Failed to load stations");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStationClick = (station: Station) => {
    // Navigate to map view with coordinates as state
    navigate("/", {
      state: {
        selectedStation: station,
      },
    });
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading stations…</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

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
