import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from "@/lib/push.ts";
import { useAuth } from "@/context/AuthContext.tsx";

export function EnablePushButton({ className }: { className?: string }) {
  const { teamName, userId, isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(Notification.permission === "granted");

  async function onEnable() {
    if (!isAuthenticated) {
      toast.error("Bitte zuerst anmelden");
      return;
    }
    setBusy(true);
    try {
      const rec = await registerPushSubscription({
        meta: { team_name: teamName, user_id: userId },
      });
      if (rec) {
        setEnabled(true);
        toast.success("Push-Benachrichtigungen aktiviert");
      }
    } catch (e) {
      console.error(e);
      toast.error("Aktivierung fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  async function onDisable() {
    setBusy(true);
    try {
      await unregisterPushSubscription();
      setEnabled(false);
      toast("Push-Benachrichtigungen deaktiviert");
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      {enabled ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onDisable}
          title="Push-Benachrichtigungen deaktivieren"
        >
          <Bell className="w-4 h-4 mr-2" /> Push aus
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={onEnable}
          title="Push-Benachrichtigungen aktivieren"
        >
          <Bell className="w-4 h-4 mr-2" /> Push an
        </Button>
      )}
    </div>
  );
}
