import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { createTeam } from "@/lib/admin.ts";
import { toast } from "sonner";
import { Check } from "lucide-react";

function generatePassword(len = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // avoid confusing chars
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => alphabet[v % alphabet.length]).join("");
}

function base64UrlEncode(input: string): string {
  const utf8 = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < utf8.length; i++) {
    binary += String.fromCharCode(utf8[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export default function AdminCreateTeamPage() {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{
    name: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const disabled = useMemo(
    () => loading || teamName.trim().length === 0,
    [loading, teamName],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = teamName.trim();
    if (!displayName) return;
    const normalized = displayName.toLowerCase().replace(/\s+/g, "_");
    const password = generatePassword(8);
    setLoading(true);
    try {
      await createTeam(normalized, password, displayName);
      setCreated({ name: normalized, password });
      toast.success("Team erfolgreich angelegt");
    } catch (err) {
      console.error(err);
      toast.error("Team konnte nicht angelegt werden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-start justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team anlegen (Admin)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="team" className="text-sm">
                Team-Name
              </label>
              <Input
                id="team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team-Name"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={disabled}>
              {loading ? "Anlegen…" : "Team anlegen"}
            </Button>
          </form>

          {created &&
            (() => {
              const payload = JSON.stringify({
                n: created.name,
                p: created.password,
              });
              const enc = base64UrlEncode(payload);
              const loginUrl = `https://app.dondrekiel.de/?auto=1&enc=${enc}`;
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(loginUrl)}`;
              return (
                <div className="mt-6 p-3 rounded-md bg-green-50 border border-green-200 space-y-3">
                  <div className="text-sm">Zugangsdaten:</div>
                  <div className="text-sm">
                    <span className="font-semibold">Team:</span> {created.name}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Passwort:</span>{" "}
                    {created.password}
                  </div>
                  <div className="text-xs text-gray-500">
                    Bitte sicher aufbewahren. Das Passwort wird hier nur einmal
                    angezeigt.
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-2">
                      Direkt-Login per QR-Code
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={qrUrl}
                        alt="QR für Direkt-Login"
                        className="w-48 h-48"
                      />
                      <div className="text-xs break-all text-center text-gray-600">
                        {loginUrl}
                      </div>
                      <div className="w-full relative flex flex-col items-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(loginUrl);
                              setCopied(true);
                              // Auto-hide after 1.2s
                              window.setTimeout(() => setCopied(false), 1200);
                            } catch (e) {
                              console.error(e);
                              toast.error("Kopieren fehlgeschlagen");
                            }
                          }}
                          className={`w-full transition-transform ${copied ? "scale-[0.98]" : ""}`}
                        >
                          {copied ? (
                            <span className="inline-flex items-center gap-2">
                              <Check className="w-4 h-4" /> Kopiert!
                            </span>
                          ) : (
                            "Link kopieren"
                          )}
                        </Button>
                        {/* Tiny popup above the button */}
                        <div
                          role="status"
                          aria-live="polite"
                          className={`pointer-events-none absolute -top-7 text-xs px-2 py-1 rounded-md shadow-sm bg-black/80 text-white transition-opacity translate-y-1 ${
                            copied ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          Link in Zwischenablage
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
        </CardContent>
      </Card>
    </div>
  );
}
