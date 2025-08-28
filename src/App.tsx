import "./App.css";
import { Route, Routes } from "react-router-dom";
import StationList from "./components/StationList.tsx";
import MessageList from "./components/MessageList.tsx";
import MapView from "@/components/MapView.tsx";
import { BottomNav } from "@/components/BottomNav.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import LogoutPage from "@/pages/LogoutPage.tsx";
import AdminCreateTeamPage from "@/pages/AdminCreateTeamPage.tsx";
import LocationReporter from "@/components/LocationReporter.tsx";

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">403 – Zugriff verweigert</h1>
        <p className="text-sm text-gray-600">
          Diese Seite ist nur für Administratoren sichtbar.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <LoginPage />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Background location reporter for team users */}
      <LocationReporter />
      <main className="flex-1 overflow-y-auto pb-20">
        {/* pb-16 accounts for BottomNav height */}
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/stationen" element={<StationList />} />
          <Route path="/nachrichten" element={<MessageList />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route
            path="/admin/create-team"
            element={
              <AdminOnly>
                <AdminCreateTeamPage />
              </AdminOnly>
            }
          />
        </Routes>
        <Toaster />
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
