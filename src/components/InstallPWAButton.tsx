import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { Download } from "lucide-react";

// Detect if the app is already installed / running standalone
function useIsStandalone() {
  const [standalone, setStandalone] = useState<boolean>(() => {
    // iOS Safari
    const iosStandalone = (window.navigator as Navigator).standalone === true;
    // General (Chromium, etc.)
    const mediaStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ?? false;
    return iosStandalone || mediaStandalone;
  });

  useEffect(() => {
    const mq = window.matchMedia?.("(display-mode: standalone)");
    if (!mq) return;
    const handler = () => {
      const n = window.navigator as Navigator;
      setStandalone(mq.matches || n.standalone === true);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  return standalone;
}

// minimal type for the event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
  readonly platforms: string[];
}

/**
 * Shows a button when the PWA can be installed (Chrome/Edge/Android). On click, triggers the install prompt.
 * It hides itself when the app is already installed or after successful installation.
 */
export default function InstallPWAButton({
  className,
}: {
  className?: string;
}) {
  const isStandalone = useIsStandalone();
  const [canInstall, setCanInstall] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      const ev = e as BeforeInstallPromptEvent;
      // Prevent the automatic mini-banner, but keep the event so we can prompt later
      ev.preventDefault?.();
      deferredPromptRef.current = ev;
      setCanInstall(true);
    }

    function onAppInstalled() {
      // App installed -> hide button
      deferredPromptRef.current = null;
      setCanInstall(false);
    }

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const visible = useMemo(
    () => !isStandalone && canInstall,
    [isStandalone, canInstall],
  );

  if (!visible) return null;

  const onClick = async () => {
    const ev = deferredPromptRef.current;
    if (!ev) return;
    try {
      await ev.prompt();
      const choice = await ev.userChoice;
      if (choice.outcome === "accepted") {
        setCanInstall(false);
      } else {
        // falls abgelehnt: optional UI weiter anzeigen oder kurz ausblenden
        setCanInstall(false);
        setTimeout(() => {
          // Benutzer kann erneut zum Installieren aufgefordert werden (optional)
          // setCanInstall(true);
        }, 30000);
      }
    } catch (err) {
      console.error("Install prompt failed", err);
    } finally {
      deferredPromptRef.current = null;
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      className={className}
      title="App installieren"
    >
      <Download className="w-4 h-4 mr-2" /> App installieren
    </Button>
  );
}
