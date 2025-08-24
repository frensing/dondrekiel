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

function generatePassword(len = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // avoid confusing chars
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => alphabet[v % alphabet.length]).join("");
}

export default function AdminCreateTeamPage() {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{
    name: string;
    password: string;
  } | null>(null);

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

          {created && (
            <div className="mt-6 p-3 rounded-md bg-green-50 border border-green-200">
              <div className="text-sm mb-2">Zugangsdaten:</div>
              <div className="text-sm">
                <span className="font-semibold">Team:</span> {created.name}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Passwort:</span>{" "}
                {created.password}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Bitte sicher aufbewahren. Das Passwort wird hier nur einmal
                angezeigt.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
