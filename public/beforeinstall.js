// beforeinstallprompt-Handler für Android/Chrome + iOS-Hinweis
let deferredPrompt = null;

function showInstallUI() {
  const container = document.getElementById('pwa-install');
  if (container) container.style.display = 'block';
}

function hideInstallUI() {
  const container = document.getElementById('pwa-install');
  if (container) container.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // verhindert automatisches Prompt
  deferredPrompt = e;
  showInstallUI();
});

document.addEventListener('click', async (ev) => {
  const target = ev.target;
  if (!target) return;

  // Klick auf deinen Install-Button (id="pwa-install-btn")
  if (target.id === 'pwa-install-btn') {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('PWA install accepted');
    } else {
      console.log('PWA install dismissed');
    }
    deferredPrompt = null;
    hideInstallUI();
  }
});

// iOS: Anleitung anzeigen (kein beforeinstallprompt)
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
const isInStandaloneMode = () => ('standalone' in window && window.standalone);

document.addEventListener('DOMContentLoaded', () => {
  if (isIos() && !isInStandaloneMode()) {
    // Zeige iOS‑Installhinweis (z. B. element mit id "pwa-install-ios")
    const iosHint = document.getElementById('pwa-install-ios');
    if (iosHint) iosHint.style.display = 'block';
  }
});