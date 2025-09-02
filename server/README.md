Dondrekiel Push Sender (server)
================================

This is a minimal Node.js service that sends Web Push notifications for new admin messages.
It integrates with your existing PostgREST API and the PWA client already present in this repo.

Features

- Polls the PostgREST /messages endpoint for new messages by the admin (author = "Spielleitung").
- Fetches all rows from web_push_subscriptions and broadcasts a push notification.
- Uses VAPID for Web Push. The private key stays here on the server.
- Cleans up stale subscriptions (deletes rows when push returns 404/410).

Requirements

- Node.js 20 or newer.
- PostgREST configured per the instructions you implemented previously:
    - Table public.web_push_subscriptions with RLS
    - Service role (JWT claim role = dondrekiel_service) that can SELECT and DELETE on web_push_subscriptions
    - Messages available under /messages with fields at least: id, author, message, created_at

Install

1. Go to the server directory and install dependencies:
    - npm ci  (or npm i)

2. Copy .env.example to .env and fill values:
    - API_BASE_URL=https://app.dondrekiel.de/api
    - SERVICE_JWT=<JWT for role dondrekiel_service>
    - MAILTO=mailto:you@example.com
    - VAPID_PUBLIC_KEY=<generated public key>
    - VAPID_PRIVATE_KEY=<generated private key>
    - POLL_INTERVAL_MS=15000

3. Generate VAPID keys (one-time):
    - npm run generate:vapid
    - Copy the printed keys into .env (keep VAPID_PRIVATE_KEY secret)
    - Expose VAPID_PUBLIC_KEY to the client as VITE_VAPID_PUBLIC_KEY in your app’s environment (already used by
      src/lib/push.ts)

Run

- Development (watch mode):
    - npm run dev

- Build:
    - npm run build

- Production:
    - npm start  (after build)

Environment variables (.env)

- API_BASE_URL: PostgREST base URL (default: https://app.dondrekiel.de/api)
- SERVICE_JWT: JWT token with role claim dondrekiel_service (can SELECT and DELETE on web_push_subscriptions)
- MAILTO: Contact email used in VAPID metadata (e.g., mailto:you@example.com)
- VAPID_PUBLIC_KEY: VAPID public key (base64url)
- VAPID_PRIVATE_KEY: VAPID private key (base64url) — keep secret
- POLL_INTERVAL_MS: Polling interval in ms (default 15000)
- POLL_LIMIT: Optional cap per poll for messages (default 100)

How it works

- On start, the service queries the latest message id to initialize a cursor and avoid spamming old notifications.
- Every POLL_INTERVAL_MS, it fetches new messages where author = 'Spielleitung'.
- For each new message, it:
    - Builds a payload { title, body, tag: 'messages', url: '/nachrichten' }
    - GETs all /web_push_subscriptions (service role JWT required)
    - Sends a Web Push to each subscription
    - Deletes subscriptions that respond 404/410 (stale endpoints)

Team scoping (optional)

- If your messages table includes team_name, you can filter recipients by team_name easily. In src/index.ts find:
  // const recipients = msg.team_name ? subs.filter(s => s.team_name === msg.team_name) : subs;
  and uncomment it accordingly.

Security notes

- Do NOT commit your .env or VAPID private key to VCS.
- Use a dedicated service JWT (role dondrekiel_service). Keep it secret on the server.
- If you ever rotate the SERVICE_JWT or VAPID keys, restart the service.

Troubleshooting

- If you get 401/403 on PostgREST calls, verify SERVICE_JWT and RLS grants.
- If no notifications arrive, ensure client devices:
    - Granted Notification permission, created a PushSubscription, and uploaded it via the app (EnablePushButton).
    - Are running the PWA with an active Service Worker (vite-plugin-pwa is already configured).
- Use browser devtools Application → Service Workers and Push to test.

Deploying

- You can run this service on any Node-capable host (systemd, Docker, PM2). Example systemd service:

  [Unit]
  Description=Dondrekiel Push Sender
  After=network.target

  [Service]
  WorkingDirectory=/path/to/repo/server
  Environment=NODE_ENV=production
  ExecStart=/usr/bin/node dist/index.js
  Restart=always

  [Install]
  WantedBy=multi-user.target

License

- MIT (inherits repo license).
