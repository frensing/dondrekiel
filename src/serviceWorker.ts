/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

// --- Push Notifications ---
self.addEventListener("push", (event: PushEvent) => {
  interface PushPayload {
    title?: string;
    body?: string;
    url?: string;
    tag?: string;
  }

  const data: PushPayload = (() => {
    try {
      return event.data ? (event.data.json() as PushPayload) : {};
    } catch {
      return {} as PushPayload;
    }
  })();

  const title: string = data?.title ?? "Neue Nachricht";
  const body: string = data?.body ?? "Es gibt neue Nachrichten.";
  const url: string | undefined = data?.url;
  const tag: string | undefined = data?.tag ?? "messages";

  const options: NotificationOptions = {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    data: { url },
    tag,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url: string =
    (event.notification.data && event.notification.data.url) || "/nachrichten";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        const c = client as WindowClient;
        // Focus already open tab within our scope
        if (c.url.startsWith(self.registration.scope)) {
          await c.focus();
          try {
            await c.navigate(url);
          } catch {
            /* ignore */
          }
          return;
        }
      }
      // Else open a new tab
      await self.clients.openWindow(url);
    })(),
  );
});
