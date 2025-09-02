import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("\nVAPID keys generated:");
console.log("VAPID_PUBLIC_KEY=", keys.publicKey);
console.log("VAPID_PRIVATE_KEY=", keys.privateKey);
console.log(
  "\nAdd these to your server/.env file (never commit the private key).",
);
