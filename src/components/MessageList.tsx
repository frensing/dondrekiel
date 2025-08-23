import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useEffect, useRef, useState } from "react";
import { fetchMessages, type Message as ApiMessage } from "@/lib/messages.ts";

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading messages…</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-2 overflow-y-auto p-8">
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
  );
}
