// Minimaler Demo-Server. npm i express body-parser web-push
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());

/*
  Erzeuge VAPID-Keys lokal:
  npx web-push generate-vapid-keys --json
  Setze VAPID_PUBLIC_KEY und VAPID_PRIVATE_KEY als ENV oder trage hier ein.
*/
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BMpBbxqvXW5TciqzQL0T6QYHQMr1ZkU3dKLXHbaLUY5R7KxXUzlTCzxnO3ouTfKHg9cp_ssxlKFzdDEBkPHkirU';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '8oGacujAXlWltxOqv6eDOnGM3fGxxtBMVRpHW5pMiuQ';

webpush.setVapidDetails(
  'mailto:info@dondrekiel.de',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Für Demo: In-Memory Liste (ersetzte durch DB)
const subscriptions = new Map();

app.post('/api/subscribe', (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  subscriptions.set(sub.endpoint, sub);
  res.status(201).json({ success: true });
  console.log('Subscription added:', sub.endpoint);
});

app.post('/api/notify', async (req, res) => {
  const payload = JSON.stringify(req.body || { title: 'Neue Nachricht', body: 'Sie haben eine neue Nachricht', url: '/' });
  const results = [];
  for (const sub of subscriptions.values()) {
    try {
      await webpush.sendNotification(sub, payload);
      results.push({ endpoint: sub.endpoint, ok: true });
    } catch (err) {
      results.push({ endpoint: sub.endpoint, ok: false, error: err.message });
      // optional: entferne ungültige Subscriptions
      if (err.statusCode === 410 || err.statusCode === 404) subscriptions.delete(sub.endpoint);
    }
  }
  res.json({ results });
});

app.listen(3000, () => console.log('Push server running on http://localhost:3000'));