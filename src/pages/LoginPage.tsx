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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Anmelden…" : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
