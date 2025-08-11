import "./App.css";
import { Route, Routes } from "react-router-dom";
import StationList from "./components/StationList.tsx";
import MessageList from "./components/MessageList.tsx";
import MapView from "@/components/MapView.tsx";
import { BottomNav } from "@/components/BottomNav.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";

function App() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-20">
        {" "}
        {/* pb-16 accounts for BottomNav height */}
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/stationen" element={<StationList />} />
          <Route path="/nachrichten" element={<MessageList />} />
        </Routes>
        <Toaster />
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
