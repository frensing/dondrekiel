/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

// Global ambient types
declare global {
  // Minimal BeforeInstallPromptEvent typing for TypeScript
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }

  // iOS Safari exposes navigator.standalone when running in standalone mode
  interface Navigator {
    standalone?: boolean;
  }
}

export {};
