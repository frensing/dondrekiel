import { api } from "@/lib/api.ts";

export async function createTeam(
  name: string,
  password: string,
  displayname: string,
): Promise<void> {
  // API expects: POST /users { name, password, displayname }
  await api.post("/users", { name, password, displayname });
}
