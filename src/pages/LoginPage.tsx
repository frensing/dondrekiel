import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { toast } from "sonner";
import { QrCode } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

function base64UrlDecode(input: string): string {
  try {
    const pad =
      input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atob(b64),
          (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
        )
        .join(""),
    );
  } catch {
    return "";
  }
}

export default function LoginPage() {
  const autoOnce = useRef(false);
  const { login, loading } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const handledScanRef = useRef(false);

  useEffect(() => {
    if (autoOnce.current) return;
    autoOnce.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const auto = params.get("auto");
      const enc = params.get("enc");
      let n: string | null = params.get("name");
      let p: string | null = params.get("password");

      if (auto && enc && !n && !p) {
        // Prefer encoded payload if present
        try {
          const json = base64UrlDecode(enc);
          const obj = JSON.parse(json) as {
            n?: string;
            p?: string;
            name?: string;
            password?: string;
          };
          n = obj.n ?? obj.name ?? null;
          p = obj.p ?? obj.password ?? null;
        } catch {
          // ignore decode errors and fall back to plaintext params
        }
      }

      if (auto && n && p) {
        // also reflect values in inputs for transparency
        setName(n.toLowerCase());
        setPassword(p);
        // trigger login
        login(n, p)
          .then(() => {
            toast.success("Automatisch angemeldet");
          })
          .catch((err) => {
            console.error(err);
            toast.error("Auto-Login fehlgeschlagen");
          });
      }
    } catch {
      // ignore URL parse errors
    }
  }, [login]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(name, password);
      toast.success("Erfolgreich angemeldet");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Login fehlgeschlagen. Bitte Zugangsdaten prüfen.");
    }
  };

  const handleScanText = async (text: string) => {
    if (handledScanRef.current) return;
    handledScanRef.current = true; // debounce multiple decodes
    try {
      let n: string | undefined;
      let p: string | undefined;

      // Try URL first
      try {
        const url = new URL(text);
        const auto = url.searchParams.get("auto");
        const enc = url.searchParams.get("enc");
        if (auto) {
          if (enc) {
            const json = base64UrlDecode(enc);
            try {
              const obj = JSON.parse(json) as {
                n?: string;
                p?: string;
                name?: string;
                password?: string;
              };
              n = obj.n ?? obj.name ?? undefined;
              p = obj.p ?? obj.password ?? undefined;
            } catch {
              // ignore
            }
          } else {
            n = url.searchParams.get("name") ?? undefined;
            p = url.searchParams.get("password") ?? undefined;
          }
        }
      } catch {
        // Not a URL; try query string
        if (text.includes("=") && text.includes("&")) {
          const params = new URLSearchParams(text);
          const auto = params.get("auto");
          if (auto) {
            const enc = params.get("enc");
            if (enc) {
              const json = base64UrlDecode(enc);
              try {
                const obj = JSON.parse(json) as {
                  n?: string;
                  p?: string;
                  name?: string;
                  password?: string;
                };
                n = obj.n ?? obj.name ?? undefined;
                p = obj.p ?? obj.password ?? undefined;
              } catch {
                /* ignore invalid JSON in enc */
              }
            } else {
              n = params.get("name") ?? undefined;
              p = params.get("password") ?? undefined;
            }
          }
        } else if (text.trim().startsWith("{")) {
          // Raw JSON payload
          try {
            const obj = JSON.parse(text) as {
              n?: string;
              p?: string;
              name?: string;
              password?: string;
            };
            n = obj.n ?? obj.name ?? undefined;
            p = obj.p ?? obj.password ?? undefined;
          } catch {
            /* ignore invalid raw JSON */
          }
        }
      }

      if (n && p) {
        setName(n.toLowerCase());
        setPassword(p);
        await login(n, p);
        toast.success("Per QR angemeldet");
        setScanning(false);
      } else {
        toast.error("QR-Code konnte nicht gelesen werden");
        handledScanRef.current = false; // allow retry
      }
    } catch (e) {
      console.error(e);
      toast.error("QR-Login fehlgeschlagen");
      handledScanRef.current = false;
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Anmeldung</CardTitle>
          <CardDescription>
            Bitte melde dich mit deinem Teamnamen und Passwort an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm" htmlFor="name">
                Teamname
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="password">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Anmelden…" : "Anmelden"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  handledScanRef.current = false;
                  setScanning(true);
                }}
                title="Login-QR-Code scannen"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR scannen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {scanning && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">QR-Code scannen</div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setScanning(false)}
                className="h-8 px-2"
              >
                Schließen
              </Button>
            </div>
            <div className="p-3">
              <div className="rounded-lg overflow-hidden">
                <Scanner
                  onScan={(detected) => {
                    const text =
                      Array.isArray(detected) && detected.length > 0
                        ? detected[0].rawValue
                        : undefined;
                    if (!text) return;
                    void handleScanText(text);
                  }}
                  onError={(error) => {
                    console.error(error);
                    toast.error("Kamera-Zugriff fehlgeschlagen");
                  }}
                  constraints={{ facingMode: "environment" }}
                  scanDelay={300}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Hinweis: Für das Scannen ist Kamerazugriff erforderlich.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
