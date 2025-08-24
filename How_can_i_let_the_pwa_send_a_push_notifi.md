### Goal

Notify all team_user devices via Web Push whenever a dondrekiel_admin sends a new message. Your app already uses
vite-plugin-pwa and runs under HTTPS, which are prerequisites for Push and Service Workers.

### What you need

- Client:
    - Request Notification permission for team_user logins.
    - Subscribe to Web Push with VAPID public key and upload the subscription to your API (PostgREST).
    - A Service Worker that listens to push and displays notifications; on click, open /nachrichten.
- Server:
    - Store subscriptions in Postgres (via PostgREST table and RLS).
    - A small push-sender service (Node + web-push) that reacts to new admin messages and sends notifications to all
      team_user subscriptions.
    - VAPID keys (public exposed to client, private kept server-side).

---

### 1) Generate VAPID keys (server-only)

- Use web-push to generate keys (one-time):
    - webpush.generateVAPIDKeys() → { publicKey, privateKey }
- Keep VAPID_PRIVATE_KEY secret on the server.
- Expose VAPID_PUBLIC_KEY to the client (e.g., VITE_VAPID_PUBLIC_KEY).

### 2) Postgres table for subscriptions (via PostgREST)

Create a table to store browser push subscriptions:

- Table push_subscriptions:
    - id: bigserial primary key
    - team_name: text not null
    - role: text not null
    - endpoint: text not null unique
    - p256dh: text not null
    - auth: text not null
    - created_at: timestamptz default now()
    - last_seen: timestamptz

RLS (sketch):

- team_user/admin may INSERT their own subscription (team_name, role derived from JWT claims or payload checks).
- Users can DELETE their own subscription by endpoint.
- A special service role (JWT used by your push-sender) can SELECT all rows (or via a secured VIEW).

PostgREST endpoints you’ll use:

- POST /push_subscriptions to register
- DELETE /push_subscriptions?endpoint=eq.<urlencoded-endpoint> to unregister
- GET /push_subscriptions (restricted to service role) for sending

### 3) Client: create and upload a subscription after login (team_user)

- On successful login and role === 'team_user', request permission and subscribe:
    - const reg = await navigator.serviceWorker.ready
    - const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(
      VITE_VAPID_PUBLIC_KEY) })
    - Send to API: { team_name, role, endpoint, p256dh, auth }

Helper ideas:

- urlBase64ToUint8Array converts a base64url VAPID key into Uint8Array (standard utility).
- Store endpoint so you can DELETE on logout or when user disables notifications.
- Handle failures gracefully if user denies permission or device doesn’t support Push.

Where to call:

- New hook/component mounted post-auth in App shell:
    - If isAuthenticated && role === 'team_user': ensurePushSubscription(teamName, role)
- On logout: best-effort unsubscribe and DELETE from API.

### 4) Service Worker: push and notification click

Using vite-plugin-pwa, add listeners in your SW:

- push event: showNotification with title/body/tag
- notificationclick: focus an existing client or open /nachrichten

Payload convention (from your server):

- JSON like { title: 'Neue Nachricht von der Spielleitung', body: '<truncated message>', tag: 'messages', url: '
  /nachrichten' }
- SW displays and uses url in click handler.

### 5) Push-sender service (Node + web-push)

Because PostgREST won’t send push by itself, run a tiny service:

- Holds VAPID_PRIVATE_KEY and VAPID_PUBLIC_KEY
- Detects new messages by admins and sends to all team_user subscriptions
- Cleans up stale subscriptions (HTTP 404/410 from push endpoints → DELETE via PostgREST)

Ways to detect new admin messages:

- Recommended: Postgres NOTIFY/LISTEN
    - AFTER INSERT ON messages WHEN NEW.author = 'Spielleitung' OR role = 'dondrekiel_admin'
    - Payload: { id, author, message, created_at }
    - Node process LISTENs the channel; on notify, fetch team_user subscriptions and send push
- Simpler: polling
    - Every 10–30s, GET /messages since last id/time; if new admin messages appear, send push.
    - Higher latency but quick to deploy.

web-push sketch:

- webpush.setVapidDetails('mailto:you@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
- for each sub: await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, JSON.stringify(payload))
- if error status 404/410 → delete subscription

Security:

- Service authenticates to PostgREST with a service role token that can read push_subscriptions and delete stale ones.

### 6) Trigger rule for admin-only

- In your sender, only push if the new message came from an admin.
    - Your UI sends author: 'Spielleitung' for admins; you can use that or check the JWT role stored with the message (
      if available) or a view exposing only admin messages.

### 7) UX, platforms, and dev notes

- iOS supports Web Push only for installed PWAs (iOS 16.4+). Guide iPhone users to “Add to Home Screen”.
- Show a small in-app info/toast when enabling notifications; add a toggle if you want.
- Dev over HTTPS: already set up. For PWA, ensure vite-plugin-pwa has devOptions.enabled = true (your guidelines say it
  is).
- Asset paths: use your existing PWA icons for notification icon/badge if desired.

### 8) Minimal implementation checklist for this repo

- Env:
    - Add VITE_VAPID_PUBLIC_KEY to your .env (client exposed)
    - Store VAPID_PRIVATE_KEY securely for the sender service
- DB/PostgREST:
    - Create push_subscriptions table with RLS
- Client:
    - Add ensurePushSubscription(teamName, role) and call it after login if role === 'team_user'
    - Unsubscribe/delete on logout
    - Extend SW to handle push and notificationclick → navigate to /nachrichten
- Push sender:
    - Node service with web-push
    - Either LISTEN to NOTIFY or poll /messages
    - Send only for admin messages; clean up stale subs

With this setup, each time a dondrekiel_admin posts a new message, your sender broadcasts a Web Push to all team_user
subscriptions. The PWA’s Service Worker shows a notification, and tapping it opens the Nachrichten view.