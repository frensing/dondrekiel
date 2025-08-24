import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useEffect, useRef, useState } from "react";
import {
  deleteMessage,
  fetchMessages,
  type Message as ApiMessage,
  sendMessage,
} from "@/lib/messages.ts";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Send, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext.tsx";
import { toast } from "sonner";
import { useMessageReadState } from "@/lib/unread.ts";

function formatLocal24hTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function MessageList() {
  const { isAdmin } = useAuth();
  const { setLastReadNow } = useMessageReadState();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  async function reloadMessages() {
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch {
      // keep old list, optionally show toast
      toast.error("Nachrichten konnten nicht aktualisiert werden");
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchMessages();
        if (mounted) setMessages(data);
      } catch {
        if (mounted) setError("Failed to load messages");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Mark messages as read when viewing this page and when messages change
  useEffect(() => {
    if (!loading && !error) {
      setLastReadNow();
    }
  }, [loading, error, messages.length, setLastReadNow]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const doSend = async () => {
    const text = newMsg.trim();
    if (!text) return;
    const ok = window.confirm(`Nachricht senden?\n\n${text}`);
    if (!ok) return;
    setSending(true);
    try {
      // The API expects an author; for admins we use "Spielleitung"
      await sendMessage("Spielleitung", text);
      setNewMsg("");
      toast.success("Nachricht gesendet");
      await reloadMessages();
      // ensure scroll to bottom after refresh
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch (e) {
      console.error(e);
      toast.error("Nachricht konnte nicht gesendet werden");
    } finally {
      setSending(false);
    }
  };

  const doDelete = async (m: ApiMessage) => {
    if (!isAdmin) return;
    if (m.id == null) return;
    const ok = window.confirm(
      `Diese Nachricht wirklich löschen?\n\nVon: ${m.author}\nUm: ${formatLocal24hTime(m.created_at)}\n\n${m.message}`,
    );
    if (!ok) return;
    try {
      await deleteMessage(m.id);
      toast.success("Nachricht gelöscht");
      await reloadMessages();
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch (e) {
      console.error(e);
      toast.error("Nachricht konnte nicht gelöscht werden");
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading messages…</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="space-y-2 overflow-y-auto p-8 pb-32 flex-1">
        {messages.map((message) => (
          <div
            key={message.id ?? `${message.author}-${message.created_at}`}
            className="flex justify-start"
          >
            <Card className="md:max-w-md w-full gap-0 rounded-2xl p-2 bg-gray-100 text-gray-900">
              <CardHeader className="p-2 pb-0 text-left">
                <CardTitle className="text-sm font-bold text-left">
                  {message.author}
                </CardTitle>
                {isAdmin && message.id != null && (
                  <CardAction>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Nachricht löschen"
                      onClick={() => void doDelete(message)}
                      className="h-7 w-7 text-gray-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent className="p-2 pt-0 flex flex-col">
                <p className="text-sm whitespace-pre-wrap text-left">
                  {message.message}
                </p>
                <div className="flex justify-end mt-0">
                  <span className="text-xs opacity-70">
                    {formatLocal24hTime(message.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isAdmin && (
        <div className="sticky bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-background/80 border-t">
          <div className="flex items-center gap-2">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Nachricht an alle…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void doSend();
                }
              }}
            />
            <Button
              onClick={doSend}
              disabled={sending || !newMsg.trim()}
              aria-label="Senden"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Senden</span>
            </Button>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Enter: Senden</div>
        </div>
      )}
    </div>
  );
}
