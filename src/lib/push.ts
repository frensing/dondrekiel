import { api } from "@/lib/api.ts";

const vapidPublicKey =
  "BK41rUgCe-klV_kpg1RgPILIc_ZuE_63PJlJ4CP-i3Iw4p4BrZlaQcGGtGE_nhGDD909BGfhwZyVqFciDQRdEn8";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // From https://www.npmjs.com/package/web-push docs
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  team_name?: string | null;
  user_id?: string | null;
};

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator))
    throw new Error("Service Worker not supported");
  // Vite PWA injects register automatically with registerType: autoUpdate
  const reg = await navigator.serviceWorker.ready;
  return reg;
}

export async function getOrCreateSubscription(
  vapidPublicKey: string,
): Promise<PushSubscription> {
  const reg = await getServiceWorkerRegistration();
  if (!("PushManager" in window)) throw new Error("Push not supported");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }
  return sub;
}

export function subscriptionToRecord(
  sub: PushSubscription,
  meta?: {
    team_name?: string | null;
    user_id?: string | null;
  },
): PushSubscriptionRecord {
  const json = sub.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new Error("Invalid PushSubscription: missing endpoint/keys");
  }
  return {
    endpoint,
    p256dh,
    auth,
    user_agent: navigator.userAgent,
    team_name: meta?.team_name ?? null,
    user_id: meta?.user_id ?? null,
  };
}

export async function registerPushSubscription(options?: {
  meta?: { team_name?: string | null; user_id?: string | null };
  vapidPublicKey?: string;
}): Promise<PushSubscriptionRecord | null> {
  if (!("Notification" in window))
    throw new Error("Notifications not supported");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const vapidKey = vapidPublicKey;
  if (!vapidKey)
    throw new Error("Missing VAPID public key (VITE_VAPID_PUBLIC_KEY)");

  const sub = await getOrCreateSubscription(vapidKey);
  const record = subscriptionToRecord(sub, options?.meta);

  // Prefer upsert semantics: if endpoint exists, update metadata
  await api.post("/web_push_subscriptions", [record], {
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
  });
  return record;
}

export async function unregisterPushSubscription(): Promise<void> {
  const reg = await getServiceWorkerRegistration();
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    try {
      await api.delete("/web_push_subscriptions", {
        params: { endpoint: `eq.${endpoint}` },
      });
    } catch {
      // ignore backend deletion errors
    }
  }
}
