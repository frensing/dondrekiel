import { api } from "@/lib/api.ts";

export type Message = {
  id?: number;
  author: string;
  message: string;
  created_at: string; // ISO string
};

export async function fetchMessages(): Promise<Message[]> {
  const { data } = await api.get<Message[]>("/messages");
  // Optionally sort by created_at ascending so the list is chronological
  return [...data].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export async function sendMessage(
  author: string,
  message: string,
): Promise<void> {
  const payload: Message = {
    author,
    message,
    created_at: new Date().toISOString(),
  };
  await api.post("/messages", payload);
}

export async function deleteMessage(id: number): Promise<void> {
  // DELETE /messages?id=eq.<id>
  await api.delete("/messages", { params: { id: `eq.${id}` } });
}
