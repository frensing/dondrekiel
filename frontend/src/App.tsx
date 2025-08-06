import "./App.css";
import { Route, Routes } from "react-router-dom";
import Stationen from "./components/Stationen.tsx";
import MessageList from "./components/MessageList.tsx";
import MapView from "@/components/MapView.tsx";
import { BottomNav } from "@/components/BottomNav.tsx";

function App() {
  return (
    <div className="flex flex-col">
      {/*<PwaBackgroundSync />*/}
      {/*<PWABadge />*/}
      <div className="pb-22">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/stationen" element={<Stationen />} />
          <Route path="/nachrichten" element={<MessageList />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
