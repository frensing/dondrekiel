# Dondrekiel

Dondrekiel Frontend und Backend

## Dev-Setup

Zu Beginn in beide Unterverzeichnisse wechseln und mit `npm i` die Abhängigkeiten installieren.

Während der Entwicklung ist es am einfachsten das Backend und Frontend mit ihren eigenen Dev-Servern zu starten.
Dazu ist jeweils in der `package.json` ein Skript `dev` vorgesehen.
Je nach Entwicklungsumgebung kann das sofort von da gestartet werden.
Ansonsten mit `npm run dev`.

## Prod-Setup

Fürs Deployment kann das Frontend aus dem Frontend-Verzeichnis mit `npm run buildForBackend` direkt in das
Backend-Verzeichnis gebaut werden.

Im Backend-Verzeichnis kann der Node dann mit `npm run start` ausgeführt werden.

## Deployment auf Uberspace

- Per SSH auf dem Server anmelden
- In den Code-Ordner wechseln `cd ~/dondrekiel-app`
- Änderungen ziehen `git pull`
- Zum Frontend wechseln `cd ~/dondrekiel-app/frontend`
- Build durchführen `npm run buildForBackend`
- Service neustarten `supervisorctl restart dondrekiel-app`