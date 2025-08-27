import "./App.css";
import { Route, Routes } from "react-router-dom";
import StationList from "./components/StationList.tsx";
import MessageList from "./components/MessageList.tsx";
import MapView from "@/components/MapView.tsx";
import { BottomNav } from "@/components/BottomNav.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import AdminCreateTeamPage from "@/pages/AdminCreateTeamPage.tsx";
import LocationReporter from "@/components/LocationReporter.tsx";
import InstallPWAButton from "@/components/InstallPWAButton.tsx";

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

      {/* Top-centered Install button (only renders when installable) */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ paddingTop: "env(safe-area-inset-top, 0)" }}
      >
        <div className="pointer-events-none py-2">
          <div className="pointer-events-auto">
            <InstallPWAButton />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        {/* pb-16 accounts for BottomNav height */}
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/stationen" element={<StationList />} />
          <Route path="/nachrichten" element={<MessageList />} />
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
