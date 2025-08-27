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
      // Prevent the mini-infobar on mobile
      e.preventDefault?.();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    }

    function onAppInstalled() {
      deferredPromptRef.current = null;
      setCanInstall(false);
      toast.success(
        "App installiert – Du findest sie jetzt auf deinem Home-Bildschirm.",
      );
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
    try {
      const dp = deferredPromptRef.current;
      if (!dp) return;
      dp.prompt();
      const choice = await dp.userChoice;
      if (choice.outcome === "accepted") {
        toast.success("Installation gestartet");
      } else {
        toast("Installation abgebrochen");
      }
      // After the prompt, clear the saved event. Some browsers allow only once.
      deferredPromptRef.current = null;
      setCanInstall(false);
    } catch (e) {
      console.error(e);
      toast.error("Installation nicht möglich");
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
