import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

const messages = [
  {
    sender: "Spielleitung",
    time: "19:27",
    text: "Hi, dies ist ein Test für eine längere Nachricht. Die Stationen laufen gut, weiter so.",
  },
  {
    sender: "Spielleitung",
    time: "20:27",
    text: "Hi, dies ist ein Test für eine längere Nachricht. Die Stationen laufen gut, weiter so. Noch etwas mehr.",
  },
  {
    sender: "Spielleitung",
    time: "21:27",
    text: "Kurzer Text",
  },
  {
    sender: "Spielleitung",
    time: "20:27",
    text: "Hi, dies ist ein Test für eine längere Nachricht. Die Stationen laufen gut, weiter so. Noch etwas mehr.",
  },
  {
    sender: "Spielleitung",
    time: "21:27",
    text: "Kurzer Text",
  },
  {
    sender: "Spielleitung",
    time: "20:27",
    text: "Hi, dies ist ein Test für eine längere Nachricht. Die Stationen laufen gut, weiter so. Noch etwas mehr.",
  },
  {
    sender: "Spielleitung",
    time: "21:27",
    text: "Kurzer Text",
  },
  {
    sender: "Spielleitung",
    time: "20:27",
    text: "Hi, dies ist ein Test für eine längere Nachricht. Die Stationen laufen gut, weiter so. Noch etwas mehr.",
  },
  {
    sender: "Spielleitung",
    time: "21:27",
    text: "Kurzer Text",
  },
];

export default function MessageList() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="space-y-2 overflow-y-auto">
      {messages.map((message, index) => (
        <div key={index} className="flex justify-start">
          <Card className="md:max-w-md w-full gap-0 rounded-2xl p-2 bg-gray-100 text-gray-900">
            <CardHeader className="p-2 pb-0 text-left">
              <CardTitle className="text-sm font-bold text-left">
                Spielleitung
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 flex flex-col">
              <p className="text-sm whitespace-pre-wrap text-left">
                {message.text}
              </p>
              <div className="flex justify-end mt-0">
                <span className="text-xs opacity-70">{message.time}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
