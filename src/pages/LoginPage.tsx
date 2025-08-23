import { FormEvent, useState } from "react";
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

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

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
