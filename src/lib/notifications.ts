export async function ensurePermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const p = await Notification.requestPermission();
  return p === "granted";
}

export async function notify(title: string, options?: NotificationOptions) {
  if (!(await ensurePermission())) return;
  const reg = await navigator.serviceWorker.ready;
  if ("showNotification" in reg) {
    return reg.showNotification(title, options); // Android
  }
  return new Notification(title, options); // Fallback Desktop
}