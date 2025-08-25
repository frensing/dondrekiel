// Einfacher Subscriber: aufrufen nach SW-Registrierung.
// Ersetze PUBLIC_VAPID_KEY mit deinem base64-url VAPID Public Key (Server generiert).
const VAPID_PUBLIC_KEY = 'BMpBbxqvXW5TciqzQL0T6QYHQMr1ZkU3dKLXHbaLUY5R7KxXUzlTCzxnO3ouTfKHg9cp_ssxlKFzdDEBkPHkirU';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function subscribeForPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push not supported');
    return;
  }

  const reg = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Push permission denied');
    return;
  }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  // Sende Subscription an deinen Server (z. B. /api/subscribe)
  await fetch('https://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });

  console.log('Push subscription successful');
}

// Aufruf: z.B. beim App-Start oder über UI-Button
document.addEventListener('DOMContentLoaded', () => {
  // optional: Button oder automatische Subscription
  subscribeForPush();
  window.subscribeForPush = subscribeForPush; // zum manuellen Aufruf aus Konsole oder UI
});