import "dotenv/config";
import axios, { AxiosInstance } from "axios";
import webpush from "web-push";

/*
  Dondrekiel push sender (polling version)
  - Polls PostgREST /messages for new admin messages (author = 'Spielleitung').
  - Fetches all web_push_subscriptions and sends Web Push notifications.
  - Cleans up stale subscriptions on 404/410 from push endpoints.
*/

const API_BASE_URL =
  process.env.API_BASE_URL || "https://app.dondrekiel.de/api";
const SERVICE_JWT = process.env.SERVICE_JWT || "";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const MAILTO = process.env.MAILTO || "mailto:you@example.com";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 15000);
const POLL_LIMIT = Number(process.env.POLL_LIMIT || 100);

if (!SERVICE_JWT) {
  console.error("[push-sender] Missing SERVICE_JWT in environment. Exiting.");
  process.exit(1);
}
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error(
    "[push-sender] Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY in environment. Exiting.",
  );
  process.exit(1);
}

webpush.setVapidDetails(MAILTO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SERVICE_JWT}`,
  },
  // reasonable timeouts
  timeout: 10000,
});

let lastMessageId = 0; // monotonic progression across polls

function truncate(str: string, max = 120): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

type DbMessage = {
  id?: number;
  author?: string;
  message: string;
  created_at?: string;
  team_name?: string;
};
type SubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  team_name?: string | null;
};

type PushPayload = { title: string; body: string; tag?: string; url?: string };

async function fetchNewAdminMessages(): Promise<DbMessage[]> {
  const params = new URLSearchParams();
  params.set("author", "eq.Spielleitung");
  params.set("order", "id.asc");
  if (lastMessageId > 0) {
    params.set("id", `gt.${lastMessageId}`);
  }
  params.set("limit", String(POLL_LIMIT));

  const url = `/messages?${params.toString()}`;
  const { data } = await api.get<DbMessage[]>(url);
  return Array.isArray(data) ? data : [];
}

async function fetchAllSubscriptions(): Promise<SubscriptionRow[]> {
  const { data } = await api.get<SubscriptionRow[]>("/web_push_subscriptions");
  return Array.isArray(data) ? data : [];
}

async function deleteSubscription(endpoint: string): Promise<void> {
  try {
    await api.delete("/web_push_subscriptions", {
      params: { endpoint: `eq.${endpoint}` },
    });
    console.log(`[push-sender] Deleted stale subscription: ${endpoint}`);
  } catch (e: unknown) {
    const err = e as { response?: { status?: number }; message?: string };
    console.warn(
      "[push-sender] Failed to delete stale subscription",
      endpoint,
      err.response?.status || err.message,
    );
  }
}

async function sendToSubscription(
  sub: SubscriptionRow,
  payload: PushPayload,
): Promise<void> {
  const subscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  } as webpush.PushSubscription;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (e: unknown) {
    const err = e as {
      statusCode?: number;
      response?: { statusCode?: number };
      message?: string;
    };
    const statusCode = err?.statusCode || err?.response?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await deleteSubscription(sub.endpoint);
    } else {
      console.warn(
        "[push-sender] sendNotification error",
        statusCode,
        err?.message || err,
      );
    }
  }
}

function buildPayloadFromMessage(msg: DbMessage): PushPayload {
  // If your backend includes team_name, you can also add it:
  // const team_name = msg.team_name ?? undefined;
  return {
    title: "Neue Nachricht von der Spielleitung",
    body: truncate(msg.message, 180),
    tag: "messages",
    url: "/nachrichten",
  };
}

async function processNewMessages(): Promise<void> {
  const newMsgs = await fetchNewAdminMessages();
  if (!newMsgs.length) return;

  const maxId = Math.max(...newMsgs.map((m) => (m.id ? m.id : 0)));
  const subs = await fetchAllSubscriptions();

  for (const msg of newMsgs) {
    const payload = buildPayloadFromMessage(msg);
    // Optional: if your messages include team_name, filter subs by team_name here
    // const recipients = msg.team_name ? subs.filter(s => s.team_name === msg.team_name) : subs;
    const recipients = subs;

    console.log(
      `[push-sender] Sending notification for message id=${msg.id} to ${recipients.length} subscription(s)`,
    );
    await Promise.allSettled(
      recipients.map((s) => sendToSubscription(s, payload)),
    );
  }

  // Advance the cursor after attempts
  if (maxId > lastMessageId) lastMessageId = maxId;
}

function startPolling(): void {
  console.log("[push-sender] Starting polling loop...");
  // Prime cursor with latest id to avoid spamming on first run
  api
    .get<Pick<DbMessage, "id">[]>("/messages", {
      params: { select: "id", order: "id.desc", limit: 1 },
    })
    .then(({ data }) => {
      lastMessageId =
        Array.isArray(data) &&
        typeof (data[0] as Pick<DbMessage, "id"> | undefined)?.id === "number"
          ? Number((data[0] as Pick<DbMessage, "id">).id)
          : 0;
      console.log(`[push-sender] Initialized lastMessageId=${lastMessageId}`);
    })
    .catch((e: unknown) => {
      // Ignore initialization failure; will proceed with polling regardless
      const err = e as { message?: string };
      console.warn(
        "[push-sender] Failed to initialize lastMessageId:",
        err?.message || err,
      );
    })
    .finally(() => {
      const tick = async () => {
        try {
          await processNewMessages();
        } catch (e: unknown) {
          const err = e as { message?: string };
          console.warn(
            "[push-sender] Polling iteration failed:",
            err?.message || err,
          );
        } finally {
          timer = setTimeout(
            tick,
            POLL_INTERVAL_MS,
          ) as unknown as NodeJS.Timeout;
        }
      };
      timer = setTimeout(tick, POLL_INTERVAL_MS) as unknown as NodeJS.Timeout;
    });
}

let timer: NodeJS.Timeout | null = null;

function shutdown(): void {
  if (timer) clearTimeout(timer);
  console.log("\n[push-sender] Stopped.");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[push-sender] Booting…");
console.log(`[push-sender] API_BASE_URL=${API_BASE_URL}`);
startPolling();
