import { useEffect, useState } from "react";

function PwaBackgroundSync() {
  const [, setNotificationPermission] = useState(false);
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("granted");
        setNotificationPermission(true);
      } else {
        console.log("denied");
        setNotificationPermission(false);
      }
    });
  }, []);

  if ("serviceWorker" in navigator && "sync" in navigator.serviceWorker) {
    return <p>Background sync is supported</p>;
  } else {
    return <p>Background sync is not supported</p>;
  }
}

export default PwaBackgroundSync;
