import { api } from "@/lib/api.ts";

export async function createTeam(
  name: string,
  password: string,
): Promise<void> {
  // API expects: POST /users { name, password }
  await api.post("/users", { name, password });
}
